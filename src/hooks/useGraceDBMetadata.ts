import { useState, useEffect } from "react"

interface GWMetadata {
  far: number | null
  instruments: string | null
  bbh: number | null
  bns: number | null
  nsbh: number | null
  terrestrial: number | null
  distmean: number | null
  diststd: number | null
  z_mean: number | null
}

export function useGraceDBMetadata(graceid: string) {
  const [metadata, setMetadata] = useState<GWMetadata | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!graceid || graceid === "unknown") {
      setLoading(false)
      return
    }

    async function fetchMetadata() {
      try {
        // Get FAR and classification from superevent API
        const r = await fetch(`https://gracedb.ligo.org/api/superevents/${graceid}/`)
        const data = await r.json()
        const far = data?.preferred_event_data?.far ?? null
        const instruments = data?.preferred_event_data?.instruments ?? null

        // Get classification from XML
        const filesR = await fetch(`https://gracedb.ligo.org/api/superevents/${graceid}/files/`)
        const files = await filesR.json()
        const xmlFiles = Object.keys(files).filter(f => f.endsWith("Update.xml") && !f.includes(","))
        const xmlFile = xmlFiles.length > 0 ? xmlFiles[xmlFiles.length - 1] : null

        let bbh = null, bns = null, nsbh = null, terrestrial = null
        if (xmlFile) {
          const xmlR = await fetch(`https://gracedb.ligo.org/api/superevents/${graceid}/files/${xmlFile}`)
          const xml = await xmlR.text()
          const parser = new DOMParser()
          const doc = parser.parseFromString(xml, "text/xml")
          const params: Record<string, string> = {}
          doc.querySelectorAll("Param").forEach(p => {
            const name = p.getAttribute("name")
            const value = p.getAttribute("value")
            if (name && value) params[name] = value
          })
          bbh = parseFloat(params["BBH"] ?? "0") || null
          bns = parseFloat(params["BNS"] ?? "0") || null
          nsbh = parseFloat(params["NSBH"] ?? "0") || null
          terrestrial = parseFloat(params["Terrestrial"] ?? "0") || null
        }

        setMetadata({ far, instruments, bbh, bns, nsbh, terrestrial, distmean: null, diststd: null, z_mean: null })
      } catch (e) {
        console.log("GraceDB fetch failed:", e)
      } finally {
        setLoading(false)
      }
    }

    fetchMetadata()
  }, [graceid])

  return { metadata, loading }
}