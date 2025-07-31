import KeyValueMap from "@/components/input/KeyValueMap.tsx"
import ToggleMaxBytesCmp from "@/components/input/ToggleMaxBytesCmp"
import ToggleMaxNumberCmp from "@/components/input/ToggleMaxNumberCmp"
import ToggleMaxTimeCmp from "@/components/input/ToggleMaxTimeCmp"
import EditSourceCmp from "@/components/stacks/streams/detail/cmp/EditSourceCmp.tsx"
import ArrowRightIcon from "@/icons/ArrowRightIcon"
import { StreamStore } from "@/stores/stacks/streams/detail"
import { EDIT_STATE } from "@/types"
import { COMPRESSION, DISCARD, RETENTION, Source, STORAGE } from "@/types/Stream"
import { formatNumber } from "@/utils/string"
import { dateShow } from "@/utils/time"
import { Accordion, Component, EditList, EditStringRow, ElementDialog, IconToggle, ListDialog, NumberInput, StringUpRow, TextInput, TitleAccordion } from "@priolo/jack"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useState } from "react"
import SourcesCmp from "./cmp/SourcesCmp"


interface Props {
    store?: StreamStore
}

const Form: FunctionComponent<Props> = ({
    store: streamSo,
}) => {

    // STORE
    const streamSa = useStore(streamSo)

    // HOOKs
    const [mirrorElm, setMirrorElm] = useState<HTMLElement>(null)

    // HANDLER
    const handlePropChange = (prop: {
        [name: string]: any
    }) => streamSo.setStreamConfig({ ...streamSa.stream.config, ...prop })

    const handleMirrorPropChange = (mirror: Source) => {
        config.mirror = mirror
        streamSo.setStreamConfig(config)
    }

    const handleRepublishPropChange = (prop: { [name: string]: any }) => {
        const config = { ...streamSa.stream.config }
        config.republish = { ...config.republish, ...prop }
        streamSo.setStreamConfig(config)
    }
    const handleRepublishToggle = (check: boolean) => {
        const config = { ...streamSa.stream.config }
        config.republish = check ? { src: "", dest: "", headersOnly: false } : null
        streamSo.setStreamConfig(config)
    }

    const handlePlacementPropChange = (prop: { [name: string]: any }) => {
        const config = { ...streamSa.stream.config }
        config.placement = { ...config.placement, ...prop }
        streamSo.setStreamConfig(config)
    }

    const handleMetadataPropChange = (metadata: { [name: string]: any }) => {
        const config = { ...streamSa.stream.config }
        config.metadata = metadata
        streamSo.setStreamConfig(config)
    }

    const handleSubjectTransformPropChange = (prop: { [name: string]: any }) => {
        const config = { ...streamSa.stream.config }
        config.subjectTransform = { ...config.subjectTransform, ...prop }
        streamSo.setStreamConfig(config)
    }

    const handleConsumerLimitsPropChange = (prop: { [name: string]: any }) => {
        const config = { ...streamSa.stream.config }
        config.consumerLimits = { ...config.consumerLimits, ...prop }
        streamSo.setStreamConfig(config)
    }

    const handleMirrorCheck = (check: boolean) => {
        if (check && !config.mirror) {
            handlePropChange({ mirror: { name: "", optStartSeq: 0, optStartTime: null, filterSubject: "" } })
            return
        }
        if (!check && config.mirror) {
            handlePropChange({ mirror: null })
        }
    }

    const handleCompressionChange = (check: boolean) => {
        if (check && !compressionIsSet) {
            handlePropChange({ compression: COMPRESSION.S2 })
            return
        }
        if (!check && compressionIsSet) {
            handlePropChange({ compression: COMPRESSION.NONE })
        }
    }

    const handleSubjectTransform = (check: boolean) => {
        if (check && !config.subjectTransform) {
            handlePropChange({ subjectTransform: { src: "", dest: "", } })
            return
        }
        if (!check && config.subjectTransform) {
            handlePropChange({ subjectTransform: null })
        }
    }

    const handleConsumerLimits = (check: boolean) => {
        if (check && !consumerLimitsIsSet) {
            handlePropChange({ consumerLimits: { inactiveThreshold: 0, maxAckPending: 0, } })
            return
        }
        if (!check && consumerLimitsIsSet) {
            handlePropChange({ consumerLimits: null })
        }
    }

    const handleAllowMsgTtlChange = (check: boolean) => {
        streamSo.setStreamConfig({ ...streamSa.stream.config, allowMsgTtl: check })
    }

    const handleDiscardNewPerSubjectChange = (check: boolean) => {
        streamSo.setStreamConfig({ ...streamSa.stream.config, discardNewPerSubject: check })
    }

    // RENDER
    if (streamSa.stream?.config == null) return null
    const config = streamSa.stream.config
    const state = streamSa.stream.state
    const firstTs = dateShow(state.firstTs)
    const lastTs = dateShow(state.lastTs)
    const inRead = streamSa.editState == EDIT_STATE.READ
    const inNew = streamSa.editState == EDIT_STATE.NEW
    const allStreams = streamSa.allStreams
    // this is needed because NATS return an empty object instead of null when consumer limits are not set
    const consumerLimitsIsSet = config.consumerLimits != null && Object.keys(config.consumerLimits).length > 0
    const compressionIsSet = !!config.compression && config.compression != COMPRESSION.NONE

    return <div className="jack-lyt-form var-dialog" style={{ marginBottom: 25 }}>

        {inRead && (
            <TitleAccordion title="STATS">

                <div className="lyt-h-props">
                    <div className="item">
                        <div className="jack-lbl-prop">COUNT</div>
                        <div className="jack-lbl-readonly">{formatNumber(state.messages)}</div>
                    </div>
                    <div className="lbl-divider-v" />
                    <div className="item">
                        <div className="jack-lbl-prop">BYTES</div>
                        <div className="jack-lbl-readonly">{formatNumber(state.bytes)}</div>
                    </div>
                    <div className="lbl-divider-v" />
                    <div className="item">
                        <div className="jack-lbl-prop">DELETED</div>
                        <div className="jack-lbl-readonly">{formatNumber(state.numDeleted)}</div>
                    </div>
                </div>

                <div className="lyt-v">
                    <div className="jack-lbl-prop">FIRST SEQUENCE</div>
                    <div className="jack-lbl-readonly" style={{ display: "flex" }}>
                        <div style={{ flex: 1 }}>{formatNumber(state.firstSeq)}</div>
                        <div style={{ fontFamily: "monospace" }}>{firstTs}</div>
                    </div>
                </div>

                <div className="lyt-v">
                    <div className="jack-lbl-prop">LAST SEQUENCE</div>
                    <div className="jack-lbl-readonly" style={{ display: "flex" }}>
                        <div style={{ flex: 1 }}>{formatNumber(state.lastSeq)}</div>
                        <div style={{ fontFamily: "monospace" }}>{lastTs}</div>
                    </div>
                </div>

                <div className="lyt-v">
                    <div className="jack-lbl-prop">CONSUMER COUNT</div>
                    <div className="jack-lbl-readonly">{formatNumber(state.consumerCount)}</div>
                </div>

            </TitleAccordion>
        )}

        <TitleAccordion title="BASE">

            <div className="lyt-v">
                <div className="jack-lbl-prop">NAME</div>
                <TextInput
                    value={config.name}
                    onChange={name => handlePropChange({ name })}
                    readOnly={inRead || !inNew}
                />
            </div>

            <div className="lyt-v">
                <div className="jack-lbl-prop">DESCRIPTION</div>
                <TextInput multiline rows={2}
                    value={config.description}
                    onChange={description => handlePropChange({ description })}
                    readOnly={inRead}
                />
            </div>

            <div className="lyt-v">
                <div className="jack-lbl-prop">STORAGE</div>
                <ListDialog width={80}
                    store={streamSo}
                    select={Object.values(STORAGE).indexOf(config.storage ?? STORAGE.FILE)}
                    items={Object.values(STORAGE)}
                    RenderRow={StringUpRow}
                    readOnly={inRead || !inNew}
                    onSelect={index => handlePropChange({ storage: Object.values(STORAGE)[index] })}
                />
            </div>

            <div className="lyt-v">
                <div className="jack-lbl-prop">SUBJECTS</div>
                <EditList<string>
                    items={config.subjects}
                    onItemsChange={subjects => handlePropChange({ subjects })}
                    placeholder="ex. orders.* or telemetry.>"
                    readOnly={inRead}

                    onNewItem={() => ""}
                    fnIsVoid={i => !i || i.trim().length == 0}
                    RenderRow={EditStringRow}
                />
            </div>
        </TitleAccordion>

        <TitleAccordion title="SOURCE / MIRROR" open={!inRead}>

            <div className="lyt-v">
                <div className="jack-lbl-prop">SOURCES</div>
                <SourcesCmp 
                    store={streamSo}
                    readOnly={inRead}
                    sources={config.sources ?? []} 
                    allStreams={allStreams}
                    onChangeSources={sources => handlePropChange({ sources })}
                />
            </div>

            <div className="lyt-v">
                <div className="jack-cmp-h">
                    <IconToggle
                        check={!!config.mirror}
                        onChange={handleMirrorCheck}
                        readOnly={inRead || !inNew}
                    />
                    <div className="jack-lbl-prop">MIRROR</div>
                </div>
                {!!config.mirror && <>
                    <Component style={{ marginTop: 3 }}
                        onClick={e => setMirrorElm(!!mirrorElm ? null : e.target as HTMLElement)}
                        enterRender={<ArrowRightIcon style={{ opacity: 0.5 }} />}
                    >{config.mirror.name}</Component>
                    <ElementDialog
                        title="MIRROR"
                        element={mirrorElm}
                        store={streamSo}
                        width={280}
                        timeoutClose={0}
                        onClose={() => setMirrorElm(null)}
                    >
                        <EditSourceCmp
                            source={config.mirror}
                            readOnly={inRead || !inNew}
                            allStream={streamSa.allStreams}
                            onChange={handleMirrorPropChange}
                        />
                    </ElementDialog>

                </>}
            </div>

        </TitleAccordion>

        <TitleAccordion title="RETENTION" open={!inRead}>
            <div className="lyt-v">
                <div className="jack-lbl-prop">POLICY</div>
                <ListDialog width={100}
                    store={streamSo}
                    select={Object.values(RETENTION).indexOf(config.retention ?? RETENTION.INTEREST)}
                    items={Object.values(RETENTION)}
                    RenderRow={StringUpRow}
                    readOnly={inRead || !inNew}
                    onSelect={index => handlePropChange({ retention: Object.values(RETENTION)[index] })}
                />
            </div>
            <div className="lyt-v">
                <div className="jack-lbl-prop">DISCARD</div>
                <ListDialog width={80}
                    store={streamSo}
                    select={Object.values(DISCARD).indexOf(config.discard ?? DISCARD.OLD)}
                    items={Object.values(DISCARD)}
                    RenderRow={StringUpRow}
                    readOnly={inRead}
                    onSelect={index => {
                        handlePropChange({ discard: Object.values(DISCARD)[index] })
                    }}
                />
            </div>
            <div className="jack-cmp-h">
                <IconToggle
                    check={config.discardNewPerSubject}
                    onChange={handleDiscardNewPerSubjectChange}
                    readOnly={inRead}
                />
                <div className="jack-lbl-prop">DISCARD NEW PER SUBJECT</div>
            </div>
            <div className="jack-cmp-h">
                <IconToggle
                    check={config.allowRollupHdrs}
                    onChange={allowRollupHdrs => handlePropChange({ allowRollupHdrs })}
                    readOnly={inRead}
                />
                <div className="jack-lbl-prop">ALLOW ROLL UP HDRS</div>
            </div>
            <div className="jack-cmp-h">
                <IconToggle
                    check={config.denyDelete}
                    onChange={denyDelete => handlePropChange({ denyDelete })}
                    readOnly={inRead || !inNew}
                />
                <div className="jack-lbl-prop">DENY DELETE</div>
            </div>
            <div className="jack-cmp-h">
                <IconToggle
                    check={config.denyPurge}
                    onChange={denyPurge => handlePropChange({ denyPurge })}
                    readOnly={inRead || !inNew}
                />
                <div className="jack-lbl-prop">DENY PURGE</div>
            </div>
        </TitleAccordion>


        <TitleAccordion title="LIMIT" open={!inRead}>
            <ToggleMaxTimeCmp store={streamSo}
                readOnly={inRead}
                label="MAX AGE"
                value={config.maxAge}
                desiredDefault={0}
                initDefault={null}
                onChange={maxAge => streamSo.setStreamConfig({ ...streamSa.stream.config, maxAge })}
            />
            <ToggleMaxBytesCmp store={streamSo}
                readOnly={inRead}
                label="MAX BYTES"
                value={config.maxBytes}
                onChange={maxBytes => streamSo.setStreamConfig({ ...streamSa.stream.config, maxBytes })}
            />
            <ToggleMaxNumberCmp
                readOnly={inRead || !inNew}
                label="MAX CONSUMERS"
                value={config.maxConsumers}
                onChange={maxConsumers => streamSo.setStreamConfig({ ...streamSa.stream.config, maxConsumers })}
            />
            <ToggleMaxBytesCmp store={streamSo}
                readOnly={inRead}
                label="MAX MSG SIZE"
                value={config.maxMsgSize}
                onChange={maxMsgSize => streamSo.setStreamConfig({ ...streamSa.stream.config, maxMsgSize })}
            />
            <ToggleMaxNumberCmp
                readOnly={inRead}
                label="MAX MESSAGES"
                value={config.maxMsgs}
                onChange={maxMsgs => streamSo.setStreamConfig({ ...streamSa.stream.config, maxMsgs })}
            />
            <ToggleMaxNumberCmp
                readOnly={inRead}
                label="MAX MSGS PER SUBJECT"
                value={config.maxMsgsPerSubject}
                onChange={maxMsgsPerSubject => streamSo.setStreamConfig({ ...streamSa.stream.config, maxMsgsPerSubject })}
            />
        </TitleAccordion>


        <TitleAccordion title="PLACEMENT" open={!inRead}>
            <div className="lyt-v">
                <div className="jack-lbl-prop">NUM REPLICAS</div>
                <NumberInput
                    style={{ flex: 1 }}
                    value={config.numReplicas}
                    onChange={numReplicas => handlePropChange({ numReplicas })}
                    readOnly={inRead}
                />
            </div>
            <div className="lyt-v">
                <div className="jack-lbl-prop">CLUSTER</div>
                <div className="jack-lyt-quote">
                    <div className="lyt-v">
                        <div className="jack-lbl-prop">NAME</div>
                        <TextInput
                            value={config.placement?.cluster}
                            onChange={cluster => handlePlacementPropChange({ cluster })}
                            readOnly={inRead}
                        />
                    </div>
                    <div className="lyt-v">
                        <div className="jack-lbl-prop">TAGS</div>
                        <EditList<string>
                            items={config.placement?.tags}
                            onItemsChange={tags => handlePlacementPropChange({ tags })}
                            placeholder="ex. client or java"
                            readOnly={inRead}
                            onNewItem={() => ""}
                            fnIsVoid={i => !i || i.trim().length == 0}
                            RenderRow={EditStringRow}
                        />
                    </div>
                </div>
            </div>
        </TitleAccordion>


        <TitleAccordion title="PUBLISH" open={!inRead}>
            <div className="jack-cmp-h">
                <IconToggle
                    check={config.noAck}
                    onChange={noAck => handlePropChange({ noAck })}
                    readOnly={inRead}
                />
                <div className="jack-lbl-prop">ALLOW NO ACK ON PUBLISH</div>
            </div>
            <div className="lyt-v">
                <div className="jack-lbl-prop">DUPLICATE WINDOW</div>
                <NumberInput
                    style={{ flex: 1 }}
                    value={config.duplicateWindow}
                    onChange={duplicateWindow => handlePropChange({ duplicateWindow })}
                    readOnly={inRead}
                />
            </div>
            <div className="lyt-v">
                <div className="jack-cmp-h">
                    <IconToggle
                        check={!!config.republish}
                        onChange={handleRepublishToggle}
                        readOnly={inRead}
                    />
                    <div className="jack-lbl-prop">REPUBLISH</div>
                </div>
                <Accordion open={!!config.republish}>
                    <div className="jack-lyt-quote">
                        <div className="lyt-v">
                            <div className="jack-lbl-prop">SOURCE</div>
                            <TextInput
                                value={config.republish?.src}
                                onChange={src => handleRepublishPropChange({ src })}
                                readOnly={inRead}
                            />
                        </div>
                        <div className="lyt-v">
                            <div className="jack-lbl-prop">DESTINATION</div>
                            <TextInput
                                value={config.republish?.dest}
                                onChange={dest => handleRepublishPropChange({ dest })}
                                readOnly={inRead}
                            />
                        </div>
                        <div className="jack-cmp-h">
                            <IconToggle
                                check={config.republish?.headersOnly}
                                onChange={headersOnly => handleRepublishPropChange({ headersOnly })}
                                readOnly={inRead}
                            />
                            <div className="jack-lbl-prop">HEADERS ONLY</div>
                        </div>
                    </div>
                </Accordion>
            </div>
        </TitleAccordion>


        <TitleAccordion title="SEAL" open={!inRead}>
            <div className="jack-cmp-h">
                <IconToggle
                    check={config.sealed}
                    onChange={sealed => handlePropChange({ sealed })}
                    readOnly={inRead}
                />
                <div className="jack-lbl-prop">SEALED</div>
            </div>

            {/*<div className="lyt-v">
			<div className="jack-lbl-prop">TEMPLATE OWNER</div>
			<TextInput
				value={config.templateOwner}
				onChange={templateOwner => handlePropChange({templateOwner})}
				readOnly={inRead}
			/>
		</div>*/}
        </TitleAccordion>

        <TitleAccordion title="ADVANCED" open={!inRead}>
            <div className="lyt-v">
                <div className="jack-lbl-prop">METADATA</div>
                <KeyValueMap
                    items={config.metadata}
                    placeholder="ex. 10"
                    readOnly={inRead}
                    onChange={handleMetadataPropChange}
                />
            </div>

            <div className="lyt-v">
                <div className="jack-cmp-h">
                    <IconToggle
                        check={config.allowMsgTtl}
                        onChange={handleAllowMsgTtlChange}
                        readOnly={inRead && !inNew}
                    />
                    <div className="jack-lbl-prop">ALLOW MSG TTL</div>
                </div>
            </div>

            <div className="lyt-v">
                <ToggleMaxTimeCmp store={streamSo}
                            readOnly={inRead}
                            label="SUBJECT DELETE MARKER TTL"
                            value={config.subjectDeleteMarkerTtl}
                            desiredDefault={0}
                            initDefault={1}
                            onChange={subjectDeleteMarkerTtl => streamSo.setStreamConfig({ ...streamSa.stream.config, subjectDeleteMarkerTtl })}
                />
            </div>

            <div className="lyt-v">
                <div className="jack-cmp-h">
                    <IconToggle
                        check={compressionIsSet}
                        onChange={handleCompressionChange}
                        readOnly={inRead}
                    />
                    <div className="jack-lbl-prop">COMPRESSION</div>
                </div>
            </div>

            <div className="lyt-v">
                <div className="jack-lbl-prop">FIRST SEQ</div>
                <div className="jack-cmp-h">
                    <NumberInput
                        style={{ flex: 1 }}
                        value={config.firstSeq}
                        onChange={firstSeq => handlePropChange({ firstSeq })}
                        readOnly={inRead && !inNew}
                    />
                </div>
            </div>

            <div className="lyt-v">
                <div className="jack-cmp-h">
                    <IconToggle
                        check={!!config.subjectTransform}
                        onChange={handleSubjectTransform}
                        readOnly={inRead}
                    />
                    <div className="jack-lbl-prop">SUBJECT TRANSFORM</div>
                </div>
                <Accordion open={!!config.subjectTransform}>
                    <div className="jack-lyt-quote">
                        <div className="lyt-v">
                            <div className="jack-lbl-prop">SOURCE</div>
                            <TextInput
                                value={config.subjectTransform?.src}
                                onChange={src => handleSubjectTransformPropChange({ src })}
                                readOnly={inRead}
                            />
                        </div>
                        <div className="lyt-v">
                            <div className="jack-lbl-prop">DESTINATION</div>
                            <TextInput
                                value={config.subjectTransform?.dest}
                                onChange={dest => handleSubjectTransformPropChange({ dest })}
                                readOnly={inRead}
                            />
                        </div>
                    </div>
                </Accordion>
            </div>

            <div className="lyt-v">
                <div className="jack-cmp-h">
                    <IconToggle
                        check={consumerLimitsIsSet}
                        onChange={handleConsumerLimits}
                        readOnly={inRead}
                    />
                    <div className="jack-lbl-prop">CONSUMER LIMITS</div>
                </div>
                <Accordion open={consumerLimitsIsSet}>
                    <div className="jack-lyt-quote">
                        <div className="lyt-v">
                            <ToggleMaxTimeCmp store={streamSo}
                                label="INACTIVE THRESHOLD"
                                value={config.consumerLimits?.inactiveThreshold}
                                desiredDefault={0}
                                initDefault={1}
                                onChange={inactiveThreshold => handleConsumerLimitsPropChange({ inactiveThreshold })}
                            />
                        </div>
                        <div className="lyt-v">
                            <div className="jack-lbl-prop">MAX CONSUMERS</div>
                            <NumberInput
                                value={config.consumerLimits?.maxAckPending}
                                onChange={maxAckPending => handleConsumerLimitsPropChange({ maxAckPending })}
                                readOnly={inRead}
                            />
                        </div>
                    </div>
                </Accordion>
            </div>
        </TitleAccordion>


    </div>
}

export default Form
