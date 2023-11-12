
export interface Connection {
	id: string
	name: string
	//hosts: string[]
	host: string
	subscriptions: Subscription[]
}

export interface Subscription {
	subject: string
	disabled?: boolean
}