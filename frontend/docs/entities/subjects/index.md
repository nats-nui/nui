## INDEX

Discovery is two requests. Neither includes payloads. Busy lists are capped.

The SUBJECTS card shows a **family list** (first token), then a **partial stack** — one more level, never a hallway. Stored names load under the row you opened. See [discovery.md](./discovery.md).

### JETSTREAM PATTERNS

```
GET /api/connection/:id/subjects/jetstream
```

`$KV` and `$O` collapse to one bucket node. Occupied names are a separate call. System names stay discarded.

### CORE LISTEN

```
GET /api/connection/:id/subjects/core?filter=>&listen_ms=2000
```

Opening a connection does not subscribe. System names stay discarded.

Refresh samples a name you typed. LISTEN / ALL start a live subscribe. Poll reads that snapshot. Poll will not start one.

### OCCUPIED NAMES

```
GET /api/connection/:id/subjects/jetstream/:stream/occupied?filter=orders.>
```

Names that currently have messages in that stream, sorted then capped per stream so a busy stream shows the same first page on every poll. The card nests them under the pattern or bucket you opened.
