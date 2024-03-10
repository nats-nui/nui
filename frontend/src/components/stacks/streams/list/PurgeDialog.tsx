import Button from "@/components/buttons/Button"
import IconToggle from "@/components/buttons/IconToggle"
import Dialog from "@/components/dialogs/Dialog"
import Box from "@/components/format/Box"
import BoxV from "@/components/format/BoxV"
import Form from "@/components/format/Form"
import NumberInput from "@/components/input/NumberInput"
import TextInput from "@/components/input/TextInput"
import CheckRadioOnIcon from "@/icons/CheckRadioOnIcon"
import {useStore} from "@priolo/jon"
import {FunctionComponent, useEffect, useState} from "react"
import {PurgeParams, StreamsStore} from "@/stores/stacks/streams/index.ts";


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
        if (!purgeParams) setPurgeParams({seq: null, keep: null, subject: null})
    }, [streamsSo.state.purgeOpen])

    // HANDLER
    const handlePurgePropChange = (prop: Partial<PurgeParams>) => setPurgeParams({...purgeParams, ...prop})
    const handleClose = () => {
        streamsSo.setPurgeOpen(false)
    }
    const handleApply = () => {
        streamsSo.setPurgeOpen(false)
        streamsSo.setPurgeParams(purgeParams)
        streamsSo.purge()
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
            <Form>
                <Box>
                    <IconToggle
                        check={purgeParams.bySeq}
                        onChange={select => handlePurgePropChange({bySeq: select, byKeep: false})}
                        trueIcon={<CheckRadioOnIcon/>}
                    />
                    <div className="lbl-prop">SEQUENCE</div>
                    <IconToggle
                        check={purgeParams.byKeep}
                        onChange={select => handlePurgePropChange({byKeep: select, bySeq: false})}
                        trueIcon={<CheckRadioOnIcon/>}
                    />
                    <div className="lbl-prop">KEEP</div>
                </Box>
                <NumberInput
                    style={{flex: 1}}
                    value={purgeParams.number}
                    onChange={number => handlePurgePropChange({number})}
                />

                <BoxV>
                    <div className="lbl-prop">SUBJECT</div>
                    <TextInput
                        value={purgeParams.subject}
                        onChange={subject => handlePurgePropChange({subject})}
                    />
                </BoxV>

                <Button children="APPLY"
                        onClick={handleApply}
                />
            </Form>
        </Dialog>
    )
}

export default PurgeDialog

