import FrameworkCard from "@/components/cards/FrameworkCard"
import { TitleAccordion } from "@priolo/jack"
import { useStore } from "@priolo/jon"
import React, { FunctionComponent } from "react"
import { ShortcutStore } from "../../../stores/stacks/shortcut"
import clsCard from "../CardWhiteDef.module.css"
import cls from "./View.module.css"
import ShortcutIcon from "@/assets/Shortcut.svg"

interface Props {
	store?: ShortcutStore
	style?: React.CSSProperties,
}

const ShortcutView: FunctionComponent<Props> = ({
	store: store,
	style,
}) => {

	// STORE
	useStore(store)

	// HOOKs

	// HANDLER

	// RENDER
	return <FrameworkCard
		className={clsCard.root}
		icon={<div style={{ fontSize: 16, fontWeight: 700 }}>?</div>}
		store={store}
	>
		<div className={cls.logo}>
			<img src={ShortcutIcon} alt="Shortcut" />
		</div>

		<div className="jack-lyt-form">


			<div className={cls.shortcut}>
				<div className={cls.kbr}>ALT</div>
				+
				<div className={`${cls.kbr} ${cls.single}`}>→</div>
			</div>
			<div className={cls.description}>Move focus to the right</div>

			<div className={cls.shortcut}>
				<div className={cls.kbr}>ALT</div>
				+
				<div className={`${cls.kbr} ${cls.single}`}>←</div>
			</div>
			<div className={cls.description}>Move focus to the left</div>

			<div className={cls.shortcut}>
				<div className={cls.kbr}>ALT</div>
				+
				<div className={`${cls.kbr} ${cls.single}`}>↓</div>
			</div>
			<div className={cls.description}>Focus to component below</div>

			<div className={cls.shortcut}>
				<div className={cls.kbr}>ALT</div>
				+
				<div className={`${cls.kbr} ${cls.single}`}>↑</div>
			</div>
			<div className={cls.description}>Focus to component above</div>

			<div className={cls.shortcut}>
				<div className={cls.kbr}>ALT</div>
				+
				<div className={cls.kbr}>F</div>
			</div>
			<div className={cls.description}>Focus on "text find" if available</div>



			<div className={cls.divider} />



			<div className={cls.shortcut}>
				<div className={cls.kbr}>ALT</div>
				+
				<div className={cls.kbr}>Z</div>
			</div>
			<div className={cls.description}>Focus from MAIN to DRAWER and vice versa</div>

			<div className={cls.shortcut}>
				<div className={cls.kbr}>ALT</div>
				+
				<div className={cls.kbr}>X</div>
			</div>
			<div className={cls.description}>Move card from MAIN to DRAWER and vice versa</div>



			<div className={cls.divider} />



			<div className={cls.shortcut}>
				<div className={cls.kbr}>ALT</div>
				+
				<div className={cls.kbr}>CTRL</div>
				+
				<div className={`${cls.kbr} ${cls.single}`}>→</div>
			</div>
			<div className={cls.description}>Move CARD to the right</div>

			<div className={cls.shortcut}>
				<div className={cls.kbr}>ALT</div>
				+
				<div className={cls.kbr}>CTRL</div>
				+
				<div className={`${cls.kbr} ${cls.single}`}>←</div>
			</div>
			<div className={cls.description}>Move CARD to the left</div>

			<div className={cls.shortcut}>
				<div className={cls.kbr}>ALT</div>
				+
				<div className={cls.kbr}>CTRL</div>
				+
				<div className={`${cls.kbr} ${cls.single}`}>↑</div>
			</div>
			<div className={cls.description}>Maximize CARD / ZEN MODE</div>

			<div className={cls.shortcut}>
				<div className={cls.kbr}>ALT</div>
				+
				<div className={cls.kbr}>CTRL</div>
				+
				<div className={`${cls.kbr} ${cls.single}`}>↓</div>
			</div>
			<div className={cls.description}>Minimize CARD</div>

			<div className={cls.shortcut}>
				<div className={cls.kbr}>ALT</div>
				+
				<div className={cls.kbr}>BACKSPACE</div>
			</div>
			<div className={cls.description}>Close CARD</div>

			<div className={cls.shortcut}>
				<div className={cls.kbr}>ALT</div>
				+
				<div className={cls.kbr}>D</div>
			</div>
			<div className={cls.description}>Detach CARD</div>



			<div className={cls.divider} />



			<div className={cls.shortcut}>
				<div className={cls.kbr}>ALT</div>
				+
				<div className={cls.kbr}>C</div>
			</div>
			<div className={cls.description}>Open CONNECTIONS card</div>

			<div className={cls.shortcut}>
				<div className={cls.kbr}>ALT</div>
				+
				<div className={cls.kbr}>1-9</div>
			</div>
			<div className={cls.description}>Execute a CARD button</div>


		</div>



	</FrameworkCard>
}

export default ShortcutView

