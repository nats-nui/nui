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

	// Authentication and configuration
	auth_required: boolean;
	config_digest: string;
	git_commit: string;
	http_base_path: string;
	max_subscriptions: number;
	server_name: string;
	system_account: string;

	cpu: number; 	// CPU
	mem: number;	// MEMORY

	in_msgs: number;  // RECEIVE MESSAGE
	out_msgs: number; // SEND MESSAGE
	in_bytes: number;  // RECEIVE DATA
	out_bytes: number; // SEND DATA
	nui_in_bytes_sec: number | null, // RATE RECEIVE DATA
	nui_in_msgs_sec: number | null, // RATE RECEIVE MESSAGE
	nui_out_bytes_sec: number | null, // RATE SEND DATA
	nui_out_msgs_sec: number | null, // RATE SEND MESSAGE

	total_connections: number; // CONNECTIONS / TOTAL CONN.
	subscriptions: number; // CONNECTIONS / SUBSCRIPTION
	slow_consumers: number;  // CONNECTIONS / SLOW CONSUMER

	max_connections: number; // CONNECTIONS / MAX.CONNECTIONS
	max_payload: number; // CONNECTIONS / MAX.PAYLOAD
	max_pending: number; // CONNECTIONS / MAX.PENDING

	write_deadline: number; // CONNECTIONS / WRITE DEADLINE
	auth_timeout: number; // CONNECTIONS / AUTH.TIMEOUT
	tls_timeout: number; // CONNECTIONS / TLS TIMEOUT

	slow_consumer_stats: {
		clients: number;
		routes: number;
		gateways: number;
		leafs: number;
	};

	leaf: { // LEAF NODE
		auth_timeout: number
		host: string
		port: number
		tls_required: boolean
		tls_timeout: number
	},

	// JetStream configuration and stats
	jetstream: {
		config: {
			compress_ok: boolean;
			max_memory: number;
			max_storage: number;
			store_dir: string;
			sync_interval: number;
		};
		limits: Record<string, unknown>;
		stats: {
			accounts: number;
			api: {
				errors: number;
				level: number;
				total: number;
			};
			ha_assets: number;
			memory: number;
			reserved_memory: number;
			reserved_storage: number;
			storage: number;
		};
	};

	// MQTT configuration
	mqtt: {
		ack_wait: number;
		host: string;
		max_ack_pending: number;
		no_auth_user: string;
		port: number;
		tls_timeout: number;
	};

	// WebSocket configuration
	websocket: {
		compression: boolean;
		handshake_timeout: number;
		host: string;
		no_auth_user: string;
		port: number;
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

	nui_in_bytes_sec: number | null;
	nui_in_msgs_sec: number | null;
	nui_out_bytes_sec: number | null;
	nui_out_msgs_sec: number | null;
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
