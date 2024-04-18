import { CSSProperties, FunctionComponent } from "react";



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
			<circle className="ani-color"
				cx="60"
				cy="60"
				r={radius}
				fill="none"
				stroke="currentColor"
				strokeWidth="15"
			/>
			<circle className="color-fg"
				cx="60"
				cy="60"
				r={radius}
				fill="none"
				stroke="currentColor"
				strokeWidth="15"
				strokeDasharray={circonference}
				strokeDashoffset={offset}

				style={{ transition: `stroke-dashoffset ${animTime}ms` }}
				transform="rotate(-90 60 60)"
			/>
		</svg>
	);
};

export default CircularIndicatorCmp;