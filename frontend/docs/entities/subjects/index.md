## INDEX

Catalogs do not include payloads. Busy lists are capped.

The SUBJECTS card shows a **family list** (first token), then one more level. Stored names load under the row you opened. See [discovery.md](./discovery.md).

### JETSTREAM PATTERNS

```
GET /api/connection/:id/subjects/jetstream
GET /api/connection/:id/subjects/jetstream?discard_sys=false
```

`$KV` and `$O` collapse to one bucket node. Occupied names are a separate call. `$SYS`, `$JS`, and `_INBOX` stay discarded unless FILTERS turns that off.

### CORE LISTEN

```
GET /api/connection/:id/subjects/core?filter=orders.>&listen_ms=2000
GET /api/connection/:id/subjects/core?filter=orders.>&watch=1
GET /api/connection/:id/subjects/core?filter=orders.>&watch=1&discard_sys=false
GET /api/connection/:id/subjects/core
DELETE /api/connection/:id/subjects/core
```

Opening the SUBJECTS card does not subscribe. Empty filter is not `>`.

Refresh samples a name you typed. LISTEN / ALL start a live subscribe. Poll reads that snapshot without `watch=1`. Poll will not start or replace one.

The card sends its `session` identifier on start, snapshot, and stop requests so closing an older card cannot stop a newer listener. A listener stops on disconnect, permission failure, overflow, or the name cap. Unused listeners expire after one minute; normal card polling renews that lease.

### OCCUPIED NAMES

```
GET /api/connection/:id/subjects/jetstream/:stream/occupied?filter=orders.>
```

Names that currently have messages in that stream, sorted then capped per stream. Discovery reads only the first server page and reports incomplete results. Refresh reloads previously expanded lists. The card nests them under the pattern or bucket you opened.
