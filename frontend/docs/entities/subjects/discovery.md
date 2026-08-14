# SUBJECTS discovery

A subject is a name a message travels on, like `orders.created`.

This card answers one question: **what names exist right now?** It is not MESSAGES and it is not STREAMS. Core vs JetStream is the only split.

## What you see

The first paint is a **family list** — the first token of each name (`orders`, `ghost`, `$KV`). Folders start closed. That is the stream-shaped view. Notification leaves (heartbeats, keys, NMEA sentences) stay behind a door until you open one.

Open a family and you get **one more level**. A normal name stays one child (`orders` → `created`). Anything deeper is a **partial stack** on one row (`hb.cc.getbygenius.digimasons-2`), never a hallway of folders.

Open a name with a ▸ (a JetStream pattern, KV bucket, or object store). Stored names load **under that row**, still stacked if they are deep. Click a stored name to see the last message JetStream kept. Core has no last message — `live` means we heard it during a listen.

FIND (same header control as STREAMS) opens matching families so the leaf is visible. Reload and poll sample again. Open folders stay open. Names use the same monospace 12px as the STREAMS table.

## Core vs JetStream

| | Core | JetStream |
|---|---|---|
| How we know | Listen for a few seconds | Read stream capture names |
| Memory | Forgets anything before the listen | Keeps what the stream is set to keep |
| Empty | Quiet, not broken | No capture names, or none stored yet |

`ALL` / `>` is how you look around. Type `orders.>` to narrow. Busy lists are capped.

## What this card will not do

- It will not open the whole tree for you.
- It will not treat a catch-all as a mistake.
- It will not show payloads in the catalog. Last message is a separate click.
- It will not invent MQTT, KV, or Object as a third mode. Those are JetStream stores with a small chip.

## API

See [index.md](./index.md) and [last.md](./last.md).
