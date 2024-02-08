import FrameworkCard from "@/components/FrameworkCard"
import docSo from "@/stores/docs"
import { KVEntryStore } from "@/stores/stacks/kventry/detail"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useEffect } from "react"
import ActionsCmp from "./Actions"
import ShowForm from "./ShowForm"


interface Props {
	store?: KVEntryStore
}

const KVEntryDetailView: FunctionComponent<Props> = ({
	store: kventrySo,
}) => {

	// STORE
	const kventrySa = useStore(kventrySo)

	// HOOKs
	useEffect(() => {
		kventrySo.fetch()
	}, [])

	// HANDLER

	// RENDER
	const variant = kventrySa.colorVar

	return <FrameworkCard
		variantBg={variant}
		store={kventrySo}
		actionsRender={<ActionsCmp store={kventrySo} />}
	>
		<ShowForm store={kventrySo} />
	</FrameworkCard>
}

export default KVEntryDetailView
