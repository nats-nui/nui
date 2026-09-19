import { describe, expect, it, vi } from "vitest"
vi.mock("@/plugins/AjaxService", () => ({ default: { get: vi.fn() } }))
import ajax from "@/plugins/AjaxService"
import api from "./subjects"
import { encodeUrl } from "@/plugins/AjaxService/utils"

describe("subjects API", () => {
	it("preserves binary payloads and header spelling", async () => {
		const payload = String.fromCharCode(0, 255, 195, 169).repeat(2048)
		const headers = { x_request_id: ["one"], "Nats-Msg-Id": ["two"] }
		vi.mocked(ajax.get).mockResolvedValue({ subject: "orders.created", seq_num: 2, payload: btoa(payload), headers })
		const message = await api.last("id", "orders.created", "ORDERS")
		expect(message.payload).toBe(payload)
		expect(message.headers).toEqual(headers)
		expect(message.seqNum).toBe(2)
		expect(vi.mocked(ajax.get).mock.lastCall[2].noCamel).toBe(true)
	})

	it("encodes a stream name once", async () => {
		await api.occupied("id", "orders%20", "orders.>", true)
		const url = vi.mocked(ajax.get).mock.lastCall[0]
		expect(encodeUrl(url)).toContain("orders%2520/occupied")
		expect(encodeUrl(url)).not.toContain("orders%252520")
	})
})
