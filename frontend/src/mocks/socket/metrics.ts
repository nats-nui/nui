import { MSG_TYPE } from '@/plugins/SocketService/types';
import { Varz } from '../../types/Metrics';


export function generateMetrics() {
	return {
		type: MSG_TYPE.METRICS_RESP,
		payload: {
			nats: {
				varz: generateVarz(),
				//connz: generateConnz(),
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
		leaf: {},
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
		slow_consumers: Math.floor(Math.random() * 10),
		subscriptions: Math.floor(Math.random() * 1000),
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
