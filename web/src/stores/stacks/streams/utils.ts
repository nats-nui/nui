import { POLICY, STORAGE, Stream } from "@/types/Stream";



export function buildNewStream(): Stream {
	return {
		name: "<new>",
		description: "",
		storage: STORAGE.FILE,
		subjects: [],
		sources: [],
		policy: POLICY.INTEREST,
	}
}
