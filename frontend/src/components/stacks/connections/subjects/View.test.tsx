import { ReactNode } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import { SubjectsState, SubjectsStore } from "@/stores/stacks/connection/subjects"
import { occupiedKey } from "@/utils/subjects/tree"

vi.mock("@/components/cards/FrameworkCard", () => ({ default: ({ children }: { children: ReactNode }) => children }))
vi.mock("@/stores/layout", () => ({ default: { state: { theme: "boring" } } }))
vi.mock("@priolo/jon", () => ({ useStore: (store: { state: unknown }) => store.state }))
vi.mock("@priolo/jack", () => ({
	LOAD_STATE: { LOADING: 1 },
	Button: ({ children, disabled }: { children: ReactNode, disabled?: boolean }) => <button disabled={disabled}>{children}</button>,
	Dialog: () => null,
	IconButton: ({ children }: { children: ReactNode }) => <button>{children}</button>,
	TooltipWrapCmp: ({ children }: { children: ReactNode }) => children,
	TextInput: () => null,
	FindInputHeader: () => null,
	CopyButton: ({ label }: { label: string }) => <button>{label}</button>,
}))

import SubjectsView from "./View"
import SubjectTree from "./Tree"

function renderSubjects(state: Partial<SubjectsState>) {
	return renderToStaticMarkup(<SubjectsView store={{ state } as SubjectsStore} />)
}

describe("SUBJECTS rendering", () => {
	it.each([
		["_INBOX.>", true, true], ["$SYS.>", true, true], ["$JS.API.>", true, true],
		["_INBOX.>", false, false], ["_INBOXES.>", true, false], [">", true, false],
	] as const)("explains a hidden sample filter %s (hide internal: %s)", (filter, noSysMessages, hidden) => {
		const markup = renderSubjects({ coreEnabled: true, filter, noSysMessages })
		expect(markup.includes("turn on Include internal subjects")).toBe(hidden)
		expect(markup.includes('<button disabled="">SAMPLE (2 s)</button>')).toBe(hidden)
	})

	it("waits for the Core sample before reporting an empty result", () => {
		const markup = renderSubjects({
			coreEnabled: true, coreAbort: new AbortController(), filter: "orders.>",
			core: { filter: "orders.>", subjects: [], heard: 0, listenMs: 2000, truncated: false },
		})
		expect(markup).toContain("SAMPLING")
		expect(markup).not.toContain("No visible traffic matched")
	})

	it("distinguishes an initial, an empty and a filtered sample", () => {
		const core = { filter: "orders.>", subjects: [], heard: 0, listenMs: 2000, truncated: false }
		expect(renderSubjects({ coreEnabled: true })).toContain("Sample a subject such as orders.created")
		expect(renderSubjects({ coreEnabled: true, filter: core.filter, core })).toContain("No visible traffic matched")
		expect(renderSubjects({ coreEnabled: true, textSearch: "other" })).not.toContain("No results match your search.")
		expect(renderSubjects({ coreEnabled: true, filter: core.filter, textSearch: "other",
			core: { ...core, heard: 1, subjects: [{ subject: "orders.created", count: 1 }] },
		})).toContain("No results match your search.")
	})

	it("drops both rows and errors from the previous filter", () => {
		const core = { filter: "private", listenMs: 2000, heard: 1, truncated: false,
			subjects: [{ subject: "private", count: 1 }], error: "not allowed" }
		for (const filter of ["orders.>", ""]) {
			const markup = renderSubjects({ coreEnabled: true, filter, core })
			expect(markup).not.toContain("private")
			expect(markup).not.toContain("No visible traffic matched")
		}
	})

	it("keeps stream patterns visible after a quiet live sample", () => {
		const markup = renderSubjects({
			coreEnabled: true, jetstreamEnabled: true, filter: "orders.>",
			core: { filter: "orders.>", listenMs: 2000, heard: 0, truncated: false, subjects: [] },
			jetstream: { streams: [{ name: "ORDERS", kind: "stream", subjects: [{ subject: "orders.>", kind: "pattern" }] }] },
		})
		expect(markup).toContain("No visible traffic matched")
		expect(markup).toContain('aria-label="Expand orders"')
	})

	it("describes an empty partial page without calling the stream empty", () => {
		const markup = renderSubjects({
			jetstreamEnabled: true,
			jetstream: { streams: [{ name: "ORDERS", kind: "stream", subjects: [{ subject: ">", kind: "pattern" }] }] },
			occupied: { [occupiedKey("ORDERS")]: { stream: "ORDERS", subjects: [], truncated: true } },
		})
		expect(markup).not.toContain("no visible matches")
		expect(markup).toContain("The stored subject list is incomplete.")
	})

	it("shows a failure once for each enabled source and hides cached results when both are off", () => {
		const core = { filter: "orders", subjects: [], heard: 0, listenMs: 2000, truncated: false, error: "not allowed" }
		const jetstream = { streams: [], error: "not enabled on this server" }
		const markup = renderSubjects({ coreEnabled: true, jetstreamEnabled: true, filter: core.filter, core, jetstream })
		expect(markup.match(/cannot subscribe/g)).toHaveLength(1)
		expect(markup.match(/JetStream is not enabled/g)).toHaveLength(1)
		expect(markup).not.toContain("No visible traffic matched")
		const hidden = renderSubjects({
			coreEnabled: false, jetstreamEnabled: false,
			core: { ...core, subjects: [{ subject: "orders", count: 1 }] }, jetstream,
		})
		expect(hidden).toContain("Choose Core NATS or JetStream in Filters.")
		expect(hidden).not.toContain('title="orders')
		expect(hidden).not.toMatch(/cannot subscribe|JetStream is not enabled/)
	})

	it.each(["", "orders.created"])("reveals the matching subject when a search is entered (%j)", textSearch => {
		const markup = renderSubjects({
			jetstreamEnabled: true, textSearch,
			jetstream: { streams: [{ name: "ORDERS", kind: "stream", subjects: [
				{ subject: "orders.created", kind: "pattern" },
				{ subject: "orders.cancelled", kind: "pattern" },
			] }] },
		})
		expect(markup).toContain(textSearch ? 'aria-label="Collapse orders"' : 'aria-label="Expand orders"')
		expect(markup.includes('title="orders.created')).toBe(!!textSearch)
		expect(markup).not.toContain('title="orders.cancelled')
	})

	it("renders a remainder without button semantics or copy controls", () => {
		const markup = renderToStaticMarkup(<SubjectTree nodes={[{
			path: "orders.more", segment: "… 12 more", names: 12, children: [], remainder: true,
		}]} />)
		expect(markup).toContain("… 12 more")
		expect(markup).not.toMatch(/role="button"|tabindex=|aria-expanded=|<button/)
	})

	it.each([["orders.>", true], ["orders", false]])("offers a live subscription for a catalog pattern but skips a grouping folder (%s)", (select, canOpen) => {
		const markup = renderSubjects({
			jetstreamEnabled: true, select,
			jetstream: { streams: [{ name: "ORDERS", kind: "stream", subjects: [
				{ subject: "orders.>", pattern: "orders.>", kind: "pattern" },
			] }] },
		})
		expect(markup.includes("WATCH LIVE MESSAGES")).toBe(canOpen)
		expect(markup).not.toContain("READ FROM JETSTREAM")
	})

	it("offers stream messages for a literal capture even if another stream transforms it", () => {
		const subject = "orders"
		const markup = renderSubjects({
			jetstreamEnabled: true, select: subject,
			jetstream: { streams: [
				{ name: "RAW", kind: "stream", subjects: [{ subject, pattern: subject, kind: "pattern" }] },
				{ name: "TRANSFORMED", kind: "stream", transformed: true, subjects: [{ subject, pattern: subject, kind: "pattern" }] },
			] },
		})
		expect(markup).toContain("READ FROM JETSTREAM · RAW")
		expect(markup).not.toContain("READ FROM JETSTREAM · TRANSFORMED")
		expect(markup).toContain("BROWSE STORED SUBJECTS · TRANSFORMED")
		expect(markup).not.toContain('aria-label="Expand orders"')
	})

	it.each([["ingress", true], ["routed", false], ["", false]])("can browse cached transformed names hidden by Find %j", (textSearch, browse) => {
		const markup = renderSubjects({
			jetstreamEnabled: true, select: "ingress.>", textSearch,
			jetstream: { streams: [{ name: "ROUTED", kind: "stream", transformed: true, subjects: [{ subject: "ingress.>", kind: "pattern" }] }] },
			occupied: { [occupiedKey("ROUTED")]: { stream: "ROUTED", kind: "stream", subjects: [{ subject: "stored.created", kind: "occupied", count: 1 }] } },
		})
		expect(markup.includes("BROWSE STORED SUBJECTS · ROUTED")).toBe(browse)
		expect(markup.includes("Stored subjects listed · ROUTED")).toBe(!browse)
	})
})
