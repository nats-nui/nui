import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { ProtoSchema } from '@/types/Protobuf'
import { createUnifiedProtoRoot } from '@/utils/protobuf'
import { schemaDiscovery } from '@/services/ProtoSchemaDiscovery'
import protoApi from '@/api/proto'

interface ProtobufSchemaContextType {
  schemas: ProtoSchema[]
  isLoading: boolean
  error: string | null
  refreshSchemas: () => Promise<void>
}

const ProtobufSchemaContext = createContext<ProtobufSchemaContextType | null>(null)

interface ProtobufSchemaProviderProps {
  children: ReactNode
}

export function ProtobufSchemaProvider({ children }: ProtobufSchemaProviderProps) {
  const [schemas, setSchemas] = useState<ProtoSchema[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadSchemas = async () => {
    if (isLoading) return // Prevent concurrent loads
    
    setIsLoading(true)
    setError(null)
    
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
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load schemas'
      setError(errorMessage)
      console.error('Failed to load protobuf schemas:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Load schemas on provider mount
  useEffect(() => {
    loadSchemas()
  }, [])

  const refreshSchemas = async () => {
    await loadSchemas()
  }

  return (
    <ProtobufSchemaContext.Provider
      value={{
        schemas,
        isLoading,
        error,
        refreshSchemas,
      }}
    >
      {children}
    </ProtobufSchemaContext.Provider>
  )
}

export function useProtobufSchemas(): ProtobufSchemaContextType {
  const context = useContext(ProtobufSchemaContext)
  if (!context) {
    throw new Error('useProtobufSchemas must be used within a ProtobufSchemaProvider')
  }
  return context
}