## LAST

Returns the last stored JetStream message for a subject. Catalogs never include payloads. Core has no stored last message.

```
GET /api/connection/:id/subjects/last?subject=:subject&stream=:stream
```

Wildcards are not accepted. Payload is base64 and is returned in full, with the original message headers.
