export namespace mapping {
	
	export class StreamApi {
	    streamInfo?: nats.StreamInfo;
	    streamConfig?: nats.StreamConfig;
	    consumer?: nats.ConsumerInfo;
	
	    static createFrom(source: any = {}) {
	        return new StreamApi(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.streamInfo = this.convertValues(source["streamInfo"], nats.StreamInfo);
	        this.streamConfig = this.convertValues(source["streamConfig"], nats.StreamConfig);
	        this.consumer = this.convertValues(source["consumer"], nats.ConsumerInfo);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class Api {
	    streamApi?: StreamApi;
	
	    static createFrom(source: any = {}) {
	        return new Api(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.streamApi = this.convertValues(source["streamApi"], StreamApi);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

export namespace nats {
	
	export class APIError {
	    code: number;
	    err_code: number;
	    description?: string;
	
	    static createFrom(source: any = {}) {
	        return new APIError(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.code = source["code"];
	        this.err_code = source["err_code"];
	        this.description = source["description"];
	    }
	}
	export class PeerInfo {
	    name: string;
	    current: boolean;
	    offline?: boolean;
	    active: number;
	    lag?: number;
	
	    static createFrom(source: any = {}) {
	        return new PeerInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.current = source["current"];
	        this.offline = source["offline"];
	        this.active = source["active"];
	        this.lag = source["lag"];
	    }
	}
	export class ClusterInfo {
	    name?: string;
	    leader?: string;
	    replicas?: PeerInfo[];
	
	    static createFrom(source: any = {}) {
	        return new ClusterInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.leader = source["leader"];
	        this.replicas = this.convertValues(source["replicas"], PeerInfo);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class ConsumerConfig {
	    durable_name?: string;
	    name?: string;
	    description?: string;
	    deliver_policy: number;
	    opt_start_seq?: number;
	    // Go type: time
	    opt_start_time?: any;
	    ack_policy: number;
	    ack_wait?: number;
	    max_deliver?: number;
	    backoff?: number[];
	    filter_subject?: string;
	    filter_subjects?: string[];
	    replay_policy: number;
	    rate_limit_bps?: number;
	    sample_freq?: string;
	    max_waiting?: number;
	    max_ack_pending?: number;
	    flow_control?: boolean;
	    idle_heartbeat?: number;
	    headers_only?: boolean;
	    max_batch?: number;
	    max_expires?: number;
	    max_bytes?: number;
	    deliver_subject?: string;
	    deliver_group?: string;
	    inactive_threshold?: number;
	    num_replicas: number;
	    mem_storage?: boolean;
	    metadata?: {[key: string]: string};
	
	    static createFrom(source: any = {}) {
	        return new ConsumerConfig(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.durable_name = source["durable_name"];
	        this.name = source["name"];
	        this.description = source["description"];
	        this.deliver_policy = source["deliver_policy"];
	        this.opt_start_seq = source["opt_start_seq"];
	        this.opt_start_time = this.convertValues(source["opt_start_time"], null);
	        this.ack_policy = source["ack_policy"];
	        this.ack_wait = source["ack_wait"];
	        this.max_deliver = source["max_deliver"];
	        this.backoff = source["backoff"];
	        this.filter_subject = source["filter_subject"];
	        this.filter_subjects = source["filter_subjects"];
	        this.replay_policy = source["replay_policy"];
	        this.rate_limit_bps = source["rate_limit_bps"];
	        this.sample_freq = source["sample_freq"];
	        this.max_waiting = source["max_waiting"];
	        this.max_ack_pending = source["max_ack_pending"];
	        this.flow_control = source["flow_control"];
	        this.idle_heartbeat = source["idle_heartbeat"];
	        this.headers_only = source["headers_only"];
	        this.max_batch = source["max_batch"];
	        this.max_expires = source["max_expires"];
	        this.max_bytes = source["max_bytes"];
	        this.deliver_subject = source["deliver_subject"];
	        this.deliver_group = source["deliver_group"];
	        this.inactive_threshold = source["inactive_threshold"];
	        this.num_replicas = source["num_replicas"];
	        this.mem_storage = source["mem_storage"];
	        this.metadata = source["metadata"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class SequenceInfo {
	    consumer_seq: number;
	    stream_seq: number;
	    // Go type: time
	    last_active?: any;
	
	    static createFrom(source: any = {}) {
	        return new SequenceInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.consumer_seq = source["consumer_seq"];
	        this.stream_seq = source["stream_seq"];
	        this.last_active = this.convertValues(source["last_active"], null);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class ConsumerInfo {
	    stream_name: string;
	    name: string;
	    // Go type: time
	    created: any;
	    config: ConsumerConfig;
	    delivered: SequenceInfo;
	    ack_floor: SequenceInfo;
	    num_ack_pending: number;
	    num_redelivered: number;
	    num_waiting: number;
	    num_pending: number;
	    cluster?: ClusterInfo;
	    push_bound?: boolean;
	
	    static createFrom(source: any = {}) {
	        return new ConsumerInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.stream_name = source["stream_name"];
	        this.name = source["name"];
	        this.created = this.convertValues(source["created"], null);
	        this.config = this.convertValues(source["config"], ConsumerConfig);
	        this.delivered = this.convertValues(source["delivered"], SequenceInfo);
	        this.ack_floor = this.convertValues(source["ack_floor"], SequenceInfo);
	        this.num_ack_pending = source["num_ack_pending"];
	        this.num_redelivered = source["num_redelivered"];
	        this.num_waiting = source["num_waiting"];
	        this.num_pending = source["num_pending"];
	        this.cluster = this.convertValues(source["cluster"], ClusterInfo);
	        this.push_bound = source["push_bound"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class ExternalStream {
	    api: string;
	    deliver?: string;
	
	    static createFrom(source: any = {}) {
	        return new ExternalStream(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.api = source["api"];
	        this.deliver = source["deliver"];
	    }
	}
	export class Placement {
	    cluster: string;
	    tags?: string[];
	
	    static createFrom(source: any = {}) {
	        return new Placement(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.cluster = source["cluster"];
	        this.tags = source["tags"];
	    }
	}
	export class RePublish {
	    src?: string;
	    dest: string;
	    headers_only?: boolean;
	
	    static createFrom(source: any = {}) {
	        return new RePublish(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.src = source["src"];
	        this.dest = source["dest"];
	        this.headers_only = source["headers_only"];
	    }
	}
	
	export class StreamConsumerLimits {
	    inactive_threshold?: number;
	    max_ack_pending?: number;
	
	    static createFrom(source: any = {}) {
	        return new StreamConsumerLimits(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.inactive_threshold = source["inactive_threshold"];
	        this.max_ack_pending = source["max_ack_pending"];
	    }
	}
	export class SubjectTransformConfig {
	    src?: string;
	    dest: string;
	
	    static createFrom(source: any = {}) {
	        return new SubjectTransformConfig(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.src = source["src"];
	        this.dest = source["dest"];
	    }
	}
	export class StreamSource {
	    name: string;
	    opt_start_seq?: number;
	    // Go type: time
	    opt_start_time?: any;
	    filter_subject?: string;
	    subject_transforms?: SubjectTransformConfig[];
	    external?: ExternalStream;
	
	    static createFrom(source: any = {}) {
	        return new StreamSource(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.opt_start_seq = source["opt_start_seq"];
	        this.opt_start_time = this.convertValues(source["opt_start_time"], null);
	        this.filter_subject = source["filter_subject"];
	        this.subject_transforms = this.convertValues(source["subject_transforms"], SubjectTransformConfig);
	        this.external = this.convertValues(source["external"], ExternalStream);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class StreamConfig {
	    name: string;
	    description?: string;
	    subjects?: string[];
	    retention: number;
	    max_consumers: number;
	    max_msgs: number;
	    max_bytes: number;
	    discard: number;
	    discard_new_per_subject?: boolean;
	    max_age: number;
	    max_msgs_per_subject: number;
	    max_msg_size?: number;
	    storage: number;
	    num_replicas: number;
	    no_ack?: boolean;
	    template_owner?: string;
	    duplicate_window?: number;
	    placement?: Placement;
	    mirror?: StreamSource;
	    sources?: StreamSource[];
	    sealed?: boolean;
	    deny_delete?: boolean;
	    deny_purge?: boolean;
	    allow_rollup_hdrs?: boolean;
	    compression: number;
	    first_seq?: number;
	    subject_transform?: SubjectTransformConfig;
	    republish?: RePublish;
	    allow_direct: boolean;
	    mirror_direct: boolean;
	    consumer_limits?: StreamConsumerLimits;
	    metadata?: {[key: string]: string};
	
	    static createFrom(source: any = {}) {
	        return new StreamConfig(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.description = source["description"];
	        this.subjects = source["subjects"];
	        this.retention = source["retention"];
	        this.max_consumers = source["max_consumers"];
	        this.max_msgs = source["max_msgs"];
	        this.max_bytes = source["max_bytes"];
	        this.discard = source["discard"];
	        this.discard_new_per_subject = source["discard_new_per_subject"];
	        this.max_age = source["max_age"];
	        this.max_msgs_per_subject = source["max_msgs_per_subject"];
	        this.max_msg_size = source["max_msg_size"];
	        this.storage = source["storage"];
	        this.num_replicas = source["num_replicas"];
	        this.no_ack = source["no_ack"];
	        this.template_owner = source["template_owner"];
	        this.duplicate_window = source["duplicate_window"];
	        this.placement = this.convertValues(source["placement"], Placement);
	        this.mirror = this.convertValues(source["mirror"], StreamSource);
	        this.sources = this.convertValues(source["sources"], StreamSource);
	        this.sealed = source["sealed"];
	        this.deny_delete = source["deny_delete"];
	        this.deny_purge = source["deny_purge"];
	        this.allow_rollup_hdrs = source["allow_rollup_hdrs"];
	        this.compression = source["compression"];
	        this.first_seq = source["first_seq"];
	        this.subject_transform = this.convertValues(source["subject_transform"], SubjectTransformConfig);
	        this.republish = this.convertValues(source["republish"], RePublish);
	        this.allow_direct = source["allow_direct"];
	        this.mirror_direct = source["mirror_direct"];
	        this.consumer_limits = this.convertValues(source["consumer_limits"], StreamConsumerLimits);
	        this.metadata = source["metadata"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	
	export class StreamAlternate {
	    name: string;
	    domain?: string;
	    cluster: string;
	
	    static createFrom(source: any = {}) {
	        return new StreamAlternate(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.domain = source["domain"];
	        this.cluster = source["cluster"];
	    }
	}
	export class StreamSourceInfo {
	    name: string;
	    lag: number;
	    active: number;
	    external?: ExternalStream;
	    error?: APIError;
	    filter_subject?: string;
	    subject_transforms?: SubjectTransformConfig[];
	
	    static createFrom(source: any = {}) {
	        return new StreamSourceInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.lag = source["lag"];
	        this.active = source["active"];
	        this.external = this.convertValues(source["external"], ExternalStream);
	        this.error = this.convertValues(source["error"], APIError);
	        this.filter_subject = source["filter_subject"];
	        this.subject_transforms = this.convertValues(source["subject_transforms"], SubjectTransformConfig);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class StreamState {
	    messages: number;
	    bytes: number;
	    first_seq: number;
	    // Go type: time
	    first_ts: any;
	    last_seq: number;
	    // Go type: time
	    last_ts: any;
	    consumer_count: number;
	    deleted: number[];
	    num_deleted: number;
	    num_subjects: number;
	    subjects: {[key: string]: number};
	
	    static createFrom(source: any = {}) {
	        return new StreamState(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.messages = source["messages"];
	        this.bytes = source["bytes"];
	        this.first_seq = source["first_seq"];
	        this.first_ts = this.convertValues(source["first_ts"], null);
	        this.last_seq = source["last_seq"];
	        this.last_ts = this.convertValues(source["last_ts"], null);
	        this.consumer_count = source["consumer_count"];
	        this.deleted = source["deleted"];
	        this.num_deleted = source["num_deleted"];
	        this.num_subjects = source["num_subjects"];
	        this.subjects = source["subjects"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class StreamInfo {
	    config: StreamConfig;
	    // Go type: time
	    created: any;
	    state: StreamState;
	    cluster?: ClusterInfo;
	    mirror?: StreamSourceInfo;
	    sources?: StreamSourceInfo[];
	    alternates?: StreamAlternate[];
	
	    static createFrom(source: any = {}) {
	        return new StreamInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.config = this.convertValues(source["config"], StreamConfig);
	        this.created = this.convertValues(source["created"], null);
	        this.state = this.convertValues(source["state"], StreamState);
	        this.cluster = this.convertValues(source["cluster"], ClusterInfo);
	        this.mirror = this.convertValues(source["mirror"], StreamSourceInfo);
	        this.sources = this.convertValues(source["sources"], StreamSourceInfo);
	        this.alternates = this.convertValues(source["alternates"], StreamAlternate);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	
	
	

}

