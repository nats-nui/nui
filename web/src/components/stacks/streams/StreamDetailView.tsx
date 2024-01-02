import FrameworkCard from "@/components/FrameworkCard"
import { StreamStore } from "@/stores/stacks/streams/detail"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useEffect } from "react"



interface Props {
	store?: StreamStore
}

const StreamDetailView: FunctionComponent<Props> = ({
	store: streamSo,
}) => {

	// STORE
	//useStore(docSo)
	const streamSa = useStore(streamSo)
	//const cnnSa = useStore(cnnSo)

	// HOOKs
	//useEffect(() => {
		// let cnn = streamSo.getConnection()
		// if (cnn == null) cnn = {
		// 	name: "",
		// 	hosts: [],
		// 	subscriptions: [],
		// 	auth: []
		// }
		// streamSo.setConnection(cnn)
	//}, [cnnSa.all])

	// HANDLER

	// RENDER
	const variant = streamSo.getColorBg()

	return <FrameworkCard
		store={streamSo}
	>
		STREAM

	</FrameworkCard>
}

export default StreamDetailView
