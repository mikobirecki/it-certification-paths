export type Vendor = 'AWS' | 'GCP' | 'Microsoft' | 'GitHub' | 'RedHat' | 'HashiCorp' | 'Kubernetes'
export type Level = 'Fundamentals' | 'Associate' | 'Professional-Expert' | 'Specialty' | 'Course' | 'Exam' | 'Bundle' | 'Meta'
export type RoleTrack = 'General' | 'Architect' | 'DevOps' | 'Data&AI' | 'Security' | 'SysAdmin'
export type LinkType = 'required' | 'recommended'

export type Provider = 'azure'
export type CertificationLevel = 'foundational' | 'associate' | 'expert' | 'specialty'
export type CertificationStatus = 'active' | 'retired'
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced'

export type OfficialResource = {
  title: string
  url: string
}

export type Cert = {
  id: string
  vendor: Vendor
  level: Level
  levelDisplay?: string // vendor-specific level name
  title: string
  exam?: string
  code?: string // course/bundle code (e.g., RH124, DO288)
  roles: RoleTrack[]
  rolesDisplay?: string[] // vendor-specific role names
  domain?: string // vendor-specific domain/track
  url?: string
  description?: string
  price?: string
  lastUpdate?: string
  scoreToPass?: number
  prerequisites?: string
  validityPeriod?: string
  examLength?: string
  examFormat?: string
  examLanguages?: string[]
  renewalAvailable?: boolean
  renewalPrice?: string
  officialResources?: OfficialResource[]
}

export type CertLink = {
  id: string
  sourceId: string
  targetId: string
  type: LinkType
  trainingTitle?: string
  trainingUrl?: string
}

export type Certification = {
  id: string
  code: string
  name: string
  provider: Provider
  level: CertificationLevel
  area: string
  targetRoles: string[]
  estimatedStudyHours: number
  difficulty: number
  status: CertificationStatus
  lastVerifiedAt: string
}

export type CertificationDependency = {
  id: string
  fromCertificationId: string
  toCertificationId: string
  type: LinkType
  note?: string
}

export type RoleProfile = {
  id: string
  name: string
  description?: string
  primaryCertificationIds: string[]
  secondaryCertificationIds?: string[]
}

export type RecommendationRequest = {
  targetRoleId: string
  ownedCertificationIds: string[]
  experienceLevel?: ExperienceLevel
}

export type RecommendationPathStep = {
  certificationId: string
  order: number
  reason: string
  estimatedStudyHours: number
}

export type RecommendationMeta = {
  isReachable: boolean
  missingRequiredCount: number
  generatedAt: string
  explanation?: string
}

export type RecommendationPath = {
  targetRoleId: string
  primaryPath: RecommendationPathStep[]
  alternativePaths: RecommendationPathStep[][]
  meta: RecommendationMeta
}

export type UserLocalState = {
  targetRoleId?: string
  ownedCertificationIds: string[]
  activeFilters: {
    role: string
    level: string
    area: string
    status: string
  }
  viewMode: 'graph' | 'table'
  savedAt: string
}

export type CatalogValidationIssue = {
  code: string
  message: string
  path?: string
}

export type CatalogValidationSummary = {
  schema: { passed: number; failed: number }
  identity: { passed: number; failed: number }
  referential: { passed: number; failed: number }
  graph: { passed: number; failed: number }
  scope: { passed: number; failed: number }
  recommendationReadiness: { passed: number; failed: number }
}

export type CatalogValidationResult = {
  status: 'pass' | 'fail'
  errors: CatalogValidationIssue[]
  warnings: CatalogValidationIssue[]
  summary: CatalogValidationSummary
}
