export namespace mapping {
	
	export class StreamApi {
	    streamInfo?: nats.StreamInfo;
	    streamConfig?: nats.StreamConfig;
	
	    static createFrom(source: any = {}) {
	        return new StreamApi(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.streamInfo = this.convertValues(source["streamInfo"], nats.StreamInfo);
	        this.streamConfig = this.convertValues(source["streamConfig"], nats.StreamConfig);
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
	export class StreamSource {
	    name: string;
	    opt_start_seq?: number;
	    // Go type: time
	    opt_start_time?: any;
	    filter_subject?: string;
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
	    republish?: RePublish;
	    allow_direct: boolean;
	    mirror_direct: boolean;
	
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
	        this.republish = this.convertValues(source["republish"], RePublish);
	        this.allow_direct = source["allow_direct"];
	        this.mirror_direct = source["mirror_direct"];
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

