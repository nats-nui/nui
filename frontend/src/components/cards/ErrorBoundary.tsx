import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
	children?: ReactNode;
}

interface State {
	hasError: boolean
	msg?: string
}

class ErrorBoundary extends Component<Props, State> {
	public state: State = {
		hasError: false,
		msg: "",
	};

	public handleClickReload (e) {
		this.setState({ hasError: false })
	}

	public static getDerivedStateFromError(_: Error): State {
		// Aggiorna lo stato in modo che il prossimo render mostri la UI di fallback.
		return { hasError: true };
	}

	public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		this.setState({ msg: error.message })
	}

	public render() {
		if (this.state.hasError) {
			return <h1>ERROR:{this.state.msg}</h1>
		}

		return this.props.children;
	}
}

export default ErrorBoundary;