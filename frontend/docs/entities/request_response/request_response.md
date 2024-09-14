
## PUBLISH

### URL

```
POST /api/connection/:connection_id/request
```

- `connection_id`



### BODY

```typescript
{
    "subject": string,	// request subject
    "payload": string,  // base64 encoded request payload
    "headers": {[key: string] : string[]},
    "timeout": int // timeout in ns
}
```


### RESPONSE
```typescript
{
    "subject": string,	// response subject
    "payload": string  // base64 encoded response payload
    "headers": {[key: string] : string[]}
}
```