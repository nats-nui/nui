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
	it("samples on refresh and never on first connect", () => {
		expect(shouldFetchCore(true, ">", false, "open")).toBe(false)
		expect(shouldFetchCore(true, "orders.>", false, "open")).toBe(false)
		expect(shouldFetchCore(true, ">", false, "toggle")).toBe(false)
		expect(shouldFetchCore(true, ">", false, "poll")).toBe(false)
		expect(shouldFetchCore(true, "orders.>", false, "refresh")).toBe(true)
		expect(shouldFetchCore(true, ">", false, "refresh")).toBe(true)
		expect(shouldFetchCore(true, "orders..x", false, "refresh")).toBe(false)
	})
})

describe("shouldWatchCore", () => {
	it("listens when asked, not because poll opened a catch-all", () => {
		expect(shouldWatchCore(true, ">", false, true)).toBe(false)
		expect(shouldWatchCore(true, ">", true, false)).toBe(true)
		expect(shouldWatchCore(true, "orders.>", false, true)).toBe(true)
		expect(shouldWatchCore(true, "orders.>", false, false)).toBe(false)
		expect(shouldWatchCore(false, "orders.>", true, true)).toBe(false)
	})
})
