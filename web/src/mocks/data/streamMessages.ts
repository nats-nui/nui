


const streamMessages: any[] = Array.from({length:100}, (_,i)=>{
	return {
		seq_num: i,
		headers: [],
		subject: "subject",
		payload: `payload:${i}`,
		size: 10,
		received_ad: Date.now(),
	}
})

export default streamMessages