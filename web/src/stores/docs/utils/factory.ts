import cnnSetup from "@/stores/stacks/connection";
import messagesSetup from "@/stores/stacks/messages";
import servicesSetup from "@/stores/stacks/services";
import { DOC_TYPE } from "@/types";
import { createStore } from "@priolo/jon";
import { ViewState, ViewStore } from "../docBase";

/** restituisce un identificativo sringa di una VIEW STORE */
export function getID(viewState: ViewState): string {
	if (!viewState.type && viewState.uuid) return viewState.uuid
	return `${viewState.type}${viewState.uuid ? `-${viewState.uuid}` : ""}`
}
/** da un ìidentificativo stringa restituisce una VIEW STATE parziale */
export function fromID(str: string): ViewState {
	const index = str.indexOf("-")
	if (index == -1) return { type: str as DOC_TYPE}
	const type = str.slice(0, index) as DOC_TYPE
	const uuid = str.slice(index + 1)
	return { type, uuid }
}

export function createUUID(): string {
	var dt = new Date().getTime();
	var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
		/[xy]/g,
		(c) => {
			let r = (dt + (Math.random() * 16)) % 16 | 0;
			dt = Math.floor(dt / 16);
			return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
		}
	)
	return uuid;
}

/** crea lo STORE adeguato */
export function buildStore(state: Partial<ViewState>): ViewStore {
	const setup = {
		[DOC_TYPE.CONNECTIONS]: cnnSetup,
		[DOC_TYPE.SERVICES]: servicesSetup,
		[DOC_TYPE.MESSAGES]: messagesSetup,
	}[state.type]
	if (!setup) return
	setup.state = { ...setup.state, ...state }
	const store: ViewStore = createStore(setup)
	// se non c'e' l'uuid lo creo IO!
	//if ( store.state.uuid == null ) store.state.uuid = createUUID()
	return store
}
