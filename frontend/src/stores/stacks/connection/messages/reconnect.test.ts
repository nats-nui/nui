import { createStore } from "@priolo/jon"
import { expect, it, vi } from "vitest"
import setup from "."
import { socketPool } from "@/plugins/SocketService/pool"

vi.mock("@priolo/jack", () => ({ docsSo: {}, utils: {} }))
vi.mock("@/plugins/SocketService/utils.js", () => ({ optionsDefault: {} }))
vi.mock("@/stores/connections", () => ({
	default: { getById: vi.fn(), update: vi.fn() },
}))
vi.mock("@/stores/log/index.js", () => ({ default: { add: vi.fn() } }))
vi.mock("@/stores/docs/utils/factory", () => ({}))
vi.mock("@/stores/stacks/viewBase", () => ({ default: { state: {}, actions: {}, getters: {} } }))

class TestSocket {
	static OPEN = 1
	static CLOSED = 3

	readyState = 0
	onopen: () => void
	onclose: (event: { currentTarget: TestSocket }) => void
	onmessage: (event: { data: string }) => void
	send = vi.fn()

	open() {
		this.readyState = TestSocket.OPEN
		this.onopen()
	}

	close() {
		this.readyState = TestSocket.CLOSED
		this.onclose({ currentTarget: this })
	}
}

it("replays the latest selection once and continues receiving messages after reconnect", () => {
	vi.useFakeTimers()
	vi.stubGlobal("WebSocket", TestSocket)
	const store = createStore(setup)
	store.state.uuid = "reconnect-test"
	store.state.connectionId = "test"
	store.setSubscriptions([{ subject: "orders.created" }])
	try {
		store.connect()
		const service = socketPool.getById(store.getSocketServiceId())
		const first = service.websocket as unknown as TestSocket
		first.open()
		expect(first.send).toHaveBeenCalledExactlyOnceWith(JSON.stringify({
			type: "subscriptions_req", payload: { subjects: ["orders.created"] },
		}))

		first.close()
		store.setSubscriptions([{ subject: "orders.shipped" }])
		store.sendSubscriptions()
		expect(first.send).toHaveBeenCalledTimes(1)

		vi.advanceTimersByTime(3000)
		const second = service.websocket as unknown as TestSocket
		expect(second).not.toBe(first)
		second.open()
		expect(second.send).toHaveBeenCalledExactlyOnceWith(JSON.stringify({
			type: "subscriptions_req", payload: { subjects: ["orders.shipped"] },
		}))
		const data = JSON.stringify({
			type: "nats_msg", payload: { subject: "orders.shipped", payload: btoa("shipped") },
		})
		second.onmessage({ data })
		expect(store.state.messages[store.state.messages.length - 1]).toMatchObject({
			subject: "orders.shipped", payload: "shipped",
		})

		store.disconnect()
		second.onmessage({ data })
		expect(store.state.messages.filter(message => message.subject == "orders.shipped")).toHaveLength(1)
	} finally {
		socketPool.destroyForce(store.getSocketServiceId())
		vi.useRealTimers()
		vi.unstubAllGlobals()
	}
})
