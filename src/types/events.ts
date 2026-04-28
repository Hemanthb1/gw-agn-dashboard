export type Severity = "low" | "medium" | "high" | "critical"

export interface GWEvent {
  id: string
  graceid: string
  distanceMean: number
  distanceStd: number
  z_min?: number
  z_max?: number
  skymap_url: string
  mjd_obs?: number
  created_at: string
}

export interface AGNCandidate {
  id: string
  name: string
  ra: number
  dec: number
  redshift: number
  magnitude: number
  catalog: string
  agn_name?: string
  agnsep?: number
  ndet?: number
}

export interface CrossmatchResult {
  id: string
  gw_event: GWEvent
  agn_candidate: AGNCandidate
  probability_overlap: number
  angular_separation: number
  severity: Severity
  flagged: boolean
  created_at: string
}