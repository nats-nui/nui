import docSo from "@/stores/docs"
import { ViewStore } from "@/stores/stacks/viewBase"
import { FunctionComponent } from "react"
import DocViewCmp from "./components/DocViewCmp"
import DropArea from "./components/DropArea"



interface Props {
	store?: ViewStore
}

const CardCmp: FunctionComponent<Props> = ({
	store,
}) => {

	// STORES

	// HOOKS

	// HANDLERS

	// RENDER
	const index = docSo.getIndexByView(store)
	const length = docSo.state.all.length
	const isLast = index == length - 1

	return (
		<div style={cssCol(length, index)}>
			{index == 0 && (
				<DropArea index={0} />
			)}
			<DocViewCmp view={store} />
			<DropArea
				index={index + 1}
				isLast={isLast}
				viewSo={store}
			/>
		</div>
	)
}

export default CardCmp

const cssCol = (length: number, index: number): React.CSSProperties => ({
	display: "flex",
	zIndex: length - index,
	flex: index == length - 1 ? 1 : null,
})

