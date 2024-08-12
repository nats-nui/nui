import { AUTH_MODE, Connection } from "@/types";



const connections:Connection[] = [
	{
		id: "cnn-1",
		name: "conn 1",
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
		}
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
]

export default connections