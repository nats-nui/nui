import { ViewStore } from "../docs/viewBase"



export interface DragDoc {
	/** indice del DOC da cui è partito il DRAG */
	srcView?: ViewStore
	/** in alternativa indica l'indice della posizione nella "root" */
	index?: number
}

export interface Position {
	x: number
	y: number
}
