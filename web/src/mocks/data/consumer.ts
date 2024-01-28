
const consumers: any[] = [
	{
		stream_name: "pippo",
		name: "pluto",
		config: {
			name: "cavo",
		}
	},
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
	}
]
export default consumers