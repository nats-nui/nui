import { MSG_TYPE } from '@/plugins/SocketService/types';
import { Varz, Connz, ConnzConnection } from '../../types/Metrics';


export function generateMetrics() {
	return {
		type: MSG_TYPE.METRICS_RESP,
		payload: {
			nats: {
				varz: generateVarz(),
				connz: generateConnz(),
			}
		}
	}
}

// Generates a Varz object with random/mock values
export function generateVarz(): Varz {
	const now = new Date();
	const start = new Date(now.getTime() - Math.floor(Math.random() * 100000000));
	return {
		server_id: `srv-${Math.random().toString(36).substring(2, 10)}`,
		version: `${Math.floor(Math.random() * 3) + 1}.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 10)}`,
		proto: 1,
		go: `go${Math.floor(Math.random() * 2) + 1}.${Math.floor(Math.random() * 10)}`,
		host: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
		port: 4222,
		max_connections: Math.floor(Math.random() * 1000) + 100,
		ping_interval: 120,
		ping_max: 2,
		http_host: '0.0.0.0',
		http_port: 8222,
		https_port: 0,
		auth_timeout: 1,
		max_control_line: 4096,
		max_payload: 1048576,
		max_pending: 65536,
		cluster: {},
		gateway: {},
		leaf: {
			auth_timeout: 0,
			host: '',
			port: 0,
			tls_required: false,
			tls_timeout: 0,
		},
		tls_timeout: 0,
		write_deadline: 2,
		start: start.toISOString(),
		now: now.toISOString(),
		uptime: `${Math.floor((now.getTime() - start.getTime()) / 1000)}s`,
		mem: Math.floor(Math.random() * 1024 * 1024 * 2),
		cores: Math.floor(Math.random() * 8) + 1,
		gomaxprocs: Math.floor(Math.random() * 8) + 1,
		cpu: Math.random() * 100,
		connections: Math.floor(Math.random() * 100),
		total_connections: Math.floor(Math.random() * 10000),
		routes: Math.floor(Math.random() * 10),
		remotes: Math.floor(Math.random() * 5),
		leafnodes: Math.floor(Math.random() * 5),
		in_msgs: Math.floor(Math.random() * 100000),
		out_msgs: Math.floor(Math.random() * 100000),
		in_bytes: Math.floor(Math.random() * 10000000),
		out_bytes: Math.floor(Math.random() * 10000000),
		nui_in_bytes_sec: null,
		nui_in_msgs_sec: null,
		nui_out_bytes_sec: null,
		nui_out_msgs_sec: null,
		slow_consumers: Math.floor(Math.random() * 10),
		subscriptions: Math.floor(Math.random() * 1000),
		auth_required: false,
		config_digest: '',
		git_commit: '',
		http_base_path: '',
		max_subscriptions: 0,
		server_name: 'mock-server',
		system_account: '',
		jetstream: {
			config: {
				compress_ok: false,
				max_memory: 0,
				max_storage: 0,
				store_dir: '',
				sync_interval: 0,
			},
			limits: {},
			stats: {
				accounts: 0,
				api: { errors: 0, level: 0, total: 0 },
				ha_assets: 0,
				memory: 0,
				reserved_memory: 0,
				reserved_storage: 0,
				storage: 0,
			},
		},
		mqtt: {
			ack_wait: 0,
			host: '',
			max_ack_pending: 0,
			no_auth_user: '',
			port: 0,
			tls_timeout: 0,
		},
		websocket: {
			compression: false,
			handshake_timeout: 0,
			host: '',
			no_auth_user: '',
			port: 0,
		},
		http_req_stats: {
			'/varz': Math.floor(Math.random() * 1000),
			'/connz': Math.floor(Math.random() * 1000),
		},
		config_load_time: new Date(now.getTime() - Math.floor(Math.random() * 10000000)).toISOString(),
		slow_consumer_stats: {
			clients: Math.floor(Math.random() * 10),
			routes: Math.floor(Math.random() * 5),
			gateways: Math.floor(Math.random() * 3),
			leafs: Math.floor(Math.random() * 3),
		},
	};
}

// Generates a Connz object with random/mock connections
export function generateConnz(): Connz {
	const now = new Date();
	const numConnections = Math.floor(Math.random() * 20) + 1; // 1-20 connections
	const connections: ConnzConnection[] = [];

	for (let i = 0; i < numConnections; i++) {
		const startTime = new Date(now.getTime() - Math.floor(Math.random() * 3600000)); // Started within last hour
		const lastActivity = new Date(now.getTime() - Math.floor(Math.random() * 60000)); // Last activity within last minute
		
		const connection: ConnzConnection = {
			cid: i + 1,
			kind: 'Client',
			type: Math.random() > 0.5 ? 'websocket' : 'tcp',
			ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
			port: Math.floor(Math.random() * 65535) + 1024,
			start: startTime.toISOString(),
			last_activity: lastActivity.toISOString(),
			rtt: `${Math.floor(Math.random() * 100)}ms`,
			uptime: `${Math.floor((now.getTime() - startTime.getTime()) / 1000)}s`,
			idle: `${Math.floor((now.getTime() - lastActivity.getTime()) / 1000)}s`,
			pending_bytes: Math.floor(Math.random() * 1024),
			in_msgs: Math.floor(Math.random() * 1000),
			out_msgs: Math.floor(Math.random() * 1000),
			in_bytes: Math.floor(Math.random() * 100000),
			out_bytes: Math.floor(Math.random() * 100000),
			subscriptions: Math.floor(Math.random() * 50),
			nui_in_bytes_sec: null,
			nui_in_msgs_sec: null,
			nui_out_bytes_sec: null,
			nui_out_msgs_sec: null,
		};

		// Randomly add optional fields
		if (Math.random() > 0.5) {
			connection.name = `client-${Math.random().toString(36).substring(2, 8)}`;
		}
		if (Math.random() > 0.5) {
			connection.lang = Math.random() > 0.5 ? 'javascript' : 'go';
		}
		if (Math.random() > 0.5) {
			connection.version = `${Math.floor(Math.random() * 3) + 1}.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 10)}`;
		}
		if (Math.random() > 0.7) {
			connection.mqtt_client = `mqtt-client-${Math.random().toString(36).substring(2, 6)}`;
		}

		connections.push(connection);
	}

	return {
		server_id: `srv-${Math.random().toString(36).substring(2, 10)}`,
		now: now.toISOString(),
		num_connections: numConnections,
		total: numConnections,
		offset: 0,
		limit: 1024,
		connections: connections,
	};
}
