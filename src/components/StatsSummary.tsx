import type { CrossmatchResult } from "../types/events"

interface StatCardProps {
  label: string
  value: number | string
  color?: string
  bg?: string
}

function StatCard({ label, value, color, bg }: StatCardProps) {
  return (
    <div style={{
      background: bg ?? "var(--color-background-secondary, #f5f5f5)",
      borderRadius: 8,
      padding: "12px 16px",
    }}>
      <div style={{ fontSize: 13, color: color ?? "gray", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 500, color: color ?? "inherit" }}>{value}</div>
    </div>
  )
}

interface StatsSummaryProps {
  results: CrossmatchResult[]
}

export default function StatsSummary({ results }: StatsSummaryProps) {
  const total = results.length
  const flagged = results.filter(r => r.flagged).length
  const critical = results.filter(r => r.severity === "critical").length
  const avgProb = results.reduce((sum, r) => sum + r.probability_overlap, 0) / total

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
      <StatCard label="Total results" value={total} />
      <StatCard label="Flagged" value={flagged} color="#712B13" bg="#FAECE7" />
      <StatCard label="Critical" value={critical} color="#791F1F" bg="#FCEBEB" />
      <StatCard label="Avg probability" value={`${(avgProb * 100).toFixed(0)}%`} />
    </div>
  )
}