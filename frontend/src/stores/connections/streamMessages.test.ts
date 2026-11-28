import { cardsSetup, docsSo, viewSetup } from "@priolo/jack"
import { createStore } from "@priolo/jon"
import { afterEach, expect, it, vi } from "vitest"
import cnnApi from "@/api/connection"
import { menuSo } from "@/stores/docs/links"
import { DOC_TYPE } from "@/types"
import type { Connection } from "@/types/Connection"
import cnnSo from "./index"

vi.hoisted(() => {
	vi.stubGlobal("Element", class {})
	vi.stubGlobal("document", {
		addEventListener() {},
		documentElement: { style: {} },
		createElement: () => ({ style: {} }),
	})
})
vi.mock("@/api/connection", () => ({ default: { remove: vi.fn() } }))
vi.mock("@/plugins/SocketService/pool", () => ({ socketPool: {} }))

afterEach(() => {
	docsSo.setAllDeck([])
	menuSo.setAll([])
})

it.each(["replace", "delete"])("closes Stream Messages and cancels its delete confirmation on profile %s", async operation => {
	const profile = { id: "changed", hosts: ["nats://first"] } as Connection
	const other = { ...profile, id: "other" }
	cnnSo.setAll([profile, other])
	const group = createStore(cardsSetup)
	docsSo.setAllDeck([group])
	function streamMessages(connectionId: string) {
		const view = createStore(viewSetup)
		Object.assign(view.state, { uuid: crypto.randomUUID(), type: DOC_TYPE.STREAM_MESSAGES, connectionId })
		return view
	}
	const open = streamMessages(profile.id)
	const pinned = streamMessages(profile.id)
	const otherCard = streamMessages(other.id)
	const pinnedStream = createStore(viewSetup)
	Object.assign(pinnedStream.state, { uuid: "saved-stream", type: DOC_TYPE.STREAM })
	pinnedStream.setLinked(streamMessages(profile.id))
	await group.add({ view: open })
	await group.add({ view: otherCard })
	await menuSo.add({ view: open })
	await menuSo.add({ view: pinned })
	await menuSo.add({ view: pinnedStream })
	const confirmation = open.alertOpen({ title: "MESSAGE DELETE", body: "Delete this message?" })

	cnnSo.update(structuredClone(profile))
	expect(group.state.all).toContain(open)
	expect(open.state.alert.open).toBe(true)
	if (operation === "replace") {
		cnnSo.update({ ...profile, hosts: ["nats://second"] })
	} else {
		await cnnSo.delete(profile.id)
		expect(cnnApi.remove).toHaveBeenCalledWith(profile.id)
	}
	await expect(confirmation).resolves.toBe(false)
	expect(group.state.all).toEqual([otherCard])
	expect(menuSo.state.all).toEqual([pinnedStream])
	expect(pinnedStream.state.linked).toBeNull()
})
