export interface KevValueEntry {
    key: string;
    payload: Uint8Array;
    lastUpdate: string;
    operation: OPERATION;
    revision: number;
    isDeleted: boolean;
    history: KevValueEntry[];
}

export enum OPERATION {
    PUT = "KeyValuePutOp",
    DELETE = "KeyValueDeleteOp",
    PURGE = "KeyValuePurgeOp"
}