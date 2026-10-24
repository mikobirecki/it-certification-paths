import * as fs from "node:fs";
import * as path from "node:path";

const ROOT = process.cwd();
const REPORT_PATH = path.join(ROOT, "scripts", "catalog-report.json");
const DATA_PATH = path.join(ROOT, "src", "data", "certifications.json");
const TYPES_PATH = path.join(ROOT, "src", "types.ts");

const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";
const CONCURRENCY = 5;
const TIMEOUT_MS = 15000;
const EXAM_PREFIX_RE = /^(AZ|AI|AB|DP|SC|PL|MS|MD|GH)-\d+/;
const CERT_TYPES = new Set(["role-based", "specialty", "fundamentals", "business"]);
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

type Cert = {
  id: string;
  vendor: string;
  level: string;
  roles: string[];
  exam?: string;
  url?: string;
  retiring?: boolean;
  retirementDate?: string;
};
type Link = { id: string; sourceId: string; targetId: string; type: string };
type Catalog = { certs: Cert[]; links: Link[] };

type FetchResult = { ok: true; status: number; url: string; body: string } | { ok: false; status?: number; url: string; error: string };

async function fetchUrl(url: string): Promise<FetchResult> {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
      redirect: "follow",
      headers: { "User-Agent": UA, Accept: "text/html,application/json" },
    });
    return { ok: true, status: res.status, url: res.url, body: await res.text() };
  } catch (e) {
    return { ok: false, url, error: e instanceof Error ? e.message : String(e) };
  }
}

async function pool<T, R>(items: T[], fn: (item: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let idx = 0;
  async function worker() {
    while (idx < items.length) {
      const i = idx++;
      out[i] = await fn(items[i]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, items.length) }, worker));
  return out;
}

function unionValues(typeName: string, typesSrc: string): Set<string> {
  const m = typesSrc.match(new RegExp(`export\\s+type\\s+${typeName}\\s*=\\s*([^\\n]+)`));
  if (!m) throw new Error(`Could not find type ${typeName} in src/types.ts`);
  return new Set([...m[1].matchAll(/'([^']+)'/g)].map(x => x[1]));
}

function slugOf(url: string | undefined): string | undefined {
  if (!url) return undefined;
  try {
    const segs = new URL(url).pathname.split("/").filter(Boolean);
    return segs.at(-1)?.toLowerCase();
  } catch {
    return undefined;
  }
}

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const typesSrc = fs.readFileSync(TYPES_PATH, "utf8");
const vendors = unionValues("Vendor", typesSrc);
const levels = unionValues("Level", typesSrc);
const roles = unionValues("RoleTrack", typesSrc);
const catalog: Catalog = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
const today = todayStr();

// ── 1. Validation ──────────────────────────────────────────────
const errors: string[] = [];
const seenCertIds = new Set<string>();
for (const c of catalog.certs) {
  if (seenCertIds.has(c.id)) errors.push(`Duplicate cert id: ${c.id}`);
  seenCertIds.add(c.id);
  if (!vendors.has(c.vendor)) errors.push(`${c.id}: vendor "${c.vendor}" not in Vendor union`);
  if (!levels.has(c.level)) errors.push(`${c.id}: level "${c.level}" not in Level union`);
  for (const r of c.roles ?? []) if (!roles.has(r)) errors.push(`${c.id}: role "${r}" not in RoleTrack union`);
  if (c.retiring && !c.retirementDate) errors.push(`${c.id}: retiring=true without retirementDate`);
  if (c.retirementDate && !DATE_RE.test(c.retirementDate)) errors.push(`${c.id}: retirementDate "${c.retirementDate}" is not YYYY-MM-DD`);
}
const certIds = new Set(catalog.certs.map(c => c.id));
const seenLinkIds = new Set<string>();
for (const l of catalog.links) {
  if (seenLinkIds.has(l.id)) errors.push(`Duplicate link id: ${l.id}`);
  seenLinkIds.add(l.id);
  if (!certIds.has(l.sourceId)) errors.push(`Link ${l.id}: unknown sourceId ${l.sourceId}`);
  if (!certIds.has(l.targetId)) errors.push(`Link ${l.id}: unknown targetId ${l.targetId}`);
}

// ── 2. Retirement status ───────────────────────────────────────
const in90 = new Date();
in90.setDate(in90.getDate() + 90);
const in90Str = `${in90.getFullYear()}-${String(in90.getMonth() + 1).padStart(2, "0")}-${String(in90.getDate()).padStart(2, "0")}`;
const retired = catalog.certs.filter(c => c.retirementDate && c.retirementDate < today);
const retiringSoon = catalog.certs.filter(c => c.retiring && c.retirementDate && c.retirementDate >= today && c.retirementDate <= in90Str);

// ── 3. MS Learn Catalog API diff ───────────────────────────────
const msCerts = catalog.certs.filter(c => c.exam && (c.vendor === "Microsoft" || c.vendor === "GitHub"));
const catalogExamCodes = new Set(catalog.certs.map(c => c.exam?.toUpperCase()).filter(Boolean));
type ApiCert = { title: string; url: string; certification_type?: string; last_modified?: string };
type ApiExam = { display_name?: string; title?: string; url?: string; last_modified?: string };
let apiError: string | undefined;
let apiCerts: ApiCert[] = [];
let apiExams: ApiExam[] = [];
{
  const r = await fetchUrl("https://learn.microsoft.com/api/catalog/?locale=en-us&type=certifications,exams");
  if (r.ok) {
    try {
      const json = JSON.parse(r.body);
      apiCerts = json.certifications ?? [];
      apiExams = json.exams ?? [];
    } catch (e) {
      apiError = `Catalog API JSON parse failed: ${e instanceof Error ? e.message : e}`;
    }
  } else {
    apiError = `Catalog API fetch failed: ${r.ok ? r.status : r.error}`;
  }
}
const trackedApiCerts = apiCerts.filter(c => !c.certification_type || CERT_TYPES.has(c.certification_type));
const apiCertSlugs = new Set(trackedApiCerts.map(c => slugOf(c.url)).filter(Boolean));
const unmatchedCerts = msCerts
  .filter(c => { const s = slugOf(c.url); return !s || !apiCertSlugs.has(s); })
  .map(c => ({ id: c.id, exam: c.exam, url: c.url }));
const catalogSlugs = new Set(msCerts.map(c => slugOf(c.url)).filter(Boolean));
const newApiCerts = trackedApiCerts
  .filter(c => { const s = slugOf(c.url); return s && !catalogSlugs.has(s); })
  .map(c => ({ title: c.title, url: c.url, certification_type: c.certification_type, last_modified: c.last_modified }))
  .sort((a, b) => (b.last_modified ?? "").localeCompare(a.last_modified ?? ""));
const apiExamCodes = new Set(apiExams.map(e => (e.display_name ?? "").toUpperCase()));
const newApiExams = apiExams
  .filter(e => { const n = (e.display_name ?? "").toUpperCase(); return EXAM_PREFIX_RE.test(n) && !catalogExamCodes.has(n); })
  .map(e => ({ display_name: e.display_name, title: e.title, url: e.url, last_modified: e.last_modified, beta: /\(beta\)/i.test(e.title ?? "") }))
  .sort((a, b) => (b.last_modified ?? "").localeCompare(a.last_modified ?? ""));
const mbNotTracked = apiExams.filter(e => /^MB-\d+/.test((e.display_name ?? "").toUpperCase())).length;

// ── 4. Study guides ────────────────────────────────────────────
type StudyResult = { exam: string; status?: number; error?: string; pageRetiresOn?: string; lastUpdated?: string; skillsAsOf?: string; mismatch?: string };
const studyGuides = await pool(msCerts, async (c): Promise<StudyResult> => {
  const exam = c.exam!;
  const url = `https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/${exam.toLowerCase()}`;
  const r = await fetchUrl(url);
  if (!r.ok) return { exam, error: r.error };
  const res: StudyResult = { exam, status: r.status };
  if (r.status !== 200) return res;
  const m = r.body.match(/will retire on\s+([A-Za-z]+\s+\d{1,2},\s+\d{4})/i);
  if (m) res.pageRetiresOn = m[1];
  res.lastUpdated = r.body.match(/Last updated[:\s]+(\d{4}-\d{2}-\d{2})/i)?.[1];
  res.skillsAsOf = r.body.match(/Skills measured as of\s+([A-Za-z]+\s+\d{1,2},\s+\d{4})/i)?.[1];
  if (res.pageRetiresOn) {
    const pageDate = new Date(`${res.pageRetiresOn} UTC`);
    const pageIso = isNaN(pageDate.getTime()) ? undefined : pageDate.toISOString().slice(0, 10);
    if (!c.retiring && !c.retirementDate) res.mismatch = `page says retires ${res.pageRetiresOn} but catalog lacks retiring/retirementDate`;
    else if (pageIso && c.retirementDate && pageIso !== c.retirementDate) res.mismatch = `page says ${pageIso}, catalog has ${c.retirementDate}`;
  }
  return res;
});

// ── 5. URL health ──────────────────────────────────────────────
type UrlResult = { id: string; url: string; status?: number; finalUrl?: string; error?: string; flag?: string };
const urlChecks = await pool(catalog.certs.filter(c => c.url), async (c): Promise<UrlResult> => {
  const url = c.url!;
  const r = await fetchUrl(url);
  if (!r.ok) return { id: c.id, url, error: r.error };
  const res: UrlResult = { id: c.id, url, status: r.status, finalUrl: r.url };
  try {
    const orig = new URL(url), fin = new URL(r.url);
    const samePath = orig.pathname.replace(/\/+$/, "").toLowerCase() === fin.pathname.replace(/\/+$/, "").toLowerCase();
    if (r.status >= 200 && r.status < 300 && !samePath) {
      const finDepth = fin.pathname.split("/").filter(Boolean).length;
      const origLeaf = orig.pathname.split("/").filter(Boolean).at(-1)?.toLowerCase();
      if (finDepth <= 1 || (origLeaf && !fin.pathname.toLowerCase().includes(origLeaf))) {
        res.flag = `redirected ${orig.pathname} → ${fin.pathname}`;
      }
    }
  } catch { /* ignore */ }
  return res;
});
const badUrls = urlChecks.filter(u => u.error || (u.status !== undefined && (u.status < 200 || u.status >= 300)) || u.flag);

// ── Report ─────────────────────────────────────────────────────
const report = {
  generatedAt: new Date().toISOString(),
  validation: { errors },
  retirement: {
    retired: retired.map(c => ({ id: c.id, exam: c.exam, retirementDate: c.retirementDate })),
    retiringWithin90Days: retiringSoon.map(c => ({ id: c.id, exam: c.exam, retirementDate: c.retirementDate })),
  },
  msLearnApi: {
    error: apiError,
    counts: { apiCertifications: apiCerts.length, trackedApiCertifications: trackedApiCerts.length, apiExams: apiExams.length },
    unmatchedCatalogCerts: unmatchedCerts,
    newCertificationCandidates: newApiCerts,
    newExamCandidates_partialSource: newApiExams,
    mbExamsNotTracked: mbNotTracked,
  },
  studyGuides,
  urlHealth: { checked: urlChecks.length, issues: badUrls },
};
fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));

const lines: string[] = [];
lines.push(`# Catalog check — ${today}`);
lines.push(``);
lines.push(`## 1. Validation`);
lines.push(errors.length ? errors.map(e => `- ❌ ${e}`).join("\n") : `- ✅ No errors (${catalog.certs.length} certs, ${catalog.links.length} links)`);
lines.push(``);
lines.push(`## 2. Retirement status`);
lines.push(`- Retired (date passed): ${retired.length}${retired.length ? " — " + retired.map(c => `${c.id} (${c.retirementDate})`).join(", ") : ""}`);
lines.push(`- Retiring within 90 days: ${retiringSoon.length}${retiringSoon.length ? " — " + retiringSoon.map(c => `${c.id} (${c.retirementDate})`).join(", ") : ""}`);
lines.push(``);
lines.push(`## 3. Microsoft Learn Catalog API diff`);
if (apiError) {
  lines.push(`- ⚠️ ${apiError}`);
} else {
  lines.push(`- API: ${trackedApiCerts.length} tracked certifications (of ${apiCerts.length}), ${apiExams.length} exams`);
  lines.push(`- Unmatched catalog certs (possibly retired OR url isn't a cert page — verify manually): ${unmatchedCerts.length}`);
  for (const u of unmatchedCerts) lines.push(`  - ${u.id} (${u.exam}) ${u.url}`);
  lines.push(`- New certification candidates: ${newApiCerts.length}`);
  for (const n of newApiCerts.slice(0, 20)) lines.push(`  - ${n.title} [${n.certification_type}] ${n.last_modified ?? "?"} ${n.url}`);
  if (newApiCerts.length > 20) lines.push(`  - … and ${newApiCerts.length - 20} more (see catalog-report.json)`);
  lines.push(`- New exam candidates (partial source — API exam list is incomplete): ${newApiExams.length}`);
  for (const e of newApiExams) lines.push(`  - ${e.display_name}${e.beta ? " (beta)" : ""} — ${e.title} ${e.last_modified ?? "?"} ${e.url}`);
  lines.push(`- MB-* exams in API (not tracked, Dynamics): ${mbNotTracked}`);
}
lines.push(``);
lines.push(`## 4. Microsoft study guides (${msCerts.length} checked)`);
const sgIssues = studyGuides.filter(s => s.error || (s.status !== undefined && s.status !== 200) || s.mismatch);
if (!sgIssues.length) lines.push(`- ✅ No issues`);
for (const s of sgIssues) {
  if (s.error) lines.push(`- ${s.exam}: fetch error ${s.error}`);
  else if (s.status !== 200) lines.push(`- ${s.exam}: HTTP ${s.status}`);
  else lines.push(`- ${s.exam}: ${s.mismatch}`);
}
lines.push(``);
lines.push(`## 5. URL health (${urlChecks.length} checked)`);
if (!badUrls.length) lines.push(`- ✅ All OK`);
for (const u of badUrls) {
  if (u.error) lines.push(`- ${u.id}: fetch error ${u.error} — ${u.url}`);
  else if (u.status !== undefined && (u.status < 200 || u.status >= 300)) lines.push(`- ${u.id}: HTTP ${u.status} — ${u.url}`);
  else lines.push(`- ${u.id}: suspicious redirect — ${u.flag} (${u.url})`);
}
console.log(lines.join("\n"));

process.exit(errors.length ? 1 : 0);
