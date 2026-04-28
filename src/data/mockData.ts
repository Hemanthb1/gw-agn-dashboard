import type { GWEvent, AGNCandidate, CrossmatchResult  } from "../types/events"

export const mockGWEvents: GWEvent[] = [
  {
    id: "1",
    graceid: "S230522a",
    distanceMean: 410,
    distanceStd: 80,
    skymap_url: "",
    created_at: "2023-05-22T14:32:00Z"
  },
  {
    id: "2",
    graceid: "S231130ai",
    distanceMean: 180,
    distanceStd: 40,
    skymap_url: "",
    created_at: "2023-11-30T09:17:00Z"
  },
]

export const mockAGNCandidates: AGNCandidate[] = [
  {
    id: "a1",
    name: "J1234+5678",
    ra: 188.5,
    dec: 56.8,
    redshift: 0.12,
    magnitude: 18.4,
    catalog: "Milliquas"
  },
  {
    id: "a2",
    name: "J0934-2201",
    ra: 143.6,
    dec: -22.0,
    redshift: 0.31,
    magnitude: 19.1,
    catalog: "SDSS"
  },
]

export const mockCrossmatches: CrossmatchResult[] = [
  {
    id: "c1",
    gw_event: mockGWEvents[0],
    agn_candidate: mockAGNCandidates[0],
    probability_overlap: 0.87,
    angular_separation: 12.4,
    severity: "high",
    flagged: true,
    created_at: "2023-05-22T15:00:00Z"
  },
  {
    id: "c2",
    gw_event: mockGWEvents[0],
    agn_candidate: mockAGNCandidates[1],
    probability_overlap: 0.43,
    angular_separation: 34.1,
    severity: "medium",
    flagged: false,
    created_at: "2023-05-22T15:01:00Z"
  },
  {
    id: "c3",
    gw_event: mockGWEvents[1],
    agn_candidate: mockAGNCandidates[0],
    probability_overlap: 0.91,
    angular_separation: 8.2,
    severity: "critical",
    flagged: true,
    created_at: "2023-11-30T09:45:00Z"
  },
]
