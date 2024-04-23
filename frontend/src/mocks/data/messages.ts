import { Subscription } from "@/types";


const subscriptions: Subscription[] = [
	{
		subject: "goofy",
	},
	{
		subject: "fido",
	},
	{
		subject: "daffy.>",
	},
]

const conn_messages = [{ subscriptions }]

export default conn_messages