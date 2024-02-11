export interface KVEntry {
    key: string;
    payload: string;
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