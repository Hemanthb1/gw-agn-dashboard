import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts"
import type { CrossmatchResult } from "../types/events"

interface SkyMapProps {
  results: CrossmatchResult[]
}

interface DataPoint {
  ra: number
  dec: number
  name: string
  severity: string
  probability: number
}

const severityColor: Record<string, string> = {
  low:      "#639922",
  medium:   "#BA7517",
  high:     "#D85A30",
  critical: "#E24B4A",
}

function CustomDot(props: any) {
  const { cx, cy, payload } = props
  return (
    <circle
      cx={cx}
      cy={cy}
      r={payload.probability * 10}
      fill={severityColor[payload.severity]}
      fillOpacity={0.8}
      stroke="none"
    />
  )
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const d: DataPoint = payload[0].payload
  return (
    <div style={{
      background: "white",
      border: "0.5px solid #ccc",
      borderRadius: 8,
      padding: "8px 12px",
      fontSize: 13,
    }}>
      <div style={{ fontWeight: 500, marginBottom: 4 }}>{d.name}</div>
      <div style={{ color: "gray" }}>RA: {d.ra.toFixed(2)}°</div>
      <div style={{ color: "gray" }}>Dec: {d.dec.toFixed(2)}°</div>
      <div style={{ color: "gray" }}>Probability: {(d.probability * 100).toFixed(0)}%</div>
      <div style={{ color: severityColor[d.severity], fontWeight: 500 }}>{d.severity}</div>
    </div>
  )
}

export default function SkyMap({ results }: SkyMapProps) {
  const data: DataPoint[] = results.map(r => ({
    ra: r.agn_candidate.ra,
    dec: r.agn_candidate.dec,
    name: r.agn_candidate.name,
    severity: r.severity,
    probability: r.probability_overlap,
  }))

  return (
    <div style={{
      background: "#0a0a1a",
      borderRadius: 12,
      padding: "16px",
      marginBottom: 24,
    }}>
      <div style={{ color: "white", fontSize: 14, fontWeight: 500, marginBottom: 12 }}>
        Sky map — AGN candidates
      </div>
      <div style={{ color: "#888", fontSize: 12, marginBottom: 16 }}>
        Dot size = overlap probability · Color = severity
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 20 }}>
          <XAxis
            dataKey="ra"
            type="number"
            domain={[0, 360]}
            tickCount={7}
            label={{ value: "RA (°)", position: "insideBottom", offset: -10, fill: "#888", fontSize: 12 }}
            tick={{ fill: "#888", fontSize: 11 }}
          />
          <YAxis
            dataKey="dec"
            type="number"
            domain={[-90, 90]}
            tickCount={7}
            label={{ value: "Dec (°)", angle: -90, position: "insideLeft", fill: "#888", fontSize: 12 }}
            tick={{ fill: "#888", fontSize: 11 }}
          />
          <ReferenceLine y={0} stroke="#333" strokeDasharray="4 4" />
          <Tooltip content={<CustomTooltip />} isAnimationActive={false}/>
          <Scatter data={data} shape={<CustomDot />} />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  )
}