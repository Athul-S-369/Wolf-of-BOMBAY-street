<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:05080f,50:1a1a2e,100:d4af37&height=280&section=header&text=WOLF%20OF%20BOMBAY%20STREET&fontSize=52&fontColor=d4af37&animation=fadeIn&fontAlignY=42&desc=Bharata%20Market%20Intelligence%20Platform&descAlignY=62&descSize=18&descColor=8892b0" width="100%"/>

<br/>

<img src="https://readme-typing-svg.demolab.com?font=Cormorant+Garamond&weight=600&size=22&pause=1200&color=D4AF37&background=00000000&center=true&vCenter=true&random=false&width=700&lines=Real-time+NSE+%2F+BSE+Market+Intelligence;72+Companies+%7C+300%2B+Verified+Connections;Full+Conglomerate+Ecosystem+Mapping;Impact+Analysis+Down+to+the+Last+Node" alt="Typing SVG" />

<br/><br/>

![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js_24-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Yahoo Finance](https://img.shields.io/badge/Yahoo_Finance-6001D2?style=for-the-badge&logo=yahoo&logoColor=white)
![WebSocket](https://img.shields.io/badge/WebSocket-010101?style=for-the-badge&logo=socketdotio&logoColor=white)

<br/>

![Live](https://img.shields.io/badge/Data-Live_NSE_%2F_BSE-00d4aa?style=flat-square&labelColor=0a0f1e)
![Symbols](https://img.shields.io/badge/Symbols_Tracked-68%2B-d4af37?style=flat-square&labelColor=0a0f1e)
![Connections](https://img.shields.io/badge/Connections_Mapped-300%2B-c9a227?style=flat-square&labelColor=0a0f1e)
![Conglomerates](https://img.shields.io/badge/Conglomerates-Tata_%7C_Reliance_%7C_Adani_%7C_Birla-8892b0?style=flat-square&labelColor=0a0f1e)

</div>

---

<div align="center">

```
  ┌─────────────────────────────────────────────────────────────────────────┐
  │                                                                         │
  │        "The market is not a casino. It is a web of relationships.       │
  │         Pull one thread, and every connected node trembles."            │
  │                                                                         │
  └─────────────────────────────────────────────────────────────────────────┘
```

</div>

---

## The Platform

Wolf of Bombay Street is a professional-grade financial intelligence terminal built for the Indian capital markets. It moves beyond isolated stock tickers and charts to reveal the complete relational fabric of the Bombay Stock Exchange and National Stock Exchange — mapping every parent company, every subsidiary, every unlisted entity, every supply chain dependency, and every institutional debt relationship in real time.

Where conventional platforms show you a price, this platform shows you the entire ecosystem behind it.

---

## Architecture

```
                              LIVE DATA LAYER
  ┌──────────────────────────────────────────────────────────────────────┐
  │                                                                      │
  │   Yahoo Finance (NSE/BSE)  ──►  Node.js Backend  ──►  WebSocket     │
  │   68+ symbols / 5s refresh        Port 3001           Port 3001      │
  │                                                                      │
  │   Smart Polling:                                                     │
  │   Market Hours  (09:15 – 15:30 IST)  →  5-second intervals          │
  │   After Close                         →  10-minute intervals         │
  │   On Rate-Limit                       →  Exponential back-off        │
  │                                                                      │
  └──────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
                              INTELLIGENCE LAYER
  ┌──────────────────────────────────────────────────────────────────────┐
  │                                                                      │
  │   marketDataService.ts  ─── WebSocket Client ──► Zustand Store      │
  │                          └─ REST Fallback                            │
  │                          └─ OU Simulation      (offline fallback)    │
  │                                                                      │
  └──────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
                              PRESENTATION LAYER
  ┌──────────────────────────────────────────────────────────────────────┐
  │                                                                      │
  │   Dashboard   ──  Live indices, sector heatmap, top movers          │
  │   Network     ──  D3 force graph, full ecosystem, unlisted nodes     │
  │   Impact      ──  BFS propagation, beta-weighted, all hops shown    │
  │   Orders      ──  Alert stream, circuit breakers, volume spikes     │
  │   Company     ──  Full profile, data integrity cross-validation     │
  │                                                                      │
  └──────────────────────────────────────────────────────────────────────┘
```

---

## Core Capabilities

### Real-Time Market Data
Live NSE and BSE prices sourced directly from Yahoo Finance via `yahoo-finance2`. Every listed company updates every 5 seconds during market hours. The bottom status bar clearly indicates whether you are viewing live data, REST-polled data, or the offline simulation fallback — there is no ambiguity about data freshness.

### Full Conglomerate Ecosystem Mapping
The platform does not stop at IPO-listed companies. Every major Indian conglomerate has been mapped to its complete tree of entities — listed and unlisted alike.

| Group | Listed Entities | Unlisted Entities |
|---|---|---|
| **Reliance** | RIL, Jio Financial, Network18, Hathway, Den, GTPL, RIIL, JustDial | Reliance Jio Infocomm, Reliance Retail Ventures |
| **Tata** | TCS, Tata Motors, Tata Steel, Titan, Tata Consumer, Tata Power, Tata Comm, Tata Elxsi, Tata Chem, Indian Hotels, Voltas, Tata Tech, Trent, Tata Investment | Tata Sons Pvt Ltd, Tata Capital |
| **Adani** | Adani Enterprises, Ports, Green, Total Gas, Power, Wilmar, NDTV | Adani Airport Holdings (7 airports) |
| **Aditya Birla** | Grasim, UltraTech, Hindalco, Aditya Birla Capital, Vodafone Idea | — |
| **Bajaj** | Bajaj Holdings, Bajaj Finserv, Bajaj Finance, Bajaj Auto | — |
| **HDFC** | HDFC Bank, HDFC Life, HDFC AMC | HDFC ERGO |

### 300+ Verified Connection Graph
Every connection is sourced from SEBI filings, annual reports, and NSE shareholding disclosures. Connection types include:

- **Ownership / Subsidiary** — with exact stake percentage
- **Supply Chain** — verified supplier-customer agreements (e.g., Coal India to NTPC via FSA)
- **Institutional Debt** — lender-borrower exposures (e.g., SBI exposure to Vodafone Idea)
- **Joint Ventures** — JV structures with partner details
- **Cross-Holdings** — mutual equity positions
- **Sector Competition** — direct market rivals
- **Acquisition** — recent control changes (e.g., Adani acquisition of NDTV)

### Impact Propagation Analyzer
Select any company or event. The analyzer traverses the full graph using Breadth-First Search with empirically derived beta coefficients and distance decay factors. Every connected node at every hop is evaluated — including unlisted subsidiaries. The output ranks every affected company by estimated price impact, showing the methodology behind each score.

### Ornstein-Uhlenbeck Simulation Fallback
When the backend is unreachable, the platform does not freeze. It switches seamlessly to a mean-reverting price process (Ornstein-Uhlenbeck) calibrated with sector-specific daily volatility targets derived from historical NSE data. Circuit breaker limits at ±8% are enforced. The UI clearly labels this state as simulated.

---

## Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend Framework | React 19 + TypeScript | Component architecture |
| Build Tool | Vite 8 | Sub-second HMR, optimised bundles |
| State Management | Zustand | Global market state, real-time updates |
| Data Visualisation | D3.js v7 | Force-directed network graph |
| Charting | Recharts | OHLCV, sector heatmap, sparklines |
| Styling | Tailwind CSS v3 | Luxury dark theme with gold accent system |
| Animation | Framer Motion | Panel transitions, price flash effects |
| Backend Runtime | Node.js 24 | Native fetch, ES modules |
| Data Source | yahoo-finance2 | NSE/BSE live quote proxy |
| Real-time Transport | WebSocket (ws) | Sub-5-second price streaming |
| HTTP Server | Express 4 | REST API, CORS, health checks |

---

## Data Integrity

All fundamental data (P/E, EPS, revenue, net profit, shareholding patterns) is sourced from FY24/25 annual reports and cross-validated:

- EPS x P/E is checked against the live market price
- Shareholding percentages (promoter + FI + DII + public) are verified to sum to 100%
- Market capitalisation is re-derived from price x shares outstanding and compared against Yahoo Finance's reported figure
- A Data Integrity panel is visible on every company profile page

---

## Launch Instructions

**Prerequisites:** Node.js 18+, npm

```bash
# Terminal 1 — Start the real-time data backend
cd backend
npm install
node server.js

# Terminal 2 — Start the frontend
npm install
npm run dev
```

Open `http://localhost:5173`

The status bar at the bottom of the application shows the current data source state:

| Indicator | Meaning |
|---|---|
| `LIVE N SYMBOLS` (teal) | WebSocket connected, Yahoo Finance data flowing |
| `POLLING N SYMBOLS` (amber) | REST fallback active, data still real |
| `CONNECTING` (blue) | Establishing connection to backend |
| `SIMULATED` (orange) | Backend offline, OU model active |

---

## API Reference

The backend exposes a REST API alongside the WebSocket endpoint.

```
GET  /api/health              System status, symbol count, last fetch time
GET  /api/quotes              All 68+ symbols as a JSON map
GET  /api/quote/:SYMBOL       Single symbol (e.g., /api/quote/RELIANCE)
POST /api/quotes/batch        Batch query — body: { "symbols": ["TCS", "INFY"] }

WS   ws://localhost:3001      Streams { type, quotes, marketStatus } every 4s
```

---

## Market Hours

The backend adapts its polling frequency to NSE trading sessions automatically.

```
  00:00 ───────────────────── 09:14  Closed      →  10-min poll
  09:15 ───────────────────── 09:15  Pre-Open    →   5-sec poll
  09:15 ───────────────────── 15:30  Regular     →   5-sec poll
  15:30 ───────────────────── 16:00  Post-Close  →  10-min poll
  16:00 ───────────────────── 23:59  Closed      →  10-min poll
  Saturday / Sunday                  Closed      →  Suspended
```

---

## Repository Structure

```
Wolf-of-BOMBAY-street/
│
├── backend/
│   ├── server.js              Real-time Yahoo Finance proxy + WebSocket server
│   └── package.json
│
├── src/
│   ├── data/
│   │   ├── companies.ts       72 entities (listed + unlisted) with fundamentals
│   │   ├── connections.ts     300+ verified inter-company connections
│   │   └── marketData.ts      Index data, alert types, OHLCV utilities
│   │
│   ├── services/
│   │   └── marketDataService.ts   WebSocket client, REST fallback, status events
│   │
│   ├── store/
│   │   └── marketStore.ts     Zustand store, live data merge, OU simulation
│   │
│   ├── components/
│   │   ├── Dashboard/         Indices, sector heatmap, top movers, stock table
│   │   ├── Network/           D3 force-directed ecosystem graph
│   │   ├── Impact/            BFS impact propagation analyzer
│   │   ├── Orders/            Alert stream, order flow panel
│   │   ├── Company/           Full company profile with data integrity check
│   │   └── Layout/            Header, navigation, market status bar
│   │
│   └── utils/
│       └── format.ts          Indian currency, volume, and time formatters
│
├── vite.config.ts             Build config + /api proxy to backend
└── tailwind.config.js         Luxury dark theme: gold, surface, gain, loss
```

---

## The Vision

The Indian capital market is not a collection of isolated tickers. It is a network — where a large block trade in Reliance Industries can transmit through Jio Infocomm's network valuation, into Network18's advertising revenues, down through Hathway's subscriber base, and finally arrive at GTPL's quarterly EBITDA.

Wolf of Bombay Street is built on the premise that understanding the market means understanding the graph — every node, every edge, every unlisted entity that has no Bloomberg terminal but still moves the prices of the companies that do.

This platform is the beginning of that decoding.

---

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:d4af37,50:1a1a2e,100:05080f&height=120&section=footer&animation=fadeIn" width="100%"/>

**Built for the Indian market. Powered by real data. Designed without compromise.**

![Last Commit](https://img.shields.io/github/last-commit/Athul-S-369/Wolf-of-BOMBAY-street?style=flat-square&labelColor=0a0f1e&color=d4af37)
![Repo Size](https://img.shields.io/github/repo-size/Athul-S-369/Wolf-of-BOMBAY-street?style=flat-square&labelColor=0a0f1e&color=d4af37)
![Stars](https://img.shields.io/github/stars/Athul-S-369/Wolf-of-BOMBAY-street?style=flat-square&labelColor=0a0f1e&color=d4af37)

</div>
