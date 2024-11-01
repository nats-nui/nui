
const cnnImports = {
	"connections": [
		{
			"id": "85caf1ba-5735-4b53-b01a-85996e5db354",
			"name": "demo",
			"hosts": [
				"nats://demo.nats.io:4222"
			],
			"inbox_prefix": "",
			"subscriptions": [],
			"auth": null,
			"tls_auth": {
				"enabled": false,
				"cert_path": "",
				"key_path": "",
				"ca_path": ""
			},
			"metadata": {
				"import-datetime": "2024-10-26T19:50:31+02:00",
				"import-path": "/home/mat/.config/nats/context/demo.json",
				"import-type": "nats-cli"
			}
		}
	],
	"imports": [
		{
			"name": "test",
			"path": "/home/mat/.config/nats/context/test.json",
			"error": null
		},
		{
			"name": "test2",
			"path": "/home/mat/.config/nats/context/test.json",
			"error": null
		},
		{
			"name": "test3",
			"path": "/home/mat/.config/nats/context/test.json",
			"error": null
		},
		{
			"name": "demo",
			"path": "/home/mat/.config/nats/context/demo.json",
			"imported_context": {
				"description": "",
				"url": "nats://demo.nats.io:4222",
				"socks_proxy": "",
				"token": "",
				"user": "",
				"password": "",
				"creds": "",
				"nkey": "",
				"cert": "",
				"key": "",
				"ca": "",
				"nsc": "",
				"jetstream_domain": "",
				"jetstream_api_prefix": "",
				"jetstream_event_prefix": "",
				"inbox_prefix": "",
				"user_jwt": "",
				"color_scheme": "",
				"tls_first": false
			},
			"error": null
		}
	]
}


export default cnnImports