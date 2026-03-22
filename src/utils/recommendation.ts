import type {
  Certification,
  CertificationDependency,
  RecommendationPath,
  RecommendationRequest,
  RoleProfile,
} from '../types'
import {
  compareCandidates,
  computeRoleCandidates,
  toPathSteps,
} from './pathFinding'

function assertKnownInput(
  request: RecommendationRequest,
  rolesById: Map<string, RoleProfile>,
  certificationsById: Map<string, Certification>,
): void {
  if (!rolesById.has(request.targetRoleId)) {
    throw new Error(`Unknown targetRoleId: ${request.targetRoleId}`)
  }

  for (const ownedCertificationId of request.ownedCertificationIds) {
    if (!certificationsById.has(ownedCertificationId)) {
      throw new Error(`Unknown owned certification id: ${ownedCertificationId}`)
    }
  }
}

export function generateRecommendation(
  request: RecommendationRequest,
  certifications: Certification[],
  dependencies: CertificationDependency[],
  roles: RoleProfile[],
): RecommendationPath {
  const certificationsById = new Map(certifications.map((certification) => [certification.id, certification]))
  const rolesById = new Map(roles.map((role) => [role.id, role]))

  assertKnownInput(request, rolesById, certificationsById)

  const role = rolesById.get(request.targetRoleId)
  if (!role) {
    throw new Error(`Unknown targetRoleId: ${request.targetRoleId}`)
  }

  const owned = new Set(request.ownedCertificationIds)
  const candidates = computeRoleCandidates(
    role.primaryCertificationIds,
    owned,
    certificationsById,
    dependencies,
  )
    .filter((candidate) => candidate.certificationIds.length > 0)
    .sort(compareCandidates)

  if (candidates.length === 0) {
    return {
      targetRoleId: request.targetRoleId,
      primaryPath: [],
      alternativePaths: [],
      meta: {
        isReachable: false,
        missingRequiredCount: 0,
        generatedAt: new Date().toISOString(),
        explanation: 'No reachable target certification path for the selected role.',
      },
    }
  }

  const [best, ...rest] = candidates

  return {
    targetRoleId: request.targetRoleId,
    primaryPath: toPathSteps(best.certificationIds, certificationsById),
    alternativePaths: rest.slice(0, 3).map((candidate) => toPathSteps(candidate.certificationIds, certificationsById)),
    meta: {
      isReachable: true,
      missingRequiredCount: best.certificationIds.length,
      generatedAt: new Date().toISOString(),
    },
  }
}
