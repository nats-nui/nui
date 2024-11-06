
## IMPORT FROM CLI

### URL

```
POST /api/connection/import/nats-cli
```


### BODY

```typescript
{
    path: string
}
```

### RESPONSE

```typescript
{
    connections: Connection[]
    imports: CliImport[]
}
connection
```

[CONNECTION](./def/connection.md)

[CLI IMPORT](./def/nats-cli-import.md)