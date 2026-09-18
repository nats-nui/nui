import { describe, expect, it } from "vitest"
import { shouldFetchCore, shouldFetchJetStream } from "./fetch"

describe("shouldFetchJetStream", () => {
	it("loads once on open and not again on toggle", () => {
		expect(shouldFetchJetStream(true, false, "open")).toBe(true)
		expect(shouldFetchJetStream(true, true, "open")).toBe(false)
		expect(shouldFetchJetStream(true, true, "toggle")).toBe(false)
		expect(shouldFetchJetStream(true, true, "refresh")).toBe(true)
		expect(shouldFetchJetStream(false, false, "refresh")).toBe(false)
	})
})

describe("shouldFetchCore", () => {
	it("starts discovery on open, including a catch-all", () => {
		expect(shouldFetchCore(true, ">", false, "open")).toBe(true)
		expect(shouldFetchCore(true, "", false, "open")).toBe(true)
		expect(shouldFetchCore(true, "orders.>", false, "open")).toBe(true)
		expect(shouldFetchCore(true, "orders..x", false, "open")).toBe(false)
		expect(shouldFetchCore(true, ">", true, "toggle")).toBe(false)
		expect(shouldFetchCore(true, ">", false, "refresh")).toBe(false)
		expect(shouldFetchCore(true, ">", true, "refresh")).toBe(false)
	})
})
