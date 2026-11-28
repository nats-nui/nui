import { StreamMessagesStore } from "@/stores/stacks/streams/messages"
import { StreamMessagesFilter } from "@/stores/stacks/streams/utils/filter"
import { useStore } from "@priolo/jon"
import dayjs from "dayjs"
import { FunctionComponent, useEffect, useMemo, useState } from "react"
import cls from "./FllterDialog.module.css"
import { Button, DateTimeInput, Dialog, EditList, EditStringRow, ListMultiWithFilter, NumberInput, TitleAccordion } from "@priolo/jack"



interface Props {
	store: StreamMessagesStore
}

const FilterDialog: FunctionComponent<Props> = ({
	store: strMsgSo,
}) => {

	// STORE
	const strMsgSa = useStore(strMsgSo)

	// HOOKs
	const [filter, setFilter] = useState<StreamMessagesFilter>(null)
	useEffect(() => {
		if (!strMsgSo.state.filtersOpen) return
		setFilter({ ...strMsgSo.state.filter, subjects: [...strMsgSo.state.filter.subjects] })
	}, [strMsgSo.state.filtersOpen])

	// HANDLER
	const handleFilterPropChange = (prop: Partial<StreamMessagesFilter>) => {
		setFilter({ ...filter, ...prop })
	}
	const handleClose = () => {
		strMsgSo.setFiltersOpen(false)
	}
	const handleApply = () => {
		strMsgSo.setFiltersOpen(false)
		strMsgSo.filterApply({ ...filter })
	}
	const handleCancel = () => {
		strMsgSo.setFiltersOpen(false)
	}
	const handleChangeSubjectsCustom = (newSubjectsCustom: string[]) => {
		strMsgSo.setSubjectsCustom(newSubjectsCustom)
	}
	const hadleFirstSeqClick = () => {
		const first = strMsgSa.stream.state?.firstSeq
		if (first == null) return
		handleFilterPropChange({ byTime: false, startSeq: first })
	}
	const hadleLastSeqClick = () => {
		const last = strMsgSa.stream.state?.lastSeq
		if (last == null) return
		handleFilterPropChange({ byTime: false, startSeq: last })
	}

	// RENDER
	const [subjects, counters] = useMemo(() => [
		Object.keys(strMsgSa.stream?.state?.subjects ?? {}) as string[],
		Object.values(strMsgSa.stream?.state?.subjects ?? {}) as number[]
	], [strMsgSa.stream?.state?.subjects])

	if (!filter) return null

	const width = subjects.length > 15 && subjects[13].length > 49 ? 400 : 250
	const firstSeq = strMsgSa.stream.state?.firstSeq ?? 0
	const lastSeq = strMsgSa.stream.state?.lastSeq ?? 0

	return (
		<Dialog noCloseOnClickParent
			title="FILTERS"
			store={strMsgSo}

			width={width}
			open={strMsgSa.filtersOpen}
			onClose={handleClose}
		>
			<div className="jack-lyt-form var-dialog">

				<label className="jack-cmp-h jack-lbl-prop">
					<input type="radio" name={strMsgSa.uuid} checked={!filter.byTime && filter.startSeq == null}
						onChange={() => handleFilterPropChange({ byTime: false, startSeq: null })} />
					LATEST MATCHING MESSAGES
				</label>
				<div className="jack-cmp-h">
					<label className="jack-cmp-h jack-lbl-prop">
						<input type="radio" name={strMsgSa.uuid} checked={!filter.byTime && filter.startSeq != null}
							onChange={() => handleFilterPropChange({ byTime: false, startSeq: filter.startSeq ?? firstSeq })} />
						START SEQUENCE
					</label>
					<div style={{ flex: 1 }} />
					<div style={{ display: "flex", alignItems: "center", gap: 2 }}>
						[<Button onClick={hadleFirstSeqClick}>{firstSeq}</Button>
						:
						<Button onClick={hadleLastSeqClick}>{lastSeq}</Button>
						]
					</div>
				</div>
				<NumberInput
					style={{ flex: 1 }}
					value={filter.startSeq}
					onChange={(startSeq: number) => handleFilterPropChange({ byTime: false, startSeq })}
				/>

				<label className="jack-cmp-h jack-lbl-prop">
					<input type="radio" name={strMsgSa.uuid} checked={!!filter.byTime}
						onChange={() => handleFilterPropChange({ byTime: true, startSeq: null })} />
					START TIME (LOCAL)
				</label>
				<DateTimeInput
					style={{ flex: 1 }}
					value={filter.startTime}
					onChange={(startTime: string) => handleFilterPropChange({ byTime: true, startTime, startSeq: null })}
				/>

				<div className="lyt-v">
					<div className="jack-lbl-prop">MESSAGE COUNT</div>
					<NumberInput
						style={{ flex: 1 }}
						value={filter.interval}
						onChange={(interval: number) => handleFilterPropChange({ interval })}
					/>
					{!filter.byTime && filter.startSeq == null && <small>Use 1 for the last matching message.</small>}
				</div>

				<TitleAccordion title="SUBJECTS OF THE STREAM">
					<ListMultiWithFilter
						items={subjects}
						selects={filter.subjects}
						onChangeSelects={(subjects: string[]) => handleFilterPropChange({ subjects })}
						renderRow={(item, index) => <div className={cls.sbj_row}>
							<div className="jack-lbl-prop">{item}</div>
							<div className={cls.sbj_row_counter}>{counters[index] ?? 0}</div>
						</div>}
					/>
				</TitleAccordion>

				<TitleAccordion title="CUSTOM SUBJECTS">
					<EditList<string>
						items={strMsgSa.subjectsCustom}
						onItemsChange={handleChangeSubjectsCustom}

						placeholder="ex. place01.* or sensors.>"
						onNewItem={() => ""}
						fnIsVoid={i => !i || i.trim().length == 0}
						RenderRow={EditStringRow}
					/>
				</TitleAccordion>

				<div className="cmp-footer">
					<Button children="OK" disabled={filter.byTime && (!filter.startTime || !dayjs(filter.startTime).isValid())} onClick={handleApply} />
					<Button children="CANCEL" onClick={handleCancel} />
				</div>

			</div>
		</Dialog>
	)
}

export default FilterDialog

