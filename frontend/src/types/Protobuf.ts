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
  data?: any
  error?: string
  schemaUsed?: string
  messageType?: string
}