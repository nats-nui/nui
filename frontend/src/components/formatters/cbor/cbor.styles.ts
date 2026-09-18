import { CSSProperties } from "react"

export const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    backgroundColor: "#1e1e1e",
  } as CSSProperties,

  schemaHeader: {
    padding: "6px 12px",
    borderBottom: "1px solid #333",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#2a2a2a",
  } as CSSProperties,

  schemaText: {
    fontFamily: "monospace",
    fontSize: "12px",
    color: "#dedede",
  } as CSSProperties,

  controls: {
    padding: "8px 12px",
    borderBottom: "1px solid #333",
    backgroundColor: "#2a2a2a",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  } as CSSProperties,

  controlsCompact: {
    padding: "6px 12px",
    borderBottom: "1px solid #333",
    backgroundColor: "#2a2a2a",
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: "6px",
  } as CSSProperties,

  controlGroup: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  } as CSSProperties,

  controlLabel: {
    color: "#dedede",
    fontSize: "12px",
    minWidth: "80px",
  } as CSSProperties,

  statusMessage: {
    fontSize: "12px",
    fontStyle: "italic",
    color: "#999",
  } as CSSProperties,

  errorContainer: {
    color: "#ff6b6b",
    padding: "8px 12px",
    backgroundColor: "rgba(255, 107, 107, 0.1)",
    margin: "8px 12px",
    borderRadius: "4px",
    border: "1px solid rgba(255, 107, 107, 0.3)",
    fontSize: "12px",
  } as CSSProperties,

  debugInfo: {
    marginTop: "8px",
    fontSize: "11px",
    color: "#999",
  } as CSSProperties,

  placeholder: {
    padding: "20px",
    textAlign: "center",
    color: "#999",
    fontStyle: "italic",
    fontSize: "13px",
  } as CSSProperties,

  fallbackContainer: {
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#1e1e1e",
  } as CSSProperties,

  dataDisplay: {
    flex: 1,
    minHeight: 0,
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#1e1e1e",
  } as CSSProperties,

  buttonSmall: {
    padding: "3px 8px",
    fontSize: "11px",
    cursor: "pointer",
    backgroundColor: "#393939",
    color: "#dedede",
    border: "1px solid #4a4a4a",
    borderRadius: "3px",
  } as CSSProperties,

  select: {
    padding: "4px 8px",
    fontSize: "12px",
    backgroundColor: "#1e1e1e",
    color: "#dedede",
    border: "1px solid #4a4a4a",
    borderRadius: "3px",
    minWidth: "180px",
    outline: "none",
  } as CSSProperties,

  noSchemasMessage: {
    color: "#999",
    fontStyle: "italic",
    fontSize: "12px",
  } as CSSProperties,

  validBadge: {
    fontSize: "11px",
    color: "#6AFFAB",
    marginLeft: "8px",
  } as CSSProperties,

  //#region form fields

  form: {
    flex: 1,
    overflowY: "auto",
    padding: "10px 12px",
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  } as CSSProperties,

  headerButton: {
    fontFamily: "monospace",
    fontSize: "12px",
    color: "#dedede",
    backgroundColor: "transparent",
    border: "1px solid transparent",
    borderRadius: "3px",
    padding: "2px 6px",
    cursor: "pointer",
  } as CSSProperties,

  segmented: {
    display: "flex",
    border: "1px solid #4a4a4a",
    borderRadius: "4px",
    overflow: "hidden",
  } as CSSProperties,

  segment: {
    padding: "2px 10px",
    fontSize: "11px",
    color: "#9a9a9a",
    backgroundColor: "transparent",
    border: "none",
    cursor: "pointer",
  } as CSSProperties,

  segmentOn: {
    color: "#1e1e1e",
    backgroundColor: "#bdbdbd",
    cursor: "default",
  } as CSSProperties,

  statusQuiet: {
    fontSize: "11px",
    color: "#8a8a8a",
  } as CSSProperties,

  statusReady: {
    fontSize: "11px",
    color: "#6AFFAB",
  } as CSSProperties,

  statusWrong: {
    fontSize: "11px",
    color: "#ff6b6b",
  } as CSSProperties,

  viewSwitch: {
    borderBottom: "1px solid #333",
    backgroundColor: "#2a2a2a",
    padding: "5px 12px",
    display: "flex",
    gap: "6px",
  } as CSSProperties,

  formFooter: {
    borderTop: "1px solid #333",
    backgroundColor: "#2a2a2a",
    padding: "6px 12px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "11px",
    color: "#999",
  } as CSSProperties,

  field: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    padding: "3px 0",
  } as CSSProperties,

  fieldLabel: {
    fontSize: "12px",
    color: "#dedede",
    minWidth: "96px",
  } as CSSProperties,

  fieldType: {
    fontFamily: "monospace",
    fontSize: "10px",
    color: "#7a7a7a",
  } as CSSProperties,

  fieldHint: {
    fontSize: "11px",
    lineHeight: "14px",
    minHeight: "14px",
    color: "#8a8a8a",
    fontStyle: "italic",
  } as CSSProperties,

  fieldError: {
    fontSize: "11px",
    lineHeight: "14px",
    minHeight: "14px",
    color: "#ff6b6b",
  } as CSSProperties,

  input: {
    flex: 1,
    minWidth: 0,
    padding: "4px 8px",
    fontSize: "12px",
    fontFamily: "inherit",
    backgroundColor: "#1e1e1e",
    color: "#dedede",
    border: "1px solid #4a4a4a",
    borderRadius: "3px",
    outline: "none",
  } as CSSProperties,

  inputInvalid: {
    borderColor: "rgba(255, 107, 107, 0.6)",
  } as CSSProperties,

  notationInput: {
    fontFamily: "monospace",
    resize: "vertical",
    minHeight: "44px",
  } as CSSProperties,

  fixedValue: {
    fontFamily: "monospace",
    fontSize: "12px",
    color: "#9a9a9a",
  } as CSSProperties,

  readValue: {
    fontFamily: "monospace",
    fontSize: "12px",
    color: "#dedede",
    wordBreak: "break-all",
  } as CSSProperties,

  rootMembers: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  } as CSSProperties,

  nested: {
    borderLeft: "1px solid #333",
    marginLeft: "4px",
    paddingLeft: "10px",
    display: "flex",
    flexDirection: "column",
  } as CSSProperties,

  row: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
  } as CSSProperties,

  chip: {
    padding: "2px 7px",
    fontSize: "11px",
    color: "#bdbdbd",
    backgroundColor: "transparent",
    border: "1px dashed #4a4a4a",
    borderRadius: "10px",
    cursor: "pointer",
  } as CSSProperties,

  chipRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "4px",
    padding: "3px 0",
  } as CSSProperties,

  iconButton: {
    padding: "0 5px",
    fontSize: "12px",
    lineHeight: "18px",
    color: "#8a8a8a",
    backgroundColor: "transparent",
    border: "1px solid transparent",
    borderRadius: "3px",
    cursor: "pointer",
  } as CSSProperties,

  advanced: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    padding: "5px 8px",
    margin: "2px 0",
    fontSize: "11px",
    color: "#9a9a9a",
    backgroundColor: "#252525",
    border: "1px solid #333",
    borderRadius: "3px",
  } as CSSProperties,

  selectSmall: {
    padding: "3px 6px",
    fontSize: "11px",
    backgroundColor: "#1e1e1e",
    color: "#dedede",
    border: "1px solid #4a4a4a",
    borderRadius: "3px",
    outline: "none",
  } as CSSProperties,

  //#endregion
}
