import { ProtobufValidator } from './validation'
import type { SchemaMapping } from './TopicTrie'

const MAX_TOPIC_DEPTH = 20

export interface CandidateTrieNode {
  children: Map<string, CandidateTrieNode>
  wildcard?: CandidateTrieNode
  mappings: SchemaMapping[]
  isTerminal: boolean
  useCount: number
}

const node = (): CandidateTrieNode => ({ children: new Map(), mappings: [], isTerminal: false, useCount: 0 })
const sameType = (mapping: SchemaMapping, schema: string, messageType: string) =>
  mapping.schema === schema && mapping.messageType === messageType

/** Ordered type candidates, with exact subjects taking precedence over learned patterns. */
export class CandidateTopicTrie {
  private root = node()

  /** Automatic learning appends; an explicit preference moves a candidate to the front. */
  insert(topic: string, schema: string, messageType: string, prefer = false): boolean {
    const validation = ProtobufValidator.validateAndSanitizeAll(topic, schema, messageType)
    if (!validation.isValid || !validation.sanitized) throw new Error(validation.error)
    const clean = validation.sanitized
    const segments = clean.topic.split('.')
    if (segments.length > MAX_TOPIC_DEPTH) return false

    let current = this.root
    for (const segment of segments) {
      if (!current.children.has(segment)) current.children.set(segment, node())
      current = current.children.get(segment)!
    }
    const index = current.mappings.findIndex(mapping => sameType(mapping, clean.schema, clean.messageType))
    if (index >= 0) {
      const candidate = current.mappings[index]
      if (candidate.confidence === 1 && (!prefer || index === 0)) return false
      candidate.confidence = 1
      if (prefer && index > 0) {
        current.mappings.splice(index, 1)
        current.mappings.unshift(candidate)
      }
    } else {
      const candidate = { schema: clean.schema, messageType: clean.messageType, confidence: 1 }
      if (prefer) current.mappings.unshift(candidate)
      else current.mappings.push(candidate)
    }
    current.isTerminal = true
    current.useCount++
    return true
  }

  lookup(topic: string): SchemaMapping[] | null {
    return this.findMatchingNode(topic)?.mappings ?? null
  }

  private findMatchingNode(topic: string): CandidateTrieNode | undefined {
    if (!ProtobufValidator.validateTopic(topic).isValid) return undefined
    const segments = topic.trim().split('.')
    if (segments.length > MAX_TOPIC_DEPTH) return undefined

    let exact: CandidateTrieNode | undefined = this.root
    for (const segment of segments) exact = exact?.children.get(segment)
    if (exact?.mappings.length) return exact

    const matches: { node: CandidateTrieNode, specificity: number }[] = []
    const visit = (current: CandidateTrieNode, index: number, exactSegments: number) => {
      if (index === segments.length) {
        if (current.mappings.length) matches.push({
          node: current,
          specificity: exactSegments * 10 + Math.max(...current.mappings.map(mapping => mapping.confidence)) * 5,
        })
        return
      }
      const child = current.children.get(segments[index])
      if (child) visit(child, index + 1, exactSegments + 1)
      if (current.wildcard) visit(current.wildcard, index + 1, exactSegments)
    }
    visit(this.root, 0, 0)
    matches.sort((a, b) => b.specificity - a.specificity)
    return matches[0]?.node
  }

  createPattern(topics: string[], schema: string, messageType: string): void {
    if (topics.length < 2) return
    const segments = topics.map(topic => topic.split('.'))
    const length = Math.min(...segments.map(parts => parts.length))
    if (!length || length > MAX_TOPIC_DEPTH) return
    let current = this.root
    let exactSegments = 0
    for (let i = 0; i < length; i++) {
      const values = new Set(segments.map(parts => parts[i]))
      if (values.size === 1) {
        const segment = segments[0][i]
        if (!current.children.has(segment)) current.children.set(segment, node())
        current = current.children.get(segment)!
        exactSegments++
      } else {
        current.wildcard ??= node()
        current = current.wildcard
      }
    }
    // Pattern learning never changes a candidate's established priority.
    if (!current.mappings.some(mapping => sameType(mapping, schema, messageType))) {
      current.mappings.push({
        schema, messageType,
        confidence: Math.min(0.9, 0.3 + (exactSegments / length) * 0.6),
        examples: topics.slice(0, 5),
      })
      current.isTerminal = true
    }
  }

  /** Low-level maintenance; a mismatch on a mixed-type subject must not call this. */
  updateConfidence(topic: string, success: boolean): void {
    const candidate = this.findMatchingNode(topic)?.mappings[0]
    if (candidate) candidate.confidence = success
      ? Math.min(1, candidate.confidence + 0.05)
      : Math.max(0.1, candidate.confidence - 0.15)
  }

  cleanup(minConfidence = 0.2): void {
    const clean = (current: CandidateTrieNode): boolean => {
      for (const [segment, child] of current.children) {
        if (clean(child)) current.children.delete(segment)
      }
      if (current.wildcard && clean(current.wildcard)) current.wildcard = undefined
      current.mappings = current.mappings.filter(mapping => mapping.confidence >= minConfidence)
      current.isTerminal = current.mappings.length > 0
      return !current.isTerminal && !current.children.size && !current.wildcard
    }
    clean(this.root)
  }

  getRoot(): CandidateTrieNode { return this.root }
  setRoot(root: CandidateTrieNode): void { this.root = root }

  getStats(): { nodes: number, terminals: number, patterns: number } {
    const stats = { nodes: 0, terminals: 0, patterns: 0 }
    const visit = (current: CandidateTrieNode) => {
      stats.nodes++
      if (current.isTerminal) {
        stats.terminals++
        if (current.mappings.some(mapping => mapping.confidence < 1)) stats.patterns++
      }
      current.children.forEach(visit)
      if (current.wildcard) visit(current.wildcard)
    }
    visit(this.root)
    return stats
  }
}
