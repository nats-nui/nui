import { ProtoSchema, ProtobufDecodedData } from '@/types/Protobuf'
import { decodeProtobufMessage, getAllMessageTypes } from '@/utils/protobuf'
import { ProtobufTopicCache } from './ProtobufTopicCache'

const CACHE_CONFIDENCE_THRESHOLD = 0.5
const RESOLVED_CACHE_SIZE = 512
const MAX_QUICK_SCHEMAS = 3

export interface ProtobufSelection {
  schema: ProtoSchema
  messageType: string
  decoded: ProtobufDecodedData
}

export interface ProtobufResolution {
  schema?: ProtoSchema
  messageType?: string
  decoded?: ProtobufDecodedData
}

let topicCache: ProtobufTopicCache | null = null

export function getTopicCache(): ProtobufTopicCache {
  if (!topicCache) topicCache = new ProtobufTopicCache()
  return topicCache
}

export function subscribeToTopicCache(listener: () => void): () => void {
  return getTopicCache().subscribe(listener)
}

export function getTopicCacheRevision(): number {
  return getTopicCache().getRevision()
}

const resolved = new Map<string, { signature: string, answer: ProtobufResolution }>()
let resolvedFor: ProtoSchema[] | null = null
let resolvedSignature: string | null = null

export function forgetProtobufResolutions(): void {
  resolved.clear()
}

function stillFor(schemas: ProtoSchema[]): boolean {
  if (schemas === resolvedFor) return true
  const signature = schemas.map(schema =>
    `${schema.id ?? ''}\u0001${schema.name}\u0001${schema.content}\u0001${schema.error ?? ''}`,
  ).join('\u0002')
  const same = signature === resolvedSignature
  resolvedFor = schemas
  resolvedSignature = signature
  return same
}

/** Stable primitive snapshot: unrelated subject changes do not update a row. */
export function getTopicCandidatesSignature(subject?: string): string {
  return JSON.stringify((subject ? getTopicCache().lookup(subject) ?? [] : [])
    .filter(candidate => candidate.confidence > CACHE_CONFIDENCE_THRESHOLD)
    .map(candidate => [candidate.schema, candidate.messageType]))
}

export function hasRecognizedFields(decoded?: ProtobufDecodedData): boolean {
  return !!decoded?.success && (decoded.recognizedFieldCount ?? 0) > 0
}

/** Call after React commits, never during rendering. Duplicate learning is a no-op. */
export function learnProtobufResolution(subject: string | undefined, answer?: ProtobufResolution): void {
  if (!subject || !answer?.schema || !answer.messageType || !hasRecognizedFields(answer.decoded)) return
  getTopicCache().learnCandidate(subject, answer.schema.id || answer.schema.name, answer.messageType)
}

/** Keep the card's quick-detection scoring in one place. */
export function detectProtobufMessage(binaryData: string, schemas: ProtoSchema[]): ProtobufSelection | undefined {
  let best: (ProtobufSelection & { score: number }) | undefined

  for (const schema of schemas.slice(0, MAX_QUICK_SCHEMAS)) {
    if (schema.error || !schema.root) continue
    try {
      for (const messageType of getAllMessageTypes(schema)) {
        try {
          const decoded = decodeProtobufMessage(binaryData, schema, messageType)
          if (!hasRecognizedFields(decoded)) continue
          const dataStr = JSON.stringify(decoded.data)
          const fieldCount = (dataStr.match(/":"/g) || []).length + (dataStr.match(/":\d/g) || []).length
          const score = 50 + Math.min(30, fieldCount * 2) + Math.min(20, dataStr.length / 50)
          if (!best || score > best.score) best = { schema, messageType, decoded, score }
          if (score > 90) break
        } catch {
          // A malformed type should not stop probing the remaining types.
        }
      }
    } catch {
      // Continue with the remaining schemas.
    }
    if (best && best.score > 90) break
  }

  return best
}

/** Share row answers by subject and payload; reading never writes topic mappings. */
export function resolveProtobuf(binaryData: string, schemas: ProtoSchema[], subject?: string): ProtobufResolution {
  if (!stillFor(schemas)) resolved.clear()
  const signature = getTopicCandidatesSignature(subject)
  const key = `${subject ?? ''}\u0000${binaryData}`
  const kept = resolved.get(key)
  if (kept?.signature === signature) return kept.answer

  let answer: ProtobufResolution | undefined
  let failure: ProtobufResolution | undefined
  for (const candidate of subject ? getTopicCache().lookup(subject) ?? [] : []) {
    if (candidate.confidence <= CACHE_CONFIDENCE_THRESHOLD) continue
    const schema = schemas.find(schema => !schema.error && schema.root &&
      (schema.id === candidate.schema || schema.name === candidate.schema))
    if (!schema) continue
    const decoded = decodeProtobufMessage(binaryData, schema, candidate.messageType)
    if (hasRecognizedFields(decoded)) {
      answer = { schema, messageType: candidate.messageType, decoded }
      break
    }
    if (!decoded.success) failure ??= { schema, messageType: candidate.messageType, decoded }
  }
  answer ??= detectProtobufMessage(binaryData, schemas) ?? failure ?? {}

  if (!resolved.has(key) && resolved.size >= RESOLVED_CACHE_SIZE) {
    const oldest = resolved.keys().next().value
    if (oldest != null) resolved.delete(oldest)
  }
  resolved.set(key, { signature, answer })
  return answer
}
