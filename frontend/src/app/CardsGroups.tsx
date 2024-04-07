import { ViewStore } from "@/stores/stacks/viewBase"
import { FunctionComponent } from "react"
import DropArea from "./DropArea"
import RootCard from "../components/cards/RootCard"



interface Props {
	storesGroup?: ViewStore[]
}

const CardsGroup: FunctionComponent<Props> = ({
	storesGroup,
}) => {

	// STORES

	// HOOKS

	// HANDLERS

	// RENDER
	return <>
		{storesGroup.map((store, index) => (
			<div key={store.state.uuid}
				style={cssCol(storesGroup.length - index)}
			>
				<DropArea
					index={index}
					viewSo={store}
				/>
				<RootCard view={store} />
			</div>
		))}
		<DropArea index={storesGroup.length} isLast />
	</>
}

export default CardsGroup

const cssCol = (zIndex: number): React.CSSProperties => ({
	display: "flex",
	zIndex,
})

