
export interface Connection {
	id: string
	name: string
	hosts: string[]
	subscriptions: Subscription[]
}

export interface Subscription {
	subject: string
	disabled?: boolean
}