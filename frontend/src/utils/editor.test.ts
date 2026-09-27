import { describe, expect, it } from "vitest";
import { MSG_FORMAT, toPayload } from "./editor";
import { decodeCborPayload } from "./cbor";
import { stringToBinaryString } from "./string";




describe('toPayload', () => {

  it('should send text formats as UTF-8', () => {
    const result = toPayload('{ "name": "ada" }', MSG_FORMAT.JSON);
    expect(result).toEqual({ payload: stringToBinaryString('{ "name": "ada" }') });
  });

  it('should encode the CBOR format instead of sending its text', () => {
    const result = toPayload('{"name": "ada", "age": 36}', MSG_FORMAT.CBOR);
    expect(result.error).toBeUndefined();
    expect(decodeCborPayload(result.payload).data).toEqual({ name: 'ada', age: 36 });
  });

  it('should report CBOR text it cannot encode, without a payload', () => {
    const result = toPayload('{not valid', MSG_FORMAT.CBOR);
    expect(result.payload).toBeUndefined();
    expect(result.error).toMatch(/^CBOR encode failed: /);
  });

  it('should say a CBOR payload nobody has written yet is not ready', () => {
    const result = toPayload('', MSG_FORMAT.CBOR);
    expect(result.error).toBe('there is nothing to send yet');
    expect(result.payload).toBeUndefined();
  });

});
