import { describe, expect, it } from "vitest"
import { shouldFetchCore, shouldFetchJetStream, shouldReadWatch } from "./fetch"

describe("shouldFetchJetStream", () => {
	it("loads once on open and not again on toggle", () => {
		expect(shouldFetchJetStream(true, false, "open")).toBe(true)
		expect(shouldFetchJetStream(true, true, "open")).toBe(false)
		expect(shouldFetchJetStream(true, true, "toggle")).toBe(false)
		expect(shouldFetchJetStream(true, true, "refresh")).toBe(true)
		expect(shouldFetchJetStream(true, true, "poll")).toBe(true)
		expect(shouldFetchJetStream(false, false, "refresh")).toBe(false)
	})
})

describe("shouldFetchCore", () => {
	it("samples a typed name on refresh only", () => {
		expect(shouldFetchCore(true, ">", "open")).toBe(false)
		expect(shouldFetchCore(true, "orders.>", "open")).toBe(false)
		expect(shouldFetchCore(true, ">", "toggle")).toBe(false)
		expect(shouldFetchCore(true, ">", "poll")).toBe(false)
		expect(shouldFetchCore(true, "", "refresh")).toBe(false)
		expect(shouldFetchCore(true, "orders.>", "refresh")).toBe(true)
		expect(shouldFetchCore(true, ">", "refresh")).toBe(true)
		expect(shouldFetchCore(true, "orders..x", "refresh")).toBe(false)
	})
})

describe("shouldReadWatch", () => {
	it("reads a live snapshot only while LISTEN is on", () => {
		expect(shouldReadWatch(true, false)).toBe(false)
		expect(shouldReadWatch(true, true)).toBe(true)
		expect(shouldReadWatch(false, true)).toBe(false)
	})
})
