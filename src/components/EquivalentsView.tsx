import type { Cert, EquivalentGroup, Vendor } from '../types'
import { getRetirementStatus } from '../utils/retirement'

interface EquivalentsViewProps {
  certs: Cert[]
  groups: EquivalentGroup[]
  onSelectCert: (cert: Cert) => void
  selectedId: string | null
  searchQuery: string
}

const VENDOR_ORDER: Vendor[] = ['AWS', 'Microsoft', 'GCP', 'Kubernetes', 'RedHat', 'Anthropic']

export default function EquivalentsView({ certs, groups, onSelectCert, selectedId, searchQuery }: EquivalentsViewProps) {
  const byId = new Map(certs.map(c => [c.id, c]))

  const visibleGroups = groups.filter(g => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    if (g.title.toLowerCase().includes(q)) return true
    return g.certIds.some(id => {
      const c = byId.get(id)
      return c && `${c.title} ${c.exam ?? ''} ${c.code ?? ''}`.toLowerCase().includes(q)
    })
  })

  const vendorSet = new Set<Vendor>()
  visibleGroups.forEach(g => g.certIds.forEach(id => {
    const c = byId.get(id)
    if (c) vendorSet.add(c.vendor)
  }))
  const columns = [
    ...VENDOR_ORDER.filter(v => vendorSet.has(v)),
    ...Array.from(vendorSet).filter(v => !VENDOR_ORDER.includes(v)),
  ]

  return (
    <div className="table-view equivalents-view">
      {visibleGroups.map(group => {
        const groupCerts = group.certIds.map(id => byId.get(id)).filter((c): c is Cert => !!c)
        return (
          <div key={group.id} className="table-section">
            <h3 className="table-domain-header">
              {group.title}
              {group.description && <span className="eq-group-desc">{group.description}</span>}
            </h3>
            <div className="eq-grid" style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(200px, 1fr))` }}>
              {columns.map(vendor => {
                const cellCerts = groupCerts.filter(c => c.vendor === vendor)
                return (
                  <div key={vendor} className="eq-cell">
                    <div className="eq-vendor">{vendor}</div>
                    {cellCerts.length === 0 && <div className="eq-empty">—</div>}
                    {cellCerts.map(cert => {
                      const status = getRetirementStatus(cert)
                      return (
                        <div
                          key={cert.id}
                          className={`eq-cert ${selectedId === cert.id ? 'selected' : ''}`}
                          onClick={() => onSelectCert(cert)}
                        >
                          <div className="eq-cert-top">
                            <span className="eq-cert-exam">{cert.exam ?? cert.code ?? ''}</span>
                            {status === 'retired'
                              ? <span className="badge-retired">Retired</span>
                              : status === 'retiring' && <span className="badge-retiring">⚠ Retiring</span>}
                          </div>
                          <div className="eq-cert-title">{cert.title}</div>
                          <div className="eq-cert-meta">
                            <span>{cert.levelDisplay ?? cert.level}</span>
                            {cert.price && <span>{cert.price}</span>}
                            {cert.validityPeriod && <span>{cert.validityPeriod}</span>}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
      {visibleGroups.length === 0 && <div className="empty">No matching groups</div>}
    </div>
  )
}
