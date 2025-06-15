import { FunctionComponent } from "react"
import styles from "./ValueCmp.module.css"

interface Props {
	label: string
	value: string | number
	unit?: string
	style?: React.CSSProperties
	className?: string
}

const ValueCmp: FunctionComponent<Props> = ({
	label,
	value,
	unit,
	style,
	className
}) => {
	return (
		<div style={style} className={`${styles.container} ${className || ''}`}>
			<div className={styles.label}>{label}</div>
			<div className={styles.value}>
				{value}
				{unit && <span className={styles.unit}>{unit}</span>}
			</div>
		</div>
	)
}

export default ValueCmp
