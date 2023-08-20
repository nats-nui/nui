import cnnSetup from "@/stores/connection";
import messagesSetup from "@/stores/messages";
import servicesSetup from "@/stores/services";
import { DOC_TYPE } from "@/types";
import { createStore } from "@priolo/jon";
import { ViewState, ViewStore } from "../docBase";



/** crea crea lo STORE adeguato */
export function initView(state: Partial<ViewState>): ViewStore {
	const setup = {
		[DOC_TYPE.CONNECTIONS]: cnnSetup,
		[DOC_TYPE.SERVICES]: servicesSetup,
		[DOC_TYPE.MESSAGES]: messagesSetup,
	}[state.type]
	if (!setup) return
	setup.state = {...setup.state, ...state}
	const store: ViewStore = createStore(setup)
	return store
}
