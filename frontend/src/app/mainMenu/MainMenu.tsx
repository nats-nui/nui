import docsSo, { FIXED_CARD } from "@/stores/docs"
import { deckCardsSo } from "@/stores/docs/cards"
import { menuSo } from "@/stores/docs/links"
import { buildTextEditor } from "@/stores/stacks/editor/utils/factory"
import { ClearSession, LoadSession, SaveSession } from "@/utils/session/startup"
import { useStore } from "@priolo/jon"
import React, { FunctionComponent } from "react"
import Button from "../../components/buttons/Button"
import AboutButton from "./AboutButton"
import cls from "./MainMenu.module.css"
import StoreButton from "./StoreButton"
import MenuButton from "./MenuButton"
import EditorIcon from "@/icons/EditorIcon"



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
	const handleOpenEditor = () => {
		const view = buildTextEditor("ciao!")
		deckCardsSo.add({ view, anim: true })
	}
	const handleHelp = () => window.open("https://natsnui.app/help/")

	// RENDER
	if (!docsSo.state?.fixedViews) return null
	const views = menuSa.all

	return <div style={style} className={cls.root}>

		<StoreButton
			label="ALL"
			store={docsSo.state.fixedViews[FIXED_CARD.CONNECTIONS]}
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
			<Button children="EDITOR" onClick={() => handleOpenEditor()} />
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
			store={docsSo.state.fixedViews[FIXED_CARD.LOGS]}
		/>

		{/* <MenuButton 
			title="A little reminder"
			subtitle="NOTE"
			onClick={() => handleOpenEditor()}
		>
			<EditorIcon style={{ width: 20 }} className="color-fg" />
		</MenuButton> */}

		<AboutButton />

	</div>
}

export default MainMenu
