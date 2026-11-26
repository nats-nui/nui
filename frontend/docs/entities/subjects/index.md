## Browse subjects

Open **Subjects** on a connection. A subject is a message’s destination, such as
`orders.created`.

### Watch live messages

Enter `orders.created` for one subject or `orders.>` for subjects under
`orders`. Select **Sample (2 s)** to see which carried traffic during that
window. To sample all subjects, enter `>` if your account permits it.

**Watch live messages** opens or resumes the connection’s Messages card. Only
the selected subject or pattern is active. Previous messages and the search
stay in place. Other favorites stay saved and paused.

### Read stored messages

The tree shows which subjects each JetStream stream is configured to store.
Expand a pattern to find subjects with stored messages. Select a subject and
choose **Read from JetStream** for the stream you want.

A new Stream Messages card opens with the latest matches. For the last one,
open **Filters** and set **Message count** to `1`. To read forward from a stream
sequence number or a local time, choose **Start sequence** or **Start time** and
use a positive count. NUI reads the messages with the JetStream Get Message API.

If a stream changes subject names, **Browse stored subjects** shows the names
used for storage.

### Find a subject

**Find in results** searches the subjects and streams already listed. Narrowing
the search reveals matching subjects inside their folders. **Refresh** reloads
JetStream subjects.

To trace a reply, open **Filters**, turn on **Include internal subjects**, then
sample `_INBOX.>` while sending the request. This setting also shows NATS system
messages (`$SYS`) and JetStream traffic (`$JS`).

A live sample opens a Core NATS subscription. If it matches a request with no
responder, the caller may wait until its request times out.

### API

```
GET /api/connection/:id/subjects/core?filter=orders.>&listen_ms=2000
GET /api/connection/:id/subjects/jetstream
GET /api/connection/:id/subjects/jetstream/:stream/occupied?filter=orders.>
```

The Core response counts messages per subject. The JetStream catalog lists
configured patterns and groups Key-Value and Object Store subjects by bucket.
Streams without configured subjects contribute no rows. The stored subject
list uses the first server response page. A capped or partial list sets
`truncated`. Omit its filter to list stored names across a transformed stream.
Set `discard_sys=false` to include internal subjects.
