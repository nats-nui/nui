
export interface Connection {
	id?: string
	name: string
	hosts: string[]
	subscriptions: Subscription[]
	auth: Auth[]
}

export interface Auth {
	mode: AUTH_MODE
	username?: string
	password?: string
	token?: string
	jwt?: string
	nkey?: string
	creds?: string
}

export enum AUTH_MODE {
	// no other info to set
	NONE = "auth_none",
	// use token field  
	TOKEN = "auth_token",
	// use username and password fields
	USER_PASSWORD = "auth_user_password",
	// use jwt and nkey fields
	JWT = "auth_jwt",
	// use creds field (local path to a file)
	CREDS_FILE = "auth_creds_file",
}

export interface Subscription {
	subject: string
	disabled?: boolean
}