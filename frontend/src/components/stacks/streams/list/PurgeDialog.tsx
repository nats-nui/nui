import CheckRadioOnIcon from "@/icons/CheckRadioOnIcon"
import { StreamsStore } from "@/stores/stacks/streams/index.ts"
import { Button, Dialog, IconToggle, NumberInput, TextInput } from "@priolo/jack"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useEffect, useState } from "react"



interface PurgeParams {
    bySeq?: boolean
    byKeep?: boolean
    number?: number
    subject?: string
}

interface Props {
    store: StreamsStore
}

const PurgeDialog: FunctionComponent<Props> = ({
    store: streamsSo,
}) => {

    // STORE
    const streamSa = useStore(streamsSo)

    // HOOKs
    const [purgeParams, setPurgeParams] = useState<PurgeParams>(null)
    useEffect(() => {
        if (!streamsSo.state.purgeOpen) return
        if (!purgeParams) setPurgeParams({
            bySeq: true,
            byKeep: false,
            number: 0,
            subject: null,
        })
    }, [streamsSo.state.purgeOpen])

    // HANDLER
    const handlePurgePropChange = (prop: Partial<PurgeParams>) => setPurgeParams({ ...purgeParams, ...prop })
    const handleClose = () => streamsSo.setPurgeOpen(false)
    const handleApply = () => {
        streamsSo.setPurgeOpen(false)
        streamsSo.purge({
            seq: purgeParams.bySeq ? purgeParams.number : null,
            keep: purgeParams.byKeep ? purgeParams.number : null,
            subject: purgeParams.subject,
        })
    }

    // RENDER
    if (!purgeParams) return null

    return (
        <Dialog
            title="PURGE"
            store={streamsSo}
            width={200}
            open={streamSa.purgeOpen}
            onClose={handleClose}
        >
            <div className="jack-lyt-form">

                <div className="lyt-v" style={{ gap: 3 }}>
                    <div className="jack-cmp-h">
                        <IconToggle
                            check={purgeParams.bySeq}
                            onChange={select => handlePurgePropChange({ bySeq: select, byKeep: false })}
                            trueIcon={<CheckRadioOnIcon />}
                        />
                        <div className="jack-lbl-prop">SEQUENCE</div>
                        <IconToggle
                            check={purgeParams.byKeep}
                            onChange={select => handlePurgePropChange({ byKeep: select, bySeq: false })}
                            trueIcon={<CheckRadioOnIcon />}
                        />
                        <div className="jack-lbl-prop">KEEP</div>
                    </div>
                    <NumberInput
                        style={{ flex: 1 }}
                        value={purgeParams.number}
                        onChange={(number: number) => handlePurgePropChange({ number })}
                    />
                </div>

                <div className="lyt-v">
                    <div className="jack-lbl-prop">SUBJECT</div>
                    <TextInput
                        value={purgeParams.subject}
                        onChange={subject => handlePurgePropChange({ subject })}
                    />
                </div>

            </div>

            <div className="jack-lbl-prop-title" style={{ marginTop: 10 }}>
                DANGER
            </div>

            <div className="lbl-dialog-text">
                This action is irreversible.
                Are you sure you want to purge the STREAM?
            </div>

            <div className="jack-bars-alert-bg" style={{ height: 25 }} />

            <div
                className="var-dialog"
                style={{ display: "flex", gap: 15, marginTop: 5 }}
            >
                <Button
                    children="PURGE"
                    onClick={() => handleApply()}
                />
                <Button
                    children="CANCEL"
                    onClick={() => handleClose()}
                />
            </div>

        </Dialog>
    )
}

export default PurgeDialog

