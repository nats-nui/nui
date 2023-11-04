import { send, serverStop } from "./index.js"
import { pingSetEnabled } from "./ping.js"
import { Thread } from "./thread.js"


const commands = {

	// DEBUG
	"ping:stop": _ => pingSetEnabled(false),

	// DEBUG
	"ping:start": _ => pingSetEnabled(true),

	"connection:close": _ => serverStop(),

	"message:send": _ => {
		send({
			topic: "test",
			payload: "p_test"
		})
	},

	"connections:subscribe": payload => {
		const connectionId = payload.cnnId
		const subjects = payload.sbjs
		const thread = new Thread(
			()=>send({
				topic: "test",
				payload: `cnn:${connectionId}`,
			}), 
			{ cnnId: connectionId }
		)
		thread.start()
	},
}

export default commands


