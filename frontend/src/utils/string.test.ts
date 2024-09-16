import { describe, expect, it } from "vitest";
import { binaryStringToString, stringToBinaryString } from "./string";




describe('binaryStringToString', () => {

  it('should convert a simple binary string to a UTF-8 string', () => {
    const binaryString = String.fromCharCode(0x48, 0x65, 0x6C, 0x6C, 0x6F); // "Hello" in binary string
    const result = binaryStringToString(binaryString);
    expect(result).toBe('Hello');
  });

  it('should handle binary strings with non-ASCII characters (e.g., cirillico)', () => {
    const binaryString = String.fromCharCode(0xD0, 0x9F, 0xD1, 0x80, 0xD0, 0xB8, 0xD0, 0xBC, 0xD0, 0xB5, 0xD1, 0x80); // "Пример" in binary string
    const result = binaryStringToString(binaryString);
    expect(result).toBe('Пример');
  });

  it('should return an empty string for an empty binary string', () => {
    const binaryString = '';
    const result = binaryStringToString(binaryString);
    expect(result).toBe('');
  });

  it('should handle binary strings with special characters', () => {
    const binaryString = String.fromCharCode(0x21, 0x40, 0x23, 0x24, 0x25, 0x5E); // "!@#$%^" in binary string
    const result = binaryStringToString(binaryString);
    expect(result).toBe('!@#$%^');
  });

});

describe('stringToBinaryString', () => {

  it('should convert a simple string to a binary string', () => {
    const input = 'Hello';
    const expectedBinaryString = String.fromCharCode(0x48, 0x65, 0x6C, 0x6C, 0x6F); // "Hello" in binary
    const result = stringToBinaryString(input);
    expect(result).toBe(expectedBinaryString);
  });

  it('should handle strings with non-ASCII characters (e.g., cirillico)', () => {
    const input = 'Пример';
    const expectedBinaryString = String.fromCharCode(0xD0, 0x9F, 0xD1, 0x80, 0xD0, 0xB8, 0xD0, 0xBC, 0xD0, 0xB5, 0xD1, 0x80); // "Пример" in binary
    const result = stringToBinaryString(input);
    expect(result).toBe(expectedBinaryString);
  });

  it('should return an empty binary string for an empty input string', () => {
    const input = '';
    const result = stringToBinaryString(input);
    expect(result).toBe('');
  });

  it('should handle strings with special characters', () => {
    const input = '!@#$%^';
    const expectedBinaryString = String.fromCharCode(0x21, 0x40, 0x23, 0x24, 0x25, 0x5E); // "!@#$%^" in binary
    const result = stringToBinaryString(input);
    expect(result).toBe(expectedBinaryString);
  });

});
