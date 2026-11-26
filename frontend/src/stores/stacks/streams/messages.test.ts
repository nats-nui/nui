import { createStore } from "@priolo/jon"
import { expect, it, vi } from "vitest"
import streamsApi from "@/api/streams"
import type { StreamInfo } from "@/types/Stream"
import setup from "./messages"

vi.mock("@/api/streams", () => ({ default: { messages: vi.fn() } }))
vi.mock("@/stores/docs/utils/factory", () => ({ buildMessageDetail: vi.fn() }))
vi.mock("@/stores/stacks/viewBase", () => ({ default: { state: {}, actions: {}, getters: {} } }))
vi.mock("@/stores/stacks/loadBase", () => ({ default: { state: {}, actions: { fetch: vi.fn() } } }))
vi.mock("@/stores/stacks/editorBase", () => ({ default: { state: {} } }))
vi.mock("@/utils/streamFormatCache", () => ({ getStreamFormat: () => null, setStreamFormat: vi.fn() }))

it("keeps the selected subject when a message arrives after an empty first read", async () => {
	const store = createStore(setup)
	store.state.connectionId = "connection"
	store.state.stream = {
		config: { name: "ORDERS" },
		state: { firstSeq: 1, lastSeq: 42 },
	} as StreamInfo
	store.state.filter = { subjects: ["orders.created"] }
	vi.mocked(streamsApi.messages).mockResolvedValue([])

	await store.fetchIfVoid()

	expect(streamsApi.messages).toHaveBeenCalledExactlyOnceWith(
		"connection", "ORDERS",
		{ interval: -50, subjects: ["orders.created"] },
		expect.anything(),
	)

	const message = { seqNum: 43, subject: "orders.created", payload: "new order" }
	vi.mocked(streamsApi.messages).mockResolvedValueOnce([message])
	expect(await store.fetchNext()).toBe(1)
	expect(streamsApi.messages).toHaveBeenLastCalledWith("connection", "ORDERS",
		expect.objectContaining({ subjects: ["orders.created"], startSeq: null, byTime: false }), expect.anything())
	expect(store.state.messages).toEqual([message])
})
