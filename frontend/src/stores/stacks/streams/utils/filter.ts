
export interface StreamMessagesFilter {
	/** SUBJECTS selezionati da filtrare */
	subjects?: string[]
	/** numero di MESSAGES da ricavare ogni loading */
	interval?: number
	/** sequenza iniziale */
	startSeq?: number
	startTime?: number
	byTime?: boolean
}
