
import { TopicTrie, TrieNode, SchemaMapping } from './TopicTrie'
import { ProtobufValidator, MAX_TOPIC_LENGTH, MAX_SCHEMA_LENGTH, MAX_MESSAGE_TYPE_LENGTH } from './validation'

const STORAGE_KEY = 'nats-protobuf-patterns'
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

export class ProtobufTopicCache {
  private trie = new TopicTrie()
  private saveOnUnload = () => this.save()
  
  constructor() {
    this.load()
    
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', this.saveOnUnload)
    }
  }
  
  dispose(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('beforeunload', this.saveOnUnload)
    }
  }
  
  lookup(topic: string): SchemaMapping | null {
    return this.trie.lookup(topic)
  }
  
  onSuccessfulDecode(topic: string, schema: string, messageType: string): void {
    const validation = ProtobufValidator.validateAndSanitizeAll(topic, schema, messageType)
    if (!validation.isValid) {
      console.warn('Invalid input for onSuccessfulDecode:', validation.error, { topic, schema, messageType })
      return
    }
    
    if (!validation.sanitized) {
      console.error('Validation passed but sanitized data is missing for onSuccessfulDecode')
      return
    }
    
    const { topic: sanitizedTopic, schema: sanitizedSchema, messageType: sanitizedMessageType } = validation.sanitized
    
    try {
      this.trie.insert(sanitizedTopic, sanitizedSchema, sanitizedMessageType)
      this.learnPatterns(sanitizedTopic, sanitizedSchema, sanitizedMessageType)
      this.save()
    } catch (error) {
      console.warn('Failed to cache successful decode:', error)
    }
  }
  
  onDecodeFailed(topic: string): void {
    const validation = ProtobufValidator.validateTopic(topic)
    if (!validation.isValid) {
      console.warn('Invalid topic for onDecodeFailed:', validation.error, { topic })
      return
    }
    
    this.trie.updateConfidence(topic, false)
    this.save()
  }
  
  handleConflict(topic: string, correctSchema: string, correctType: string): void {
    const validation = ProtobufValidator.validateAndSanitizeAll(topic, correctSchema, correctType)
    if (!validation.isValid) {
      console.warn('Invalid input for handleConflict:', validation.error, { topic, correctSchema, correctType })
      return
    }
    
    if (!validation.sanitized) {
      console.error('Validation passed but sanitized data is missing for onSuccessfulDecode')
      return
    }
    
    const { topic: sanitizedTopic, schema: sanitizedSchema, messageType: sanitizedMessageType } = validation.sanitized
    
    this.trie.updateConfidence(sanitizedTopic, false)
    this.trie.insert(sanitizedTopic, sanitizedSchema, sanitizedMessageType)
    
    this.save()
  }
  
  private learnPatterns(topic: string, schema: string, messageType: string): void {
    const stats = this.trie.getStats()
    
    if (stats.terminals < MIN_TERMINALS_FOR_PATTERN_LEARNING || stats.patterns / stats.terminals > MAX_PATTERN_TO_TERMINAL_RATIO) {
      return
    }
    
    const similarTopics = this.findSimilarTopics(topic, schema, messageType)
    
    if (similarTopics.length >= MIN_SIMILAR_TOPICS_FOR_PATTERN) {
      const allTopics = [...similarTopics, topic]
      
      this.trie.createPattern(allTopics, schema, messageType)
      
    }
  }
  
  private findSimilarTopics(currentTopic: string, schema: string, messageType: string): string[] {
    const similarTopics: string[] = []
    const root = this.trie.getRoot()
    
    // Traverse the entire trie to find all topics with same schema/messageType
    const traverseNode = (node: any, path: string[] = []) => {
      if (node.isTerminal && node.mapping) {
        const mapping = node.mapping
        if (mapping.schema === schema && 
            mapping.messageType === messageType && 
            mapping.confidence === 1.0) {
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
    
    traverseNode(root)
    
    return similarTopics
  }
  
  getStats() {
    return this.trie.getStats()
  }
  
  clear(): void {
    this.trie = new TopicTrie()
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY)
    }
  }
  
  private save(): void {
    if (typeof localStorage === 'undefined') return
    
    try {
      const data = this.serialize(this.trie.getRoot())
      localStorage.setItem(STORAGE_KEY, data)
    } catch (error) {
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        this.handleStorageOverflow()
      } else {
        console.warn('Failed to save protobuf cache:', error)
      }
    }
  }
  
  private load(): void {
    if (typeof localStorage === 'undefined') return
    
    try {
      const data = localStorage.getItem(STORAGE_KEY)
      if (data) {
        const root = this.deserialize(data)
        this.trie.setRoot(root)
      }
    } catch (error) {
      localStorage.removeItem(STORAGE_KEY)
    }
  }
  
  private handleStorageOverflow(): void {
    
    try {
      this.reduceExamples(this.trie.getRoot())
      this.save()
    } catch {
      try {
        this.trie.cleanup(CLEANUP_MIN_CONFIDENCE)
        this.save()
      } catch {
      }
    }
  }
  
  private reduceExamples(node: TrieNode): void {
    if (node.mapping?.examples) {
      node.mapping.examples = node.mapping.examples.slice(0, 1)
    }
    
    for (const [, child] of node.children) {
      this.reduceExamples(child)
    }
    
    if (node.wildcard) {
      this.reduceExamples(node.wildcard)
    }
  }
  
  private serialize(root: TrieNode): string {
    const toJSON = (node: TrieNode): SerializedNode => {
      const obj: SerializedNode = {}
      
      if (node.mapping) {
        obj.m = {
          s: node.mapping.schema,
          t: node.mapping.messageType,
          c: node.mapping.confidence
        }
        
        if (node.mapping.examples && node.mapping.examples.length > 0) {
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
    
    const serialized: SerializedTrie = {
      version: STORAGE_VERSION,
      root: toJSON(root)
    }
    
    return JSON.stringify(serialized)
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
        mapping: obj.m ? {
          schema: obj.m.s,
          messageType: obj.m.t,
          confidence: obj.m.c,
          examples: obj.m.e
        } : undefined,
        isTerminal: !!obj.m,
        useCount: 0
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