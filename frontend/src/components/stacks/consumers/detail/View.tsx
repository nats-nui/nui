import FrameworkCard from "@/components/cards/FrameworkCard"
import { ConsumerStore } from "@/stores/stacks/consumer/detail"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useEffect } from "react"
import { EDIT_STATE } from "../../../../types"
import ActionsCmp from "./Actions"
import Form from "./Form"



interface Props {
	store?: ConsumerStore
}

const ConsumerDetailView: FunctionComponent<Props> = ({
	store,
}) => {

	// STORE
	const state = useStore(store)

	// HOOKs
	useEffect(() => {
		store.fetchIfVoid()
	}, [])

	// HANDLER

	// RENDER
	const inRead = state.editState == EDIT_STATE.READ

	return <FrameworkCard variantBg
		store={store}
		actionsRender={<ActionsCmp store={store} />}
	>
		<Form store={store} />
	</FrameworkCard>
}

export default ConsumerDetailView
