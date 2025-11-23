import { AboutStore } from "@/stores/stacks/about"
import layoutSo, { THEMES } from "@/stores/layout"
import { useStore } from "@priolo/jon"
import { FunctionComponent } from "react"
import { Dialog, List } from "@priolo/jack"



interface Props {
	store?: AboutStore
}



const ThemeDialog: FunctionComponent<Props> = ({
	store,
}) => {

	// STORE
	const aboutSa = useStore(store)
    const layoutSa = useStore(layoutSo)

	// HANDLER
	const handleClose = () => {
		store.setThemeOpen(false)
	}
	const handleSelect = (index: number) => {
		layoutSo.setTheme(THEMES[index].value)
		store.setThemeOpen(false)
	}

	// RENDER
    const indexSelect = THEMES.findIndex(t => t.value === layoutSa.theme)

	return (
		<Dialog
			open={aboutSa.themeOpen}
			title="THEME"
			width={120}
			store={store as any}
			onClose={handleClose}
		>
			<List<string>
				items={THEMES.map(t => t.label)}
				select={indexSelect}
				onSelect={handleSelect}
			/>
		</Dialog>
	)
}

export default ThemeDialog
