import docSo from "@/stores/docs"
import { ViewStore } from "@/stores/stacks/viewBase"
import { FunctionComponent } from "react"
import RootCard from "./components/cards/RootCard"
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
	const isAnchored = index < docSo.state.anchored

	return (
		<div style={cssCol(length, index)}>
			<DropArea
				index={index}
				viewSo={store}
			/>
			<RootCard view={store} />
			{isLast && !isAnchored && (
				<DropArea index={length} isLast={isLast}/>
			)}
		</div>
	)
}

export default CardCmp

const cssCol = (length: number, index: number): React.CSSProperties => ({
	display: "flex",
	zIndex: length - index,
	flex: index == length - 1 ? 1 : null,
})

