import type { Cert } from '../types'

type NodeDetailsPanelProps = {
  cert: Cert
  onClose: () => void
}

export default function NodeDetailsPanel({ cert, onClose }: NodeDetailsPanelProps) {
  return (
    <div
      data-testid="node-details-panel"
      style={{
        padding: '12px',
        background: 'rgba(99, 102, 241, 0.1)',
        borderRadius: 12,
        border: '1px solid rgba(99, 102, 241, 0.3)',
        marginBottom: 8,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <span className={`vendorBadge ${cert.vendor.toLowerCase()}`}>{cert.vendor}</span>
        <button
          onClick={onClose}
          style={{
            background: 'rgba(239, 68, 68, 0.2)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            borderRadius: 6,
            color: '#fca5a5',
            padding: '4px 8px',
            fontSize: 10,
            cursor: 'pointer',
          }}
        >
          ✕ Close
        </button>
      </div>

      <div style={{ fontWeight: 800, fontSize: 14, lineHeight: 1.3, marginBottom: 8 }}>{cert.title}</div>

      <div className="kv" style={{ fontSize: 11 }}>
        <div className="k">Level</div>
        <div className="v">{cert.levelDisplay ?? cert.level}</div>
        {cert.domain && (
          <>
            <div className="k">Domain</div>
            <div className="v">{cert.domain}</div>
          </>
        )}
        <div className="k">Exam</div>
        <div className="v">{cert.exam ?? '—'}</div>
        <div className="k">Price</div>
        <div className="v" style={{ color: '#34d399', fontWeight: 700 }}>
          {cert.price ?? '—'}
        </div>
      </div>

      {cert.prerequisites && (
        <div
          className="small"
          style={{
            padding: '8px 10px',
            background: 'rgba(251, 191, 36, 0.15)',
            borderRadius: 8,
            border: '1px solid rgba(251, 191, 36, 0.3)',
            marginTop: 8,
            fontSize: 11,
          }}
        >
          <b style={{ color: '#fcd34d' }}>Prerequisites:</b> {cert.prerequisites}
        </div>
      )}

      {cert.description && (
        <p className="small" style={{ margin: '8px 0 0 0', color: '#94a3b8', fontSize: 11 }}>
          {cert.description}
        </p>
      )}

      {cert.url && (
        <a
          href={cert.url}
          target="_blank"
          rel="noreferrer"
          style={{
            padding: '8px 12px',
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            borderRadius: 8,
            color: 'white',
            fontWeight: 700,
            fontSize: 11,
            textAlign: 'center',
            display: 'block',
            marginTop: 10,
            boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
          }}
        >
          Official certification page
        </a>
      )}
    </div>
  )
}
