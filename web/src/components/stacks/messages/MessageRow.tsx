import { HistoryMessage } from "@/stores/stacks/messages/utils"
import { FunctionComponent, useEffect, useRef, useState } from "react"

const debounceTime = 100

interface Props {
	message?: HistoryMessage

}

const MessageRow: FunctionComponent<Props> = ({
	message,
}) => {

	// STORE

	// HOOKs
	const ref = useRef<HTMLDivElement>(null)
	//const height = useRef(null)

	const [isVisible, setIsVisible] = useState(false);
	const [height, setHeight] = useState<number>(null);
	useEffect(() => {
		let debounceTimeout: any;
		const observerCallback = ([entry]) => {
			clearTimeout(debounceTimeout);
			debounceTimeout = setTimeout(() => {
				setIsVisible(entry.isIntersecting);
			}, debounceTime);
		};
		const observer = new IntersectionObserver(observerCallback, { rootMargin: "100px", })
		observer.observe(ref.current);
		return () => {
			setIsVisible(false);
			observer.disconnect();
			clearTimeout(debounceTimeout);
		};
	}, [ref])
	useEffect(() => {
		if (!isVisible) return
		setHeight((ref.current.firstChild as HTMLElement).offsetHeight)
	}, [isVisible])

	// HANDLER

	// RENDER
	const cssRoot = {
		height: height ? `${height}px` : "50px",
		backgroundColor: "red",
		marginBottom: "5px",
	}
	return (
		<div ref={ref} style={cssRoot}>
			{isVisible && (
				<div style={{}}>
					<div>{message.title}</div>
					<div style={{ overflowWrap: "break-word" }}>
						{message.body}
					</div>
				</div>
			)}
		</div>
	)
}

export default MessageRow
