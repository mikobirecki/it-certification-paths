import type { Cert } from '../types'

export type RetirementStatus = 'retired' | 'retiring' | null

export function getRetirementStatus(
  cert: Pick<Cert, 'retiring' | 'retirementDate'>,
  today: Date = new Date(),
): RetirementStatus {
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  if (cert.retirementDate && cert.retirementDate < todayStr) return 'retired'
  if (cert.retiring) return 'retiring'
  return null
}
