import ArrowRightIcon from "@/icons/ArrowRightIcon"
import { BucketStore } from "@/stores/stacks/buckets/detail"
import { EDIT_STATE } from "@/types"
import { BucketConfig } from "@/types/Bucket"
import { Source, STORAGE } from "@/types/Stream"
import { Accordion, Component, EditList, EditStringRow, ElementDialog, IconToggle, ListDialog, NumberInput, StringUpRow, TextInput, TitleAccordion } from "@priolo/jack"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useState } from "react"
import MaxBytesCmp from "../../../input/MaxBytesCmp"
import MaxTimeCmp from "../../../input/MaxTimeCmp"
import EditSourceCmp from "../../streams/detail/cmp/EditSourceCmp"
import SourcesCmp from "../../streams/detail/cmp/SourcesCmp"
import { formatNumber } from "../../../../utils/string"



interface Props {
	store?: BucketStore
}

const Form: FunctionComponent<Props> = ({
	store: bucketSo,
}) => {

	// STORE
	const bucketSa = useStore(bucketSo)

	// HOOKs

	// HANDLER
	const handlePropChange = (prop: { [name: string]: any }) => {
		bucketSo.setBucketConfig({ ...bucketSa.bucket.config, ...prop })
	}
	const handlePlacementPropChange = (prop: { [name: string]: any }) => {
		const config = bucketSa.bucket.config
		config.placement = { ...config.placement, ...prop }
		bucketSo.setBucketConfig(config)
	}
	const handleMetadataPropChange = (metadata: { [name: string]: any }) => {
		const config = bucketSa.bucket.config
		config.metadata = metadata
		bucketSo.setBucketConfig(config)
	}
	const handleRepublishPropChange = (prop: { [name: string]: any }) => {
		const config = { ...bucketSa.bucket.config }
		config.republish = { ...config.republish, ...prop }
		bucketSo.setBucketConfig(config)
	}
	const handleRepublishToggle = (check: boolean) => {
		const config = { ...bucketSa.bucket.config }
		config.republish = check ? { src: "", dest: "", headersOnly: false } : null
		bucketSo.setBucketConfig(config)
	}

	const [mirrorElm, setMirrorElm] = useState<HTMLElement>(null)
	const handleMirrorCheck = (check: boolean) => {
		if (check && !bucketSa.bucket.config.mirror) {
			bucketSo.setBucketConfig({ mirror: { name: "", optStartSeq: 0, optStartTime: null, filterSubject: "" } })
			return
		}
		if (!check && bucketSa.bucket.config.mirror) {
			bucketSo.setBucketConfig({ mirror: null })
		}
	}
	const handleMirrorPropChange = (mirror: Source) => {
		const config = { ...bucketSa.bucket.config }
		config.mirror = mirror
		bucketSo.setBucketConfig(config)
	}


	// RENDER
	const bucket: BucketConfig = bucketSa.bucket?.config
	if (bucket == null) return null
	const inRead = bucketSa.editState == EDIT_STATE.READ
	const inNew = bucketSa.editState == EDIT_STATE.NEW

	return <div className="jack-lyt-form">

		{inRead && (
			<TitleAccordion title="STATS">
				<div className="lyt-h-props">
					<div className="item">
						<div className="jack-lbl-prop">VALUES</div>
						<div className="jack-lbl-readonly">
							{formatNumber(bucketSa.bucket.values)}
						</div>
					</div>
					<div className="lbl-divider-v" />
					<div className="item">
						<div className="jack-lbl-prop">BYTES</div>
						<div className="jack-lbl-readonly">
							{formatNumber(bucketSa.bucket.bytes)}
						</div>
					</div>
				</div>
			</TitleAccordion>
		)}

		<TitleAccordion title="BASE">

			<div className="lyt-v">
				<div className="jack-lbl-prop">NAME</div>
				<TextInput
					value={bucket.bucket}
					onChange={bucket => handlePropChange({ bucket })}
					readOnly={inRead || !inNew}
				/>
			</div>

			<div className="lyt-v">
				<div className="jack-lbl-prop">DESCRIPTION</div>
				<TextInput multiline rows={2}
					value={bucket.description}
					onChange={description => handlePropChange({ description })}
					readOnly={inRead}
				/>
			</div>

			<div className="lyt-v">
				<div className="jack-lbl-prop">STORAGE</div>
				<ListDialog width={80}
					store={bucketSo}
					select={Object.values(STORAGE).indexOf(bucket.storage ?? STORAGE.FILE)}
					items={Object.values(STORAGE)}
					RenderRow={StringUpRow}
					readOnly={inRead || !inNew}
					onSelect={index => handlePropChange({ storage: Object.values(STORAGE)[index] })}
				/>
			</div>

		</TitleAccordion>

		<TitleAccordion title="SOURCE / MIRROR" open={!inRead}>

			<div className="lyt-v">
				<div className="jack-lbl-prop">SOURCES</div>
				<SourcesCmp
					store={bucketSo}
					readOnly={inRead}
					sources={bucket.sources ?? []}
					onChangeSources={sources => handlePropChange({ sources })}
				/>
			</div>

			<div className="lyt-v">
				<div className="jack-cmp-h">
					<IconToggle
						check={!!bucket.mirror}
						onChange={handleMirrorCheck}
						readOnly={inRead || !inNew}
					/>
					<div className="jack-lbl-prop">MIRROR</div>
				</div>
				{!!bucket.mirror && <>
					<Component style={{ marginTop: 3 }}
						onClick={e => setMirrorElm(!!mirrorElm ? null : e.target as HTMLElement)}
						enterRender={<ArrowRightIcon style={{ opacity: 0.5 }} />}
					>{bucket.mirror.name}</Component>
					<ElementDialog
						title="MIRROR"
						element={mirrorElm}
						store={bucketSo}
						width={280}
						timeoutClose={0}
						onClose={() => setMirrorElm(null)}
					>
						<EditSourceCmp
							source={bucket.mirror}
							readOnly={inRead || !inNew}
							onChange={handleMirrorPropChange}
						/>
					</ElementDialog>

				</>}
			</div>

		</TitleAccordion>

		<div className="lyt-v">
			<div className="jack-cmp-h">
				<IconToggle
					check={!!bucket.republish}
					onChange={handleRepublishToggle}
					readOnly={inRead}
				/>
				<div className="jack-lbl-prop">REPUBLISH</div>
			</div>
			<Accordion open={!!bucket.republish}>
				<div className="jack-lyt-quote">
					<div className="lyt-v">
						<div className="jack-lbl-prop">SOURCE</div>
						<TextInput
							value={bucket.republish?.src}
							onChange={src => handleRepublishPropChange({ src })}
							readOnly={inRead}
						/>
					</div>
					<div className="lyt-v">
						<div className="jack-lbl-prop">DESTINATION</div>
						<TextInput
							value={bucket.republish?.dest}
							onChange={dest => handleRepublishPropChange({ dest })}
							readOnly={inRead}
						/>
					</div>
					<div className="jack-cmp-h">
						<IconToggle
							check={bucket.republish?.headersOnly}
							onChange={headersOnly => handleRepublishPropChange({ headersOnly })}
							readOnly={inRead}
						/>
						<div className="jack-lbl-prop">HEADERS ONLY</div>
					</div>
				</div>
			</Accordion>
		</div>

		<TitleAccordion title="KEY/VALUE STORE">

			<div className="lyt-v">
				<div className="jack-lbl-prop">HISTORY</div>
				<NumberInput
					style={{ flex: 1 }}
					value={bucket.history}
					onChange={history => handlePropChange({ history })}
					readOnly={inRead}
				/>
			</div>

			<MaxTimeCmp store={bucketSo}
				label="TTL"
				value={bucket.ttl}
				desiredDefault={0}
				initDefault={1}
				onChange={ttl => handlePropChange({ ttl })}
				readOnly={inRead}
			/>
			<MaxBytesCmp store={bucketSo}
				label="MAX VALUE SIZE"
				value={bucket.maxValueSize}
				onChange={maxValueSize => handlePropChange({ maxValueSize })}
				readOnly={inRead}
			/>
			<MaxBytesCmp store={bucketSo}
				label="MAX BYTES"
				value={bucket.maxBytes}
				onChange={maxBytes => handlePropChange({ maxBytes })}
				readOnly={inRead}
			/>

			<div className="jack-cmp-h">
				<IconToggle
					check={bucket.compression}
					onChange={compression => handlePropChange({ compression })}
					readOnly={inRead}
				/>
				<div className="jack-lbl-prop">COMPRESSION</div>
			</div>

		</TitleAccordion>


		<TitleAccordion title="PLACEMENT">
			<div className="lyt-v">
				<div className="jack-lbl-prop">NUM REPLICAS</div>
				<NumberInput
					style={{ flex: 1 }}
					value={bucket.replicas}
					onChange={replicas => handlePropChange({ replicas })}
					readOnly={inRead}
				/>
			</div>
			<div className="lyt-v">
				<div className="jack-lbl-prop">CLUSTER</div>
				<div className="jack-lyt-quote">
					<div className="lyt-v">
						<div className="jack-lbl-prop">NAME</div>
						<TextInput
							value={bucket.placement?.cluster}
							onChange={cluster => handlePlacementPropChange({ cluster })}
							readOnly={inRead}
						/>
					</div>
					<div className="lyt-v">
						<div className="jack-lbl-prop">TAGS</div>
						<EditList<string>
							items={bucket.placement?.tags}
							onItemsChange={tags => handlePlacementPropChange({ tags })}
							placeholder="ex. client or java"

							onNewItem={() => ""}
							fnIsVoid={i => !i || i.trim().length == 0}
							RenderRow={EditStringRow}
							readOnly={inRead}
						/>
					</div>
				</div>
			</div>
		</TitleAccordion>

		{/* <TitleAccordion title="ADVANCED" open={true}>
			<div className="lyt-v">
				<div className="jack-lbl-prop">METADATA</div>
				<KeyValueMap
					items={bucket.metadata}
					placeholder="ex. 10"
					onChange={handleMetadataPropChange}
					readOnly={inRead}
				/>
			</div>
		</TitleAccordion> */}

	</div>
}

export default Form
