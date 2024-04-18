import { CSSProperties, FunctionComponent } from "react";



interface Props {
	style?:CSSProperties
}

const CircularLoadingCmp: FunctionComponent<Props> = ({ 
	style,
}) => {
	const radius = 50; // Raggio del cerchio
	const circonference = 2 * Math.PI * radius; // Calcolo della circonferenza
	const offset = (1 - .15) * circonference; // Calcolo dell'offset basato sulla percentuale

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
			<circle className="ani-rot-loop color-fg"
				cx="60"
				cy="60"
				r={radius}
				fill="none"
				stroke="currentColor"
				strokeWidth="15"
				strokeDasharray={circonference}
				strokeDashoffset={offset}
			/>
		</svg>
	);
};

export default CircularLoadingCmp;