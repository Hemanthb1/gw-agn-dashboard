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
  filtered = filtered.filter(r => r.gw_event.distanceMean <= config.maxDistance)
  filtered = filtered.filter(r => config.catalogs.includes(r.agn_candidate.catalog))
  filtered.sort((a, b) => {
    let diff = 0
    if (filters.sortBy === "probability") diff = a.probability_overlap - b.probability_overlap
    if (filters.sortBy === "separation") diff = a.angular_separation - b.angular_separation
    if (filters.sortBy === "date") diff = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    return filters.sortDir === "desc" ? -diff : diff
  })
  return filtered
}

export default function App() {
  const [results, setResults] = useState<CrossmatchResult[]>([])
  const [filtered, setFiltered] = useState<CrossmatchResult[]>([])
  const [loading, setLoading] = useState(true)
  const [config, setConfig] = useState<WatcherConfig>(defaultConfig)
  const [filters, setFilters] = useState<FilterState>({
    severity: "all",
    flaggedOnly: false,
    sortBy: "probability",
    sortDir: "desc",
  })
  const [showSettings, setShowSettings] = useState(false)
  const [selected, setSelected] = useState<CrossmatchResult | null>(null)

  const { events: liveEvents, latest, connected } = useEventStream()

  useEffect(() => {
  fetch("/final_candidates.csv")
    .then(r => r.text())
    .then(text => {
      const lines = text.trim().split("\n")
      const headers = lines[0].split(",")
      const rows = lines.slice(1).map(line => {
        const values = line.split(",")
        return Object.fromEntries(headers.map((h, i) => [h, values[i]]))
      })
      const results = rows.map((row: any) => ({
        id: crypto.randomUUID(),
        gw_event: {
          id: crypto.randomUUID(),
          graceid: row.event_id ?? "unknown",
          far: 0,
          classification: {},
          distanceMean: 0,
          distanceStd: 0,
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
        },
        probability_overlap: parseFloat(row.probability) || 0,
        angular_separation: parseFloat(row.distpsnr1) || 0,
        severity: parseFloat(row.probability) >= 0.9 ? "critical"
          : parseFloat(row.probability) >= 0.75 ? "high"
          : parseFloat(row.probability) >= 0.5 ? "medium" : "low",
        flagged: parseFloat(row.probability) >= 0.75,
        created_at: new Date().toISOString(),
      }))
      setResults(results as any)
      setFiltered(results as any)
      setLoading(false)
    })
    .catch(err => {
      console.error("Failed to fetch events:", err)
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
    return <DetailView result={selected} onBack={() => setSelected(null)} />
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
      <FilterControls onFilterChange={setFilters} />
      <AlertTable results={filtered} onSelect={setSelected} />
    </div>
  )
}