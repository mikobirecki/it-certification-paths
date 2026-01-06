import { useState } from 'react'
import { Panel } from '@xyflow/react'

export default function LegendPanel() {
  const [collapsed, setCollapsed] = useState(true)

  return (
    <Panel position="top-left" style={{ margin: 16 }}>
      <div style={{
        background: 'rgba(15, 23, 42, 0.9)',
        border: '1px solid rgba(148, 163, 184, 0.2)',
        borderRadius: 14,
        padding: collapsed ? '8px 14px' : '12px 14px',
        backdropFilter: 'blur(12px)',
        cursor: 'pointer',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
        transition: 'all 0.2s ease',
      }}
      onClick={() => setCollapsed(!collapsed)}
      >
        <div style={{ fontWeight: 700, fontSize: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, color: '#e2e8f0' }}>
          <span>📋 Legenda</span>
          <span style={{ fontSize: 10, color: '#64748b', transition: 'transform 0.2s', transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)' }}>▼</span>
        </div>

        {!collapsed && (
          <div style={{ marginTop: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
              <span style={{ width: 40, height: 3, background: '#f1f5f9', borderRadius: 2, display: 'inline-block' }} />
              <span style={{ fontSize: 12, color: '#94a3b8' }}><b style={{ color: '#e2e8f0' }}>Required</b> — wymagane</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ width: 40, height: 0, borderTop: '2px dashed #64748b', display: 'inline-block' }} />
              <span style={{ fontSize: 12, color: '#94a3b8' }}><b style={{ color: '#e2e8f0' }}>Recommended</b> — sugerowane</span>
            </div>
          </div>
        )}
      </div>
    </Panel>
  )
}
