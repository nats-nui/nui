import BoxV from "@/components/format/BoxV"
import Form from "@/components/format/Form"
import Label from "@/components/format/Label"
import NumberInput from "@/components/input/NumberInput"
import TextInput from "@/components/input/TextInput"
import { BucketStore } from "@/stores/stacks/buckets/detail"
import { BucketConfig } from "@/types/Bucket"
import { STORAGE } from "@/types/Stream"
import { useStore } from "@priolo/jon"
import { FunctionComponent } from "react"
import ListDialog from "../../../dialogs/ListDialog"



interface Props {
	store?: BucketStore
}

const CreateForm: FunctionComponent<Props> = ({
	store: bucketSo,
}) => {

	// STORE
	const bucketSa = useStore(bucketSo)

	// HOOKs

	// HANDLER
	const handlePropChange = (prop: { [name: string]: any }) => bucketSo.setBucketConfig({ ...bucketSa.bucketConfig, ...prop })

	// RENDER
	if (bucketSa.bucketConfig == null) return null
	const bucket: BucketConfig = bucketSa.bucketConfig

	return <Form>

		<BoxV>
			<Label>NAME</Label>
			<TextInput
				value={bucket.bucket}
				onChange={bucket => handlePropChange({ bucket })}
			/>
		</BoxV>

		<BoxV>
			<Label>DESCRIPTION</Label>
			<TextInput
				value={bucket.description}
				onChange={description => handlePropChange({ description })}
			/>
		</BoxV>
		<BoxV>
			<Label>MAX VALUE SIZE</Label>
			<NumberInput
				style={{ flex: 1 }}
				value={bucket.maxValueSize}
				onChange={maxValueSize => handlePropChange({ maxValueSize })}
			/>
		</BoxV>

		<BoxV>
			<Label>HISTORY</Label>
			<NumberInput
				style={{ flex: 1 }}
				value={bucket.history}
				onChange={history => handlePropChange({ history })}
			/>
		</BoxV>

		<BoxV>
			<Label>MAX BYTES</Label>
			<NumberInput
				style={{ flex: 1 }}
				value={bucket.maxBytes}
				onChange={maxBytes => handlePropChange({ maxBytes })}
			/>
		</BoxV>

		<BoxV>
			<Label>STORAGE</Label>
			<ListDialog
				store={bucketSo}
				select={Object.values(STORAGE).indexOf(bucket.storage ?? STORAGE.FILE)}
				items={Object.values(STORAGE)}
				RenderRow={({ item }) => item}
				onSelect={index => handlePropChange({ storage: Object.values(STORAGE)[index] })}
			/>
		</BoxV>

	</Form>
}

export default CreateForm
