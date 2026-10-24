import raw from './certifications.json'
import equivalentsRaw from './equivalents.json'
import type { EquivalentGroup } from '../types'
import { parseImportedData } from '../utils/parseData'

const parsed = parseImportedData(raw)
export const defaultCerts = parsed.certs
export const defaultLinks = parsed.links
export const equivalentGroups = equivalentsRaw as EquivalentGroup[]
