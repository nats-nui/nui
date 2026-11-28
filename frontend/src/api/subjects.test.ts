import { describe, expect, it, vi } from "vitest"
vi.mock("@/plugins/AjaxService", () => ({ default: { get: vi.fn() } }))
import ajax from "@/plugins/AjaxService"
import api from "./subjects"
import streams from "./streams"
import { encodeUrl } from "@/plugins/AjaxService/utils"

describe("subjects API", () => {
	it("encodes a stream name once", async () => {
		await api.occupied("id", "orders%20", "orders.>", true)
		const url = vi.mocked(ajax.get).mock.lastCall[0]
		expect(encodeUrl(url)).toContain("orders%2520/occupied")
		expect(encodeUrl(url)).not.toContain("orders%252520")
	})

	it.each([
		[{ interval: 1 }, "interval=-1"],
		[{ startSeq: 42, interval: 2 }, "seq_start=42&interval=2"],
		[{ byTime: true, startTime: "2026-01-02T03:04:05Z", interval: 1 }, "start_time=2026-01-02T03:04:05.000Z&interval=1"],
	])("requests the selected JetStream position", async (filter, expected) => {
		await streams.messages("id", "ORDERS", { ...filter, subjects: ["orders.a,b"] })
		const url = vi.mocked(ajax.get).mock.lastCall[0]
		const params = new URL(encodeUrl(url), "http://localhost").searchParams
		expect([...params]).toEqual([...new URLSearchParams(expected + "&subject=orders.a%2Cb")])
	})

	it("passes literal stream subjects through the Ajax URL builder", async () => {
		const subjects = ["orders.a,b", "orders.a*b", "orders.a>b"]
		await streams.messages("id", "ORDERS", {startSeq: 1, subjects})
		const url = vi.mocked(ajax.get).mock.lastCall[0]
		expect(new URL(encodeUrl(url), "http://localhost").searchParams.getAll("subject")).toEqual(subjects)
	})
})
