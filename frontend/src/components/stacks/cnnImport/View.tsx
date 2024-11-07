import FrameworkCard from "@/components/cards/FrameworkCard"
import ConfigIcon from "@/icons/cards/ConfigIcon"
import { CnnImportStore } from "@/stores/stacks/cnnImport"
import { Dialog, TextInput, TooltipWrapCmp } from "@priolo/jack"
import { useStore } from "@priolo/jon"
import { FunctionComponent } from "react"
import BigEyeIcon from "../../../icons/BigEyeIcon"
import CloseIcon from "../../../icons/CloseIcon"
import DoneIcon from "../../../icons/DoneIcon"
import SkullIcon from "../../../icons/SkullIcon"
import SuccessIcon from "../../../icons/SuccessIcon"
import { CliImport } from "../../../types"
import clsCard from "../CardGreenDef.module.css"
import ActionsCmp from "./Actions"
import cls from "./View.module.css"



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

	// HANDLER
	const handleDialogClose = () => store.setDilaog({ ...store.state.dialog, imp: null, open: false })
	const handleSelect = (imp: CliImport) => {
		if (store.state.dialog.imp == imp) return handleDialogClose()
		store.setDilaog({ ...store.state.dialog, imp, open: true })
	}

	// RENDER
	const haveList = store.state.status == "DONE"
	const isSelect = (imp: CliImport) => store.state.dialog.imp == imp

	const ResultCmp = ({ imp }: { imp: CliImport }) => <div className={cls.dlg}>
		{imp?.error ? <>
			<SkullIcon className={cls.icon} />
			<div className={cls.desc}>{imp?.error}</div>
		</> : <>
			<SuccessIcon className={cls.icon} />
			<div className={cls.desc}>SUCCESS</div>
		</>}
	</div>

	return <FrameworkCard
		className={clsCard.root}
		icon={<ConfigIcon />}
		store={store}
		actionsRender={<ActionsCmp store={store} />}
	>
		{!haveList ? <>
			<div className="jack-title" style={{ textAlign: "center" }}>
				IMPORT NATS CLI CONTEXT FILES INTO NUI
			</div>
			<BigEyeIcon className={cls.bigEye} />
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

			{/* LIST */}
			<div className={cls.list}>
				{store.state.imports.map((imp, i) => (
					<TooltipWrapCmp key={i} className={`${cls.item} ${isSelect(imp) ? cls.selected : ""}`}
						onClick={() => handleSelect(imp)}
						content={<ResultCmp imp={imp} />}
					>
						<div className={cls.first}>
							{!!imp.error ?
								<CloseIcon className={`${cls.icon} ${cls.error}`} />
								:
								<DoneIcon className={cls.icon} />
							}
							<div className={cls.title}>{imp.name}</div>
						</div>
						<div className={cls.path}>{trunc(imp.path, 35)}</div>
					</TooltipWrapCmp>
				))}
			</div>

			<Dialog noCloseOnClickParent
				title={store.state.dialog.imp?.name}
				width={250}
				open={store.state.dialog.open}
				store={store}
				onClose={handleDialogClose}
			>
				<div className="jack-lbl-readonly">{store.state.dialog.imp?.path}</div>
				<div className={cls.divider} />
				<ResultCmp imp={store.state.dialog.imp} />
			</Dialog>
		</>}
	</FrameworkCard>
}

export default CnnLoaderView


function trunc(path: string, maxLength: number) {
	if (path.length <= maxLength) return path;
	return `\u2026${path.slice(-maxLength)}`
}