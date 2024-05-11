import { CardsStore } from "../docs/cards"
import { ViewStore } from "../stacks/viewBase"



export interface DragDoc {
	/** indice del DOC da cui è partito il DRAG */
	srcView?: ViewStore
	/** CARDS-GROUP DESTINAZIONE */
	groupDest?:CardsStore
	/** eventualmente la CARD di destinazione */
	dstView?: ViewStore
	/** indice DESTINAZIONE della posizione nella "root" */
	index?: number
}

export interface Position {
	x: number
	y: number
}
