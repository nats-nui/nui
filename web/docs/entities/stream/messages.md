

Restituisce una COLLECTION di STREAMS-MESSAGES


### URL
```
GET /api/connection/:connection_id/stream/:stream_name/messages
```
- `connection_id`  
identificativo CONNECTION che contiene lo STREAM
- `stream_name`  
nome dello STREAM che contiene gli STREAM-MESSAGEs

DA CAPIRE DOVE METTERE QUESTI
potrebbero andare nella quesry tring penso sia il posto giusto ma non so per quell'array di subjects se ti va bene

start seq number  ( intero nullable)
interval (intero che serve a paginare in pratica)
subjects (array di stringhe, filtro per subject

### BODY


### RESPONSE
```
stream_message[]
```
[STREAM-INFO](./def/stream-message.md)