import { beforeEach, describe, expect, it, vi } from "vitest"
import { createStore } from "@priolo/jon"

// Use the same ESM entry as the application.
vi.mock("@priolo/jon", () => import("@priolo/jon/dist/index.es.js"))

vi.mock("@/stores/connections", () => ({ default: {} }))
vi.mock("@/stores/docs/utils/factory", () => ({ buildMessageDetail: vi.fn() }))
vi.mock("@/stores/stacks/viewBase", () => ({ default: { state: {}, actions: {}, getters: {} } }))
vi.mock("@/stores/stacks/loadBase", () => ({ default: { state: {}, actions: { fetch: vi.fn(), fetchAbort: vi.fn() } } }))
vi.mock("@/api/subjects", () => ({ default: { jetstream: vi.fn(), core: vi.fn(), watch: vi.fn(), snapshot: vi.fn(), unwatch: vi.fn(), occupied: vi.fn(), last: vi.fn() } }))

import setup from "./index"
import api from "@/api/subjects"
import { DOC_TYPE } from "@/types"
import { flattenHits } from "@/utils/subjects/tree"

function deferred<T>() {
	let resolve: (value: T) => void
	const promise = new Promise<T>(r => { resolve = r })
	return { promise, resolve: (value: T) => resolve(value) }
}
function store() {
	const s: any = createStore(setup)
	s.state = { ...s.state, connectionId: "connection", uuid: "card", filter: "orders.>" }
	return s
}
const catalog = { filter: "orders.>", listenMs: 0, heard: 1, truncated: false, subjects: [{ subject: "orders.created", count: 1 }], watching: true }

beforeEach(() => vi.resetAllMocks())

describe("SUBJECTS requests", () => {
	it("opens without listening and a blank LISTEN never becomes ALL", async () => {
		const s = store()
		s.state.filter = ""
		vi.mocked(api.jetstream).mockResolvedValue({ streams: [] })
		await s.fetchIfVoid()
		await s.listenNow()
		await s.readWatch()
		expect(api.core).not.toHaveBeenCalled()
		expect(api.watch).not.toHaveBeenCalled()
		expect(api.snapshot).not.toHaveBeenCalled()
	})

	it("STOP waits for a pending start and ignores its response", async () => {
		const s = store()
		const pending = deferred<typeof catalog>()
		vi.mocked(api.watch).mockReturnValue(pending.promise)
		const start = s.watchCore()
		await Promise.resolve()
		const stop = s.stopWatch()
		expect(api.unwatch).not.toHaveBeenCalled()
		pending.resolve(catalog)
		await Promise.all([start, stop])
		expect(s.state.coreWatching).toBe(false)
		expect(s.state.core).toBeNull()
		expect(api.unwatch).toHaveBeenCalledWith("connection", "card", expect.anything())
	})

	it("stops a listener after the box is cleared", async () => {
		const s = store()
		s.state.coreWatching = true
		s.state.filter = ""
		await s.listenNow()
		expect(api.unwatch).toHaveBeenCalledOnce()
		expect(s.state.coreWatching).toBe(false)
	})

	it("poll only reads an existing snapshot", async () => {
		const s = store()
		s.state.coreWatching = true
		s.state.jetstreamEnabled = false
		vi.mocked(api.snapshot).mockResolvedValue(catalog)
		await s.readWatch()
		expect(api.watch).not.toHaveBeenCalled()
		expect(api.core).not.toHaveBeenCalled()
		expect(api.snapshot).toHaveBeenCalledOnce()
	})

	it("manual refresh samples the typed name", async () => {
		const s = store()
		s.state.jetstreamEnabled = false
		vi.mocked(api.core).mockResolvedValue({ ...catalog, watching: false })
		await s.fetch()
		expect(api.core).toHaveBeenCalledWith("connection", "orders.>", 2000, true, expect.anything())
		expect(api.watch).not.toHaveBeenCalled()
		expect(api.snapshot).not.toHaveBeenCalled()
	})

	it.each(["", "devices.>"])("keeps the active listener when toggling internals with %s in the box", async filter => {
		const s = store()
		s.state.coreWatching = true
		s.state.watchFilter = "orders.>"
		s.state.filter = filter
		s.state.jetstreamEnabled = false
		vi.mocked(api.watch).mockResolvedValue(catalog)
		await s.toggleNoSysMessages()
		expect(api.watch).toHaveBeenCalledWith("connection", "orders.>", false, "card", expect.anything())
		expect(s.state.filter).toBe(filter)
	})

	it.each(["disposeSubjects", "toggleCore", "stopWatch"])("does not resume a pending filter change after %s", async action => {
		const s = store()
		s.state.core = catalog
		s.state.coreWatching = true
		s.state.watchFilter = "orders.>"
		const pending = deferred<{ streams: [] }>()
		vi.mocked(api.jetstream).mockReturnValue(pending.promise)
		const toggle = s.toggleNoSysMessages()
		await s[action]()
		pending.resolve({ streams: [] })
		await toggle
		expect(api.core).not.toHaveBeenCalled()
		expect(api.watch).not.toHaveBeenCalled()
	})

	it("does not sample when toggling internals while Core is disabled", async () => {
		const s = store()
		s.state.coreEnabled = false
		s.state.core = catalog
		vi.mocked(api.jetstream).mockResolvedValue({ streams: [] })
		await s.toggleNoSysMessages()
		expect(api.core).not.toHaveBeenCalled()
		expect(api.watch).not.toHaveBeenCalled()
	})

	it("applies the internal-message filter to the listener after a concurrent sample", async () => {
		const s = store()
		s.state.coreWatching = true
		s.state.watchFilter = "orders.>"
		const pending = deferred<{ streams: [] }>()
		vi.mocked(api.jetstream).mockReturnValue(pending.promise)
		vi.mocked(api.core).mockResolvedValue({ ...catalog, watching: false })
		vi.mocked(api.watch).mockResolvedValue(catalog)
		const toggle = s.toggleNoSysMessages()
		await s.fetchCore()
		pending.resolve({ streams: [] })
		await toggle
		expect(api.watch).toHaveBeenCalledWith("connection", "orders.>", false, "card", expect.anything())
	})

	it.each([
		{ source: "watch", watching: true }, { source: "watch", watching: false },
		{ source: "snapshot", watching: true }, { source: "snapshot", watching: false },
	] as const)("keeps a newer sample when $source finishes with watching=$watching", async ({ source, watching }) => {
		const s = store()
		s.state.coreWatching = true
		s.state.jetstreamEnabled = false
		const pending = deferred<typeof catalog>()
		vi.mocked(api[source]).mockReturnValue(pending.promise)
		const listener = source == "watch" ? s.watchCore() : s.readWatch()
		await Promise.resolve()
		s.state.filter = "devices.>"
		const sample = { ...catalog, filter: "devices.>", watching: false, subjects: [{ subject: "devices.room", count: 1 }] }
		vi.mocked(api.core).mockResolvedValue(sample)
		await s.fetch()
		pending.resolve({ ...catalog, watching })
		await listener
		expect(api.core).toHaveBeenCalledOnce()
		expect(api[source]).toHaveBeenCalledOnce()
		expect(api.unwatch).not.toHaveBeenCalled()
		expect(s.state.coreWatching).toBe(watching)
		expect(flattenHits({ core: s.state.core, filter: s.state.filter, showCore: true, showJetStream: false }).map(h => h.subject)).toEqual(["devices.room"])
		if (watching) {
			s.state.filter = "orders.>"
			vi.mocked(api.snapshot).mockResolvedValue(catalog)
			await s.readWatch()
			expect(s.state.core).toEqual(catalog)
		}
	})

	it("refreshes message details when only metadata changed", async () => {
		const s = store()
		const old = { subject: "orders", payload: "same", seqNum: 1, headers: { version: ["one"] } }
		const next = { ...old, seqNum: 2, headers: { version: ["two"] } }
		const detail = { state: { type: DOC_TYPE.MESSAGE, message: old }, setMessage: vi.fn() }
		s.state.linked = detail
		vi.mocked(api.last).mockResolvedValue(next)
		await s.openHit({ subject: "orders", streams: [{ name: "ORDERS" }] })
		expect(detail.setMessage).toHaveBeenCalledWith(next)
		expect(s.state.select).toBe("orders")
	})

	it.each(["disposeSubjects", "stopWatch", "toggleCore", "watchCore"])("discards a sample response after %s", async action => {
		const s = store()
		const pending = deferred<typeof catalog>()
		vi.mocked(api.core).mockReturnValue(pending.promise)
		vi.mocked(api.watch).mockResolvedValue(catalog)
		const fetch = s.fetchCore()
		await s[action]()
		const current = s.state.core
		expect(vi.mocked(api.core).mock.calls[0][4].signal.aborted).toBe(true)
		pending.resolve({ ...catalog, subjects: [{ subject: "orders.old", count: 99 }] })
		await fetch
		expect(s.state.core).toEqual(current)
	})

	it("keeps the newer sample when an aborted request resolves last", async () => {
		const s = store()
		const first = deferred<typeof catalog>()
		const second = deferred<typeof catalog>()
		vi.mocked(api.core).mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise)
		const oldRequest = s.fetchCore()
		s.state.filter = "devices.>"
		const newRequest = s.fetchCore()
		const current = { ...catalog, filter: "devices.>", subjects: [{ subject: "devices.room", count: 1 }] }
		second.resolve(current)
		await newRequest
		first.resolve(catalog)
		await oldRequest
		expect(s.state.core).toEqual(current)
	})

	it("discards occupied results from an earlier filter", async () => {
		const s = store()
		const pending = deferred<any>()
		vi.mocked(api.occupied).mockReturnValue(pending.promise)
		const fetch = s.loadOccupied({ subject: "orders", streams: [{ name: "ORDERS", pattern: "orders.>" }] })
		s.state.jetstreamEnabled = false
		await s.toggleNoSysMessages()
		pending.resolve({ stream: "ORDERS", subjects: [{ subject: "$SYS.private", kind: "occupied" }] })
		await fetch
		expect(s.state.occupied).toEqual({})
	})

	it("refreshes previously expanded stored names", async () => {
		const s = store()
		s.state.occupied = { "ORDERS::orders.>": { stream: "ORDERS", subjects: [{ subject: "orders.old", kind: "occupied" }] } }
		vi.mocked(api.jetstream).mockResolvedValue({ streams: [{ name: "ORDERS", kind: "stream", subjects: [{ subject: "orders.>", pattern: "orders.>", kind: "pattern" }] }] })
		vi.mocked(api.occupied).mockResolvedValue({ stream: "ORDERS", subjects: [{ subject: "orders.new", kind: "occupied" }] })
		await s.fetchJetStream()
		expect(s.state.occupied["ORDERS::orders.>"].subjects[0].subject).toBe("orders.new")
	})

	it("deduplicates each stored expansion while other names are loading", async () => {
		const s = store()
		const first = deferred<any>(), second = deferred<any>()
		const hit = (name: string) => ({ subject: `${name}.>`, streams: [{ name, pattern: `${name}.>` }] })
		vi.mocked(api.occupied).mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise)
		const a = s.loadOccupied(hit("A")), b = s.loadOccupied(hit("B"))
		await s.loadOccupied(hit("A"))
		expect(api.occupied).toHaveBeenCalledTimes(2)
		second.resolve({ stream: "B", subjects: [] })
		await b
		await s.loadOccupied(hit("A"))
		expect(api.occupied).toHaveBeenCalledTimes(2)
		first.resolve({ stream: "A", subjects: [{ subject: "A.one", count: 3 }] })
		await a
		expect(s.state.occupied["A::A.>"].subjects[0].count).toBe(3)
	})

	it.each(["old-first", "new-first"])("keeps only the current stored request after invalidation: %s", async order => {
		const s = store()
		s.state.jetstreamEnabled = false
		const first = deferred<any>(), second = deferred<any>()
		const hit = { subject: "orders.>", streams: [{ name: "ORDERS", pattern: "orders.>" }] }
		const current = { stream: "ORDERS", subjects: [{ subject: "orders.new", count: 20 }] }
		vi.mocked(api.occupied).mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise)
		const oldRequest = s.loadOccupied(hit)
		await s.toggleNoSysMessages()
		const newRequest = s.loadOccupied(hit)
		if (order == "new-first") { second.resolve(current); await newRequest }
		first.resolve({ stream: "ORDERS", subjects: [{ subject: "orders.old", count: 10 }] })
		await oldRequest
		await s.loadOccupied(hit)
		expect(api.occupied).toHaveBeenCalledTimes(2)
		if (order == "old-first") { second.resolve(current); await newRequest }
		expect(s.state.occupied["ORDERS::orders.>"]).toEqual(current)
	})
})
