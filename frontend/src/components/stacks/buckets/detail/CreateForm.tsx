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
import MaxTimeCmp from "../../../input/MaxTimeCmp"
import MaxBytesCmp from "../../../input/MaxBytesCmp"
import Quote from "@/components/format/Quote.tsx";
import IconToggle from "@/components/buttons/IconToggle.tsx";
import Box from "@/components/format/Box.tsx";
import EditList from "@/components/lists/EditList.tsx";
import EditStringRow from "@/components/rows/EditStringRow.tsx";



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
	const handlePlacementPropChange = (prop: { [name: string]: any }) => {
		const config = { ...bucketSa.bucketConfig }
		config.placement = { ...config.placement, ...prop }
		bucketSo.setBucketConfig(config)
	}
	// RENDER
	if (bucketSa.bucketConfig == null) return null
	const bucket: BucketConfig = bucketSa.bucketConfig

	return <Form>

		<div className="lbl-prop-title">BASE</div>
		<BoxV>
			<div className="lbl-prop">NAME</div>
			<TextInput
				value={bucket.bucket}
				onChange={bucket => handlePropChange({ bucket })}
			/>
		</BoxV>

		<BoxV>
			<div className="lbl-prop">DESCRIPTION</div>
			<TextInput multiline rows={2}
				value={bucket.description}
				onChange={description => handlePropChange({ description })}
			/>
		</BoxV>

		<BoxV>
			<div className="lbl-prop">STORAGE</div>
			<ListDialog width={80}
				store={bucketSo}
				select={Object.values(STORAGE).indexOf(bucket.storage ?? STORAGE.FILE)}
				items={Object.values(STORAGE)}
				RenderRow={({ item }) => item.toUpperCase()}
				onSelect={index => handlePropChange({ storage: Object.values(STORAGE)[index] })}
			/>
		</BoxV>

		<div className="lbl-prop-title">KEY/VALUE STORE SETTINGS</div>


		<BoxV>
			<div className="lbl-prop">HISTORY</div>
			<NumberInput
				style={{ flex: 1 }}
				value={bucket.history}
				onChange={history => handlePropChange({ history })}
			/>
		</BoxV>

		<MaxTimeCmp store={bucketSo}
			label="TTL"
			value={bucket.ttl}
			desiredDefault={0}
			onChange={ttl => handlePropChange({ ttl })}
		/>
		<MaxBytesCmp store={bucketSo}
			label="MAX VALUE SIZE"
			value={bucket.maxValueSize}
			onChange={maxValueSize => handlePropChange({ maxValueSize })}
		/>
		<MaxBytesCmp store={bucketSo}
			label="MAX BYTES"
			value={bucket.maxBytes}
			onChange={maxBytes => handlePropChange({ maxBytes })}
		/>

		<Box>
			<IconToggle
				check={bucket.compression}
				onChange={compression => handlePropChange({ compression })}
			/>
			<div className="lbl-prop">COMPRESSION</div>
		</Box>

		<div className="lbl-prop-title">PLACEMENT</div>
		<BoxV>
			<div className="lbl-prop">NUM REPLICAS</div>
			<NumberInput
				style={{ flex: 1 }}
				value={bucket.replicas}
				onChange={numReplicas => handlePropChange({ numReplicas })}
			/>
		</BoxV>
		<BoxV>
			<div className="lbl-prop">CLUSTER</div>
			<Quote>
				<BoxV>
					<div className="lbl-prop">NAME</div>
					<TextInput
						value={bucket.placement?.cluster}
						onChange={cluster => handlePlacementPropChange({ cluster })}
					/>
				</BoxV>
				<BoxV>
					<div className="lbl-prop">TAGS</div>
					<EditList<string>
						items={bucket.placement?.tags}
						onItemsChange={tags => handlePlacementPropChange({ tags })}
						placeholder="ex. client or java"
						onNewItem={() => ""}
						RenderRow={EditStringRow}
					/>
				</BoxV>
			</Quote>
		</BoxV>

	</Form>
}

export default CreateForm
