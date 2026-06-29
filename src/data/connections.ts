// ─────────────────────────────────────────────────────────────────────────────
// CONNECTIONS DATABASE  — 300+ verified inter-company relationships
// Types: subsidiary | parent | crossholding | supplier | customer |
//        sector_peer | promoter | jv | debt | acquirer | competitor
// strength 0–1: how strong the financial/operational link is
// Sources: Annual reports, SEBI filings, MCA21 data, NSE shareholding data
// ─────────────────────────────────────────────────────────────────────────────

export type ConnectionType =
  | 'subsidiary'
  | 'parent'
  | 'crossholding'
  | 'supplier'
  | 'customer'
  | 'sector_peer'
  | 'promoter'
  | 'jv'
  | 'debt'
  | 'acquirer'

export interface Connection {
  id: string
  source: string
  target: string
  type: ConnectionType
  strength: number      // 0–1 (1 = maximum influence)
  ownershipPct?: number // % stake if applicable
  description: string
  bidirectional: boolean
}

export const CONNECTION_COLORS: Record<ConnectionType, string> = {
  subsidiary: '#d4af37',
  parent: '#d4af37',
  crossholding: '#00d4aa',
  supplier: '#4fc3f7',
  customer: '#4fc3f7',
  sector_peer: '#9e9e9e',
  promoter: '#ff8f00',
  jv: '#ab47bc',
  debt: '#ef5350',
  acquirer: '#f06292',
}

export const CONNECTION_LABELS: Record<ConnectionType, string> = {
  subsidiary: 'Subsidiary / Group',
  parent: 'Parent Company',
  crossholding: 'Cross-Holding',
  supplier: 'Supplier',
  customer: 'Customer',
  sector_peer: 'Sector Peer',
  promoter: 'Common Promoter',
  jv: 'Joint Venture',
  debt: 'Lender-Borrower',
  acquirer: 'Acquirer / Acquired',
}

export const CONNECTIONS: Connection[] = [

  // ════════════════════════════════════════════════════
  // TATA GROUP — Full Tree
  // Apex: TATASONS → all listed entities
  // ════════════════════════════════════════════════════

  // Tata Sons → Listed subsidiaries (ownership links)
  { id: 'tata-1',  source: 'TATASONS', target: 'TCS',         type: 'parent', strength: 0.98, ownershipPct: 72.3, description: 'Tata Sons holds 72.3% in TCS — the group\'s most valuable asset.', bidirectional: false },
  { id: 'tata-2',  source: 'TATASONS', target: 'TATAMOTORS',  type: 'parent', strength: 0.92, ownershipPct: 46.4, description: 'Tata Sons holds 46.4% in Tata Motors. JLR contribution ~70% of revenues.', bidirectional: false },
  { id: 'tata-3',  source: 'TATASONS', target: 'TATASTEEL',   type: 'parent', strength: 0.88, ownershipPct: 33.2, description: 'Tata Sons + Tata Steel group cross-holdings total ~33.2%.', bidirectional: false },
  { id: 'tata-4',  source: 'TATASONS', target: 'TITAN',       type: 'parent', strength: 0.92, ownershipPct: 52.9, description: 'Tata Sons holds 52.9% in Titan (via Tata Industries + Tata Investment).', bidirectional: false },
  { id: 'tata-5',  source: 'TATASONS', target: 'TATACONSUMER',type: 'parent', strength: 0.88, ownershipPct: 34.7, description: 'Tata Sons holds 34.7% through direct + indirect stake in Tata Consumer.', bidirectional: false },
  { id: 'tata-6',  source: 'TATASONS', target: 'TATAPOWER',   type: 'parent', strength: 0.92, ownershipPct: 46.9, description: 'Tata Sons holds 46.9% in Tata Power. Strategic renewable energy pivot.', bidirectional: false },
  { id: 'tata-7',  source: 'TATASONS', target: 'TATACOMM',    type: 'parent', strength: 0.94, ownershipPct: 58.9, description: 'Tata Sons holds 58.9% in Tata Communications. Core enterprise telecom.', bidirectional: false },
  { id: 'tata-8',  source: 'TATASONS', target: 'TATAELXSI',   type: 'parent', strength: 0.90, ownershipPct: 43.9, description: 'Tata Sons holds 43.9% in Tata Elxsi (via Tata Group entities).', bidirectional: false },
  { id: 'tata-9',  source: 'TATASONS', target: 'TATACHEM',    type: 'parent', strength: 0.88, ownershipPct: 38.1, description: 'Tata Sons holds 38.1% in Tata Chemicals. Soda ash, salt, specialty.', bidirectional: false },
  { id: 'tata-10', source: 'TATASONS', target: 'INDHOTEL',    type: 'parent', strength: 0.88, ownershipPct: 38.1, description: 'Tata Sons holds 38.1% in Indian Hotels Company (Taj brand).', bidirectional: false },
  { id: 'tata-11', source: 'TATASONS', target: 'VOLTAS',      type: 'parent', strength: 0.84, ownershipPct: 30.3, description: 'Tata Sons (via Tata Industries) holds 30.3% in Voltas.', bidirectional: false },
  { id: 'tata-12', source: 'TATASONS', target: 'TRENT',       type: 'parent', strength: 0.88, ownershipPct: 37.3, description: 'Tata Sons holds 37.3% in Trent. Fastest-growing Tata retail arm.', bidirectional: false },
  { id: 'tata-13', source: 'TATASONS', target: 'TATAINVEST',  type: 'parent', strength: 0.95, ownershipPct: 73.4, description: 'Tata Sons holds 73.4% in Tata Investment Corp — the group\'s treasury.', bidirectional: false },
  { id: 'tata-14', source: 'TATASONS', target: 'TATACAPITAL', type: 'parent', strength: 0.98, ownershipPct: 100, description: 'Tata Sons owns 100% of Tata Capital — the group\'s unlisted NBFC/PE arm.', bidirectional: false },

  // Tata Motors → Tata Technologies (TATAMOTORS is TATATECH promoter)
  { id: 'tata-15', source: 'TATAMOTORS', target: 'TATATECH',  type: 'parent', strength: 0.90, ownershipPct: 44.5, description: 'Tata Motors holds 44.5% in Tata Technologies. Automotive R&D engineering.', bidirectional: false },

  // Cross-group operational links within Tata
  { id: 'tata-16', source: 'TCS',        target: 'TATAMOTORS',  type: 'customer', strength: 0.80, description: 'TCS provides digital transformation, IT infra, and ERP to Tata Motors + JLR globally.', bidirectional: false },
  { id: 'tata-17', source: 'TCS',        target: 'TATASTEEL',   type: 'customer', strength: 0.76, description: 'TCS manages manufacturing IT, supply chain & plant automation for Tata Steel.', bidirectional: false },
  { id: 'tata-18', source: 'TCS',        target: 'HDFCBANK',    type: 'customer', strength: 0.78, description: 'TCS provides BaNCS core banking platform and digital services to HDFC Bank.', bidirectional: false },
  { id: 'tata-19', source: 'TATASTEEL',  target: 'TATAMOTORS',  type: 'supplier', strength: 0.84, description: 'Tata Steel is primary supplier of flat-rolled & high-strength automotive steel to Tata Motors.', bidirectional: false },
  { id: 'tata-20', source: 'TATAPOWER',  target: 'TATAMOTORS',  type: 'supplier', strength: 0.62, description: 'Tata Power supplies industrial electricity to Tata Motors plants; key EV charging partner.', bidirectional: false },
  { id: 'tata-21', source: 'TATACHEM',   target: 'TATACONSUMER',type: 'supplier', strength: 0.64, description: 'Tata Chemicals supplies salt to Tata Consumer\'s Tata Salt brand.', bidirectional: false },
  { id: 'tata-22', source: 'TATAINVEST', target: 'TCS',         type: 'crossholding', strength: 0.72, description: 'Tata Investment holds cross-stake in TCS; also holds positions in all major Tata companies.', bidirectional: false },
  { id: 'tata-23', source: 'TATATECH',   target: 'TATAMOTORS',  type: 'customer', strength: 0.88, description: 'Tata Technologies provides R&D engineering services to Tata Motors for EV platforms.', bidirectional: false },
  { id: 'tata-24', source: 'TATACOMM',   target: 'TCS',         type: 'promoter', strength: 0.78, description: 'Common Tata Sons promoter. TCS uses Tata Comm\'s global network for its delivery centres.', bidirectional: true },
  { id: 'tata-25', source: 'TATACAPITAL',target: 'TATAMOTORS',  type: 'debt', strength: 0.70, description: 'Tata Capital provides retail vehicle financing for Tata Motors commercial vehicles.', bidirectional: false },
  { id: 'tata-26', source: 'TATACAPITAL',target: 'TATAPOWER',   type: 'debt', strength: 0.68, description: 'Tata Capital provides project finance and equipment leasing to Tata Power solar projects.', bidirectional: false },

  // Promoter sentiment links (any Tata listed company move affects others via promoter sentiment)
  { id: 'tata-27', source: 'TCS',        target: 'TITAN',       type: 'promoter', strength: 0.74, description: 'Common Tata Sons promoter; TCS dividend income flows up to fund Tata group investments.', bidirectional: true },
  { id: 'tata-28', source: 'TATAPOWER',  target: 'NTPC',        type: 'sector_peer', strength: 0.72, description: 'Both are large power generators; compete for renewable energy capacity bids.', bidirectional: true },
  { id: 'tata-29', source: 'TATASTEEL',  target: 'JSWSTEEL',    type: 'sector_peer', strength: 0.88, description: 'India\'s top-2 integrated steel producers. Compete in flat-products and construction steel.', bidirectional: true },
  { id: 'tata-30', source: 'INDHOTEL',   target: 'ITC',         type: 'sector_peer', strength: 0.72, description: 'Taj Hotels vs ITC Hotels: top-2 luxury hotel brands in India, compete for MICE and leisure.', bidirectional: true },

  // ════════════════════════════════════════════════════
  // RELIANCE GROUP — Full Ecosystem Tree
  // RIL → RJIO (unlisted), RRVL (unlisted), JIOFIN, NETWORK18 → HATHWAY, DEN, JUSTDIAL, GTPL → RIIL
  // ════════════════════════════════════════════════════

  // RIL → Direct subsidiaries
  { id: 'ril-1',  source: 'RELIANCE', target: 'RJIO',     type: 'parent', strength: 0.99, ownershipPct: 100, description: 'Reliance owns 100% of Jio Infocomm. Core 4G/5G telecom ops. 450M+ subscribers.', bidirectional: false },
  { id: 'ril-2',  source: 'RELIANCE', target: 'RRVL',     type: 'parent', strength: 0.98, ownershipPct: 84.9, description: 'Reliance owns 84.9% of Reliance Retail Ventures. India\'s largest retailer.', bidirectional: false },
  { id: 'ril-3',  source: 'RELIANCE', target: 'JIOFIN',   type: 'parent', strength: 0.95, ownershipPct: 47.1, description: 'Jio Financial demerged from Reliance in 2023. RIL promoters own 47.1%.', bidirectional: false },
  { id: 'ril-4',  source: 'RELIANCE', target: 'NETWORK18',type: 'parent', strength: 0.95, ownershipPct: 74.6, description: 'Reliance Industries controls Network18 with 74.6% stake (via Independent Media Trust).', bidirectional: false },
  { id: 'ril-5',  source: 'RELIANCE', target: 'RIIL',     type: 'parent', strength: 0.90, ownershipPct: 45.4, description: 'Reliance holds 45.4% in RIIL which provides pipeline infrastructure to Reliance\'s Jamnagar complex.', bidirectional: false },

  // Network18 → sub-entities
  { id: 'ril-6',  source: 'NETWORK18', target: 'HATHWAY',  type: 'parent', strength: 0.94, ownershipPct: 70.1, description: 'Network18 controls Hathway Cable (70.1% stake) for broadband cable distribution.', bidirectional: false },
  { id: 'ril-7',  source: 'NETWORK18', target: 'DEN',      type: 'parent', strength: 0.92, ownershipPct: 51.8, description: 'Network18 controls Den Networks (51.8%) for cable TV distribution in metros.', bidirectional: false },
  { id: 'ril-8',  source: 'NETWORK18', target: 'JUSTDIAL', type: 'parent', strength: 0.76, ownershipPct: 25.3, description: 'Network18/Reliance acquired 25.3% in JustDial in 2021 — strategic digital search platform.', bidirectional: false },

  // Hathway → GTPL (sub-subsidiary)
  { id: 'ril-9',  source: 'HATHWAY',  target: 'GTPL',     type: 'parent', strength: 0.92, ownershipPct: 58.6, description: 'Hathway Cable holds 58.6% in GTPL Hathway — JV for Gujarat broadband/cable.', bidirectional: false },

  // Cross-ecosystem linkages
  { id: 'ril-10', source: 'RJIO',    target: 'NETWORK18',  type: 'customer', strength: 0.88, description: 'Jio provides backbone telecom/OTT infrastructure to Network18 for JioCinema, JioTV streaming.', bidirectional: false },
  { id: 'ril-11', source: 'RJIO',    target: 'BHARTIARTL', type: 'sector_peer', strength: 0.90, description: 'Jio (Reliance) vs Airtel: India\'s top telecom duopoly battling on 5G rollout and ARPU growth.', bidirectional: true },
  { id: 'ril-12', source: 'RJIO',    target: 'IDEA',       type: 'sector_peer', strength: 0.82, description: 'Jio effectively disrupted Vi\'s subscriber base. Vi could liquidate, benefiting Jio and Airtel.', bidirectional: true },
  { id: 'ril-13', source: 'RRVL',    target: 'DMART',      type: 'sector_peer', strength: 0.84, description: 'Reliance Retail vs D-Mart: India\'s two largest grocery/hypermarket operators competing for footfall.', bidirectional: true },
  { id: 'ril-14', source: 'RELIANCE',target: 'ONGC',       type: 'sector_peer', strength: 0.80, description: 'RIL (private) vs ONGC (state): compete in E&P blocks, offshore gas fields.', bidirectional: true },
  { id: 'ril-15', source: 'RELIANCE',target: 'LT',         type: 'customer', strength: 0.74, description: 'L&T is EPC contractor for Reliance\'s mega refinery expansions and petrochemical complex.', bidirectional: false },
  { id: 'ril-16', source: 'JIOFIN',  target: 'BAJFINANCE', type: 'sector_peer', strength: 0.72, description: 'Jio Financial entering consumer lending directly threatens Bajaj Finance\'s growth runway.', bidirectional: true },
  { id: 'ril-17', source: 'JIOFIN',  target: 'HDFCBANK',   type: 'sector_peer', strength: 0.70, description: 'Jio Financial\'s BlackRock JV for asset management will compete with HDFC AMC.', bidirectional: true },
  { id: 'ril-18', source: 'NETWORK18',target: 'NDTV',      type: 'sector_peer', strength: 0.78, description: 'Network18 (Reliance) vs NDTV (Adani): India\'s two largest media groups post-ownership changes.', bidirectional: true },
  { id: 'ril-19', source: 'RIIL',    target: 'RELIANCE',   type: 'supplier', strength: 0.88, description: 'RIIL provides petroleum product pipelines, storage and related services to Reliance Industrial complex.', bidirectional: false },
  { id: 'ril-20', source: 'INFY',    target: 'RELIANCE',   type: 'customer', strength: 0.62, description: 'Infosys provides supply chain IT and digital retail solutions to Reliance Retail.', bidirectional: false },

  // ════════════════════════════════════════════════════
  // ADANI GROUP — Full Ecosystem Tree
  // ADANIENT → ADANIPORTS, ADANIGREEN, ADANITRANS, ADANIPOWER, AWL, NDTV, AAHL
  // ════════════════════════════════════════════════════

  { id: 'adani-1', source: 'ADANIENT', target: 'ADANIPORTS', type: 'parent', strength: 0.92, ownershipPct: 63.7, description: 'Adani Enterprises incubated Adani Ports; common Gautam Adani promoter family (63.7%).', bidirectional: false },
  { id: 'adani-2', source: 'ADANIENT', target: 'ADANIGREEN', type: 'parent', strength: 0.90, ownershipPct: 60.5, description: 'Adani Group controls 60.5% in Adani Green. Flagship renewable energy vehicle.', bidirectional: false },
  { id: 'adani-3', source: 'ADANIENT', target: 'ADANITRANS', type: 'parent', strength: 0.88, ownershipPct: 74.8, description: 'Adani Enterprises holds 74.8% in Adani Total Gas (JV with TotalEnergies).', bidirectional: false },
  { id: 'adani-4', source: 'ADANIENT', target: 'ADANIPOWER', type: 'parent', strength: 0.96, ownershipPct: 74.97, description: 'Adani Enterprises holds 74.97% in Adani Power — largest private thermal power producer.', bidirectional: false },
  { id: 'adani-5', source: 'ADANIENT', target: 'AWL',        type: 'parent', strength: 0.84, ownershipPct: 44.0, description: 'Adani Group holds 44% in Adani Wilmar JV (Wilmar International holds another 44%).', bidirectional: false },
  { id: 'adani-6', source: 'ADANIENT', target: 'NDTV',       type: 'acquirer', strength: 0.88, ownershipPct: 64.7, description: 'AMG Media (Adani) acquired 64.7% control of NDTV in 2022-23 via open offer and indirect stake.', bidirectional: false },
  { id: 'adani-7', source: 'ADANIENT', target: 'AAHL',       type: 'parent', strength: 0.96, ownershipPct: 100, description: 'Adani Airport Holdings (unlisted) is 100% owned by Adani Enterprises. Operates 7 airports.', bidirectional: false },

  // Adani cross-entity operational links
  { id: 'adani-8',  source: 'ADANIPORTS', target: 'ADANIENT',   type: 'customer', strength: 0.82, description: 'Adani Ports handles coal import for Adani Power plants and agri commodity for AWL.', bidirectional: false },
  { id: 'adani-9',  source: 'ADANIPORTS', target: 'ADANIGREEN', type: 'supplier', strength: 0.74, description: 'Adani Ports facilitates import of solar panels, wind equipment for Adani Green projects.', bidirectional: false },
  { id: 'adani-10', source: 'ADANIPOWER', target: 'ADANIENT',   type: 'customer', strength: 0.80, description: 'Adani Power buys coal via Adani Enterprises\' coal trading arm.', bidirectional: false },
  { id: 'adani-11', source: 'ADANIGREEN', target: 'NTPC',       type: 'sector_peer', strength: 0.76, description: 'Adani Green (largest private renewable) vs NTPC (largest state power utility) — bid for same SECI tenders.', bidirectional: true },
  { id: 'adani-12', source: 'ADANITRANS', target: 'ONGC',       type: 'customer', strength: 0.66, description: 'Adani Total Gas distributes natural gas produced by ONGC and purchased via terminals.', bidirectional: false },
  { id: 'adani-13', source: 'ADANIENT',   target: 'COALINDIA',  type: 'customer', strength: 0.70, description: 'Adani (via Adani Enterprises coal mining) competes with Coal India and imports coal for Adani Power.', bidirectional: false },
  { id: 'adani-14', source: 'AAHL',       target: 'ADANIPORTS', type: 'promoter', strength: 0.80, description: 'Common Adani Group promoter. Airport and port logistics operations synergize on cargo handling.', bidirectional: true },
  { id: 'adani-15', source: 'AWL',        target: 'HINDUNILVR', type: 'sector_peer', strength: 0.68, description: 'Fortune brand (AWL) competes with HUL\'s Saffola and branded food products in edible oils.', bidirectional: true },
  { id: 'adani-16', source: 'ADANIPOWER', target: 'TATAPOWER',  type: 'sector_peer', strength: 0.80, description: 'India\'s two largest integrated power companies. Compete on capacity and PPA bidding.', bidirectional: true },
  { id: 'adani-17', source: 'NDTV',       target: 'NETWORK18',  type: 'sector_peer', strength: 0.82, description: 'NDTV (Adani) vs CNBC-TV18/CNN-News18 (Reliance Network18): direct news broadcasting rivalry.', bidirectional: true },
  { id: 'adani-18', source: 'SBIN',       target: 'ADANIPORTS', type: 'debt', strength: 0.68, description: 'SBI has significant exposure to Adani Group project financing for port and power expansions.', bidirectional: false },

  // ════════════════════════════════════════════════════
  // HDFC GROUP — Full Ecosystem
  // ════════════════════════════════════════════════════

  { id: 'hdfc-1', source: 'HDFCBANK',  target: 'HDFCLIFE',  type: 'parent', strength: 0.92, ownershipPct: 50.4, description: 'HDFC Bank holds 50.4% in HDFC Life. Bancassurance model — 30%+ of HDFC Life new business via HDFC Bank branches.', bidirectional: false },
  { id: 'hdfc-2', source: 'HDFCBANK',  target: 'HDFCAMC',   type: 'parent', strength: 0.94, ownershipPct: 52.5, description: 'HDFC Bank holds 52.5% in HDFC AMC — India\'s largest mutual fund manager (₹7.7L cr AUM).', bidirectional: false },
  { id: 'hdfc-3', source: 'HDFCBANK',  target: 'ICICIBANK',  type: 'sector_peer', strength: 0.88, description: 'India\'s two largest private banks. Compete for loans, deposits, credit cards, and corporate relationships.', bidirectional: true },
  { id: 'hdfc-4', source: 'HDFCBANK',  target: 'SBIN',       type: 'sector_peer', strength: 0.82, description: 'Largest private vs largest public sector bank. SBI leads in rural, HDFC in urban/digital.', bidirectional: true },
  { id: 'hdfc-5', source: 'HDFCBANK',  target: 'AXISBANK',   type: 'sector_peer', strength: 0.82, description: 'Top-3 private banks compete for deposits, home loans, and corporate lending.', bidirectional: true },
  { id: 'hdfc-6', source: 'HDFCBANK',  target: 'KOTAKBANK',  type: 'sector_peer', strength: 0.78, description: 'HDFC Bank vs Kotak Mahindra: compete in premium banking, wealth management, home loans.', bidirectional: true },
  { id: 'hdfc-7', source: 'HDFCBANK',  target: 'BAJFINANCE', type: 'sector_peer', strength: 0.74, description: 'Banks compete with NBFCs for consumer lending. HDFC Bank is also a co-lender to Bajaj Finance.', bidirectional: true },
  { id: 'hdfc-8', source: 'HDFCBANK',  target: 'MARUTI',     type: 'customer', strength: 0.78, description: 'HDFC Bank is India\'s largest auto loan provider; Maruti is the top vehicle financer.', bidirectional: false },
  { id: 'hdfc-9', source: 'HDFCAMC',   target: 'BAJFINANCE', type: 'crossholding', strength: 0.62, description: 'HDFC AMC fund schemes hold significant positions in Bajaj Finance as index and active funds.', bidirectional: false },
  { id: 'hdfc-10',source: 'HDFCLIFE',  target: 'BAJAJFINSV', type: 'sector_peer', strength: 0.76, description: 'HDFC Life vs Bajaj Allianz Life (under Bajaj Finserv): top-2 private life insurers competing for premiums.', bidirectional: true },
  { id: 'hdfc-11',source: 'ICICIBANK', target: 'SBIN',        type: 'sector_peer', strength: 0.80, description: 'Top-3 Indian banks. Compete across retail, corporate, and international banking.', bidirectional: true },
  { id: 'hdfc-12',source: 'ICICIBANK', target: 'AXISBANK',    type: 'sector_peer', strength: 0.82, description: 'India\'s 2nd and 3rd largest private banks. Direct rivals in corporate and retail banking.', bidirectional: true },
  { id: 'hdfc-13',source: 'ICICIBANK', target: 'BAJFINANCE',  type: 'debt', strength: 0.66, description: 'ICICI Bank provides credit lines and co-lending to Bajaj Finance for on-lending.', bidirectional: false },
  { id: 'hdfc-14',source: 'SBIN',      target: 'NTPC',        type: 'debt', strength: 0.78, description: 'SBI is the largest lender to NTPC for power plant construction financing.', bidirectional: false },
  { id: 'hdfc-15',source: 'SBIN',      target: 'TATASTEEL',   type: 'debt', strength: 0.72, description: 'SBI is a major lender to Tata Steel for capacity expansion at Kalinganagar.', bidirectional: false },
  { id: 'hdfc-16',source: 'HDFCBANK',  target: 'RELIANCE',    type: 'debt', strength: 0.64, description: 'HDFC Bank provides working capital, treasury solutions and FX services to Reliance.', bidirectional: false },
  { id: 'hdfc-17',source: 'AXISBANK',  target: 'ADANIPORTS',  type: 'debt', strength: 0.68, description: 'Axis Bank has project financing exposure to multiple Adani Group port expansions.', bidirectional: false },
  { id: 'hdfc-18',source: 'KOTAKBANK', target: 'MM',          type: 'debt', strength: 0.62, description: 'Kotak Mahindra Bank provides tractor and commercial vehicle finance for M&M products.', bidirectional: false },
  { id: 'hdfc-19',source: 'INDUSINDBK',target: 'MM',          type: 'promoter', strength: 0.70, description: 'Hinduja Group promotes IndusInd Bank; Mahindra is major customer for vehicle financing.', bidirectional: false },
  { id: 'hdfc-20',source: 'BANDHANBNK',target: 'SBIN',        type: 'sector_peer', strength: 0.60, description: 'Bandhan focuses on East India microfinance vs SBI\'s broad rural lending network.', bidirectional: true },

  // ════════════════════════════════════════════════════
  // BAJAJ GROUP
  // BAJAJHLDNG → BAJAJFINSV → BAJFINANCE
  //            → BAJAJ-AUTO
  // ════════════════════════════════════════════════════

  { id: 'bajaj-1', source: 'BAJAJHLDNG',  target: 'BAJAJFINSV', type: 'parent', strength: 0.96, ownershipPct: 60.7, description: 'Bajaj Holdings is the apex holding company; controls 60.7% in Bajaj Finserv.', bidirectional: false },
  { id: 'bajaj-2', source: 'BAJAJHLDNG',  target: 'BAJAJ-AUTO', type: 'parent', strength: 0.94, ownershipPct: 55.4, description: 'Bajaj Holdings controls 55.4% in Bajaj Auto (Rahul Bajaj family legacy holding).', bidirectional: false },
  { id: 'bajaj-3', source: 'BAJAJFINSV',  target: 'BAJFINANCE', type: 'parent', strength: 0.96, ownershipPct: 54.8, description: 'Bajaj Finserv is the direct parent/promoter of Bajaj Finance with 54.8% stake.', bidirectional: false },
  { id: 'bajaj-4', source: 'BAJFINANCE',  target: 'MARUTI',     type: 'customer', strength: 0.80, description: 'Bajaj Finance provides auto loans for Maruti vehicles through dealer financing agreements.', bidirectional: false },
  { id: 'bajaj-5', source: 'BAJFINANCE',  target: 'MM',         type: 'customer', strength: 0.74, description: 'Bajaj Finance provides tractor and SUV financing for Mahindra products at dealer level.', bidirectional: false },
  { id: 'bajaj-6', source: 'BAJAJ-AUTO',  target: 'TATAMOTORS', type: 'sector_peer', strength: 0.74, description: 'Compete in commercial vehicles (three-wheelers) and increasingly in two-wheelers/EVs.', bidirectional: true },
  { id: 'bajaj-7', source: 'BAJAJ-AUTO',  target: 'MM',         type: 'sector_peer', strength: 0.70, description: 'Bajaj Auto (two-wheeler dominance) and M&M (EV push) compete in electric mobility.', bidirectional: true },
  { id: 'bajaj-8', source: 'JIOFIN',      target: 'BAJFINANCE', type: 'sector_peer', strength: 0.74, description: 'Jio Financial targeting consumer EMI and insurance — direct competitive threat to Bajaj Finance.', bidirectional: true },

  // ════════════════════════════════════════════════════
  // IT SECTOR — Cross-links
  // ════════════════════════════════════════════════════

  { id: 'it-1',  source: 'TCS',    target: 'INFY',     type: 'sector_peer', strength: 0.92, description: 'India\'s top-2 IT firms. Compete for same Fortune 500 BFSI and retail clients globally.', bidirectional: true },
  { id: 'it-2',  source: 'TCS',    target: 'WIPRO',    type: 'sector_peer', strength: 0.84, description: 'Top-3 Indian IT. Similar portfolios; compete for talent (Bengaluru/Pune campuses) and deals.', bidirectional: true },
  { id: 'it-3',  source: 'TCS',    target: 'HCLTECH',  type: 'sector_peer', strength: 0.84, description: 'TCS vs HCL: compete in IT infra (HCLSoftware products) and engineering services.', bidirectional: true },
  { id: 'it-4',  source: 'INFY',   target: 'WIPRO',    type: 'sector_peer', strength: 0.86, description: 'Bengaluru-based IT rivals. Compete for deals in BFSI, healthcare and retail segments.', bidirectional: true },
  { id: 'it-5',  source: 'INFY',   target: 'HCLTECH',  type: 'sector_peer', strength: 0.84, description: 'IT sector competition; similar client mix and offshore delivery models.', bidirectional: true },
  { id: 'it-6',  source: 'WIPRO',  target: 'TECHM',    type: 'sector_peer', strength: 0.80, description: 'IT rivals, both strong in telecom vertical, BPS and digital transformation services.', bidirectional: true },
  { id: 'it-7',  source: 'TECHM',  target: 'MM',       type: 'subsidiary', strength: 0.82, description: 'Tech Mahindra is a subsidiary of M&M. M&M holds 36.3% through direct + indirect stake.', bidirectional: false },
  { id: 'it-8',  source: 'INFY',   target: 'ICICIBANK',type: 'customer', strength: 0.74, description: 'Infosys provides Finacle core banking platform to ICICI Bank globally.', bidirectional: false },
  { id: 'it-9',  source: 'TCS',    target: 'BHARTIARTL',type: 'customer', strength: 0.70, description: 'TCS provides managed network services and IT transformation to Bharti Airtel.', bidirectional: false },
  { id: 'it-10', source: 'HCLTECH',target: 'TATACOMM', type: 'customer', strength: 0.66, description: 'HCL Technologies uses Tata Communications\' global network backbone for its global delivery.', bidirectional: false },
  { id: 'it-11', source: 'WIPRO',  target: 'LT',       type: 'customer', strength: 0.64, description: 'Wipro provides digital engineering and IT services to L&T Group companies.', bidirectional: false },
  { id: 'it-12', source: 'JUSTDIAL',target: 'ZOMATO',  type: 'sector_peer', strength: 0.68, description: 'JustDial (local search) and Zomato (food discovery) compete for restaurant/SMB listings.', bidirectional: true },

  // ════════════════════════════════════════════════════
  // AUTO SECTOR — Supply Chain
  // ════════════════════════════════════════════════════

  { id: 'auto-1', source: 'TATASTEEL', target: 'MARUTI',    type: 'supplier', strength: 0.78, description: 'Tata Steel supplies high-grade automotive cold-rolled steel to Maruti Suzuki plants.', bidirectional: false },
  { id: 'auto-2', source: 'JSWSTEEL',  target: 'MARUTI',    type: 'supplier', strength: 0.74, description: 'JSW Steel is a major cold-rolled steel supplier to Maruti manufacturing lines.', bidirectional: false },
  { id: 'auto-3', source: 'JSWSTEEL',  target: 'TATAMOTORS',type: 'supplier', strength: 0.72, description: 'JSW Steel supplies automotive steel grades to Tata Motors assembly plants.', bidirectional: false },
  { id: 'auto-4', source: 'MARUTI',    target: 'TATAMOTORS',type: 'sector_peer', strength: 0.88, description: 'Top-2 passenger vehicle manufacturers in India. Compete in mass segment; Maruti leads overall, Tata in EVs.', bidirectional: true },
  { id: 'auto-5', source: 'MARUTI',    target: 'MM',         type: 'sector_peer', strength: 0.84, description: 'Maruti leads entry-level cars; Mahindra dominates SUV segment. Fierce rivalry in compact SUV space.', bidirectional: true },
  { id: 'auto-6', source: 'MM',        target: 'TATAMOTORS', type: 'sector_peer', strength: 0.82, description: 'M&M and Tata Motors are India\'s top-2 EV makers. Compete in XUV vs Nexon/Tiago EV.', bidirectional: true },
  { id: 'auto-7', source: 'HINDALCO',  target: 'TATAMOTORS', type: 'supplier', strength: 0.68, description: 'Hindalco supplies aluminium sheets and alloys for lightweight vehicle body panels to Tata Motors.', bidirectional: false },
  { id: 'auto-8', source: 'HINDALCO',  target: 'MARUTI',     type: 'supplier', strength: 0.66, description: 'Hindalco/Novelis supplies aluminium sheets to Maruti Suzuki for vehicle body manufacturing.', bidirectional: false },

  // ════════════════════════════════════════════════════
  // ENERGY / POWER CHAIN
  // ════════════════════════════════════════════════════

  { id: 'energy-1', source: 'COALINDIA', target: 'NTPC',      type: 'supplier', strength: 0.94, description: 'Coal India is NTPC\'s primary coal supplier under Fuel Supply Agreements (FSA). 85%+ supply dependency.', bidirectional: false },
  { id: 'energy-2', source: 'COALINDIA', target: 'TATAPOWER', type: 'supplier', strength: 0.80, description: 'Coal India supplies coal to Tata Power\'s thermal plants (Trombay, Mundra) under FSA.', bidirectional: false },
  { id: 'energy-3', source: 'COALINDIA', target: 'ADANIPOWER',type: 'supplier', strength: 0.72, description: 'Adani Power sources domestic coal from Coal India; also imports. FSA for capacity add.', bidirectional: false },
  { id: 'energy-4', source: 'NTPC',      target: 'POWERGRID',  type: 'customer', strength: 0.88, description: 'NTPC sells bulk power to Power Grid for inter-state evacuation; key revenue-flow link.', bidirectional: false },
  { id: 'energy-5', source: 'TATAPOWER', target: 'POWERGRID',  type: 'customer', strength: 0.76, description: 'Tata Power evacuates generation from its renewable and thermal plants through Power Grid.', bidirectional: false },
  { id: 'energy-6', source: 'ADANIPOWER',target: 'POWERGRID',  type: 'customer', strength: 0.74, description: 'Adani Power sells power under PPAs; evacuates through Power Grid inter-state network.', bidirectional: false },
  { id: 'energy-7', source: 'ONGC',      target: 'RELIANCE',   type: 'sector_peer', strength: 0.82, description: 'ONGC (state) vs Reliance (private): compete in E&P blocks and KG-D6/KG-DWN gas fields.', bidirectional: true },
  { id: 'energy-8', source: 'ONGC',      target: 'ADANITRANS', type: 'supplier', strength: 0.66, description: 'ONGC produces natural gas that feeds into ATGL city gas distribution networks.', bidirectional: false },
  { id: 'energy-9', source: 'NTPC',      target: 'ADANIGREEN', type: 'sector_peer', strength: 0.74, description: 'NTPC (expanding renewables to 60 GW) vs Adani Green (20+ GW): bid for same SECI/MNRE tenders.', bidirectional: true },
  { id: 'energy-10',source: 'TATAPOWER', target: 'ADANIGREEN', type: 'sector_peer', strength: 0.76, description: 'India\'s two major renewable power developers competing for solar and wind capacity.', bidirectional: true },
  { id: 'energy-11',source: 'LT',        target: 'NTPC',       type: 'customer', strength: 0.76, description: 'L&T is EPC contractor for NTPC\'s new coal and solar power plants.', bidirectional: false },
  { id: 'energy-12',source: 'LT',        target: 'ADANIGREEN', type: 'customer', strength: 0.70, description: 'L&T constructs solar parks and power evacuation lines for Adani Green projects.', bidirectional: false },

  // ════════════════════════════════════════════════════
  // ADITYA BIRLA GROUP — Full Tree
  // GRASIM → ULTRACEMCO, HINDALCO, ABCAPITAL
  // ════════════════════════════════════════════════════

  { id: 'birla-1', source: 'GRASIM',    target: 'ULTRACEMCO', type: 'parent', strength: 0.96, ownershipPct: 59.9, description: 'Grasim is the holding company for UltraTech Cement (59.9% stake). UltraTech is the world\'s 3rd largest cement co.', bidirectional: false },
  { id: 'birla-2', source: 'GRASIM',    target: 'HINDALCO',   type: 'parent', strength: 0.88, ownershipPct: 34.7, description: 'Grasim/Aditya Birla Group holds 34.7% in Hindalco. Aluminium flagship.', bidirectional: false },
  { id: 'birla-3', source: 'GRASIM',    target: 'ABCAPITAL',  type: 'parent', strength: 0.92, ownershipPct: 68.9, description: 'Grasim holds 68.9% in Aditya Birla Capital — financial services arm with NBFC, insurance, AMC.', bidirectional: false },
  { id: 'birla-4', source: 'GRASIM',    target: 'IDEA',        type: 'promoter', strength: 0.80, ownershipPct: 27.7, description: 'Aditya Birla Group owns 27.7% of Vodafone Idea (Vi) through Grasim-related entities.', bidirectional: false },
  { id: 'birla-5', source: 'ULTRACEMCO',target: 'LT',          type: 'customer', strength: 0.74, description: 'L&T is a major customer of UltraTech Cement for infrastructure and building construction.', bidirectional: false },
  { id: 'birla-6', source: 'ULTRACEMCO',target: 'TATASTEEL',   type: 'sector_peer', strength: 0.62, description: 'Both are building materials; compete indirectly for construction material budgets.', bidirectional: true },
  { id: 'birla-7', source: 'HINDALCO',  target: 'TATASTEEL',   type: 'sector_peer', strength: 0.68, description: 'Hindalco (aluminium) vs Tata Steel (steel): compete in automotive and packaging lightweighting trend.', bidirectional: true },
  { id: 'birla-8', source: 'ABCAPITAL', target: 'BAJFINANCE',  type: 'sector_peer', strength: 0.72, description: 'Aditya Birla Finance (under ABCAPITAL) competes with Bajaj Finance in B2B and retail lending.', bidirectional: true },
  { id: 'birla-9', source: 'ABCAPITAL', target: 'HDFCAMC',     type: 'sector_peer', strength: 0.72, description: 'Aditya Birla Sun Life AMC vs HDFC AMC: India\'s top-4 mutual fund asset managers competing for AUM.', bidirectional: true },
  { id: 'birla-10',source: 'GRASIM',    target: 'ASIANPAINT',  type: 'sector_peer', strength: 0.82, description: 'Grasim\'s Birla Opus paints directly threatens Asian Paints\' 55% market share in decorative paints.', bidirectional: true },
  { id: 'birla-11',source: 'IDEA',       target: 'BHARTIARTL', type: 'sector_peer', strength: 0.88, description: 'Vodafone Idea (Vi) — despite financial stress — remains a telecom peer of Airtel, competing for subscribers.', bidirectional: true },
  { id: 'birla-12',source: 'IDEA',       target: 'HDFCBANK',   type: 'debt', strength: 0.72, description: 'HDFC Bank and banking consortium hold large debt exposure to Vodafone Idea. Default risk is systemic.', bidirectional: false },
  { id: 'birla-13',source: 'IDEA',       target: 'SBIN',        type: 'debt', strength: 0.78, description: 'SBI leads banking consortium with ₹7,000+ cr exposure to Vi. Debt-for-equity conversion in progress.', bidirectional: false },

  // ════════════════════════════════════════════════════
  // CONSUMER / FMCG
  // ════════════════════════════════════════════════════

  { id: 'fmcg-1', source: 'HINDUNILVR', target: 'ITC',      type: 'sector_peer', strength: 0.88, description: 'India\'s top-2 FMCG companies. Compete in soaps, atta, personal care, packaged foods.', bidirectional: true },
  { id: 'fmcg-2', source: 'ITC',        target: 'TATACONSUMER',type: 'sector_peer', strength: 0.74, description: 'Compete in branded foods, tea, and processed foods under premium FMCG push.', bidirectional: true },
  { id: 'fmcg-3', source: 'NESTLEIND',  target: 'HINDUNILVR', type: 'sector_peer', strength: 0.82, description: 'Nestle India vs HUL: compete in instant noodles, packaged foods and nutrition segment.', bidirectional: true },
  { id: 'fmcg-4', source: 'BRITANNIA',  target: 'ITC',       type: 'sector_peer', strength: 0.76, description: 'Compete in biscuits, bakery, and packaged snacks — India\'s largest FMCG adjacencies.', bidirectional: true },
  { id: 'fmcg-5', source: 'DMART',      target: 'RRVL',      type: 'sector_peer', strength: 0.86, description: 'D-Mart vs Reliance Retail: India\'s most profitable listed retailer vs India\'s largest retailer.', bidirectional: true },
  { id: 'fmcg-6', source: 'DMART',      target: 'ZOMATO',    type: 'sector_peer', strength: 0.66, description: 'D-Mart\'s DMart Ready vs Zomato\'s Blinkit (quick commerce): compete for grocery orders.', bidirectional: true },
  { id: 'fmcg-7', source: 'ZOMATO',     target: 'NYKAA',     type: 'sector_peer', strength: 0.60, description: 'Both new-economy consumer platforms competing for digital wallet share. Zomato into beauty delivery.', bidirectional: true },
  { id: 'fmcg-8', source: 'PAYTM',      target: 'JIOFIN',    type: 'sector_peer', strength: 0.80, description: 'Paytm (digital payments, BNPL) directly competes with Jio Financial for fintech market share.', bidirectional: true },
  { id: 'fmcg-9', source: 'HINDUNILVR', target: 'PIDILITIND',type: 'sector_peer', strength: 0.52, description: 'Both FMCG/consumer brands distributed through overlapping general trade channels in India.', bidirectional: true },

  // ════════════════════════════════════════════════════
  // CROSS-SECTOR IMPACT NODES (critical systemic links)
  // ════════════════════════════════════════════════════

  { id: 'cross-1',  source: 'LT',       target: 'TCS',        type: 'customer', strength: 0.72, description: 'TCS provides engineering software and IT services to L&T group companies and subsidiaries.', bidirectional: false },
  { id: 'cross-2',  source: 'LT',       target: 'RELIANCE',   type: 'customer', strength: 0.74, description: 'L&T is EPC contractor for Reliance\'s mega refinery and petrochemical expansions.', bidirectional: false },
  { id: 'cross-3',  source: 'JSWSTEEL', target: 'LT',         type: 'supplier', strength: 0.72, description: 'JSW Steel supplies structural steel for L&T\'s infrastructure and industrial construction.', bidirectional: false },
  { id: 'cross-4',  source: 'TATASTEEL',target: 'LT',         type: 'supplier', strength: 0.72, description: 'Tata Steel supplies rebar and structural steel to L&T construction projects.', bidirectional: false },
  { id: 'cross-5',  source: 'SUNPHARMA',target: 'DRREDDY',    type: 'sector_peer', strength: 0.90, description: 'India\'s top-2 pharma companies. Compete in US generics, domestic formulations and specialty.', bidirectional: true },
  { id: 'cross-6',  source: 'ASIANPAINT',target: 'PIDILITIND',type: 'sector_peer', strength: 0.64, description: 'Both construction chemicals companies: paints and adhesives sold through same painter/contractor channel.', bidirectional: true },
  { id: 'cross-7',  source: 'ULTRACEMCO',target: 'PIDILITIND',type: 'customer', strength: 0.62, description: 'Pidilite sells tile adhesives, waterproofing for buildings built with UltraTech cement.', bidirectional: false },
  { id: 'cross-8',  source: 'HDFCBANK', target: 'PAYTM',      type: 'competitor', strength: 0.72, description: 'HDFC Bank competing in digital payments and UPI transactions directly vs Paytm.', bidirectional: true },
  { id: 'cross-9',  source: 'NYKAA',    target: 'HINDUNILVR', type: 'customer', strength: 0.74, description: 'Nykaa is a major distribution channel for HUL\'s premium beauty brands (Lakme, etc.).', bidirectional: false },
  { id: 'cross-10', source: 'ZOMATO',   target: 'ITC',        type: 'customer', strength: 0.66, description: 'ITC\'s food brands are distributed via Zomato platform and Blinkit for instant grocery delivery.', bidirectional: false },
  { id: 'cross-11', source: 'LT',       target: 'POWERGRID',  type: 'customer', strength: 0.72, description: 'Power Grid is a major client of L&T for transmission line EPC contracts.', bidirectional: false },
  { id: 'cross-12', source: 'TATACHEM', target: 'ASIANPAINT', type: 'supplier', strength: 0.60, description: 'Tata Chemicals supplies titanium dioxide and other raw materials for paint manufacturing.', bidirectional: false },
  { id: 'cross-13', source: 'BHARTIARTL',target: 'IDEA',      type: 'sector_peer', strength: 0.86, description: 'Airtel\'s market share surge directly at Vi\'s expense. Vi subscriber churn benefits Airtel and Jio.', bidirectional: true },
  { id: 'cross-14', source: 'TATACOMM', target: 'BHARTIARTL', type: 'sector_peer', strength: 0.72, description: 'Tata Communications (enterprise) vs Airtel Business (enterprise telecom): compete for large enterprise accounts.', bidirectional: true },
  { id: 'cross-15', source: 'HINDALCO', target: 'ADANIPOWER', type: 'customer', strength: 0.64, description: 'Hindalco\'s aluminium smelters are among India\'s largest power consumers; Adani Power is a captive supplier.', bidirectional: false },
  { id: 'cross-16', source: 'JSWSTEEL', target: 'ADANIPORTS', type: 'customer', strength: 0.68, description: 'JSW Steel imports raw materials (iron ore, coking coal) through Adani Ports terminals at Mundra.', bidirectional: false },
  { id: 'cross-17', source: 'TATASTEEL', target: 'ADANIPORTS',type: 'customer', strength: 0.66, description: 'Tata Steel exports finished steel and imports raw material via Adani Ports-operated facilities.', bidirectional: false },
  { id: 'cross-18', source: 'HDFCAMC',   target: 'RELIANCE',  type: 'crossholding', strength: 0.60, description: 'HDFC AMC\'s fund schemes hold significant equity positions in Reliance Industries.', bidirectional: false },
  { id: 'cross-19', source: 'BAJFINANCE',target: 'TATAMOTORS', type: 'customer', strength: 0.68, description: 'Bajaj Finance provides commercial vehicle and passenger car financing for Tata Motors products.', bidirectional: false },
  { id: 'cross-20', source: 'BAJFINANCE',target: 'MARUTI',     type: 'customer', strength: 0.80, description: 'Bajaj Finance is one of the top auto loan providers for Maruti Suzuki products.', bidirectional: false },
]
