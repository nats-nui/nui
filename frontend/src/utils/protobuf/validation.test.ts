import { describe, it, expect } from 'vitest'
import { ProtobufValidator } from './validation'

describe('ProtobufValidator.sanitizeIdentifier', () => {
  it('preserves dots in fully-qualified protobuf type names', () => {
    expect(ProtobufValidator.sanitizeIdentifier('my.package.MyMessage'))
      .toBe('my.package.MyMessage')
  })

  it('preserves forward slashes in nested schema paths', () => {
    expect(ProtobufValidator.sanitizeIdentifier('opentelemetry/proto/common/v1/common'))
      .toBe('opentelemetry/proto/common/v1/common')
  })

  it('preserves underscores and hyphens', () => {
    expect(ProtobufValidator.sanitizeIdentifier('my-schema_v1'))
      .toBe('my-schema_v1')
  })

  it('strips characters that are not word/dot/dash/slash', () => {
    expect(ProtobufValidator.sanitizeIdentifier('foo!@#$%^&*()bar'))
      .toBe('foobar')
  })

  it('trims surrounding whitespace', () => {
    expect(ProtobufValidator.sanitizeIdentifier('   foo.bar  '))
      .toBe('foo.bar')
  })
})

describe('ProtobufValidator.validateAndSanitizeAll', () => {
  it('round-trips a dotted protobuf message type without mangling', () => {
    const result = ProtobufValidator.validateAndSanitizeAll(
      'orders.created',
      'order_created',
      'my.package.OrderCreated',
    )
    expect(result.isValid).toBe(true)
    expect(result.sanitized?.messageType).toBe('my.package.OrderCreated')
  })
})
