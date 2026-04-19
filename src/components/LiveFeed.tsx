import { useEffect, useRef } from "react"
import type { CrossmatchResult } from "../types/events"

interface LiveFeedProps {
  events: CrossmatchResult[]
  connected: boolean
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

export default function LiveFeed({ events, connected }: LiveFeedProps) {
  const feedRef = useRef<HTMLDivElement>(null)

useEffect(() => {
  if (feedRef.current) {
    feedRef.current.scrollTop = feedRef.current.scrollHeight
  }
}, [events])
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
        gap: 8,
        marginBottom: 12,
      }}>
        <div style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: connected ? "#1D9E75" : "#E24B4A",
        }} />
        <span style={{ color: "white", fontSize: 14, fontWeight: 500 }}>
          Live event stream
        </span>
        <span style={{ color: "#888", fontSize: 12, marginLeft: 4 }}>
          {connected ? "connected · new event every 3s" : "disconnected"}
        </span>
      </div>

      <div
      ref={feedRef}
      style={{
      height: 240,
      overflowY: "auto",
      display: "flex",
      flexDirection: "column",
      gap: 6,
      }}
>
        {events.length === 0 && (
          <div style={{ color: "#888", fontSize: 13, padding: "8px 0" }}>
            Waiting for events...
          </div>
        )}
        {events.map(event => (
          <div
            key={event.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 12px",
              background: "#12121f",
              borderRadius: 6,
              fontSize: 13,
            }}
          >
            <span style={{
              background: severityBg[event.severity],
              color: severityColor[event.severity],
              padding: "2px 8px",
              borderRadius: 4,
              fontSize: 11,
              fontWeight: 500,
              flexShrink: 0,
            }}>
              {event.severity}
            </span>
            <span style={{ color: "white", fontWeight: 500 }}>
              {event.gw_event.graceid}
            </span>
            <span style={{ color: "#888" }}>
            {event.agn_candidate.name}
            </span>
            {event.agn_candidate.catalog === "Einstein Probe" && (
            <span style={{
             background: "#FAEEDA",
            color: "#633806",
            padding: "2px 6px",
            borderRadius: 4,
            fontSize: 11,
            fontWeight: 500,
            flexShrink: 0,
            }}>
                EP
            </span>
            )}
            <span style={{ color: "#1D9E75", marginLeft: "auto", flexShrink: 0 }}>
              {(event.probability_overlap * 100).toFixed(0)}%
            </span>
            <span style={{ color: "#555", fontSize: 11, flexShrink: 0 }}>
              {new Date(event.created_at).toLocaleTimeString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}