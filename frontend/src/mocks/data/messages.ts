import { Subscription } from "@/types";


const subscriptions: Subscription[] = [
	{
		subject: "pippo",
	},
	{
		subject: "pluto",
	},
	{
		subject: "paperino",
	},
]

const conn_messages = [{ subscriptions }]

export default conn_messages