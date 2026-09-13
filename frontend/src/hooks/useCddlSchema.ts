import { useState, useEffect, useMemo, useCallback } from "react"
import { CborDecodedData, CddlSchema } from "@/types/Cbor"
import { decodeAndValidateCbor, getRulesFromSchema } from "@/utils/cbor"
import { getTopicCache, probeSchemas, rememberedFor, resolveCbor } from "@/utils/cbor/resolve"
import cddlSo from "@/stores/cddl"
import { useStore } from "@priolo/jon"

interface UseCddlSchemaReturn {
  schemas: CddlSchema[]
  selectedSchemaId: string
  selectedRule: string
  decodedData: CborDecodedData | null
  isLoadingSchemas: boolean
  showSchemaControls: boolean
  availableRules: string[]
  selectedSchema: CddlSchema | undefined
  setSelectedSchemaId: (id: string) => void
  setSelectedRule: (rule: string) => void
  setShowSchemaControls: (show: boolean) => void
  refreshSchemas: () => Promise<void>
  autoDetectRule: () => void
}

function idOf(schema: CddlSchema): string {
  return schema.id || schema.name
}

/**
 * The schema and rule a card reads or writes a payload under.
 *
 * This is the card's hook: it holds a selection a person can change, and it is
 * the one place a subject is learned from. Rows of a message list do not use
 * it — they ask `resolveCbor` for the answer and render it.
 */
export function useCddlSchema(binaryData?: string, subject?: string): UseCddlSchemaReturn {
  
  const { schemas, isLoading: isLoadingSchemas } = useStore(cddlSo)
  const [selectedSchemaId, setSelectedSchemaId] = useState("")
  const [selectedRule, setSelectedRule] = useState("")
  const [showSchemaControls, setShowSchemaControls] = useState(false)
  const [fromCache, setFromCache] = useState(false)
  /** the selection was made in the UI, so nothing else may take it back */
  const [isChosen, setIsChosen] = useState(false)

  const selectedSchema = useMemo(
    () => schemas.find(s => s.id === selectedSchemaId || s.name === selectedSchemaId),
    [schemas, selectedSchemaId],
  )

  const availableRules = useMemo(
    () => selectedSchema ? getRulesFromSchema(selectedSchema) : [],
    [selectedSchema],
  )

  const choose = useCallback((schema: CddlSchema | undefined, rule: string, cached: boolean) => {
    setSelectedSchemaId(schema ? idOf(schema) : "")
    setSelectedRule(rule)
    setFromCache(cached)
  }, [])

  const autoDetectRule = useCallback(() => {
    if (!binaryData || schemas.length == 0) return
    // asking again means ignoring what the subject carried before, which is
    // the only reason there is to ask
    const found = probeSchemas(binaryData, schemas, subject)
    if (!found) return
    setIsChosen(true)
    choose(found.schema, found.rule, false)
  }, [binaryData, schemas, subject, choose])

  const chooseSchema = useCallback((id: string) => {
    setIsChosen(true)
    // the stem of the file is the message type people mean when they pick it
    const schema = schemas.find(s => s.id === id || s.name === id)
    choose(schema, schema ? getRulesFromSchema(schema)[0] ?? "" : "", false)
  }, [schemas, choose])

  const chooseRule = useCallback((rule: string) => {
    setIsChosen(true)
    setSelectedRule(rule)
    setFromCache(false)
  }, [])

  // a payload of its own is a new question: what was chosen for the last one
  // says nothing about this one
  useEffect(() => setIsChosen(false), [binaryData])

  useEffect(() => {
    // the subject of a message being written changes with every keystroke, and
    // must not take away the rule its author picked
    if (isChosen) return

    setShowSchemaControls(false)

    if (schemas.length == 0) {
      choose(undefined, "", false)
      return
    }

    // nothing to read yet: a payload being written takes the rule its subject
    // carried last time, there being no payload to tell one rule from another
    if (!binaryData) {
      const remembered = rememberedFor(subject, schemas)
      choose(remembered?.schema, remembered?.rule ?? "", !!remembered)
      return
    }

    const answer = resolveCbor(binaryData, schemas, subject)

    // the card is the one place a subject is learned from, so it is also the
    // place a mapping that stopped holding is unlearned
    if (answer.cacheStale && subject) getTopicCache().onDecodeFailed(subject)

    choose(answer.schema, answer.rule ?? "", answer.fromCache)
  }, [binaryData, schemas, subject, isChosen, choose])

  const decodedData = useMemo(
    () => binaryData
      ? decodeAndValidateCbor(binaryData, selectedSchema, selectedRule || undefined)
      : null,
    [binaryData, selectedSchema, selectedRule],
  )

  useEffect(() => {
    if (!decodedData || !subject || !selectedSchema || !selectedRule) return

    const cache = getTopicCache()
    if (decodedData.valid === false) {
      // a rule that does not hold is not the rule for this subject, however it
      // was arrived at: a recalled one that has gone wrong has to lose ground
      // or it would be recalled forever
      cache.onDecodeFailed(subject)
    } else if (decodedData.valid === true && !fromCache) {
      cache.onSuccessfulDecode(subject, idOf(selectedSchema), selectedRule)
    }
  }, [decodedData, subject, selectedSchema, selectedRule, fromCache])

  return {
    schemas,
    selectedSchemaId,
    selectedRule,
    decodedData,
    isLoadingSchemas,
    showSchemaControls,
    availableRules,
    selectedSchema,
    setSelectedSchemaId: chooseSchema,
    setSelectedRule: chooseRule,
    setShowSchemaControls,
    refreshSchemas: cddlSo.refresh,
    autoDetectRule,
  }
}
