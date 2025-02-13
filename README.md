<p align="center">
  <img width=200px src=https://github.com/nats-nui/nui/assets/22039194/626b87c8-66ba-433c-8785-dc934b61cbe2" alt="NATS WebUI Logo"/> 
</p>

# NUI
---
#### Free and Open Source NATS management GUI.
Easily manage your NATS core, streams and buckets, both from Desktop App or Web interface!

<p align="center">
  <img width=650px src="https://github.com/nats-nui/nui/assets/22039194/9a0221e4-b63c-4964-ad89-1fd6d9d54424" alt="NATS WebUI Logo"/> 
</p>



### Features :factory:

- Core NATS Pub/Sub: view and send NATS messages
- Request / reply: send requests and easily view related response
- Multiple format visualization (text, json, hex and much more supported)
- Streams management: view, create adn tweak stream configs
- Stream messages: view, filter and operate with stream messages
- Stream operations like purge and message deletion
- KV Store management: View and create KV buckets
- KV entries: view, filter and edit entries
- KV entries history: acces each entry history to see past updates / deletes
---
### UI :computer:

- Multiple parallel connection allowed at the same time
- Card stack UI to manage the workspace as needed

---
### Coming soon...or later 😸

- Streams backup / restore
- Advanced stream and KV Stores operations
- Server info and metrics

---
# Get Started 🚀
- Try the [Live Demo](https://natsnui.app/demo/).
- [Download](https://natsnui.app/downloads/) Desktop app or deploy with [Docker](https://natsnui.app/downloads/#deploying-with-docker) or [Helm](https://github.com/nats-nui/k8s) (Experimental).

#### macOS Desktop App Installation tweak
- Right-click the PKG and select **Open** (to bypass macOS quarantine, [see Apple documentation](https://support.apple.com/guide/mac-help/open-a-mac-app-from-an-unknown-developer-mh40616/mac)).
- If the app installs to`/Users/runner/work/nui/nui/build/bin/nui-app.app`, move it to your **Applications** folder.
---

# Build and run Locally
The projects uses Go and Wails.io as to run the BE and React on Vite on FE.

### Prerequisites
- Go 1.21
- Node 18
- Wails.io

To build and run the project locally:

#### web app
```
npm install
make dev-web
```
starts the application in web mode, using the `db` dir as persistent data directory

#### desktop app
```
make dev
```
starts wails in development mode, building the application based on the underlying operating system
