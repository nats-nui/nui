import { describe, expect, it } from "vitest"
import { SubjectHit } from "@/types/Subject"
import { buildSubjectTree, countLeaves, filterTree, flattenHits, MAX_TREE_CHILDREN, occupiedKey } from "./tree"

function hit(subject: string, opts: Partial<SubjectHit> = {}): SubjectHit {
	return { subject, streams: [], ...opts }
}

describe("flattenHits", () => {
	it("merges the same name from core and a stream without adding their counts", () => {
		const hits = flattenHits({
			showCore: true,
			showJetStream: true,
			core: {
				filter: "orders.>", listenMs: 2000, heard: 1, truncated: false,
				subjects: [{ subject: "orders.created", count: 2 }],
			},
			jetstream: {
				streams: [{ name: "ORDERS", kind: "stream", subjects: [{ subject: "orders.created", kind: "occupied", count: 40 }] }],
			},
		})
		expect(hits).toHaveLength(1)
		expect(hits[0].core?.count).toBe(2)
		expect(hits[0].streams).toEqual([{ name: "ORDERS", kind: "stream", pattern: undefined, count: 40 }])
	})

	it("hides live names when the listen box no longer matches that listen", () => {
		const hits = flattenHits({
			showCore: true,
			showJetStream: false,
			filter: "devices.>",
			core: {
				filter: "orders.>", listenMs: 2000, heard: 1, truncated: false,
				subjects: [{ subject: "orders.created", count: 2 }],
			},
		})
		expect(hits).toEqual([])
	})

	it("keeps a kv store tag on occupied keys so they do not look like anonymous names", () => {
		const hits = flattenHits({
			showCore: false,
			showJetStream: true,
			jetstream: {
				streams: [{ name: "KV_shop", kind: "kv", subjects: [{ subject: "$KV.shop", kind: "kv", pattern: "$KV.shop.>" }] }],
			},
			occupied: {
				"KV_shop::$KV.shop.>": {
					stream: "KV_shop", kind: "kv",
					subjects: [{ subject: "$KV.shop.item-1", kind: "occupied", count: 1 }],
				},
			},
		})
		const key = hits.find(h => h.subject == "$KV.shop.item-1")
		expect(key?.streams[0].kind).toBe("kv")
		expect(key?.kind).toBe("occupied")
		expect(key?.expandable).toBeFalsy()
	})

	it("hides a source when its toggle is off without refetching", () => {
		const hits = flattenHits({
			showCore: false,
			showJetStream: false,
			core: { filter: "x.>", listenMs: 2000, heard: 1, truncated: false, subjects: [{ subject: "x", count: 1 }] },
			jetstream: { streams: [{ name: "S", kind: "stream", subjects: [{ subject: "y", kind: "pattern" }] }] },
		})
		expect(hits).toEqual([])
	})
})

describe("buildSubjectTree", () => {
	it("keeps a family at the first token and a child that is also a name", () => {
		const tree = buildSubjectTree([
			hit("devices.sensors", { core: { count: 3 } }),
			hit("devices", { core: { count: 1 } }),
		])
		expect(tree).toHaveLength(1)
		expect(tree[0].segment).toBe("devices")
		expect(tree[0].hit?.core?.count).toBe(1)
		expect(tree[0].children.map(c => c.segment)).toEqual(["sensors"])
		expect(tree[0].children[0].stacked).toBeFalsy()
		expect(tree[0].names).toBe(2)
		expect(countLeaves(tree)).toBe(2)
	})

	it("stacks anything deeper than a couple of levels instead of opening the whole chain", () => {
		const tree = buildSubjectTree([
			hit("devices.sensors.temp", { core: { count: 3 } }),
			hit("devices.sensors.humidity", { streams: [{ name: "IOT", count: 9 }] }),
			hit("agents.hb.cc.getbygenius.digimasons-2", { core: { count: 1 } }),
		])
		expect(tree.map(n => n.segment)).toEqual(["agents", "devices"])
		expect(tree[0].children.map(c => c.segment)).toEqual(["hb.cc.getbygenius.digimasons-2"])
		expect(tree[0].children[0].stacked).toBe(true)
		expect(tree[0].children[0].path).toBe("agents.hb.cc.getbygenius.digimasons-2")
		expect(tree[0].children[0].children).toEqual([])
		expect(tree[1].children.map(c => c.segment)).toEqual(["sensors.humidity", "sensors.temp"])
		expect(tree[1].children.every(c => c.stacked)).toBe(true)
		expect(countLeaves(tree)).toBe(3)
	})

	it("folds extra siblings into a remainder instead of rendering every token", () => {
		const hits = Array.from({ length: MAX_TREE_CHILDREN + 12 }, (_, i) => hit(`root.n${i.toString().padStart(2, "0")}`))
		const tree = buildSubjectTree(hits)
		expect(tree[0].children).toHaveLength(MAX_TREE_CHILDREN + 1)
		expect(tree[0].children[MAX_TREE_CHILDREN].remainder).toBe(true)
		expect(tree[0].children[MAX_TREE_CHILDREN].segment).toMatch(/12 more/)
	})
})

describe("occupiedKey", () => {
	it("matches the expand cache key used by the store", () => {
		expect(occupiedKey("ORDERS", "orders.>")).toBe("ORDERS::orders.>")
		expect(occupiedKey("ORDERS")).toBe("ORDERS::>")
	})
})

describe("filterTree", () => {
	it("keeps ancestors of a matching leaf", () => {
		const tree = buildSubjectTree([
			hit("shop.orders.created"),
			hit("shop.users.login"),
		])
		const filtered = filterTree(tree, "login")
		expect(filtered).toHaveLength(1)
		expect(filtered[0].children[0].segment).toBe("users.login")
		expect(filtered[0].children[0].stacked).toBe(true)
		expect(countLeaves(filtered)).toBe(1)
	})
})
