import raw from './certifications.json'
import { parseImportedData } from '../utils/parseData'

const parsed = parseImportedData(raw)
export const defaultCerts = parsed.certs
export const defaultLinks = parsed.links
