// NATS Monitoring types for /varz and /connz endpoints


export interface Metrics {
	varz: Varz
	connz: Connz;
}


export interface Varz {
	server_id: string;
	version: string;
	proto: number;
	go: string;
	host: string;
	port: number;
	
	ping_interval: number;
	ping_max: number;
	http_host: string;
	http_port: number;
	https_port: number;
	
	max_control_line: number;
	cluster: Record<string, unknown>;
	gateway: Record<string, unknown>;
	leaf: Record<string, unknown>;
	start: string;
	now: string;
	uptime: string;
	cores: number;
	gomaxprocs: number;
	connections: number;
	routes: number;
	remotes: number;
	leafnodes: number;
	http_req_stats: Record<string, number>;
	config_load_time: string;
	slow_consumer_stats: {
		clients: number;
		routes: number;
		gateways: number;
		leafs: number;
	};

	cpu: number; 	// CPU
	mem: number;	// MEMORY

	in_msgs: number;  // RECEIVE MESSAGE
	out_msgs: number; // SEND MESSAGE
	in_bytes: number;  // RECEIVE DATA
	out_bytes: number; // SEND DATA
	nui_in_bytes_sec: number, // RATE RECEIVE DATA
	nui_in_msgs_sec: number, // RATE RECEIVE MESSAGE
	nui_out_bytes_sec: number, // RATE SEND DATA
	nui_out_msgs_sec: number, // RATE SEND MESSAGE

	total_connections: number; // CONNECTIONS / TOTAL CONN.
	subscriptions: number; // CONNECTIONS / SUBSCRIPTION
	slow_consumers: number;  // CONNECTIONS / SLOW CONSUMER

	max_connections: number; // CONNECTIONS / MAX.CONNECTIONS
	max_payload: number; // CONNECTIONS / MAX.PAYLOAD
	max_pending: number; // CONNECTIONS / MAX.PENDING

	write_deadline: number; // CONNECTIONS / WRITE DEADLINE
	auth_timeout: number; // CONNECTIONS / AUTH.TIMEOUT
	tls_timeout: number; // CONNECTIONS / TLS TIMEOUT



}

export interface ConnzConnection {
	cid: number;
	kind: string;
	type: string;
	ip: string;
	port: number;
	start: string;
	last_activity: string;
	rtt: string;
	uptime: string;
	idle: string;
	pending_bytes: number;
	in_msgs: number;
	out_msgs: number;
	in_bytes: number;
	out_bytes: number;
	subscriptions: number;
	name?: string;
	lang?: string;
	version?: string;
	mqtt_client?: string;

	nui_in_bytes_sec: number;
	nui_in_msgs_sec: number;
	nui_out_bytes_sec: number;
	nui_out_msgs_sec: number;
}

export interface Connz {
	server_id: string;
	now: string;
	num_connections: number;
	total: number;
	offset: number;
	limit: number;
	connections: ConnzConnection[];
}
