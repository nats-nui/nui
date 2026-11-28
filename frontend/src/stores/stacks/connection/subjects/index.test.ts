import { beforeEach, describe, expect, it, vi } from "vitest"
import { createStore } from "@priolo/jon"

vi.mock("@/api/connection", () => ({ default: { index: vi.fn(), save: vi.fn(), remove: vi.fn(), importFromNatsCli: vi.fn() } }))
vi.mock("@/plugins/SocketService/utils.js", () => ({ optionsDefault: {} }))
vi.mock("@/plugins/SocketService/pool", () => ({ socketPool: { connectAll: vi.fn(), destroyForce: vi.fn(), getOrCreate: vi.fn() } }))
vi.mock("@/stores/docs/utils/factory", () => ({ buildStore: vi.fn() }))
vi.mock("@/stores/stacks/viewBase", () => ({ default: { state: {}, actions: {}, getters: {} } }))
vi.mock("@/stores/stacks/loadBase", () => ({ default: { state: {}, actions: { fetch: vi.fn(), fetchAbort: vi.fn() } } }))
vi.mock("@/api/subjects", () => ({ default: { jetstream: vi.fn(), core: vi.fn(), occupied: vi.fn() } }))

vi.mock("@/api/streams", () => ({ default: { get: vi.fn() } }))

vi.mock("@/stores/docs/cards", () => ({ drawerCardsSo: {} }))
vi.mock("@/stores/docs/links", () => ({ menuSo: { state: { all: [] } } }))
import { menuSo } from "@/stores/docs/links"
vi.mock("@/api/messages", () => ({ default: { subscriptionIndex: vi.fn() } }))
import messagesApi from "@/api/messages"
vi.mock("@priolo/jack", () => ({ docsSo: { getAllCards: () => [] }, focusSo: { focus: vi.fn() }, utils: { findInRoot: vi.fn(), findAll: vi.fn() }, MESSAGE_TYPE: { SUCCESS: "success" } }))
import { focusSo, utils } from "@priolo/jack"
import setup from "./index"
import cnnSo from "@/stores/connections"
import cnnApi from "@/api/connection"
import { AUTH_MODE, CNN_STATUS, type Connection } from "@/types/Connection"
import importSetup from "../../cnnImport"
import streamsApi from "@/api/streams"
import { buildStore } from "@/stores/docs/utils/factory"
import messagesSetup, { type MessagesStore } from "../messages"
import type { StreamInfo } from "@/types/Stream"
import api from "@/api/subjects"
import { DOC_TYPE } from "@/types"
import { flattenHits, occupiedKey } from "@/utils/subjects/tree"

function deferred<T>() {
	let resolve: (value: T) => void
	const promise = new Promise<T>(r => { resolve = r })
	return { promise, resolve }
}
function store() {
	const s: any = createStore(setup)
	s.state = { ...s.state, connectionId: "connection", uuid: "card", filter: "orders.>" }
	return s
}
const catalog = { filter: "orders.>", listenMs: 0, heard: 1, truncated: false, subjects: [{ subject: "orders.created", count: 1 }] }

beforeEach(() => vi.resetAllMocks())

describe("SUBJECTS requests", () => {
	it("refreshes a pinned Subjects card when reopened after a profile change", async () => {
		const card = store()
		card.setJetstream({ streams: [{ name: "OLD", subjects: [] }] })
		card.disposeSubjects()
		menuSo.state.all = [card]
		try {
			vi.mocked(utils.findAll).mockImplementation((views, match) =>
				match.type === DOC_TYPE.SUBJECTS ? views.filter(view => view === card) : [])
			const profile = { id: "connection", hosts: ["nats://a"] } as Connection
			cnnSo.setAll([profile])
			vi.mocked(cnnApi.index).mockResolvedValue([structuredClone(profile)])
			vi.mocked(cnnApi.importFromNatsCli).mockResolvedValue({ connections: [structuredClone(profile)], imports: [] })
			const importer = createStore(importSetup)
			importer.setSnackbar = vi.fn()
			await importer.import()
			expect(card.state.jetstream.streams[0].name).toBe("OLD")
			cnnSo.update({ id: "connection", hosts: ["nats://b"] })
			vi.mocked(api.jetstream).mockResolvedValue({ streams: [] })
			await card.fetchIfVoid()
			expect(api.jetstream).toHaveBeenCalledOnce()
			expect(card.state.jetstream.streams).toEqual([])
		} finally {
			menuSo.state.all = []
		}
	})

	it("compares optional saved authentication and TLS values before invalidating", async () => {
		const profile = { id: "connection", name: "profile", hosts: ["nats://a"] } as Connection
		const invalidateSubjects = vi.fn()
		vi.mocked(utils.findAll).mockImplementation((_, match) =>
			match.type === DOC_TYPE.SUBJECTS ? [{ invalidateSubjects }] as any : [])
		cnnSo.setAll([profile])
		cnnSo.update({ ...profile, auth: [], tlsAuth: null })
		expect(invalidateSubjects).not.toHaveBeenCalled()
		const auth = [{ active: true, mode: AUTH_MODE.TOKEN, token: "test" }]
		const tlsAuth = { enabled: true, keyPath: "key", certPath: "cert", caPath: "ca", handshakeFirst: false }
		cnnSo.update({ ...profile, auth, tlsAuth })
		cnnSo.update(structuredClone({ ...profile, auth, tlsAuth }))
		expect(invalidateSubjects).toHaveBeenCalledTimes(1)
		cnnSo.update({ id: profile.id, auth: [] })
		cnnSo.update({ id: profile.id, tlsAuth: null })
		expect(invalidateSubjects).toHaveBeenCalledTimes(3)
		vi.mocked(cnnApi.index).mockRejectedValueOnce(new Error("connection unavailable"))
		await expect(cnnSo.fetch()).rejects.toThrow("connection unavailable")
		expect(invalidateSubjects).toHaveBeenCalledTimes(3)
		vi.mocked(cnnApi.index).mockResolvedValueOnce([{ ...profile, hosts: ["nats://b"] }])
		await cnnSo.fetch()
		expect(invalidateSubjects).toHaveBeenCalledTimes(4)
	})

	it.each(["save", "save with failed refresh", "reimport", "partial import", "delete"])("invalidates only the changed profile and its pending handoffs on %s", async operation => {
		const card = store(), other = store()
		card.state.group = { state: { all: [] }, add: vi.fn(), getIndexByView: () => 0 }
		other.state.connectionId = "other"
		const a = { id: "connection", name: "profile", hosts: ["nats://a"], auth: [] } as Connection
		cnnSo.setAll([a, { ...a, id: "other" }])
		vi.mocked(utils.findAll).mockImplementation((_, match) => match.type === DOC_TYPE.SUBJECTS
			? [card, other].filter(s => s.state.connectionId === match.connectionId) : [])
		for (const s of [card, other]) {
			s.setSelect("orders.created")
			s.setCore(catalog)
			s.setJetstream({ streams: [] })
			s.setOccupied({ orders: { stream: "ORDERS", subjects: [] } })
		}
		const streamInfo = deferred<StreamInfo>(), favorites = deferred<[]>()
		vi.mocked(streamsApi.get).mockReturnValue(streamInfo.promise)
		vi.mocked(messagesApi.subscriptionIndex).mockReturnValue(favorites.promise)
		const pending = [card.openLive("orders.created"), card.openStreamMessages({ subject: "orders.created", streamName: "ORDERS" })]

		cnnSo.update({ id: a.id, status: CNN_STATUS.RECONNECTING })
		expect(utils.findAll).not.toHaveBeenCalled()
		vi.mocked(cnnApi.index).mockResolvedValue(structuredClone(cnnSo.state.all))
		await cnnSo.fetch()
		expect(card.state.select).toBe("orders.created")
		expect(card.state.liveRequest.signal.aborted).toBe(false)

		if (operation === "save") {
			const changed = { ...a, hosts: ["nats://b"] }
			vi.mocked(cnnApi.save).mockResolvedValue(changed)
			await cnnSo.save(changed)
		} else if (operation === "save with failed refresh") {
			const changed = { ...a, hosts: ["nats://b"] }
			vi.mocked(cnnApi.save).mockRejectedValue("connection refresh failed")
			vi.mocked(cnnApi.index).mockResolvedValue([changed, { ...a, id: "other" }])
			await expect(cnnSo.save(changed)).rejects.toBe("connection refresh failed")
			expect(cnnSo.getById(a.id).hosts).toEqual(changed.hosts)
		} else if (operation === "reimport" || operation === "partial import") {
			const changed = { ...a, auth: [{ mode: AUTH_MODE.TOKEN, token: "test" }] }
			vi.mocked(cnnApi.importFromNatsCli).mockResolvedValue({ connections: [changed], imports: [] })
			if (operation === "partial import") vi.mocked(cnnApi.importFromNatsCli).mockRejectedValue("second profile failed")
			vi.mocked(cnnApi.index).mockResolvedValue([changed, { ...a, id: "other" }])
			const importer = createStore(importSetup)
			importer.setSnackbar = vi.fn()
			await importer.import()
		} else {
			await cnnSo.delete(a.id)
		}
		expect(card.state).toMatchObject({ select: null, core: null, jetstream: null, occupied: {} })
		expect(other.state.select).toBe("orders.created")
		favorites.resolve([])
		streamInfo.resolve({ state: {} } as StreamInfo)
		await Promise.all(pending)
		await card.openLive("orders.created")
		await card.openStreamMessages({ subject: "orders.created", streamName: "ORDERS" })
		expect(messagesApi.subscriptionIndex).toHaveBeenCalledOnce()
		expect(streamsApi.get).toHaveBeenCalledOnce()
		expect(card.state.group.add).not.toHaveBeenCalled()
		expect(api.core).not.toHaveBeenCalled()
	})

	it.each([true, false])("reconciles a failed save when the original profile can be reread: %s", async readable => {
		const original = { id: "connection", hosts: ["nats://a"] } as Connection
		const invalidateSubjects = vi.fn()
		vi.mocked(utils.findAll).mockImplementation((_, match) => match.type === DOC_TYPE.SUBJECTS ? [{ invalidateSubjects }] as any : [])
		cnnSo.setAll([original])
		vi.mocked(cnnApi.save).mockRejectedValue("save failed")
		if (readable) vi.mocked(cnnApi.index).mockResolvedValue([original])
		else vi.mocked(cnnApi.index).mockRejectedValue("offline")
		await expect(cnnSo.save({ ...original, hosts: ["nats://b"] })).rejects.toBe("save failed")
		expect(cnnSo.getById(original.id).hosts).toEqual(original.hosts)
		expect(invalidateSubjects).toHaveBeenCalledTimes(readable ? 0 : 1)
	})

	it("refreshes with the current filter after a stale catalog response", async () => {
		const s = store()
		const previous = deferred<{ streams: [] }>()
		vi.mocked(api.jetstream).mockReturnValueOnce(previous.promise).mockResolvedValue({ streams: [] })
		const request = s.fetchJetStream()
		await s.toggleJetStream()
		await s.toggleNoSysMessages()
		previous.resolve({ streams: [] })
		await request
		await s.toggleJetStream()
		expect(vi.mocked(api.jetstream).mock.calls.map(call => call[1])).toEqual([true, false])
	})

	it("only samples Core after an explicit action with a valid filter", async () => {
		const s = store()
		vi.mocked(api.jetstream).mockResolvedValue({ streams: [] })
		await s.fetchIfVoid()
		await s.fetch()
		s.state.filter = ""
		await s.sampleNow()
		s.setFilter("_INBOX.>")
		await s.sampleNow()
		await s.toggleNoSysMessages()
		expect(api.core).not.toHaveBeenCalled()
		s.setFilter("  orders.>  ")
		vi.mocked(api.core).mockResolvedValue(catalog)
		await s.sampleNow()
		expect(api.core).toHaveBeenCalledExactlyOnceWith("connection", "orders.>", 2000, false, expect.anything())
		expect(s.state.core).toEqual(catalog)
		expect(s.state.filter).toBe("orders.>")
	})

	it.each(["disposeSubjects", "toggleCore", "toggleNoSysMessages"])("ignores a sample response after %s", async action => {
		const s = store()
		s.state.jetstreamEnabled = false
		const pending = deferred<typeof catalog>()
		vi.mocked(api.core).mockReturnValue(pending.promise)
		const fetch = s.sampleNow()
		await s[action]()
		const current = s.state.core
		expect(vi.mocked(api.core).mock.calls[0][4].signal.aborted).toBe(true)
		pending.resolve(catalog)
		await fetch
		expect(s.state.core).toEqual(current)
		expect(s.state.coreAbort).toBeNull()
	})

	it.each([
		["orders.created", true], ["orders.>", true], ["$KV.shop.>", false],
	] as const)("creates a Messages card for %s when none is open", async (subject, noSysMessages) => {
		const s = store()
		s.setSelect(subject)
		vi.mocked(messagesApi.subscriptionIndex).mockResolvedValue([{ subject: "saved" }])
		s.state.group = { state: { all: [] }, add: vi.fn(), getIndexByView: () => 0 }
		const view = {} as MessagesStore
		vi.mocked(buildStore).mockReturnValue(view)
		await s.openLive(subject)
		expect(buildStore).toHaveBeenCalledWith(expect.objectContaining({
			type: DOC_TYPE.MESSAGES, connectionId: "connection", subscriptions: [{ subject, favorite: false }, { subject: "saved", favorite: true, disabled: true }], noSysMessages,
		}))
		expect(s.state.group.add).toHaveBeenCalledWith(expect.objectContaining({ view }))
	})

	it.each([true, false])("ignores the old selection while favorites load (open the new selection: %s)", async openNew => {
		const s = store()
		s.state.group = { state: { all: [] }, add: vi.fn(), getIndexByView: () => 0 }
		const first = deferred<[]>()
		vi.mocked(messagesApi.subscriptionIndex).mockReturnValueOnce(first.promise).mockResolvedValueOnce([])
		s.setSelect("orders.old")
		const pending = s.openLive("orders.old")
		s.setSelect("orders.new")
		if (openNew) await s.openLive("orders.new")
		first.resolve([])
		await pending
		expect(buildStore).toHaveBeenCalledTimes(openNew ? 1 : 0)
		if (openNew) expect(buildStore).toHaveBeenCalledWith(expect.objectContaining({
			subscriptions: [{ subject: "orders.new", favorite: false }],
		}))
	})

	it("keeps the current subscriptions when the Messages card's initial load finishes late", async () => {
		const card = createStore(messagesSetup)
		const initial = deferred<{ subject: string }[]>()
		vi.mocked(messagesApi.subscriptionIndex).mockReturnValue(initial.promise)
		const loading = card.fetchIfVoid()
		card.setSubscriptions([{ subject: "orders.new" }])
		initial.resolve([{ subject: "removed.favorite" }])
		await loading
		expect(card.state.subscriptions).toEqual([{ subject: "orders.new" }])
	})

	it("switches the open Messages card for this connection and keeps its favorites", () => {
		const s = store()
		const view = {
			state: { type: DOC_TYPE.MESSAGES, connectionId: "connection", subscriptions: [
				{ subject: "saved", favorite: true }, { subject: "old" },
			] },
			setSubscriptions: vi.fn(), setNoSysMessages: vi.fn(), setPause: vi.fn(),
			setSubscriptionsOpen: vi.fn(), sendSubscriptions: vi.fn(),
		}
		const other = { state: { ...view.state, connectionId: "other" } }
		s.state.group = { state: { all: [other, { state: { linked: view } }] } }
		vi.mocked(utils.findInRoot).mockReturnValue(view as unknown as MessagesStore)
		s.setSelect("orders.>")
		s.openLive("orders.>")
		expect(view.setSubscriptions).toHaveBeenCalledWith([
			{ subject: "orders.>", favorite: false }, { subject: "saved", favorite: true, disabled: true },
		])
		expect(view.setPause).toHaveBeenCalledWith(false)
		expect(view.sendSubscriptions).toHaveBeenCalledOnce()
		expect(utils.findInRoot).toHaveBeenCalledWith(s.state.group.state.all, { type: DOC_TYPE.MESSAGES, connectionId: "connection" })
		expect(focusSo.focus).toHaveBeenCalledWith(view)
		expect(buildStore).not.toHaveBeenCalled()
	})

	it("opens Stream Messages for the selected stream and subject", async () => {
		const s = store()
		s.state.select = "orders.created"
		s.state.group = { add: vi.fn(), getIndexByView: () => 0 }
		const stream = { config: { name: "SECOND" }, state: { firstSeq: 1, lastSeq: 47 } } as StreamInfo
		vi.mocked(streamsApi.get).mockResolvedValue(stream)
		await s.openStreamMessages({ subject: "orders.created", streamName: "SECOND" })
		expect(streamsApi.get).toHaveBeenCalledWith("connection", "SECOND", expect.anything(), "orders.created")
		expect(buildStore).toHaveBeenCalledWith(expect.objectContaining({
			type: DOC_TYPE.STREAM_MESSAGES, stream, filter: { subjects: ["orders.created"] },
		}))
		expect(s.state.group.add).toHaveBeenCalledOnce()
	})

	it("keeps the newer sample when an aborted request resolves last", async () => {
		const s = store()
		const first = deferred<typeof catalog>()
		const second = deferred<typeof catalog>()
		vi.mocked(api.core).mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise)
		const oldRequest = s.sampleNow()
		s.state.filter = "devices.>"
		const newRequest = s.sampleNow()
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
		const fetch = s.loadOccupied({ name: "ORDERS", pattern: "orders.>" })
		s.state.jetstreamEnabled = false
		await s.toggleNoSysMessages()
		expect(vi.mocked(api.occupied).mock.calls[0][4].signal.aborted).toBe(true)
		pending.resolve({ stream: "ORDERS", subjects: [{ subject: "$SYS.private", kind: "occupied" }] })
		await fetch
		expect(s.state.occupied).toEqual({})
	})

	it.each([false, true])("refreshes stored subjects once per query (transformed: %s)", async transformed => {
		const s = store()
		const pattern = transformed ? ">" : "orders.>"
		const key = occupiedKey("ORDERS", pattern)
		s.state.occupied = {
			[key]: { stream: "ORDERS", subjects: [{ subject: "orders.old", kind: "occupied" }] },
			[occupiedKey("REMOVED", "removed.>")]: { stream: "REMOVED", subjects: [{ subject: "removed.old", kind: "occupied" }] },
		}
		vi.mocked(api.jetstream).mockResolvedValue({ streams: [{ name: "ORDERS", kind: "stream", transformed,
			subjects: [{ subject: "orders.>", kind: "pattern" }, { subject: "returns.>", kind: "pattern" }],
		}] })
		const pending = deferred<any>()
		const current = { stream: "ORDERS", subjects: [{ subject: "orders.new", kind: "occupied" }] }
		vi.mocked(api.occupied).mockReturnValue(pending.promise)
		const refresh = s.fetchJetStream()
		await Promise.resolve()
		expect(s.state.occupied[occupiedKey("REMOVED", "removed.>")]).toBeUndefined()
		pending.resolve(current)
		await refresh
		expect(api.occupied).toHaveBeenCalledExactlyOnceWith("connection", "ORDERS", pattern, true, expect.anything())
		expect(s.state.occupied).toEqual({ [key]: current })
	})

	it.each([true, false])("keeps a pending expansion only if its pattern remains after Refresh: %s", async retained => {
		const s = store()
		const catalog = deferred<any>(), occupied = deferred<any>()
		const source = { name: "ORDERS", pattern: "orders.>" }
		const current = { stream: "ORDERS", subjects: [{ subject: "orders.created", kind: "occupied" }] }
		vi.mocked(api.jetstream).mockReturnValue(catalog.promise)
		vi.mocked(api.occupied).mockReturnValue(occupied.promise)
		const refresh = s.fetchJetStream()
		const expand = s.loadOccupied(source)
		catalog.resolve({ streams: retained ? [{ name: "ORDERS", kind: "stream", subjects: [{ subject: "orders.>", pattern: "orders.>", kind: "pattern" }] }] : [] })
		await refresh
		occupied.resolve(current)
		await expand
		expect(s.state.occupied).toEqual(retained ? { [occupiedKey("ORDERS", "orders.>")]: current } : {})
		expect(s.state.occupiedLoading).toEqual({})
		expect(api.occupied).toHaveBeenCalledOnce()
	})

	it("deduplicates each stored expansion while other names are loading", async () => {
		const s = store()
		const first = deferred<any>(), second = deferred<any>()
		const firstSource = { name: "A::B", pattern: "C.>" }
		const secondSource = { name: "A", pattern: "B::C.>" }
		const firstCatalog = { stream: "A::B", subjects: [{ subject: "C.one", kind: "occupied", count: 3 }] }
		const secondCatalog = { stream: "A", subjects: [{ subject: "B::C.one", kind: "occupied", count: 9 }] }
		vi.mocked(api.occupied).mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise)
		const a = s.loadOccupied(firstSource), b = s.loadOccupied(secondSource)
		await s.loadOccupied(firstSource)
		expect(api.occupied).toHaveBeenCalledTimes(2)
		expect(api.occupied).toHaveBeenNthCalledWith(1, "connection", "A::B", "C.>", true, expect.anything())
		expect(api.occupied).toHaveBeenNthCalledWith(2, "connection", "A", "B::C.>", true, expect.anything())
		second.resolve(secondCatalog)
		await b
		await s.loadOccupied(firstSource)
		expect(api.occupied).toHaveBeenCalledTimes(2)
		first.resolve(firstCatalog)
		await a
		expect(s.state.occupied).toEqual({
			[occupiedKey("A::B", "C.>")]: firstCatalog,
			[occupiedKey("A", "B::C.>")]: secondCatalog,
		})
		const hits = flattenHits({ occupied: s.state.occupied,
			jetstream: { streams: [
				{ name: "A", kind: "stream", subjects: [{ subject: "B::C.>", pattern: "B::C.>", kind: "pattern" }] },
				{ name: "A::B", kind: "stream", subjects: [{ subject: "C.>", pattern: "C.>", kind: "pattern" }] },
			] },
		})
		expect(hits.find(h => h.subject == "C.one")?.parent).toBe("C.>")
		expect(hits.find(h => h.subject == "B::C.one")?.parent).toBe("B::C.>")
	})

	it.each(["old-first", "new-first"])("keeps only the current stored request after invalidation: %s", async order => {
		const s = store()
		s.state.jetstreamEnabled = false
		const first = deferred<any>(), second = deferred<any>()
		const source = { name: "ORDERS", pattern: "orders.>" }
		const current = { stream: "ORDERS", subjects: [{ subject: "orders.new", count: 20 }] }
		vi.mocked(api.occupied).mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise)
		const oldRequest = s.loadOccupied(source)
		await s.toggleNoSysMessages()
		const newRequest = s.loadOccupied(source)
		if (order == "new-first") { second.resolve(current); await newRequest }
		first.resolve({ stream: "ORDERS", subjects: [{ subject: "orders.old", count: 10 }] })
		await oldRequest
		await s.loadOccupied(source)
		expect(api.occupied).toHaveBeenCalledTimes(2)
		if (order == "old-first") { second.resolve(current); await newRequest }
		expect(s.state.occupied[occupiedKey("ORDERS", "orders.>")]).toEqual(current)
	})
})
