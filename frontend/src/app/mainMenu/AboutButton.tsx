import ArrowUpIcon from "@/icons/ArrowUpIcon"
import docSo from "@/stores/docs"
import { useStore } from "@priolo/jon"
import { FunctionComponent } from "react"
import StoreButton from "./StoreButton"



interface Props {
}

const AboutButton: FunctionComponent<Props> = ({
}) => {

	// STORE
	const store = docSo.state.fixedViews[2]
	const state = useStore(store)

	// HOOKs

	// HANDLER

	// RENDER
	if (!store) return null
	const icon = state.about?.shouldUpdate ? <ArrowUpIcon /> : null

	return (
		<StoreButton
			label="ABOUT"
			store={store}
			badge={icon}
		/>
	)
}

export default AboutButton
