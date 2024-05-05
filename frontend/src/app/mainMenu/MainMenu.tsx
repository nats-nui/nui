import docSo, { FIXED_CARD } from "@/stores/docs"
import { menuSo } from "@/stores/docs/links"
import { ClearSession, SaveSession, LoadSession } from "@/utils/session/startup"
import { useStore } from "@priolo/jon"
import React, { FunctionComponent } from "react"
import Button from "../../components/buttons/Button"
import cls from "./MainMenu.module.css"
import StoreButton from "./StoreButton"
import docsSo from "@/stores/docs"
import AboutButton from "./AboutButton"
import MenuButton from "./MenuButton"
import HelpIcon from "@/icons/HelpIcon"



interface Props {
	style?: React.CSSProperties
}

const MainMenu: FunctionComponent<Props> = ({
	style,
}) => {

	// STORE
	const menuSa = useStore(menuSo)
	useStore(docsSo)

	// HOOKS

	// HANDLERS
	const handleHelp = () => window.open("https://natsnui.app/help/")

	// RENDER
	if (!docSo.state?.fixedViews) return null
	const views = menuSa.all

	return <div style={style} className={cls.root}>

		<StoreButton
			label="ALL"
			store={docSo.state.fixedViews[FIXED_CARD.CONNECTIONS]}
		/>

		{views.map((view) => (
			<StoreButton key={view.state.uuid}
				store={view}
			/>
		))}

		<div style={{ flex: 1 }} />

		{/* *** DEBUG *** */}
		{process.env.NODE_ENV === 'development' && <>
			<Button children="SAVE" onClick={() => SaveSession()} />
			<Button children="LOAD" onClick={() => LoadSession()} />
			<Button children="RESET" onClick={() => ClearSession()} />
		</>}
		{/* *** DEBUG *** */}

		{/* <StoreButton
			label="HELP"
			store={docSo.state.fixedViews[FIXED_CARD.HELP]}
		/> */}

		{/* <MenuButton 
			title={"HELP"}
			subtitle={"https://natsnui.app/help/"}
			onClick={handleHelp}
		>
			<HelpIcon style={{ width: 20 }} className="color-fg" />
		</MenuButton> */}

		<StoreButton
			label="LOG"
			store={docSo.state.fixedViews[FIXED_CARD.LOGS]}
		/>

		<AboutButton />

	</div>
}

export default MainMenu
