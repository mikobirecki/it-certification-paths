import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ReactFlow,
  Background,
  useEdgesState,
  useNodesState,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import type { Cert, Vendor } from './types'
import { defaultCerts, defaultLinks } from './data/defaultData'
import { buildFlowElements } from './graph/buildFlow'
import CertNode from './components/CertNode'
import LegendPanel from './components/LegendPanel'

const nodeTypes = { certNode: CertNode }

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
  }, [vendor])

  return (
    <div className="appShell">
      <aside className="sidebar">
        <div>
          <h1 className="h1">IT Certification Paths</h1>
          <p className="small">
            Certification paths map. Select a vendor to explore available certifications.
          </p>
        </div>

        <hr className="hr" />

        <div className="col">
          <div className="col">
            <label>Vendor</label>
            <select
              value={vendor}
              onChange={(e) => setVendor(e.target.value as Vendor)}
            >
              {allVendors.map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>

          {vendor === 'RedHat' && (
            <div style={{ padding: '10px 12px', background: 'rgba(204, 0, 0, 0.1)', borderRadius: 10, border: '1px solid rgba(204, 0, 0, 0.3)', fontSize: 11, lineHeight: 1.5 }}>
              <div style={{ fontWeight: 700, color: '#cc0000', marginBottom: 6 }}>🎯 Red Hat Certification Model</div>
              <div style={{ color: '#94a3b8' }}>
                <b style={{ color: '#e2e8f0' }}>3-tier structure:</b><br/>
                <b>1. Core:</b> RHCSA (EX200) → RHCE (EX294)<br/>
                <b>2. Specialist:</b> Domain-specific exams (OpenShift, Ansible, Security...)<br/>
                <b>3. RHCA:</b> RHCE + 5 specialist exams<br/><br/>
                <span style={{ color: '#64748b' }}>Specialist exams "count toward" RHCA. Certifications stay current for 3 years.</span>
              </div>
            </div>
          )}

          <div className="row">
            <div className="col" style={{ flex: 1 }}>
              <label>Level</label>
              <select value={level} onChange={(e) => setLevel(e.target.value)}>
                {vendorLevels.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>

            <div className="col" style={{ flex: 1 }}>
              <label>Domain</label>
              <select value={domain} onChange={(e) => setDomain(e.target.value)}>
                {vendorDomains.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          <div className="col">
            <label>Search</label>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. AZ-104, DevOps, Architect..."
              list="cert-list"
            />
            <datalist id="cert-list">
              {filteredCertsByVendor.map((c) => (
                <option key={c.id} value={c.title} />
              ))}
            </datalist>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
              {filteredCertsByVendor.length} certifications for {vendor}
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

        <hr className="hr" />

        <div style={{ flex: 1, overflow: 'auto' }}>
          <div style={{ fontWeight: 800, fontSize: 11, marginBottom: 10, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Certification details</div>

          {!selectedCert ? (
            <p className="small">Click a node on the map to see certification details.</p>
          ) : (
            <div className="col" style={{ gap: 12 }}>
              <div>
                <span className={`vendorBadge ${selectedCert.vendor.toLowerCase()}`}>{selectedCert.vendor}</span>
              </div>
              <div style={{ fontWeight: 800, fontSize: 15, lineHeight: 1.3 }}>{selectedCert.title}</div>

              <div className="kv">
                <div className="k">Level</div><div className="v">{selectedCert.levelDisplay ?? selectedCert.level}</div>
                {selectedCert.domain && <><div className="k">Domain</div><div className="v">{selectedCert.domain}</div></>}
                <div className="k">Exam</div><div className="v">{selectedCert.exam ?? '—'}</div>
                <div className="k">💰 Price</div><div className="v" style={{ color: '#34d399', fontWeight: 700 }}>{selectedCert.price ?? '—'}</div>
                {selectedCert.scoreToPass && <><div className="k">🎯 Passing score</div><div className="v" style={{ color: '#fbbf24', fontWeight: 700 }}>{selectedCert.scoreToPass}/1000</div></>}
                <div className="k">⏱️ Validity</div><div className="v">{selectedCert.validityPeriod ?? '—'}</div>
                {selectedCert.examLength && <><div className="k">⏰ Duration</div><div className="v">{selectedCert.examLength}</div></>}
                {selectedCert.examFormat && <><div className="k">📝 Format</div><div className="v">{selectedCert.examFormat}</div></>}
                {selectedCert.examLanguages && <><div className="k">🌐 Languages</div><div className="v">{selectedCert.examLanguages.join(', ')}</div></>}
                {selectedCert.renewalAvailable && <><div className="k">🔄 Renewal</div><div className="v" style={{ color: '#34d399' }}>{selectedCert.renewalPrice ?? 'Available'}</div></>}
                {selectedCert.lastUpdate && <><div className="k">📅 Last update</div><div className="v">{selectedCert.lastUpdate}</div></>}
                <div className="k">🎭 Roles</div><div className="v">{(selectedCert.rolesDisplay ?? selectedCert.roles).join(', ')}</div>
              </div>

              {selectedCert.prerequisites ? (
                <div className="small" style={{ padding: '10px 12px', background: 'rgba(251, 191, 36, 0.15)', borderRadius: 10, border: '1px solid rgba(251, 191, 36, 0.3)' }}>
                  <span style={{ color: '#fbbf24' }}>⚠️</span> <b style={{ color: '#fcd34d' }}>Prerequisites:</b> {selectedCert.prerequisites}
                </div>
              ) : null}

              {selectedCert.description ? (
                <p className="small" style={{ marginTop: 0, color: '#94a3b8' }}>{selectedCert.description}</p>
              ) : null}

              {selectedCert.officialResources && selectedCert.officialResources.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>📚 Official resources</div>
                  {selectedCert.officialResources.map((res, i) => (
                    <a key={i} href={res.url} target="_blank" rel="noreferrer" style={{ 
                      padding: '8px 12px', 
                      background: 'rgba(99, 102, 241, 0.15)', 
                      borderRadius: 8, 
                      border: '1px solid rgba(99, 102, 241, 0.3)',
                      fontSize: 12,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}>
                      📖 {res.title}
                    </a>
                  ))}
                </div>
              ) : null}

              {selectedCert.url ? (
                <a href={selectedCert.url} target="_blank" rel="noreferrer" style={{ 
                  padding: '10px 14px', 
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', 
                  borderRadius: 10, 
                  color: 'white',
                  fontWeight: 700,
                  fontSize: 12,
                  textAlign: 'center',
                  display: 'block',
                  boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)'
                }}>
                  🔗 Official certification page
                </a>
              ) : null}
            </div>
          )}
        </div>
      </aside>

      <main className="canvas">
        <ReactFlow
          nodes={render.nodes}
          edges={render.edges}
          nodeTypes={nodeTypes}
          onNodeClick={onNodeClick}
          fitView
          fitViewOptions={{ padding: 0.18 }}
          proOptions={{ hideAttribution: true }}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={true}
          panOnDrag={true}
          zoomOnScroll={true}
          zoomOnPinch={true}
          zoomOnDoubleClick={false}
          minZoom={0.3}
          maxZoom={1.5}
        >
          <LegendPanel />
          <Background />
        </ReactFlow>
      </main>
    </div>
  )
}
