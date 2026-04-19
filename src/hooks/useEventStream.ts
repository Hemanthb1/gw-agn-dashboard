import { useState, useEffect, useRef } from "react"
import type { CrossmatchResult } from "../types/events"
import { mockCrossmatches } from "../data/mockData"

interface StreamState {
  events: CrossmatchResult[]
  latest: CrossmatchResult | null
  connected: boolean
}

export function useEventStream() {
  const [state, setState] = useState<StreamState>({
    events: [],
    latest: null,
    connected: false,
  })
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const indexRef = useRef(0)

  useEffect(() => {
    setState(s => ({ ...s, connected: true }))

    intervalRef.current = setInterval(() => {
      const next = mockCrossmatches[indexRef.current % mockCrossmatches.length]
      const newEvent: CrossmatchResult = {
        ...next,
        id: `live-${Date.now()}`,
        created_at: new Date().toISOString(),
      }

      setState(s => ({
        connected: true,
        latest: newEvent,
        events: [newEvent, ...s.events].slice(0, 20),
      }))

      indexRef.current += 1
    }, 3000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  return state
}