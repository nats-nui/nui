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

const resolved = new Map<string, ProtobufResolution>()
let resolvedFor: ProtoSchema[] | null = null
let resolvedSignature: string | null = null
let resolvedRevision = -1

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

/** Read a remembered mapping, without teaching or changing the topic cache. */
function rememberedFor(subject: string | undefined, schemas: ProtoSchema[]): Pick<ProtobufSelection, 'schema' | 'messageType'> | undefined {
  if (!subject) return undefined
  const cached = getTopicCache().lookup(subject)
  if (!cached || cached.confidence <= CACHE_CONFIDENCE_THRESHOLD) return undefined
  const schema = schemas.find(candidate =>
    !candidate.error && candidate.root &&
    (candidate.id === cached.schema || candidate.name === cached.schema),
  )
  if (!schema) return undefined
  return { schema, messageType: cached.messageType }
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
          if (!decoded.success || !decoded.data) continue
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
  const revision = getTopicCacheRevision()
  const sameSchemas = stillFor(schemas)
  if (revision !== resolvedRevision || !sameSchemas) resolved.clear()
  resolvedRevision = revision
  const key = `${subject ?? ''}\u0000${binaryData}`
  const kept = resolved.get(key)
  if (kept) return kept

  const remembered = rememberedFor(subject, schemas)
  const detected = remembered ? undefined : detectProtobufMessage(binaryData, schemas)
  const selected = remembered ?? detected
  const answer: ProtobufResolution = selected ? {
    schema: selected.schema,
    messageType: selected.messageType,
    decoded: remembered
      ? decodeProtobufMessage(binaryData, selected.schema, selected.messageType)
      : detected?.decoded,
  } : {}

  if (resolved.size >= RESOLVED_CACHE_SIZE) {
    const oldest = resolved.keys().next().value
    if (oldest != null) resolved.delete(oldest)
  }
  resolved.set(key, answer)
  return answer
}
