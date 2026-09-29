import { cardsSetup, docsSo } from "@priolo/jack"
import { createStore, mixStores } from "@priolo/jon"
import { setupDrawer } from "./drawer"



export const DECK_INDEX = {
	MAIN: 0,
	DRAWER: 1,
}

// creo il DECK
export const deckCardsSo = createStore(cardsSetup)
// creo il DRAWER
export const drawerCardsSo = createStore(mixStores(cardsSetup, setupDrawer)) 
// creo la lista dei DECK a disposizione
docsSo.setAllDeck([deckCardsSo, drawerCardsSo])