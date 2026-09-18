import cddlApi from "@/api/cddl"
import { prepareCddlSchema } from "@/utils/cbor"
import { CddlSchema } from "@/types/Cbor"
import logSo from "@/stores/log"
import { MESSAGE_TYPE } from "@/stores/log/utils"
import { StoreCore, createStore } from "@priolo/jon"

const setup = {
  state: {
    schemas: <CddlSchema[]>[],
    isLoading: false,
    error: <string>null,
  },

  getters: {},

  actions: {
    async load(_: void, store?: CddlSchemaStore) {
      if (store.state.isLoading) return

      store.setIsLoading(true)
      store.setError(null)

      try {
        const backendSchemas = await cddlApi.index()
        const prepared = backendSchemas.map((schema) => prepareCddlSchema(schema))
        store.setSchemas(prepared)

        const broken = prepared.filter(schema => schema.error)
        logSo.add({
          type: prepared.length == 0 ? MESSAGE_TYPE.WARNING : MESSAGE_TYPE.INFO,
          title: "CDDL",
          body: prepared.length == 0
            ? "no schemas found: put .cddl files in the schemas directory"
            : `loaded ${prepared.length} schema${prepared.length == 1 ? "" : "s"}`,
          data: prepared.map(schema => schema.name).join(", "),
        })
        for (const schema of broken) {
          logSo.add({
            type: MESSAGE_TYPE.ERROR,
            title: "CDDL",
            body: `${schema.name} will not compile, so its rules cannot be used`,
            data: schema.error,
          })
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load schemas"
        store.setError(errorMessage)
        logSo.add({
          type: MESSAGE_TYPE.ERROR,
          title: "CDDL",
          body: "cannot read the schemas from the server",
          data: errorMessage,
        })
        console.error("Failed to load CDDL schemas:", err)
      } finally {
        store.setIsLoading(false)
      }
    },

    async refresh(_: void, store?: CddlSchemaStore) {
      await store.load()
    },
  },

  mutators: {
    setSchemas: (schemas: CddlSchema[]) => ({ schemas }),
    setIsLoading: (isLoading: boolean) => ({ isLoading }),
    setError: (error: string | null) => ({ error }),
  },
}

export type CddlSchemaState = typeof setup.state
export type CddlSchemaGetters = typeof setup.getters
export type CddlSchemaActions = typeof setup.actions
export type CddlSchemaMutators = typeof setup.mutators
export interface CddlSchemaStore extends StoreCore<CddlSchemaState>, CddlSchemaGetters, CddlSchemaActions, CddlSchemaMutators {
  state: CddlSchemaState
}

const cddlSo = createStore(setup) as CddlSchemaStore
export default cddlSo
