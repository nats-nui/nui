import { drawerCardsSo } from "@/stores/docs/cards"
import { ViewStore } from "@/stores/stacks/viewBase"
import { FunctionComponent } from "react"
import DropArea from "../DropArea"
import RootCard from "./RootCard"



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
	const index = store.state.group.getIndexByView(store)
	const length = store.state.group.state.all.length
	const isLast = index == length - 1
	const isAnchored = store.state.group == drawerCardsSo

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

