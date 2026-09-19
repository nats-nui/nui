import ArrowUpIcon from "@/icons/ArrowUpIcon"
import { FIXED_CARD, fixedViews } from "@/stores/docs"
import { useStore } from "@priolo/jon"
import { FunctionComponent } from "react"
import { AboutStore } from "../../stores/stacks/about"
import StoreButton from "./StoreButton"



interface Props {
}

const AboutButton: FunctionComponent<Props> = ({
}) => {

	// STORE
	const store = fixedViews[FIXED_CARD.ABOUT] as AboutStore
	useStore(store)

	// HOOKs

	// HANDLER

	// RENDER
	if (!store) return null
	const icon = store.state.about?.shouldUpdate 
		? <ArrowUpIcon style={{color: "var(--color-fuchsia)"}}/> 
		: null

	return (
		<StoreButton
			label="HELP"
			store={store}
			badge={icon}
		/>
	)
}

export default AboutButton
