import { beforeEach, describe, expect, it, vi } from "vitest"

const ajaxMock = vi.hoisted(() => ({
	get: vi.fn(),
	post: vi.fn(),
	delete: vi.fn(),
}))

vi.mock("@/plugins/AjaxService", () => ({
	default: ajaxMock,
}))

import kventriesApi from "./kventries"

describe("kventries api", () => {
	beforeEach(() => {
		ajaxMock.get.mockReset()
		ajaxMock.post.mockReset()
		ajaxMock.delete.mockReset()
		ajaxMock.get.mockResolvedValue({ payload: btoa("value"), history: [] })
		ajaxMock.post.mockResolvedValue({ payload: btoa("value") })
		ajaxMock.delete.mockResolvedValue(undefined)
	})

	it("encodes slash characters inside KV keys for read and write operations", async () => {
		await kventriesApi.get("conn", "bucket", "foo/bar")
		await kventriesApi.put("conn", "bucket", "foo/bar", "value")
		await kventriesApi.remove("conn", "bucket", "foo/bar")
		await kventriesApi.purge("conn", "bucket", "foo/bar")

		expect(ajaxMock.get).toHaveBeenCalledWith("connection/conn/kv/bucket/key/foo%2Fbar", null, undefined)
		expect(ajaxMock.post).toHaveBeenNthCalledWith(
			1,
			"connection/conn/kv/bucket/key/foo%2Fbar",
			{ payload: btoa("value"), ttl: undefined },
			undefined,
		)
		expect(ajaxMock.delete).toHaveBeenCalledWith("connection/conn/kv/bucket/key/foo%2Fbar", null, undefined)
		expect(ajaxMock.post).toHaveBeenNthCalledWith(
			2,
			"connection/conn/kv/bucket/key/foo%2Fbar/purge",
			{},
			undefined,
		)
	})

	it("keeps literal percent-encoded slash text distinct from path separators", async () => {
		await kventriesApi.get("conn", "bucket", "foo%2Fbar")

		expect(ajaxMock.get).toHaveBeenCalledWith("connection/conn/kv/bucket/key/foo%252Fbar", null, undefined)
	})
})
