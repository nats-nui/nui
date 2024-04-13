import TitleAccordion from "@/components/accordion/TitleAccordion"
import Button from "@/components/buttons/Button"
import IconToggle from "@/components/buttons/IconToggle"
import Dialog from "@/components/dialogs/Dialog"
import DateTimeInput from "@/components/input/DateTimeInput"
import NumberInput from "@/components/input/NumberInput"
import CheckRadioOnIcon from "@/icons/CheckRadioOnIcon"
import { StreamMessagesStore } from "@/stores/stacks/streams/messages"
import { StreamMessagesFilter } from "@/stores/stacks/streams/utils/filter"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useEffect, useMemo, useState } from "react"
import ListMultiWithFilter from "../../../lists/ListMultiWithFilter"



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
	const handleFilterPropChange = (prop: Partial<StreamMessagesFilter>) => setFilter({ ...filter, ...prop })
	const handleClose = () => {
		strMsgSo.setFiltersOpen(false)
	}
	const handleApply = () => {
		strMsgSo.setFiltersOpen(false)
		strMsgSo.filterApply(filter)
	}

	// RENDER
	let subjects = useMemo(() => Object.keys(strMsgSa.stream?.state?.subjects ?? {}), [strMsgSa.stream?.state?.subjects])
	if (!filter) return null
	const width = subjects.length > 15 && subjects[13].length > 49 ? 400 : 220

	return (
		<Dialog
			title="FILTERS"
			store={strMsgSo}
			width={width}
			open={strMsgSa.filtersOpen}
			onClose={handleClose}
		>
			<div className="lyt-form var-dialog">
				<div className="cmp-h">
					<IconToggle
						check={!filter.byTime}
						onChange={select => handleFilterPropChange({ byTime: false })}
						trueIcon={<CheckRadioOnIcon />}
					/>
					<div className="lbl-prop">SEQUENCE START</div>
				</div>
				<NumberInput
					style={{ flex: 1 }}
					value={filter.startSeq}
					onChange={(startSeq: number) => handleFilterPropChange({ startSeq })}
				/>

				<div className="cmp-h">
					<IconToggle
						check={filter.byTime}
						onChange={select => handleFilterPropChange({ byTime: true })}
						trueIcon={<CheckRadioOnIcon />}
					/>
					<div className="lbl-prop">TIME START</div>
				</div>
				<DateTimeInput
					style={{ flex: 1 }}
					value={filter.startTime}
					onChange={(startTime: string) => handleFilterPropChange({ startTime: +startTime })}
				/>

				<div className="lyt-v">
					<div className="lbl-prop">INTERVAL</div>
					<NumberInput
						style={{ flex: 1 }}
						value={filter.interval}
						onChange={(interval: number) => handleFilterPropChange({ interval })}
					/>
				</div>

				{/* <div className="lyt-v">
					<div className="lbl-prop">SUBJECTS OF THE STREAM</div>
					<div className="lyt-quote">
						<ListMultiWithFilter
							items={subjects}
							selects={filter.subjects}
							onChangeSelects={(subjects: string[]) => handleFilterPropChange({ subjects })}
						/>
					</div>
				</div> */}

				<TitleAccordion title="SUBJECTS OF THE STREAM">
					<ListMultiWithFilter
						items={subjects}
						selects={filter.subjects}
						onChangeSelects={(subjects: string[]) => handleFilterPropChange({ subjects })}
					/>
				</TitleAccordion>

				<div className="dvd-footer" />

				<Button children="APPLY" style={{ alignSelf: "start" }}
					onClick={handleApply}
				/>
			</div>
		</Dialog>
	)
}

export default FilterDialog

