import { useEffect, useState } from "react"
import type { CrossmatchResult } from "../types/events"

interface ToastProps {
  event: CrossmatchResult | null
}

export default function Toast({ event }: ToastProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!event) return
    setVisible(true)
    const t = setTimeout(() => setVisible(false), 3000)
    return () => clearTimeout(t)
  }, [event])

  if (!visible || !event) return null

  const isCritical = event.severity === "critical"

  return (
    <div style={{
      position: "fixed",
      top: 24,
      right: 24,
      zIndex: 1000,
      background: isCritical ? "#FCEBEB" : "#EAF3DE",
      border: `0.5px solid ${isCritical ? "#E24B4A" : "#1D9E75"}`,
      borderRadius: 10,
      padding: "12px 16px",
      width: 280,
    }}>
      <div style={{
        fontSize: 13,
        fontWeight: 500,
        color: isCritical ? "#791F1F" : "#085041",
        marginBottom: 4,
      }}>
        {isCritical ? "Critical alert" : "New event"} — {event.gw_event.graceid}
      </div>
      <div style={{ fontSize: 12, color: isCritical ? "#A32D2D" : "#0F6E56" }}>
        {event.agn_candidate.name} · {(event.probability_overlap * 100).toFixed(0)}% overlap
      </div>
    </div>
  )
}
