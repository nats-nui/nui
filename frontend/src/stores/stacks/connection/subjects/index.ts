import messagesApi from "@/api/messages"
import { drawerCardsSo } from "@/stores/docs/cards"
import subjectsApi from "@/api/subjects"
import streamsApi from "@/api/streams"
import cnnSo from "@/stores/connections"
import { buildStore } from "@/stores/docs/utils/factory"
import viewSetup, { ViewStore } from "@/stores/stacks/viewBase"
import { DOC_TYPE } from "@/types"
import { OccupiedCatalog, SubjectSource, CoreCatalog, JetStreamCatalog } from "@/types/Subject"
import { canListen, isLiteralSubject, sampleHint } from "@/utils/subjects/filter"
import { occupiedKey } from "@/utils/subjects/tree"
import { docsSo, focusSo, utils } from "@priolo/jack"
import { mixStores, StoreOf } from "@priolo/jon"
import loadBaseSetup, { LoadBaseStore } from "../../loadBase"
import type { MessagesStore } from "../messages"
import type { StreamMessagesStore } from "../../streams/messages"

const CORE_SAMPLE_MS = 2000

function abortOccupied(store: SubjectsStore, keep?: ReadonlyMap<string, unknown>) {
	const loading = { ...store.state.occupiedLoading }
	for (const [key, request] of Object.entries(loading)) {
		if (keep?.has(key)) continue
		request.abort()
		delete loading[key]
	}
	store.setOccupiedLoading(loading)
}

const setup = {

	state: {
		connectionId: <string>null,

		coreEnabled: true,
		jetstreamEnabled: true,
		noSysMessages: true,
		filter: "",

		core: <CoreCatalog>null,
		jetstream: <JetStreamCatalog>null,
		occupied: <Record<string, OccupiedCatalog>>{},
		occupiedLoading: <Record<string, AbortController>>{},
		coreAbort: <AbortController>null,
		catalogGen: 0,
		liveRequest: <AbortController>null,
		streamRequest: <AbortController>null,

		textSearch: <string>null,
		select: <string>null,

		width: 350,
		widthMax: 800,
	},

	getters: {
		getTitle: (_: void, store?: ViewStore) => "SUBJECTS",
		getSubTitle: (_: void, store?: ViewStore) => cnnSo.getById((<SubjectsStore>store).state.connectionId)?.name ?? "--",
		getSerialization: (_: void, store?: ViewStore) => {
			const state = store.state as SubjectsState
			return {
				...viewSetup.getters.getSerialization(null, store),
				connectionId: state.connectionId,
				coreEnabled: state.coreEnabled,
				jetstreamEnabled: state.jetstreamEnabled,
				noSysMessages: state.noSysMessages,
				filter: state.filter,
				textSearch: state.textSearch,
			}
		},
	},

	actions: {
		setSerialization: (data: any, store?: ViewStore) => {
			viewSetup.actions.setSerialization(data, store)
			const state = store.state as SubjectsState
			state.connectionId = data.connectionId
			state.coreEnabled = data.coreEnabled ?? true
			state.jetstreamEnabled = data.jetstreamEnabled ?? true
			state.noSysMessages = data.noSysMessages ?? true
			state.filter = data.filter ?? ""
			state.textSearch = data.textSearch
		},

		async fetch(_: void, store?: LoadBaseStore) {
			const s = <SubjectsStore>store
			if (s.state.jetstreamEnabled) await s.fetchJetStream()
			await loadBaseSetup.actions.fetch(_, store)
		},

		async fetchIfVoid(_: void, store?: SubjectsStore) {
			if (store.state.jetstreamEnabled && !store.state.jetstream) await store.fetchJetStream()
		},

		async fetchJetStream(_: void, store?: SubjectsStore) {
			const gen = ++store.state.catalogGen
			const catalog = await subjectsApi.jetstream(store.state.connectionId, store.state.noSysMessages, { store, manageAbort: true, noError: true })
			if (gen != store.state.catalogGen) return
			if (!Array.isArray(catalog?.streams)) {
				store.setJetstream({ streams: store.state.jetstream?.streams ?? [], error: catalog?.error || "could not be read" })
				return
			}
			const sources = new Map<string, { name: string, pattern: string }>()
			for (const stream of catalog.streams) {
				for (const item of stream.subjects) {
					const pattern = stream.transformed ? ">" : item.subject
					sources.set(occupiedKey(stream.name, pattern), { name: stream.name, pattern })
				}
			}
			store.setJetstream(catalog)
			store.setOccupied(Object.fromEntries(Object.entries(store.state.occupied).filter(([key]) => sources.has(key))))
			abortOccupied(store, sources)
			const loaded = store.state.occupied
			for (const [key, source] of sources) {
				if (gen != store.state.catalogGen) return
				if (loaded[key]) await store.loadOccupied({ ...source, refresh: true })
			}
		},

		abortCore(_: void, store?: SubjectsStore) {
			store.state.coreAbort?.abort()
			store.setCoreAbort(null)
		},

		async sampleNow(_: void, store?: SubjectsStore) {
			const filter = store.state.filter?.trim() ?? ""
			if (!store.state.coreEnabled || !filter || sampleHint(filter, store.state.noSysMessages)) return
			if (store.state.filter != filter) store.setFilter(filter)
			store.abortCore()
			const ac = new AbortController()
			store.setCoreAbort(ac)
			if (store.state.core?.filter != filter) store.setCore(null)
			try {
				const catalog = await subjectsApi.core(store.state.connectionId, filter, CORE_SAMPLE_MS, store.state.noSysMessages, {
					store, signal: ac.signal, noError: true, loading: false,
				})
				if (ac.signal.aborted) return
				store.setCore(Array.isArray(catalog?.subjects) ? catalog : {
					filter, listenMs: CORE_SAMPLE_MS, heard: 0, truncated: false,
					subjects: [], error: catalog?.error || "could not listen",
				})
			} finally {
				if (store.state.coreAbort === ac) store.setCoreAbort(null)
			}
		},

		toggleCore(_: void, store?: SubjectsStore) {
			if (store.state.coreEnabled) store.abortCore()
			store.setCoreEnabled(!store.state.coreEnabled)
		},

		async toggleJetStream(_: void, store?: SubjectsStore) {
			const next = !store.state.jetstreamEnabled
			store.setJetstreamEnabled(next)
			if (next) await store.fetchIfVoid()
		},

		async toggleNoSysMessages(_: void, store?: SubjectsStore) {
			store.abortCore()
			store.setCore(null)
			store.setNoSysMessages(!store.state.noSysMessages)
			abortOccupied(store)
			if (store.state.jetstreamEnabled) await store.fetchJetStream()
			else {
				store.state.catalogGen++
				store.setJetstream(null)
			}
		},

		async loadOccupied(stream: Pick<SubjectSource, "name" | "pattern"> & { refresh?: boolean }, store?: SubjectsStore) {
			const pattern = stream.pattern || ">"
			const key = occupiedKey(stream.name, pattern)
			if ((!stream.refresh && store.state.occupied[key] && !store.state.occupied[key].error) || store.state.occupiedLoading[key]) return
			const request = new AbortController()
			store.setOccupiedLoading({ ...store.state.occupiedLoading, [key]: request })
			try {
				const catalog = await subjectsApi.occupied(store.state.connectionId, stream.name, pattern, store.state.noSysMessages, {
					store, signal: request.signal, noError: true, loading: false,
				})
				if (request.signal.aborted) return
				const result = Array.isArray(catalog?.subjects) ? catalog : {
					stream: stream.name, subjects: [], error: catalog?.error || "could not be read",
				}
				store.setOccupied({ ...store.state.occupied, [key]: result })
			} finally {
				if (store.state.occupiedLoading[key] == request) {
					const loading = { ...store.state.occupiedLoading }
					delete loading[key]
					store.setOccupiedLoading(loading)
				}
			}
		},

		async openLive(subject: string, store?: SubjectsStore) {
			if (store.state.select !== subject || !canListen(subject)) return
			const { connectionId, group } = store.state
			const match = { type: DOC_TYPE.MESSAGES, connectionId }
			const findCard = () => (utils.findInRoot(group.state.all, match)
				?? utils.findInRoot(docsSo.getAllCards(), match)) as MessagesStore
			store.state.liveRequest?.abort()
			let card = findCard()
			let favorites = card?.state.subscriptions?.filter(sub => sub.favorite)
			if (!favorites) {
				const request = new AbortController()
				store.state.liveRequest = request
				try {
					const saved = await messagesApi.subscriptionIndex(connectionId, { store, signal: request.signal, loading: false })
					if (request.signal.aborted || store.state.select !== subject || !Array.isArray(saved)) return
					card = findCard()
					favorites = card?.state.subscriptions?.filter(sub => sub.favorite) ?? saved
				} catch {
					return // The API logs request failures.
				} finally {
					if (store.state.liveRequest == request) store.state.liveRequest = null
				}
			}
			const subscriptions = [
				{ subject, favorite: favorites.some(sub => sub.subject == subject) },
				...favorites.filter(sub => sub.subject != subject).map(sub => ({ ...sub, favorite: true, disabled: true })),
			]
			const noSysMessages = store.state.noSysMessages && !subject.startsWith("$") && !subject.startsWith("_INBOX")
			if (card) {
				card.setSubscriptions(subscriptions)
				card.setNoSysMessages(noSysMessages)
				card.setSubscriptionsOpen(false)
				card.setPause(false)
				card.sendSubscriptions()
				if (card.state.group == drawerCardsSo && !drawerCardsSo.isOpen()) drawerCardsSo.toggle()
				focusSo.focus(card)
				return
			}
			const view = buildStore<MessagesStore>({ ...match, subscriptions, noSysMessages })
			group.add({ view, index: group.getIndexByView(store) + 1, anim: true })
		},

		async openStreamMessages({ subject, streamName }: { subject: string, streamName: string }, store?: SubjectsStore) {
			if (store.state.select !== subject || !isLiteralSubject(subject) || store.state.streamRequest) return
			const request = new AbortController()
			const connectionId = store.state.connectionId
			store.setStreamRequest(request)
			try {
				const stream = await streamsApi.get(connectionId, streamName, { store, signal: request.signal, loading: false }, subject)
				if (!stream?.state || request.signal.aborted || store.state.select !== subject || !store.state.jetstreamEnabled) return
				const view = buildStore<StreamMessagesStore>({
					type: DOC_TYPE.STREAM_MESSAGES,
					connectionId,
					stream,
					filter: { subjects: [subject] },
				})
				const group = store.state.group
				group.add({ view, index: group.getIndexByView(store) + 1, anim: true })
			} finally {
				store.setStreamRequest(null)
			}
		},

		disposeSubjects(_: void, store?: SubjectsStore) {
			store.state.catalogGen++
			abortOccupied(store)
			store.state.streamRequest?.abort()
			store.state.liveRequest?.abort()
			store.fetchAbort()
			store.abortCore()
		},

		invalidateSubjects(_: void, store?: SubjectsStore) {
			store.disposeSubjects()
			store.setSelect(null)
			store.setCore(null)
			store.setJetstream(null)
			store.setOccupied({})
		},
	},

	mutators: {
		setCoreEnabled: (coreEnabled: boolean) => ({ coreEnabled }),
		setJetstreamEnabled: (jetstreamEnabled: boolean) => ({ jetstreamEnabled }),
		setNoSysMessages: (noSysMessages: boolean) => ({ noSysMessages }),
		setFilter: (filter: string) => ({ filter }),
		setCore: (core: CoreCatalog) => ({ core }),
		setJetstream: (jetstream: JetStreamCatalog) => ({ jetstream }),
		setOccupied: (occupied: Record<string, OccupiedCatalog>) => ({ occupied }),
		setOccupiedLoading: (occupiedLoading: Record<string, AbortController>) => ({ occupiedLoading }),
		setCoreAbort: (coreAbort: AbortController) => ({ coreAbort }),
		setTextSearch: (textSearch: string) => ({ textSearch }),
		setSelect: (select: string) => ({ select }),
		setStreamRequest: (streamRequest: AbortController) => ({ streamRequest }),
	},
}

const subjectsSetup = mixStores(viewSetup, loadBaseSetup, setup)
export interface SubjectsStore extends StoreOf<typeof subjectsSetup> {}
export type SubjectsState = SubjectsStore["state"]
export default subjectsSetup
