import { CandidateTopicTrie, CandidateTrieNode } from './CandidateTopicTrie'
import type { SchemaMapping } from './TopicTrie'

const STORAGE_KEY = 'nats-protobuf-patterns-v2'
const LEGACY_STORAGE_KEY = 'nats-protobuf-patterns'

interface SerializedMapping {
  s: string
  t: string
  c: number
  e?: string[]
}
interface SerializedNode {
  c?: Record<string, SerializedNode>
  w?: SerializedNode
  m?: SerializedMapping[] | SerializedMapping
}

export class ProtobufTopicCache {
  private trie = new CandidateTopicTrie()
  private dirty = false
  private revision = 0
  private listeners = new Set<() => void>()
  private notify = () => {
    this.revision++
    this.listeners.forEach(listener => listener())
  }
  private saveOnUnload = () => this.save()
  private onStorageChange = (event: StorageEvent) => {
    if (event.storageArea !== localStorage || (event.key !== null && event.key !== STORAGE_KEY)) return
    this.trie = new CandidateTopicTrie()
    this.dirty = false
    this.load(false)
    this.notify()
  }

  constructor() {
    this.load(true)
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', this.saveOnUnload)
      window.addEventListener('storage', this.onStorageChange)
    }
  }

  dispose(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('beforeunload', this.saveOnUnload)
      window.removeEventListener('storage', this.onStorageChange)
    }
    this.listeners.clear()
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener)
    return () => { this.listeners.delete(listener) }
  }

  getRevision(): number { return this.revision }
  lookup(topic: string): SchemaMapping[] | null { return this.trie.lookup(topic) }

  /** Only structural changes are persisted/broadcast, not every decoded message. */
  learnCandidate(topic: string, schema: string, messageType: string): void {
    this.remember(topic, schema, messageType, false)
  }

  preferCandidate(topic: string, schema: string, messageType: string): void {
    this.remember(topic, schema, messageType, true)
  }

  private remember(topic: string, schema: string, messageType: string, prefer: boolean): void {
    try {
      if (!this.trie.insert(topic, schema, messageType, prefer)) return
      this.learnPatterns(topic, schema, messageType)
      this.dirty = true
      this.save()
      this.notify()
    } catch (error) {
      console.warn('Failed to cache protobuf candidate:', error)
    }
  }

  private learnPatterns(topic: string, schema: string, messageType: string): void {
    const stats = this.trie.getStats()
    if (stats.terminals < 5 || stats.patterns / stats.terminals > 0.3) return
    const similar: string[] = []
    const visit = (node: CandidateTrieNode, path: string[]) => {
      if (node.mappings.some(mapping => mapping.schema === schema && mapping.messageType === messageType && mapping.confidence === 1)) {
        const other = path.join('.')
        if (other !== topic) similar.push(other)
      }
      for (const [segment, child] of node.children) visit(child, [...path, segment])
      // Only exact subjects teach patterns; patterns themselves are not observations.
    }
    visit(this.trie.getRoot(), [])
    if (similar.length) this.trie.createPattern([...similar, topic], schema, messageType)
  }

  getStats() { return this.trie.getStats() }

  clear(): void {
    this.trie = new CandidateTopicTrie()
    // Keep a v2 tombstone so old browser data cannot be imported again.
    this.dirty = true
    this.save()
    this.notify()
  }

  private save(): void {
    if (!this.dirty || typeof localStorage === 'undefined') return
    try {
      localStorage.setItem(STORAGE_KEY, this.serialize())
      this.dirty = false
    } catch (error) {
      // Retain the in-memory candidates. A later change or unload can retry;
      // recursively retrying a full localStorage would overflow the call stack.
      console.warn('Failed to save protobuf candidates:', error)
    }
  }

  private load(migrate: boolean): void {
    if (typeof localStorage === 'undefined') return
    try {
      const current = localStorage.getItem(STORAGE_KEY)
      const legacy = current === null && migrate ? localStorage.getItem(LEGACY_STORAGE_KEY) : null
      const data = current ?? legacy
      if (data === null) return
      this.trie.setRoot(this.deserialize(data, legacy !== null ? 1 : 2))
      if (legacy !== null) {
        this.dirty = true
        this.save()
      }
    } catch (error) {
      // Recover with a v2 tombstone, without deleting data still used by old tabs.
      this.trie = new CandidateTopicTrie()
      this.dirty = true
      this.save()
    }
  }

  private serialize(): string {
    const toJSON = (node: CandidateTrieNode): SerializedNode => {
      const result: SerializedNode = {}
      if (node.mappings.length) result.m = node.mappings.map(mapping => ({
        s: mapping.schema, t: mapping.messageType, c: mapping.confidence,
        ...(mapping.examples?.length ? { e: mapping.examples } : {}),
      }))
      if (node.children.size) result.c = Object.fromEntries([...node.children].map(([key, child]) => [key, toJSON(child)]))
      if (node.wildcard) result.w = toJSON(node.wildcard)
      return result
    }
    return JSON.stringify({ version: 2, root: toJSON(this.trie.getRoot()) })
  }

  private deserialize(data: string, version: number): CandidateTrieNode {
    const parsed = JSON.parse(data)
    if (parsed.version !== version || !parsed.root) throw new Error('Invalid protobuf cache version')
    const fromJSON = (obj: SerializedNode): CandidateTrieNode => {
      const entries = obj.m ? (Array.isArray(obj.m) ? obj.m : [obj.m]) : []
      const mappings: SchemaMapping[] = []
      for (const entry of entries) {
        if (typeof entry.s !== 'string' || typeof entry.t !== 'string' || !Number.isFinite(entry.c)) throw new Error('Invalid protobuf candidate')
        if (!mappings.some(mapping => mapping.schema === entry.s && mapping.messageType === entry.t)) {
          mappings.push({ schema: entry.s, messageType: entry.t, confidence: entry.c, ...(entry.e ? { examples: entry.e } : {}) })
        }
      }
      return {
        children: new Map(Object.entries(obj.c ?? {}).map(([key, child]) => [key, fromJSON(child)])),
        wildcard: obj.w ? fromJSON(obj.w) : undefined,
        mappings, isTerminal: mappings.length > 0, useCount: 0,
      }
    }
    return fromJSON(parsed.root)
  }
}
