import layoutSo, { COLOR_VAR } from "@/stores/layout";
import { ANIM_TIME_CSS } from "@/types";
import { CSSProperties, FunctionComponent } from "react";


interface Props {
	perc: number
	animTime?: number
	bgColor?:string
	fgColor?:string

	style?:CSSProperties
}

const CircularIndicatorCmp: FunctionComponent<Props> = ({ 
	perc,
	animTime = 300,
	bgColor = "rgba(0,0,0,.4)",
	fgColor = layoutSo.state.theme.palette.var[COLOR_VAR.YELLOW].bg,

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
				stroke={bgColor}
				strokeWidth="15"
				style={{ transition: `stroke ${ANIM_TIME_CSS}ms` }}
			/>
			<circle
				cx="60"
				cy="60"
				r={radius}
				fill="none"
				stroke={fgColor}
				strokeWidth="15"
				strokeDasharray={circonference}
				strokeDashoffset={offset}
				transform="rotate(-90 60 60)"
				style={{ transition: `stroke-dashoffset ${animTime}ms` }}
			/>
		</svg>
	);
};

export default CircularIndicatorCmp;