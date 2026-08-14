import { describe, expect, it } from "vitest"
import { rowChip } from "./chip"

describe("rowChip", () => {
	it("marks a live name and nothing else", () => {
		expect(rowChip({ subject: "ghost.bd.gga", core: { count: 1 }, streams: [] }, "bd.gga")?.label).toBe("live")
	})

	it("keeps KV and FILES and hides occupied children", () => {
		expect(rowChip({
			subject: "$KV.shop", kind: "kv", expandable: true,
			streams: [{ name: "KV_shop", kind: "kv" }],
		}, "shop")?.label).toBe("KV")
		expect(rowChip({
			subject: "$O.files", kind: "object", expandable: true,
			streams: [{ name: "OBJ_files", kind: "object" }],
		}, "files")?.label).toBe("FILES")
		expect(rowChip({
			subject: "$KV.shop.item-1", kind: "occupied",
			streams: [{ name: "KV_shop", kind: "kv", count: 1 }],
		}, "item-1")).toBeNull()
	})

	it("hides a stream chip that only repeats the row", () => {
		expect(rowChip({
			subject: "_NAIVE", kind: "pattern", expandable: true,
			streams: [{ name: "NAIVE" }],
		}, "_NAIVE")).toBeNull()
		expect(rowChip({
			subject: "close", kind: "pattern",
			streams: [{ name: "close" }],
		}, "close")).toBeNull()
	})

	it("keeps a stream chip when the keeper has a different name", () => {
		expect(rowChip({
			subject: "foo", kind: "pattern",
			streams: [{ name: "chaz" }],
		}, "foo")).toEqual({ label: "chaz", kind: "js", title: "kept by chaz" })
	})
})
