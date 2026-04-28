import type { CrossmatchResult } from "../types/events"
import LightCurve from "./LightCurve"

interface DetailViewProps {
  result: CrossmatchResult
  onBack: () => void
  allResults?: CrossmatchResult[]
  onSelect?: (result: CrossmatchResult) => void
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: "var(--color-background-primary, white)",
      border: "0.5px solid #ccc",
      borderRadius: 12,
      padding: "16px 20px",
      marginBottom: 16,
    }}>
      <h2 style={{ fontSize: 15, fontWeight: 500, marginBottom: 16, marginTop: 0 }}>{title}</h2>
      {children}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string | number | null | undefined }) {
  if (value === null || value === undefined) return null
  return (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      padding: "6px 0",
      borderBottom: "0.5px solid #eee",
      fontSize: 14,
    }}>
      <span style={{ color: "gray" }}>{label}</span>
      <span style={{ fontWeight: 500 }}>{value}</span>
    </div>
  )
}

const severityColor: Record<string, string> = {
  low:      "#27500A",
  medium:   "#633806",
  high:     "#712B13",
  critical: "#791F1F",
}

const severityBg: Record<string, string> = {
  low:      "#EAF3DE",
  medium:   "#FAEEDA",
  high:     "#FAECE7",
  critical: "#FCEBEB",
}

export default function DetailView({ result, onBack, allResults = [], onSelect }: DetailViewProps) {
  const { gw_event, agn_candidate } = result
 


  const siblings = allResults.filter(
    r => r.gw_event.graceid === result.gw_event.graceid && r.id !== result.id
  )

  return (
    <div style={{ padding: "24px" }}>
      <button
        onClick={onBack}
        style={{
          background: "none",
          border: "0.5px solid #ccc",
          borderRadius: 6,
          padding: "6px 14px",
          fontSize: 13,
          cursor: "pointer",
          marginBottom: 16,
        }}
      >
        ← Back to dashboard
      </button>

      {siblings.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: "gray", marginBottom: 8 }}>
            Other candidates for {gw_event.graceid}:
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {siblings.map(r => (
              <button
                key={r.id}
                onClick={() => onSelect?.(r)}
                style={{
                  padding: "4px 12px",
                  borderRadius: 6,
                  border: "0.5px solid #ccc",
                  background: "none",
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                {r.agn_candidate.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 22 }}>{gw_event.graceid} × {agn_candidate.name}</h1>
        <span style={{
          background: severityBg[result.severity],
          color: severityColor[result.severity],
          padding: "4px 12px",
          borderRadius: 4,
          fontSize: 13,
          fontWeight: 500,
        }}>
          {result.severity}
        </span>
        {result.flagged && (
          <span style={{
            background: "#FCEBEB",
            color: "#791F1F",
            padding: "4px 12px",
            borderRadius: 4,
            fontSize: 13,
            fontWeight: 500,
          }}>
            Flagged
          </span>
        )}
      </div>

      <Section title="Crossmatch result">
        <Row label="Overlap probability" value={`${(result.probability_overlap * 100).toFixed(0)}%`} />
        <Row label="Angular separation" value={`${result.angular_separation.toFixed(1)} arcsec`} />
        <Row label="Detected at" value={new Date(result.created_at).toLocaleString()} />
      </Section>

      <Section title="GW event">
        <Row label="GraceID" value={gw_event.graceid} />
        <Row label="Distance" value={gw_event.distanceMean > 0 ? `${gw_event.distanceMean.toFixed(0)} ± ${gw_event.distanceStd.toFixed(0)} Mpc` : "—"} />
        <Row label="Redshift range" value={gw_event.z_min && gw_event.z_max ? `${gw_event.z_min.toFixed(3)} – ${gw_event.z_max.toFixed(3)}` : "—"} />
      
      
    </Section>

      <Section title="AGN candidate">
        <Row label="ZTF ID" value={agn_candidate.name} />
        <Row label="Milliquas name" value={agn_candidate.agn_name ?? "—"} />
        <Row label="RA" value={`${agn_candidate.ra.toFixed(4)}°`} />
        <Row label="Dec" value={`${agn_candidate.dec.toFixed(4)}°`} />
        <Row label="Redshift" value={agn_candidate.redshift > 0 ? agn_candidate.redshift.toFixed(3) : "—"} />
        <Row label="Magnitude (g)" value={agn_candidate.magnitude.toFixed(2)} />
        <Row label="Milliquas separation" value={agn_candidate.agnsep ? `${(agn_candidate.agnsep * 3600).toFixed(1)}"` : "—"} />
        <Row label="Catalog" value={agn_candidate.catalog} />
      </Section>

      <LightCurve oid={agn_candidate.name} gwMjd={gw_event.mjd_obs ?? 0} />
    </div>
  )
}