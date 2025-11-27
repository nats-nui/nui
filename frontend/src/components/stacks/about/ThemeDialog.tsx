import BigEyeIcon from "@/icons/BigEyeIcon"
import layoutSo, { THEMES } from "@/stores/layout"
import { AboutStore } from "@/stores/stacks/about"
import { ElementDialog, List } from "@priolo/jack"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useState } from "react"
import cls from "./View.module.css"



interface Props {
	store?: AboutStore
}

const ThemeDialog: FunctionComponent<Props> = ({
	store,
}) => {

	// STORE
	const layoutSa = useStore(layoutSo)

	// HOOKS
	const [element, setElement] = useState<HTMLElement>(null)

	// HANDLER
	const handleThemeClick = (e) => {
		setElement(!!element ? null : e.target as HTMLElement)
	}
	const handleSelect = (index: number) => {
		layoutSo.setTheme(THEMES[index].value)
		setElement(null)
	}

	// RENDER
	const indexSelect = THEMES.findIndex(t => t.value === layoutSa.theme)

	return <>
		<div className={`${cls.link} jack-focus-4`}
			onClick={handleThemeClick}
		><BigEyeIcon style={{ width: 24, height: 24 }} />Theme</div>

		<ElementDialog
			element={element}
			title="THEME"
			width={120}
			store={store as any}
			onClose={() => setElement(null)}
		>
			<List<string>
				items={THEMES.map(t => t.label)}
				select={indexSelect}
				onSelect={handleSelect}
			/>
		</ElementDialog>
	</>
}

export default ThemeDialog
