import { useState, useEffect, useMemo, useCallback } from "react"
import { ProtoSchema, ProtobufDecodedData } from "@/types/Protobuf"
import { 
  decodeProtobufMessage, 
  getMessageTypesFromSchema
} from "@/utils/protobuf"
import { ProtobufTopicCache } from "@/utils/protobuf/ProtobufTopicCache"
import { useProtobufSchemas } from "@/contexts/ProtobufSchemaContext"

const CACHE_CONFIDENCE_THRESHOLD = 0.5


interface UseProtobufSchemaReturn {
  schemas: ProtoSchema[]
  selectedSchemaId: string
  selectedMessageType: string
  decodedData: ProtobufDecodedData | null
  isLoadingSchemas: boolean
  isAutoDetecting: boolean
  showSchemaControls: boolean
  availableMessageTypes: string[]
  selectedSchema: ProtoSchema | undefined
  setSelectedSchemaId: (id: string) => void
  setSelectedMessageType: (type: string) => void
  setShowSchemaControls: (show: boolean) => void
  autoDetectMessageType: () => Promise<void>
  resetSelection: () => void
  cacheStats?: { nodes: number, terminals: number, patterns: number }
}

let topicCache: ProtobufTopicCache | null = null

function getTopicCache(): ProtobufTopicCache {
  if (!topicCache) {
    topicCache = new ProtobufTopicCache()
  }
  return topicCache
}

export function useProtobufSchema(binaryData?: string, subject?: string): UseProtobufSchemaReturn {
  const { schemas, isLoading: isLoadingSchemas } = useProtobufSchemas()
  
  const [selectedSchemaId, setSelectedSchemaId] = useState<string>("")
  const [selectedMessageType, setSelectedMessageType] = useState<string>("")
  const [decodedData, setDecodedData] = useState<ProtobufDecodedData | null>(null)
  const [isAutoDetecting, setIsAutoDetecting] = useState(false)
  const [showSchemaControls, setShowSchemaControls] = useState(false)
  const [isFromCache, setIsFromCache] = useState(false)

  const selectedSchema = useMemo(
    () => schemas.find(s => s.id === selectedSchemaId || s.name === selectedSchemaId),
    [schemas, selectedSchemaId]
  )

  const availableMessageTypes = useMemo(
    () => selectedSchema ? getMessageTypesFromSchema(selectedSchema) : [],
    [selectedSchema]
  )

  useEffect(() => {
    if (schemas.length > 0 && !binaryData && !selectedSchemaId) {
      const firstSchema = schemas[0]
      setSelectedSchemaId(firstSchema.id || firstSchema.name)
      
      if (!firstSchema.error) {
        const messageTypes = getMessageTypesFromSchema(firstSchema)
        if (messageTypes.length > 0) {
          setSelectedMessageType(messageTypes[0])
        }
      }
    }
  }, [schemas, binaryData, selectedSchemaId])

  const autoDetectMessageType = useCallback(async () => {
    if (!binaryData || schemas.length === 0) return
    
    setIsAutoDetecting(true)
    try {
      const { decodeProtobufMessage, getAllMessageTypes } = await import('@/utils/protobuf')
      
      const MAX_QUICK_SCHEMAS = 3
      const schemasToTest = schemas.slice(0, MAX_QUICK_SCHEMAS)
      
      let bestMatch: {schemaId: string, messageType: string, score: number} | null = null
      
      for (const schema of schemasToTest) {
        if (schema.error || !schema.root) continue
        
        try {
          const messageTypes = getAllMessageTypes(schema)
          for (const messageType of messageTypes) {
            try {
              const result = decodeProtobufMessage(binaryData, schema, messageType)
              if (result.success && result.data) {
                const dataStr = JSON.stringify(result.data)
                const fieldCount = (dataStr.match(/":"/g) || []).length + (dataStr.match(/":\d/g) || []).length
                const dataSize = dataStr.length
                
                // Scoring: more fields and larger data = better match
                const score = 50 + Math.min(30, fieldCount * 2) + Math.min(20, dataSize / 50)
                
                if (!bestMatch || score > bestMatch.score) {
                  bestMatch = {
                    schemaId: schema.id || schema.name,
                    messageType,
                    score
                  }
                }
                
                if (score > 90) break
              }
            } catch {
            }
          }
          
          if (bestMatch && bestMatch.score > 90) break
        } catch {
        }
      }
      
      if (bestMatch) {
        setSelectedSchemaId(bestMatch.schemaId)
        setSelectedMessageType(bestMatch.messageType)
      }
    } catch (error) {
    } finally {
      setIsAutoDetecting(false)
    }
  }, [binaryData, schemas])

  const resetSelection = useCallback(() => {
    setSelectedSchemaId("")
    setSelectedMessageType("")
    setShowSchemaControls(false)
    setDecodedData(null)
  }, [])

  useEffect(() => {
    setSelectedSchemaId("")
    setSelectedMessageType("")
    setShowSchemaControls(false)
    setDecodedData(null)
    
    if (binaryData && schemas.length > 0) {
      if (subject) {
        const cache = getTopicCache()
        const cached = cache.lookup(subject)
        if (cached && cached.confidence > CACHE_CONFIDENCE_THRESHOLD) {
          const cachedSchema = schemas.find(s => 
            (s.id === cached.schema) || (s.name === cached.schema)
          )
          
          if (cachedSchema) {
            setSelectedSchemaId(cachedSchema.id || cachedSchema.name)
            setSelectedMessageType(cached.messageType)
            setIsFromCache(true)
            return
          }
        }
      }
      
      setIsFromCache(false)
      autoDetectMessageType()
    }
  }, [binaryData, schemas.length, subject])
  
  useEffect(() => {
    if (!binaryData || !selectedSchema || !selectedMessageType) {
      setDecodedData(null)
      return
    }

    const result = decodeProtobufMessage(binaryData, selectedSchema, selectedMessageType)
    setDecodedData(result)
    
    if (subject && !isFromCache) {
      const cache = getTopicCache()
      const schemaIdentifier = selectedSchema.id || selectedSchema.name
      
      if (result.success) {
        cache.onSuccessfulDecode(subject, schemaIdentifier, selectedMessageType)
      } else {
        cache.onDecodeFailed(subject)
      }
    }
  }, [binaryData, selectedSchema, selectedMessageType, subject, isFromCache])

  const cacheStats = useMemo(() => {
    try {
      return getTopicCache().getStats()
    } catch {
      return undefined
    }
  }, [selectedSchemaId, selectedMessageType])

  return {
    schemas,
    selectedSchemaId,
    selectedMessageType,
    decodedData,
    isLoadingSchemas,
    isAutoDetecting,
    showSchemaControls,
    availableMessageTypes,
    selectedSchema,
    cacheStats,
    setSelectedSchemaId,
    setSelectedMessageType,
    setShowSchemaControls,
    autoDetectMessageType,
    resetSelection,
  }
}