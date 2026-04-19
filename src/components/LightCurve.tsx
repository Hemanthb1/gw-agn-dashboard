import { useEffect, useState } from "react"
import {
  ScatterChart, Scatter, XAxis, YAxis, Tooltip,
  ResponsiveContainer, ErrorBar, Legend, ReferenceLine
} from "recharts"

interface Detection {
  mjd: number
  magpsf_corr: number | null
  sigmapsf_corr: number | null
  fid: number
}

interface DataPoint {
  mjd: number
  mag: number
  err: number
  filter: string
}

interface LightCurveProps {
  oid: string
  gwMjd: number
}

const filterColors: Record<string, string> = {
  g: "#1D9E75",
  r: "#E24B4A",
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div style={{
      background: "white",
      border: "0.5px solid #ccc",
      borderRadius: 8,
      padding: "8px 12px",
      fontSize: 12,
    }}>
      <div style={{ fontWeight: 500, marginBottom: 4 }}>Filter: {d.filter}-band</div>
      <div style={{ color: "gray" }}>MJD: {d.mjd.toFixed(3)}</div>
      <div style={{ color: "gray" }}>Mag: {d.mag.toFixed(3)} ± {d.err.toFixed(3)}</div>
    </div>
  )
}

export default function LightCurve({ oid, gwMjd }: LightCurveProps) {
  const [gData, setGData] = useState<DataPoint[]>([])
  const [rData, setRData] = useState<DataPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    console.log("Fetching light curve for:", oid)
    setLoading(true)
    setError(null)
    fetch(`https://api.alerce.online/ztf/v1/objects/${oid}/lightcurve`)
      .then(r => r.json())
      .then((data: any) => {
        const detections: Detection[] = data.detections ?? data
        const valid = detections.filter((d: Detection) => d.magpsf_corr !== null && d.sigmapsf_corr !== null)
        const toPoint = (d: Detection): DataPoint => ({
          mjd: d.mjd,
          mag: d.magpsf_corr!,
          err: d.sigmapsf_corr!,
          filter: d.fid === 1 ? "g" : "r",
        })
        setGData(valid.filter(d => d.fid === 1).map(toPoint))
        setRData(valid.filter(d => d.fid === 2).map(toPoint))
        setLoading(false)
      })
      .catch(() => {
        setError("Failed to load light curve")
        setLoading(false)
      })
  }, [oid])

  if (loading) {
    return (
      <div style={{ padding: "16px", fontSize: 13, color: "gray" }}>
        Loading light curve for {oid}...
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: "16px", fontSize: 13, color: "#E24B4A" }}>{error}</div>
    )
  }

  const allMags = [...gData, ...rData].map(d => d.mag)
  const magMin = Math.min(...allMags)
  const magMax = Math.max(...allMags)
  const magPad = (magMax - magMin) * 0.1

  return (
    <div style={{
      background: "white",
      border: "0.5px solid #ccc",
      borderRadius: 12,
      padding: "16px 20px",
      marginBottom: 16,
    }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 12,
      }}>
        <h2 style={{ fontSize: 15, fontWeight: 500, margin: 0 }}>ZTF light curve</h2>
        <a
          href={"https://alerce.online/object/" + oid}
          target="_blank"
          rel="noreferrer"
          style={{ fontSize: 12, color: "#378ADD"
      }}>
          View on ALeRCE
        </a>
      </div>
      <div style={{ fontSize: 12, color: "gray", marginBottom: 12 }}>
        {oid} · {gData.length + rData.length} detections
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 20 }}>
          <XAxis
            dataKey="mjd"
            type="number"
            domain={[
            Math.min(gwMjd, ...[...gData, ...rData].map(d => d.mjd)) - 10,
            Math.max(...[...gData, ...rData].map(d => d.mjd)) + 10
            ]}
        label={{ value: "MJD", position: "insideBottom", offset: -10 }}
            tick={{ fontSize: 11, fill: "gray" }}
        />

          <YAxis
            dataKey="mag"
            type="number"
            domain={[magMax + magPad, magMin - magPad]}
            label={{ value: "Magnitude", angle: -90, position: "insideLeft" }}
            tick={{ fontSize: 11, fill: "gray" }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend verticalAlign="top" height={28} />
          <ReferenceLine x={gwMjd} stroke="#7F77DD" strokeDasharray="4 4" />
          <Scatter
            name="g-band"
            data={gData}
            fill={filterColors.g}
            opacity={0.85}
          >
            <ErrorBar dataKey="err" direction="y" stroke={filterColors.g} strokeWidth={1} opacity={0.5} />
          </Scatter>
          <Scatter
            name="r-band"
            data={rData}
            fill={filterColors.r}
            opacity={0.85}
          >
            <ErrorBar dataKey="err" direction="y" stroke={filterColors.r} strokeWidth={1} opacity={0.5} />
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  )
}