import { CSSProperties, FunctionComponent } from "react";
import layoutSo, { COLOR_VAR } from "@/stores/layout"


interface Props {
	perc: number
	animTime?: number

	style?:CSSProperties
}

const CircularIndicatorCmp: FunctionComponent<Props> = ({ 
	perc,
	animTime = 300,
	style,
}) => {
	perc = perc < 0 ? 0 : perc > 1 ? 1 : perc
	const radius = 50; // Raggio del cerchio
	const circonference = 2 * Math.PI * radius; // Calcolo della circonferenza
	const offset = (1 - perc) * circonference; // Calcolo dell'offset basato sulla percentuale

	return (
		<svg width="120" height="120" viewBox="0 0 120 120" style={style}>
			<circle
				cx="60"
				cy="60"
				r={radius}
				fill="none"
				stroke="#00000070"
				strokeWidth="15"
			/>
			<circle
				cx="60"
				cy="60"
				r={radius}
				fill="none"
				stroke={layoutSo.state.theme.palette.var[COLOR_VAR.YELLOW].bg}
				strokeWidth="20"
				strokeDasharray={circonference}
				strokeDashoffset={offset}
				transform="rotate(-90 60 60)"
				style={{ transition: `stroke-dashoffset ${animTime}ms` }}
			/>
			{/* <text
				x="60"
				y="60"
				fill="#007bff"
				fontSize="20"
				textAnchor="middle"
				dy="8" // Ajustment to center the text vertically
			>
				{percentuale}%
			</text> */}
		</svg>
	);
};

export default CircularIndicatorCmp;