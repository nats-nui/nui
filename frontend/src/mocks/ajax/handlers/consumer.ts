import {rest} from 'msw'
import consumers from "../../data/consumer"
import {snakeToCamel} from "@/utils/object.ts";
import {StreamConsumer} from "@/types/Consumer.ts";


const handlers = [

    /** INDEX */
    rest.get('/api/connection/:connId/stream/:streamName/consumer', async (req, res, ctx) => {
        const {cnnId, streamName} = req.params
        return res(
            ctx.status(200),
            ctx.json(consumers),
        )
    }),

    /** GET */
    rest.get('/api/connection/:connId/stream/:streamName/consumer/:consumerName', async (req, res, ctx) => {
        const {cnnId, streamName, consumerName} = req.params
        const consumer = consumers.find(c => c.name = consumerName)
        if (!consumer) return res(ctx.status(404))
        return res(
            ctx.status(200),
            ctx.json(consumer),
        )
    }),

    rest.post('/api/connection/:cnnId/stream/:streamName/consumer', async (req, res, ctx) => {
        const {streamName} = req.params
        const consumerConfig_S = await req.json()
        if (!consumerConfig_S) return res(ctx.status(500))
        const consumerInfo_C: StreamConsumer = {
            ackFloor: undefined,
            created: "",
            delivered: undefined,
            name: "",
            numAckPending: 0,
            numPending: 0,
            numRedelivered: 0,
            numWaiting: 0,
            streamName: streamName as string,
            config: snakeToCamel(consumerConfig_S)
        }
        consumers.push(consumerInfo_C)
        return res(
            ctx.status(201),
            ctx.json(consumerInfo_C),
        )
    }),

    rest.post('/api/connection/:cnnId/stream/:streamName/consumer/:consumerName', async (req, res, ctx) => {
        const {consumerName} = req.params
        const updatedConsumerConfig_S = await req.json()
        const consumerIndex = consumers.findIndex(c => c.name === consumerName)
        if (consumerIndex === -1) return res(ctx.status(404))
        const updatedConsumerInfo_C: StreamConsumer = {
            ...consumers[consumerIndex],
            config: snakeToCamel(updatedConsumerConfig_S)
        }
        consumers[consumerIndex] = updatedConsumerInfo_C
        return res(
            ctx.status(200),
            ctx.json(updatedConsumerInfo_C),
        )
    }),

    rest.delete('/api/connection/:cnnId/stream/:streamName/consumer/:consumerName', async (req, res, ctx) => {
        const {consumerName} = req.params
        const consumerIndex = consumers.findIndex(c => c.name === consumerName)
        if (consumerIndex === -1) return res(ctx.status(404))
        consumers.splice(consumerIndex, 1)
        return res(ctx.status(204))
    }),


]

export default handlers
