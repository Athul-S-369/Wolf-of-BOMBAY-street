import { useEffect, useRef, useState, useCallback } from 'react'
import * as d3 from 'd3'
import { useMarketStore } from '../../store/marketStore'
import { CONNECTIONS, CONNECTION_COLORS, CONNECTION_LABELS } from '../../data/connections'
import type { ConnectionType } from '../../data/connections'
import { SECTOR_COLORS } from '../../data/companies'
import { formatLargeCrore } from '../../utils/format'

interface NodeDatum extends d3.SimulationNodeDatum {
  id: string
  name: string
  symbol: string
  sector: string
  group: string
  marketCap: number
  changePercent: number
  price: number
  color: string
}

interface LinkDatum extends d3.SimulationLinkDatum<NodeDatum> {
  id: string
  type: ConnectionType
  strength: number
  description: string
  bidirectional: boolean
}

export default function CompanyNetwork() {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const { companies, setSelectedCompany, impactSourceId } = useMarketStore()
  const [tooltip, setTooltip] = useState<{ x: number; y: number; content: React.ReactNode } | null>(null)
  const [activeTypes, setActiveTypes] = useState<Set<ConnectionType>>(new Set(Object.keys(CONNECTION_COLORS) as ConnectionType[]))
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(impactSourceId)
  const [filterGroup, setFilterGroup] = useState<string>('ALL')
  const simulationRef = useRef<d3.Simulation<NodeDatum, LinkDatum> | null>(null)

  const groups = ['ALL', ...Array.from(new Set(companies.map(c => c.group)))]

  const toggleType = (type: ConnectionType) => {
    setActiveTypes(prev => {
      const next = new Set(prev)
      if (next.has(type)) next.delete(type)
      else next.add(type)
      return next
    })
  }

  const buildGraph = useCallback(() => {
    if (!svgRef.current || !containerRef.current) return

    const width = containerRef.current.clientWidth
    const height = containerRef.current.clientHeight || 600

    d3.select(svgRef.current).selectAll('*').remove()

    const filteredCompanies = filterGroup === 'ALL' ? companies : companies.filter(c => c.group === filterGroup)
    const companyIds = new Set(filteredCompanies.map(c => c.id))

    const nodes: NodeDatum[] = filteredCompanies.map(c => ({
      id: c.id, name: c.name, symbol: c.symbol,
      sector: c.sector, group: c.group,
      marketCap: c.marketCap, changePercent: c.changePercent,
      price: c.price, color: c.color,
    }))

    const links: LinkDatum[] = CONNECTIONS
      .filter(conn =>
        activeTypes.has(conn.type) &&
        companyIds.has(conn.source as string) &&
        companyIds.has(conn.target as string)
      )
      .map(conn => ({
        ...conn,
        source: conn.source,
        target: conn.target,
      }))

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)

    const defs = svg.append('defs')

    // Arrow markers for each connection type
    Object.entries(CONNECTION_COLORS).forEach(([type, color]) => {
      defs.append('marker')
        .attr('id', `arrow-${type}`)
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 18)
        .attr('refY', 0)
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M0,-5L10,0L0,5')
        .attr('fill', color)
        .attr('opacity', 0.7)
    })

    // Zoom container
    const g = svg.append('g').attr('class', 'zoom-container')

    svg.call(
      d3.zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.2, 4])
        .on('zoom', (event) => g.attr('transform', event.transform))
    )

    // Simulation
    const simulation = d3.forceSimulation<NodeDatum>(nodes)
      .force('link', d3.forceLink<NodeDatum, LinkDatum>(links)
        .id(d => d.id)
        .distance(d => 100 + (1 - d.strength) * 80)
        .strength(d => d.strength * 0.4)
      )
      .force('charge', d3.forceManyBody().strength(-320))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide<NodeDatum>().radius(d => radiusFor(d) + 12))

    simulationRef.current = simulation

    function radiusFor(d: NodeDatum): number {
      const scale = d3.scaleSqrt().domain([50000, 2000000]).range([6, 28])
      return Math.max(6, Math.min(28, scale(d.marketCap)))
    }

    // Links
    const link = g.append('g').attr('class', 'links')
      .selectAll<SVGLineElement, LinkDatum>('line')
      .data(links)
      .enter()
      .append('line')
      .attr('class', 'network-link')
      .attr('stroke', d => CONNECTION_COLORS[d.type])
      .attr('stroke-width', d => d.strength * 2 + 0.5)
      .attr('stroke-opacity', 0.45)
      .attr('marker-end', d => `url(#arrow-${d.type})`)

    // Node groups
    const node = g.append('g').attr('class', 'nodes')
      .selectAll<SVGGElement, NodeDatum>('g')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'network-node')
      .call(
        d3.drag<SVGGElement, NodeDatum>()
          .on('start', (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart()
            d.fx = d.x; d.fy = d.y
          })
          .on('drag', (event, d) => { d.fx = event.x; d.fy = event.y })
          .on('end', (event, d) => {
            if (!event.active) simulation.alphaTarget(0)
            d.fx = null; d.fy = null
          })
      )

    // Node glow aura
    node.append('circle')
      .attr('r', d => radiusFor(d) + 4)
      .attr('fill', d => {
        const isUp = d.changePercent >= 0
        return isUp ? 'rgba(0,212,170,0.08)' : 'rgba(255,71,87,0.08)'
      })

    // Node circle
    node.append('circle')
      .attr('r', d => radiusFor(d))
      .attr('fill', d => d.color || SECTOR_COLORS[d.sector] || '#333')
      .attr('stroke', d => {
        if (d.id === selectedNodeId) return '#d4af37'
        return d.changePercent >= 0 ? 'rgba(0,212,170,0.4)' : 'rgba(255,71,87,0.4)'
      })
      .attr('stroke-width', d => d.id === selectedNodeId ? 2.5 : 1)

    // Price change indicator ring
    node.append('circle')
      .attr('r', d => radiusFor(d) + 2)
      .attr('fill', 'none')
      .attr('stroke', d => d.changePercent >= 0 ? '#00d4aa' : '#ff4757')
      .attr('stroke-width', 1)
      .attr('stroke-opacity', d => Math.min(0.8, Math.abs(d.changePercent) / 3))
      .attr('stroke-dasharray', '3 3')

    // Labels
    node.append('text')
      .attr('dy', d => radiusFor(d) + 12)
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px')
      .attr('font-family', 'JetBrains Mono, monospace')
      .attr('fill', '#ccc')
      .text(d => d.symbol)

    node.append('text')
      .attr('dy', d => radiusFor(d) + 22)
      .attr('text-anchor', 'middle')
      .attr('font-size', '9px')
      .attr('font-family', 'JetBrains Mono, monospace')
      .attr('fill', d => d.changePercent >= 0 ? '#00d4aa' : '#ff4757')
      .text(d => `${d.changePercent >= 0 ? '+' : ''}${d.changePercent.toFixed(1)}%`)

    // Hover interactions
    node.on('mouseover', (event, d) => {
      const rect = svgRef.current!.getBoundingClientRect()
      setTooltip({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
        content: (
          <div className="font-mono text-xs p-1">
            <div className="text-gold-400 font-bold text-sm">{d.symbol}</div>
            <div className="text-neutral text-[10px] mb-2">{d.name}</div>
            <div className="flex justify-between gap-4">
              <span className="text-neutral">Price</span>
              <span className="text-white">₹{d.price.toFixed(2)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-neutral">Change</span>
              <span className={d.changePercent >= 0 ? 'text-gain' : 'text-loss'}>
                {d.changePercent >= 0 ? '+' : ''}{d.changePercent.toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-neutral">Mcap</span>
              <span className="text-white">{formatLargeCrore(d.marketCap)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-neutral">Sector</span>
              <span className="text-white">{d.sector}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-neutral">Group</span>
              <span className="text-gold-400">{d.group}</span>
            </div>
          </div>
        ),
      })
      // Highlight connected links
      link.attr('stroke-opacity', l => {
        const src = (l.source as NodeDatum).id
        const tgt = (l.target as NodeDatum).id
        return src === d.id || tgt === d.id ? 0.9 : 0.1
      })
      link.attr('stroke-width', l => {
        const src = (l.source as NodeDatum).id
        const tgt = (l.target as NodeDatum).id
        return src === d.id || tgt === d.id ? (l.strength * 2 + 1) * 1.5 : l.strength * 2 + 0.5
      })
    })
    .on('mousemove', (event) => {
      const rect = svgRef.current!.getBoundingClientRect()
      setTooltip(t => t ? { ...t, x: event.clientX - rect.left, y: event.clientY - rect.top } : null)
    })
    .on('mouseout', () => {
      setTooltip(null)
      link.attr('stroke-opacity', 0.45)
      link.attr('stroke-width', d => d.strength * 2 + 0.5)
    })
    .on('click', (_, d) => {
      setSelectedNodeId(d.id)
      const company = companies.find(c => c.id === d.id)
      if (company) setSelectedCompany(company)
    })

    // Highlight selected node connections
    if (selectedNodeId) {
      link.attr('stroke-opacity', l => {
        const src = (l.source as NodeDatum).id || (l.source as string)
        const tgt = (l.target as NodeDatum).id || (l.target as string)
        return src === selectedNodeId || tgt === selectedNodeId ? 0.9 : 0.15
      })
    }

    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as NodeDatum).x!)
        .attr('y1', d => (d.source as NodeDatum).y!)
        .attr('x2', d => (d.target as NodeDatum).x!)
        .attr('y2', d => (d.target as NodeDatum).y!)
      node.attr('transform', d => `translate(${d.x!},${d.y!})`)
    })
  }, [companies, activeTypes, filterGroup, selectedNodeId]) // eslint-disable-line

  useEffect(() => { buildGraph() }, [buildGraph])
  useEffect(() => { if (impactSourceId) setSelectedNodeId(impactSourceId) }, [impactSourceId])

  return (
    <div className="flex flex-col h-full">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 p-4 border-b border-surface-200">
        <span className="section-title">COMPANY INTERCONNECTIONS</span>
        <div className="flex flex-wrap gap-1 ml-2">
          {(Object.entries(CONNECTION_COLORS) as [ConnectionType, string][]).map(([type, color]) => (
            <button
              key={type}
              onClick={() => toggleType(type)}
              className={`px-2 py-0.5 rounded text-[9px] font-mono font-semibold border transition-all ${activeTypes.has(type) ? 'border-opacity-70' : 'border-opacity-20 opacity-40'}`}
              style={{ borderColor: color, color: activeTypes.has(type) ? color : '#666', background: activeTypes.has(type) ? `${color}15` : 'transparent' }}
            >
              {CONNECTION_LABELS[type].split(' / ')[0].toUpperCase()}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-[10px] text-neutral font-mono">Group:</span>
          <select
            className="bg-surface-300 border border-surface-200 rounded px-2 py-1 font-mono text-xs text-white outline-none"
            value={filterGroup}
            onChange={e => setFilterGroup(e.target.value)}
          >
            {groups.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
      </div>

      {/* Graph */}
      <div ref={containerRef} className="relative flex-1" style={{ minHeight: 520 }}>
        <svg ref={svgRef} className="w-full h-full" style={{ background: 'radial-gradient(ellipse at center, rgba(15,25,50,1) 0%, rgba(5,8,16,1) 100%)' }} />

        {/* Tooltip */}
        {tooltip && (
          <div
            className="absolute z-50 card border border-gold-700 border-opacity-40 shadow-2xl pointer-events-none"
            style={{ left: tooltip.x + 14, top: tooltip.y - 10, minWidth: 180 }}
          >
            {tooltip.content}
          </div>
        )}

        {/* Legend */}
        <div className="absolute bottom-3 left-3 card p-2">
          <div className="text-[9px] font-mono text-neutral mb-1.5 tracking-widest">LEGEND</div>
          {(Object.entries(CONNECTION_COLORS) as [ConnectionType, string][]).filter(([t]) => activeTypes.has(t)).map(([type, color]) => (
            <div key={type} className="flex items-center gap-1.5 mb-1">
              <div className="w-5 h-px" style={{ background: color }} />
              <span className="text-[9px] font-mono" style={{ color }}>{CONNECTION_LABELS[type]}</span>
            </div>
          ))}
        </div>

        {/* Zoom hint */}
        <div className="absolute bottom-3 right-3 text-[9px] font-mono text-neutral opacity-60">
          Scroll to zoom · Drag to pan · Click node to explore
        </div>
      </div>
    </div>
  )
}
