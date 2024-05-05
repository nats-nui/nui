import ArrowUpIcon from "@/icons/ArrowUpIcon"
import docSo, { FIXED_CARD } from "@/stores/docs"
import { useStore } from "@priolo/jon"
import { FunctionComponent } from "react"
import StoreButton from "./StoreButton"



interface Props {
}

const AboutButton: FunctionComponent<Props> = ({
}) => {

	// STORE
	const store = docSo.state.fixedViews[FIXED_CARD.ABOUT]
	const state = useStore(store)

	// HOOKs

	// HANDLER

	// RENDER
	if (!store) return null
	const icon = state.about?.shouldUpdate ? <ArrowUpIcon /> : null

	return (
		<StoreButton
			label="HELP"
			store={store}
			badge={icon}
		/>
	)
}

export default AboutButton
