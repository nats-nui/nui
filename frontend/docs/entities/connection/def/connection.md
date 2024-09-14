## CONNECTION

Nui connection  that manages one or more underlying NATS servers connections

```typescript

```typescript
Connection {
	id?: string
	name: string
	hosts: string[]
	inboxPrefix: string
	subscriptions: Subscription[]
	auth: Auth[]
	tls_auth: TLSAuth
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

Manage the authentication for the connection

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
    // use NKEY public key and seed
    NKEY = "auth_nkey",
	// use jwt and nkey fields
	JWT = "auth_jwt",
    // use a jwt token as bearer
    BEARER_JWT = "auth_jwt_bearer",
	// use creds field (local path to a file)
	CREDS_FILE = "auth_creds_file"
}
```

```typescript
TLSAuth {
    enabled: bool
    cert_path: string
    key_path: string
    ca_path: string
}
```

```typescript
```

## SUBSCRIPTION

bookmarks favorite core nats messages subscriptions to be used in the connection

```typescript
Subscription {
	subject: string
}
```


