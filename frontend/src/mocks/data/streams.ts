import { StreamInfo } from "@/types/Stream"
import { randomStreams } from "./utils/stream"


const streams: any[] = [
    {
        "config": {
            "name": "$MQTT_msgs",
            "subjects": [
                "$MQTT.msgs.>"
            ],
            "retention": "interest",
            "max_consumers": -1,
            "max_msgs": -1,
            "max_bytes": -1,
            "discard": "old",
            "max_age": 864000000000000,
            "max_msgs_per_subject": -1,
            "max_msg_size": -1,
            "storage": "file",
            "num_replicas": 1,
            "duplicate_window": 120000000000,
            "compression": "none",
            "allow_direct": false,
            "mirror_direct": false,
            "consumer_limits": {}
        },
        "created": "2023-10-12T12:23:09.779108275Z",
        "state": {
            "messages": 40674,
            "bytes": 243056416,
            "first_seq": 1729507,
            "first_ts": "2024-01-25T08:06:19.446786999Z",
            "last_seq": 1810853,
            "last_ts": "2024-01-30T21:33:47.487219406Z",
            "consumer_count": 44,
            "deleted": null,
            "num_deleted": 40673,
            "num_subjects": 1,
            "subjects": { "camelCase": 3, "snake_case": 4, "kebab-case": 5 },
        }
    },
    {
        "config": {
            "name": "$MQTT_out",
            "subjects": [
                "$MQTT.out.>"
            ],
            "retention": "interest",
            "max_consumers": -1,
            "max_msgs": -1,
            "max_bytes": -1,
            "discard": "old",
            "max_age": 0,
            "max_msgs_per_subject": -1,
            "max_msg_size": -1,
            "storage": "file",
            "num_replicas": 1,
            "duplicate_window": 120000000000,
            "compression": "none",
            "allow_direct": false,
            "mirror_direct": false,
            "consumer_limits": {}
        },
        "created": "2023-09-26T13:49:18.575042514Z",
        "state": {
            "messages": 0,
            "bytes": 0,
            "first_seq": 1,
            "first_ts": "0001-01-01T00:00:00Z",
            "last_seq": 0,
            "last_ts": "0001-01-01T00:00:00Z",
            "consumer_count": 11,
            "deleted": null,
            "num_deleted": 0,
            "num_subjects": 0,
            "subjects": null
        }
    },
    {
        "config": {
            "name": "$MQTT_qos2in",
            "subjects": [
                "$MQTT.qos2.in.>"
            ],
            "retention": "limits",
            "max_consumers": -1,
            "max_msgs": -1,
            "max_bytes": -1,
            "discard": "new",
            "discard_new_per_subject": true,
            "max_age": 0,
            "max_msgs_per_subject": 1,
            "max_msg_size": -1,
            "storage": "file",
            "num_replicas": 1,
            "duplicate_window": 120000000000,
            "compression": "none",
            "allow_direct": false,
            "mirror_direct": false,
            "consumer_limits": {}
        },
        "created": "2023-09-26T13:49:18.57439047Z",
        "state": {
            "messages": 0,
            "bytes": 0,
            "first_seq": 1,
            "first_ts": "0001-01-01T00:00:00Z",
            "last_seq": 0,
            "last_ts": "0001-01-01T00:00:00Z",
            "consumer_count": 0,
            "deleted": null,
            "num_deleted": 0,
            "num_subjects": 0,
            "subjects": null
        }
    },
    {
        "config": {
            "name": "$MQTT_rmsgs",
            "subjects": [
                "$MQTT.rmsgs.>"
            ],
            "retention": "limits",
            "max_consumers": -1,
            "max_msgs": -1,
            "max_bytes": -1,
            "discard": "old",
            "max_age": 0,
            "max_msgs_per_subject": 1,
            "max_msg_size": -1,
            "storage": "file",
            "num_replicas": 1,
            "duplicate_window": 120000000000,
            "compression": "none",
            "allow_direct": false,
            "mirror_direct": false,
            "consumer_limits": {}
        },
        "created": "2023-09-26T13:49:10.21496389Z",
        "state": {
            "messages": 1,
            "bytes": 520,
            "first_seq": 359427485,
            "first_ts": "2024-02-04T08:06:17.375283328Z",
            "last_seq": 359427485,
            "last_ts": "2024-02-04T08:06:17.375283328Z",
            "consumer_count": 1,
            "deleted": null,
            "num_deleted": 0,
            "num_subjects": 1,
            "subjects": null
        }
    },
    {
        "config": {
            "name": "$MQTT_sess",
            "subjects": [
                "$MQTT.sess.>"
            ],
            "retention": "limits",
            "max_consumers": -1,
            "max_msgs": -1,
            "max_bytes": -1,
            "discard": "old",
            "max_age": 0,
            "max_msgs_per_subject": 1,
            "max_msg_size": -1,
            "storage": "file",
            "num_replicas": 1,
            "duplicate_window": 120000000000,
            "compression": "none",
            "allow_direct": false,
            "mirror_direct": false,
            "consumer_limits": {}
        },
        "created": "2023-08-01T12:45:41.782548835Z",
        "state": {
            "messages": 1769,
            "bytes": 412268,
            "first_seq": 6451,
            "first_ts": "2023-09-26T13:19:55.884993444Z",
            "last_seq": 115953,
            "last_ts": "2024-02-04T07:45:33.286188543Z",
            "consumer_count": 0,
            "deleted": null,
            "num_deleted": 107734,
            "num_subjects": 1769,
            "subjects": null
        }
    },
    {
        "config": {
            "name": "KV_jfood-integration",
            "subjects": [
                "$KV.jfood-integration.>"
            ],
            "retention": "limits",
            "max_consumers": -1,
            "max_msgs": -1,
            "max_bytes": -1,
            "discard": "new",
            "max_age": 0,
            "max_msgs_per_subject": 64,
            "max_msg_size": -1,
            "storage": "file",
            "num_replicas": 1,
            "duplicate_window": 120000000000,
            "deny_delete": true,
            "allow_rollup_hdrs": true,
            "compression": "none",
            "allow_direct": false,
            "mirror_direct": false,
            "consumer_limits": {}
        },
        "created": "2022-12-07T11:03:10.314367788Z",
        "state": {
            "messages": 64,
            "bytes": 4416,
            "first_seq": 7578002,
            "first_ts": "2024-02-04T08:01:37.735560968Z",
            "last_seq": 7578065,
            "last_ts": "2024-02-04T08:05:37.816879658Z",
            "consumer_count": 0,
            "deleted": null,
            "num_deleted": 0,
            "num_subjects": 1,
            "subjects": null
        }
    },
    {
        "config": {
            "name": "KV_plc-console_farm",
            "subjects": [
                "$KV.plc-console_farm.>"
            ],
            "retention": "limits",
            "max_consumers": -1,
            "max_msgs": -1,
            "max_bytes": -1,
            "discard": "new",
            "max_age": 0,
            "max_msgs_per_subject": 1,
            "max_msg_size": -1,
            "storage": "file",
            "num_replicas": 1,
            "duplicate_window": 120000000000,
            "deny_delete": true,
            "allow_rollup_hdrs": true,
            "compression": "none",
            "allow_direct": true,
            "mirror_direct": false,
            "consumer_limits": {}
        },
        "created": "2023-09-05T09:06:54.469398958Z",
        "state": {
            "messages": 1,
            "bytes": 23152,
            "first_seq": 581,
            "first_ts": "2023-12-13T12:18:08.975413294Z",
            "last_seq": 581,
            "last_ts": "2023-12-13T12:18:08.975413294Z",
            "consumer_count": 0,
            "deleted": null,
            "num_deleted": 0,
            "num_subjects": 1,
            "subjects": null
        }
    },
    {
        "config": {
            "name": "KV_plc-console_metadata",
            "subjects": [
                "$KV.plc-console_metadata.>"
            ],
            "retention": "limits",
            "max_consumers": -1,
            "max_msgs": -1,
            "max_bytes": -1,
            "discard": "new",
            "max_age": 0,
            "max_msgs_per_subject": 1,
            "max_msg_size": -1,
            "storage": "file",
            "num_replicas": 1,
            "duplicate_window": 120000000000,
            "deny_delete": true,
            "allow_rollup_hdrs": true,
            "compression": "none",
            "allow_direct": true,
            "mirror_direct": false,
            "consumer_limits": {}
        },
        "created": "2023-09-12T14:30:04.9152191Z",
        "state": {
            "messages": 29602,
            "bytes": 11941238,
            "first_seq": 5284,
            "first_ts": "2023-09-12T14:30:07.427133265Z",
            "last_seq": 59198,
            "last_ts": "2023-12-06T08:19:10.008757384Z",
            "consumer_count": 0,
            "deleted": null,
            "num_deleted": 24313,
            "num_subjects": 29602,
            "subjects": null
        }
    },
    {
        "config": {
            "name": "KV_plc-console_module",
            "subjects": [
                "$KV.plc-console_module.>"
            ],
            "retention": "limits",
            "max_consumers": -1,
            "max_msgs": -1,
            "max_bytes": -1,
            "discard": "new",
            "max_age": 0,
            "max_msgs_per_subject": 1,
            "max_msg_size": -1,
            "storage": "file",
            "num_replicas": 1,
            "duplicate_window": 120000000000,
            "deny_delete": true,
            "allow_rollup_hdrs": true,
            "compression": "none",
            "allow_direct": true,
            "mirror_direct": false,
            "consumer_limits": {}
        },
        "created": "2023-09-05T09:06:54.468077505Z",
        "state": {
            "messages": 1,
            "bytes": 131,
            "first_seq": 3,
            "first_ts": "2023-11-24T19:02:39.489405502Z",
            "last_seq": 3,
            "last_ts": "2023-11-24T19:02:39.489405502Z",
            "consumer_count": 0,
            "deleted": null,
            "num_deleted": 0,
            "num_subjects": 1,
            "subjects": null
        }
    },
    {
        "config": {
            "name": "task-manager_command_schedule_incident_tasks",
            "subjects": [
                "services.task-manager.command.schedule_incident_tasks"
            ],
            "retention": "limits",
            "max_consumers": -1,
            "max_msgs": -1,
            "max_bytes": -1,
            "discard": "old",
            "max_age": 2592000000000000,
            "max_msgs_per_subject": -1,
            "max_msg_size": -1,
            "storage": "file",
            "num_replicas": 1,
            "no_ack": true,
            "duplicate_window": 120000000000,
            "compression": "none",
            "allow_direct": false,
            "mirror_direct": false,
            "consumer_limits": {}
        },
        "created": "2022-08-30T14:46:20.805386581Z",
        "state": {
            "messages": 124,
            "bytes": 156978,
            "first_seq": 2334,
            "first_ts": "2024-01-05T12:30:36.986698845Z",
            "last_seq": 2457,
            "last_ts": "2024-02-04T05:00:38.803219989Z",
            "consumer_count": 1,
            "deleted": null,
            "num_deleted": 0,
            "num_subjects": 1,
            "subjects": null
        }
    }
]

const rndStreams = randomStreams(40)
export default [...streams, ...rndStreams]
