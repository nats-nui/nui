import { describe, expect, it } from "vitest"
import { SubjectHit } from "@/types/Subject"
import { buildSubjectTree, filterHits, flattenHits, MAX_TREE_CHILDREN, occupiedKey } from "./tree"

function hit(subject: string, opts: Partial<SubjectHit> = {}): SubjectHit {
	return { subject, streams: [], ...opts }
}

describe("flattenHits", () => {
	it("groups transformed names by their stored subject across the whole stream", () => {
		const hits = flattenHits({
			jetstream: { streams: [{ name: "ORDERS", kind: "stream", transformed: true,
				subjects: [{ subject: "orders.created", kind: "pattern" }, { subject: "returns.>", kind: "pattern" }],
			}] },
			occupied: { [occupiedKey("ORDERS")]: { stream: "ORDERS", kind: "stream",
				subjects: [{ subject: "archive.created", kind: "occupied", count: 2 }],
			} },
		})
		expect(hits.slice(0, 2).every(hit => !hit.streams[0].pattern && hit.streams[0].transformed)).toBe(true)
		expect(buildSubjectTree(hits).map(node => node.path)).toEqual(["archive", "orders", "returns"])
		expect(hits.find(hit => hit.subject == "archive.created")?.streams).toEqual([{ name: "ORDERS", kind: "stream", count: 2 }])
	})

	it.each([["orders", "orders.>"], ["orders.>", "orders"]])("keeps literal and wildcard capture names distinct (%s, %s)", (first, second) => {
		const hits = flattenHits({
			jetstream: { streams: [{ name: "ORDERS", kind: "stream", subjects: [first, second].map(subject => ({ subject, pattern: subject, kind: "pattern" as const })) }] },
			occupied: { [occupiedKey("ORDERS", "orders.>")]: { stream: "ORDERS", subjects: [{ subject: "orders.created", kind: "occupied", count: 1 }] } },
		})
		const tree = buildSubjectTree(hits)
		expect(tree[0].path).toBe("orders")
		expect(tree[0].hit.streams[0].pattern).toBeUndefined()
		expect(tree[0].children[0].path).toBe("orders.>")
		expect(tree[0].children[0].hit.streams[0].pattern).toBe("orders.>")
		expect(tree[0].children[0].children[0].path).toBe("orders.created")
	})

	it("merges the same name from core and a stream without adding their counts", () => {
		const hits = flattenHits({
			core: {
				filter: "orders.>", listenMs: 2000, heard: 1, truncated: false,
				subjects: [{ subject: "orders.created", count: 2 }],
			},
			jetstream: {
				streams: [{ name: "ORDERS", kind: "stream", subjects: [{ subject: "orders.created", kind: "occupied", count: 40 }] }],
			},
		})
		expect(hits).toHaveLength(1)
		expect(hits[0].coreCount).toBe(2)
		expect(hits[0].streams).toEqual([{ name: "ORDERS", kind: "stream", pattern: undefined, count: 40 }])
	})

	it("merges stored names from each loaded stream under a shared pattern", () => {
		const pattern = "orders.>"
		const hits = flattenHits({
			jetstream: { streams: ["ORDERS", "COPY"].map(name => ({
				name, kind: "stream", subjects: [{ subject: pattern, kind: "pattern", pattern }],
			})) },
			occupied: {
				[occupiedKey("ORDERS", pattern)]: { stream: "ORDERS", kind: "stream", subjects: [
					{ subject: "orders.created", kind: "occupied", count: 2 },
					{ subject: "orders.cancelled", kind: "occupied", count: 1 },
				] },
				[occupiedKey("COPY", pattern)]: { stream: "COPY", kind: "stream", subjects: [
					{ subject: "orders.created", kind: "occupied", count: 5 },
				] },
				[occupiedKey("REMOVED", pattern)]: { stream: "REMOVED", kind: "stream", subjects: [
					{ subject: "orders.stale", kind: "occupied", count: 1 },
				] },
			},
		})
		const patternNode = buildSubjectTree(hits)[0].children[0]
		expect(patternNode.hit.streams.map(s => [s.name, s.pattern])).toEqual([["ORDERS", pattern], ["COPY", pattern]])
		expect(patternNode.children.map(node => node.path)).toEqual(["orders.cancelled", "orders.created"])
		expect(patternNode.children[1].hit.streams.map(({ name, count }) => [name, count])).toEqual([["ORDERS", 2], ["COPY", 5]])
	})

	it("keeps a bucket pattern separate from its literal prefix and preserves stored key metadata", () => {
		const hits = flattenHits({
			core: { filter: ">", listenMs: 2000, heard: 2, truncated: false, subjects: [{ subject: "$KV.shop", count: 2 }] },
			jetstream: {
				streams: [
					{ name: "KV_shop", kind: "kv", subjects: [{ subject: "$KV.shop.>", kind: "kv", pattern: "$KV.shop.>" }] },
					{ name: "PREFIX", kind: "stream", subjects: [{ subject: "$KV.shop", kind: "pattern", pattern: "$KV.shop" }] },
				],
			},
			occupied: {
				[occupiedKey("KV_shop", "$KV.shop.>")]: {
					stream: "KV_shop", kind: "kv",
					subjects: [{ subject: "$KV.shop.item-1", kind: "occupied", count: 1 }],
				},
			},
		})
		const prefix = hits.find(h => h.subject == "$KV.shop")
		expect(prefix?.coreCount).toBe(2)
		expect(prefix?.streams.map(s => s.name)).toEqual(["PREFIX"])
		expect(prefix?.streams[0].pattern).toBeUndefined()
		const bucket = hits.find(h => h.subject == "$KV.shop.>")
		expect(bucket?.streams.map(s => s.name)).toEqual(["KV_shop"])
		expect(bucket?.streams[0].pattern).toBe("$KV.shop.>")
		const key = hits.find(h => h.subject == "$KV.shop.item-1")
		expect(key?.streams[0].kind).toBe("kv")
		expect(key?.kind).toBe("occupied")
		expect(key?.streams[0].pattern).toBeUndefined()
		expect(key?.parent).toBe("$KV.shop.>")
		const tree = buildSubjectTree(hits)
		expect(tree[0].children.map(n => n.path)).toEqual(["$KV.shop", "$KV.shop.>"])
		expect(tree[0].children[1].children.map(n => n.segment)).toEqual(["item-1"])
	})

})

describe("buildSubjectTree", () => {
	it("keeps a family at the first token and a child that is also a name", () => {
		const tree = buildSubjectTree([
			hit("devices.sensors", { coreCount: 3 }),
			hit("devices", { coreCount: 1 }),
		])
		expect(tree).toHaveLength(1)
		expect(tree[0].segment).toBe("devices")
		expect(tree[0].hit?.coreCount).toBe(1)
		expect(tree[0].children.map(c => c.segment)).toEqual(["sensors"])
		expect(tree[0].names).toBe(2)
	})

	it("limits the tree to two levels", () => {
		const tree = buildSubjectTree([
			hit("devices.sensors.temp", { coreCount: 3 }),
			hit("devices.sensors.humidity", { streams: [{ name: "IOT", count: 9 }] }),
			hit("billing.orders.eu.created", { coreCount: 1 }),
		])
		expect(tree.map(n => n.segment)).toEqual(["billing", "devices"])
		expect(tree[0].children.map(c => c.segment)).toEqual(["orders.eu.created"])
		expect(tree[0].children[0].path).toBe("billing.orders.eu.created")
		expect(tree[0].children[0].children).toEqual([])
		expect(tree[1].children.map(c => c.segment)).toEqual(["sensors.humidity", "sensors.temp"])
		expect(tree.reduce((n, node) => n + node.names, 0)).toBe(3)
	})

	it("nests stored names under their pattern or bucket", () => {
		const tree = buildSubjectTree([
			hit("$KV.shop.>", { kind: "kv", streams: [{ name: "KV_shop", kind: "kv", pattern: "$KV.shop.>" }] }),
			hit("$KV.shop.item-1", { parent: "$KV.shop.>", kind: "occupied", streams: [{ name: "KV_shop", kind: "kv", count: 1 }] }),
			hit("$KV.shop.orders.created", { parent: "$KV.shop.>", kind: "occupied", streams: [{ name: "KV_shop", kind: "kv", count: 1 }] }),
			hit("inventory.items", { kind: "pattern", streams: [{ name: "INVENTORY", pattern: "inventory.items.>" }] }),
			hit("inventory.items.inventory.details", { parent: "inventory.items", kind: "occupied", streams: [{ name: "INVENTORY", count: 2 }] }),
		])
		const kv = tree.find(n => n.segment == "$KV")
		expect(kv?.children.map(c => c.segment)).toEqual(["shop.>"])
		expect(kv?.children[0].children.map(c => c.segment)).toEqual(["item-1", "orders.created"])
		const inventory = tree.find(n => n.segment == "inventory")
		expect(inventory?.children.map(c => c.segment)).toEqual(["items"])
		expect(inventory?.children[0].children.map(c => c.segment)).toEqual(["inventory.details"])
	})

	it("caps child rows and counts the remainder", () => {
		const hits = Array.from({ length: MAX_TREE_CHILDREN + 12 }, (_, i) => hit(`root.n${i.toString().padStart(2, "0")}`))
		const tree = buildSubjectTree(hits)
		expect(tree[0].children).toHaveLength(MAX_TREE_CHILDREN + 1)
		expect(tree[0].children[MAX_TREE_CHILDREN].remainder).toBe(true)
		expect(tree[0].children[MAX_TREE_CHILDREN].segment).toMatch(/12 more/)
		expect(tree[0].children[MAX_TREE_CHILDREN].names).toBe(12)
		expect(tree[0].names).toBe(hits.length)
	})

	it("keeps tokens matched by an interior wildcard in the displayed name", () => {
		const tree = buildSubjectTree([hit("a.*.b.>"), hit("a.b.b.x", { parent: "a.*.b.>" })])
		expect(tree[0].children[0].children[0]).toMatchObject({ path: "a.b.b.x", segment: "b.b.x" })
	})

	it("groups a stored subject normally when search hides its capture", () => {
		const tree = buildSubjectTree([hit("orders.eu"), hit("changed.us", { parent: "orders" })])
		expect(tree.map(group => group.path)).toEqual(["changed", "orders"])
		expect(tree[0].children[0].path).toBe("changed.us")
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
	const hits = flattenHits({
		jetstream: { streams: [{ name: "ORDERS", kind: "stream", subjects: [{ subject: "orders.*", pattern: "orders.*", kind: "pattern" }] }] },
		occupied: { [occupiedKey("ORDERS", "orders.*")]: { stream: "ORDERS", subjects: [{ subject: "orders.created", kind: "occupied", count: 1 }] } },
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
	const hits = flattenHits({ noSysMessages: true,
		core: { filter: ">", listenMs: 0, heard: 5, truncated: false, subjects: ["$SYS.a", "$JS.a", "_INBOX.a", "$KV.a", "$O.a"].map(subject => ({ subject, count: 1 })) },
	})
	expect(hits.map(h => h.subject)).toEqual(["$KV.a", "$O.a"])
})
