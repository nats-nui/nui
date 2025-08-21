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

/**
 * Creates a unified protobuf root with all schemas loaded for import resolution
 * @param schemas Array of all available proto schemas
 * @returns Root with all schemas loaded and imports resolved
 */
export function createUnifiedProtoRoot(schemas: ProtoSchema[]): Root {
  const root = new Root()
  
  // Create a virtual file system for import resolution
  const fileMap = new Map<string, string>()
  
  schemas.forEach(schema => {
    // Schema.name now contains the full path (e.g., "opentelemetry/proto/common/v1/common.proto")
    // This directly matches import paths!
    fileMap.set(schema.name, schema.content)
    
    // Also map without .proto extension for flexibility
    const withoutExt = schema.name.replace(/\.proto$/, '')
    fileMap.set(withoutExt, schema.content)
  })
  
  // Set up custom fetch function for imports
  root.fetch = (filename, callback) => {
    if (fileMap.has(filename)) {
      callback(null, fileMap.get(filename)!)
    } else {
      callback(new Error(`Import not found: ${filename}`), null)
    }
  }
  
  // Load all schemas into the root
  try {
    schemas.forEach(schema => {
      if (!schema.content.trim().startsWith('{')) {
        try {
          const parsed = parse(schema.content, { keepCase: true })
          if (parsed.root && parsed.root.nested) {
            // Merge the parsed content into our unified root
            Object.keys(parsed.root.nested).forEach(key => {
              if (parsed.root.nested[key]) {
                root.add(parsed.root.nested[key])
              }
            })
          }
        } catch (parseError) {
          console.warn(`Failed to parse schema ${schema.name}:`, parseError)
        }
      }
    })
    
    // Resolve all references after loading all files
    try {
      root.resolveAll()
    } catch (resolveError) {
      // Schemas may have missing dependencies - log but don't fail
      console.warn('Protobuf types could not be resolved:', resolveError)
    }
  } catch (error) {
    console.error('Failed to create unified root:', error)
  }
  
  return root
}

/**
 * Parses multiple proto schemas with import resolution
 * @param schemas Array of all available proto schemas
 * @param targetSchemaName Name of the main schema to parse
 * @returns Parsed schema with resolved imports
 */
export function parseProtoSchemaWithImports(schemas: ProtoSchema[], targetSchemaName: string): ProtoSchema {
  const targetSchema = schemas.find(s => s.name === targetSchemaName)
  if (!targetSchema) {
    return {
      name: targetSchemaName,
      content: '',
      root: null,
      error: 'Schema not found'
    }
  }
  
  const unifiedRoot = createUnifiedProtoRoot(schemas)
  
  return {
    name: targetSchemaName,
    content: targetSchema.content,
    root: unifiedRoot,
  }
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

    const objectJsonString = JSON.stringify(object, null, 2)
    return {
      success: true,
      data: object,
      dataJson: objectJsonString,
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