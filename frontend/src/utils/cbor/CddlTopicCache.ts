import { TopicTrie, TrieNode, SchemaMapping } from '@/utils/protobuf/TopicTrie'
import { ProtobufValidator } from '@/utils/protobuf/validation'

const STORAGE_KEY = 'nats-cddl-patterns'
const STORAGE_VERSION = 1
const CLEANUP_MIN_CONFIDENCE = 0.2
const MIN_TERMINALS_FOR_PATTERN_LEARNING = 5
const MAX_PATTERN_TO_TERMINAL_RATIO = 0.3
const MIN_SIMILAR_TOPICS_FOR_PATTERN = 1

interface SerializedTrie {
  version: number
  root: SerializedNode
}

interface SerializedNode {
  c?: { [segment: string]: SerializedNode }
  w?: SerializedNode
  m?: {
    s: string
    t: string
    c: number
    e?: string[]
  }
}

/** Topic → CDDL schema+rule cache */
export class CddlTopicCache {
  private trie = new TopicTrie()
  private dirty = false
  private saveOnUnload = () => this.save()
  private onStorageChange = (event: StorageEvent) => {
    if (event.storageArea !== localStorage) return
    if (event.key !== null && event.key !== STORAGE_KEY) return
    this.trie = new TopicTrie()
    this.dirty = false
    this.load()
  }

  constructor() {
    this.load()
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
  }

  lookup(topic: string): SchemaMapping | null {
    return this.trie.lookup(topic)
  }

  onSuccessfulDecode(topic: string, schema: string, rule: string): void {
    const validation = ProtobufValidator.validateAndSanitizeAll(topic, schema, rule)
    if (!validation.isValid || !validation.sanitized) return

    const { topic: sanitizedTopic, schema: sanitizedSchema, messageType: sanitizedRule } = validation.sanitized
    try {
      this.trie.insert(sanitizedTopic, sanitizedSchema, sanitizedRule)
      this.learnPatterns(sanitizedTopic, sanitizedSchema, sanitizedRule)
      this.dirty = true
      this.save()
    } catch (error) {
      console.warn('Failed to cache successful CDDL decode:', error)
    }
  }

  onDecodeFailed(topic: string): void {
    const validation = ProtobufValidator.validateTopic(topic)
    if (!validation.isValid) return
    this.trie.updateConfidence(topic, false)
    this.dirty = true
    this.save()
  }

  getStats() {
    return this.trie.getStats()
  }

  clear(): void {
    this.trie = new TopicTrie()
    this.dirty = false
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  private learnPatterns(topic: string, schema: string, rule: string): void {
    const stats = this.trie.getStats()
    if (stats.terminals < MIN_TERMINALS_FOR_PATTERN_LEARNING || stats.patterns / stats.terminals > MAX_PATTERN_TO_TERMINAL_RATIO) {
      return
    }
    const similarTopics = this.findSimilarTopics(topic, schema, rule)
    if (similarTopics.length >= MIN_SIMILAR_TOPICS_FOR_PATTERN) {
      this.trie.createPattern([...similarTopics, topic], schema, rule)
    }
  }

  private findSimilarTopics(currentTopic: string, schema: string, rule: string): string[] {
    const similarTopics: string[] = []
    const traverseNode = (node: TrieNode, path: string[] = []) => {
      if (node.isTerminal && node.mapping) {
        const mapping = node.mapping
        if (mapping.schema === schema && mapping.messageType === rule && mapping.confidence === 1.0) {
          const topicPath = path.join('.')
          if (topicPath !== currentTopic && topicPath.length > 0) {
            similarTopics.push(topicPath)
          }
        }
      }
      if (node.children) {
        for (const [segment, childNode] of node.children) {
          traverseNode(childNode, [...path, segment])
        }
      }
      if (node.wildcard) {
        traverseNode(node.wildcard, [...path, '*'])
      }
    }
    traverseNode(this.trie.getRoot())
    return similarTopics
  }

  private save(): void {
    if (typeof localStorage === 'undefined' || !this.dirty) return
    try {
      localStorage.setItem(STORAGE_KEY, this.serialize(this.trie.getRoot()))
      this.dirty = false
    } catch (error) {
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        this.trie.cleanup(CLEANUP_MIN_CONFIDENCE)
        try {
          localStorage.setItem(STORAGE_KEY, this.serialize(this.trie.getRoot()))
          this.dirty = false
        } catch {
          /* ignore */
        }
      }
    }
  }

  private load(): void {
    if (typeof localStorage === 'undefined') return
    try {
      const data = localStorage.getItem(STORAGE_KEY)
      if (data) {
        this.trie.setRoot(this.deserialize(data))
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  private serialize(root: TrieNode): string {
    const toJSON = (node: TrieNode): SerializedNode => {
      const obj: SerializedNode = {}
      if (node.mapping) {
        obj.m = {
          s: node.mapping.schema,
          t: node.mapping.messageType,
          c: node.mapping.confidence,
        }
        if (node.mapping.examples?.length) {
          obj.m.e = node.mapping.examples
        }
      }
      if (node.children.size > 0) {
        obj.c = {}
        for (const [key, child] of node.children) {
          obj.c[key] = toJSON(child)
        }
      }
      if (node.wildcard) {
        obj.w = toJSON(node.wildcard)
      }
      return obj
    }
    return JSON.stringify({ version: STORAGE_VERSION, root: toJSON(root) } satisfies SerializedTrie)
  }

  private deserialize(data: string): TrieNode {
    const parsed: SerializedTrie = JSON.parse(data)
    if (parsed.version !== STORAGE_VERSION) {
      throw new Error('Version mismatch')
    }
    const fromJSON = (obj: SerializedNode): TrieNode => {
      const node: TrieNode = {
        children: new Map(),
        wildcard: undefined,
        mapping: obj.m
          ? {
              schema: obj.m.s,
              messageType: obj.m.t,
              confidence: obj.m.c,
              examples: obj.m.e,
            }
          : undefined,
        isTerminal: !!obj.m,
        useCount: 0,
      }
      if (obj.c) {
        for (const [key, child] of Object.entries(obj.c)) {
          node.children.set(key, fromJSON(child))
        }
      }
      if (obj.w) {
        node.wildcard = fromJSON(obj.w)
      }
      return node
    }
    return fromJSON(parsed.root)
  }
}
