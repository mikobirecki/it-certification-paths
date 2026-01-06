import type { Cert, CertLink } from '../types'

type AnyObj = Record<string, unknown>

function isObj(v: unknown): v is AnyObj {
  return v !== null && typeof v === 'object' && !Array.isArray(v)
}

export function parseImportedData(raw: unknown): { certs: Cert[]; links: CertLink[] } {
  if (!isObj(raw)) throw new Error('Import: root musi być obiektem { certs: [], links: [] }')

  const certs = raw.certs
  const links = raw.links

  if (!Array.isArray(certs)) throw new Error('Import: "certs" musi być tablicą')
  if (!Array.isArray(links)) throw new Error('Import: "links" musi być tablicą')

  const certIds = new Set<string>()
  const parsedCerts: Cert[] = certs.map((c, i) => {
    if (!isObj(c)) throw new Error(`Import: cert[${i}] nie jest obiektem`)
    for (const k of ['id', 'vendor', 'level', 'title', 'roles']) {
      if (!(k in c)) throw new Error(`Import: cert[${i}] brak pola "${k}"`)
    }
    if (typeof c.id !== 'string' || !c.id.trim()) throw new Error(`Import: cert[${i}].id musi być string`)
    if (certIds.has(c.id)) throw new Error(`Import: duplikat cert.id: ${c.id}`)
    certIds.add(c.id)
    if (!Array.isArray(c.roles)) throw new Error(`Import: cert[${i}].roles musi być tablicą`)

    return {
      id: c.id,
      vendor: c.vendor,
      level: c.level,
      title: c.title,
      exam: c.exam,
      roles: c.roles,
      rolesDisplay: c.rolesDisplay,
      levelDisplay: c.levelDisplay,
      domain: c.domain,
      url: c.url,
      description: c.description,
      price: c.price,
      lastUpdate: c.lastUpdate,
      scoreToPass: c.scoreToPass,
      prerequisites: c.prerequisites,
      validityPeriod: c.validityPeriod,
      examLength: c.examLength,
      examFormat: c.examFormat,
      examLanguages: c.examLanguages,
      renewalAvailable: c.renewalAvailable,
      renewalPrice: c.renewalPrice,
      officialResources: c.officialResources,
    } as Cert
  })

  const linkIds = new Set<string>()
  const parsedLinks: CertLink[] = links.map((l, i) => {
    if (!isObj(l)) throw new Error(`Import: link[${i}] nie jest obiektem`)
    for (const k of ['id', 'sourceId', 'targetId', 'type']) {
      if (!(k in l)) throw new Error(`Import: link[${i}] brak pola "${k}"`)
    }
    if (typeof l.id !== 'string' || !l.id.trim()) throw new Error(`Import: link[${i}].id musi być string`)
    if (linkIds.has(l.id)) throw new Error(`Import: duplikat link.id: ${l.id}`)
    linkIds.add(l.id)

    if (!certIds.has(l.sourceId as string)) throw new Error(`Import: link[${i}] sourceId nie istnieje: ${l.sourceId}`)
    if (!certIds.has(l.targetId as string)) throw new Error(`Import: link[${i}] targetId nie istnieje: ${l.targetId}`)

    return {
      id: l.id,
      sourceId: l.sourceId,
      targetId: l.targetId,
      type: l.type,
    } as CertLink
  })

  return { certs: parsedCerts, links: parsedLinks }
}
