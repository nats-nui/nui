


export class Thread {

	static All = []
	timeId = null
	callback = null
	data = {}

	constructor(callback, data, intervall = 1000) {
		this.callback = callback
		this.data = data
		this.intervall = intervall
	}

	static Find(data) {
		return Thread.All.find(t => {
			for (let key in t.data) if (data[key] == t.data[key]) return true
			return false
		})
	}

	start() {
		this.stop()
		this.timeId = setInterval(this.callback, this.intervall)
		Thread.All.push(this)
	}

	stop() {
		if (this.timeId == null) return
		clearInterval(this.timeId)
		this.timeId = null
		const index = Thread.All.indexOf(this)
		if (index == -1) return
		Thread.All.splice(index, 1)
	}
}