import cls from "./ListRow.module.css"



interface Props<T> {
	children?: React.ReactNode
	style?: React.CSSProperties
	readOnly?: boolean
	isSelect?: boolean
	onClick?: (e: React.MouseEvent<HTMLElement>) => void
}

/** un WRAP della riga che gestisce la selezione */
function ListRow<T>({
	children,
	style,
	isSelect,
	readOnly = false,
	onClick
}: Props<T>) {

	// STORES

	// HOOKS

	// HANDLERS

	// RENDER
	const clsRoot = `${cls.root} ${!readOnly ? "cliccable" : ""} ${isSelect ? cls.select : ""}`

	return <div
		className={clsRoot}
		style={style}
		onClick={!readOnly ? onClick : null}
	>
		{children}
	</div>
}

export default ListRow
