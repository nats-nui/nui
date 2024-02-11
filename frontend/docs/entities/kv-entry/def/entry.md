
## KEY-VALUE ENTRY

```typescript
KevValueEntry {
    key: string; // The key of the entry
    payload: string; // The value of the entry, encoe in base64 (only for show method)
    last_update: string; // The time when the entry was last updated in ISO 8601 format
    operation: OPERATION; // The operation performed on the entry 
    revision: number; // The revision number of the entry
    isDeleted: boolean; // A boolean indicating whether the entry has been deleted
    history: []KevValueEntry; // array of past versions of the entry (only for show method)
}
```

OPERATION is an enum that show the last operation performed on the entry.
```typescript
 OPERATION {
    PUT = "KeyValuePutOp",
    DELETE = "KeyValueDeleteOp",
    PURGE = "KeyValuePurgeOp"
}
```