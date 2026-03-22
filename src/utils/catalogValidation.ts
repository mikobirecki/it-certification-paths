import type {
  CatalogValidationIssue,
  CatalogValidationResult,
  CatalogValidationSummary,
  Certification,
  CertificationDependency,
  RoleProfile,
} from '../types'
import {
  isCertification,
  isCertificationDependency,
  isRoleProfile,
} from '../data/catalog-schema'

function createSummary(): CatalogValidationSummary {
  return {
    schema: { passed: 0, failed: 0 },
    identity: { passed: 0, failed: 0 },
    referential: { passed: 0, failed: 0 },
    graph: { passed: 0, failed: 0 },
    scope: { passed: 0, failed: 0 },
    recommendationReadiness: { passed: 0, failed: 0 },
  }
}

function pushError(
  errors: CatalogValidationIssue[],
  summary: CatalogValidationSummary,
  category: keyof CatalogValidationSummary,
  code: string,
  message: string,
  path?: string,
): void {
  errors.push({ code, message, path })
  summary[category].failed += 1
}

function pushWarning(
  warnings: CatalogValidationIssue[],
  code: string,
  message: string,
  path?: string,
): void {
  warnings.push({ code, message, path })
}

function detectRequiredCycle(dependencies: CertificationDependency[]): boolean {
  const required = dependencies.filter((d) => d.type === 'required')
  const graph = new Map<string, string[]>()

  for (const dep of required) {
    const next = graph.get(dep.fromCertificationId) ?? []
    next.push(dep.toCertificationId)
    graph.set(dep.fromCertificationId, next)
    if (!graph.has(dep.toCertificationId)) {
      graph.set(dep.toCertificationId, [])
    }
  }

  const visiting = new Set<string>()
  const visited = new Set<string>()

  const dfs = (node: string): boolean => {
    if (visiting.has(node)) return true
    if (visited.has(node)) return false

    visiting.add(node)
    const nextNodes = graph.get(node) ?? []
    for (const next of nextNodes) {
      if (dfs(next)) return true
    }

    visiting.delete(node)
    visited.add(node)
    return false
  }

  for (const node of graph.keys()) {
    if (dfs(node)) return true
  }

  return false
}

function hasReachablePathForRole(
  role: RoleProfile,
  certById: Map<string, Certification>,
  dependencies: CertificationDependency[],
): boolean {
  const requiredByTarget = new Map<string, string[]>()

  for (const dep of dependencies) {
    if (dep.type !== 'required') continue
    const reqs = requiredByTarget.get(dep.toCertificationId) ?? []
    reqs.push(dep.fromCertificationId)
    requiredByTarget.set(dep.toCertificationId, reqs)
  }

  const memo = new Map<string, boolean>()
  const visiting = new Set<string>()

  const isReachable = (certId: string): boolean => {
    if (memo.has(certId)) return memo.get(certId) ?? false
    if (visiting.has(certId)) return false
    if (!certById.has(certId)) {
      memo.set(certId, false)
      return false
    }

    visiting.add(certId)
    const prereqs = requiredByTarget.get(certId) ?? []
    if (prereqs.length === 0) {
      visiting.delete(certId)
      memo.set(certId, true)
      return true
    }

    for (const prereqId of prereqs) {
      if (!isReachable(prereqId)) {
        visiting.delete(certId)
        memo.set(certId, false)
        return false
      }
    }

    visiting.delete(certId)
    memo.set(certId, true)
    return true
  }

  return role.primaryCertificationIds.some(isReachable)
}

export function validateCatalog(
  certifications: Certification[],
  roles: RoleProfile[],
  dependencies: CertificationDependency[],
): CatalogValidationResult {
  const summary = createSummary()
  const errors: CatalogValidationIssue[] = []
  const warnings: CatalogValidationIssue[] = []

  certifications.forEach((cert, index) => {
    if (isCertification(cert)) {
      summary.schema.passed += 1
    } else {
      pushError(errors, summary, 'schema', 'SCHEMA_CERT_INVALID', 'Invalid certification schema', `certifications[${index}]`)
    }
  })

  roles.forEach((role, index) => {
    if (isRoleProfile(role)) {
      summary.schema.passed += 1
    } else {
      pushError(errors, summary, 'schema', 'SCHEMA_ROLE_INVALID', 'Invalid role profile schema', `roles[${index}]`)
    }
  })

  dependencies.forEach((dep, index) => {
    if (isCertificationDependency(dep)) {
      summary.schema.passed += 1
    } else {
      pushError(errors, summary, 'schema', 'SCHEMA_DEP_INVALID', 'Invalid dependency schema', `dependencies[${index}]`)
    }
  })

  const certIdSet = new Set<string>()
  const certCodeSet = new Set<string>()

  certifications.forEach((cert) => {
    if (certIdSet.has(cert.id)) {
      pushError(errors, summary, 'identity', 'IDENTITY_CERT_ID_DUP', `Duplicate certification id: ${cert.id}`)
    } else {
      certIdSet.add(cert.id)
      summary.identity.passed += 1
    }

    if (certCodeSet.has(cert.code)) {
      pushError(errors, summary, 'identity', 'IDENTITY_CERT_CODE_DUP', `Duplicate certification code: ${cert.code}`)
    } else {
      certCodeSet.add(cert.code)
      summary.identity.passed += 1
    }
  })

  const roleIdSet = new Set<string>()
  for (const role of roles) {
    if (roleIdSet.has(role.id)) {
      pushError(errors, summary, 'identity', 'IDENTITY_ROLE_ID_DUP', `Duplicate role id: ${role.id}`)
    } else {
      roleIdSet.add(role.id)
      summary.identity.passed += 1
    }
  }

  const depIdSet = new Set<string>()
  for (const dep of dependencies) {
    if (depIdSet.has(dep.id)) {
      pushError(errors, summary, 'identity', 'IDENTITY_DEP_ID_DUP', `Duplicate dependency id: ${dep.id}`)
    } else {
      depIdSet.add(dep.id)
      summary.identity.passed += 1
    }
  }

  const certById = new Map(certifications.map((cert) => [cert.id, cert]))

  dependencies.forEach((dep) => {
    const fromExists = certById.has(dep.fromCertificationId)
    const toExists = certById.has(dep.toCertificationId)

    if (!fromExists) {
      pushError(errors, summary, 'referential', 'REF_DEP_FROM_MISSING', `Dependency source not found: ${dep.fromCertificationId}`)
    } else {
      summary.referential.passed += 1
    }

    if (!toExists) {
      pushError(errors, summary, 'referential', 'REF_DEP_TO_MISSING', `Dependency target not found: ${dep.toCertificationId}`)
    } else {
      summary.referential.passed += 1
    }
  })

  roles.forEach((role) => {
    const roleCerts = [...role.primaryCertificationIds, ...(role.secondaryCertificationIds ?? [])]
    roleCerts.forEach((certId) => {
      if (!certById.has(certId)) {
        pushError(errors, summary, 'referential', 'REF_ROLE_CERT_MISSING', `Role ${role.id} references unknown certification: ${certId}`)
      } else {
        summary.referential.passed += 1
      }
    })
  })

  dependencies.forEach((dep) => {
    if (dep.fromCertificationId === dep.toCertificationId) {
      pushError(errors, summary, 'graph', 'GRAPH_SELF_LOOP', `Self-loop dependency: ${dep.id}`)
    } else {
      summary.graph.passed += 1
    }
  })

  if (detectRequiredCycle(dependencies)) {
    pushError(errors, summary, 'graph', 'GRAPH_REQUIRED_CYCLE', 'Cycle detected in required dependency graph')
  } else {
    summary.graph.passed += 1
  }

  certifications.forEach((cert) => {
    if (cert.provider !== 'azure') {
      pushError(errors, summary, 'scope', 'SCOPE_PROVIDER_NON_AZURE', `Non-azure provider found in MVP: ${cert.id}`)
    } else {
      summary.scope.passed += 1
    }
  })

  const roleIdsInCatalog = new Set<string>()
  certifications.forEach((cert) => {
    cert.targetRoles.forEach((roleId) => roleIdsInCatalog.add(roleId))
  })

  const missingRoles = [...roleIdsInCatalog].filter((roleId) => !roleIdSet.has(roleId))
  if (missingRoles.length > 0) {
    pushError(errors, summary, 'scope', 'SCOPE_ROLESET_INCOMPLETE', `Roles referenced by certifications missing in role catalog: ${missingRoles.join(', ')}`)
  } else {
    summary.scope.passed += 1
  }

  certifications.forEach((cert) => {
    if (cert.estimatedStudyHours <= 0 || cert.difficulty < 1 || cert.difficulty > 5) {
      pushError(errors, summary, 'recommendationReadiness', 'READY_METADATA_INVALID', `Recommendation metadata invalid for certification: ${cert.id}`)
    } else {
      summary.recommendationReadiness.passed += 1
    }
  })

  roles.forEach((role) => {
    if (!hasReachablePathForRole(role, certById, dependencies)) {
      pushError(errors, summary, 'recommendationReadiness', 'READY_ROLE_UNREACHABLE', `Role has no reachable path: ${role.id}`)
    } else {
      summary.recommendationReadiness.passed += 1
    }
  })

  if (certifications.length === 0) {
    pushWarning(warnings, 'WARN_EMPTY_CATALOG', 'Certification catalog is empty')
  }

  return {
    status: errors.length === 0 ? 'pass' : 'fail',
    errors,
    warnings,
    summary,
  }
}
