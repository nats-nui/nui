import { docsSo, FIXED_CARD, focusSo, utils } from "@priolo/jack"
import { deckCardsSo, drawerCardsSo } from "../../stores/docs/cards"



export function shortcutStart() {
	document.addEventListener('keydown', (event) => {
		if (!event.altKey) return
		if (event.code == "AltLeft" || event.code == "AltRight") return
		// if (event.ctrlKey && event.key === 's') {
		// 	event.preventDefault()
		// 	SaveSession()
		// }

		switch (event.code) {

			// CONNECTIONS
			case 'KeyC': {
				const view = docsSo.state.fixedViews[FIXED_CARD.CONNECTIONS]
				deckCardsSo.add({ view, anim: true }).then(() => focusSo.focus(view))
				break
			}

			// MOVE IN DRAWER / DECK
			case "KeyS": {
				const [deck, drawerDeck] = docsSo.state.allDeck
				const view = focusSo.state.view
				const nextFocus = utils.getNear(view) ?? utils.getNear(view, true)
				if (view.state.group == deck) {
					view.state.group.move({ view, groupDest: drawerDeck })
					if (drawerCardsSo.state.width == 0) drawerCardsSo.toggle()
				} else {
					view.state.group.move({ view, groupDest: deck })
				}

				if (!!nextFocus) focusSo.focus(nextFocus);
				break
			}

			// TOGGLE DRAWER
			case "KeyA": {
				drawerCardsSo.toggle()
				break
			}

		}
	})
}
