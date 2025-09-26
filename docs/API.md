# API Documentation

## GitHub Integration

### Get Application Information
Get information about the current application including GitHub repository and webhook status.

**Endpoint:** `GET /api/about`

**Response:**
```json
{
  "current_version": "v1.0.0",
  "latest_version": "v1.1.0",
  "should_update": false,
  "github_repo": {
    "repository": "nats-nui/nui",
    "has_webhooks": true,
    "webhook_url": "https://api.github.com/repos/nats-nui/nui/hooks"
  }
}
```

### List GitHub-Connected Applications
List all applications that are connected to GitHub repositories.

**Endpoint:** `GET /api/github-apps`

**Response:**
```json
{
  "apps": [
    {
      "name": "NATS NUI",
      "repository": "nats-nui/nui",
      "has_webhooks": true,
      "webhook_url": "https://api.github.com/repos/nats-nui/nui/hooks"
    }
  ],
  "total": 1
}
```

## GitHub Webhook Detection

The application automatically detects GitHub webhook configurations using the following heuristics:

1. **Repository Accessibility**: Checks if the GitHub repository is accessible via GitHub API
2. **Activity Detection**: Looks for recent activity and ensures the repository is not archived
3. **Known Repositories**: Has built-in knowledge for specific repositories like `nats-nui/nui`

**Note**: Full webhook detection requires GitHub API authentication. Without authentication, the system uses heuristics to estimate webhook presence.