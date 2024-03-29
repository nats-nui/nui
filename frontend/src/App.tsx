//import srcBg from "@/assets/bg4.jpg"
import docSo, { DocState } from "@/stores/docs"
import { ViewStore } from "@/stores/stacks/viewBase"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useMemo, useState } from "react"
import cls from "./App.module.css"
import DragCmp from "./components/DragCmp"
import TooltipCmp from "./components/TooltipCmp"
import CardCmp from "./components/cards/CardCmp"
import MainMenu from "./components/mainMenu/MainMenu"
import IconButton from "./components/buttons/IconButton"
import ExpandHIcon from "./icons/ExpandHIcon"
import CompressHIcon from "./icons/CompressHIcon"



const App: FunctionComponent = () => {

	// STORES
	const docSa: DocState = useStore(docSo)

	// HOOKS
	const [storesAnchored, stores] = useMemo(() => [
		docSo.getAnchored(),
		docSo.getVisible(),
	], [docSa.all, docSa.anchored])

	const [exp, setExp] = useState(true)

	// HANDLERS

	// RENDER
	return (
		<div className={cls.root}>

			<MainMenu />

			<div className={cls.content}>

				<div className={cls.visible}>
					{stores.map((store: ViewStore) =>
						<CardCmp key={store.state.uuid}
							store={store}
						/>
					)}
				</div>

				<div className={cls.fix} >

					<div style={{ display: "flex", flexDirection: "column", gap: 10}}>
						<IconButton
							style={{
								//color: "var(--var-1)", backgroundColor:"var(--text-bg)",
								color: "var(--text-bg)", backgroundColor: "var(--var-1)",
								//alignSelf: "start"
							}}
							onClick={() => setExp(!exp)}
						>{exp ? <ExpandHIcon /> : <CompressHIcon />}</IconButton>
						<div className="bars-alert-bg-1" style={{ flex: 1}} />
						<div className={cls.fix_label}>DRAWER</div>
						<div className="bars-alert-bg-1" style={{ flex: 1}} />
					</div>

					<div style={cssFixed(exp)}>
						{storesAnchored.map((store: ViewStore) =>
							<CardCmp key={store.state.uuid}
								store={store}
							/>
						)}
					</div>

					{/* <DropArea index={-1} /> */}
				</div>
			</div>

			<DragCmp />
			<TooltipCmp />

		</div>
	)
}

export default App

const cssFixed = (exp: boolean): React.CSSProperties => ({
	display: exp ? "flex" : "none",
})