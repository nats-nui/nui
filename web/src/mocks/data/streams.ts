import { POLICY, STORAGE, Stream } from "@/types/Stream";
import dayjs from "dayjs";



const streams:Stream[] = [
	{
		id: "str-1",
		name: "Sream 1",
		description: "E' solo uno stream di prova",
		storage: STORAGE.FILE,
		subjects: ["sub1.sub1_1", "sub1.sub1_2", "sub2.sub2_1"],
		sources: [
			{ name : "libreria", startSequence: 0, startTime: dayjs("01/01/2024").valueOf(), filterSubject: "booh" },
			{ name : "api2.0", startSequence: 0, startTime: dayjs("02/01/2024").valueOf(), filterSubject: "booh" },
			{ name : "mp3-dance", startSequence: 0, startTime: dayjs("03/01/2024").valueOf(), filterSubject: "booh" },
			{ name : "last but not least", startSequence: 0, startTime: dayjs("04/01/2024").valueOf(), filterSubject: "booh" },
		],
		policy: POLICY.INTEREST,
	},
	{
		id: "str-2",
		name: "Sream 2",
		description: "E' solo uno stream di prova",
		storage: STORAGE.FILE,
		subjects: ["sub1.sub1_1", "sub1.sub1_2", "sub2.sub2_1"],
		sources: [
			{ name : "libreria", startSequence: 0, startTime: dayjs("05/02/2024").valueOf(), filterSubject: "booh" },
			{ name : "api2.0", startSequence: 0, startTime: dayjs("06/02/2024").valueOf(), filterSubject: "booh" },
		],
		policy: POLICY.INTEREST,
	},
	{
		id: "str-3",
		name: "Sream 3",
		description: "E' solo uno stream di prova",
		storage: STORAGE.FILE,
		subjects: ["sub1.sub1_1", "sub1.sub1_2", "sub2.sub2_1"],
		sources: [
			{ name : "libreria", startSequence: 0, startTime: dayjs("07/03/2024").valueOf(), filterSubject: "booh" },
			{ name : "api2.0", startSequence: 0, startTime: dayjs("08/03/2024").valueOf(), filterSubject: "booh" },
		],
		policy: POLICY.INTEREST,
	}
]

export default streams