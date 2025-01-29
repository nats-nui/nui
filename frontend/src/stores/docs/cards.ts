import { cardsSetup, CardsStore, docsSo } from "@priolo/jack"
import { createStore, mixStores } from "@priolo/jon"
import { DrawerStore, setupDrawer } from "./drawer"



export const DECK_INDEX = {
	MAIN: 0,
	DRAWER: 1,
}

// creo il DECK
export const deckCardsSo = createStore(cardsSetup) as CardsStore
// creo il DRAWER
export const drawerCardsSo = createStore(mixStores(cardsSetup, setupDrawer)) as DrawerStore
// creo la lista dei DECK a disposizione
docsSo.setAllDeck([deckCardsSo, drawerCardsSo])