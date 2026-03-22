import type { UserLocalState } from '../types'

export const USER_LOCAL_STATE_KEY = 'cert-paths:user-local-state'

export const DEFAULT_USER_LOCAL_STATE: UserLocalState = {
  ownedCertificationIds: [],
  activeFilters: {
    role: 'all',
    level: 'all',
    area: 'all',
    status: 'active',
  },
  viewMode: 'graph',
  savedAt: new Date(0).toISOString(),
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
}

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

export function normalizeUserLocalState(input: unknown): UserLocalState {
  if (!isObject(input)) {
    return { ...DEFAULT_USER_LOCAL_STATE, savedAt: new Date().toISOString() }
  }

  const targetRoleId = typeof input.targetRoleId === 'string' ? input.targetRoleId : undefined
  const ownedCertificationIds = isStringArray(input.ownedCertificationIds)
    ? input.ownedCertificationIds
    : []

  const activeFilters = isObject(input.activeFilters)
    ? {
        role: typeof input.activeFilters.role === 'string' ? input.activeFilters.role : 'all',
        level: typeof input.activeFilters.level === 'string' ? input.activeFilters.level : 'all',
        area: typeof input.activeFilters.area === 'string' ? input.activeFilters.area : 'all',
        status: typeof input.activeFilters.status === 'string' ? input.activeFilters.status : 'active',
      }
    : { ...DEFAULT_USER_LOCAL_STATE.activeFilters }

  const viewMode = input.viewMode === 'table' ? 'table' : 'graph'
  const savedAt = typeof input.savedAt === 'string' ? input.savedAt : new Date().toISOString()

  return {
    targetRoleId,
    ownedCertificationIds,
    activeFilters,
    viewMode,
    savedAt,
  }
}

export function loadUserLocalState(storageKey: string = USER_LOCAL_STATE_KEY): UserLocalState {
  if (typeof window === 'undefined' || !window.localStorage) {
    return { ...DEFAULT_USER_LOCAL_STATE, savedAt: new Date().toISOString() }
  }

  const raw = window.localStorage.getItem(storageKey)
  if (!raw) {
    return { ...DEFAULT_USER_LOCAL_STATE, savedAt: new Date().toISOString() }
  }

  try {
    const parsed = JSON.parse(raw) as unknown
    return normalizeUserLocalState(parsed)
  } catch {
    return { ...DEFAULT_USER_LOCAL_STATE, savedAt: new Date().toISOString() }
  }
}

export function saveUserLocalState(
  state: UserLocalState,
  storageKey: string = USER_LOCAL_STATE_KEY,
): void {
  if (typeof window === 'undefined' || !window.localStorage) return

  const normalized = normalizeUserLocalState(state)
  normalized.savedAt = new Date().toISOString()
  window.localStorage.setItem(storageKey, JSON.stringify(normalized))
}
