import { CSSProperties, FunctionComponent } from "react";


interface Props {
	style?:CSSProperties
}

const CircularIcon: FunctionComponent<Props> = ({ 
	style,
}) => {
	const radius = 50

	return (
		<svg width="120" height="120" viewBox="0 0 120 120" style={style}>
			<circle
				cx="60"
				cy="60"
				r={radius}
				fill="none"
				stroke="currentColor"
				strokeWidth="15"
			/>
		</svg>
	);
};

export default CircularIcon;