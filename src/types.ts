export type Vendor = 'AWS' | 'Azure' | 'GCP' | 'Microsoft' | 'GitHub' | 'RedHat' | 'HashiCorp' | 'Kubernetes'
export type Level = 'Fundamentals' | 'Associate' | 'Professional-Expert' | 'Specialty'
export type RoleTrack = 'General' | 'Architect' | 'DevOps' | 'Data&AI' | 'Security' | 'SysAdmin'
export type LinkType = 'required' | 'recommended'

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
}
