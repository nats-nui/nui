

export interface Connection {
	id: string
	name: string
	subscriptions: Service[]
}

export interface Service {
	name: string
}