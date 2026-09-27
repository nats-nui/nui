## LAST

Last message JetStream still has for that name. Catalogs never include payloads. Core has no stored last message.

```
GET /api/connection/:id/subjects/last?subject=:subject&stream=:stream
```

The subject must be a literal name. Payload is base64 and is returned in full, with the original message headers.
