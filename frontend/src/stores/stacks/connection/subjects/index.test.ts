import { beforeEach, describe, expect, it, vi } from "vitest"
vi.mock("@priolo/jon", () => ({ mixStores: (...stores: any[]) => stores[stores.length - 1] }))

vi.mock("@/stores/connections", () => ({ default: {} }))
vi.mock("@/stores/docs/utils/factory", () => ({ buildMessageDetail: vi.fn() }))
vi.mock("@/stores/stacks/viewBase", () => ({ default: { state: {}, actions: {}, getters: {} } }))
vi.mock("@/stores/stacks/loadBase", () => ({ default: { state: {}, actions: { fetch: vi.fn(), fetchAbort: vi.fn() } } }))
vi.mock("@/api/subjects", () => ({ default: { jetstream: vi.fn(), core: vi.fn(), watch: vi.fn(), snapshot: vi.fn(), unwatch: vi.fn(), occupied: vi.fn(), last: vi.fn() } }))

import setup from "./index"
import api from "@/api/subjects"

function deferred<T>() {
	let resolve: (value: T) => void
	const promise = new Promise<T>(r => { resolve = r })
	return { promise, resolve: (value: T) => resolve(value) }
}
function store() {
	const s: any = { state: { ...setup.state, connectionId: "connection", uuid: "card", occupied: {}, filter: "orders.>" }, _update: vi.fn() }
	for (const [key, action] of Object.entries(setup.actions)) s[key] = (value?: unknown) => action(value as never, s)
	for (const [key, mutator] of Object.entries(setup.mutators)) s[key] = (value: unknown) => Object.assign(s.state, mutator(value as never))
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
		await s.discover("poll")
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
		await s.discover("poll")
		expect(api.watch).not.toHaveBeenCalled()
		expect(api.core).not.toHaveBeenCalled()
		expect(api.snapshot).toHaveBeenCalledOnce()
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

	it("refresh samples the typed name without replacing a live listener", async () => {
		const s = store()
		s.state.coreWatching = true
		s.state.jetstreamEnabled = false
		vi.mocked(api.core).mockResolvedValue(catalog)
		await s.discover("refresh")
		expect(api.core).toHaveBeenCalledOnce()
		expect(api.watch).not.toHaveBeenCalled()
		expect(api.unwatch).not.toHaveBeenCalled()
	})

	it("discards a sample response after closing", async () => {
		const s = store()
		const pending = deferred<typeof catalog>()
		vi.mocked(api.core).mockReturnValue(pending.promise)
		const fetch = s.fetchCore()
		s.disposeSubjects()
		pending.resolve(catalog)
		await fetch
		expect(s.state.core.heard).toBe(0)
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
		vi.mocked(api.jetstream).mockResolvedValue({ streams: [{ name: "ORDERS", kind: "stream", subjects: [{ subject: "orders", pattern: "orders.>", kind: "pattern" }] }] })
		vi.mocked(api.occupied).mockResolvedValue({ stream: "ORDERS", subjects: [{ subject: "orders.new", kind: "occupied" }] })
		await s.fetchJetStream()
		expect(s.state.occupied["ORDERS::orders.>"].subjects[0].subject).toBe("orders.new")
	})
})
