import { describe, test, expect, beforeEach, it } from 'vitest'
import { TopicTrie } from './TopicTrie'

describe('Confidence Algorithms', () => {
  let trie: TopicTrie

  beforeEach(() => {
    trie = new TopicTrie()
  })

  describe('Pattern Confidence Calculation', () => {
    it('should calculate correct confidence for exact match patterns', () => {
      const topics = ['user.events.created', 'user.events.updated']
      trie.createPattern(topics, 'UserSchema', 'Event')
      
      const result = trie.lookup('user.events.deleted')
      expect(result?.confidence).toBeCloseTo(0.7, 1)
    })

    it('should calculate lower confidence for wildcard patterns', () => {
      const topics = ['user.123.events.created', 'user.456.events.created'] 
      trie.createPattern(topics, 'UserSchema', 'Event')
      
      const result = trie.lookup('user.789.events.created')
      expect(result?.confidence).toBeLessThan(0.9)
      expect(result?.confidence).toBeGreaterThan(0.3)
    })

    it('should prioritize exact matches over patterns', () => {
      trie.insert('user.123.events.created', 'ExactSchema', 'ExactEvent')
      trie.createPattern(['user.456.events.created', 'user.789.events.created'], 'PatternSchema', 'PatternEvent')
      
      const result = trie.lookup('user.123.events.created')
      expect(result?.schema).toBe('ExactSchema')
      expect(result?.confidence).toBe(1.0)
    })
  })

  describe('Confidence Updates', () => {
    beforeEach(() => {
      trie.insert('user.events.created', 'UserSchema', 'CreateEvent')
    })

    it('should increase confidence on successful decode', () => {
      const initialResult = trie.lookup('user.events.created')
      const initialConfidence = initialResult?.confidence || 1.0
      
      if (initialConfidence < 1.0) {
        trie.updateConfidence('user.events.created', true)
        
        const updatedResult = trie.lookup('user.events.created') 
        expect(updatedResult?.confidence).toBeGreaterThan(initialConfidence)
        expect(updatedResult?.confidence).toBeLessThanOrEqual(1.0)
      } else {
        expect(initialConfidence).toBe(1.0)
      }
    })

    it('should decrease confidence on failed decode', () => {
      const initialResult = trie.lookup('user.events.created')
      const initialConfidence = initialResult?.confidence || 0
      
      trie.updateConfidence('user.events.created', false)
      
      const updatedResult = trie.lookup('user.events.created')
      expect(updatedResult?.confidence).toBeLessThan(initialConfidence)
      expect(updatedResult?.confidence).toBeGreaterThanOrEqual(0.1)
    })

    it('should not exceed maximum confidence bounds', () => {
      for (let i = 0; i < 10; i++) {
        trie.updateConfidence('user.events.created', true)
      }
      
      const result = trie.lookup('user.events.created')
      expect(result?.confidence).toBeLessThanOrEqual(1.0)
    })

    it('should not go below minimum confidence bounds', () => {
      for (let i = 0; i < 20; i++) {
        trie.updateConfidence('user.events.created', false)
      }
      
      const result = trie.lookup('user.events.created')
      expect(result?.confidence).toBeGreaterThanOrEqual(0.1)
    })
  })

  describe('Specificity Scoring', () => {
    it('should prefer more specific patterns', () => {
      trie.createPattern(['user.events.created', 'user.events.updated'], 'UserSchema', 'Event')
      trie.createPattern(['user.123.events.created', 'user.456.events.created'], 'UserIdSchema', 'IdEvent')
      
      const result = trie.lookup('user.events.created')
      expect(result?.schema).toBe('UserSchema')
    })

    it('should handle multiple wildcard levels correctly', () => {
      trie.createPattern(['a.1.x.created', 'a.2.x.created'], 'Schema1', 'Type1')
      trie.createPattern(['a.1.y.created', 'a.1.z.created'], 'Schema2', 'Type2') 
      
      const result1 = trie.lookup('a.3.x.created')
      const result2 = trie.lookup('a.1.w.created')
      
      expect(result1?.schema).toBe('Schema1')
      expect(result2?.schema).toBe('Schema2')
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty trie gracefully', () => {
      const result = trie.lookup('any.topic.here')
      expect(result).toBeNull()
    })

    it('should handle malformed topics', () => {
      const invalidTopics = ['', '.', '..', 'topic.', '.topic', 'topic..subtopic']
      
      invalidTopics.forEach(topic => {
        const result = trie.lookup(topic)
        expect(result).toBeNull()
      })
    })

    it('should handle very deep topics within limits', () => {
      const deepTopic = 'a'.repeat(10).split('').join('.')
      trie.insert(deepTopic, 'DeepSchema', 'DeepType')
      
      const result = trie.lookup(deepTopic)
      expect(result).not.toBeNull()
      expect(result?.schema).toBe('DeepSchema')
    })

    it('should reject topics exceeding depth limits', () => {
      const veryDeepTopic = 'a'.repeat(25).split('').join('.')
      
      expect(() => {
        trie.insert(veryDeepTopic, 'Schema', 'Type')
      }).not.toThrow()
      
      const result = trie.lookup(veryDeepTopic)
      expect(result).toBeNull()
    })
  })

  describe('Statistics and Cleanup', () => {
    it('should maintain accurate statistics', () => {
      trie.insert('topic1', 'Schema1', 'Type1')
      trie.insert('topic2', 'Schema2', 'Type2') 
      trie.createPattern(['pattern.1', 'pattern.2'], 'PatternSchema', 'PatternType')
      
      const stats = trie.getStats()
      expect(stats.terminals).toBeGreaterThanOrEqual(2)
      expect(stats.patterns).toBeGreaterThanOrEqual(1)
      expect(stats.nodes).toBeGreaterThan(stats.terminals)
    })

    it('should clean up low confidence patterns', () => {
      trie.insert('test.topic', 'TestSchema', 'TestType')
      
      for (let i = 0; i < 10; i++) {
        trie.updateConfidence('test.topic', false)
      }
      
      trie.cleanup(0.3)
      
      const result = trie.lookup('test.topic')
      expect(result).toBeNull()
    })
  })
})