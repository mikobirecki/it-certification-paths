import type { Cert, CertLink, Level, Vendor } from '../types'
import type { Edge, Node } from '@xyflow/react'
import { MarkerType } from '@xyflow/react'

const levelOrder: Level[] = ['Fundamentals', 'Associate', 'Professional-Expert', 'Specialty']
const redHatLevelOrder: Level[] = ['Course', 'Exam', 'Bundle', 'Meta']

export type BuildOptions = {
  xGap?: number
  yGap?: number
  vendorXOffset?: number
  levelYOffset?: number
}

function buildRedHatLayout(certs: Cert[], xOffset: number, yOffset: number) {
  const xGap = 380
  const yGap = 140
  const domainGap = 60

  // Group by domain
  const domains = ['RHCSA', 'RHCE', 'RHCA', 'Cloud-native Dev', 'Security: Linux', 'OpenShift Admin']
  const byDomain = new Map<string, Cert[]>()
  
  certs.forEach(c => {
    const d = c.domain || 'Other'
    if (!byDomain.has(d)) byDomain.set(d, [])
    byDomain.get(d)!.push(c)
  })

  const nodes: Node[] = []
  let currentY = yOffset

  domains.forEach(domain => {
    const domainCerts = byDomain.get(domain)
    if (!domainCerts || domainCerts.length === 0) return

    // Sort by level order within domain
    const sorted = [...domainCerts].sort((a, b) => {
      const aIdx = redHatLevelOrder.indexOf(a.level)
      const bIdx = redHatLevelOrder.indexOf(b.level)
      return aIdx - bIdx
    })

    // Group by level within domain
    const byLevel = new Map<Level, Cert[]>()
    sorted.forEach(c => {
      if (!byLevel.has(c.level)) byLevel.set(c.level, [])
      byLevel.get(c.level)!.push(c)
    })

    let maxRowsInDomain = 0
    redHatLevelOrder.forEach((level, colIdx) => {
      const levelCerts = byLevel.get(level) || []
      maxRowsInDomain = Math.max(maxRowsInDomain, levelCerts.length)
      
      levelCerts.forEach((cert, rowIdx) => {
        nodes.push({
          id: cert.id,
          type: 'certNode',
          position: { 
            x: xOffset + colIdx * xGap,
            y: currentY + rowIdx * yGap
          },
          data: { cert },
        })
      })
    })

    currentY += maxRowsInDomain * yGap + domainGap
  })

  // Handle any remaining certs not in known domains
  byDomain.forEach((domainCerts, domain) => {
    if (domains.includes(domain)) return
    domainCerts.forEach((cert, idx) => {
      nodes.push({
        id: cert.id,
        type: 'certNode',
        position: { x: xOffset, y: currentY + idx * yGap },
        data: { cert },
      })
    })
  })

  return nodes
}

export function buildFlowElements(certs: Cert[], links: CertLink[], options?: BuildOptions) {
  const xGap = options?.xGap ?? 400
  const yGap = options?.yGap ?? 160
  const xOffset = options?.vendorXOffset ?? 40
  const yOffset = options?.levelYOffset ?? 40

  // Check if this is RedHat
  const isRedHat = certs.length > 0 && certs[0].vendor === 'RedHat'

  let nodes: Node[]

  if (isRedHat) {
    nodes = buildRedHatLayout(certs, xOffset, yOffset)
  } else {
    const slotCounter = new Map<string, number>()
    const slotKey = (v: Vendor, l: Level) => `${v}__${l}` 

    nodes = certs.map((c) => {
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
  }

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
