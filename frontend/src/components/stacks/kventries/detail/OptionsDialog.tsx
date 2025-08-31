import { Dialog } from "@priolo/jack"
import { useStore } from "@priolo/jon"
import { FunctionComponent } from "react"
import ToggleMaxTimeCmp from "@/components/input/ToggleMaxTimeCmp";
import { TIME } from "@/utils/conversion";
import {KVEntryStore} from "@/stores/stacks/kventry/detail.ts";


interface Props {
    store?: KVEntryStore
}

const OptionsDialog: FunctionComponent<Props> = ({
    store: kventrySo,
}) => {

    // STORE
    const kventrySa = useStore(kventrySo)

    // HOOKs

    // HANDLER
    const handleTTLChange = (ttl) => {
        kventrySo.setKVEntry({ ...kventrySo.state.kventry, ttl })
    }
    const handleOptionsClose = () => {
        kventrySo.setOptionsOpen(false)
    }
    // RENDER

    return <Dialog
        open={kventrySa.optionsOpen}
        title="OPTIONS"
        width={150}
        store={kventrySo}
        noCloseOnClickParent={true}
        onClose={handleOptionsClose}
    >
        <div className="lyt-v">
            <ToggleMaxTimeCmp store={kventrySo}
                label="TTL"
                value={kventrySo.state.kventry?.ttl}
                desiredDefault={0}
                initDefault={1}
                inputUnit={TIME.NS}
                onChange={handleTTLChange}
            />
        </div>


    </Dialog>
}

export default OptionsDialog
