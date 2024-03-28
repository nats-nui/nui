import { getNextId, getNow } from '@/mocks/data/utils';
import { OPERATION } from '@/types/KVEntry';
import { rest } from 'msw';
import keyValueEntries_S, { keyValueEntryDetail } from "../../data/kventries";



const kventry = [

    // INDEX
    rest.get('/api/connection/:connId/kv/:bucketName/key', (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json(keyValueEntries_S),
        )
    }),

    // GET
    rest.get('/api/connection/:connId/kv/:bucketName/key/:key', (req, res, ctx) => {
        // return res(
        //     ctx.delay(1000),
        //     ctx.status(400),
        //     ctx.json({ error: "bestiale!!!"}),
        // )
        return res(
            ctx.delay(2000),
            ctx.status(200),
            ctx.json(keyValueEntryDetail),
        )
    }),

    // PUT
    rest.post('/api/connection/:connId/kv/:bucketName/key/:key', async (req, res, ctx) => {
        const { key } = req.params
        const { payload } = await req.json() as { payload: string }
        const index = keyValueEntries_S.findIndex(e => e.key === key)
        let entryRecord = null
        if (index !== -1) {
            entryRecord = keyValueEntries_S[index]
            entryRecord.payload = payload
            entryRecord.last_update = getNow()
            entryRecord.revision = getNextId()
            entryRecord.operation = OPERATION.PUT
            entryRecord.history = entryRecord.history ? [...entryRecord.history, payload] : [payload]
        } else {
            entryRecord = {
                key: key as string,
                payload,
                last_update: getNow(),
                revision: 1,
                operation: OPERATION.PUT,
                is_deleted: false,
                history: null
            }
            entryRecord.history = [{...entryRecord}]
            keyValueEntries_S.push(entryRecord)
        }
        return res(
            ctx.status(200),
            ctx.json(entryRecord),
        )
    }),

    // DELETE
    rest.delete('/api/connection/:connId/kv/:bucketName/key/:key', (req, res, ctx) => {
        const { key } = req.params
        const index = keyValueEntries_S.findIndex(e => e.key === key)
        if (index === -1) return res(ctx.status(404))
        keyValueEntries_S.splice(index, 1)
        return res(
            ctx.status(204),
        )
    }),

    // PURGE
    rest.post('/api/connection/:connId/kv/:bucketName/key/:key/purge', (req, res, ctx) => {
        const { key } = req.params
        const index = keyValueEntries_S.findIndex(e => e.key === key)
        if (index === -1) return res(ctx.status(404))
        const history = keyValueEntries_S[index].history
        history.splice(0, history.length -1)
        return res(
            ctx.status(204),
        )
    }),

]

export default kventry