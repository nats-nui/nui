import CheckRadioOnIcon from "@/icons/CheckRadioOnIcon"
import { ConsumerStore } from "@/stores/stacks/consumer/detail"
import { StreamMessagesFilter } from "@/stores/stacks/streams/utils/filter"
import { Button, DateTimeInput, Dialog, IconToggle } from "@priolo/jack"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useEffect, useState } from "react"



interface Props {
	store: ConsumerStore
}

const PauseDialog: FunctionComponent<Props> = ({
	store,
}) => {

	// STORE
	useStore(store)

	// HOOKs
	useEffect(() => {
		if (!store.state.pauseOpen) return
		setDateUntilTmp(store.state.consumer.config.pauseUntil)
		setInPauseTmp(inPause)
	}, [store.state.pauseOpen])
	const [dateUntilTmp, setDateUntilTmp] = useState<string>("")
	const [inPauseTmp, setInPauseTmp] = useState<boolean>(false)

	// HANDLER
	const handleUpdate = async () => {
		await store.updatePause({
			pause: inPauseTmp,
			until: dateUntilTmp,
		})
		store.setPauseOpen(false)
	}

	const handleClose = () => store.setPauseOpen(false)

	const handleChangePause = (select: boolean) => setInPauseTmp(select)


	// RENDER
	const inPause = store.state.consumer.paused
	const title = inPause ? "IT'S IN PAUSE NOW" : "IT'S RUNNING NOW"
	const updateDisabled = !!inPauseTmp && !dateUntilTmp

	return (
		<Dialog noCloseOnClickParent
			title={title}
			store={store}
			open={store.state.pauseOpen}
			onClose={handleClose}
		>
			<div className="jack-lyt-form var-dialog">

				<div className="lyt-v">
					<div className="jack-lbl-prop">PAUSE UNTIL</div>
					<DateTimeInput
						style={{ flex: 1 }}
						value={dateUntilTmp}
						onChange={(datetime: string) => setDateUntilTmp(datetime)}
					/>
				</div>

				 <div className="jack-cmp-h">
                        <IconToggle
                            check={inPauseTmp}
                            onChange={select => handleChangePause(select)}
                            trueIcon={<CheckRadioOnIcon />}
                        />
                        <div className="jack-lbl-prop">PAUSE</div>
                        <IconToggle
                            check={!inPauseTmp}
                            onChange={select => handleChangePause(!select)}
                            trueIcon={<CheckRadioOnIcon />}
                        />
                        <div className="jack-lbl-prop">RESUME</div>
                    </div>

				<div className="cmp-footer">
					<Button disabled={updateDisabled} children="UPDATE" onClick={handleUpdate} />
					<Button children="CANCEL" onClick={handleClose} />
				</div>

			</div>
		</Dialog>
	)
}

export default PauseDialog

