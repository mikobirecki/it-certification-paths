import { Handle, Position } from '@xyflow/react'
import type { Cert, Level } from '../types'

type CertNodeProps = {
  data: { cert: Cert }
  selected?: boolean
}

function levelAccent(level: Level) {
  switch (level) {
    case 'Fundamentals':
      return { border: '#3b82f6', bg: '#eff6ff' }
    case 'Associate':
      return { border: '#10b981', bg: '#ecfdf5' }
    case 'Professional-Expert':
      return { border: '#f59e0b', bg: '#fffbeb' }
    case 'Specialty':
      return { border: '#ec4899', bg: '#fdf2f8' }
    default:
      return { border: '#94a3b8', bg: '#f8fafc' }
  }
}

export default function CertNode(props: CertNodeProps) {
  const cert = props.data.cert
  const acc = levelAccent(cert.level)

  return (
    <div
      style={{
        width: 320,
        borderRadius: 16,
        border: `1px solid ${acc.border}40`,
        background: 'rgba(15, 23, 42, 0.95)',
        boxShadow: props.selected 
          ? `0 0 0 3px ${acc.border}60, 0 20px 40px rgba(0,0,0,0.4)` 
          : '0 10px 30px rgba(0, 0, 0, 0.3)',
        overflow: 'hidden',
        position: 'relative',
        backdropFilter: 'blur(10px)',
      }}
    >
      <Handle 
        type="target" 
        position={Position.Left} 
        style={{ background: acc.border, width: 10, height: 10, border: '2px solid rgba(15,23,42,0.8)' }} 
      />
      
      <div style={{ 
        padding: '10px 12px', 
        background: `linear-gradient(135deg, ${acc.border}30, ${acc.border}10)`,
        borderBottom: `1px solid ${acc.border}30`
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center' }}>
          <span style={{ 
            padding: '4px 10px', 
            borderRadius: 8, 
            fontSize: 11, 
            fontWeight: 700,
            background: `${acc.border}25`,
            color: acc.border,
            border: `1px solid ${acc.border}40`
          }}>
            {cert.levelDisplay ?? cert.level}
          </span>
          <div style={{ display: 'flex', gap: 6 }}>
            {cert.exam ? <span style={{ 
              padding: '4px 8px', 
              borderRadius: 6, 
              fontSize: 10, 
              fontWeight: 700,
              background: 'rgba(100, 116, 139, 0.3)',
              color: '#e2e8f0',
              fontFamily: 'monospace'
            }}>{cert.exam}</span> : null}
            {cert.price ? <span style={{ 
              padding: '4px 8px', 
              borderRadius: 6, 
              fontSize: 10, 
              fontWeight: 700,
              background: 'rgba(52, 211, 153, 0.2)',
              color: '#34d399'
            }}>{cert.price}</span> : null}
          </div>
        </div>
      </div>

      <div style={{ padding: '12px' }}>
        <div style={{ fontWeight: 800, fontSize: 13, lineHeight: 1.3, color: '#f1f5f9' }}>{cert.title}</div>
        <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 5 }}>
          {cert.roles.map((r) => (
            <span key={r} style={{
              padding: '3px 8px',
              borderRadius: 6,
              fontSize: 10,
              fontWeight: 600,
              background: 'rgba(99, 102, 241, 0.2)',
              color: '#a5b4fc',
              border: '1px solid rgba(99, 102, 241, 0.3)'
            }}>{r}</span>
          ))}
        </div>
      </div>
      
      <Handle 
        type="source" 
        position={Position.Right} 
        style={{ background: acc.border, width: 10, height: 10, border: '2px solid rgba(15,23,42,0.8)' }} 
      />
    </div>
  )
}
