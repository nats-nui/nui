/**
 * Which schema and rule a CBOR payload is read under.
 *
 * One payload has one answer, and a message list asks for it once per row on
 * every paint. Working it out is expensive — probing compiles CDDL and
 * validates bytes — so the answer is worked out in one place, kept, and handed
 * to every caller that asks for the same payload.
 */

import { CborDecodedData, CddlSchema } from '@/types/Cbor'
import { decodeAndValidateCbor, getRulesFromSchema, validateCborPayload } from '.'
import { CddlTopicCache } from './CddlTopicCache'
import logSo from '@/stores/log'
import { MESSAGE_TYPE } from '@/stores/log/utils'

/** Below this a remembered mapping has been wrong too often to be worth trying */
const CACHE_CONFIDENCE_THRESHOLD = 0.5

/**
 * How many schemas one payload is probed against.
 * Probing compiles and validates against every rule, so an unbounded scan of a
 * large schemas directory would stall the UI on every message that arrives.
 * The bound is high enough that no ordinary directory reaches it, and reaching
 * it is always reported: a payload is never left undetected without saying so.
 */
export const MAX_SCHEMAS_TO_PROBE = 200

/**
 * How many answers are kept.
 * Rows re-render as a list scrolls, filters, and receives; without this each
 * paint would compile and validate the same schemas over again.
 */
const RESOLVED_CACHE_SIZE = 512

export interface CborResolution {
  /** the schema the payload is read under, if one accepts it */
  schema?: CddlSchema
  /** the rule of that schema the payload matches */
  rule?: string
  decoded: CborDecodedData
  /** the rule came from what the subject carried before, not from probing */
  fromCache: boolean
  /** the subject had a remembered rule and the payload no longer matches it */
  cacheStale: boolean
  /** no rule of any schema probed accepted the payload */
  unmatched: boolean
}

let topicCache: CddlTopicCache | null = null

/** The one cache of what each subject was last read under */
export function getTopicCache(): CddlTopicCache {
  if (!topicCache) topicCache = new CddlTopicCache()
  return topicCache
}

const resolved = new Map<string, CborResolution>()
let resolvedFor: CddlSchema[] | null = null
let resolvedSignature: string | null = null
const reported = new Set<string>()

/**
 * What the kept answers were worked out against.
 * The same array arrives on every render, so its identity answers the question
 * without reading it. A caller that builds its own array each time still gets
 * its answers kept, at the cost of a pass over the schemas it passes in.
 */
function stillFor(schemas: CddlSchema[]): boolean {
  if (schemas === resolvedFor) return true

  const signature = schemas.map(schema => `${schema.id ?? ''}\u0001${schema.name}\u0001${schema.content}`).join('\u0002')
  const same = signature === resolvedSignature

  resolvedFor = schemas
  resolvedSignature = signature
  return same
}

/**
 * The schema and rule a payload is read under, worked out once per payload.
 *
 * Reading never writes to the topic cache: a list of a hundred rows would
 * otherwise teach and re-teach the same subject a hundred times. Learning
 * belongs to the card that opens a message, which is where a person can see
 * and change what was picked.
 */
export function resolveCbor(binaryData: string, schemas: CddlSchema[], subject?: string): CborResolution {
  // the schemas are replaced wholesale on every reread, and a rule that was
  // right under the old ones may not be under the new
  if (!stillFor(schemas)) {
    resolved.clear()
    reported.clear()
  }

  const key = `${subject ?? ''}\u0000${binaryData}`
  const kept = resolved.get(key)
  if (kept) return kept

  const answer = work(binaryData, schemas, subject)

  if (resolved.size >= RESOLVED_CACHE_SIZE) {
    const oldest = resolved.keys().next().value
    if (oldest != null) resolved.delete(oldest)
  }
  resolved.set(key, answer)
  return answer
}

function work(binaryData: string, schemas: CddlSchema[], subject?: string): CborResolution {
  const remembered = recall(binaryData, schemas, subject)
  const found = remembered?.holds
    ? remembered.mapping
    : probeSchemas(binaryData, schemas, subject)

  return {
    schema: found?.schema,
    rule: found?.rule,
    decoded: decodeAndValidateCbor(binaryData, found?.schema, found?.rule),
    fromCache: remembered?.holds ?? false,
    cacheStale: remembered ? !remembered.holds : false,
    unmatched: !found,
  }
}

/**
 * What the subject was read under last time, and whether it still holds.
 *
 * A remembered rule is a guess like any other until the payload agrees with
 * it. Checking it before using it is what keeps a subject from being labelled
 * with a rule it outgrew: when a schema changes underneath, the payload says
 * so and the subject is detected afresh instead of staying wrong for good.
 */
function recall(
  binaryData: string,
  schemas: CddlSchema[],
  subject?: string,
): { mapping: { schema: CddlSchema, rule: string }, holds: boolean } | undefined {
  const mapping = rememberedFor(subject, schemas)
  if (!mapping) return undefined

  return { mapping, holds: validateCborPayload(binaryData, mapping.schema, mapping.rule).valid }
}

/**
 * The schema and rule a subject carried before, without a payload to check it.
 * A payload being written has nothing to validate yet, so its subject is all
 * there is to go on.
 */
export function rememberedFor(
  subject: string | undefined,
  schemas: CddlSchema[],
): { schema: CddlSchema, rule: string } | undefined {
  if (!subject) return undefined

  const cached = getTopicCache().lookup(subject)
  if (!cached || cached.confidence <= CACHE_CONFIDENCE_THRESHOLD) return undefined

  const schema = schemas.find(candidate => candidate.id === cached.schema || candidate.name === cached.schema)
  if (!schema || schema.error) return undefined

  return { schema, rule: cached.messageType }
}

/**
 * The first schema and rule the payload satisfies.
 * Every CBOR payload decodes, so the CDDL verdict is the only thing that tells
 * one rule from another: the first rule the payload matches wins.
 *
 * Coming away with nothing is reported rather than passed over. A payload
 * shown as plain CBOR when a schema for it exists is the one outcome a person
 * cannot tell from a payload that has no schema at all, so it is said out loud
 * — once per subject, so that a stream of them does not fill the card.
 */
export function probeSchemas(
  binaryData: string,
  schemas: CddlSchema[],
  subject?: string,
): { schema: CddlSchema, rule: string } | undefined {
  const usable = schemas.filter(schema => !schema.error)
  const probed = usable.slice(0, MAX_SCHEMAS_TO_PROBE)

  for (const schema of probed) {
    const rule = getRulesFromSchema(schema)
      .find(candidate => validateCborPayload(binaryData, schema, candidate).valid)
    if (rule) {
      report(`hit:${subject ?? ''}:${schema.name}:${rule}`, MESSAGE_TYPE.INFO,
        `${schema.name} \u203a ${rule} matches this payload`, subject)
      return { schema, rule }
    }
  }

  // nothing to probe against is already said, once, by whoever read the
  // directory: either no .cddl files were found or each one that will not
  // compile was named
  if (probed.length == 0) return undefined

  if (usable.length > probed.length) {
    report(`bound:${usable.length}`, MESSAGE_TYPE.WARNING,
      `no match in the first ${probed.length} of ${usable.length} schemas, and the rest were not tried`,
      'pick the schema and type by hand, or keep fewer .cddl files in the schemas directory')
    return undefined
  }

  report(`miss:${subject ?? ''}`, MESSAGE_TYPE.INFO,
    `no schema matches ${subject ? subject : 'this payload'}`,
    `tried every rule of ${probed.length} schema${probed.length == 1 ? '' : 's'}; showing plain CBOR`)
  return undefined
}

/**
 * Say a thing once: the same payload arrives over and over on a live subject.
 *
 * A row works its payload out while it renders, and writing to the log store
 * from there would be changing one component while another is drawing. What is
 * said is settled now and said as soon as the render is over.
 */
function report(key: string, type: MESSAGE_TYPE, body: string, data?: string): void {
  if (reported.has(key)) return
  reported.add(key)
  queueMicrotask(() => logSo.add({ type, title: 'CDDL', body, data }))
}

/** Forget every kept answer: for tests, and for a schemas directory reread */
export function forgetResolutions(): void {
  resolved.clear()
  reported.clear()
  resolvedFor = null
  resolvedSignature = null
}
