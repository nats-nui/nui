
export interface EventMessage { 
	event: string 
	payload: any
}
type CallBack = (msg: EventMessage) => void;
type EventsDictionary = { [name: string]: CallBack[] }



/**
 * Gestore generico per eventi per il browser.
 */
export class EventEmitter {

	/**
	 * Per mette di inizializzare degli eventi cosi' da poter utilizzare l'evento speciale "*"
	 */
	constructor(events?: string[]) {
		if (!!events && Array.isArray(events)) {
			this.eventsCallbacks = events.reduce((acc, event) => {
				acc[event] = []
				return acc
			}, {} as EventsDictionary)
		}
	}

	/**
	 * Una dictionary di eventi e i relativi listener
	 */
	eventsCallbacks: EventsDictionary = {}

	/**
	 * Aggiunge un listener per un evento
	 * @param event evento da gestire, "*" per tutti gli eventi attualmente, "$" evento chiamato sempre in forma anonima
	 * @param callback funzione da eseguire
	 **/
	on(event: string | string[], callback: CallBack) {
		if (event == "*") event = Object.keys(this.eventsCallbacks)
		if (Array.isArray(event)) return event.forEach(key => this.on(key, callback))

		let callbacks = this.eventsCallbacks[event]
		if (!callbacks) {
			callbacks = []
			this.eventsCallbacks[event] = callbacks
		}
		callbacks.push(callback)
	}

	/**
	 * Rimuove un listener per un evento specifico
	 */
	off(event: string | string[], callback: CallBack) {
		if (event == "*") event = Object.keys(this.eventsCallbacks)
		if (Array.isArray(event)) return event.forEach(key => this.off(key, callback))

		let callbacks = this.eventsCallbacks[event]
		if (!callbacks) return
		if (!callback) return this.eventsCallbacks[event] = []
		this.eventsCallbacks[event] = callbacks.filter(cb => cb != callback)
	}

	/**
	 * Elimina tutti i listener per un evento
	 * se event == null elimina tutti i listener
	 */
	offAll(event?: string) {
		if (!event) {
			this.eventsCallbacks = {}
			return
		}
		delete this.eventsCallbacks[event]
	}

	/**
	 * Esegue un listener solo una volta
	 */
	once(event: string, callback: CallBack) {
		this.on(event, e => {
			callback(e)
			this.off(event, callback)
		})
	}

	/**
	 * Permette di emettere un evento
	 */
	emit(event: string, payload: any) {
		const callbacks = (this.eventsCallbacks[event] ?? []).concat(this.eventsCallbacks["$"] ?? [])
		for (const callback of callbacks) {
			callback({ event, payload })
		}
	}



}