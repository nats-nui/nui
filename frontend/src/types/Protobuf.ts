import { Root } from "protobufjs"

export interface ProtoSchema {
  id?: string
  name: string
  content: string
  description?: string
  // Client-side only fields
  root?: Root | null
  error?: string
}

export interface ProtobufDecodedData {
  success: boolean
  /** Fields actually present in the decoded message, excluding container defaults. */
  recognizedFieldCount?: number
  data?: any
  dataJson?: string
  error?: string
  schemaUsed?: string
  messageType?: string
}
