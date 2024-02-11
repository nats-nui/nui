
## PUBLISH


### URL
```
POST /api/connection/:connection_id/publish
```
- `connection_id`
la connection su cui si vuole pubblicare


### BODY
```typescript
{
    "subject": string,	// un solo SUBJECT
    "payload": string,  // base64 encoded
}
```


### RESPONSE
`null`
