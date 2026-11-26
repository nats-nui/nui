import FrameworkCard from "@/components/cards/FrameworkCard"
import FindIcon from "@/icons/FindIcon"
import ReloadIcon from "@/icons/ReloadIcon"
import { SubjectsState, SubjectsStore } from "@/stores/stacks/connection/subjects"
import { cardCls } from "@/themes"
import { statusLines } from "@/utils/subjects/copy"
import { canListen, isLiteralSubject, sampleHint } from "@/utils/subjects/filter"
import { buildSubjectTree, filterHits, flattenHits, MAX_TREE_CHILDREN, occupiedKey } from "@/utils/subjects/tree"
import { Button, Dialog, FindInputHeader, IconButton, LOAD_STATE, TextInput, TooltipWrapCmp } from "@priolo/jack"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useEffect, useMemo, useState } from "react"
import SubjectTree from "./Tree"
import cls from "./View.module.css"

interface Props {
	store?: SubjectsStore
}

function emptyMessage(state: SubjectsState, hasStatus: boolean, hasSubjects: boolean): string | null {
	if (!state.coreEnabled && !state.jetstreamEnabled) return "Choose Core NATS or JetStream in Filters."
	if (hasStatus) return null
	if (hasSubjects) return "No results match your search."
	if (!state.coreEnabled) return "No stream subjects to show."
	if (state.filter?.trim()) return null
	return "Sample a subject such as orders.created to see live traffic."
}

const SubjectsView: FunctionComponent<Props> = ({
	store: subjectsSo,
}) => {

	const subjectsSa = useStore(subjectsSo)
	const [filtersOpen, setFiltersOpen] = useState(false)

	useEffect(() => {
		subjectsSo.fetchIfVoid()
		return () => { subjectsSo.disposeSubjects() }
	}, [subjectsSo])

	const filter = subjectsSa.filter?.trim() ?? ""
	const core = subjectsSa.coreEnabled && subjectsSa.core?.filter === filter ? subjectsSa.core : null
	const jetstream = subjectsSa.jetstreamEnabled ? subjectsSa.jetstream : null
	const occupied = subjectsSa.jetstreamEnabled ? subjectsSa.occupied : null
	const { noSysMessages } = subjectsSa
	const hits = useMemo(() => flattenHits({ core, jetstream, occupied, noSysMessages }),
		[core, jetstream, occupied, noSysMessages])
	const search = subjectsSa.textSearch?.trim().toLowerCase() ?? ""
	const visibleHits = useMemo(() => filterHits(hits, search), [hits, search])
	const tree = useMemo(() => buildSubjectTree(visibleHits), [visibleHits])
	const selected = visibleHits.find(hit => hit.subject === subjectsSa.select)
	const canOpenLive = selected && canListen(selected.subject)
	const streamNames = selected && isLiteralSubject(selected.subject)
		? [...new Set(selected.streams
			.filter(stream => stream.kind === "stream" && (stream.count > 0 || (!stream.pattern && !stream.transformed)))
			.map(stream => stream.name))]
		: []
	const jsLoading = subjectsSa.loadingState == LOAD_STATE.LOADING
	const sampling = !!subjectsSa.coreAbort
	const status = statusLines(sampling ? null : core, jetstream, occupied)
	const hint = subjectsSa.coreEnabled && sampleHint(filter, noSysMessages)
	const handleSample = () => { if (!sampling) subjectsSo.sampleNow() }

	return <FrameworkCard
		className={cardCls("messages")}
		icon={<FindIcon width={24} height={24} />}
		store={subjectsSo}
		actionsRender={<>
			{subjectsSa.jetstreamEnabled && <TooltipWrapCmp content="REFRESH JETSTREAM SUBJECTS">
				<IconButton effect onClick={() => subjectsSo.fetch()}>
					<ReloadIcon />
				</IconButton>
			</TooltipWrapCmp>}
			<FindInputHeader
				placeholder="Find in results"
				value={subjectsSa.textSearch}
				onChange={text => subjectsSo.setTextSearch(text)}
			/>
			<Button select={filtersOpen} onClick={() => setFiltersOpen(!filtersOpen)}>FILTERS</Button>
		</>}
	>
		<div className={cls.body}>
			{subjectsSa.coreEnabled && (
				<div className={cls.filter}>
					<label className={cls.sample}>
						<span className="jack-lbl-prop">LIVE SUBJECT OR PATTERN</span>
						<TextInput
							value={subjectsSa.filter}
							placeholder="orders.> or > for all subjects"
							onChange={value => subjectsSo.setFilter(value)}
							onKeyEnter={handleSample}
						/>
					</label>
					<Button
						style={{ alignSelf: "flex-end" }}
						disabled={sampling || !filter || !!hint}
						children={sampling ? "SAMPLING…" : "SAMPLE (2 s)"}
						onClick={handleSample}
					/>
				</div>
			)}

			{hint && <div className={cls.hint}>{hint}</div>}

			<div className={cls.tree}>
				<SubjectTree
					nodes={tree}
					search={search}
					revealMatches={!!search && visibleHits.length <= MAX_TREE_CHILDREN}
					select={subjectsSa.select}
					onSelect={subject => subjectsSo.setSelect(subject)}
					onExpand={source => subjectsSo.loadOccupied(source)}
					empty={emptyMessage(subjectsSa, !!hint || sampling || jsLoading || status.length > 0, !!hits.length)}
					occupied={occupied}
					occupiedLoading={subjectsSa.occupiedLoading}
				/>
			</div>

			{canOpenLive && (
				<div className={cls.actions}>
					<code>{selected.subject}</code>
					<div className={cls.filter}>
						<Button onClick={() => subjectsSo.openLive(selected.subject)}>WATCH LIVE MESSAGES</Button>
						{selected.streams.filter(stream => stream.transformed).map(stream => {
							const key = occupiedKey(stream.name)
							const result = occupied?.[key]
							const matchesSearch = stream.name.toLowerCase().includes(search)
							if (result && !result.error && matchesSearch) {
								if (result.truncated && !result.subjects.length) return null
								return <span key={key}>{result.subjects.length ? "Stored subjects listed" : "No visible matches"} · {stream.name}</span>
							}
							return <Button key={key} disabled={!!subjectsSa.occupiedLoading?.[key]}
								onClick={() => {
									if (!matchesSearch) subjectsSo.setTextSearch(stream.name)
									subjectsSo.loadOccupied({ name: stream.name })
								}}
							>BROWSE STORED SUBJECTS · {stream.name}</Button>
						})}
						{streamNames.map(streamName => <Button
							key={streamName}
							disabled={!!subjectsSa.streamRequest}
							onClick={() => subjectsSo.openStreamMessages({ subject: selected.subject, streamName })}
						>READ FROM JETSTREAM · {streamName}</Button>)}
					</div>
				</div>
			)}

			{status.length > 0 && (
				<div className={cls.status}>
					{status.map(line => <div key={line}>{line}</div>)}
				</div>
			)}
		</div>

		<Dialog title="FILTERS" store={subjectsSo} open={filtersOpen} width={260}
			onClose={() => setFiltersOpen(false)} closeOnEscape>
			<div className="jack-lyt-form var-dialog">
				<label className="jack-cmp-h">
					<input type="checkbox" checked={subjectsSa.coreEnabled} onChange={() => subjectsSo.toggleCore()} />
					Live traffic (Core NATS)
				</label>
				<label className="jack-cmp-h">
					<input type="checkbox" checked={subjectsSa.jetstreamEnabled} onChange={() => subjectsSo.toggleJetStream()} />
					Stream subjects (JetStream)
				</label>
				<label className="jack-cmp-h">
					<input type="checkbox" checked={!subjectsSa.noSysMessages} onChange={() => subjectsSo.toggleNoSysMessages()} />
					Include internal subjects
				</label>
				<small>System messages ($SYS), JetStream requests ($JS), and reply inboxes (_INBOX).</small>
			</div>
		</Dialog>
	</FrameworkCard>
}

export default SubjectsView
