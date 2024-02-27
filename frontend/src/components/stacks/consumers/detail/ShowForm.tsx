import BoxV from "@/components/format/BoxV"
import Form from "@/components/format/Form"
import Label from "@/components/format/Label"
import TextInput from "@/components/input/TextInput"
import { ConsumerStore } from "@/stores/stacks/consumer/detail"
import { useStore } from "@priolo/jon"
import { FunctionComponent } from "react"



interface Props {
	store?: ConsumerStore
}

const ShowForm: FunctionComponent<Props> = ({
	store: consumerSo,
}) => {

	// STORE
	const consumerSa = useStore(consumerSo)

	// HOOKs

	// HANDLER

	// RENDER
	const consumer = consumerSa.consumer
	if (!consumer?.config) return null

	return <Form>

		<BoxV>
			<Label>NAME</Label>
			<TextInput readOnly
				value={consumer.name}
			/>
		</BoxV>

		<BoxV>
			<Label>DESCRIPTION</Label>
			<TextInput readOnly
				value={consumer.config.description}
			/>
		</BoxV>

		<BoxV>
			<Label>DELIVERY POLICY</Label>
			<TextInput readOnly
				value={consumer.config.deliverPolicy}
			/>
		</BoxV>

		<BoxV>
			<Label>MAX DELIVER</Label>
			<TextInput readOnly
				value={consumer.config.maxDeliver}
			/>
		</BoxV>


	</Form>
}

export default ShowForm
