export interface CddlSchema {
  id?: string
  name: string
  content: string
  description?: string
  /** Client-side only: compile/parse error */
  error?: string
}

export interface CborDecodedData {
  /** the payload was decoded as CBOR: says nothing about the CDDL verdict */
  success: boolean
  data?: unknown
  dataJson?: string
  /** why the payload could not be decoded; unset when success */
  error?: string
  /** CDDL verdict; undefined when no schema and rule are selected */
  valid?: boolean
  validationErrors?: string[]
  schemaUsed?: string
  rule?: string
}

export interface CborEncodedData {
  success: boolean
  /** binary string ready for the publish API; unset when the encoding failed */
  payload?: string
  error?: string
  validationErrors?: string[]
}

export interface CddlValidation {
  valid: boolean
  errors: string[]
}
