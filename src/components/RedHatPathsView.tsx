import type { Cert } from '../types'

interface RedHatPathsViewProps {
  certs: Cert[]
  onSelectCert: (cert: Cert) => void
  selectedId: string | null
  selectedDomain: string
  searchQuery: string
}

const PATH_ORDER = ['Enterprise Linux', 'Ansible', 'OpenShift', 'Cloud-native Applications', 'AI']

export const PATH_NAMES: Record<string, string> = {
  'Enterprise Linux': 'Enterprise Linux track',
  'Ansible': 'Ansible track',
  'OpenShift': 'OpenShift track',
  'Cloud-native Applications': 'Cloud-native Applications track',
  'AI': 'AI track',
}

export default function RedHatPathsView({ certs, onSelectCert, selectedId, selectedDomain, searchQuery }: RedHatPathsViewProps) {
  const pathsToShow = selectedDomain === 'All' ? PATH_ORDER : [selectedDomain]
  
  const matchesSearch = (cert: Cert) => {
    if (!searchQuery) return true
    const hay = `${cert.title} ${cert.code ?? ''} ${cert.exam ?? ''} ${cert.description ?? ''}`.toLowerCase()
    return hay.includes(searchQuery.toLowerCase())
  }
  
  const grouped = pathsToShow.map(path => ({
    path,
    courses: certs.filter(c => c.domain === path && c.level === 'Course' && matchesSearch(c)),
    exams: certs.filter(c => c.domain === path && (c.level === 'Exam' || c.level === 'Meta') && matchesSearch(c))
      .sort((a, b) => (a.rhLevel ?? 0) - (b.rhLevel ?? 0)),
    bundles: certs.filter(c => c.domain === path && c.level === 'Bundle' && matchesSearch(c)),
  })).filter(g => g.courses.length > 0 || g.exams.length > 0 || g.bundles.length > 0)

  const getShortTitle = (cert: Cert) => {
    const code = cert.code || cert.exam || ''
    const title = cert.title.replace(/Red Hat (Certified )?/i, '').replace(/\s*\|\s*\w+\d+/g, '')
    return { code, title: title.length > 40 ? title.substring(0, 40) + '...' : title }
  }

  return (
    <div className="redhat-paths-view">
      {grouped.map(group => (
        <div key={group.path} className="path-section">
          <h3 className="path-title">{PATH_NAMES[group.path] || group.path}</h3>
          <div className="path-grid">
            <div className="path-column">
              <div className="column-header">📚 Courses</div>
              {group.courses.map(cert => {
                const { code, title } = getShortTitle(cert)
                return (
                  <div
                    key={cert.id}
                    className={`cert-item course ${selectedId === cert.id ? 'selected' : ''}`}
                    onClick={() => onSelectCert(cert)}
                  >
                    <span className="cert-code">{code}</span>
                    <span className="cert-title">{title}</span>
                    {cert.levelDisplay?.includes('Free') && <span className="cert-badge free">Free</span>}
                  </div>
                )
              })}
              {group.courses.length === 0 && <div className="empty">—</div>}
            </div>
            <div className="path-column">
              <div className="column-header">📝 Exams</div>
              {group.exams.map(cert => {
                const { code, title } = getShortTitle(cert)
                return (
                  <div
                    key={cert.id}
                    className={`cert-item exam ${selectedId === cert.id ? 'selected' : ''}`}
                    onClick={() => onSelectCert(cert)}
                  >
                    <span className="cert-code">{cert.level === 'Meta' ? (cert.code ?? 'META') : code}</span>
                    <span className="cert-title">{title}</span>
                    {cert.rhLevel != null && <span className="cert-badge meta">L{cert.rhLevel}</span>}
                    {cert.level === 'Meta' && <span className="cert-badge meta">no exam</span>}
                  </div>
                )
              })}
              {group.exams.length === 0 && <div className="empty">—</div>}
            </div>
            <div className="path-column">
              <div className="column-header">📦 Bundles</div>
              {group.bundles.map(cert => {
                const { code, title } = getShortTitle(cert)
                return (
                  <div
                    key={cert.id}
                    className={`cert-item bundle ${selectedId === cert.id ? 'selected' : ''}`}
                    onClick={() => onSelectCert(cert)}
                  >
                    <span className="cert-code">{code}</span>
                    <span className="cert-title">{title}</span>
                  </div>
                )
              })}
              {group.bundles.length === 0 && <div className="empty">—</div>}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
