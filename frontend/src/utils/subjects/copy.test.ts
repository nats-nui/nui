import { describe, expect, it } from "vitest"
import { leafTitle, statusLines } from "./copy"
import { canListen, isLiteralSubject, sampleHint } from "./filter"

const sample = { filter: "orders.>", listenMs: 2000, heard: 1, truncated: false, subjects: [{ subject: "orders.created", count: 1 }] }
const catalog = { streams: [{ name: "ORDERS", kind: "stream" as const, subjects: [{ subject: "orders", kind: "pattern" as const }] }] }

describe("copy", () => {
	it("stays quiet when core and jetstream are healthy", () => {
		expect(statusLines(sample, catalog, {})).toEqual([])
	})

	it("keeps a partial JetStream list when the read timed out", () => {
		expect(statusLines(null, { ...catalog, error: "timed out", truncated: true })).toEqual(["Could not refresh all JetStream subjects."])
		expect(statusLines(null, {
			error: "timed out",
			streams: [],
		})).toEqual(["Could not load JetStream subjects."])
	})

	it("says JetStream is missing when the server has none", () => {
		expect(statusLines(null, {
			error: "not enabled on this server", streams: [],
		})).toEqual([expect.stringContaining("not enabled on this server")])
	})

	it("explains rejected sample filters", () => {
		expect(sampleHint("orders..created", true)).toMatch(/Invalid subject/)
		expect(sampleHint("_INBOX..", true)).toMatch(/Invalid subject/)
		expect(sampleHint("", true)).toBeNull()
	})

	it("reports capped Core and stored lists separately", () => {
		const lines = statusLines({ ...sample, truncated: true }, null, { stored: { truncated: true } })
		expect(lines).toEqual(["The live sample is incomplete. Try a narrower subject pattern.", "The stored subject list is incomplete."])
	})

	it("reports an oversized stored list once, without claiming that it was empty", () => {
		expect(statusLines(null, null, { orders: { truncated: true, error: "too large" } })).toEqual(["Could not list all stored subjects."])
	})

	it("describes a leaf without adding live and stored numbers together", () => {
		expect(leafTitle("orders.created", 3, [{ name: "ORDERS", count: 40 }])).toBe(
			"orders.created · 3 messages in the live sample · 40 stored in ORDERS",
		)
	})
})

describe("filter", () => {
	it("treats empty as no listen and rejects broken names", () => {
		expect(canListen("  orders.>  ")).toBe(true)
		expect(canListen(">")).toBe(true)
		expect(canListen("*.>")).toBe(true)
		expect(canListen("orders.a*b")).toBe(true)
		expect(isLiteralSubject("orders.a*b,done")).toBe(true)
		expect(isLiteralSubject("orders.*")).toBe(false)
		expect(canListen("")).toBe(false)
		expect(canListen("orders..x")).toBe(false)
		expect(canListen("orders.>.x")).toBe(false)
	})
})
