// Validation constants - exported for reuse across protobuf utilities
export const MAX_TOPIC_LENGTH = 2000
export const MAX_SCHEMA_LENGTH = 200
export const MAX_MESSAGE_TYPE_LENGTH = 200

export interface ValidationResult {
  isValid: boolean
  error?: string
}

/**
 * Centralized validation utilities for protobuf-related inputs.
 * Provides consistent validation and sanitization across the protobuf system.
 */
export class ProtobufValidator {
  /**
   * Validates a topic string for protobuf message routing.
   * Checks format, length constraints, and segment structure.
   * 
   * @param topic - The topic string to validate (e.g., "user.123.events.created")
   * @returns Validation result with error message if invalid
   */
  static validateTopic(topic: string): ValidationResult {
    if (!topic || typeof topic !== 'string') {
      return { isValid: false, error: 'Topic must be a string' }
    }
    
    const trimmed = topic.trim()
    if (trimmed.length === 0) {
      return { isValid: false, error: 'Topic cannot be empty' }
    }
    
    if (trimmed.length > MAX_TOPIC_LENGTH) {
      return { isValid: false, error: `Topic exceeds maximum length of ${MAX_TOPIC_LENGTH}` }
    }
    
    if (trimmed.includes('..') || trimmed.startsWith('.') || trimmed.endsWith('.')) {
      return { isValid: false, error: 'Topic has invalid format' }
    }
    
    const segments = trimmed.split('.')
    if (segments.some(segment => segment.length === 0)) {
      return { isValid: false, error: 'Topic segments cannot be empty' }
    }
    
    return { isValid: true }
  }

  /**
   * Validates a protobuf schema identifier.
   * Ensures the schema name meets length and format requirements.
   * 
   * @param schema - The schema identifier to validate
   * @returns Validation result with error message if invalid
   */
  static validateSchema(schema: string): ValidationResult {
    if (!schema || typeof schema !== 'string') {
      return { isValid: false, error: 'Schema must be a string' }
    }
    
    const trimmed = schema.trim()
    if (trimmed.length === 0) {
      return { isValid: false, error: 'Schema cannot be empty' }
    }
    
    if (trimmed.length > MAX_SCHEMA_LENGTH) {
      return { isValid: false, error: `Schema exceeds maximum length of ${MAX_SCHEMA_LENGTH}` }
    }
    
    return { isValid: true }
  }

  /**
   * Validates a protobuf message type name.
   * Ensures the message type meets length and format requirements.
   * 
   * @param messageType - The message type name to validate
   * @returns Validation result with error message if invalid
   */
  static validateMessageType(messageType: string): ValidationResult {
    if (!messageType || typeof messageType !== 'string') {
      return { isValid: false, error: 'MessageType must be a string' }
    }
    
    const trimmed = messageType.trim()
    if (trimmed.length === 0) {
      return { isValid: false, error: 'MessageType cannot be empty' }
    }
    
    if (trimmed.length > MAX_MESSAGE_TYPE_LENGTH) {
      return { isValid: false, error: `MessageType exceeds maximum length of ${MAX_MESSAGE_TYPE_LENGTH}` }
    }
    
    return { isValid: true }
  }

  /**
   * Sanitizes a topic string by removing invalid characters.
   * Keeps only word characters, dots, and hyphens.
   * 
   * @param topic - The topic string to sanitize
   * @returns Sanitized topic string
   */
  static sanitizeTopic(topic: string): string {
    return topic.trim().replace(/[^\w\.\-]/g, '')
  }

  /**
   * Sanitizes an identifier (schema/messageType) by removing invalid characters.
   * Keeps only word characters and hyphens.
   * 
   * @param identifier - The identifier to sanitize
   * @returns Sanitized identifier string
   */
  static sanitizeIdentifier(identifier: string): string {
    return identifier.trim().replace(/[^\w\-]/g, '')
  }

  /**
   * Validates and sanitizes all protobuf inputs in a single operation.
   * This is the recommended method for comprehensive input processing.
   * 
   * @param topic - The topic string to validate and sanitize
   * @param schema - The schema identifier to validate and sanitize
   * @param messageType - The message type to validate and sanitize
   * @returns Validation result with sanitized data if successful
   * 
   * @example
   * ```typescript
   * const result = ProtobufValidator.validateAndSanitizeAll(
   *   'user.123.events.created',
   *   'UserSchema', 
   *   'CreateEvent'
   * )
   * 
   * if (result.isValid) {
   *   const { topic, schema, messageType } = result.sanitized!
   *   // Use sanitized values
   * }
   * ```
   */
  static validateAndSanitizeAll(topic: string, schema: string, messageType: string): {
    isValid: boolean
    error?: string
    sanitized?: { topic: string, schema: string, messageType: string }
  } {
    const topicValidation = this.validateTopic(topic)
    if (!topicValidation.isValid) {
      return topicValidation
    }

    const schemaValidation = this.validateSchema(schema)
    if (!schemaValidation.isValid) {
      return schemaValidation
    }

    const messageTypeValidation = this.validateMessageType(messageType)
    if (!messageTypeValidation.isValid) {
      return messageTypeValidation
    }

    const sanitizedTopic = this.sanitizeTopic(topic)
    const sanitizedSchema = this.sanitizeIdentifier(schema)
    const sanitizedMessageType = this.sanitizeIdentifier(messageType)

    if (sanitizedTopic.length === 0) {
      return { isValid: false, error: 'Topic contains only invalid characters' }
    }
    if (sanitizedSchema.length === 0) {
      return { isValid: false, error: 'Schema contains only invalid characters' }
    }
    if (sanitizedMessageType.length === 0) {
      return { isValid: false, error: 'MessageType contains only invalid characters' }
    }

    return {
      isValid: true,
      sanitized: {
        topic: sanitizedTopic,
        schema: sanitizedSchema,
        messageType: sanitizedMessageType
      }
    }
  }
}