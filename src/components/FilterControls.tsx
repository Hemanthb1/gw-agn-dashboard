import { useReducer } from "react"
import type { Severity } from "../types/events"

export interface FilterState {
  severity: Severity | "all"
  flaggedOnly: boolean
  sortBy: "ndet" | "severity" | "separation" | "date"
  sortDir: "asc" | "desc"
}

type FilterAction =
  | { type: "SET_SEVERITY"; payload: Severity | "all" }
  | { type: "TOGGLE_FLAGGED" }
  | { type: "SET_SORT"; payload: FilterState["sortBy"] }
  | { type: "TOGGLE_SORT_DIR" }
  | { type: "RESET" }

const initialState: FilterState = {
  severity: "all",
  flaggedOnly: false,
  sortBy: "severity",
  sortDir: "desc",
}

function filterReducer(state: FilterState, action: FilterAction): FilterState {
  switch (action.type) {
    case "SET_SEVERITY":
      return { ...state, severity: action.payload }
    case "TOGGLE_FLAGGED":
      return { ...state, flaggedOnly: !state.flaggedOnly }
    case "SET_SORT":
      return { ...state, sortBy: action.payload }
    case "TOGGLE_SORT_DIR":
      return { ...state, sortDir: state.sortDir === "asc" ? "desc" : "asc" }
    case "RESET":
      return initialState
    default:
      return state
  }
}

interface FilterControlsProps {
  onFilterChange: (state: FilterState) => void
}

export default function FilterControls({ onFilterChange }: FilterControlsProps) {
  const [state, dispatch] = useReducer(filterReducer, initialState)

  function handle(action: FilterAction) {
    const next = filterReducer(state, action)
    dispatch(action)
    onFilterChange(next)
  }

  return (
    <div style={{
      display: "flex",
      gap: 12,
      alignItems: "center",
      flexWrap: "wrap",
      marginBottom: 16,
      padding: "12px 16px",
      background: "var(--color-background-secondary, #f5f5f5)",
      borderRadius: 8,
      fontSize: 13,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <label>Severity:</label>
        <select
          value={state.severity}
          onChange={e => handle({ type: "SET_SEVERITY", payload: e.target.value as Severity | "all" })}
        >
          <option value="all">All</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <input
          type="checkbox"
          id="flagged2"
          checked={state.flaggedOnly}
          onChange={() => handle({ type: "TOGGLE_FLAGGED" })}
        />
        <label htmlFor="flagged2">Flagged only</label>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <label>Sort by:</label>
        <select
          value={state.sortBy}
          onChange={e => handle({ type: "SET_SORT", payload: e.target.value as FilterState["sortBy"] })}
        >
          <option value="severity">Severity</option>
          <option value="ndet">Detections</option>
          <option value="separation">Separation</option>
          <option value="date">Date</option>
        </select>
        <button onClick={() => handle({ type: "TOGGLE_SORT_DIR" })}>
          {state.sortDir === "desc" ? "↓" : "↑"}
        </button>
      </div>

      <button onClick={() => handle({ type: "RESET" })}>Reset</button>
    </div>
  )
}