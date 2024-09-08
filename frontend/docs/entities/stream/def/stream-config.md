
## STREAM-CONFIG

This is the STREAM creation data
Some of them, but not all, can be modified in edit
If one of these data is omitted it assumes a default value

```typescript
StreamConfig {
	
	// --- main 
	// identificativo dello stream
	name: string 				// not editable
	// testo descrittivo dello STREAM
	description: string			// omitted if empty
	// i SUBJECTs disponibili nello stream
	subjects: string[]			// omitted if empty

	// --- 
	retention: RETENTION 		// not editable
	max_consumers: number 		// omitted if zero, not editable
	max_msgs: number 			// omitted if zero
	max_bytes: number			// omitted if zero
	discard: DISCARD 			// "old" or "new"
	max_age?: number			// omitted if zero
	max_msgs_per_subject: number, // omitted if zero
  	max_msg_size: number, 		// omitted if zero
	storage?: STORAGE			// not editable
	num_replicas: number, 		// omitted if zero
	no_ack: boolean, 			// omitted if false
	template_owner: string, 	// omitted if empty
	duplicate_window: number, 	// omitted if zero
	placement: Placement		// omitted if null
	mirror: Mirror 				// omitted if null, not editable
	sources: Source[]			// omitted if empty
	sealed: boolean				// omitted if false, read only
	deny_delete: boolean, 		// omitted if false, not editable
	deny_purge: boolean, 		// omitted if false, not editable
	allow_rollup_hdrs: boolean 	// omitted if false
	republish: Republish 		// omitted if null
	allow_direct: boolean 		// omitted if false
	mirror_direct: boolean 		// omitted if false
    metadata? {[key: string] : string} // hash of string -> string to add custom metadata to consumer
    compression: string 			// string, omitted if null
    firstSeq: number 			// integer, omitted if zero
    subjectTransform?: SubjectTransform // object, omitted if null
    consumerLimits: ConsumerLimit // object, omitted if null
}
```

## REPUBLISH

```typescript
Republish {
	src: string, 				// omitted if empty
	dest: string, 				// omitted if empty
	headersOnly: false 			// omitted if false
}
```

## MIRROR

```typescript
Mirror {
	/** is taken from stream names */
	name: string				// omitted if empty
	optStartSeq: number			// omitted if zero
    optStartTime: string        // omitted if empty
	filterSubject: string		// omitted if empty
	subjectTransforms: SubjectTransform[] // object, omitted if null
    external: {					// omitted if null
        api: string
        deliver: string
    }
	domain: string 				// omitted if empty
}
```

## PLACEMENT

```typescript
Placement {
	cluster: string				// omitted if empty
	tags: string[]				// omitted if empty
}
```

## SOURCE

```typescript
Source {
	/** is taken from stream names */
	name: string				// omitted if empty
	optStartSeq: number			// omitted if zero
	optStartTime: string		// omitted if empty
	filterSubject: string		// omitted if empty
    subjectTransforms: SubjectTransform[] // object, omitted if null
	external: {					// omitted if null
		api: string
		deliver: string
	}
	domain: string 				// omitted if empty
}
```
```typescript
SubjectTransform {
    src: string
    dest: string
}
```
```typescript
ConsumerLimit {
    inactiveThreshold: string   // time string, omitted if zero
    maxAckPending: number 		// integer, omitted if zero
}
```

## STORAGE

```typescript
STORAGE {
	FILE = "file",
	MEMORY = "memory",
}
```

## RETENTION

```typescript
RETENTION {
	LIMIT = "limits",
	INTEREST = "interest",
	WORKQUEQUE = "workqueque",
}
```

## DISCARD

```typescript
DISCARD {
	OLD = "old",
	NEW = "new",
}
```
