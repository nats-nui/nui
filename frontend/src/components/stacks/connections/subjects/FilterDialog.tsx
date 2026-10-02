import { SubjectsStore } from "@/stores/stacks/connection/subjects"
import { Dialog, IconToggle } from "@priolo/jack"
import { useStore } from "@priolo/jon"
import { FunctionComponent } from "react"

interface Props {
	store?: SubjectsStore
}

const FilterDialog: FunctionComponent<Props> = ({
	store: subjectsSo,
}) => {

	const subjectsSa = useStore(subjectsSo)

	return (
		<Dialog
			title="FILTERS"
			store={subjectsSo}
			width={250}
			open={subjectsSa.filtersOpen}
			onClose={() => subjectsSo.setFiltersOpen(false)}
		>
			<div className="jack-lyt-form var-dialog">
				<div className="jack-cmp-h">
					<IconToggle
						check={subjectsSa.noSysMessages}
						onChange={() => subjectsSo.toggleNoSysMessages()}
					/>
					<div className="jack-lbl-prop">DISCARDS SYSTEM MESSAGES</div>
				</div>
			</div>
		</Dialog>
	)
}

export default FilterDialog
