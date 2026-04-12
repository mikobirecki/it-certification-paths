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

  const getLevelClass = (cert: Cert) => {
    const level = cert.level.toLowerCase()
    const display = (cert.levelDisplay || '').toLowerCase()
    
    // Use base level for color matching
    if (level === 'fundamentals' || display.includes('fundamental') || display.includes('foundational') || display.includes('practitioner') || display.includes('foundations')) return 'level-fundamentals'
    if (level === 'associate' || display.includes('associate')) return 'level-associate'
    if (level === 'professional-expert' || display.includes('professional') || display.includes('expert')) return 'level-expert'
    if (level === 'specialty' || display.includes('specialty') || display.includes('specialist')) return 'level-specialty'
    // RedHat levels
    if (level === 'course' || display.includes('course') || display.includes('free')) return 'level-course'
    if (level === 'exam') return 'level-exam'
    if (level === 'bundle' || display.includes('course+exam')) return 'level-bundle'
    if (level === 'meta') return 'level-meta'
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
                className={`table-cert-item ${getLevelClass(cert)} ${selectedId === cert.id ? 'selected' : ''}`}
                onClick={() => onSelectCert(cert)}
              >
                <span className="table-cert-exam">{cert.exam || '—'}</span>
                <span className="table-cert-title">
                  {cert.title}
                  {cert.retiring && <span className="badge-retiring">⚠ Retiring</span>}
                </span>
                <span className="table-cert-level">{cert.levelDisplay || cert.level}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
