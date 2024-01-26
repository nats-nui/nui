import BoxV from "@/components/format/BoxV"
import Form from "@/components/format/Form"
import Label from "@/components/format/Label"
import TextInput from "@/components/input/TextInput"
import { StreamStore } from "@/stores/stacks/streams/detail"
import { StreamConfig } from "@/types/Stream"
import { useStore } from "@priolo/jon"
import { FunctionComponent } from "react"



interface Props {
	store?: StreamStore
}

const MainForm: FunctionComponent<Props> = ({
	store: streamSo,
}) => {

	// STORE
	const streamSa = useStore(streamSo)

	// HOOKs


	// HANDLER

	// RENDER
	if (!streamSa.stream?.config || !streamSa.stream?.state) return null
	const config = streamSa.stream.config
	const state = streamSa.stream.state

	return <Form>

		<BoxV>
			<Label>MESSAGES</Label>
			<Label>{state.messages}</Label>
		</BoxV>
		<BoxV>
			<Label>BYTES</Label>
			<Label>{state.bytes}</Label>
		</BoxV>
		<BoxV>
			<Label>FIRST SEQ.</Label>
			<Label>{state.firstSeq}</Label>
		</BoxV>
		<BoxV>
			<Label>LAST SEQ.</Label>
			<Label>{state.lastSeq}</Label>
		</BoxV>

		<div>ETC ETC </div>

	</Form>
}

export default MainForm
