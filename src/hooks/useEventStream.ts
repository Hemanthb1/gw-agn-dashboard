import { useState, useEffect, useRef } from "react"
import type { CrossmatchResult } from "../types/events"
import { mockCrossmatches } from "../data/mockData"

interface EPAlert {
  id: string
  graceid: string
  ra: number
  dec: number
  error_radius: number
  flux: number
  trigger_time: string
  created_at: string
}

interface StreamState {
  events: CrossmatchResult[]
  latest: CrossmatchResult | null
  connected: boolean
  epAlerts: EPAlert[]
}

function epToResult(ep: EPAlert): CrossmatchResult {
  return {
    id: ep.id,
    gw_event: {
      id: ep.id,
      graceid: ep.graceid,
      classification: {},
      distanceMean: 0,
      distanceStd: 0,
      skymap_url: "",
      created_at: ep.created_at,
    },
    agn_candidate: {
      id: ep.id,
      name: `EP-${ep.graceid}`,
      ra: ep.ra,
      dec: ep.dec,
      redshift: 0,
      magnitude: 0,
      catalog: "Einstein Probe",
    },
    probability_overlap: ep.flux > 0 ? Math.min(ep.flux / 1e-9, 1.0) : 0.5,
    angular_separation: ep.error_radius,
    severity: ep.flux > 1e-9 ? "high" : "medium",
    flagged: ep.flux > 1e-9,
    created_at: ep.created_at,
  }
}

export function useEventStream() {
  const [state, setState] = useState<StreamState>({
    events: [],
    latest: null,
    connected: false,
    epAlerts: [],
  })
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const mockIndexRef = useRef(0)
  const knownIdsRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    setState(s => ({ ...s, connected: true }))

    // Poll EP alerts every 30 seconds
    async function pollEP() {
      try {
        const res = await fetch("http://localhost:8000/ep_alerts")
        const alerts: EPAlert[] = await res.json()
        const newAlerts = alerts.filter(a => !knownIdsRef.current.has(a.id))
        if (newAlerts.length > 0) {
          newAlerts.forEach(a => knownIdsRef.current.add(a.id))
          const newResults = newAlerts.map(epToResult)
          setState(s => ({
            ...s,
            epAlerts: alerts,
            latest: newResults[0],
            events: [...newResults, ...s.events].slice(0, 20),
          }))
        }
      } catch (e) {
        console.log("EP poll failed:", e)
      }
    }

    pollEP()
    const epInterval = setInterval(pollEP, 30000)

    // Mock stream for demo purposes when no real alerts
    intervalRef.current = setInterval(() => {
      const next = mockCrossmatches[mockIndexRef.current % mockCrossmatches.length]
      const newEvent: CrossmatchResult = {
        ...next,
        id: `live-${Date.now()}`,
        created_at: new Date().toISOString(),
      }
      setState(s => {
        if (s.epAlerts.length > 0) return s
        return {
          ...s,
          latest: newEvent,
          events: [newEvent, ...s.events].slice(0, 20),
        }
      })
      mockIndexRef.current += 1
    }, 3000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      clearInterval(epInterval)
    }
  }, [])

  return state
}
