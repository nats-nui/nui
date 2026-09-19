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
	it("never auto-subscribes — LISTEN is the only sample", () => {
		expect(shouldFetchCore(true, ">", false, "open")).toBe(false)
		expect(shouldFetchCore(true, "", false, "open")).toBe(false)
		expect(shouldFetchCore(true, "orders.>", false, "open")).toBe(false)
		expect(shouldFetchCore(true, ">", false, "toggle")).toBe(false)
		expect(shouldFetchCore(true, ">", false, "refresh")).toBe(false)
		expect(shouldFetchCore(true, ">", true, "refresh")).toBe(false)
	})
})
