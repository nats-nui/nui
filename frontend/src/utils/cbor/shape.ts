import { CBOR } from '@cbortech/cbor'
import { getPreludeRules } from '@cbortech/cbor/cddl'
import type {
  CddlArrayType,
  CddlGroup,
  CddlGroupEntry,
  CddlMapType,
  CddlOccur,
  CddlRule,
  CddlSchema as CompiledSchema,
  CddlType,
  CddlType1,
  CddlType2,
} from '@cbortech/cbor/cddl'
import { compileCddl } from '.'

/**
 * The shape of a CDDL rule, as the fields an editor can render.
 *
 * A rule describes the data item it accepts, so walking it gives the labels,
 * the types and the constraints a form needs: a payload matching the rule can
 * then be read and written without anyone typing diagnostic notation. What CDDL
 * can say and a widget cannot - `any`, and a rule that refers back to itself -
 * becomes an `any` field, which the editor renders as a small notation box. The
 * fallback is per field rather than for the whole payload.
 */

/** How many times an entry may appear; `{ min: 1, max: 1 }` unless the schema says otherwise */
export interface CborOccur {
  min: number
  max?: number
}

export interface CborFieldBase {
  /** identifies the field within the shape; stable across renders */
  path: string
  /** the CDDL that produced the field, shown as the type of the input */
  type: string
  /** the `;` comment written with the member in the schema */
  hint?: string
  /** the tag numbers wrapping the value, outermost first */
  tags?: number[]
  /** the value of a `.default` control */
  defaultValue?: unknown
}

export interface CborTextField extends CborFieldBase {
  kind: 'text'
  minLength?: number
  maxLength?: number
  pattern?: string
}

export interface CborNumberField extends CborFieldBase {
  kind: 'number'
  /** the value has no fractional part */
  integer: boolean
  /** the value may not fit a JS number, so it is held as a bigint */
  big?: boolean
  min?: number
  max?: number
}

export interface CborBoolField extends CborFieldBase {
  kind: 'bool'
}

export interface CborBytesField extends CborFieldBase {
  kind: 'bytes'
  minLength?: number
  maxLength?: number
}

/** A value the schema pins: `nil`, `true`, a literal, or a simple value */
export interface CborConstField extends CborFieldBase {
  kind: 'const'
  value: unknown
  /** how the value reads in the schema */
  label: string
}

/** A closed set of values: a choice of literals, or `&(...)` */
export interface CborEnumField extends CborFieldBase {
  kind: 'enum'
  options: { label: string, value: unknown }[]
}

export interface CborMapField extends CborFieldBase {
  kind: 'map'
  entries: CborEntry[]
}

export interface CborArrayField extends CborFieldBase {
  kind: 'array'
  entries: CborEntry[]
}

/** Alternatives the schema allows in one place: the editor picks one */
export interface CborChoiceField extends CborFieldBase {
  kind: 'choice'
  options: CborField[]
}

/** Anything a widget cannot stand for: written as diagnostic notation */
export interface CborAnyField extends CborFieldBase {
  kind: 'any'
  /** why no widget was built; unset for a plain `any` */
  reason?: 'recursive' | 'unsupported'
}

export type CborField =
  | CborTextField
  | CborNumberField
  | CborBoolField
  | CborBytesField
  | CborConstField
  | CborEnumField
  | CborMapField
  | CborArrayField
  | CborChoiceField
  | CborAnyField

/** The key of a map member: fixed by the schema, or left to the editor */
export type CborEntryKey =
  | { kind: 'fixed', value: unknown, label: string }
  | { kind: 'open', field: CborField }

/** One member of a map, or one position of an array */
export interface CborEntry {
  path: string
  /** how the member reads: its name, its key, or its position in an array */
  label: string
  /** unset for the members of an array, whose position is their key */
  key?: CborEntryKey
  value: CborField
  occur: CborOccur
  hint?: string
}

export interface CborShape {
  /** the fields of the rule; unset when the rule was not found or does not compile */
  field?: CborField
  error?: string
}

/** How deep a rule may nest before the rest of it is left to diagnostic notation */
const MAX_DEPTH = 12

const ONCE: CborOccur = { min: 1, max: 1 }

const SHAPE_CACHE_SIZE = 64
const shapeCache = new Map<string, CborShape>()

/**
 * Derive the fields of one rule of a CDDL schema.
 * The result is kept: a list of messages shapes the same rule over and over.
 */
export function deriveShape(content: string, rule: string): CborShape {
  const key = `${rule}\u0000${content}`
  const cached = shapeCache.get(key)
  if (cached) return cached

  const shape = buildShape(content, rule)
  if (shapeCache.size >= SHAPE_CACHE_SIZE) {
    const oldest = shapeCache.keys().next().value
    if (oldest != null) shapeCache.delete(oldest)
  }
  shapeCache.set(key, shape)
  return shape
}

function buildShape(content: string, rule: string): CborShape {
  const { compiled, error } = compileCddl(content)
  if (!compiled) return { error: error ?? 'CDDL compile failed' }

  const definitions = definitionsOf(compiled, rule)
  if (definitions.length == 0) return { error: `'${rule}' is not a rule of this schema` }
  if (definitions.some(definition => definition.generics?.length)) {
    return { error: `'${rule}' takes generic parameters, so it has no shape of its own` }
  }

  const ctx: Context = { schema: compiled, lines: lineStarts(compiled.source), stack: [rule] }
  return { field: fieldFromDefinitions(definitions, ctx, { path: '$', scope: null, depth: 0 }) }
}

interface Context {
  schema: CompiledSchema
  lines: number[]
  /** the rules being resolved, innermost last: a name already here is a cycle */
  stack: string[]
}

/** A generic parameter bound to the type it was called with, in the caller's scope */
interface Binding {
  node: CddlType1
  scope: Scope
}
type Scope = Map<string, Binding> | null

interface At {
  path: string
  scope: Scope
  depth: number
}

/** The definitions of one name: several when the schema extends it with `/=` */
function fieldFromDefinitions(definitions: readonly CddlRule[], ctx: Context, at: At): CborField {
  const options = definitions.flatMap(definition => {
    // a group is not a data item: it only has meaning inlined in a map or an array
    if (definition.body.kind == 'entry-group') {
      return [unsupported(ctx, definition.body.group, at, 'unsupported')]
    }
    return definition.body.value.alternatives.map(alternative => fieldFromType1(alternative, ctx, at))
  })
  return asChoice(options, at)
}

function fieldFromType(type: CddlType, ctx: Context, at: At): CborField {
  return asChoice(type.alternatives.map(alternative => fieldFromType1(alternative, ctx, at)), at)
}

/** One alternative: a type, and the range or control operator applied to it */
function fieldFromType1(type1: CddlType1, ctx: Context, at: At): CborField {
  const field = fieldFromType2(type1.target, ctx, at)
  if (!type1.op || !type1.controller) return field
  if (type1.op.kind == 'range') {
    return withRange(field, type1.target, type1.controller, type1.op.inclusive, ctx, sourceOf(ctx, type1))
  }
  return withControl(field, type1.op.name, type1.controller, ctx)
}

function fieldFromType2(type2: CddlType2, ctx: Context, at: At): CborField {
  if (at.depth > MAX_DEPTH) return unsupported(ctx, type2, at, 'recursive')

  switch (type2.kind) {
    case 'value':
      return { kind: 'const', ...base(ctx, type2, at), value: literalOf(type2), label: type2.raw }

    case 'ref':
      return fieldFromRef(type2, ctx, at)

    case 'paren':
      return fieldFromType(type2.type, ctx, at)

    case 'map':
    case 'array':
      return fieldFromContainer(type2, ctx, at)

    case 'unwrap':
      return fieldFromUnwrap(type2, ctx, at)

    case 'enum':
      return fieldFromEnum(type2, ctx, at)

    case 'tagged': {
      const inner = fieldFromType(type2.item, ctx, { ...at, depth: at.depth + 1 })
      const tag = typeof type2.tag == 'bigint' ? Number(type2.tag) : undefined
      // the tag travels with the value: the editor shows it, nobody types it in
      return {
        ...inner,
        ...base(ctx, type2, at),
        tags: tag == null ? inner.tags : [tag, ...inner.tags ?? []],
      }
    }

    case 'major':
      return fieldFromMajor(type2, ctx, at)

    case 'any':
      return { kind: 'any', ...base(ctx, type2, at) }
  }
}

/** typename, groupname, or a generic parameter standing for one */
function fieldFromRef(ref: Extract<CddlType2, { kind: 'ref' }>, ctx: Context, at: At): CborField {
  const bound = at.scope?.get(ref.name)
  if (bound) return fieldFromType1(bound.node, ctx, { ...at, scope: bound.scope })

  const shorthand = PRELUDE_SHORTHAND[ref.name]
  if (shorthand && !ctx.schema.rules.has(ref.name)) return shorthand(base(ctx, ref, at))

  const definitions = definitionsOf(ctx.schema, ref.name)
  if (definitions.length == 0) return unsupported(ctx, ref, at, 'unsupported')

  // a rule reached while it is still being resolved describes an endless value
  if (ctx.stack.includes(ref.name)) return unsupported(ctx, ref, at, 'recursive')

  const scope = bindGenerics(definitions[0], ref.genericArgs, at)
  ctx.stack.push(ref.name)
  try {
    const field = fieldFromDefinitions(definitions, ctx, { ...at, scope, depth: at.depth + 1 })
    // the name reads better than the body it stands for
    return { ...field, type: sourceOf(ctx, ref), hint: field.hint ?? hintOf(ctx, ref) }
  } finally {
    ctx.stack.pop()
  }
}

/** `{ ... }` and `[ ... ]`; `//` inside them offers whole groups as alternatives */
function fieldFromContainer(node: CddlMapType | CddlArrayType, ctx: Context, at: At): CborField {
  const kind = node.kind
  const common = base(ctx, node, at)
  const choices = node.group.choices

  if (choices.length <= 1) {
    return { kind, ...common, entries: entriesOfChoice(choices[0] ?? [], ctx, at, kind) }
  }
  const options = choices.map<CborField>((choice, index) => {
    const path = `${at.path}/${index}`
    return { kind, ...common, path, entries: entriesOfChoice(choice, ctx, { ...at, path }, kind) }
  })
  return { kind: 'choice', ...common, options }
}

/** `~name`: the members of the referenced map or array, inlined here */
function fieldFromUnwrap(unwrap: Extract<CddlType2, { kind: 'unwrap' }>, ctx: Context, at: At): CborField {
  const field = fieldFromRef(unwrap.ref, ctx, at)
  if (field.kind != 'map' && field.kind != 'array') return unsupported(ctx, unwrap, at, 'unsupported')
  return { ...field, type: sourceOf(ctx, unwrap) }
}

/** `&(...)` or `&groupname`: the values of a group, as the set they stand for */
function fieldFromEnum(node: Extract<CddlType2, { kind: 'enum' }>, ctx: Context, at: At): CborField {
  const group = node.group.kind == 'group'
    ? node.group
    : groupOfRule(definitionsOf(ctx.schema, node.group.name)[0])
  if (!group) return unsupported(ctx, node, at, 'unsupported')

  const options: { label: string, value: unknown }[] = []
  for (const entry of group.choices.flat()) {
    if (entry.kind != 'entry') return unsupported(ctx, node, at, 'unsupported')
    const target = entry.value.alternatives[0]?.target
    if (target?.kind != 'value') return unsupported(ctx, node, at, 'unsupported')
    options.push({ label: labelOfEntry(entry) ?? target.raw, value: literalOf(target) })
  }
  if (options.length == 0) return unsupported(ctx, node, at, 'unsupported')
  return { kind: 'enum', ...base(ctx, node, at), options }
}

/** `#N` and `#N.ai`: a major type, sometimes narrowed by its head number */
function fieldFromMajor(node: Extract<CddlType2, { kind: 'major' }>, ctx: Context, at: At): CborField {
  const common = base(ctx, node, at)
  switch (node.major) {
    case 0:
      return { kind: 'number', ...common, integer: true, min: 0 }
    case 1:
      return { kind: 'number', ...common, integer: true, max: -1 }
    case 2:
      return { kind: 'bytes', ...common }
    case 3:
      return { kind: 'text', ...common }
    case 4:
      return { kind: 'array', ...common, entries: [openEntry(at, 0, anyField(ctx, node, at))] }
    case 5:
      return {
        kind: 'map',
        ...common,
        entries: [openEntry(at, 0, anyField(ctx, node, at), anyField(ctx, node, at))],
      }
    case 7:
      return fieldFromSimple(node, ctx, at)
    default:
      // major 6 is a tag with no type given for its content
      return { kind: 'any', ...common }
  }
}

function fieldFromSimple(node: Extract<CddlType2, { kind: 'major' }>, ctx: Context, at: At): CborField {
  const common = base(ctx, node, at)
  if (typeof node.ai != 'bigint') return { kind: 'any', ...common }
  switch (Number(node.ai)) {
    case 20:
      return { kind: 'const', ...common, value: false, label: 'false' }
    case 21:
      return { kind: 'const', ...common, value: true, label: 'true' }
    case 22:
      return { kind: 'const', ...common, value: null, label: 'null' }
    case 23:
      return { kind: 'const', ...common, value: undefined, label: 'undefined' }
    case 25:
    case 26:
    case 27:
      return { kind: 'number', ...common, integer: false }
    default:
      return { kind: 'const', ...common, value: simpleValue(Number(node.ai)), label: `simple(${node.ai})` }
  }
}

function entriesOfChoice(
  choice: readonly CddlGroupEntry[],
  ctx: Context,
  at: At,
  container: 'map' | 'array',
): CborEntry[] {
  const entries: CborEntry[] = []
  for (const entry of choice) {
    const inlined = inlineOf(entry, ctx, at, container, entries.length)
    if (inlined) {
      entries.push(...inlined)
      continue
    }
    entries.push(entryOf(entry as Extract<CddlGroupEntry, { kind: 'entry' }>, ctx, at, container, entries.length))
  }
  return entries
}

/**
 * The members an entry contributes to its container rather than holding itself:
 * an inline `( ... )` group, or a bare reference to a group rule.
 */
function inlineOf(
  entry: CddlGroupEntry,
  ctx: Context,
  at: At,
  container: 'map' | 'array',
  index: number,
): CborEntry[] | null {
  const inline = entry.kind == 'entry-group' ? { group: entry.group, name: null } : groupRefOf(entry, ctx)
  if (!inline) return null

  if (inline.name) ctx.stack.push(inline.name)
  try {
    const occur = occurOf(entry.occur)
    const members = inline.group.choices.length > 1
      ? [groupChoiceEntry(inline.group, ctx, at, container, index)]
      : entriesOfChoice(inline.group.choices[0] ?? [], ctx, { ...at, depth: at.depth + 1 }, container)

    // an optional or repeated group hands its occurrence to each of its members
    if (occur.min == 1 && occur.max == 1) return members
    return members.map(member => ({ ...member, occur }))
  } finally {
    if (inline.name) ctx.stack.pop()
  }
}

/**
 * A member that stands for the members of another rule: a bare `name` naming a
 * group, or `~name` unwrapping the map or the array a name stands for.
 */
function groupRefOf(entry: CddlGroupEntry, ctx: Context): { group: CddlGroup, name: string } | null {
  if (entry.kind != 'entry' || entry.memberKey) return null
  const alternatives = entry.value.alternatives
  if (alternatives.length != 1 || alternatives[0].op) return null

  const target = alternatives[0].target
  const name = target.kind == 'ref' ? target.name : target.kind == 'unwrap' ? target.ref.name : null
  if (name == null || ctx.stack.includes(name)) return null

  const rule = definitionsOf(ctx.schema, name)[0]
  if (!rule) return null
  const group = target.kind == 'unwrap' ? groupOfRule(rule) : rule.body.kind == 'entry-group' ? rule.body.group : undefined
  return group ? { group, name } : null
}

/** An inline group offering `//` alternatives: one entry holding the choice */
function groupChoiceEntry(
  group: CddlGroup,
  ctx: Context,
  at: At,
  container: 'map' | 'array',
  index: number,
): CborEntry {
  const path = `${at.path}/${index}`
  const type = sourceOf(ctx, group)
  const options = group.choices.map<CborField>((choice, choiceIndex) => {
    const optionPath = `${path}/${choiceIndex}`
    return {
      kind: container,
      path: optionPath,
      type,
      entries: entriesOfChoice(choice, ctx, { ...at, path: optionPath, depth: at.depth + 1 }, container),
    }
  })
  return {
    path,
    label: 'choice',
    value: { kind: 'choice', path, type, options },
    occur: ONCE,
  }
}

function entryOf(
  entry: Extract<CddlGroupEntry, { kind: 'entry' }>,
  ctx: Context,
  at: At,
  container: 'map' | 'array',
  index: number,
): CborEntry {
  const name = labelOfEntry(entry)
  const path = `${at.path}.${name ?? index}`
  const value = fieldFromType(entry.value, ctx, { ...at, path, depth: at.depth + 1 })
  const occur = occurOf(entry.occur)
  const hint = hintOf(ctx, entry)

  // inside an array a key, when written at all, only documents the position, so
  // an unnamed item goes by the type it is: 'line', not '0'
  if (container == 'array') return { path, label: name ?? value.type ?? `${index}`, value, occur, hint }

  const key = keyOf(entry, ctx, { ...at, path })
  const label = name ?? (key.kind == 'fixed' ? key.label : 'entry')
  return { path, label, key, value, occur, hint }
}

function keyOf(
  entry: Extract<CddlGroupEntry, { kind: 'entry' }>,
  ctx: Context,
  at: At,
): CborEntryKey {
  const memberKey = entry.memberKey
  const path = `${at.path}#key`
  if (!memberKey) return { kind: 'open', field: { kind: 'any', path, type: 'any' } }
  if (memberKey.kind == 'bareword') return { kind: 'fixed', value: memberKey.key, label: memberKey.key }
  if (memberKey.kind == 'value') return { kind: 'fixed', value: literalOf(memberKey.key), label: memberKey.key.raw }

  const target = memberKey.key.target
  if (target.kind == 'value') return { kind: 'fixed', value: literalOf(target), label: target.raw }
  return { kind: 'open', field: fieldFromType1(memberKey.key, ctx, { ...at, path, depth: at.depth + 1 }) }
}

/** An entry the schema leaves open: any key, any number of times */
function openEntry(at: At, index: number, value: CborField, key?: CborField): CborEntry {
  const path = `${at.path}.${index}`
  return {
    path,
    label: key ? 'entry' : `${index}`,
    key: key ? { kind: 'open', field: key } : undefined,
    value,
    occur: { min: 0 },
  }
}

/** `from..to`: the values between two bounds, whatever the ends are written as */
function withRange(
  field: CborField,
  from: CddlType2,
  to: CddlType2,
  inclusive: boolean,
  ctx: Context,
  type: string,
): CborField {
  const min = literalOfType2(from, ctx)
  const last = literalOfType2(to, ctx)
  if (typeof min != 'number' || typeof last != 'number') return { ...field, type }

  const max = inclusive ? last : last - 1
  return {
    kind: 'number',
    path: field.path,
    type,
    hint: field.hint,
    tags: field.tags,
    integer: Number.isInteger(min) && Number.isInteger(max),
    min,
    max,
  }
}

/** The lengths `.size (a..b)` allows, when that is how the bound is written */
function lengthsOf(controller: CddlType2, ctx: Context): { min: number, max: number } | undefined {
  if (controller.kind != 'paren') return undefined
  const range = controller.type.alternatives[0]
  if (range?.op?.kind != 'range' || !range.controller) return undefined

  const from = literalOfType2(range.target, ctx)
  const to = literalOfType2(range.controller, ctx)
  if (typeof from != 'number' || typeof to != 'number') return undefined
  return { min: from, max: range.op.inclusive ? to : to - 1 }
}

function withControl(field: CborField, name: string, controller: CddlType2, ctx: Context): CborField {
  const value = literalOfType2(controller, ctx)
  const asNumber = typeof value == 'number' ? value : undefined

  // the parser hands over the operator without its dot
  switch (name.replace(/^\./, '')) {
    case 'size': {
      // `.size 16` is a length, exactly; a range of lengths is written out as
      // `.size (0..16)`
      const length = asNumber != null ? { min: asNumber, max: asNumber } : lengthsOf(controller, ctx)
      if (!length) return field
      if (field.kind == 'text' || field.kind == 'bytes') {
        return { ...field, minLength: length.min, maxLength: length.max }
      }
      // on a number `.size` bounds the width of its encoding
      if (field.kind == 'number') return { ...field, min: field.min ?? 0, max: 256 ** length.max - 1 }
      return field
    }
    case 'regexp':
    case 'pcre':
      return field.kind == 'text' && typeof value == 'string' ? { ...field, pattern: value } : field
    case 'lt':
      return field.kind == 'number' && asNumber != null ? { ...field, max: asNumber - 1 } : field
    case 'le':
      return field.kind == 'number' && asNumber != null ? { ...field, max: asNumber } : field
    case 'gt':
      return field.kind == 'number' && asNumber != null ? { ...field, min: asNumber + 1 } : field
    case 'ge':
      return field.kind == 'number' && asNumber != null ? { ...field, min: asNumber } : field
    case 'eq':
      return {
        kind: 'const',
        path: field.path,
        type: field.type,
        hint: field.hint,
        tags: field.tags,
        value,
        label: sourceOf(ctx, controller),
      }
    case 'default':
      return { ...field, defaultValue: value }
    default:
      // `.cbor`, `.bits`, `.within`, `.and`, and anything newer: the value still stands
      return field
  }
}

function asChoice(options: CborField[], at: At): CborField {
  if (options.length == 1) return options[0]
  if (options.length == 0) return { kind: 'any', path: at.path, type: 'any', reason: 'unsupported' }

  const type = options.map(option => option.type).join(' / ')
  // a choice between literals is a set of values, which reads as a single control
  if (options.every(option => option.kind == 'const')) {
    const constants = options as CborConstField[]
    return {
      kind: 'enum',
      path: at.path,
      type,
      options: constants.map(option => ({ label: option.label, value: option.value })),
    }
  }
  return { kind: 'choice', path: at.path, type, options }
}

function bindGenerics(rule: CddlRule, args: readonly CddlType1[] | undefined, at: At): Scope {
  if (!rule.generics?.length || !args?.length) return null
  const scope = new Map<string, Binding>()
  rule.generics.forEach((name, index) => {
    const node = args[index]
    if (node) scope.set(name, { node, scope: at.scope })
  })
  return scope
}

function definitionsOf(schema: CompiledSchema, name: string): readonly CddlRule[] {
  const rules = schema.rules.get(name)
  if (rules?.length) return rules
  const prelude = getPreludeRules().get(name)
  return prelude ? [prelude] : []
}

function base(ctx: Context, node: Span, at: At) {
  return { path: at.path, type: sourceOf(ctx, node), hint: hintOf(ctx, node) }
}

function anyField(ctx: Context, node: Span, at: At): CborField {
  return { kind: 'any', ...base(ctx, node, at) }
}

function unsupported(ctx: Context, node: Span, at: At, reason: 'recursive' | 'unsupported'): CborAnyField {
  return { kind: 'any', ...base(ctx, node, at), reason }
}

function occurOf(occur?: CddlOccur): CborOccur {
  if (!occur) return ONCE
  switch (occur.marker) {
    case '?':
      return { min: 0, max: 1 }
    case '+':
      return { min: 1 }
    case '*':
      return { min: occur.min ?? 0, max: occur.max }
  }
}

function labelOfEntry(entry: Extract<CddlGroupEntry, { kind: 'entry' }>): string | undefined {
  const memberKey = entry.memberKey
  if (!memberKey) return undefined
  if (memberKey.kind == 'bareword') return memberKey.key
  if (memberKey.kind == 'value') return memberKey.key.type == 'text' ? memberKey.key.value : memberKey.key.raw
  const target = memberKey.key.target
  return target.kind == 'value' && target.type == 'text' ? target.value : undefined
}

function groupOfRule(rule?: CddlRule): CddlGroup | undefined {
  if (!rule) return undefined
  if (rule.body.kind == 'entry-group') return rule.body.group
  const target = rule.body.value.alternatives[0]?.target
  if (target?.kind == 'array' || target?.kind == 'map') return target.group
  return undefined
}

function literalOf(value: Extract<CddlType2, { kind: 'value' }>): unknown {
  if (value.type != 'int') return value.value
  return typeof value.value == 'bigint' && isSafe(value.value) ? Number(value.value) : value.value
}

function literalOfType2(type2: CddlType2, ctx: Context): unknown {
  if (type2.kind == 'value') return literalOf(type2)
  if (type2.kind == 'major') return simpleOfMajor(type2)
  if (type2.kind != 'ref') return undefined

  // `true`, `false` and `nil` are prelude names before they are values
  const rule = definitionsOf(ctx.schema, type2.name)[0]
  const target = rule?.body.kind == 'entry' ? rule.body.value.alternatives[0]?.target : undefined
  if (target?.kind == 'value') return literalOf(target)
  return target?.kind == 'major' ? simpleOfMajor(target) : undefined
}

/** The value of a major 7 head number, when it names one */
function simpleOfMajor(node: Extract<CddlType2, { kind: 'major' }>): unknown {
  if (node.major != 7 || typeof node.ai != 'bigint') return undefined
  switch (Number(node.ai)) {
    case 20:
      return false
    case 21:
      return true
    case 22:
      return null
    default:
      return undefined
  }
}

/** A CBOR simple value other than the four the prelude names */
function simpleValue(value: number): unknown {
  return new CBOR.Simple(value)
}

function isSafe(value: bigint): boolean {
  return value <= BigInt(Number.MAX_SAFE_INTEGER) && value >= BigInt(Number.MIN_SAFE_INTEGER)
}

interface Span {
  start: number
  end: number
}

function sourceOf(ctx: Context, node: Span): string {
  const text = ctx.schema.source.slice(node.start, node.end).replace(/\s+/g, ' ').trim()
  return text.length > 60 ? `${text.slice(0, 57)}...` : text
}

/**
 * The comment written with a node: on its line, or on the lines just above it.
 * A schema explains its members in `;` comments, which is the closest thing
 * CDDL has to the help text of a field.
 */
function hintOf(ctx: Context, node: Span): string | undefined {
  const trailing = ctx.schema.comments.find(
    comment => comment.start >= node.end && comment.line == lineOf(ctx.lines, node.end),
  )
  if (trailing) return trailing.text.trim()

  const above: string[] = []
  for (let line = lineOf(ctx.lines, node.start) - 1; line >= 1; line--) {
    const comment = ctx.schema.comments.find(candidate => candidate.line == line)
    if (!comment) break
    // a comment sharing its line with code belongs to that code, not to this node
    if (ctx.schema.source.slice(ctx.lines[line - 1], comment.start).trim().length > 0) break
    above.unshift(comment.text.trim())
  }
  return above.length > 0 ? above.join(' ') : undefined
}

function lineStarts(source: string): number[] {
  const starts = [0]
  for (let i = 0; i < source.length; i++) {
    if (source[i] == '\n') starts.push(i + 1)
  }
  return starts
}

/** The line holding an offset, counted from 1 as the tokenizer does */
function lineOf(starts: number[], offset: number): number {
  let low = 0
  let high = starts.length - 1
  while (low < high) {
    const mid = Math.ceil((low + high) / 2)
    if (starts[mid] <= offset) low = mid
    else high = mid - 1
  }
  return low + 1
}

/**
 * Prelude names whose definition builds a clumsier field than the name itself:
 * `bool` is `false / true`, a choice of two constants rather than a switch.
 */
const PRELUDE_SHORTHAND: Record<string, (common: CborFieldBase) => CborField> = {
  bool: common => ({ kind: 'bool', ...common }),
  int: common => ({ kind: 'number', ...common, integer: true }),
  number: common => ({ kind: 'number', ...common, integer: false }),
  float: common => ({ kind: 'number', ...common, integer: false }),
  'float16-32': common => ({ kind: 'number', ...common, integer: false }),
  'float32-64': common => ({ kind: 'number', ...common, integer: false }),
  integer: common => ({ kind: 'number', ...common, integer: true, big: true }),
  unsigned: common => ({ kind: 'number', ...common, integer: true, big: true, min: 0 }),
  bigint: common => ({ kind: 'number', ...common, integer: true, big: true }),
  biguint: common => ({ kind: 'number', ...common, integer: true, big: true, min: 0 }),
  bignint: common => ({ kind: 'number', ...common, integer: true, big: true, max: -1 }),
}
