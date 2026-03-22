import type { Cert, CertLink, Level, RoleTrack } from '../types'
import { azureCertifications, azureCertificationDependencies } from './certifications'

const levelMap: Record<string, Level> = {
  foundational: 'Fundamentals',
  associate: 'Associate',
  expert: 'Professional-Expert',
  specialty: 'Specialty',
}

const roleMap: Record<string, RoleTrack> = {
  'cloud-administrator': 'SysAdmin',
  'solutions-architect': 'Architect',
  'devops-engineer': 'DevOps',
  'security-engineer': 'Security',
  'network-engineer': 'SysAdmin',
  'data-engineer': 'Data&AI',
  'ai-engineer': 'Data&AI',
  'sap-architect': 'Architect',
}

function mapRoles(roleIds: string[]): RoleTrack[] {
  const mapped = roleIds.map((roleId) => roleMap[roleId] ?? 'General')
  return Array.from(new Set(mapped))
}

export const defaultCerts: Cert[] = azureCertifications.map((certification) => ({
  id: certification.id,
  vendor: 'Microsoft',
  level: levelMap[certification.level],
  levelDisplay: certification.level[0].toUpperCase() + certification.level.slice(1),
  title: certification.name,
  exam: certification.code,
  roles: mapRoles(certification.targetRoles),
  domain: certification.area,
  url: `https://learn.microsoft.com/credentials/certifications/exams/${certification.code.toLowerCase()}/`,
  description: `${certification.area} track`,
  validityPeriod: certification.status === 'active' ? 'Active' : 'Retired',
  scoreToPass: 700,
}))

export const defaultLinks: CertLink[] = azureCertificationDependencies.map((dependency) => ({
  id: dependency.id,
  sourceId: dependency.fromCertificationId,
  targetId: dependency.toCertificationId,
  type: dependency.type,
}))
