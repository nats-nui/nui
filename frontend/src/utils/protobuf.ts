import { Root, Type } from "protobufjs"
import { ProtoSchema, ProtobufDecodedData } from "@/types/Protobuf"

export function parseProtoSchema(schemaContent: string, schemaName: string): ProtoSchema {
  const schema: ProtoSchema = {
    name: schemaName,
    content: schemaContent,
    root: null,
    lastModified: new Date(),
  }

  try {
    const root = Root.fromJSON(JSON.parse(schemaContent))
    schema.root = root
  } catch (error) {
    try {
      const root = new Root()
      root.load(schemaContent, { keepCase: true })
      schema.root = root
    } catch (parseError) {
      schema.error = `Failed to parse schema: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`
    }
  }

  return schema
}

export function decodeProtobufMessage(
  payloadBase64: string, 
  schema: ProtoSchema, 
  messageTypeName: string
): ProtobufDecodedData {
  if (!schema.root) {
    return {
      success: false,
      error: "Schema not loaded or invalid"
    }
  }

  try {
    const messageType = schema.root.lookupType(messageTypeName)
    const buffer = Buffer.from(payloadBase64, 'base64')
    const decoded = messageType.decode(buffer)
    const object = messageType.toObject(decoded, {
      longs: String,
      enums: String,
      bytes: String,
    })

    return {
      success: true,
      data: object,
      schemaUsed: schema.name,
      messageType: messageTypeName
    }
  } catch (error) {
    return {
      success: false,
      error: `Failed to decode: ${error instanceof Error ? error.message : 'Unknown error'}`,
      schemaUsed: schema.name,
      messageType: messageTypeName
    }
  }
}

export function getMessageTypes(schema: ProtoSchema): string[] {
  if (!schema.root) return []
  
  const types: string[] = []
  
  function collectTypes(namespace: any, prefix = '') {
    if (!namespace || typeof namespace !== 'object' || !namespace.nested) return
    
    for (const [name, nested] of Object.entries(namespace.nested)) {
      const fullName = prefix ? `${prefix}.${name}` : name
      if (nested instanceof Type) {
        types.push(fullName)
      }
      if (nested && typeof nested === 'object' && 'nested' in nested) {
        collectTypes(nested, fullName)
      }
    }
  }
  
  collectTypes(schema.root)
  return types
}

export function autoDetectMessageType(
  payloadBase64: string, 
  schema: ProtoSchema
): string | null {
  const messageTypes = getMessageTypes(schema)
  
  for (const messageType of messageTypes) {
    const result = decodeProtobufMessage(payloadBase64, schema, messageType)
    if (result.success) {
      return messageType
    }
  }
  
  return null
}