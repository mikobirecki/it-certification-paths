import type {
  Certification,
  CertificationDependency,
  Provider,
  RoleProfile,
  CertificationLevel,
  CertificationStatus,
} from '../types'

export const CERTIFICATION_LEVELS: CertificationLevel[] = ['foundational', 'associate', 'expert', 'specialty']
export const CERTIFICATION_STATUSES: CertificationStatus[] = ['active', 'retired']
export const PROVIDERS: Provider[] = ['azure']

type UnknownRecord = Record<string, unknown>

function isRecord(value: unknown): value is UnknownRecord {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function isPositiveNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
}

function isDifficulty(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 5
}

export function isCertification(value: unknown): value is Certification {
  if (!isRecord(value)) return false

  if (!isNonEmptyString(value.id)) return false
  if (!isNonEmptyString(value.code)) return false
  if (!isNonEmptyString(value.name)) return false
  if (!PROVIDERS.includes(value.provider as Provider)) return false
  if (!CERTIFICATION_LEVELS.includes(value.level as CertificationLevel)) return false
  if (!isNonEmptyString(value.area)) return false
  if (!Array.isArray(value.targetRoles) || value.targetRoles.length === 0) return false
  if (!value.targetRoles.every(isNonEmptyString)) return false
  if (!isPositiveNumber(value.estimatedStudyHours)) return false
  if (!isDifficulty(value.difficulty)) return false
  if (!CERTIFICATION_STATUSES.includes(value.status as CertificationStatus)) return false
  if (!isNonEmptyString(value.lastVerifiedAt)) return false

  return true
}

export function isRoleProfile(value: unknown): value is RoleProfile {
  if (!isRecord(value)) return false
  if (!isNonEmptyString(value.id)) return false
  if (!isNonEmptyString(value.name)) return false
  if (!Array.isArray(value.primaryCertificationIds) || value.primaryCertificationIds.length === 0) return false
  if (!value.primaryCertificationIds.every(isNonEmptyString)) return false
  if (value.secondaryCertificationIds !== undefined) {
    if (!Array.isArray(value.secondaryCertificationIds) || !value.secondaryCertificationIds.every(isNonEmptyString)) {
      return false
    }
  }
  if (value.description !== undefined && typeof value.description !== 'string') return false
  return true
}

export function isCertificationDependency(value: unknown): value is CertificationDependency {
  if (!isRecord(value)) return false
  if (!isNonEmptyString(value.id)) return false
  if (!isNonEmptyString(value.fromCertificationId)) return false
  if (!isNonEmptyString(value.toCertificationId)) return false
  if (value.type !== 'required' && value.type !== 'recommended') return false
  if (value.note !== undefined && typeof value.note !== 'string') return false
  return true
}
