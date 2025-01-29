import ArrowUpIcon from "@/icons/ArrowUpIcon"
import docSo, { FIXED_CARD } from "@/stores/docs"
import { useStore } from "@priolo/jon"
import { FunctionComponent } from "react"
import StoreButton from "./StoreButton"
import { AboutState, AboutStore } from "../../stores/stacks/about"



interface Props {
}

const AboutButton: FunctionComponent<Props> = ({
}) => {

	// STORE
	const store = docSo.state.fixedViews[FIXED_CARD.ABOUT] as AboutStore
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
