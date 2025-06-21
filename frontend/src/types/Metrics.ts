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
	max_connections: number; // CONNECTIONS / MAX.CONNECTIONS
	ping_interval: number;
	ping_max: number;
	http_host: string;
	http_port: number;
	https_port: number;
	auth_timeout: number; // CONNECTIONS / WRITE DEADLINE
	max_control_line: number;
	max_payload: number; // CONNECTIONS / MAX.PAYLOAD
	max_pending: number; // CONNECTIONS / MAX.PENDING
	cluster: Record<string, unknown>;
	gateway: Record<string, unknown>;
	leaf: Record<string, unknown>;
	tls_timeout: number; // CONNECTIONS / TLS TIMEOUT
	write_deadline: number; // CONNECTIONS / WRITE DEADLINE
	start: string;
	now: string;
	uptime: string;
	mem: number;	// MEMORY
	cores: number;
	gomaxprocs: number;
	cpu: number; 	// CPU
	connections: number; // CONNECTIONS / TOTAL CONNECTIONS
	total_connections: number;
	routes: number;
	remotes: number;
	leafnodes: number;
	in_msgs: number;  // RECEIVE MESSAGE
	out_msgs: number; // SEND MESSAGE
	in_bytes: number;  // RECEIVE DATA
	out_bytes: number; // SEND DATA
	slow_consumers: number;  // CONNECTIONS / SLOW
	subscriptions: number; // CONNECTIONS / SUBSCRIPTION
	http_req_stats: Record<string, number>;
	config_load_time: string;
	slow_consumer_stats: {
		clients: number;
		routes: number;
		gateways: number;
		leafs: number;
	};
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
