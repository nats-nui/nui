const EditorIcon = (props) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="24" height="24" viewBox="0 0 24 24"
		stroke="currentColor"
		fill="none"
		strokeWidth="2"
		{...props}
	>
		<path d="M5 12L20 12" strokeWidth="2" strokeLinecap="round" />
		<path d="M12 5L12 19" strokeWidth="2" strokeLinecap="round" />
		<path d="M7 7L17 17" strokeWidth="2" strokeLinecap="round" />
		<path d="M17 7L7 17" strokeWidth="2" strokeLinecap="round" />
	</svg>
)

export default EditorIcon