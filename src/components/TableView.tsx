import type { Cert } from '../types'

interface TableViewProps {
  certs: Cert[]
  onSelectCert: (cert: Cert) => void
  selectedId: string | null
  selectedDomain: string
  searchQuery: string
}

export default function TableView({ certs, onSelectCert, selectedId, selectedDomain, searchQuery }: TableViewProps) {
  const filteredCerts = certs.filter(c => {
    if (selectedDomain !== 'All' && c.domain !== selectedDomain) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      const hay = `${c.title} ${c.exam ?? ''} ${c.domain ?? ''} ${c.level}`.toLowerCase()
      if (!hay.includes(q)) return false
    }
    return true
  })

  const groupedByDomain = filteredCerts.reduce((acc, cert) => {
    const domain = cert.domain || 'General'
    if (!acc[domain]) acc[domain] = []
    acc[domain].push(cert)
    return acc
  }, {} as Record<string, Cert[]>)

  const sortedDomains = Object.keys(groupedByDomain).sort()

  const getLevelClass = (level: string) => {
    const l = level.toLowerCase()
    if (l.includes('fundamental') || l.includes('foundational')) return 'level-fundamentals'
    if (l.includes('associate')) return 'level-associate'
    if (l.includes('professional') || l.includes('expert')) return 'level-expert'
    if (l.includes('specialty')) return 'level-specialty'
    return 'level-other'
  }

  if (filteredCerts.length === 0) {
    return (
      <div className="table-view">
        <div className="empty">No certifications match your filters</div>
      </div>
    )
  }

  return (
    <div className="table-view">
      {sortedDomains.map(domain => (
        <div key={domain} className="table-section">
          <h3 className="table-domain-header">{domain}</h3>
          <div className="table-grid">
            {groupedByDomain[domain].map(cert => (
              <div
                key={cert.id}
                className={`table-cert-item ${getLevelClass(cert.levelDisplay || cert.level)} ${selectedId === cert.id ? 'selected' : ''}`}
                onClick={() => onSelectCert(cert)}
              >
                <span className="table-cert-exam">{cert.exam || '—'}</span>
                <span className="table-cert-title">{cert.title}</span>
                <span className="table-cert-level">{cert.levelDisplay || cert.level}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
