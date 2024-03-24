import Button from "@/components/buttons/Button"
import IconToggle from "@/components/buttons/IconToggle"
import Dialog from "@/components/dialogs/Dialog"
import Box from "@/components/format/Box"
import BoxV from "@/components/format/BoxV"
import Form from "@/components/format/Form"
import Quote from "@/components/format/Quote"
import DateTimeInput from "@/components/input/DateTimeInput"
import FindInput from "@/components/input/FindInput"
import NumberInput from "@/components/input/NumberInput"
import TextInput from "@/components/input/TextInput"
import List from "@/components/lists/List"
import CheckRadioOnIcon from "@/icons/CheckRadioOnIcon"
import FindIcon from "@/icons/FindIcon"
import { StreamMessagesStore } from "@/stores/stacks/streams/messages"
import { StreamMessagesFilter } from "@/stores/stacks/streams/utils/filter"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useEffect, useState } from "react"
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
	if ( !filter ) return null
	let subjects = Object.keys(strMsgSa.stream?.state?.subjects ?? {})
	const width = subjects.length > 15 && subjects[13].length > 49 ? 400 : 200

	return (
		<Dialog
			title="FILTERS"
			store={strMsgSo}
			width={width}
			open={strMsgSa.filtersOpen}
			onClose={handleClose}
		>
			<Form className="var-dialog">
				<Box>
					<IconToggle
						check={!filter.byTime}
						onChange={select => handleFilterPropChange({ byTime: false })}
						trueIcon={<CheckRadioOnIcon />}
					/>
					<div className="lbl-prop">SEQUENCE START</div>
				</Box>
				<NumberInput
					style={{ flex: 1 }}
					value={filter.startSeq}
					onChange={startSeq => handleFilterPropChange({ startSeq: +startSeq })}
				/>

				<Box>
					<IconToggle
						check={filter.byTime}
						onChange={select => handleFilterPropChange({ byTime: true })}
						trueIcon={<CheckRadioOnIcon />}
					/>
					<div className="lbl-prop">TIME START</div>
				</Box>
				<DateTimeInput
					style={{ flex: 1 }}
					value={filter.startTime}
					onChange={(startTime: string) => handleFilterPropChange({ startTime: +startTime })}
				/>

				<BoxV>
					<div className="lbl-prop">INTERVAL</div>
					<NumberInput
						style={{ flex: 1 }}
						value={filter.interval}
						onChange={(interval: string) => handleFilterPropChange({ interval: +interval })}
					/>
				</BoxV>

				<BoxV>
					<div className="lbl-prop">SUBJECTS</div>
					<Quote>
						<ListMultiWithFilter
							items={subjects}
							select={filter.subjects}
							onChangeSelects={(subjects: string[]) => handleFilterPropChange({ subjects })}
						/>
					</Quote>
				</BoxV>

				<Button children="APPLY" style={{ alignSelf: "start" }}
					onClick={handleApply}
				/>
			</Form>
		</Dialog>
	)
}

export default FilterDialog

