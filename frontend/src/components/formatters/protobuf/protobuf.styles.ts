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

  changeButton: {
    marginLeft: "8px",
    padding: "3px 8px",
    fontSize: "11px",
    color: "#dedede",
    backgroundColor: "#393939",
    border: "1px solid #4a4a4a",
    borderRadius: "3px",
    cursor: "pointer",
  } as CSSProperties,

  controls: {
    padding: "8px 12px",
    borderBottom: "1px solid #333",
    backgroundColor: "#2a2a2a",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
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
    fontSize: '12px',
    fontStyle: 'italic',
    color: '#999',
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
    marginTop: '8px',
    fontSize: '11px',
    color: '#999',
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
    backgroundColor: "#1e1e1e",
  } as CSSProperties,

  button: {
    padding: '4px 10px',
    fontSize: '12px',
    cursor: 'pointer',
    backgroundColor: '#393939',
    color: '#dedede',
    border: '1px solid #4a4a4a',
    borderRadius: '3px',
  } as CSSProperties,

  buttonSmall: {
    padding: '3px 8px',
    fontSize: '11px',
    cursor: 'pointer',
    backgroundColor: '#393939',
    color: '#dedede',
    border: '1px solid #4a4a4a',
    borderRadius: '3px',
  } as CSSProperties,

  select: {
    padding: '4px 8px',
    fontSize: '12px',
    backgroundColor: '#1e1e1e',
    color: '#dedede',
    border: '1px solid #4a4a4a',
    borderRadius: '3px',
    minWidth: '180px',
    outline: 'none',
  } as CSSProperties,

  noSchemasMessage: {
    color: '#999',
    fontStyle: 'italic',
    fontSize: '12px',
  } as CSSProperties,
}