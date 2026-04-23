import { useState, useEffect, useMemo } from "react"
import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, ZAxis } from "recharts"
import type { CrossmatchResult } from "../types/events"

interface SkymapPixel {
  ra: number
  dec: number
  prob: number
  event_id: string
}

interface SkymapOverlayProps {
  results: CrossmatchResult[]
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  if (d.type === "agn") {
    return (
      <div style={{
        background: "white",
        border: "0.5px solid #ccc",
        borderRadius: 8,
        padding: "8px 12px",
        fontSize: 12,
      }}>
        <div style={{ fontWeight: 500, marginBottom: 4 }}>{d.name}</div>
        <div style={{ color: "gray" }}>RA: {d.ra.toFixed(4)}°</div>
        <div style={{ color: "gray" }}>Dec: {d.dec.toFixed(4)}°</div>
        <div style={{ color: "gray" }}>Prob: {(d.prob * 100).toFixed(1)}%</div>
        <div style={{ color: "gray" }}>AGN: {d.agn_name ?? "—"}</div>
        <div style={{ color: "gray" }}>z: {d.redshift > 0 ? d.redshift.toFixed(3) : "—"}</div>
      </div>
    )
  }
  return (
    <div style={{
      background: "#0a0a1a",
      border: "0.5px solid #333",
      borderRadius: 8,
      padding: "8px 12px",
      fontSize: 12,
      color: "white",
    }}>
      <div>RA: {Number(d.ra).toFixed(4)}°</div>
      <div>Dec: {Number(d.dec).toFixed(4)}°</div>
      <div>Prob: {(Number(d.prob) * 100).toFixed(2)}%</div>
    </div>
  )
}

export default function SkymapOverlay({ results }: SkymapOverlayProps) {
  const [pixels, setPixels] = useState<SkymapPixel[]>([])
  const [selectedEvent, setSelectedEvent] = useState<string>("")
  const [loading, setLoading] = useState(true)

  const uniqueEvents = useMemo(() => {
  const events = [...new Set(pixels.map(p => p.event_id))]
  return events
}, [pixels])

  useEffect(() => {
    if (uniqueEvents.length > 0 && !selectedEvent) {
      setSelectedEvent(uniqueEvents[0])
    }
  }, [uniqueEvents])

  useEffect(() => {
    setLoading(true)
    fetch("/skymaps.csv")
      .then(r => r.text())
      .then(text => {
        const lines = text.trim().split("\n")
        const headers = lines[0].split(",")
        const raIdx = headers.indexOf("meanra")
        const decIdx = headers.indexOf("meandec")
        const probIdx = headers.indexOf("prob_contour")
        const eventIdx = headers.indexOf("event_id")
        console.log("Indices:", raIdx, decIdx, probIdx, eventIdx)
        console.log("Sample line:", lines[1])
        console.log("Sample vals:", lines[1].split(","))

        const parsed: SkymapPixel[] = lines.slice(1).map(line => {
          const vals = line.split(",")
          return {
            ra: parseFloat(vals[raIdx]),
            dec: parseFloat(vals[decIdx]),
            prob: parseFloat(vals[probIdx]),
            event_id: vals[eventIdx]?.trim(),
          }
        }).filter(p => !isNaN(p.ra) && !isNaN(p.dec))
        console.log("Total pixels parsed:", parsed.length)
        console.log("Sample pixel:", parsed[0])
        console.log("Unique events:", [...new Set(parsed.map(p => p.event_id))])

        setPixels(parsed)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const filteredPixels = useMemo(() => {
    const eventPixels = pixels.filter(p => p.event_id === selectedEvent)
    if (eventPixels.length <= 2000) return eventPixels
    const step = Math.ceil(eventPixels.length / 2000)
    return eventPixels.filter((_, i) => i % step === 0)
  }, [pixels, selectedEvent])

  const candidatesForEvent = useMemo(() => {
    return results
      .filter(r => r.gw_event.graceid === selectedEvent)
      .map(r => ({
        ra: r.agn_candidate.ra,
        dec: r.agn_candidate.dec,
        prob: r.probability_overlap,
        name: r.agn_candidate.name,
        agn_name: r.agn_candidate.agn_name,
        redshift: r.agn_candidate.redshift,
        type: "agn",
      }))
  }, [results, selectedEvent])

  const raValues = filteredPixels.map(p => p.ra)
  const decValues = filteredPixels.map(p => p.dec)
  const raMin = Math.min(...raValues) - 2
  const raMax = Math.max(...raValues) + 2
  const decMin = Math.min(...decValues) - 2
  const decMax = Math.max(...decValues) + 2

  if (loading) {
    return (
      <div style={{ padding: 16, fontSize: 13, color: "gray" }}>
        Loading skymap data...
      </div>
    )
  }

  return (
    <div style={{
      background: "#0a0a1a",
      borderRadius: 12,
      padding: "16px",
      marginBottom: 24,
    }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 12,
      }}>
        <div style={{ color: "white", fontSize: 14, fontWeight: 500 }}>
          GW skymap — probability contours
        </div>
        <select
          value={selectedEvent}
          onChange={e => setSelectedEvent(e.target.value)}
          style={{
            background: "#12121f",
            color: "white",
            border: "0.5px solid #333",
            borderRadius: 6,
            padding: "4px 8px",
            fontSize: 12,
          }}
        >
          {uniqueEvents.map(e => (
            <option key={e} value={e}>{e}</option>
          ))}
        </select>
      </div>

      <div style={{ color: "#888", fontSize: 12, marginBottom: 12 }}>
        {filteredPixels.length} pixels · {candidatesForEvent.length} AGN candidates
      </div>

      <ResponsiveContainer width="100%" height={350}>
        <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 20 }}>
          <XAxis
            dataKey="ra"
            type="number"
            domain={[raMax, raMin]}
            tick={{ fontSize: 11, fill: "#888" }}
            label={{ value: "RA (°)", position: "insideBottom", offset: -10, fill: "#888" }}
            tickFormatter={v => Math.round(v).toString()}
          />
          <YAxis
            dataKey="dec"
            type="number"
            domain={[decMin, decMax]}
            tick={{ fontSize: 11, fill: "#888" }}
            label={{ value: "Dec (°)", angle: -90, position: "insideLeft", fill: "#888" }}
            tickFormatter={v => Math.round(v).toString()}
          />
          <ZAxis range={[4, 4]} />
          <Tooltip content={<CustomTooltip />} />
          <Scatter
            name="Skymap"
            data={filteredPixels}
             shape={(props: any) => {
             const { cx, cy, payload } = props
             const prob = payload.prob
             const r = 3
            const color = prob > 0.95 ? "#E24B4A"
             : prob > 0.9 ? "#EF9F27"
             : prob > 0.7 ? "#FAC775"
            : prob > 0.4 ? "#85B7EB"
            : "#378ADD"
            return <circle cx={cx} cy={cy} r={r} fill={color} opacity={0.6} />
         }}
        />
          <Scatter
            name="AGN candidates"
            data={candidatesForEvent}
            fill="#E24B4A"
            opacity={1}
            r={6}
          />
        </ScatterChart>
      </ResponsiveContainer>

      {candidatesForEvent.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <div style={{ color: "#888", fontSize: 12, marginBottom: 8 }}>
            AGN candidates for {selectedEvent}
          </div>
          {candidatesForEvent.map((c, i) => (
            <div key={i} style={{
              display: "flex",
              gap: 12,
              padding: "6px 0",
              borderBottom: "0.5px solid #1a1a2e",
              fontSize: 12,
            }}>
              <span style={{ color: "#E24B4A", fontWeight: 500, minWidth: 120 }}>{c.name}</span>
              <span style={{ color: "#888" }}>RA: {c.ra.toFixed(4)}°</span>
              <span style={{ color: "#888" }}>Dec: {c.dec.toFixed(4)}°</span>
              <span style={{ color: "#1D9E75" }}>Prob: {(c.prob * 100).toFixed(1)}%</span>
              {c.agn_name && <span style={{ color: "#7F77DD" }}>{c.agn_name}</span>}
              {c.redshift > 0 && <span style={{ color: "#888" }}>z={c.redshift.toFixed(3)}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}