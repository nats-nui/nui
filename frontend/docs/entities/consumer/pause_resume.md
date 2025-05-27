# Pause and Resume Consumer

Pauses or resumes a consumer for a given stream.

## Request
- **Method:** POST
- **Endpoint:** `/api/connection/{connection_id}/stream/{stream_name}/consumer/{consumer_name}/pause_resume`
- **Body:**
  - `action` (string, required): Either `pause` or `resume`
  - `pause_until` (string, required for `pause`): RFC3339 timestamp until which the consumer will be paused

## Example
```json
{
  "action": "pause",
  "pause_until": "2025-06-01T12:00:00Z"
}
```

```json
{
  "action": "resume"
}
```

## Response
- **200 OK**: Consumer paused or resumed successfully (returns consumer info)
- **422 Unprocessable Entity**: Validation error

