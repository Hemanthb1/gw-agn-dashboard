import { useState } from "react"
import type { CrossmatchResult, Severity } from "../types/events"

interface AlertTableProps {
  results: CrossmatchResult[]
  onSelect?: (result: CrossmatchResult) => void
}

const severityColors: Record<Severity, string> = {
  low:      "#EAF3DE",
  medium:   "#FAEEDA",
  high:     "#FAECE7",
  critical: "#FCEBEB",
}

const severityText: Record<Severity, string> = {
  low:      "#27500A",
  medium:   "#633806",
  high:     "#712B13",
  critical: "#791F1F",
}

function SeverityBadge({ severity }: { severity: Severity }) {
  return (
    <span style={{
      background: severityColors[severity],
      color: severityText[severity],
      padding: "2px 10px",
      borderRadius: 4,
      fontSize: 12,
      fontWeight: 500,
    }}>
      {severity}
    </span>
  )
}

export default function AlertTable({ results, onSelect }: AlertTableProps) {
  const [flaggedOnly, setFlaggedOnly] = useState(false)

  const filtered = flaggedOnly
    ? results.filter(r => r.flagged)
    : results

  return (
    <div>
      <div style={{ marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
        <input
          type="checkbox"
          id="flagged"
          checked={flaggedOnly}
          onChange={e => setFlaggedOnly(e.target.checked)}
        />
        <label htmlFor="flagged" style={{ fontSize: 14 }}>Show flagged only</label>
        <span style={{ fontSize: 13, color: "gray", marginLeft: 8 }}>
          {filtered.length} of {results.length} results
        </span>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
        <thead>
          <tr style={{ borderBottom: "1px solid #ccc", textAlign: "left" }}>
            <th style={{ padding: "8px 12px" }}>GW event</th>
            <th style={{ padding: "8px 12px" }}>AGN</th>
            <th style={{ padding: "8px 12px" }}>Probability</th>
            <th style={{ padding: "8px 12px" }}>Separation</th>
            <th style={{ padding: "8px 12px" }}>Severity</th>
            <th style={{ padding: "8px 12px" }}>Flagged</th>
          </tr>
        </thead>
        <tbody>
        {filtered.map(r => (
  <tr
    key={r.id}
    onClick={() => onSelect?.(r)}
    style={{
      borderBottom: "0.5px solid #eee",
      cursor: onSelect ? "pointer" : "default",
    }}
  >
    <td style={{ padding: "8px 12px" }}>{r.gw_event.graceid}</td>
    <td style={{ padding: "8px 12px" }}>{r.agn_candidate.name}</td>
    <td style={{ padding: "8px 12px" }}>{(r.probability_overlap * 100).toFixed(0)}%</td>
    <td style={{ padding: "8px 12px" }}>{r.angular_separation.toFixed(1)}"</td>
    <td style={{ padding: "8px 12px" }}><SeverityBadge severity={r.severity} /></td>
    <td style={{ padding: "8px 12px" }}>{r.flagged ? "Yes" : "—"}</td>
    </tr>
      ))}
        </tbody>
      </table>
    </div>
  )
}