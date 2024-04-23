import { DocState } from "@/stores/docs";
import { Log } from "@/stores/log/utils";
import { ViewState } from "@/stores/stacks/viewBase";



export interface Session {
	allStates: Partial<ViewState>[]
	docsState: Partial<DocState>
	deckUuids: string[]
	drawerUuids: string[]
	menuUuids: string[]
	logs: Log[]
}