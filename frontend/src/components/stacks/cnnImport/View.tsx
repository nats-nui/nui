import FrameworkCard from "@/components/cards/FrameworkCard"
import ConfigIcon from "@/icons/cards/ConfigIcon"
import { CnnImportStore } from "@/stores/stacks/cnnImport"
import { Dialog, TextInput } from "@priolo/jack"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useState } from "react"
import BigEyeIcon from "../../../icons/BigEyeIcon"
import CloseIcon from "../../../icons/CloseIcon"
import DoneIcon from "../../../icons/DoneIcon"
import clsCard from "../CardGreenDef.module.css"
import ActionsCmp from "./Actions"
import cls from "./View.module.css"
import SkullIcon from "../../../icons/SkullIcon"
import SuccessIcon from "../../../icons/SuccessIcon"



interface Props {
	store?: CnnImportStore
}

/** editazione json di configurazione per un entità */
const CnnLoaderView: FunctionComponent<Props> = ({
	store,
}) => {

	// STORE
	useStore(store)

	// HOOKs
	const [dialogOpen, setDialogOpen] = useState(false)

	// HANDLER

	// RENDER
	const haveList = store.state.status == "DONE"

	return <FrameworkCard
		className={clsCard.root}
		icon={<ConfigIcon />}
		store={store}
		actionsRender={<ActionsCmp store={store} />}
	>
		{!haveList ? <>
			<BigEyeIcon style={{ alignSelf: "center", margin: "30px 0px 40px 0px" }} />
			<div className={`jack-lyt-form`}>
				<div className="lyt-v">
					<div className="jack-lbl-prop">DIRECTORY TO SEARCH:</div>
					<TextInput autoFocus
						readOnly={store.state.status == "LOADING"}
						value={store.state.path}
						onChange={path => store.setPath(path)}
						onKeyEnter={() => store.import()}
					/>
				</div>
			</div>
		</> : <>
			<div className={cls.list}>
				{store.state.imports.map((imp, i) => (
					<div key={i} className={cls.item}
						onClick={() => store.setDilaog({ open: true, imp })}
					>
						{!!imp.error ?
							<CloseIcon className={`${cls.icon} ${cls.error}`} />
							:
							<DoneIcon className={cls.icon} />
						}
						<div className={cls.text}>
							<div className={cls.title}>{imp.name}</div>
							<div className={cls.path}>{trunc(imp.path, 35)}</div>
						</div>
					</div>
				))}
			</div>
			<Dialog noCloseOnClickParent
				title={store.state.dialog.imp?.name}
				width={250}
				open={store.state.dialog.open}
				store={store}
				onClose={() => store.setDilaog({ ...store.state.dialog, open: false })}
			>
				<div className="jack-lbl-readonly">{store.state.dialog.imp?.path}</div>
				<div style={{ borderBottom: "1px dashed black", flex: 1, margin: "5px 0px", opacity: .2 }} />
				<div className={cls.dlg}>
					{store.state.dialog.imp?.error ? <>
						<SkullIcon className={cls.icon} />
						<div className={cls.desc}>{store.state.dialog.imp?.error}</div>
					</> : <>
						<SuccessIcon className={cls.icon} />
						<div className={cls.desc}>SUCCESS</div>
					</>}
				</div>
			</Dialog>
		</>}
	</FrameworkCard>
}

export default CnnLoaderView


function trunc(path: string, maxLength: number) {
	if (path.length <= maxLength) return path;
	return `\u2026${path.slice(-maxLength)}`
}