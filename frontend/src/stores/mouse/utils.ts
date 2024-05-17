import { CardsStore } from "../docs/cards"
import { ViewStore } from "../stacks/viewBase"


interface DragSource {
	group?: CardsStore
	view?: ViewStore
	index?: number
}

export interface DragDoc {

	source?: DragSource
	destination?: DragSource

	// /** indice del DOC da cui è partito il DRAG */
	// srcView?: ViewStore
	// /** eventualmente la CARD di destinazione (per esempio un document) */
	// dstView?: ViewStore

	// /** CARDS-GROUP DESTINAZIONE (quando ho una DRP-AREA)*/
	// groupDest?:CardsStore
	// /** 
	//  * nel caso di un drop su una DROP-AREA indica l'indice nell'array del GROUP 
	//  * se è un SUGAR-EDITOR indica la posizione nell'array CHILDREN
	//  * */
	// index?: number
}

export interface Position {
	x: number
	y: number
}
