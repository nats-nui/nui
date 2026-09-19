import { describe, expect, it } from "vitest"
import { shouldFetchCore, shouldFetchJetStream, shouldWatchCore } from "./fetch"

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
	it("samples a typed name on refresh and never on first connect", () => {
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

describe("shouldWatchCore", () => {
	it("reads a live snapshot only after LISTEN, never because poll is on", () => {
		expect(shouldWatchCore(true, ">", false)).toBe(false)
		expect(shouldWatchCore(true, ">", true)).toBe(true)
		expect(shouldWatchCore(true, "orders.>", false)).toBe(false)
		expect(shouldWatchCore(true, "orders.>", true)).toBe(true)
		expect(shouldWatchCore(false, "orders.>", true)).toBe(false)
	})
})
