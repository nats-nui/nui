/**
 * Demo script to show protobuf cache functionality
 * This can be used to test the cache performance and behavior
 */

import { ProtobufTopicCache } from './ProtobufTopicCache'

function demoProtobufCache() {
  console.log('🚀 Protobuf Topic Cache Demo')
  console.log('============================\n')

  const cache = new ProtobufTopicCache()

  // Simulate message processing
  console.log('📥 Processing messages...\n')

  // First encounters - no cache hits
  console.log('1️⃣ First message on "user.123.events.created"')
  let cached = cache.lookup('user.123.events.created')
  console.log('   Cache lookup:', cached ? `HIT: ${cached.schema}:${cached.messageType}` : 'MISS')
  
  // Simulate successful auto-detection
  console.log('   Auto-detection found: UserSchema:CreateEvent')
  cache.onSuccessfulDecode('user.123.events.created', 'UserSchema', 'CreateEvent')
  
  console.log('2️⃣ Second message on same topic')
  cached = cache.lookup('user.123.events.created')
  console.log('   Cache lookup:', cached ? `HIT: ${cached.schema}:${cached.messageType} (confidence: ${cached.confidence})` : 'MISS')
  
  console.log('\n3️⃣ Similar topic: "user.456.events.created"')
  cached = cache.lookup('user.456.events.created')
  console.log('   Cache lookup:', cached ? `HIT: ${cached.schema}:${cached.messageType} (confidence: ${cached.confidence})` : 'MISS')
  
  // Add similar topic to learn patterns
  cache.onSuccessfulDecode('user.456.events.created', 'UserSchema', 'CreateEvent')
  
  console.log('\n4️⃣ Pattern learned! Testing "user.789.events.created"')
  cached = cache.lookup('user.789.events.created')
  console.log('   Cache lookup:', cached ? `HIT: ${cached.schema}:${cached.messageType} (confidence: ${cached.confidence})` : 'MISS')
  
  // Different pattern
  console.log('\n5️⃣ Different pattern: "admin.system.logs.error"')
  cache.onSuccessfulDecode('admin.system.logs.error', 'LogSchema', 'ErrorLog')
  cached = cache.lookup('admin.system.logs.error')
  console.log('   Cache lookup:', cached ? `HIT: ${cached.schema}:${cached.messageType} (confidence: ${cached.confidence})` : 'MISS')
  
  // Show statistics
  const stats = cache.getStats()
  console.log('\n📊 Cache Statistics:')
  console.log(`   Nodes: ${stats.nodes}`)
  console.log(`   Terminals: ${stats.terminals}`)
  console.log(`   Patterns: ${stats.patterns}`)
  
  console.log('\n✅ Demo completed! Cache is persisted to localStorage.')
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  (window as any).demoProtobufCache = demoProtobufCache
}

export { demoProtobufCache }