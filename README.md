# GW-AGN Watcher Dashboard

A real-time dashboard for gravitational wave follow-up, crossmatching LIGO/Virgo GW events with AGN candidates from ZTF/ALeRCE.

**Live demo:** https://gw-agn-dashboard.vercel.app

## What it does

When LIGO detects a gravitational wave event, one of the leading candidate sources is an AGN (Active Galactic Nucleus) — a supermassive black hole system that could produce both GW and electromagnetic emission. This tool automatically:

1. Downloads GW skymaps from GraceDB
2. Queries the ALeRCE broker for ZTF transients within the GW localization region
3. Crossmatches candidates against the Milliquas AGN catalog
4. Ranks candidates by overlap probability, redshift, and light curve behavior
5. Displays results in an interactive dashboard with live ZTF light curves

## Features

- Live alert dashboard with severity ranking
- ZTF g-band and r-band light curves with GW trigger time marker
- Sky map showing AGN candidate positions
- Filter by severity, probability threshold, and AGN catalog
- Real-time event stream simulation
- Clickable detail view per candidate
- Settings panel for pipeline configuration

## Tech stack

- **Pipeline:** Python — `ligo.skymap`, `astropy`, ALeRCE broker, Milliquas catalog
- **Backend:** FastAPI
- **Frontend:** React + TypeScript, Recharts, Vite

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

The dashboard reads from `public/final_candidates.csv` — replace this with output from the [gw_agn_watcher](https://github.com/Hemanthb1/GW_AGN_watcher) pipeline.

## Pipeline

The Python pipeline lives at [github.com/Hemanthb1/GW_AGN_watcher](https://github.com/Hemanthb1/GW_AGN_watcher).

## Author

Hemanth Kumar — hemanth.bommireddy195@gmail.com