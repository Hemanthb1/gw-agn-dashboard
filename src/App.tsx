import { useState, useEffect } from "react"
import AlertTable from "./components/AlertTable"
import StatsSummary from "./components/StatsSummary"
import SkyMap from "./components/SkyMap"
import FilterControls from "./components/FilterControls"
import SettingsPanel from "./components/SettingsPanel"
import LiveFeed from "./components/LiveFeed"
import Toast from "./components/Toast"
import DetailView from "./components/DetailView"
import { useEventStream } from "./hooks/useEventStream"
import type { CrossmatchResult } from "./types/events"
import type { FilterState } from "./components/FilterControls"
import type { WatcherConfig } from "./components/SettingsPanel"
import SkymapOverlay from "./components/SkymapOverlay"

const defaultConfig: WatcherConfig = {
  probabilityThreshold: 0.5,
  maxDistance: 500,
  catalogs: ["ALeRCE", "ALeRCE/Milliquas"],
  alertEmail: "",
}

function applyFilters(results: CrossmatchResult[], filters: FilterState, config: WatcherConfig): CrossmatchResult[] {
  let filtered = [...results]
  if (filters.severity !== "all") filtered = filtered.filter(r => r.severity === filters.severity)
  if (filters.flaggedOnly) filtered = filtered.filter(r => r.flagged)
  filtered = filtered.filter(r => r.probability_overlap >= config.probabilityThreshold)
  filtered = filtered.filter(r => config.catalogs.includes(r.agn_candidate.catalog))
  const severityOrder: Record<string, number> = { low: 0, medium: 1, high: 2, critical: 3 }
  filtered.sort((a, b) => {
    let diff = 0
    if (filters.sortBy === "severity") diff = severityOrder[a.severity] - severityOrder[b.severity]
    if (filters.sortBy === "ndet") diff = (a.agn_candidate.ndet ?? 0) - (b.agn_candidate.ndet ?? 0)
    if (filters.sortBy === "separation") diff = a.angular_separation - b.angular_separation
    if (filters.sortBy === "date") diff = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    return filters.sortDir === "desc" ? -diff : diff
  })
  return filtered
}

function parseCSV(text: string) {
  const lines = text.trim().split("\n")
  const headers = lines[0].split(",")
  return lines.slice(1).map(line => {
    const values = line.split(",")
    return Object.fromEntries(headers.map((h, i) => [h, values[i]]))
  })
}

export default function App() {
  const [results, setResults] = useState<CrossmatchResult[]>([])
  const [filtered, setFiltered] = useState<CrossmatchResult[]>([])
  const [loading, setLoading] = useState(true)
  const [skymapMeta, setSkymapMeta] = useState<Record<string, any>>({})
  const [config, setConfig] = useState<WatcherConfig>(defaultConfig)
  const [filters, setFilters] = useState<FilterState>({
    severity: "all",
    flaggedOnly: false,
    sortBy: "severity",
    sortDir: "desc",
  })
  const [showSettings, setShowSettings] = useState(false)
  const [selected, setSelected] = useState<CrossmatchResult | null>(null)

  const { events: liveEvents, latest, connected } = useEventStream()

  useEffect(() => {
    Promise.all([
      fetch("/final_candidates.csv").then(r => r.text()),
      fetch("/skymaps.csv").then(r => r.text())
    ]).then(([candidatesText, skymapsText]) => {
      // Parse skymap metadata
      const skymapRows = parseCSV(skymapsText)
      const meta: Record<string, any> = {}
      skymapRows.forEach((row: any) => {
        const eid = row.event_id?.trim()
        if (eid && !meta[eid]) {
          meta[eid] = {
            distmean: parseFloat(row.distmean) || 0,
            diststd: parseFloat(row.diststd) || 0,
            z_min: parseFloat(row.z_min) || 0,
            z_max: parseFloat(row.z_max) || 0,
          }
        }
      })
      setSkymapMeta(meta)
      console.log("Meta keys:", Object.keys(meta))
      console.log("S251031cq meta:", meta["S251031cq"])

      // Parse candidates with metadata
      const rows = parseCSV(candidatesText)
      const results = rows.map((row: any) => {
        const graceid = row.event_id ?? "unknown"
        const eventMeta = meta[graceid] ?? {}
        const prob = parseFloat(row.probability) || 0
        const ndet = parseInt(row.ndet) || 0
        const firstmjd = parseFloat(row.firstmjd) || 0
        const mjd_obs = parseFloat(row.mjd_obs) || 0
        const days_after = firstmjd - mjd_obs
        const ndet_score = Math.min(ndet / 20, 1)
        const timing_score = Math.max(0, 1 - days_after / 365)
        const score = (prob * 0.4) + (ndet_score * 0.3) + (timing_score * 0.3)
        const severity = score >= 0.8 ? "critical"
          : score >= 0.6 ? "high"
          : score >= 0.4 ? "medium" : "low"

        return {
          id: crypto.randomUUID(),
          gw_event: {
            id: crypto.randomUUID(),
            graceid,
            far: 0,
            classification: {},
            distanceMean: eventMeta.distmean ?? 0,
            distanceStd: eventMeta.diststd ?? 0,
            z_min: eventMeta.z_min ?? 0,
            z_max: eventMeta.z_max ?? 0,
            skymap_url: row.event_url ?? "",
            mjd_obs: parseFloat(row.mjd_obs) || undefined,
            created_at: new Date().toISOString(),
          },
          agn_candidate: {
            id: crypto.randomUUID(),
            name: row.oid ?? row.oid_x ?? "unknown",
            ra: parseFloat(row.meanra) || 0,
            dec: parseFloat(row.meandec) || 0,
            redshift: parseFloat(row.z) || 0,
            magnitude: parseFloat(row.magpsf) || 0,
            catalog: "ALeRCE/Milliquas",
            agn_name: row.agn ?? null,
            agnsep: parseFloat(row.agnsep) || null,
            ndet: parseInt(row.ndet) || undefined,
          },
          probability_overlap: prob,
          angular_separation: parseFloat(row.distpsnr1) || 0,
          severity,
          flagged: score >= 0.6,
          created_at: new Date().toISOString(),
        }
      })
      setResults(results as any)
      setFiltered(results as any)
      setLoading(false)
    }).catch(err => {
      console.error("Failed to fetch data:", err)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    setFiltered(applyFilters(results, filters, config))
  }, [results, filters, config])

  if (loading) {
    return <div style={{ padding: 24 }}>Loading events...</div>
  }

  if (selected) {
    return (
      <DetailView
        result={selected}
        onBack={() => setSelected(null)}
        allResults={results}
        onSelect={setSelected}
      />
    )
  }

  return (
    <div style={{ padding: "24px", position: "relative" }}>
      <Toast event={latest} />

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <h1 style={{ margin: 0 }}>GW-AGN Watcher</h1>
        <button
          onClick={() => setShowSettings(s => !s)}
          style={{
            padding: "6px 16px",
            borderRadius: 6,
            border: "0.5px solid #ccc",
            background: "none",
            fontSize: 13,
            cursor: "pointer",
          }}
        >
          {showSettings ? "Hide settings" : "Settings"}
        </button>
      </div>

      {showSettings && (
        <SettingsPanel
          config={config}
          onSave={c => { setConfig(c); setShowSettings(false) }}
        />
      )}

      <StatsSummary results={results} />
      <LiveFeed events={liveEvents} connected={connected} />
      <SkyMap results={filtered} />
      <SkymapOverlay results={results} />
      <FilterControls onFilterChange={setFilters} />
      <AlertTable results={filtered} onSelect={setSelected} />
    </div>
  )
}