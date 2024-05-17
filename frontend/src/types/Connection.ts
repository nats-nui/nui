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
	nKeySeed?: string
	creds?: string
	active?: boolean
}

export interface Subscription {
	subject: string
	disabled?: boolean
	favorite?: boolean

}

export enum AUTH_MODE {
	// use token field  
	TOKEN = "auth_token",
	// use username and password fields
	USER_PASSWORD = "auth_user_password",
	//use nkey public key and seed
	NKEY = "auth_nkey",
	// use jwt and nkey fields
	JWT = "auth_jwt",
	BEARER_JWT = "auth_jwt_bearer",
	// use creds field (local path to a file)
	CREDS_FILE = "auth_creds_file",
}


export enum CNN_STATUS {
	UNDEFINED = "undefined",
	CONNECTED = "connected",
	RECONNECTING = "reconnecting",
	DISCONNECTED = "disconnected",
}

