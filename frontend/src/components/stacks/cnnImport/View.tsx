import FrameworkCard from "@/components/cards/FrameworkCard"
import { TextInput } from "@priolo/jack"
import { useStore } from "@priolo/jon"
import { FunctionComponent } from "react"
import ConfigIcon from "@/icons/cards/ConfigIcon"
import { CnnLoaderStore } from "@/stores/stacks/connectionLoader"
import clsCard from "../CardGreen.module.css"
import ActionsCmp from "./Actions"
import cls from "./View.module.css"

interface Props {
	store?: CnnLoaderStore
}

/** editazione json di configurazione per un entità */
const CnnLoaderView: FunctionComponent<Props> = ({
	store,
}) => {

	// STORE
	useStore(store)

	// HOOKs

	// HANDLER

	// RENDER
	const haveList = store.state.imports?.length > 0

	return <FrameworkCard
		className={clsCard.root}
		icon={<ConfigIcon />}
		store={store}
		actionsRender={<ActionsCmp store={store} />}
	>
		{!haveList ? (
			<div className={`jack-lyt-form ${cls.form}`}>
				<div className="lyt-v">
					<div className="jack-lbl-prop">DIRECTORY TO SEARCH:</div>
					<TextInput
						value={store.state.path}
						onChange={path => store.setPath(path)}
					/>
				</div>
			</div>
		) : (
			<div className={cls.list}>
				{store.state.imports.map((imp, i) => (
					<div key={i} className={cls.item}>
						<div className={cls.itemTitle}>{imp.name}</div>
						<div className={cls.itemDesc}>{imp.path}</div>
					</div>
				))}
			</div>
		)}
	</FrameworkCard>
}

export default CnnLoaderView


