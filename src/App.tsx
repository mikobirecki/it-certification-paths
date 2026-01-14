import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  useEdgesState,
  useNodesState,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import type { Cert, Vendor } from './types'
import { defaultCerts, defaultLinks } from './data/defaultData'
import { buildFlowElements } from './graph/buildFlow'
import CertNode from './components/CertNode'
import TrainingEdge from './components/TrainingEdge'
import LegendPanel from './components/LegendPanel'
import RedHatPathsView, { PATH_NAMES } from './components/RedHatPathsView'

const nodeTypes = { certNode: CertNode }
const edgeTypes = { training: TrainingEdge }

const allVendors: Vendor[] = ['AWS', 'Azure', 'GCP', 'Microsoft', 'GitHub', 'RedHat', 'HashiCorp', 'Kubernetes']

function matchesText(cert: Cert, q: string) {
  const hay = `${cert.title} ${cert.exam ?? ''} ${cert.vendor} ${cert.level} ${cert.roles.join(' ')} ${cert.description ?? ''}` 
    .toLowerCase()
  return hay.includes(q.toLowerCase())
}

export default function App() {
  const certData = defaultCerts
  const linkData = defaultLinks

  const [vendor, setVendor] = useState<Vendor>('AWS')
  const [domain, setDomain] = useState<string>('All')
  const [level, setLevel] = useState<string>('All')
  const [query, setQuery] = useState('')
  const [showRecommended, setShowRecommended] = useState(true)

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)

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
        </div>
        
        <button 
          className="mobileToggle" 
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        >
          {sidebarCollapsed ? '▼ Show Filters & Details' : '▲ Hide Filters'}
        </button>

        <hr className="hr" />

        {/* Certification Details - pokazywane na górze gdy wybrany */}
        {selectedCert && (
          <div style={{ 
            padding: '12px', 
            background: 'rgba(99, 102, 241, 0.1)', 
            borderRadius: 12, 
            border: '1px solid rgba(99, 102, 241, 0.3)',
            marginBottom: 8
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <span className={`vendorBadge ${selectedCert.vendor.toLowerCase()}`}>{selectedCert.vendor}</span>
              <button 
                onClick={() => setSelectedId(null)} 
                style={{ 
                  background: 'rgba(239, 68, 68, 0.2)', 
                  border: '1px solid rgba(239, 68, 68, 0.4)', 
                  borderRadius: 6, 
                  color: '#fca5a5', 
                  padding: '4px 8px', 
                  fontSize: 10, 
                  cursor: 'pointer' 
                }}
              >
                ✕ Close
              </button>
            </div>
            <div style={{ fontWeight: 800, fontSize: 14, lineHeight: 1.3, marginBottom: 8 }}>{selectedCert.title}</div>
            
            <div className="kv" style={{ fontSize: 11 }}>
              <div className="k">Level</div><div className="v">{selectedCert.levelDisplay ?? selectedCert.level}</div>
              {selectedCert.domain && <><div className="k">Domain</div><div className="v">{selectedCert.domain}</div></>}
              <div className="k">Exam</div><div className="v">{selectedCert.exam ?? '—'}</div>
              <div className="k">💰 Price</div><div className="v" style={{ color: '#34d399', fontWeight: 700 }}>{selectedCert.price ?? '—'}</div>
              <div className="k">⏱️ Validity</div><div className="v">{selectedCert.validityPeriod ?? '—'}</div>
              {selectedCert.scoreToPass && <><div className="k">🎯 Pass score</div><div className="v" style={{ color: '#fbbf24', fontWeight: 700 }}>{selectedCert.scoreToPass}/1000</div></>}
            </div>

            {selectedCert.prerequisites && (
              <div className="small" style={{ padding: '8px 10px', background: 'rgba(251, 191, 36, 0.15)', borderRadius: 8, border: '1px solid rgba(251, 191, 36, 0.3)', marginTop: 8, fontSize: 11 }}>
                <span style={{ color: '#fbbf24' }}>⚠️</span> <b style={{ color: '#fcd34d' }}>Prerequisites:</b> {selectedCert.prerequisites}
              </div>
            )}

            {selectedCert.description && (
              <p className="small" style={{ margin: '8px 0 0 0', color: '#94a3b8', fontSize: 11 }}>{selectedCert.description}</p>
            )}

            {selectedCert.url && (
              <a href={selectedCert.url} target="_blank" rel="noreferrer" style={{ 
                padding: '8px 12px', 
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', 
                borderRadius: 8, 
                color: 'white',
                fontWeight: 700,
                fontSize: 11,
                textAlign: 'center',
                display: 'block',
                marginTop: 10,
                boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)'
              }}>
                🔗 Official certification page
              </a>
            )}

            {selectedCert.officialResources && selectedCert.officialResources.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 4 }}>📚 Resources</div>
                {selectedCert.officialResources.slice(0, 2).map((res, i) => (
                  <a key={i} href={res.url} target="_blank" rel="noreferrer" style={{ 
                    padding: '6px 10px', 
                    background: 'rgba(99, 102, 241, 0.15)', 
                    borderRadius: 6, 
                    border: '1px solid rgba(99, 102, 241, 0.3)',
                    fontSize: 11,
                    display: 'block',
                    marginTop: 4
                  }}>
                    📖 {res.title}
                  </a>
                ))}
              </div>
            )}
          </div>
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
                  {vendor === 'RedHat' && d !== 'All' ? PATH_NAMES[d] || d : d}
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

          <div className="row">
            <button className="btnSecondary" onClick={resetFilters} style={{ flex: 1 }}>
              Reset filters
            </button>
          </div>
        </div>

        {!selectedCert && (
          <p className="small" style={{ marginTop: 8, color: '#64748b' }}>
            👆 Click a certification on the map to see details
          </p>
        )}

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
        {vendor === 'RedHat' ? (
          <RedHatPathsView 
            certs={filteredCertsByVendor} 
            onSelectCert={(cert) => setSelectedId(cert.id)}
            selectedId={selectedId}
            selectedDomain={domain}
            searchQuery={query}
          />
        ) : (
          <ReactFlow
            nodes={render.nodes}
            edges={render.edges}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onNodeClick={onNodeClick}
            onEdgeClick={onEdgeClick}
            fitView
            fitViewOptions={{ padding: 0.18 }}
            proOptions={{ hideAttribution: true }}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={true}
            panOnDrag={true}
            panOnScroll={true}
            zoomOnScroll={false}
            zoomOnPinch={true}
            zoomOnDoubleClick={false}
            minZoom={0.3}
            maxZoom={2}
          >
            <Controls showInteractive={false} />
            <LegendPanel />
            <Background />
          </ReactFlow>
        )}
      </main>
    </div>
  )
}
