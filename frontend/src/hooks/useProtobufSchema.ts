import { useState, useEffect, useMemo, useCallback } from "react"
import { ProtoSchema, ProtobufDecodedData } from "@/types/Protobuf"
import { 
  decodeProtobufMessage, 
  getMessageTypesFromSchema,
  createUnifiedProtoRoot
} from "@/utils/protobuf"
import protoApi from "@/api/proto"
import { schemaDiscovery } from "@/services/ProtoSchemaDiscovery"

interface UseProtobufSchemaState {
  schemas: ProtoSchema[]
  selectedSchemaId: string
  selectedMessageType: string
  decodedData: ProtobufDecodedData | null
  isLoadingSchemas: boolean
  isAutoDetecting: boolean
  showSchemaControls: boolean
}

interface UseProtobufSchemaReturn extends UseProtobufSchemaState {
  availableMessageTypes: string[]
  selectedSchema: ProtoSchema | undefined
  setSelectedSchemaId: (id: string) => void
  setSelectedMessageType: (type: string) => void
  setShowSchemaControls: (show: boolean) => void
  refreshSchemas: () => Promise<void>
  autoDetectMessageType: () => Promise<void>
  resetSelection: () => void
}

export function useProtobufSchema(binaryData?: string): UseProtobufSchemaReturn {
  const [schemas, setSchemas] = useState<ProtoSchema[]>([])
  const [selectedSchemaId, setSelectedSchemaId] = useState<string>("")
  const [selectedMessageType, setSelectedMessageType] = useState<string>("")
  const [decodedData, setDecodedData] = useState<ProtobufDecodedData | null>(null)
  const [isLoadingSchemas, setIsLoadingSchemas] = useState(false)
  const [isAutoDetecting, setIsAutoDetecting] = useState(false)
  const [showSchemaControls, setShowSchemaControls] = useState(false)

  const selectedSchema = useMemo(
    () => schemas.find(s => s.id === selectedSchemaId || s.name === selectedSchemaId),
    [schemas, selectedSchemaId]
  )

  const availableMessageTypes = useMemo(
    () => selectedSchema ? getMessageTypesFromSchema(selectedSchema) : [],
    [selectedSchema]
  )

  const loadSchemas = useCallback(async () => {
    setIsLoadingSchemas(true)
    try {
      schemaDiscovery.clearCache()
      const backendSchemas = await protoApi.index()
      
      const unifiedRoot = createUnifiedProtoRoot(backendSchemas)
      
      const parsedSchemas = backendSchemas.map(schema => {
        try {
          return {
            ...schema,
            root: unifiedRoot,
            error: undefined
          }
        } catch (error) {
          return {
            ...schema,
            root: null,
            error: `Failed to parse: ${error instanceof Error ? error.message : 'Unknown error'}`
          }
        }
      })

      setSchemas(parsedSchemas)
      
      // Auto-select first schema if available
      if (parsedSchemas.length > 0 && !binaryData) {
        const firstSchema = parsedSchemas[0]
        setSelectedSchemaId(firstSchema.id || firstSchema.name)
        
        if (!firstSchema.error) {
          const messageTypes = getMessageTypesFromSchema(firstSchema)
          if (messageTypes.length > 0) {
            setSelectedMessageType(messageTypes[0])
          }
        }
      }
    } catch (error) {
      console.error('Failed to load schemas:', error)
    } finally {
      setIsLoadingSchemas(false)
    }
  }, [binaryData])

  const autoDetectMessageType = useCallback(async () => {
    if (!binaryData) return
    
    setIsAutoDetecting(true)
    try {
      // Trigger analysis and find best match
      await schemaDiscovery.discoverMessageTypes()
      const matchingMessages = await schemaDiscovery.findMatchingMessageTypes(binaryData)
      
      if (matchingMessages.length > 0) {
        const firstMatch = matchingMessages[0]
        setSelectedSchemaId(firstMatch.schemaId)
        setSelectedMessageType(firstMatch.messageType)
      }
    } catch (error) {
      console.error('Auto-detection failed:', error)
    } finally {
      setIsAutoDetecting(false)
    }
  }, [binaryData])

  const resetSelection = useCallback(() => {
    setSelectedSchemaId("")
    setSelectedMessageType("")
    setShowSchemaControls(false)
    setDecodedData(null)
  }, [])

  // Load schemas on mount
  useEffect(() => {
    loadSchemas()
  }, [])

  // Handle binary data changes
  useEffect(() => {
    resetSelection()
    
    // Auto-detect when binary data is provided
    if (binaryData && schemas.length > 0) {
      autoDetectMessageType()
    }
  }, [binaryData, schemas.length])

  // Decode when selection changes
  useEffect(() => {
    if (!binaryData || !selectedSchema || !selectedMessageType) {
      setDecodedData(null)
      return
    }

    const result = decodeProtobufMessage(binaryData, selectedSchema, selectedMessageType)
    setDecodedData(result)
  }, [binaryData, selectedSchema, selectedMessageType])

  return {
    // State
    schemas,
    selectedSchemaId,
    selectedMessageType,
    decodedData,
    isLoadingSchemas,
    isAutoDetecting,
    showSchemaControls,
    
    // Computed
    availableMessageTypes,
    selectedSchema,
    
    // Actions
    setSelectedSchemaId,
    setSelectedMessageType,
    setShowSchemaControls,
    refreshSchemas: loadSchemas,
    autoDetectMessageType,
    resetSelection,
  }
}