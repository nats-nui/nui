import FrameworkCard from "@/components/cards/FrameworkCard"
import EditorCode from "@/components/editor"
import { useStore } from "@priolo/jon"
import { FunctionComponent } from "react"
import { JsonConfigStore } from "../../../stores/stacks/jsonconfig"
import { MSG_FORMAT } from "../../../utils/editor"
import clsCard from "../CardCyanDef.module.css"
import ActionsCmp from "./Actions"
import cls from "./View.module.css"
import ConfigIcon from "../../../icons/cards/ConfigIcon"



interface Props {
	store?: JsonConfigStore
}

/** editazione json di configurazione per un entità */
const JsonConfigView: FunctionComponent<Props> = ({
	store: jsonSo,
}) => {

	// STORE
	const jsonSa = useStore(jsonSo)

	// HOOKs

	// HANDLER
	//const refEditor = (ref: EditorRefProps) => jsonSa.editorRef = ref

	// RENDER

	return <FrameworkCard
		className={clsCard.root}
		icon={<ConfigIcon />}
		store={jsonSo}
		actionsRender={<ActionsCmp store={jsonSo} />}
	>
		<div className={`jack-lyt-form ${cls.form}`}>

			<div style={{ flex: 1, height: 0 }} >
				<EditorCode
					//ref={refEditor}
					autoFormat
					format={MSG_FORMAT.JSON}
					value={jsonSa.value}
					onChange={value => jsonSo.setValue(value)}
				/>
			</div>

		</div>

	</FrameworkCard>
}

export default JsonConfigView


