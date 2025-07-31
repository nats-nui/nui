import { Dialog } from "@priolo/jack"
import { useStore } from "@priolo/jon"
import { FunctionComponent } from "react"
import { SyncState, SyncStore } from "@/stores/stacks/sync";
import ToggleMaxTimeCmp from "@/components/input/ToggleMaxTimeCmp";
import { TIME } from "@/utils/conversion";


interface Props {
    store?: SyncStore
}

const OptionsDialog: FunctionComponent<Props> = ({
    store: syncSo,
}) => {

    // STORE
    const syncSa = useStore(syncSo) as SyncState

    // HOOKs

    // HANDLER
    const handleTimeoutChange = (timeoutMs) => {
        syncSo.setTimeoutMs(timeoutMs)
    }
    const handleOptionsClose = () => {
        syncSo.setOptionsOpen(false)
    }

    // RENDER

    return <Dialog
        open={syncSa.optionsOpen}
        title="TIMEOUT"
        width={150}
        store={syncSo}
        noCloseOnClickParent={true}
        onClose={handleOptionsClose}
    >
        <div className="lyt-v">
            <div className="jack-lbl-prop">TIMEOUT</div>
            <ToggleMaxTimeCmp store={syncSo}
                label="TIMEOUT"
                value={syncSa.timeoutMs}
                desiredDefault={0}
                initDefault={1}
                inputUnit={TIME.MS}
                onChange={handleTimeoutChange}
            />
        </div>


    </Dialog>
}

export default OptionsDialog
