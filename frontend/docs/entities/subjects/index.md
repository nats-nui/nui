## SUBJECTS

The SUBJECTS card lists JetStream capture patterns and Core subjects observed during a sample or live subscription. It opens without subscribing. Folders start closed; names deeper than two levels share one row. Expanding a JetStream pattern or bucket loads its stored subjects. Selecting a stored subject opens its last message.

Refresh samples the typed filter. LISTEN starts a live subscription; ALL selects `>`. An empty filter does not subscribe. Poll reads an existing listener. FILTERS hides `$SYS`, `$JS`, and `_INBOX` by default; `$KV` and `$O` remain visible.

### JetStream catalog

```
GET /api/connection/:id/subjects/jetstream
GET /api/connection/:id/subjects/jetstream/:stream/occupied?filter=orders.>
```

The catalog contains capture patterns, with KV and Object Store patterns grouped by bucket. Occupied subjects are fetched separately from the first server page, sorted and capped per stream. Responses mark incomplete lists with `truncated`. Catalogs do not include message payloads.

### Core discovery

```
GET /api/connection/:id/subjects/core?filter=orders.>&listen_ms=2000
GET /api/connection/:id/subjects/core?filter=orders.>&watch=1&session=:session
GET /api/connection/:id/subjects/core?session=:session
DELETE /api/connection/:id/subjects/core?session=:session
```

The first request samples for a bounded duration. `watch=1` starts or replaces the connection's live listener. Requests without a filter read its snapshot. A matching session is required to read or stop a listener. Unread listeners expire after 60–90 seconds.

All catalog requests accept `discard_sys=false` to include internal subjects. See [last.md](./last.md) for stored messages.
