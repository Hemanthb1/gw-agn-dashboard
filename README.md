# GW-AGN Watcher Dashboard

A real-time dashboard for gravitational wave follow-up, crossmatching LIGO/Virgo GW events with AGN candidates from ZTF/ALeRCE.

**Live demo:** https://gw-agn-dashboard.vercel.app

## Screenshots

### Main Dashboard
![Main Dashboard](public/dashboard-main.png)

### GW Skymap with Probability Contours
![Skymap](public/dashboard-skymap.png)

### Candidate Detail View with ZTF Light Curve
![Detail View](public/dashboard-detail.png)

## What it does

When LIGO detects a gravitational wave event, one of the leading candidate sources is an AGN (Active Galactic Nucleus) — a supermassive black hole system that could contain merging black holes that could emit in both GW and electromagnetic emission. This tool automatically:

1. Downloads GW skymaps from GraceDB
2. Queries the ALeRCE broker for ZTF transients within the GW localization region
3. Crossmatches candidates against the Milliquas AGN catalog
4. Ranks candidates by overlap probability, redshift, and light curve behavior
5. Displays results in an interactive dashboard with live ZTF light curves

## Features

- Live alert dashboard with severity ranking based on AGN probability, detection count, and timing
- ZTF g-band and r-band light curves with GW trigger time marker
- GW skymap probability contour overlay with event selector
- Filter by severity, detection count, and separation
- Real-time Einstein Probe and Fermi GBM alerts via GCN Kafka
- Clickable detail view with GW event metadata from GraceDB
- Sibling candidate navigation within same GW event
- Settings panel for pipeline configuration

## Tech stack

- **Pipeline:** Python — `ligo.skymap`, `astropy`, ALeRCE broker, Milliquas catalog
- **Backend:** FastAPI REST API with `/events`, `/run_pipeline`, `/pipeline_status` endpoints
- **Frontend:** React + TypeScript, Recharts, Vite
- **Alerts:** GCN Kafka consumer for Einstein Probe WXT + Fermi GBM
- **Deployment:** Vercel (frontend) + automated GitHub push from Colab

## GCN Contribution

This project led to a contribution to the GCN codebase — [PR #3579](https://github.com/nasa-gcn/gcn.nasa.gov/pull/3579) adding navigation links from the event circular view to individual circular pages.

## Run locally

```bash
# Clone the repo
git clone https://github.com/Hemanthb1/gw-agn-dashboard.git
cd gw-agn-dashboard

# Install dependencies
npm install

# Start the dev server
npm run dev
```

The dashboard reads from `public/final_candidates.csv` and `public/skymaps.csv` — replace with outputs from the [gw_agn_watcher](https://github.com/Hemanthb1/GW_AGN_watcher) pipeline.

## Pipeline

The Python pipeline lives at [github.com/Hemanthb1/GW_AGN_watcher](https://github.com/Hemanthb1/GW_AGN_watcher).

## Author

Hemanth Kumar — hemanth.bommireddy195@gmail.com
