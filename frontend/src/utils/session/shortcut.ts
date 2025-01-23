import { docsSo, FIXED_CARD, focusSo } from "@priolo/jack"
import { deckCardsSo } from "../../stores/docs/cards"

export function shortcutStart() {
	document.addEventListener('keydown', (event) => {
		if (!event.altKey) return
		// if (event.ctrlKey && event.key === 's') {
		// 	event.preventDefault()
		// 	SaveSession()
		// }

		switch (event.code) {
			case 'KeyC': {
				const view = docsSo.state.fixedViews[FIXED_CARD.CONNECTIONS]
				deckCardsSo.add({ view, anim: true }).then(() => focusSo.focus(view))
				break
			}
		}

	})
}
