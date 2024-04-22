import IconToggle from "@/components/buttons/IconToggle.tsx"
import NumberInput from "@/components/input/NumberInput"
import TextInput from "@/components/input/TextInput"
import EditList from "@/components/lists/EditList.tsx"
import EditStringRow from "@/components/rows/EditStringRow.tsx"
import StringUpRow from "@/components/rows/StringUpRow"
import { BucketStore } from "@/stores/stacks/buckets/detail"
import { BucketConfig } from "@/types/Bucket"
import { STORAGE } from "@/types/Stream"
import { useStore } from "@priolo/jon"
import { FunctionComponent } from "react"
import ListDialog from "../../../dialogs/ListDialog"
import MaxBytesCmp from "../../../input/MaxBytesCmp"
import MaxTimeCmp from "../../../input/MaxTimeCmp"
import TitleAccordion from "@/components/accordion/TitleAccordion"



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

	return <div className="lyt-form">

		<TitleAccordion title="BASE">
			
			<div className="lyt-v">
				<div className="lbl-prop">NAME</div>
				<TextInput
					value={bucket.bucket}
					onChange={bucket => handlePropChange({ bucket })}
				/>
			</div>

			<div className="lyt-v">
				<div className="lbl-prop">DESCRIPTION</div>
				<TextInput multiline rows={2}
					value={bucket.description}
					onChange={description => handlePropChange({ description })}
				/>
			</div>

			<div className="lyt-v">
				<div className="lbl-prop">STORAGE</div>
				<ListDialog width={80}
					store={bucketSo}
					select={Object.values(STORAGE).indexOf(bucket.storage ?? STORAGE.FILE)}
					items={Object.values(STORAGE)}
					RenderRow={StringUpRow}
					onSelect={index => handlePropChange({ storage: Object.values(STORAGE)[index] })}
				/>
			</div>

		</TitleAccordion>


		<TitleAccordion title="KEY/VALUE STORE SETTINGS">

			<div className="lyt-v">
				<div className="lbl-prop">HISTORY</div>
				<NumberInput
					style={{ flex: 1 }}
					value={bucket.history}
					onChange={history => handlePropChange({ history })}
				/>
			</div>

			<MaxTimeCmp store={bucketSo}
				label="TTL"
				value={bucket.ttl}
				desiredDefault={0}
				initDefault={1}
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

			<div className="cmp-h">
				<IconToggle
					check={bucket.compression}
					onChange={compression => handlePropChange({ compression })}
				/>
				<div className="lbl-prop">COMPRESSION</div>
			</div>

		</TitleAccordion>


		<TitleAccordion title="PLACEMENT">
			<div className="lyt-v">
				<div className="lbl-prop">NUM REPLICAS</div>
				<NumberInput
					style={{ flex: 1 }}
					value={bucket.replicas}
					onChange={replicas => handlePropChange({ replicas })}
				/>
			</div>
			<div className="lyt-v">
				<div className="lbl-prop">CLUSTER</div>
				<div className="lyt-quote">
					<div className="lyt-v">
						<div className="lbl-prop">NAME</div>
						<TextInput
							value={bucket.placement?.cluster}
							onChange={cluster => handlePlacementPropChange({ cluster })}
						/>
					</div>
					<div className="lyt-v">
						<div className="lbl-prop">TAGS</div>
						<EditList<string>
							items={bucket.placement?.tags}
							onItemsChange={tags => handlePlacementPropChange({ tags })}
							placeholder="ex. client or java"

							onNewItem={() => ""}
							fnIsVoid={i => !i || i.trim().length == 0}
							RenderRow={EditStringRow}
						/>
					</div>
				</div>
			</div>
		</TitleAccordion>

	</div>
}

export default CreateForm
