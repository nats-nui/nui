import Button from "@/components/buttons/Button"
import IconToggle from "@/components/buttons/IconToggle"
import Dialog from "@/components/dialogs/Dialog"
import Box from "@/components/format/Box"
import BoxV from "@/components/format/BoxV"
import Form from "@/components/format/Form"
import NumberInput from "@/components/input/NumberInput"
import TextInput from "@/components/input/TextInput"
import CheckRadioOnIcon from "@/icons/CheckRadioOnIcon"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useEffect, useState } from "react"
import { StreamsStore } from "@/stores/stacks/streams/index.ts";



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
            <Form className="var0">
                <Box>
                    <IconToggle
                        check={purgeParams.bySeq}
                        onChange={select => handlePurgePropChange({ bySeq: select, byKeep: false })}
                        trueIcon={<CheckRadioOnIcon />}
                    />
                    <div className="lbl-prop">SEQUENCE</div>
                    <IconToggle
                        check={purgeParams.byKeep}
                        onChange={select => handlePurgePropChange({ byKeep: select, bySeq: false })}
                        trueIcon={<CheckRadioOnIcon />}
                    />
                    <div className="lbl-prop">KEEP</div>
                </Box>
                <NumberInput
                    style={{ flex: 1 }}
                    value={purgeParams.number}
                    onChange={(number: string) => handlePurgePropChange({ number: parseInt(number) })}
                />

                <BoxV>
                    <div className="lbl-prop">SUBJECT</div>
                    <TextInput
                        value={purgeParams.subject}
                        onChange={subject => handlePurgePropChange({ subject })}
                    />
                </BoxV>

                <div className="lbl-prop-title">DANGER</div>

                <div className="lbl-dialog-text">
                    This action is irreversible.
                    Are you sure you want to purge the STREAM?
                </div>

                <Box style={{ display: "flex", gap: 15, marginTop: 10 }}>
                    <Button
                        children="PURGE"
                        onClick={() => handleApply()}
                    />
                    <Button
                        children="CANCEL"
                        onClick={() => handleClose()}
                    />
                </Box>
            </Form>
        </Dialog>
    )
}

export default PurgeDialog

