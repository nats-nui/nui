const protoSchemas = [
	{
		id: "common.proto",
		name: "common.proto",
		description: "Shared message types used by the mock schemas.",
		content: `syntax = "proto3";

package mock.common;

message Metadata {
	string request_id = 1;
	string source = 2;
}`,
	},
	{
		id: "event.proto",
		name: "event.proto",
		description: "Example event schema for protobuf message decoding.",
		content: `syntax = "proto3";

package mock.events;

import "common.proto";

message Event {
	string id = 1;
	string subject = 2;
	int64 timestamp = 3;
	mock.common.Metadata metadata = 4;
}`,
	},
]

export default protoSchemas