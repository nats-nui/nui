import { AUTH_MODE, Connection } from "@/types";



const connections: any[] = [
	{
		id: "cnn-1",
		name: "conn 1 spacespacespacespacespacespacespace",
		hosts: ["localhost:3000"],
		subscriptions: [
			{ "subject": "camelCase" },
			{ "subject": "snake_case" },
			{ "subject": "kebab-case" },
		],
		auth: [
			{ mode: AUTH_MODE.CREDS_FILE, creds: "myfle.cred" }
		],
		tls_auth: {
			enabled: true,
			cert_path: "./certs/cert.pem",
			key_path: "./certs/key.pem",
			ca_path: "./certs/ca.pem",
		},
		inboxPrefix: "_INBOX",
		metrics: {
			httpSource: {
				active: false,
				url: "http://localhost:3000/metrics"
			},
			natsSource: {
				active: true,
				auth: {
					mode: AUTH_MODE.TOKEN,
					token: "mytoken",
				},
			},
		},
	},
	{
		id: "cnn-2",
		name: "conn 2",
		hosts: ["localhost:3000"],
		subscriptions: [
			{ "subject": "paperoga" },
			{ "subject": "paperone" },
		],
		auth: [
			{ mode: AUTH_MODE.CREDS_FILE, creds: "myfle.cred" }
		],
		inboxPrefix: "_INBOX.custom"
	},
	{
		id: "cnn-3",
		name: "conn 3",
		hosts: ["localhost:3000"],
		subscriptions: [
			{ "subject": "pippo" },
			{ "subject": "clarabella" },
		],
		auth: [
			{ mode: AUTH_MODE.CREDS_FILE, creds: "myfle.cred" }
		],
	},
	{
		id: "cnn-4",
		name: "conn 4",
		hosts: ["localhost:3000"],
		subscriptions: [
			{ "subject": "pippo" },
			{ "subject": "pluto" },
			{ "subject": "paperino" },
			{ "subject": "paperoga" },
			{ "subject": "paperone" },
		],
		auth: [
			{ mode: AUTH_MODE.CREDS_FILE, creds: "myfle.cred" }
		],
	},
	{
		id: "27026b6d-40f6-4fa3-bf80-9b30c9313ebd",
		name: "demo",
		hosts: ["demo.nats.io"],
	},
]

export default connections