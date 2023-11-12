import { HistoryMessage } from "@/stores/stacks/messages"
import { FunctionComponent, useCallback,  useEffect, useRef, useState } from "react"



interface Props {
	message?: HistoryMessage
}

const MessageRow2: FunctionComponent<Props> = ({
	message,
}) => {

	// STORE

	// HOOKs
	const ref = useRef<HTMLDivElement>(null)
	
	useEffect(()=>{
		if ( !ref.current || message.height || !ref.current.offsetHeight) return
		message.height = ref.current.offsetHeight
		setTimeout(()=>{
			//console.log(ref.current.offsetHeight)
			if (!ref.current) return
			message.height = ref.current.offsetHeight
		}, 100)
	},[message])
	
	// HANDLER

	// RENDER
	const cssRoot = {
		//height: "50px",
		backgroundColor: "red",
		//marginBottom: "5px",
	}
	return (
		<div ref={ref} style={cssRoot}>
			<div>{message.title}</div>
			<div>{message.height}</div>
			<div 
				style={{ overflowWrap: "break-word", marginBottom: "100px" }}
			>
				{message.body}
			</div>
		</div>
	)
}

export default MessageRow2
