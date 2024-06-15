import CopyButton from "@/components/buttons/CopyButton"
import { FunctionComponent } from "react"
import cls from "./HeadersCmp.module.css"



interface Props {
	headers?: { [key: string]: string[] }
}

/** dettaglio di un messaggio */
const HeadersCmp: FunctionComponent<Props> = ({
	headers,
}) => {

	// STORE

	// HOOKs

	// HANDLER

	// RENDER
	// const headers: [string, string][] = useMemo(() => {
	// 	if (!msgSa.message.headers) return []
	// 	return Object
	// 		.entries(msgSa.message.headers)
	// 		.reduce<[string, string][]>((acc, [key, values]) => {
	// 			return acc.concat(values.map(v => [key, v]))
	// 		}, [])
	// }, [msgSa.message.headers])
	if ( !headers ) return null

	return <div className={cls.root}>
		{Object.entries(headers).map(([key, values]) => <div className={cls.header}>
			<div className={cls.key}>{key}</div>
			<div>:</div>
			<div className={cls.row}>
				{values.map(value => <div className={`${cls.header} hover-container`}>
					<div className={cls.values}>{value}</div>
					<CopyButton absolute value={value} />
				</div>)}
			</div>
		</div>)}
	</div>
}

export default HeadersCmp


