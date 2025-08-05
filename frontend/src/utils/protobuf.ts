import { Root, Type, parse } from "protobufjs"
import { ProtoSchema, ProtobufDecodedData } from "@/types/Protobuf"

export function parseProtoSchema(schemaContent: string, schemaName: string): ProtoSchema {
  const schema: ProtoSchema = {
    name: schemaName,
    content: schemaContent,
    root: null,
  }

  try {
    // First try to parse as JSON (pre-compiled schema)
    if (schemaContent.trim().startsWith('{')) {
      const root = Root.fromJSON(JSON.parse(schemaContent))
      schema.root = root
      return schema
    }

    // Parse as .proto file content
    const parsed = parse(schemaContent, { keepCase: true })
    if (parsed.root) {
      schema.root = parsed.root
    } else {
      schema.error = "No root found in parsed schema"
    }
  } catch (error) {
    schema.error = `Failed to parse schema: ${error instanceof Error ? error.message : 'Unknown error'}`
  }

  return schema
}

export function decodeProtobufMessage(
  payload: string, 
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
    if (!messageType) {
      return {
        success: false,
        error: `Message type '${messageTypeName}' not found in schema`,
        schemaUsed: schema.name,
        messageType: messageTypeName
      }
    }

    // Convert payload to Uint8Array
    let bytes: Uint8Array

    // The payload from NATS UI is already a binary string (result of atob())
    // Convert binary string directly to Uint8Array
    bytes = new Uint8Array(payload.length)
    for (let i = 0; i < payload.length; i++) {
      bytes[i] = payload.charCodeAt(i) & 0xFF
    }

    // Validate that we have some data
    if (bytes.length === 0) {
      return {
        success: false,
        error: "Empty payload - no data to decode",
        schemaUsed: schema.name,
        messageType: messageTypeName
      }
    }

    // Try to decode with better error context
    let decoded
    try {
      decoded = messageType.decode(bytes)
    } catch (decodeError) {
      // Try partial decode to see how much we can read
      let validBytes = 0
      try {
        for (let i = 1; i <= bytes.length; i++) {
          messageType.decode(bytes.subarray(0, i))
          validBytes = i
        }
      } catch (e) {
        // validBytes now contains the last successful decode length
      }

      return {
        success: false,
        error: `Decode error: ${decodeError instanceof Error ? decodeError.message : 'Unknown decode error'}. Payload: ${bytes.length} bytes, valid up to: ${validBytes} bytes`,
        schemaUsed: schema.name,
        messageType: messageTypeName
      }
    }

    const object = messageType.toObject(decoded, {
      longs: String,
      enums: String,
      bytes: String,
      arrays: true,
      objects: true,
      oneofs: true
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