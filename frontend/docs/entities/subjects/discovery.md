# SUBJECTS discovery

A subject is a name a message travels on, like `orders.created`.

This card answers one question: **what names exist right now?** Same idea as MQTT Explorer — a topic tree for discovery. MESSAGES stays the firehose. Core vs JetStream is the only split.

## What you see

The first paint is a **family list** — the first token of each name (`orders`, `$KV`). Folders start closed.

Open a family and you get **one more level**. A normal name stays one child (`orders` → `created`). Anything deeper is one stacked row.

Open a name with a ▸ (a JetStream pattern, KV bucket, or object store). Stored names load **under that row**. Click a stored name to see the last message JetStream kept. Core has no last message — `live` means we heard it during a listen.

FIND and reload sit in the header, same as STREAMS. CORE / JETSTREAM are view filters in the card. System names stay discarded. FIND searches the names themselves, so a match past the browse cap still appears. Opening the card lists stored JetStream names only. Reload samples a name you typed. LISTEN / ALL start a live subscribe. Poll reads that snapshot; it will not start one. Hover a row to copy the full name.

`ALL` / `>` is how you look around. Type `orders.>` to narrow. An empty box is not `>`. Busy lists are capped.

## API

See [index.md](./index.md) and [last.md](./last.md).
