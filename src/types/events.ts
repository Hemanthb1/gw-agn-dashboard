export type Severity = "low" | "medium" | "high" | "critical"

export interface GWEvent {
  id: string
  graceid: string
  far: number
  classification: {
    BBH?: number
    BNS?: number
    NSBH?: number
    Terrestrial?: number
  }
  distanceMean: number
  distanceStd: number
  skymap_url: string
  created_at: string
  mjd_obs?: number
}

export interface AGNCandidate {
  id: string
  name: string
  ra: number
  dec: number
  redshift: number
  magnitude: number
  catalog: string
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