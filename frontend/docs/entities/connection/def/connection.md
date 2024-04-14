## CONNECTION

Oggetto a livello di NUI  
consente la gestione di uno o piu' SERVER-NATS

```typescript
Connection {
	id?: string
	name: string
	hosts: string[]
	subscriptions: Subscription[]
	auth: Auth[]
	status?: CNN_STATUS
}
```

```typescript
CNN_STATUS {
	UNDEFINED = "undefined",
	CONNECTED = "connected",
	RECONNECTING = "reconnecting",
	DISCONNECTED = "disconnected",
}
```

## AUTH

Definisce il tipo di autentificazione

```typescript
Auth {
	mode: AUTH_MODE
	username?: string
	password?: string
	token?: string
	jwt?: string
	n_key_seed?: string
	creds?: string
    active: boolean 
}
```

```typescript
AUTH_MODE {
	// no other info to set
	NONE = "auth_none",
	// use token field  
	TOKEN = "auth_token",
	// use username and password fields
	USER_PASSWORD = "auth_user_password",
	// use jwt and nkey fields
	JWT = "auth_jwt",
    // use a jwt token as bearer
    BEARER_JWT = "auth_jwt_bearer",
	// use creds field (local path to a file)
	CREDS_FILE = "auth_creds_file"
}
```


## SUBSCRIPTION

una specie di bookmark di alcuni SUBJECT  utilizzati tipicamente da questa CONNECTION  
Una volta stabilita la connessione con NUI è possibile cambiarli

```typescript
Subscription {
	subject: string
}
```


