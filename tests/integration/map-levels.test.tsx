import { describe, expect, it } from 'vitest'

import { buildFlowElements } from '../../src/graph/buildFlow'
import type { Cert, CertLink } from '../../src/types'

const certs: Cert[] = [
  {
    id: 'f',
    vendor: 'Microsoft',
    level: 'Fundamentals',
    title: 'Fundamentals',
    roles: ['General'],
  },
  {
    id: 'a',
    vendor: 'Microsoft',
    level: 'Associate',
    title: 'Associate',
    roles: ['Architect'],
  },
  {
    id: 'e',
    vendor: 'Microsoft',
    level: 'Professional-Expert',
    title: 'Expert',
    roles: ['Architect'],
  },
  {
    id: 's',
    vendor: 'Microsoft',
    level: 'Specialty',
    title: 'Specialty',
    roles: ['Security'],
  },
]

const links: CertLink[] = []

describe('map level grouping', () => {
  it('places certifications in increasing x lanes by level order', () => {
    const { nodes } = buildFlowElements(certs, links, {
      xGap: 100,
      yGap: 50,
      vendorXOffset: 0,
      levelYOffset: 0,
    })

    const byId = new Map(nodes.map((node) => [node.id, node]))

    expect(byId.get('f')?.position.x).toBe(0)
    expect(byId.get('a')?.position.x).toBe(100)
    expect(byId.get('e')?.position.x).toBe(200)
    expect(byId.get('s')?.position.x).toBe(300)
  })
})
