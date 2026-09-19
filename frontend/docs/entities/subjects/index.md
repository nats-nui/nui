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

Opening a connection does not subscribe. Internal names (`$SYS`, `$JS.`, `_INBOX`) stay discarded unless `discard_sys=false`.

Refresh (`listen_ms`) is a time-boxed sample. Continuous update (`watch=1`) is one live subscribe; later requests only read the snapshot. `DELETE` stops the watch. Catch-alls are allowed when asked (LISTEN / ALL / refresh). Poll alone does not start `>`.

### OCCUPIED NAMES

```
GET /api/connection/:id/subjects/jetstream/:stream/occupied?filter=orders.>
```

Names that currently have messages in that stream, sorted then capped per stream so a busy stream shows the same first page on every poll. The card nests them under the pattern or bucket you opened.
