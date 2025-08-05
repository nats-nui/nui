import protoApi from "@/api/proto"
import { ProtoSchema } from "@/types/Protobuf"
import { parseProtoSchema, getMessageTypes } from "@/utils/protobuf"

/**
 * Represents a discovered protobuf message type from schema analysis
 */
interface DiscoveredMessage {
  /** Unique identifier of the proto schema file */
  schemaId: string
  /** Human-readable name of the proto schema */
  schemaName: string
  /** Name of the message type within the schema */
  messageType: string
  /** Full path to the message type (e.g., "example.MyMessage") */
  fullPath: string
  /** Compatibility score (0-110) - higher means better match */
  score?: number
  /** Results from attempting to decode binary data with this message type */
  decodeResult?: {
    /** Whether the decode operation succeeded */
    success: boolean
    /** Error message if decode failed */
    error?: string
    /** Preview of decoded data (truncated if long) */
    dataPreview?: string
    /** Number of fields successfully decoded */
    fieldCount?: number
  }
}

// Scoring constants for protobuf message compatibility analysis
const SCORING = {
  BASE_SUCCESS: 50,           // Base score for successful decode
  MAX_FIELD_BONUS: 30,        // Maximum bonus for rich field data
  FIELD_MULTIPLIER: 2,        // Points per decoded field
  MAX_SIZE_BONUS: 20,         // Maximum bonus for data size
  SIZE_DIVISOR: 50,           // Data length divisor for size scoring
  MAX_NESTING_BONUS: 10,      // Maximum bonus for nested structures
  TYPE_ERROR_PENALTY: 5,      // Small score for type/required errors (might indicate partial compatibility)
} as const

/**
 * Service for discovering and analyzing protobuf schema compatibility with binary data.
 * Provides intelligent schema detection and scoring based on decode success and data richness.
 */
class ProtoSchemaDiscoveryService {
  private schemaCache: ProtoSchema[] | null = null
  private parsedSchemaCache: Map<string, ProtoSchema & { root: any }> = new Map()

  /**
   * Clears all internal caches (schema list and parsed schemas).
   * Should be called when user refreshes schemas to ensure fresh data.
   */
  clearCache(): void {
    this.schemaCache = null
    this.parsedSchemaCache.clear()
  }

  /**
   * Retrieves all protobuf schemas with caching to minimize API calls.
   * @returns Promise resolving to array of protobuf schemas
   * @private
   */
  private async getCachedSchemas(): Promise<ProtoSchema[]> {
    if (!this.schemaCache) {
      this.schemaCache = await protoApi.index()
    }
    return this.schemaCache
  }

  /**
   * Retrieves and caches a parsed protobuf schema by ID.
   * @param schemaId - Unique identifier of the schema to retrieve
   * @returns Promise resolving to parsed schema with protobuf root, or null if not found/invalid
   * @private
   */
  private async getParsedSchema(schemaId: string): Promise<ProtoSchema & { root: any } | null> {
    if (this.parsedSchemaCache.has(schemaId)) {
      return this.parsedSchemaCache.get(schemaId)!
    }

    const schemas = await this.getCachedSchemas()
    const schema = schemas.find(s => s.id === schemaId)
    if (!schema) return null

    const parsed = parseProtoSchema(schema.content, schema.name)
    if (!parsed.error && parsed.root) {
      const parsedSchema = { ...schema, root: parsed.root }
      this.parsedSchemaCache.set(schemaId, parsedSchema)
      return parsedSchema
    }

    return null
  }

  /**
   * Discovers all available message types across all protobuf schemas.
   * Parses each schema and extracts message type definitions without analyzing compatibility.
   * @returns Promise resolving to array of discovered message types with basic metadata
   */
  async discoverMessageTypes(): Promise<DiscoveredMessage[]> {
    // Get all available schemas from cache
    const schemas = await this.getCachedSchemas()
    
    // Parse all schemas in parallel for better performance
    const schemaResults = await Promise.all(
      schemas.map(async (schema) => {
        try {
          if (!schema.id) {
            console.warn(`Schema ${schema.name} has no ID, skipping`)
            return []
          }

          const parsed = parseProtoSchema(schema.content, schema.name)
          if (!parsed.error && parsed.root) {
            const messageTypes = getMessageTypes({ ...schema, root: parsed.root })
            
            return messageTypes.map(messageType => ({
              schemaId: schema.id,
              schemaName: schema.name,
              messageType,
              fullPath: messageType
            }))
          }
          return []
        } catch (error) {
          console.warn(`Failed to analyze schema ${schema.name}:`, error)
          return []
        }
      })
    )
    
    // Flatten the array of arrays into a single array
    return schemaResults.flat()
  }


  /**
   * Finds the best matching message types for given binary protobuf data.
   * Tests all available message types and returns them sorted by compatibility score.
   * @param binaryData - Binary protobuf data as a string to analyze
   * @returns Promise resolving to array of discovered messages sorted by compatibility score (highest first)
   */
  async findMatchingMessageTypes(binaryData: string): Promise<DiscoveredMessage[]> {
    const allMessages = await this.discoverMessageTypes()
    
    if (!binaryData || allMessages.length === 0) {
      return allMessages
    }

    console.log(`🔍 Testing ${allMessages.length} proto file + message type combinations...`)

    // Score messages based on potential compatibility
    const scoredMessages = await Promise.all(
      allMessages.map(async (message) => {
        const analysis = await this.analyzeMessageCompatibility(message, binaryData)
        return analysis
      })
    )

    // Sort by score and filter successful matches
    const validMatches = scoredMessages
      .filter(item => item.score && item.score > 0)
      .sort((a, b) => (b.score || 0) - (a.score || 0))

    console.log(`✅ Found ${validMatches.length} compatible combinations:`)
    validMatches.slice(0, 5).forEach((match, i) => {
      console.log(`  ${i + 1}. ${match.schemaName} → ${match.messageType} (score: ${match.score})`)
    })

    return validMatches
  }

  /**
   * Analyzes the compatibility between a specific message type and binary protobuf data.
   * 
   * This method performs a comprehensive analysis by:
   * 1. Retrieving and parsing the protobuf schema
   * 2. Attempting to decode the binary data using the specified message type
   * 3. Calculating a compatibility score based on decode success and data quality
   * 
   * Scoring Algorithm:
   * - Base Score (50): Awarded for any successful decode
   * - Field Bonus (0-30): Points for decoded fields (2 points each, max 30)
   * - Size Bonus (0-20): Points based on decoded data size (richer data = higher score)
   * - Nesting Bonus (0-10): Points for complex nested structures
   * - Type Error Penalty (5): Small score for partial compatibility (type/required errors)
   * - Total possible score: 110 points
   * 
   * @param message - The discovered message type to test compatibility with
   * @param binaryData - Binary protobuf data as string to decode and analyze
   * @returns Promise resolving to the message with added score and decode result
   * @private
   */
  private async analyzeMessageCompatibility(message: DiscoveredMessage, binaryData: string): Promise<DiscoveredMessage> {
    try {
      // Get the parsed schema from cache
      const parsedSchema = await this.getParsedSchema(message.schemaId)
      if (!parsedSchema) {
        return {
          ...message,
          score: 0,
          decodeResult: {
            success: false,
            error: `Schema not found or failed to parse`
          }
        }
      }

      const { decodeProtobufMessage } = await import('@/utils/protobuf')

      // Attempt to decode with this specific proto file + message type combination
      const result = decodeProtobufMessage(binaryData, parsedSchema, message.messageType)
      
      if (result.success && result.data) {
        // Advanced scoring based on decode quality
        let score = 0
        
        // Base score for successful decode
        score += SCORING.BASE_SUCCESS
        
        // Score for data richness (non-empty fields)
        const dataStr = JSON.stringify(result.data)
        const fieldCount = (dataStr.match(/":"/g) || []).length + (dataStr.match(/":\d/g) || []).length
        score += Math.min(SCORING.MAX_FIELD_BONUS, fieldCount * SCORING.FIELD_MULTIPLIER)
        
        // Score for data size (more populated data = better match)
        score += Math.min(SCORING.MAX_SIZE_BONUS, dataStr.length / SCORING.SIZE_DIVISOR)
        
        // Bonus for complex nested structures
        const nestingLevel = (dataStr.match(/\{/g) || []).length
        score += Math.min(SCORING.MAX_NESTING_BONUS, nestingLevel)
        
        return {
          ...message,
          score: Math.round(score),
          decodeResult: {
            success: true,
            dataPreview: dataStr.length > 200 ? dataStr.substring(0, 200) + '...' : dataStr,
            fieldCount
          }
        }
      } else {
        return {
          ...message,
          score: result.error?.includes('required') || result.error?.includes('type') ? SCORING.TYPE_ERROR_PENALTY : 0,
          decodeResult: {
            success: false,
            error: result.error || 'Decode failed'
          }
        }
      }
    } catch (error) {
      return {
        ...message,
        score: 0,
        decodeResult: {
          success: false,
          error: `Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        }
      }
    }
  }
}

// Export singleton instance
export const schemaDiscovery = new ProtoSchemaDiscoveryService()
export type { DiscoveredMessage }