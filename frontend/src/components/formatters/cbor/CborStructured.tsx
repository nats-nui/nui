import { FunctionComponent, useMemo } from "react"
import { CborField } from "@/utils/cbor/shape"
import { fromPayload } from "@/utils/cbor/value"
import { styles } from "./cbor.styles"
import FieldView from "./fields/FieldView"

interface Props {
  field: CborField
  /** the payload as it arrived, one character per byte */
  payload: string
}

/** Decoded payload shown as named fields from the matching type. */
const CborStructured: FunctionComponent<Props> = ({ field, payload }) => {
  const { value, error } = useMemo(() => fromPayload(field, payload), [field, payload])

  if (error) return <div style={styles.placeholder}>{error}</div>

  return (
    <div style={styles.form}>
      <FieldView readOnly
        field={field}
        value={value}
        onChange={() => undefined}
      />
    </div>
  )
}

export default CborStructured
