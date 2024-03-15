
const consumers: any[] = [
	{
		"stream_name": "s1",
		"name": "consumer1",
		"created": "2024-01-27T17:04:51.476940093Z",
		"config": {
			"name": "consumer1",
			"durable_name": "consumer1",
			"description": "consumwer desription",
			"deliver_policy": "all",
			"ack_policy": "explicit",
			"ack_wait": -1,
			"max_deliver": -1,
			"replay_policy": "instant",
			"sample_freq": "0",
			"max_waiting": 512,
			"max_ack_pending": -1,
			"max_batch": 4096,
			"max_bytes": -1,
			"num_replicas": 1
		},
		"delivered": {
			"consumer_seq": 0,
			"stream_seq": 0
		},
		"ack_floor": {
			"consumer_seq": 0,
			"stream_seq": 0
		},
		"num_ack_pending": 0,
		"num_redelivered": 0,
		"num_waiting": 0,
		"num_pending": 0,
		"cluster": {
			"name": "ngsprod-aws-useast2",
			"leader": "aws-useast2-natscj1-2"
		}
	},
	{
		"stream_name": "$MQTT_rmsgs",
		"name": "$MQTT_rmsgs_Rir9N0XqfKsNEwmPQik76Z",
		"created": "2024-03-12T23:48:15.91402704Z",
		"config": {
			"name": "$MQTT_rmsgs_Rir9N0XqfKsNEwmPQik76Z",
			"deliver_policy": "all",
			"ack_policy": "none",
			"max_deliver": -1,
			"filter_subject": "$MQTT.rmsgs.>",
			"replay_policy": "instant",
			"inactive_threshold": 300000000000,
			"num_replicas": 0
		},
		"delivered": {
			"consumer_seq": 1,
			"stream_seq": 2,
			"last_active": "2024-03-12T23:48:15.915081901Z"
		},
		"ack_floor": {
			"consumer_seq": 1,
			"stream_seq": 2
		},
		"num_ack_pending": 0,
		"num_redelivered": 0,
		"num_waiting": 0,
		"num_pending": 0,
		"push_bound": true
	}
]
export default consumers