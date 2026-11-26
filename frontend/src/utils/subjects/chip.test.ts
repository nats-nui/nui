import { describe, expect, it } from "vitest"
import { rowChip } from "./chip"

describe("rowChip", () => {
	it("identifies Core observations without claiming they are still live", () => {
		expect(rowChip({ subject: "orders.created", coreCount: 1, streams: [] }, "created")).toEqual({
			label: "Core NATS", kind: "live", title: "observed via Core NATS",
		})
	})

	it("keeps KV and Object Store and hides occupied children", () => {
		expect(rowChip({
			subject: "$KV.shop.>", kind: "kv",
			streams: [{ name: "KV_shop", kind: "kv" }],
		}, "shop.>")?.label).toBe("Key-Value Store")
		expect(rowChip({
			subject: "$O.files.>", kind: "object",
			streams: [{ name: "OBJ_files", kind: "object" }],
		}, "files.>")?.label).toBe("Object Store")
		expect(rowChip({
			subject: "$KV.shop.item-1", kind: "occupied",
			streams: [{ name: "KV_shop", kind: "kv", count: 1 }],
		}, "item-1")).toBeNull()
	})

	it("hides a stream chip that only repeats the row", () => {
		expect(rowChip({
			subject: "_ORDERS", kind: "pattern",
			streams: [{ name: "ORDERS" }],
		}, "_ORDERS")).toBeNull()
		expect(rowChip({
			subject: "close", kind: "pattern",
			streams: [{ name: "close" }],
		}, "close")).toBeNull()
	})

	it("keeps a stream chip when the stream has a different name", () => {
		expect(rowChip({
			subject: "orders.created", kind: "pattern",
			streams: [{ name: "ORDERS" }],
		}, "created")).toEqual({ label: "ORDERS", kind: "js", title: "JetStream stream ORDERS" })
	})
})
