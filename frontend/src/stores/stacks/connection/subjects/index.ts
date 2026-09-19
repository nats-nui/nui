import subjectsApi from "@/api/subjects"
import cnnSo from "@/stores/connections"
import { buildMessageDetail } from "@/stores/docs/utils/factory"
import viewSetup, { ViewStore } from "@/stores/stacks/viewBase"
import { DOC_TYPE } from "@/types"
import { OccupiedCatalog, SubjectHit, CoreCatalog, JetStreamCatalog } from "@/types/Subject"
import { MSG_FORMAT } from "@/utils/editor"
import { canListen, FILTER_EMPTY, normalizeListenFilter, validateListenFilter } from "@/utils/subjects/filter"
import { shouldFetchCore, shouldFetchJetStream, shouldReadWatch, DiscoverReason } from "@/utils/subjects/fetch"
import { occupiedKey } from "@/utils/subjects/tree"
import { mixStores } from "@priolo/jon"
import loadBaseSetup, { LoadBaseState, LoadBaseStore } from "../../loadBase"
import { MessageStore } from "../../message"
import { ViewState } from "../../viewBase"

const CORE_SAMPLE_MS = 2000

const setup = {

	state: {
		connectionId: <string>null,

		coreEnabled: true,
		jetstreamEnabled: true,
		noSysMessages: true,
		filtersOpen: false,
		filter: "",

		core: <CoreCatalog>null,
		jetstream: <JetStreamCatalog>null,
		occupied: <Record<string, OccupiedCatalog>>{},
		occupiedLoading: <string>null,
		listenHint: <string>null,
		coreWatching: false,
		listenGen: 0,
		coreAbort: <AbortController>null,
		watchGen: 0,
		watchFilter: <string>null,
		watchTask: <Promise<void>>null,
		watchReading: false,
		catalogGen: 0,
		occupiedGen: 0,
		messageGen: 0,

		textSearch: <string>null,
		select: <string>null,

		format: MSG_FORMAT.JSON,

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
				format: state.format,
			}
		},
		getConnection: (_: void, store?: SubjectsStore) => cnnSo.getById(store.state.connectionId),
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
			state.format = data.format ?? MSG_FORMAT.JSON
		},

		fetchAbort(_: void, store?: LoadBaseStore) {
			loadBaseSetup.actions.fetchAbort?.(_, store)
		},

		async fetch(_: void, store?: LoadBaseStore) {
			const s = <SubjectsStore>store
			s.setListenHint(null)
			const polling = (s.state.pollingTime ?? 0) > 0
			await s.discover(polling ? "poll" : "refresh")
			await loadBaseSetup.actions.fetch(_, store)
		},

		async fetchIfVoid(_: void, store?: SubjectsStore) {
			await store.discover("open")
		},

		async discover(reason: DiscoverReason, store?: SubjectsStore) {
			await Promise.all([
				shouldFetchJetStream(store.state.jetstreamEnabled, !!store.state.jetstream, reason) ? store.fetchJetStream() : null,
				shouldFetchCore(store.state.coreEnabled, store.state.filter, reason) ? store.fetchCore()
					: shouldReadWatch(store.state.coreEnabled, store.state.coreWatching) ? store.readWatch() : null,
			])
		},

		async fetchJetStream(_: void, store?: SubjectsStore) {
			const gen = ++store.state.catalogGen
			const catalog = await subjectsApi.jetstream(store.state.connectionId, store.state.noSysMessages, { store, manageAbort: true, noError: true })
			if (gen != store.state.catalogGen) return
			if (!Array.isArray(catalog?.streams)) {
				store.setJetstream({ streams: store.state.jetstream?.streams ?? [], error: catalog?.error || "could not be read" })
				return
			}
			store.setJetstream(catalog)
			const loaded = store.state.occupied
			store.state.occupiedGen++
			store.setOccupiedLoading(null)
			for (const stream of catalog.streams) {
				for (const item of stream.subjects) {
					if (gen != store.state.catalogGen) return
					if (!loaded[occupiedKey(stream.name, item.pattern)]) continue
					await store.loadOccupied({ subject: item.subject, streams: [{ name: stream.name, pattern: item.pattern }], refresh: true })
				}
			}
			if (gen != store.state.catalogGen) return
			const valid = new Set(catalog.streams.flatMap(s => s.subjects.map(item => occupiedKey(s.name, item.pattern))))
			store.setOccupied(Object.fromEntries(Object.entries(store.state.occupied).filter(([key]) => valid.has(key))))
		},

		abortCore(_: void, store?: SubjectsStore) {
			store.state.listenGen++
			store.state.coreAbort?.abort()
			store.state.coreAbort = null
		},

		async watchCore(activeFilter?: string, store?: SubjectsStore) {
			const filter = normalizeListenFilter(activeFilter ?? store.state.filter)
			if (!canListen(filter)) return
			if (activeFilter == null && store.state.filter != filter) store.setFilter(filter)
			store.abortCore()
			const gen = ++store.state.watchGen
			store.state.watchFilter = filter
			store.setCoreWatching(true)
			const noSysMessages = store.state.noSysMessages
			const task = (store.state.watchTask ?? Promise.resolve()).then(async () => {
				if (gen != store.state.watchGen) return
				const catalog = await subjectsApi.watch(store.state.connectionId, filter, noSysMessages, store.state.uuid, {
					store, noError: true, loading: false,
				})
				if (gen != store.state.watchGen) return
				if (!catalog?.watching || !Array.isArray(catalog.subjects)) {
					store.setCoreWatching(false)
					store.setCore({
						filter,
						listenMs: 0,
						heard: 0,
						truncated: false,
						subjects: [],
						error: catalog?.error || "could not listen",
					})
					return
				}
				store.setCore(catalog)
			})
			store.state.watchTask = task
			await task
		},

		async readWatch(_: void, store?: SubjectsStore) {
			if (!store.state.coreWatching || store.state.watchReading) return
			const gen = store.state.watchGen
			store.state.watchReading = true
			try {
				await store.state.watchTask
				if (gen != store.state.watchGen) return
				const catalog = await subjectsApi.snapshot(store.state.connectionId, store.state.uuid, {
					store, noError: true, loading: false,
				})
				if (gen != store.state.watchGen) return
				if (!catalog?.watching || !Array.isArray(catalog.subjects)) {
					store.setCoreWatching(false)
				}
				if (catalog && Array.isArray(catalog.subjects)) store.setCore(catalog)
			} finally { store.state.watchReading = false }
		},

		async stopWatch(_: void, store?: SubjectsStore) {
			store.state.watchGen++
			store.abortCore()
			store.setCoreWatching(false)
			if (store.state.connectionId) {
				const task = (store.state.watchTask ?? Promise.resolve()).then(() =>
					subjectsApi.unwatch(store.state.connectionId, store.state.uuid, { store, noError: true, loading: false }))
				store.state.watchTask = task
				await task
			}
		},

		async fetchCore(_: void, store?: SubjectsStore) {
			const filter = normalizeListenFilter(store.state.filter)
			if (!canListen(filter)) return
			if (store.state.filter != filter) store.setFilter(filter)
			store.abortCore()
			const ac = new AbortController()
			store.state.coreAbort = ac
			const gen = store.state.listenGen + 1
			store.state.listenGen = gen
			const prev = store.state.core
			if (!prev || prev.filter != filter) {
				store.setCore({
					filter,
					listenMs: CORE_SAMPLE_MS,
					heard: 0,
					truncated: false,
					subjects: [],
				})
			}
			const catalog = await subjectsApi.core(store.state.connectionId, filter, CORE_SAMPLE_MS, store.state.noSysMessages, {
				store, signal: ac.signal, noError: true, loading: false,
			})
			if (store.state.listenGen != gen) return
			if (!catalog || !Array.isArray(catalog.subjects)) {
				store.setCore({
					filter,
					listenMs: CORE_SAMPLE_MS,
					heard: 0,
					truncated: false,
					subjects: [],
					error: catalog?.error || "could not listen",
				})
				return
			}
			store.setCore(catalog)
		},

		async toggleCore(_: void, store?: SubjectsStore) {
			const next = !store.state.coreEnabled
			store.setCoreEnabled(next)
			if (!next) {
				await store.stopWatch()
				return
			}
			await store.discover("toggle")
		},

		async toggleJetStream(_: void, store?: SubjectsStore) {
			const next = !store.state.jetstreamEnabled
			store.setJetstreamEnabled(next)
			if (next) await store.discover("toggle")
		},

		async toggleNoSysMessages(_: void, store?: SubjectsStore) {
			store.setNoSysMessages(!store.state.noSysMessages)
			store.state.occupiedGen++
			store.setOccupiedLoading(null)
			if (store.state.jetstreamEnabled) await store.fetchJetStream()
			else store.setJetstream(null)
			if (store.state.coreWatching) {
				await store.watchCore(store.state.watchFilter)
				return
			}
			if (store.state.core && canListen(store.state.filter)) await store.fetchCore()
		},

		async listenNow(_: void, store?: SubjectsStore) {
			const filter = normalizeListenFilter(store.state.filter)
			if (store.state.coreWatching && (!filter || filter == store.state.watchFilter)) {
				await store.stopWatch()
				return
			}
			if (!filter) {
				store.setListenHint(FILTER_EMPTY)
				return
			}
			const problem = validateListenFilter(filter)
			if (problem) {
				store.setListenHint(problem)
				return
			}
			if (store.state.filter != filter) store.setFilter(filter)
			store.setListenHint(null)
			await store.watchCore()
		},

		async listenAll(_: void, store?: SubjectsStore) {
			store.setFilter(">")
			store.setListenHint(null)
			await store.watchCore()
		},

		async loadOccupied(hit: SubjectHit & { refresh?: boolean }, store?: SubjectsStore) {
			const stream = hit.streams[0]
			if (!stream) return
			const pattern = stream.pattern || ">"
			const key = occupiedKey(stream.name, pattern)
			if ((!hit.refresh && store.state.occupied[key] && !store.state.occupied[key].error) || store.state.occupiedLoading == key) return
			const gen = store.state.occupiedGen
			store.setOccupiedLoading(key)
			try {
				const catalog = await subjectsApi.occupied(store.state.connectionId, stream.name, pattern, store.state.noSysMessages, {
					store, noError: true, loading: false,
				})
				if (gen != store.state.occupiedGen) return
				if (!catalog || !Array.isArray(catalog.subjects)) {
					store.setOccupied({
						...store.state.occupied,
						[key]: { stream: stream.name, subjects: [], error: catalog?.error || "could not be read" },
					})
					return
				}
				store.setOccupied({ ...store.state.occupied, [key]: catalog })
			} finally {
				if (store.state.occupiedLoading == key) store.setOccupiedLoading(null)
			}
		},

		async openHit(hit: SubjectHit, store?: SubjectsStore) {
			const gen = ++store.state.messageGen
			store.setSelect(hit.subject)
			if (hit.expandable && hit.kind != "occupied") {
				await store.loadOccupied(hit)
				return
			}
			if (!hit.streams.length) return
			const stream = hit.streams[0]
			if (!stream) return
			const message = await subjectsApi.last(store.state.connectionId, hit.subject, stream.name, { store, loading: false })
			if (!message || gen != store.state.messageGen) return

			const storeMsg = store.state.linked as MessageStore
			if (storeMsg?.state.type == DOC_TYPE.MESSAGE) {
				if (storeMsg.state.message?.subject == message.subject && storeMsg.state.message?.payload == message.payload) {
					store.state.group.addLink({ view: null, parent: store, anim: true })
					store.setSelect(null)
				} else {
					storeMsg.setMessage(message)
				}
			} else {
				const view = buildMessageDetail(message, store.state.format, false)
				store.state.group.addLink({ view, parent: store, anim: true })
			}
			store._update()
		},

		disposeSubjects(_: void, store?: SubjectsStore) {
			store.state.catalogGen++
			store.state.occupiedGen++
			store.state.messageGen++
			store.fetchAbort()
			store.stopWatch()
		},
	},

	mutators: {
		setCoreEnabled: (coreEnabled: boolean) => ({ coreEnabled }),
		setJetstreamEnabled: (jetstreamEnabled: boolean) => ({ jetstreamEnabled }),
		setNoSysMessages: (noSysMessages: boolean) => ({ noSysMessages }),
		setFiltersOpen: (filtersOpen: boolean) => ({ filtersOpen }),
		setFilter: (filter: string) => ({ filter }),
		setCore: (core: CoreCatalog) => ({ core }),
		setJetstream: (jetstream: JetStreamCatalog) => ({ jetstream }),
		setOccupied: (occupied: Record<string, OccupiedCatalog>) => ({ occupied }),
		setOccupiedLoading: (occupiedLoading: string) => ({ occupiedLoading }),
		setListenHint: (listenHint: string) => ({ listenHint }),
		setCoreWatching: (coreWatching: boolean) => ({ coreWatching }),
		setTextSearch: (textSearch: string) => ({ textSearch }),
		setSelect: (select: string) => ({ select }),
		setFormat: (format: MSG_FORMAT) => ({ format }),
	},
}

export type SubjectsState = typeof setup.state & ViewState & LoadBaseState
export type SubjectsGetters = typeof setup.getters
export type SubjectsActions = typeof setup.actions
export type SubjectsMutators = typeof setup.mutators
export interface SubjectsStore extends ViewStore, LoadBaseStore, SubjectsGetters, SubjectsActions, SubjectsMutators {
	state: SubjectsState
}
const subjectsSetup = mixStores(viewSetup, loadBaseSetup, setup)
export default subjectsSetup
