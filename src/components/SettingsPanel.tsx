import { useState } from "react"

export interface WatcherConfig {
  probabilityThreshold: number
  maxDistance: number
  catalogs: string[]
  alertEmail: string
}

interface SettingsPanelProps {
  config: WatcherConfig
  onSave: (config: WatcherConfig) => void
}

const availableCatalogs = ["ALeRCE","Milliquas", "SDSS", "2MASS", "WISE", "Gaia"]

export default function SettingsPanel({ config, onSave }: SettingsPanelProps) {
  const [local, setLocal] = useState<WatcherConfig>(config)
  const [saved, setSaved] = useState(false)

  function toggleCatalog(catalog: string) {
    const exists = local.catalogs.includes(catalog)
    setLocal({
      ...local,
      catalogs: exists
        ? local.catalogs.filter(c => c !== catalog)
        : [...local.catalogs, catalog]
    })
    setSaved(false)
  }

  function handleSave() {
    onSave(local)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div style={{
      background: "var(--color-background-primary, white)",
      border: "0.5px solid #ccc",
      borderRadius: 12,
      padding: "20px 24px",
      marginBottom: 24,
    }}>
      <h2 style={{ fontSize: 16, fontWeight: 500, marginBottom: 20 }}>Watcher config</h2>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        <div>
          <label style={{ fontSize: 13, color: "gray", display: "block", marginBottom: 6 }}>
            Probability threshold — {(local.probabilityThreshold * 100).toFixed(0)}%
          </label>
          <input
            type="range"
            min={0} max={1} step={0.01}
            value={local.probabilityThreshold}
            onChange={e => { setLocal({ ...local, probabilityThreshold: parseFloat(e.target.value) }); setSaved(false) }}
            style={{ width: "100%" }}
          />
        </div>

        <div>
          <label style={{ fontSize: 13, color: "gray", display: "block", marginBottom: 6 }}>
            Max distance — {local.maxDistance} Mpc
          </label>
          <input
            type="range"
            min={100} max={2000} step={50}
            value={local.maxDistance}
            onChange={e => { setLocal({ ...local, maxDistance: parseInt(e.target.value) }); setSaved(false) }}
            style={{ width: "100%" }}
          />
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={{ fontSize: 13, color: "gray", display: "block", marginBottom: 8 }}>
          AGN catalogs
        </label>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {availableCatalogs.map(catalog => (
            <button
              key={catalog}
              onClick={() => toggleCatalog(catalog)}
              style={{
                padding: "4px 12px",
                borderRadius: 4,
                fontSize: 13,
                border: "0.5px solid #ccc",
                background: local.catalogs.includes(catalog) ? "#E6F1FB" : "white",
                color: local.catalogs.includes(catalog) ? "#0C447C" : "gray",
                cursor: "pointer",
              }}
            >
              {catalog}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={{ fontSize: 13, color: "gray", display: "block", marginBottom: 6 }}>
          Alert email
        </label>
        <input
          type="email"
          value={local.alertEmail}
          onChange={e => { setLocal({ ...local, alertEmail: e.target.value }); setSaved(false) }}
          style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: "0.5px solid #ccc", fontSize: 13 }}
          placeholder="you@observatory.edu"
        />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button
          onClick={handleSave}
          style={{
            padding: "8px 20px",
            borderRadius: 6,
            border: "0.5px solid #378ADD",
            background: "#E6F1FB",
            color: "#0C447C",
            fontSize: 13,
            cursor: "pointer",
            fontWeight: 500,
          }}
        >
          Save config
        </button>
        {saved && <span style={{ fontSize: 13, color: "#27500A" }}>Saved</span>}
      </div>
    </div>
  )
}