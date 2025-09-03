import { SocketOptions } from "./types";


const wsOptionBuilder = () => {
	return (import.meta.env.VITE_TARGET == "desktop") ? {
		protocol: "ws:",
		host: "localhost",
		port: 31311,
		base: "",
	} : {
		protocol: window.location.protocol == "http:" ? "ws:" : "wss:",
		host: window.location.hostname,
		port: import.meta.env.VITE_API_WS_PORT ?? window.location.port,
		base: window.location.pathname.endsWith('/') ? window.location.pathname.slice(0, -1) : window.location.pathname,
	};
};

export const optionsDefault: SocketOptions = wsOptionBuilder();
