import CheckRadioOnIcon from "@/icons/CheckRadioOnIcon"
import { StreamMessagesStore } from "@/stores/stacks/streams/messages"
import { StreamMessagesFilter } from "@/stores/stacks/streams/utils/filter"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useEffect, useMemo, useState } from "react"
import cls from "./FllterDialog.module.css"
import { Button, DateTimeInput, Dialog, EditList, EditStringRow, IconToggle, ListMultiWithFilter, NumberInput, TitleAccordion } from "@priolo/jack"



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
		setFilter({ ...filter, startSeq: first })
	}
	const hadleLastSeqClick = () => {
		const last = strMsgSa.stream.state?.lastSeq
		if (last == null) return
		setFilter({ ...filter, startSeq: last })
	}

	// RENDER
	const [subjects, counters] = useMemo(() => [
		Object.keys(strMsgSa.stream?.state?.subjects ?? {}),
		Object.values(strMsgSa.stream?.state?.subjects ?? {})
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

				<div className="jack-cmp-h">
					<IconToggle
						check={!filter.byTime}
						onChange={select => handleFilterPropChange({ byTime: false })}
						trueIcon={<CheckRadioOnIcon />}
					/>
					<div className="jack-lbl-prop">START</div>
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
					onChange={(startSeq: number) => handleFilterPropChange({ startSeq })}
				/>

				<div className="jack-cmp-h">
					<IconToggle
						check={filter.byTime}
						onChange={select => handleFilterPropChange({ byTime: true })}
						trueIcon={<CheckRadioOnIcon />}
					/>
					<div className="jack-lbl-prop">TIME START</div>
				</div>
				<DateTimeInput
					style={{ flex: 1 }}
					value={filter.startTime}
					onChange={(startTime: string) => handleFilterPropChange({ startTime })}
				/>

				<div className="lyt-v">
					<div className="jack-lbl-prop">INTERVAL</div>
					<NumberInput
						style={{ flex: 1 }}
						value={filter.interval}
						onChange={(interval: number) => handleFilterPropChange({ interval })}
					/>
				</div>

				<TitleAccordion title="SUBJECTS OF THE STREAM">
					<ListMultiWithFilter
						items={subjects}
						selects={filter.subjects}
						onChangeSelects={(subjects: string[]) => handleFilterPropChange({ subjects })}
						renderRow={(item, index) => <div className={cls.sbj_row}>
							<div className="jack-lbl-prop">{item}</div>
							<div className={cls.sbj_row_counter}>{counters[index]}</div>
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
					<Button children="OK" onClick={handleApply} />
					<Button children="CANCEL" onClick={handleCancel} />
				</div>

			</div>
		</Dialog>
	)
}

export default FilterDialog

