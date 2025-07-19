


export class Thread {

	static All = []
	timeId = null
	callback = null
	data = {}
	delay = 1000

	constructor(callback, data, delay = 1000) {
		this.callback = callback
		this.data = data
		this.delay = delay
	}

	static Find(data) {
		return Thread.All.find ( t => {
			for ( let key in t.data ) if ( data[key] == t.data[key] ) return true
			return false
		})
	}

	start() {
		this.stop()
		this.timeId = setInterval(this.callback, this.delay)
		Thread.All.push(this)
	}

	stop() {
		if ( this.timeId == null ) return
		clearInterval(this.timeId)
		this.timeId = null
		const index = Thread.All.indexOf(this)
		if (index == -1) return
		Thread.All.splice(index, 1)
	}
}