import * as fs from "node:fs";
import * as path from "node:path";

const ROOT = process.cwd();
const OUT_PATH = path.join(ROOT, "scripts", "ms-exams-data.json");

const LOCALE = "en-us";
const BASE = `https://learn.microsoft.com/${LOCALE}/credentials/certifications/resources/study-guides`;

const MS_EXAMS = [
  "AI-102","AI-900",
  "AZ-104","AZ-120","AZ-140","AZ-204","AZ-305","AZ-400","AZ-500","AZ-700","AZ-800","AZ-801","AZ-900",
  "DP-100","DP-203","DP-300","DP-420","DP-600","DP-700","DP-900",
  "GH-100","GH-200","GH-300","GH-500","GH-900",
  "MB-210","MB-220","MB-230","MB-240","MB-260","MB-280","MB-310","MB-330","MB-335","MB-500","MB-700","MB-800","MB-820",
  "MD-102",
  "MS-102","MS-700","MS-721","MS-900",
  "PL-200","PL-300","PL-400","PL-500","PL-600","PL-900",
  "SC-100","SC-200","SC-300","SC-401","SC-900"
];

interface ExamData {
  examCode: string;
  title: string;
  url: string;
  lastUpdated?: string;
  scoreToPass?: number;
  skillsMeasuredAsOf?: string;
  skillsAtAGlance?: { area: string; percent?: string }[];
  warnings?: string[];
  fetchError?: string;
}

function extractLastUpdated(html: string): string | undefined {
  const m = html.match(/Last updated[:\s]+(\d{4}-\d{2}-\d{2})/i);
  return m?.[1];
}

function extractScoreToPass(html: string): number | undefined {
  const en = html.match(/score of\s+(\d{3})\s+or greater/i);
  if (en?.[1]) return Number(en[1]);
  return undefined;
}

function extractTitle(html: string): string | undefined {
  const m = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  return m?.[1]?.trim();
}

function extractSkillsMeasuredAsOf(html: string): string | undefined {
  const m = html.match(/Skills measured as of\s+([A-Za-z]+\s+\d{1,2},\s+\d{4})/i);
  return m?.[1];
}

function extractSkillsAtAGlance(html: string): { area: string; percent?: string }[] | undefined {
  const skillsSection = html.match(/Skills at a glance[\s\S]*?<ul[^>]*>([\s\S]*?)<\/ul>/i);
  if (!skillsSection) return undefined;

  const items: { area: string; percent?: string }[] = [];
  const liRegex = /<li[^>]*>([\s\S]*?)<\/li>/gi;
  let match;
  while ((match = liRegex.exec(skillsSection[1])) !== null) {
    const text = match[1].replace(/<[^>]+>/g, '').trim().replace(/\s+/g, ' ');
    const m = text.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
    if (m) {
      items.push({ area: m[1].trim(), percent: m[2].trim() });
    } else {
      items.push({ area: text });
    }
  }
  return items.length ? items : undefined;
}

function extractWarnings(html: string): string[] {
  const warnings: string[] = [];
  const retire = html.match(/will retire on\s+([A-Za-z]+\s+\d{1,2},\s+\d{4})/i);
  if (retire?.[0]) warnings.push(retire[0].trim());
  return warnings;
}

async function fetchExam(examCode: string): Promise<ExamData> {
  const url = `${BASE}/${examCode.toLowerCase()}`;
  
  const base: ExamData = {
    examCode: examCode.toUpperCase(),
    title: "",
    url
  };

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
      }
    });

    if (!res.ok) {
      return { ...base, fetchError: `HTTP ${res.status}` };
    }

    const html = await res.text();
    
    const title = extractTitle(html) || `Exam ${examCode.toUpperCase()}`;
    const lastUpdated = extractLastUpdated(html);
    const scoreToPass = extractScoreToPass(html);
    const skillsMeasuredAsOf = extractSkillsMeasuredAsOf(html);
    const skillsAtAGlance = extractSkillsAtAGlance(html);
    const warnings = extractWarnings(html);

    return {
      ...base,
      title,
      ...(lastUpdated ? { lastUpdated } : {}),
      ...(scoreToPass ? { scoreToPass } : {}),
      ...(skillsMeasuredAsOf ? { skillsMeasuredAsOf } : {}),
      ...(skillsAtAGlance ? { skillsAtAGlance } : {}),
      ...(warnings.length ? { warnings } : {})
    };
  } catch (e: any) {
    return { ...base, fetchError: e?.message ?? String(e) };
  }
}

async function main() {
  console.log(`Fetching ${MS_EXAMS.length} Microsoft exams...`);
  
  const results: ExamData[] = [];
  
  for (const code of MS_EXAMS) {
    const data = await fetchExam(code);
    results.push(data);
    
    const status = data.fetchError ? `ERROR: ${data.fetchError}` : "OK";
    console.log(`${data.examCode}: ${status} ${data.lastUpdated || ""}`);
    
    // Small delay to be nice to Microsoft servers
    await new Promise(r => setTimeout(r, 300));
  }

  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, JSON.stringify(results, null, 2), "utf-8");
  console.log(`\nSaved: ${OUT_PATH} (${results.length} items)`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
