import { Root } from "protobufjs"

export interface ProtoSchema {
  name: string
  content: string
  root: Root | null
  lastModified: Date
  error?: string
}

export interface ProtobufDecodedData {
  success: boolean
  data?: any
  error?: string
  schemaUsed?: string
  messageType?: string
}