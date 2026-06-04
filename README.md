# GW-AGN Watcher Dashboard

> Real-time dashboard for gravitational wave follow-up — crossmatching LIGO/Virgo/KAGRA events with AGN candidates from ZTF/ALeRCE.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-gw--agn--dashboard.vercel.app-blue)](https://gw-agn-dashboard.vercel.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-90%25-blue)](https://www.typescriptlang.org/)
[![NASA GCN PR](https://img.shields.io/badge/NASA%20GCN-PR%20%233579-brightgreen)](https://github.com/nasa-gcn/gcn.nasa.gov/pull/3579)

---

## Science Motivation

When LIGO/Virgo/KAGRA detects a gravitational wave event, one leading candidate source is a merger involving an AGN (Active Galactic Nucleus) — a supermassive black hole system that could host merging compact objects producing both gravitational wave and electromagnetic emission. Identifying these counterparts requires crossmatching GW sky localizations with real-time transient alert streams within hours of the GW trigger.

This tool automates that workflow end-to-end.

---

## Features

- 📡 **GCN Kafka consumer** for Einstein Probe WXT and Fermi GBM alerts
- 🗺️ **GW skymap overlay** with LIGO probability contours and event selector
- 🔭 **ZTF light curves** (g and r band) with GW trigger time marker
- 🧬 **AGN candidate ranking** by overlap probability, redshift, and light curve behavior
- 🔍 **Filtering** by severity, detection count, and angular separation
- 📋 **GraceDB metadata** integration with sibling candidate navigation
- ⚙️ **Pipeline configuration** panel

---
**Live demo:** https://gw-agn-dashboard.vercel.app

## Screenshots

### Main Dashboard
![Main Dashboard](public/Dashboard-main.png)

### GW Skymap with Probability Contours
![Skymap](public/Dashboard-skymap.png)

### Candidate Detail View with ZTF Light Curve
![Detail View](public/Dashboard-detail.png)


## Architecture

```
GW Alert (GraceDB / GCN Kafka)
        ↓
ligo.skymap → skymap download & parsing
        ↓
ALeRCE broker → ZTF transients within localization
        ↓
Milliquas catalog → AGN crossmatch
        ↓
FastAPI backend → /events, /run_pipeline, /pipeline_status
        ↓
React + TypeScript dashboard → interactive visualization
```

---

## Tech Stack

| Layer | Tools |
|---|---|
| Pipeline | Python, `ligo.skymap`, `astropy`, ALeRCE API, Milliquas catalog |
| Alerts | GCN Kafka (`gcn-kafka`), Einstein Probe WXT, Fermi GBM |
| Backend | FastAPI |
| Frontend | React, TypeScript, Recharts, Vite |
| Deployment | Vercel (frontend) |

---

## Quick Start

```bash
# Clone the repo
git clone https://github.com/Hemanthb1/gw-agn-dashboard.git
cd gw-agn-dashboard

# Install dependencies
npm install

# Start the dev server
npm run dev
```

The dashboard reads from `public/final_candidates.csv` and `public/skymaps.csv`.  
Replace these with outputs from the [GW_AGN_watcher](https://github.com/Hemanthb1/GW_AGN_watcher) pipeline.

---

## Related

- 🐍 **Python pipeline:** [GW_AGN_watcher](https://github.com/Hemanthb1/GW_AGN_watcher)
- 🌐 **NASA GCN contribution:** [PR #3579](https://github.com/nasa-gcn/gcn.nasa.gov/pull/3579)

---

## Author

**Hemanth Bommireddy**  
PhD candidate, Universidad de Chile  
📧 hemanth.bommireddy195@gmail.com  
🔗 [ORCID](https://orcid.org/0009-0007-4271-6444) · [InspireHEP](https://inspirehep.net/authors/2902490)
