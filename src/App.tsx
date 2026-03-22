import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  useEdgesState,
  useNodesState,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import type { Cert, Vendor } from './types'
import { defaultCerts, defaultLinks } from './data/defaultData'
import { buildFlowElements } from './graph/buildFlow'
import AboutSection from './components/AboutSection'
import TableView from './components/TableView'
import GraphView from './components/GraphView'
import NodeDetailsPanel from './components/NodeDetailsPanel'

const allVendors: Vendor[] = ['Microsoft']

function matchesText(cert: Cert, q: string) {
  const hay = `${cert.title} ${cert.exam ?? ''} ${cert.vendor} ${cert.level} ${cert.roles.join(' ')} ${cert.description ?? ''}` 
    .toLowerCase()
  return hay.includes(q.toLowerCase())
}

export default function App() {
  const certData = defaultCerts
  const linkData = defaultLinks

  const [vendor, setVendor] = useState<Vendor>('Microsoft')
  const [domain, setDomain] = useState<string>('All')
  const [level, setLevel] = useState<string>('All')
  const [query, setQuery] = useState('')
  const [showRecommended, setShowRecommended] = useState(true)

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('theme')
    return (saved === 'light' || saved === 'dark') ? saved : 'dark'
  })
  const [viewMode, setViewMode] = useState<'graph' | 'table'>('graph')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark')

  const filteredCertsByVendor = useMemo(() => {
    return certData.filter(c => c.vendor === vendor)
  }, [certData, vendor])

  const filteredLinksByVendor = useMemo(() => {
    const certIds = new Set(filteredCertsByVendor.map(c => c.id))
    return linkData.filter(l => certIds.has(l.sourceId) && certIds.has(l.targetId))
  }, [linkData, filteredCertsByVendor])

  // Dynamic levels based on vendor's certifications
  const vendorLevels = useMemo(() => {
    const levels = new Set<string>()
    filteredCertsByVendor.forEach(c => {
      levels.add(c.levelDisplay ?? c.level)
    })
    return ['All', ...Array.from(levels).sort()]
  }, [filteredCertsByVendor])

  // Dynamic domains based on vendor's certifications
  const vendorDomains = useMemo(() => {
    const domains = new Set<string>()
    filteredCertsByVendor.forEach(c => {
      if (c.domain) domains.add(c.domain)
    })
    return ['All', ...Array.from(domains).sort()]
  }, [filteredCertsByVendor])

  const built = useMemo(() => {
    return buildFlowElements(filteredCertsByVendor, filteredLinksByVendor)
  }, [filteredCertsByVendor, filteredLinksByVendor])

  const [nodes, setNodes] = useNodesState(built.nodes)
  const [edges, setEdges] = useEdgesState(built.edges)

  useEffect(() => {
    setNodes(built.nodes)
    setEdges(built.edges)
  }, [built.nodes, built.edges, setNodes, setEdges])


  const selectedCert = useMemo(() => {
    if (!selectedId) return null
    return certData.find((c) => c.id === selectedId) ?? null
  }, [selectedId, certData])

  const visible = useMemo(() => {
    const certVisible = (c: Cert) => {
      if (level !== 'All') {
        const certLevelDisplay = c.levelDisplay ?? c.level
        if (certLevelDisplay !== level) return false
      }
      if (domain !== 'All' && c.domain !== domain) return false
      if (query.trim() && !matchesText(c, query.trim())) return false
      return true
    }

    const visibleCertIds = new Set(filteredCertsByVendor.filter(certVisible).map((c) => c.id))
    const visibleNodes = nodes.filter((n) => visibleCertIds.has(n.id))

    const visibleEdges = edges.filter((e) => {
      if (!visibleCertIds.has(e.source) || !visibleCertIds.has(e.target)) return false
      const t = (e.data as { type?: 'required' | 'recommended' })?.type
      if (!showRecommended && t === 'recommended') return false
      return true
    })

    return { visibleCertIds, visibleNodes, visibleEdges }
  }, [nodes, edges, filteredCertsByVendor, domain, level, query, showRecommended])

  const render = useMemo(() => {
    return { nodes: visible.visibleNodes, edges: visible.visibleEdges }
  }, [visible.visibleNodes, visible.visibleEdges])

  const onNodeClick = useCallback((_evt: React.MouseEvent, node: { id: string }) => {
    setSelectedId(node.id)
  }, [])

  const onEdgeClick = useCallback((_evt: React.MouseEvent, edge: { data?: { trainingUrl?: string } }) => {
    if (edge.data?.trainingUrl) {
      window.open(edge.data.trainingUrl, '_blank', 'noreferrer')
    }
  }, [])

  const resetFilters = useCallback(() => {
    setDomain('All')
    setLevel('All')
    setQuery('')
    setShowRecommended(true)
    setSelectedId(null)
  }, [])

  // Reset filters when vendor changes
  useEffect(() => {
    setLevel('All')
    setDomain('All')
    setQuery('')
    setSelectedId(null)
  }, [vendor])

  return (
    <div className="appShell">
      <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
          <div>
            <h1 className="h1">IT Certification Paths</h1>
            <p className="small">
              Certification paths map. Select a vendor to explore available certifications.
            </p>
          </div>
          <button className="theme-toggle" onClick={toggleTheme} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
        
        <button 
          className="mobileToggle" 
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        >
          {sidebarCollapsed ? '▼ Show Filters & Details' : '▲ Hide Filters'}
        </button>

        <hr className="hr" />

        {selectedCert && (
          <NodeDetailsPanel cert={selectedCert} onClose={() => setSelectedId(null)} />
        )}

        <div className="col">
          <div className="row" style={{ gap: 8 }}>
            <div className="col" style={{ flex: 1 }}>
              <label>Vendor</label>
              <select
                value={vendor}
                onChange={(e) => setVendor(e.target.value as Vendor)}
              >
                {allVendors.map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            {vendor !== 'RedHat' && (
              <div className="col" style={{ flex: 1 }}>
                <label>Level</label>
                <select value={level} onChange={(e) => setLevel(e.target.value)}>
                  {vendorLevels.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            )}
          </div>

          {vendor === 'RedHat' && !selectedCert && (
            <div style={{ padding: '10px 12px', background: 'rgba(204, 0, 0, 0.1)', borderRadius: 10, border: '1px solid rgba(204, 0, 0, 0.3)', fontSize: 11, lineHeight: 1.5 }}>
              <div style={{ fontWeight: 700, color: '#cc0000', marginBottom: 6 }}>🎯 Red Hat Certification Model</div>
              <div style={{ color: '#94a3b8' }}>
                <b style={{ color: '#e2e8f0' }}>3-tier structure:</b><br/>
                <b>1. Core:</b> RHCSA (EX200) → RHCE (EX294)<br/>
                <b>2. Specialist:</b> Domain-specific exams<br/>
                <b>3. RHCA:</b> RHCE + 5 specialists
              </div>
            </div>
          )}

          <div className="col" style={{ flex: 1 }}>
            <label>{vendor === 'RedHat' ? 'Certification Path' : 'Domain'}</label>
            <select value={domain} onChange={(e) => setDomain(e.target.value)}>
              {vendorDomains.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div className="col" style={{ position: 'relative' }}>
            <label>Search</label>
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setShowSuggestions(e.target.value.length > 0)
              }}
              onFocus={() => query.length > 0 && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              placeholder="e.g. AZ-104, DevOps, Architect..."
            />
            {showSuggestions && query.length > 0 && (
              <div className="search-suggestions">
                {filteredCertsByVendor
                  .filter(c => matchesText(c, query))
                  .slice(0, 8)
                  .map(c => (
                    <div 
                      key={c.id} 
                      className="suggestion-item"
                      onMouseDown={() => {
                        setQuery(c.title)
                        setSelectedId(c.id)
                        setShowSuggestions(false)
                      }}
                    >
                      <span className="suggestion-exam">{c.exam || c.code || '—'}</span>
                      <span className="suggestion-title">{c.title}</span>
                    </div>
                  ))}
                {filteredCertsByVendor.filter(c => matchesText(c, query)).length === 0 && (
                  <div className="suggestion-empty">No results found</div>
                )}
              </div>
            )}
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
              {filteredCertsByVendor.filter(c => query ? matchesText(c, query) : true).length} certifications for {vendor}
            </div>
          </div>

          <div className="row" style={{ alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="small" style={{ margin: 0 }}>Show recommended paths</span>
            <input
              type="checkbox"
              checked={showRecommended}
              onChange={(e) => setShowRecommended(e.target.checked)}
              style={{ width: 18, height: 18 }}
            />
          </div>

          <div className="row" style={{ alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="small" style={{ margin: 0 }}>View mode</span>
            <div className="view-toggle">
              <button className={viewMode === 'graph' ? 'active' : ''} onClick={() => setViewMode('graph')}>
                🗂️ Graph
              </button>
              <button className={viewMode === 'table' ? 'active' : ''} onClick={() => setViewMode('table')}>
                📝 Table
              </button>
            </div>
          </div>

          <div className="row">
            <button className="btnSecondary" onClick={resetFilters} style={{ flex: 1 }}>
              Reset filters
            </button>
          </div>
        </div>

        {!selectedCert && (
          <p className="small" style={{ marginTop: 8, color: 'var(--text-muted)' }}>
            👆 Click a certification on the map to see details
          </p>
        )}

        <AboutSection />

        <div className="hr" style={{ marginTop: 'auto' }} />
        <div style={{ textAlign: 'center', padding: '8px 0' }}>
          <a 
            href={`mailto:${'mikolaj'}@${'birecki'}.it?subject=IT%20Certification%20Paths%20Feedback`}
            style={{ 
              fontSize: 12, 
              color: '#94a3b8', 
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6
            }}
          >
            💬 <span style={{ textDecoration: 'underline' }}>Send Feedback</span>
          </a>
        </div>
      </aside>

      <main className="canvas">
        {viewMode === 'table' ? (
          <TableView
            certs={filteredCertsByVendor}
            onSelectCert={(cert) => setSelectedId(cert.id)}
            selectedId={selectedId}
            selectedDomain={domain}
            searchQuery={query}
          />
        ) : (
          <GraphView
            nodes={render.nodes}
            edges={render.edges}
            onNodeClick={onNodeClick}
            onEdgeClick={onEdgeClick}
          />
        )}
      </main>
    </div>
  )
}
