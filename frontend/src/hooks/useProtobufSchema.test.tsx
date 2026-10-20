import { StrictMode } from 'react'
import { act, create } from 'react-test-renderer'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest'
import * as protobuf from '@/utils/protobuf'
import { ProtoSchema } from '@/types/Protobuf'
import { getTopicCache, forgetProtobufResolutions } from '@/utils/protobuf/resolve'
import ProtobufRow from '@/components/formatters/protobuf/ProtobufRow'
import ProtobufCmp from '@/components/formatters/protobuf/ProtobufCmp'

const context = vi.hoisted(() => ({ schemas: [] as ProtoSchema[], isLoading: false, refreshSchemas: vi.fn() }))
vi.mock('@/contexts/ProtobufSchemaContext', () => ({ useProtobufSchemas: () => context }))
// Monaco needs a DOM; keep the actual card, controls, hooks and row subscription.
vi.mock('@monaco-editor/react', () => ({ Editor: ({ value }: { value: string }) => <pre>{value}</pre> }))

const schema = protobuf.parseProtoSchema('syntax = "proto3"; message A { string name = 1; } message Alias { string nick = 1; } message B { int32 count = 2; }', 'events.proto')
const encode = (type: string, data: object) => String.fromCharCode(...schema.root!.lookupType(type).encode(data).finish())
const a = encode('A', { name: 'Ada' })
const b = encode('B', { count: 42 })
const subject = 'events.created'
let values: Record<string, string> = {}
const storage = {
  getItem: (key: string) => values[key] ?? null,
  setItem: vi.fn((key: string, value: string) => { values[key] = value }),
  removeItem: (key: string) => { delete values[key] },
}
Object.defineProperty(globalThis, 'localStorage', { value: storage, configurable: true })
const previousWindow = globalThis.window
const fakeWindow = new EventTarget()
beforeAll(() => Object.defineProperty(globalThis, 'window', { value: fakeWindow, configurable: true }))
afterAll(() => {
  getTopicCache().dispose()
  Object.defineProperty(globalThis, 'window', { value: previousWindow, configurable: true })
})
let mounted: ReturnType<typeof create>[] = []
function mount(element: React.ReactElement) {
  let renderer: ReturnType<typeof create>
  act(() => { renderer = create(element) })
  mounted.push(renderer!)
  return renderer!
}
const types = (topic = subject) => getTopicCache().lookup(topic)?.map(candidate => candidate.messageType)
const rowText = (tree: ReturnType<typeof create>) => {
  const flatten = (item: any): string => typeof item === 'string' ? item : (item.children ?? []).map(flatten).join('')
  return flatten(tree.root.findByProps({ 'data-testid': 'row' }))
}
function openControls(tree: ReturnType<typeof create>) {
  const button = tree.root.findAllByType('button').find(button => button.children.includes('Change'))
  if (button) act(() => button.props.onClick())
}
function chooseType(tree: ReturnType<typeof create>, type: string) {
  openControls(tree)
  act(() => tree.root.findAllByType('select')[1].props.onChange({ target: { value: type } }))
}
const view = (text = a, topic = subject, card = true) => <StrictMode>
  <section data-testid="row"><ProtobufRow text={text} subject={topic} /></section>
  {card && <ProtobufCmp text={text} subject={topic} />}
</StrictMode>

beforeEach(() => {
  values = {}
  context.schemas = [schema]
  getTopicCache().clear()
  forgetProtobufResolutions()
  storage.setItem.mockClear()
})
afterEach(() => {
  act(() => mounted.splice(0).forEach(tree => tree.unmount()))
  vi.restoreAllMocks()
})

describe('list and detail selection', () => {
  test.each([false, true])('manual choice updates the row with an existing mapping: %s', existing => {
    if (existing) getTopicCache().learnCandidate(subject, schema.name, 'A')
    const tree = mount(view())
    expect(rowText(tree)).toContain('name:')
    chooseType(tree, 'Alias')
    expect(types()).toEqual(['Alias', 'A'])
    expect(rowText(tree)).toContain('nick:')
    act(() => tree.update(view(a, subject, false)))
    act(() => tree.update(view()))
    expect(tree.root.findByType('pre').children.join('')).toContain('"nick"')
  })

  test('rows learn after rendering without update loops', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    mount(view(a, subject, false))
    expect(types()).toEqual(['A'])
    expect(storage.setItem).toHaveBeenCalledTimes(1)
    expect(error.mock.calls.flat().join(' ')).not.toMatch(/Cannot update|Maximum update depth/)
  })

  test('changing subjects or payloads does not carry an old manual override', () => {
    const tree = mount(view())
    chooseType(tree, 'Alias')
    act(() => tree.update(view(b, 'other.created')))
    expect(types('other.created')).toEqual(['B'])
    expect(tree.root.findByType('pre').children.join('')).toContain('"count"')
    expect(types()).toEqual(['Alias', 'A'])
    act(() => tree.update(view(b, subject)))
    expect(types()).toEqual(['Alias', 'A', 'B'])
    expect(tree.root.findByType('pre').children.join('')).toContain('"count"')
  })

  test('a schema change is incomplete until its type is selected', () => {
    const second = protobuf.parseProtoSchema('syntax = "proto3"; message C { string changed = 1; }', 'second.proto')
    context.schemas = [schema, second]
    getTopicCache().learnCandidate(subject, schema.name, 'A')
    const tree = mount(view())
    openControls(tree)
    storage.setItem.mockClear()
    act(() => tree.root.findAllByType('select')[0].props.onChange({ target: { value: second.name } }))
    expect(storage.setItem).not.toHaveBeenCalled()
    expect(tree.root.findAllByType('select')[1].props.value).toBe('')
    chooseType(tree, 'C')
    expect(types()).toEqual(['C', 'A'])
    expect(rowText(tree)).toContain('changed:')
  })

  test('an empty or failed manual decode remains local', () => {
    const tree = mount(view())
    chooseType(tree, 'Missing')
    expect(types()).toEqual(['A'])
    chooseType(tree, 'B')
    expect(types()).toEqual(['A'])
    expect(rowText(tree)).toContain('name:')
  })

  test('unrelated updates do not decode or render a mounted row again', () => {
    const tree = mount(view(a, subject, false))
    const decode = vi.spyOn(protobuf, 'decodeProtobufMessage')
    act(() => getTopicCache().preferCandidate('unrelated.created', schema.name, 'Alias'))
    expect(decode).not.toHaveBeenCalled()
    expect(rowText(tree)).toContain('name:')
  })

  test('a cross-tab mapping update refreshes a mounted row', () => {
    const tree = mount(view(a, subject, false))
    const serialized = JSON.parse(values['nats-protobuf-patterns-v2'])
    serialized.root.c.events.c.created.m.unshift({ s: schema.name, t: 'Alias', c: 1 })
    values['nats-protobuf-patterns-v2'] = JSON.stringify(serialized)
    const event = new Event('storage')
    Object.defineProperties(event, {
      key: { value: 'nats-protobuf-patterns-v2' },
      storageArea: { value: storage },
    })
    act(() => { fakeWindow.dispatchEvent(event) })
    expect(rowText(tree)).toContain('nick:')
  })
})
