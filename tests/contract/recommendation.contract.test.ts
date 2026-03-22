import { describe, expect, it } from 'vitest'

import { generateRecommendation } from '../../src/utils/recommendation'
import type { Certification, CertificationDependency, RecommendationRequest, RoleProfile } from '../../src/types'

const certifications: Certification[] = [
  {
    id: 'c1',
    code: 'AZ-900',
    name: 'Azure Fundamentals',
    provider: 'azure',
    level: 'foundational',
    area: 'general',
    targetRoles: ['r1'],
    estimatedStudyHours: 12,
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
    estimatedStudyHours: 40,
    difficulty: 3,
    status: 'active',
    lastVerifiedAt: '2026-03-22',
  },
  {
    id: 'c3',
    code: 'AZ-305',
    name: 'Azure Solutions Architect Expert',
    provider: 'azure',
    level: 'expert',
    area: 'architecture',
    targetRoles: ['r1'],
    estimatedStudyHours: 50,
    difficulty: 4,
    status: 'active',
    lastVerifiedAt: '2026-03-22',
  },
]

const dependencies: CertificationDependency[] = [
  {
    id: 'd1',
    fromCertificationId: 'c1',
    toCertificationId: 'c2',
    type: 'required',
  },
  {
    id: 'd2',
    fromCertificationId: 'c2',
    toCertificationId: 'c3',
    type: 'required',
  },
]

const roles: RoleProfile[] = [
  {
    id: 'r1',
    name: 'Cloud Architect',
    primaryCertificationIds: ['c3'],
  },
]

describe('recommendation contract', () => {
  it('returns deterministic shortest valid path excluding owned certs', () => {
    const request: RecommendationRequest = {
      targetRoleId: 'r1',
      ownedCertificationIds: ['c1'],
    }

    const result = generateRecommendation(request, certifications, dependencies, roles)

    expect(result.meta.isReachable).toBe(true)
    expect(result.primaryPath.map((step) => step.certificationId)).toEqual(['c2', 'c3'])
    expect(result.primaryPath).toHaveLength(2)
    expect(result.primaryPath.find((step) => step.certificationId === 'c1')).toBeUndefined()
  })

  it('throws validation error for unknown role', () => {
    const request: RecommendationRequest = {
      targetRoleId: 'unknown',
      ownedCertificationIds: [],
    }

    expect(() => generateRecommendation(request, certifications, dependencies, roles)).toThrow(
      'Unknown targetRoleId',
    )
  })
})
