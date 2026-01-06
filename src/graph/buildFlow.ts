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
      animated: false,
      style: isRequired
        ? { stroke: '#0f172a', strokeWidth: 2.6 }
        : { stroke: '#64748b', strokeWidth: 1.6, strokeDasharray: '6 6' },
      markerEnd: { type: MarkerType.ArrowClosed, color: isRequired ? '#0f172a' : '#64748b' },
      data: { type: l.type },
    }
  })

  return { nodes, edges }
}
