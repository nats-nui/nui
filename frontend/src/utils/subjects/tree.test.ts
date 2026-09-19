import { describe, expect, it } from "vitest"
import { SubjectHit } from "@/types/Subject"
import { buildSubjectTree, filterHits, flattenHits, MAX_TREE_CHILDREN, occupiedKey } from "./tree"

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
		expect(tree[0].names).toBe(2)
	})

	it("stacks anything deeper than a couple of levels instead of opening the whole chain", () => {
		const tree = buildSubjectTree([
			hit("devices.sensors.temp", { core: { count: 3 } }),
			hit("devices.sensors.humidity", { streams: [{ name: "IOT", count: 9 }] }),
			hit("agents.heartbeat.region.worker", { core: { count: 1 } }),
		])
		expect(tree.map(n => n.segment)).toEqual(["agents", "devices"])
		expect(tree[0].children.map(c => c.segment)).toEqual(["heartbeat.region.worker"])
		expect(tree[0].children[0].path).toBe("agents.heartbeat.region.worker")
		expect(tree[0].children[0].children).toEqual([])
		expect(tree[1].children.map(c => c.segment)).toEqual(["sensors.humidity", "sensors.temp"])
		expect(tree.reduce((n, node) => n + node.names, 0)).toBe(3)
	})

	it("nests stored names under the folder you opened instead of dumping siblings", () => {
		const tree = buildSubjectTree([
			hit("$KV.shop", { kind: "kv", expandable: true, streams: [{ name: "KV_shop", kind: "kv", pattern: "$KV.shop.>" }] }),
			hit("$KV.shop.item-1", { parent: "$KV.shop", kind: "occupied", streams: [{ name: "KV_shop", kind: "kv", count: 1 }] }),
			hit("$KV.shop.orders.created", { parent: "$KV.shop", kind: "occupied", streams: [{ name: "KV_shop", kind: "kv", count: 1 }] }),
			hit("inventory.items", { kind: "pattern", expandable: true, streams: [{ name: "INVENTORY", pattern: "inventory.items.>" }] }),
			hit("inventory.items.inventory.details", { parent: "inventory.items", kind: "occupied", streams: [{ name: "INVENTORY", count: 2 }] }),
		])
		const kv = tree.find(n => n.segment == "$KV")
		expect(kv?.children.map(c => c.segment)).toEqual(["shop"])
		expect(kv?.children[0].children.map(c => c.segment)).toEqual(["item-1", "orders.created"])
		const inventory = tree.find(n => n.segment == "inventory")
		expect(inventory?.children.map(c => c.segment)).toEqual(["items"])
		expect(inventory?.children[0].children.map(c => c.segment)).toEqual(["inventory.details"])
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

describe("filterHits", () => {
	it("finds a name that the browse cap would hide behind remainder", () => {
		const hits = Array.from({ length: MAX_TREE_CHILDREN + 12 }, (_, i) =>
			hit(`root.n${i.toString().padStart(2, "0")}`),
		)
		const hidden = hits[hits.length - 1]
		const browsed = buildSubjectTree(hits)
		expect(browsed[0].children.some(c => c.path == hidden.subject)).toBe(false)

		const found = buildSubjectTree(filterHits(hits, hidden.subject))
		expect(found[0].children.map(c => c.path)).toContain(hidden.subject)
		expect(found[0].children.some(c => c.remainder)).toBe(false)
	})
})

it("nests wildcard matches beneath their capture pattern", () => {
 const hits = flattenHits({ showCore: false, showJetStream: true,
  jetstream: { streams: [{ name: "ORDERS", kind: "stream", subjects: [{ subject: "orders.*", pattern: "orders.*", kind: "pattern" }] }] },
  occupied: { "ORDERS::orders.*": { stream: "ORDERS", subjects: [{ subject: "orders.created", kind: "occupied", count: 1 }] } },
 })
 const tree = buildSubjectTree(hits)
 expect(tree[0].children).toHaveLength(1)
 expect(tree[0].children[0].path).toBe("orders.*")
 expect(tree[0].children[0].children[0].path).toBe("orders.created")
})

it("keeps prefix names shallow regardless of input order", () => {
 const hits = [hit("a.b"), hit("a.b.c"), hit("a.b.c.d")]
 const forward = buildSubjectTree(hits)
 expect(buildSubjectTree([...hits].reverse())).toEqual(forward)
 expect(forward[0].children.map(n => n.segment)).toEqual(["b", "b.c", "b.c.d"])
 expect(forward[0].children.every(n => n.children.length == 0)).toBe(true)
})

it("hides system names immediately without hiding KV and Object names", () => {
 const hits = flattenHits({ showCore: true, showJetStream: false, noSysMessages: true,
  core: { filter: ">", listenMs: 0, heard: 5, truncated: false, subjects: ["$SYS.a", "$JS.a", "_INBOX.a", "$KV.a", "$O.a"].map(subject => ({ subject, count: 1 })) },
 })
 expect(hits.map(h => h.subject)).toEqual(["$KV.a", "$O.a"])
})

it("allows an exact capture name to open its last stored message", () => {
 const hits = flattenHits({ showCore: false, showJetStream: true,
  jetstream: { streams: [{ name: "ORDERS", kind: "stream", subjects: [{ subject: "orders.created", pattern: "orders.created", kind: "pattern" }] }] },
 })
 expect(hits[0].expandable).toBe(false)
})
