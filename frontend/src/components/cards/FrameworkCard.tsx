import { ViewStore } from "@/stores/stacks/viewBase"
import { FrameworkCard, Header, IconButton } from "@priolo/jack"
import { FunctionComponent } from "react"
import IconizedIcon from "../../icons/IconizeIcon"
import docsSo from "../../stores/docs"
import { menuSo } from "../../stores/docs/links"



interface Props {
	store: ViewStore
	className?: string
	style?: React.CSSProperties
	styleBody?: React.CSSProperties

	icon?: React.ReactNode
	actionsRender?: React.ReactNode
	iconizedRender?: React.ReactNode
	children: React.ReactNode
}

/** struttura standard di una CARD */
const MyFrameworkCard: FunctionComponent<Props> = ({
	store,
	className,
	style,
	styleBody,
	icon,
	actionsRender,
	iconizedRender,
	children,
}) => {

	// HANDLER
	const handleToggleIconize = () => {
		if (!inMenu) {
			//store.state.group.remove({ view: store })
			menuSo.add({ view: store })
		}
		// else {
		// 	menuCardsSo.remove({ view: store })
		// }
	}

	// RENDER
	const inZen = docsSo.state.zenCard == store
	const inMenu = !inZen && menuSo.find(store)
	const inRoot = inZen || !store.state.parent
	//const inDrawer = !inZen && store.state.group == drawerCardsSo
	const showBttPin = !inZen && inRoot && store.state.pinnable
	//const showBttAnchor = !inZen && inRoot && (enter || inDrawer)

	return <FrameworkCard
		store={store}
		className={className}
		style={style}
		styleBody={styleBody}

		headerRender={<Header
			store={store}
			icon={icon}
			extraRender={showBttPin && (
				<IconButton onClick={handleToggleIconize}>
					<IconizedIcon />
				</IconButton>
			)}
		/>}

		actionsRender={actionsRender}
		iconizedRender={iconizedRender}
		children={children}
	/>

}

export default MyFrameworkCard
