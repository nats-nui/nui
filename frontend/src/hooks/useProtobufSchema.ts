import { useState, useEffect, useMemo, useCallback } from 'react'
import { decodeProtobufMessage, getMessageTypesFromSchema } from '@/utils/protobuf'
import { detectProtobufMessage, getTopicCache, hasRecognizedFields } from '@/utils/protobuf/resolve'
import { useProtobufSchemas } from '@/contexts/ProtobufSchemaContext'
import { useProtobufResolution } from './useProtobufResolution'

interface ManualSelection {
  binaryData?: string
  subject?: string
  schemaId: string
  messageType: string
}

export function useProtobufSchema(binaryData?: string, subject?: string) {
  const { schemas, isLoading: isLoadingSchemas, refreshSchemas } = useProtobufSchemas()
  const [manual, setManual] = useState<ManualSelection | null>(null)
  const [showSchemaControls, setShowSchemaControls] = useState(false)
  // Scope the override during rendering, before effects can run for a new message.
  const chosen = manual?.binaryData === binaryData && manual?.subject === subject ? manual : null
  const automatic = useProtobufResolution(binaryData, subject, schemas, !chosen)
  const selectedSchemaId = chosen ? chosen.schemaId
    : automatic?.schema ? automatic.schema.id || automatic.schema.name
    : !binaryData && schemas.length ? schemas[0].id || schemas[0].name : ''
  const selectedSchema = useMemo(
    () => schemas.find(schema => schema.id === selectedSchemaId || schema.name === selectedSchemaId),
    [schemas, selectedSchemaId],
  )
  const availableMessageTypes = useMemo(
    () => selectedSchema ? getMessageTypesFromSchema(selectedSchema) : [],
    [selectedSchema],
  )
  const selectedMessageType = chosen ? chosen.messageType
    : automatic?.messageType ?? (!binaryData ? availableMessageTypes[0] ?? '' : '')
  const decodedData = useMemo(() => {
    if (!chosen) return automatic?.decoded ?? null
    return binaryData && selectedSchema && selectedMessageType
      ? decodeProtobufMessage(binaryData, selectedSchema, selectedMessageType) : null
  }, [chosen, automatic, binaryData, selectedSchema, selectedMessageType])

  useEffect(() => {
    setManual(previous => previous?.binaryData === binaryData && previous?.subject === subject ? previous : null)
    setShowSchemaControls(false)
  }, [binaryData, subject])

  useEffect(() => {
    if (!chosen || !subject || !selectedSchema || !selectedMessageType || !hasRecognizedFields(decodedData)) return
    getTopicCache().preferCandidate(subject, selectedSchema.id || selectedSchema.name, selectedMessageType)
  }, [chosen, subject, selectedSchema, selectedMessageType, decodedData])

  const setSelectedSchemaId = useCallback((schemaId: string) => {
    // A schema change is incomplete until the user chooses its message type.
    setManual({ binaryData, subject, schemaId, messageType: '' })
  }, [binaryData, subject])
  const setSelectedMessageType = useCallback((messageType: string) => {
    setManual({ binaryData, subject, schemaId: selectedSchemaId, messageType })
  }, [binaryData, subject, selectedSchemaId])
  const autoDetectMessageType = useCallback(async () => {
    if (!binaryData) return
    const match = detectProtobufMessage(binaryData, schemas)
    if (match) setManual({ binaryData, subject, schemaId: match.schema.id || match.schema.name, messageType: match.messageType })
  }, [binaryData, subject, schemas])
  const resetSelection = useCallback(() => {
    setManual({ binaryData, subject, schemaId: '', messageType: '' })
    setShowSchemaControls(false)
  }, [binaryData, subject])

  return {
    schemas, selectedSchemaId, selectedMessageType, decodedData, isLoadingSchemas,
    showSchemaControls, availableMessageTypes, selectedSchema,
    setSelectedSchemaId, setSelectedMessageType, setShowSchemaControls,
    refreshSchemas, autoDetectMessageType, resetSelection,
  }
}
