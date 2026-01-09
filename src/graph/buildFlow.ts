import type { Cert, CertLink, Level, Vendor } from '../types'
import type { Edge, Node } from '@xyflow/react'
import { MarkerType } from '@xyflow/react'

const levelOrder: Level[] = ['Fundamentals', 'Associate', 'Professional-Expert', 'Specialty']

export type BuildOptions = {
  xGap?: number
  yGap?: number
  vendorXOffset?: number
  levelYOffset?: number
}

export function buildFlowElements(certs: Cert[], links: CertLink[], options?: BuildOptions) {
  const xGap = options?.xGap ?? 400
  const yGap = options?.yGap ?? 160
  const xOffset = options?.vendorXOffset ?? 40
  const yOffset = options?.levelYOffset ?? 40

  const slotCounter = new Map<string, number>()
  const slotKey = (v: Vendor, l: Level) => `${v}__${l}` 

  const nodes: Node[] = certs.map((c) => {
    const lIndex = levelOrder.indexOf(c.level)

    const key = slotKey(c.vendor, c.level)
    const slot = slotCounter.get(key) ?? 0
    slotCounter.set(key, slot + 1)

    const x = xOffset + lIndex * xGap
    const y = yOffset + slot * yGap

    return {
      id: c.id,
      type: 'certNode',
      position: { x, y },
      data: { cert: c },
    }
  })

  const edges: Edge[] = links.map((l) => {
    const isRequired = l.type === 'required'
    return {
      id: l.id,
      source: l.sourceId,
      target: l.targetId,
      type: 'training',
      animated: false,
      label: l.trainingTitle || '',
      labelStyle: { 
        fill: '#a5b4fc', 
        fontSize: 10, 
        fontWeight: 600,
      },
      labelShowBg: true,
      labelBgStyle: { 
        fill: '#0f172a', 
        fillOpacity: 0.95,
      },
      labelBgPadding: [6, 4] as [number, number],
      labelBgBorderRadius: 6,
      style: isRequired
        ? { stroke: '#f1f5f9', strokeWidth: 2.5 }
        : { stroke: '#64748b', strokeWidth: 1.5, strokeDasharray: '6 4' },
      markerEnd: { type: MarkerType.ArrowClosed, color: isRequired ? '#f1f5f9' : '#64748b', width: 16, height: 16 },
      data: { type: l.type, trainingUrl: l.trainingUrl, trainingTitle: l.trainingTitle },
    }
  })

  return { nodes, edges }
}
