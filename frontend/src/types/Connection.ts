export interface Connection {
	id?: string
	name: string
	hosts: string[]
	subscriptions: Subscription[]
	auth: Auth[]
	status?: CNN_STATUS
}

export interface Auth {
	mode: AUTH_MODE
	username?: string
	password?: string
	token?: string
	jwt?: string
	nkey?: string
	creds?: string
	active?: boolean
}

export interface Subscription {
	subject: string
	disabled?: boolean
}

export enum AUTH_MODE {
	// use token field  
	TOKEN = "auth_token",
	// use username and password fields
	USER_PASSWORD = "auth_user_password",
	// use jwt and nkey fields
	JWT = "auth_jwt",
	// use creds field (local path to a file)
	CREDS_FILE = "auth_creds_file",
}


export enum CNN_STATUS {
	UNDEFINED = "undefined",
	CONNECTED = "connected",
	RECONNECTING = "reconnecting",
	DISCONNECTED = "disconnected",
}
