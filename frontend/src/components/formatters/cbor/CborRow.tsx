import { FunctionComponent, useMemo, memo } from "react"
import cddlSo from "@/stores/cddl"
import { resolveCbor } from "@/utils/cbor/resolve"
import { useStore } from "@priolo/jon"
import JsonRow from "../json/JsonRow"
import TextRow from "../text/TextRow"

interface Props {
  text?: string
  style?: React.CSSProperties
  subject?: string
}

/**
 * One CBOR payload in a message list.
 *
 * A list renders one of these per message, so the row holds no state and runs
 * no effects: it asks for the answer to its payload, which is worked out once
 * and shared with every other row asking the same, and draws it.
 */
const CborRow: FunctionComponent<Props> = ({ text, style, subject }) => {
  const { schemas } = useStore(cddlSo)

  const resolution = useMemo(
    () => text ? resolveCbor(text, schemas, subject) : undefined,
    [text, schemas, subject],
  )

  const schemaInfo = useMemo(() => {
    if (!resolution?.schema || !resolution.rule) return null
    const name = resolution.schema.name
    const shown = name.length > 30 ? `...${name.slice(-27)}` : name
    return `${shown} \u203a ${resolution.rule}`
  }, [resolution])

  if (!text || !resolution) return null

  const { decoded } = resolution

  if (decoded.dataJson) {
    const validationError = decoded.validationErrors?.[0]
    return (
      <div style={style}>
        {schemaInfo && <div style={cssSchemaInfo}>{schemaInfo}</div>}
        {validationError && <TextRow text={`CDDL: ${validationError}`} error />}
        <JsonRow text={decoded.dataJson} />
      </div>
    )
  }

  return (
    <div style={style}>
      {schemaInfo && <div style={cssSchemaInfo}>{schemaInfo}</div>}
      <TextRow text={decoded.error ?? "CBOR: nothing to show"} error />
    </div>
  )
}

export default memo(CborRow)

const cssSchemaInfo: React.CSSProperties = {
  fontSize: 10,
  opacity: 0.6,
  fontFamily: "monospace",
  marginBottom: 2,
}
