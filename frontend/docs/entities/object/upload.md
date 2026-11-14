## UPLOAD
store the bytes of an object. Creates the object or replaces its contents


### URL
```
POST /api/connection/:connection_id/obj/:bucket/object/:object/content
```
- `connection_id`  
uuid of the connection to get the object store from

- `bucket`
name of the object store

- `object`
name of the object to write. A single path segment.
The name is taken from this path parameter


### BODY
`multipart/form-data` with one file field:

```
payload    // file bytes. The filename is ignored
```

The object name, description, and metadata are not read from the form.
Use [UPDATE](./update.md) to change metadata after the upload.
A later upload to the same name replaces the bytes and updates `size`.


### RESPONSE
200


### ERRORS
404 if the object store does not exist

422 if the `payload` file field is missing

[RESPONSE-ERROR](../errors/def/error.md)
