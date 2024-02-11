


const streams: any[] = [
	{
		"config": {
			"name": "KV_bucket1",
			"subjects": [
				"$KV.bucket1.>"
			],
			"retention": "limits",
			"max_consumers": -1,
			"max_msgs": -1,
			"max_bytes": 10485760,
			"discard": "new",
			"max_age": 0,
			"max_msgs_per_subject": 1,
			"max_msg_size": -1,
			"storage": "file",
			"num_replicas": 1,
			"duplicate_window": 120000000000,
			"placement": {
				"cluster": ""
			},
			"deny_delete": true,
			"allow_rollup_hdrs": true,
			"allow_direct": true,
			"mirror_direct": false
		},
		"created": "2023-12-17T10:38:16.085639259Z",
		"state": {
			"messages": 0,
			"bytes": 0,
			"first_seq": 0,
			"first_ts": "0001-01-01T00:00:00Z",
			"last_seq": 49,
			"last_ts": "0001-01-01T00:00:00Z",
			"consumer_count": 0,
			"deleted": null,
			"num_deleted": 0,
			"num_subjects": 0,
			"subjects": {
				"subject": 2,
				"pippo": 5,
				"paperino": 6,
				"pluto": 7,
				"paperone": 8,
				"pappo": 5,
				"pandolfo": 6,
				"platinato": 7,
				"perpetua": 8,
				"topolino": 5,
				"topilona": 6,
				"topazio": 7,
				"torpedone": 8,
			}
		},
		"cluster": {
			"name": "ngsprod-aws-useast2",
			"leader": "aws-useast2-natscj1-2"
		}
	},
	{
		"config": {
			"name": "stream1",
			"subjects": [
				"sub1",
				"sub2"
			],
			"retention": "limits",
			"max_consumers": -1,
			"max_msgs": -1,
			"max_bytes": 10485760,
			"discard": "old",
			"max_age": 0,
			"max_msgs_per_subject": -1,
			"max_msg_size": -1,
			"storage": "file",
			"num_replicas": 1,
			"duplicate_window": 120000000000,
			"placement": {
				"cluster": ""
			},
			"allow_rollup_hdrs": true,
			"allow_direct": false,
			"mirror_direct": false
		},
		"created": "2024-01-25T22:32:01.584035795Z",
		"state": {
			"messages": 0,
			"bytes": 0,
			"first_seq": 0,
			"first_ts": "1970-01-01T00:00:00Z",
			"last_seq": 49,
			"last_ts": "0001-01-01T00:00:00Z",
			"consumer_count": 0,
			"deleted": null,
			"num_deleted": 0,
			"num_subjects": 0,
			"subjects": null
		},
		"cluster": {
			"name": "ngsprod-aws-useast2",
			"leader": "aws-useast2-natscj1-3"
		}
	},
	{
		"config": {
			"name": "stream2",
			"subjects": [
				"sub3"
			],
			"retention": "limits",
			"max_consumers": -1,
			"max_msgs": -1,
			"max_bytes": 10485760,
			"discard": "old",
			"max_age": 0,
			"max_msgs_per_subject": -1,
			"max_msg_size": -1,
			"storage": "file",
			"num_replicas": 1,
			"duplicate_window": 120000000000,
			"allow_rollup_hdrs": true,
			"allow_direct": false,
			"mirror_direct": false
		},
		"created": "2024-01-25T22:34:04.069856793Z",
		"state": {
			"messages": 0,
			"bytes": 0,
			"first_seq": 0,
			"first_ts": "1970-01-01T00:00:00Z",
			"last_seq": 49,
			"last_ts": "0001-01-01T00:00:00Z",
			"consumer_count": 0,
			"deleted": null,
			"num_deleted": 0,
			"num_subjects": 0,
			"subjects": null
		},
		"cluster": {
			"name": "ngsprod-gcp-europewest3",
			"leader": "gcp-europewest3-natscj1-5"
		}
	}

]

export default streams