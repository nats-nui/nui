import docSo from "@/stores/docs"
import { EndSession, StartSession } from "@/utils/startup"
import { useStore } from "@priolo/jon"
import React, { FunctionComponent } from "react"
import Button from "../buttons/Button"
import cls from "./MainMenu.module.css"
import StoreButton from "./StoreButton"



interface Props {
	style?: React.CSSProperties
}

const MainMenu: FunctionComponent<Props> = ({
	style,
}) => {

	// STORE
	const docSa = useStore(docSo)

	// HOOKS

	// HANDLERS

	// RENDER
	const views = docSa.menu

	return <div style={style} className={cls.root}>
		<StoreButton
			store={docSo.state.connView }
		/>
		{views.map((view) => (
			<StoreButton key={view.state.uuid} store={view} />
		))}

		<div style={{ flex: 1 }} />

		{/* *** DEBUG *** */}
		{process.env.NODE_ENV === 'development' && <>
			<Button children="SAVE" onClick={() => EndSession()} />
			<Button children="LOAD" onClick={() => StartSession()} />
		</>}
		{/* *** DEBUG *** */}

		<StoreButton 
			store={docSo.state.logsView}
		/>
	</div>
}

export default MainMenu
