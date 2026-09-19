## INDEX

Discovery is two requests. Neither includes payloads. Busy lists are capped.

The SUBJECTS card shows a **family list** (first token), then a **partial stack** — one more level, never a hallway. Stored names load under the row you opened. See [discovery.md](./discovery.md).

### JETSTREAM PATTERNS

```
GET /api/connection/:id/subjects/jetstream
```

| name | default | meaning |
|---|---|---|
| `discard_sys` | `true` | DISCARDS SYSTEM MESSAGES — same control as MESSAGES |

`$KV` and `$O` collapse to one bucket node. Occupied names are a separate call.

### CORE LISTEN

```
GET /api/connection/:id/subjects/core?filter=>&listen_ms=2000
```

Opening a connection does not subscribe. DISCARDS SYSTEM MESSAGES is on, same toggle as MESSAGES.

Refresh is a short listen. Continuous update (poll) is one live subscribe; later ticks read the snapshot. LISTEN / ALL start that subscribe. Poll alone does not start ALL.

### OCCUPIED NAMES

```
GET /api/connection/:id/subjects/jetstream/:stream/occupied?filter=orders.>
```

Names that currently have messages in that stream, sorted then capped per stream so a busy stream shows the same first page on every poll. The card nests them under the pattern or bucket you opened.
