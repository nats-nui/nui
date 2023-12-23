
export const maxStringLength = 8

export const maxDeep = 10

export const getBrackets = (value: any) => Array.isArray(value) ? ["[ ", " ]"] : ["{ ", " }"]

export const getInitCollapsed = (value:any) => typeof value == "string" && value.length > 8
