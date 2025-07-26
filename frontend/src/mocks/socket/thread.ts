// Type definition for thread data
interface ThreadData {
	[key: string]: any;
}

// Type definition for callback function
type ThreadCallback = () => void;

export class Thread {
	static All: Thread[] = [];
	timeId: NodeJS.Timeout | null = null;
	callback: ThreadCallback | null = null;
	data: ThreadData = {};
	intervall: number;

	constructor(callback: ThreadCallback, data: ThreadData, intervall: number = 1000) {
		this.callback = callback;
		this.data = data;
		this.intervall = intervall;
	}

	static Find(data: ThreadData): Thread | undefined {
		return Thread.All.find(t => {
			for (let key in t.data) {
				if (data[key] == t.data[key]) return true;
			}
			return false;
		});
	}

	start(): void {
		this.stop();
		if (this.callback) {
			this.timeId = setInterval(this.callback, this.intervall);
		}
		Thread.All.push(this);
	}

	stop(): void {
		if (this.timeId == null) return;
		clearInterval(this.timeId);
		this.timeId = null;
		const index: number = Thread.All.indexOf(this);
		if (index == -1) return;
		Thread.All.splice(index, 1);
	}
}
