export interface KVEntry {
    key: string;
    payload: Uint8Array;
    lastUpdate: string;
    operation: OPERATION;
    revision: number;
    isDeleted: boolean;
    history: KVEntry[];
}

export enum OPERATION {
    PUT = "KeyValuePutOp",
    DELETE = "KeyValueDeleteOp",
    PURGE = "KeyValuePurgeOp"
}