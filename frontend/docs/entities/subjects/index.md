## INDEX

Discovery is two requests. Neither includes payloads. Busy lists are capped.

The SUBJECTS card shows a **family list** (first token), then a **partial stack** — one more level, never a hallway. Stored names load under the row you opened. See [discovery.md](./discovery.md).

### JETSTREAM PATTERNS

```
GET /api/connection/:id/subjects/jetstream
```

| name | default | meaning |
|---|---|---|
| `discard_sys` | `true` | hide `$SYS`, `$JS.`, `_INBOX` (not `$KV` / `$O`) |

`$KV` and `$O` collapse to one bucket node. Occupied names are a separate call.

### CORE LISTEN

```
GET /api/connection/:id/subjects/core?filter=>&listen_ms=2000
```

`filter` defaults to `>`. Catch-alls are allowed. Uses a short-lived connection, not the pooled MESSAGES connection. Name count and listen window are capped.

### OCCUPIED NAMES

```
GET /api/connection/:id/subjects/jetstream/:stream/occupied?filter=orders.>
```

Names that currently have messages in that stream, capped per stream. The card nests them under the pattern or bucket you opened.
