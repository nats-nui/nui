import { FunctionComponent } from "react"
import styles from "./ValueCmp.module.css"



interface Props {
	label: string
	value: string | number
	unit?: string
	decimals?: number
	style?: React.CSSProperties
	className?: string
}

const ValueCmp: FunctionComponent<Props> = ({
	label,
	value,
	unit,
	decimals,
	style,
	className
}) => {

	if ( value == null ) value = "--"
	
	if (decimals !== undefined && typeof value === 'number') {
		value = value.toFixed(decimals)
	}

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
