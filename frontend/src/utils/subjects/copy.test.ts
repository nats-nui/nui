import { describe, expect, it } from "vitest"
import { emptyCopy, jetStreamStatus, coreStatus, coreListenLabel, LEGEND, leafTitle, listenHintCopy, occupiedStatus, coreListenStale, firstListenCopy } from "./copy"
import { canListen, isCatchAll, normalizeListenFilter, validateListenFilter, FILTER_INVALID } from "./filter"

describe("copy", () => {
	it("defines Core and JetStream without assuming the reader knows NATS", () => {
		expect(LEGEND[0]).toMatch(/name a message travels on/i)
		expect(LEGEND[1]).toMatch(/forget/i)
		expect(LEGEND[1]).toMatch(/store/i)
		expect(LEGEND[1]).toMatch(/live/i)
		expect(LEGEND[2]).toMatch(/ALL/)
		expect(LEGEND[2]).toMatch(/>/)
		expect(LEGEND[2]).toMatch(/capped/i)
	})

	it("treats an empty listen as every name", () => {
		expect(coreListenLabel("")).toBe(">")
		expect(coreListenLabel("orders.>")).toBe("orders.>")
	})

	it("does not mix a live listen count with a stored count", () => {
		expect(coreStatus(true, {
			filter: "orders.>", listenMs: 2000, heard: 4, truncated: false, subjects: [],
		})).toBe("Core heard 4 names in 2.0s on orders.>.")
		expect(coreStatus(true, {
			filter: ">", listenMs: 2000, heard: 4, truncated: false, subjects: [],
		})).toBe("Core heard 4 names in 2.0s on every name.")
		expect(jetStreamStatus(true, {
			streams: [{ name: "ORDERS", kind: "stream", subjects: [{ subject: "orders", kind: "pattern" }, { subject: "returns", kind: "pattern" }] }],
		})).toBe("JetStream has 2 names to keep in 1 stream.")
	})

	it("teaches why an empty listen is not a broken server", () => {
		const copy = emptyCopy({
			coreEnabled: true,
			jsEnabled: true,
			core: { filter: ">", listenMs: 2000, heard: 0, truncated: false, subjects: [] },
			js: { streams: [] },
			search: "",
			foundCount: 0,
		})
		expect(copy).toMatch(/forget/i)
		expect(copy).not.toMatch(/snapshot/i)
		expect(copy).not.toMatch(/enumerat/i)
	})

	it("keeps a partial JetStream list when the read timed out", () => {
		expect(jetStreamStatus(true, {
			error: "timed out",
			truncated: true,
			streams: [{ name: "ORDERS", kind: "stream", subjects: [{ subject: "orders", kind: "pattern" }] }],
		})).toMatch(/1 name.*1 stream/i)
		expect(jetStreamStatus(true, {
			error: "timed out",
			streams: [],
		})).toMatch(/not fully read/i)
	})

	it("says JetStream is optional when the server has none", () => {
		expect(jetStreamStatus(true, {
			error: "not enabled on this server", streams: [],
		})).toMatch(/optional/i)
	})

	it("does not call silence a missing list when the read was capped or refused", () => {
		expect(emptyCopy({
			coreEnabled: true, jsEnabled: true,
			core: { filter: ">", listenMs: 2000, heard: 0, truncated: false, subjects: [], error: "not allowed" },
			js: { streams: [] },
			search: "", foundCount: 0,
		})).toMatch(/cannot see/i)
		expect(emptyCopy({
			coreEnabled: false, jsEnabled: true,
			js: { streams: [], truncated: true },
			search: "", foundCount: 0,
		})).toMatch(/not fully read/i)
		expect(emptyCopy({
			coreEnabled: false, jsEnabled: true,
			js: { streams: [], truncated: true },
			search: "", foundCount: 0,
		})).toMatch(/reload/i)
	})

	it("invites LISTEN instead of asking for a prefix first", () => {
		expect(listenHintCopy(FILTER_INVALID)).toMatch(/valid name/i)
		expect(emptyCopy({
			coreEnabled: true, jsEnabled: true,
			js: { streams: [] },
			search: "", foundCount: 0,
		})).toMatch(/LISTEN/)
		expect(firstListenCopy(">", 2000)).toMatch(/every name/)
	})

	it("says the search missed instead of pretending the catalog is empty", () => {
		expect(emptyCopy({
			coreEnabled: true, jsEnabled: true,
			core: { filter: "orders.>", listenMs: 2000, heard: 1, truncated: false, subjects: [{ subject: "orders.created", count: 1 }] },
			js: { streams: [{ name: "ORDERS", kind: "stream", subjects: [{ subject: "orders", kind: "pattern" }] }] },
			search: "zzz", foundCount: 0,
		})).toMatch(/search/i)
	})

	it("mentions a capped stored list after expand", () => {
		expect(occupiedStatus({
			"ORDERS::orders.>": { truncated: true, subjects: [] },
		})).toMatch(/capped/i)
	})

	it("treats a catch-all as discovery, not a mistake", () => {
		expect(coreStatus(true, null, ">")).toMatch(/LISTEN to hear what is moving/)
		expect(coreStatus(true, {
			filter: ">", listenMs: 2000, heard: 12, truncated: true, subjects: [],
		})).toMatch(/capped/i)
	})

	it("asks you to click LISTEN when a narrower name is typed", () => {
		expect(coreStatus(true, null, "orders.>")).toBe("Click LISTEN to sample orders.>.")
		expect(coreStatus(true, null, "")).toMatch(/LISTEN to hear what is moving/)
	})

	it("hides leftover live names when the listen box changes", () => {
		expect(coreListenStale({
			filter: "orders.>", listenMs: 2000, heard: 1, truncated: false, subjects: [],
		}, "devices.>")).toBe(true)
		expect(coreStatus(true, {
			filter: "orders.>", listenMs: 2000, heard: 2, truncated: false, subjects: [],
		}, "devices.>")).toMatch(/LISTEN to sample devices\.>/)
	})

	it("describes a leaf without adding live and stored numbers together", () => {
		expect(leafTitle("orders.created", 3, [{ name: "ORDERS", count: 40 }])).toBe(
			"orders.created · heard 3 times just now · 40 stored in ORDERS",
		)
	})
})

describe("filter", () => {
	it("treats empty and catch-alls as discovery and still rejects broken names", () => {
		expect(normalizeListenFilter("")).toBe(">")
		expect(validateListenFilter("")).toBeNull()
		expect(validateListenFilter(">")).toBeNull()
		expect(validateListenFilter("*.>")).toBeNull()
		expect(canListen("orders.>")).toBe(true)
		expect(canListen("")).toBe(true)
		expect(canListen("orders..x")).toBe(false)
		expect(isCatchAll("")).toBe(true)
		expect(isCatchAll(">")).toBe(true)
		expect(isCatchAll("orders.>")).toBe(false)
	})
})
