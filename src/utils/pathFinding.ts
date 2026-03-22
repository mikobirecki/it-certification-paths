import type {
  Certification,
  CertificationDependency,
  RecommendationPathStep,
} from '../types'

export type PathCandidate = {
  certificationIds: string[]
  averageDifficulty: number
  totalEstimatedStudyHours: number
  lexicalKey: string
}

function buildRequiredDependenciesByTarget(
  dependencies: CertificationDependency[],
): Map<string, string[]> {
  const requiredByTarget = new Map<string, string[]>()

  for (const dep of dependencies) {
    if (dep.type !== 'required') continue
    const list = requiredByTarget.get(dep.toCertificationId) ?? []
    list.push(dep.fromCertificationId)
    requiredByTarget.set(dep.toCertificationId, list)
  }

  return requiredByTarget
}

export function resolveRequiredChain(
  targetCertificationId: string,
  ownedCertificationIds: Set<string>,
  requiredByTarget: Map<string, string[]>,
): string[] {
  const visiting = new Set<string>()
  const ordered = new Set<string>()

  const dfs = (certificationId: string): void => {
    if (ownedCertificationIds.has(certificationId)) return
    if (ordered.has(certificationId)) return

    if (visiting.has(certificationId)) {
      throw new Error('Required dependency cycle detected')
    }

    visiting.add(certificationId)

    const prerequisites = requiredByTarget.get(certificationId) ?? []
    for (const prerequisiteId of prerequisites) {
      dfs(prerequisiteId)
    }

    visiting.delete(certificationId)
    ordered.add(certificationId)
  }

  dfs(targetCertificationId)
  return [...ordered]
}

export function buildPathCandidate(
  certificationIds: string[],
  certificationsById: Map<string, Certification>,
): PathCandidate {
  const certifications = certificationIds.map((id) => certificationsById.get(id)).filter(Boolean) as Certification[]

  if (certifications.length === 0) {
    return {
      certificationIds: [],
      averageDifficulty: 0,
      totalEstimatedStudyHours: 0,
      lexicalKey: '',
    }
  }

  const totalDifficulty = certifications.reduce((sum, certification) => sum + certification.difficulty, 0)
  const totalEstimatedStudyHours = certifications.reduce(
    (sum, certification) => sum + certification.estimatedStudyHours,
    0,
  )

  const lexicalKey = certifications
    .map((certification) => certification.code)
    .sort((left, right) => left.localeCompare(right))
    .join('|')

  return {
    certificationIds,
    averageDifficulty: totalDifficulty / certifications.length,
    totalEstimatedStudyHours,
    lexicalKey,
  }
}

export function compareCandidates(left: PathCandidate, right: PathCandidate): number {
  if (left.certificationIds.length !== right.certificationIds.length) {
    return left.certificationIds.length - right.certificationIds.length
  }

  if (left.averageDifficulty !== right.averageDifficulty) {
    return left.averageDifficulty - right.averageDifficulty
  }

  if (left.totalEstimatedStudyHours !== right.totalEstimatedStudyHours) {
    return left.totalEstimatedStudyHours - right.totalEstimatedStudyHours
  }

  return left.lexicalKey.localeCompare(right.lexicalKey)
}

export function toPathSteps(
  certificationIds: string[],
  certificationsById: Map<string, Certification>,
): RecommendationPathStep[] {
  return certificationIds
    .map((certificationId, index) => {
      const certification = certificationsById.get(certificationId)
      if (!certification) {
        throw new Error(`Certification not found: ${certificationId}`)
      }

      return {
        certificationId,
        order: index + 1,
        reason: index === 0
          ? 'Start with the closest missing prerequisite.'
          : 'Continue with dependency-aligned progression.',
        estimatedStudyHours: certification.estimatedStudyHours,
      }
    })
}

export function computeRoleCandidates(
  roleTargetCertificationIds: string[],
  ownedCertificationIds: Set<string>,
  certificationsById: Map<string, Certification>,
  dependencies: CertificationDependency[],
): PathCandidate[] {
  const requiredByTarget = buildRequiredDependenciesByTarget(dependencies)

  const candidates: PathCandidate[] = []
  for (const targetCertificationId of roleTargetCertificationIds) {
    if (!certificationsById.has(targetCertificationId)) continue

    const certificationIds = resolveRequiredChain(
      targetCertificationId,
      ownedCertificationIds,
      requiredByTarget,
    )

    candidates.push(buildPathCandidate(certificationIds, certificationsById))
  }

  return candidates
}
