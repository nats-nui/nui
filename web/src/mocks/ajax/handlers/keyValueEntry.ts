import { rest } from 'msw'
import { snakeToCamel, camelToSnake } from '@/utils/object'
import keyValueEntries_S from "../../data/keyValueEntries"
import {keyValueEntryDetail} from "../../data/keyValueEntries";
const keyValueHandlers = [

    // INDEX
    rest.get('/api/:connId/kv/:bucketName/key', (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json(keyValueEntries_S),
        )
    }),

    // GET
    rest.get('/api/:connId/kv/:bucketName/:key', (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json(keyValueEntryDetail),
        )
    }),

    // PUT
    rest.put('/api/:connId/kv/:bucketName/:key', async (req, res, ctx) => {
        const { key } = req.params
        const newEntry_S = await req.json()
        const newEntry_C = snakeToCamel(newEntry_S)
        const index = keyValueEntries_S.findIndex(e => e.key === key)
        if (index !== -1) {
            keyValueEntries_S[index] = newEntry_C
        } else {
            keyValueEntries_S.push(newEntry_C)
        }
        return res(
            ctx.status(200),
            ctx.json(newEntry_C),
        )
    }),

    // DELETE
    rest.delete('/api/:connId/kv/:bucketName/:key', (req, res, ctx) => {
        const { key } = req.params
        const index = keyValueEntries_S.findIndex(e => e.key === key)
        if (index === -1) return res(ctx.status(404))
        keyValueEntries_S.splice(index, 1)
        return res(
            ctx.status(204),
        )
    }),
]

export default keyValueHandlers