import { describe, expect, it } from 'vitest'

import { validateCatalog } from '../../src/utils/catalogValidation'
import type { Certification, CertificationDependency, RoleProfile } from '../../src/types'

const certifications: Certification[] = [
  {
    id: 'c1',
    code: 'AZ-900',
    name: 'Azure Fundamentals',
    provider: 'azure',
    level: 'foundational',
    area: 'general',
    targetRoles: ['r1'],
    estimatedStudyHours: 15,
    difficulty: 1,
    status: 'active',
    lastVerifiedAt: '2026-03-22',
  },
  {
    id: 'c2',
    code: 'AZ-104',
    name: 'Azure Administrator',
    provider: 'azure',
    level: 'associate',
    area: 'infrastructure',
    targetRoles: ['r1'],
    estimatedStudyHours: 45,
    difficulty: 3,
    status: 'active',
    lastVerifiedAt: '2026-03-22',
  },
]

const roles: RoleProfile[] = [
  {
    id: 'r1',
    name: 'Cloud Administrator',
    primaryCertificationIds: ['c2'],
    secondaryCertificationIds: ['c1'],
  },
]

const dependencies: CertificationDependency[] = [
  {
    id: 'd1',
    fromCertificationId: 'c1',
    toCertificationId: 'c2',
    type: 'required',
  },
]

describe('catalog validation contract', () => {
  it('returns pass when catalog satisfies contract checks', () => {
    const result = validateCatalog(certifications, roles, dependencies)

    expect(result.status).toBe('pass')
    expect(result.errors).toHaveLength(0)
    expect(result.summary.schema.failed).toBe(0)
  })

  it('returns fail when required graph contains cycle', () => {
    const cyclicDeps: CertificationDependency[] = [
      ...dependencies,
      {
        id: 'd2',
        fromCertificationId: 'c2',
        toCertificationId: 'c1',
        type: 'required',
      },
    ]

    const result = validateCatalog(certifications, roles, cyclicDeps)

    expect(result.status).toBe('fail')
    expect(result.errors.some((error) => error.code === 'GRAPH_REQUIRED_CYCLE')).toBe(true)
  })
})
