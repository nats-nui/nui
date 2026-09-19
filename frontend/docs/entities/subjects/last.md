## LAST

Last message JetStream still has for that name. Catalogs never include payloads. Core has no stored last message.

```
GET /api/connection/:id/subjects/last?subject=:subject&stream=:stream
```

Payload is base64.
