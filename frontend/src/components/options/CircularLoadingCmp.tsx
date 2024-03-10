import { CSSProperties, FunctionComponent } from "react";
import layoutSo, { COLOR_VAR } from "@/stores/layout"
import { ANIM_TIME_CSS } from "@/types";


interface Props {
	style?:CSSProperties
	bgColor?:string
	fgColor?:string
}

const CircularLoadingCmp: FunctionComponent<Props> = ({ 
	style,
	bgColor = "rgba(0,0,0,.4)",
	fgColor = layoutSo.state.theme.palette.var[COLOR_VAR.YELLOW].bg,

}) => {
	const radius = 50; // Raggio del cerchio
	const circonference = 2 * Math.PI * radius; // Calcolo della circonferenza
	const offset = (1 - .15) * circonference; // Calcolo dell'offset basato sulla percentuale

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
				className="rotation-loop"
			/>
		</svg>
	);
};

export default CircularLoadingCmp;