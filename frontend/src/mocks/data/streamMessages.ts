import dayjs from "dayjs"



const streamMessages: any[] = Array.from({length:100}, (_,i)=>{
	return {
		seq_num: i,
		headers: [],
		subject: "subject",
		payload: btoa(`payload:${i}`),
		size: 10,
		received_at: dayjs().add(i, "minutes").format(),
	}
})

export default streamMessages