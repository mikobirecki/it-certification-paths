import { useState } from 'react'

type Vendor = 'AWS' | 'Microsoft' | 'GCP' | 'Any'
type Role = 'developer' | 'admin' | 'architect' | 'security' | 'data' | 'devops' | 'general'
type Specialization = 'security' | 'data' | 'devops' | 'networking' | 'ai' | 'architecture' | 'general'
type Experience = 'none' | 'beginner' | 'intermediate' | 'advanced'
type CloudExp = 'none' | 'basic' | 'intermediate' | 'deep'

interface QuizAnswers {
  experience: Experience
  cloudExp: CloudExp
  role: Role
  vendor: Vendor
  specialization: Specialization
  time: 'short' | 'medium' | 'long'
}

interface Recommendation {
  id: string
  vendor: 'AWS' | 'Microsoft' | 'GCP'
  exam: string
  title: string
  level: string
  url: string
  reason: string
  score: number
}

const CERT_DB: Omit<Recommendation, 'reason' | 'score'>[] = [
  // AWS
  { id: 'aws-clf-c02', vendor: 'AWS', exam: 'CLF-C02', title: 'AWS Certified Cloud Practitioner', level: 'Fundamentals', url: 'https://aws.amazon.com/certification/certified-cloud-practitioner/' },
  { id: 'aws-aif-c01', vendor: 'AWS', exam: 'AIF-C01', title: 'AWS Certified AI Practitioner', level: 'Fundamentals', url: 'https://aws.amazon.com/certification/certified-ai-practitioner/' },
  { id: 'aws-saa-c03', vendor: 'AWS', exam: 'SAA-C03', title: 'AWS Certified Solutions Architect – Associate', level: 'Associate', url: 'https://aws.amazon.com/certification/certified-solutions-architect-associate/' },
  { id: 'aws-dva-c02', vendor: 'AWS', exam: 'DVA-C02', title: 'AWS Certified Developer – Associate', level: 'Associate', url: 'https://aws.amazon.com/certification/certified-developer-associate/' },
  { id: 'aws-soa-c03', vendor: 'AWS', exam: 'SOA-C03', title: 'AWS Certified CloudOps Engineer – Associate', level: 'Associate', url: 'https://aws.amazon.com/certification/certified-cloudops-engineer-associate/' },
  { id: 'aws-dea-c01', vendor: 'AWS', exam: 'DEA-C01', title: 'AWS Certified Data Engineer – Associate', level: 'Associate', url: 'https://aws.amazon.com/certification/certified-data-engineer-associate/' },
  { id: 'aws-mla-c01', vendor: 'AWS', exam: 'MLA-C01', title: 'AWS Certified Machine Learning Engineer – Associate', level: 'Associate', url: 'https://aws.amazon.com/certification/certified-machine-learning-engineer-associate/' },
  { id: 'aws-sap-c02', vendor: 'AWS', exam: 'SAP-C02', title: 'AWS Certified Solutions Architect – Professional', level: 'Professional', url: 'https://aws.amazon.com/certification/certified-solutions-architect-professional/' },
  { id: 'aws-dop-c02', vendor: 'AWS', exam: 'DOP-C02', title: 'AWS Certified DevOps Engineer – Professional', level: 'Professional', url: 'https://aws.amazon.com/certification/certified-devops-engineer-professional/' },
  { id: 'aws-scs-c02', vendor: 'AWS', exam: 'SCS-C02', title: 'AWS Certified Security – Specialty', level: 'Specialty', url: 'https://aws.amazon.com/certification/certified-security-specialty/' },
  { id: 'aws-ans-c01', vendor: 'AWS', exam: 'ANS-C01', title: 'AWS Certified Advanced Networking – Specialty', level: 'Specialty', url: 'https://aws.amazon.com/certification/certified-advanced-networking-specialty/' },
  { id: 'aws-gai-c01', vendor: 'AWS', exam: 'GAI-C01', title: 'AWS Certified Generative AI Developer – Professional', level: 'Professional', url: 'https://aws.amazon.com/certification/certified-generative-ai-developer-professional/' },
  // Microsoft Azure
  { id: 'az-900', vendor: 'Microsoft', exam: 'AZ-900', title: 'Microsoft Azure Fundamentals', level: 'Fundamentals', url: 'https://learn.microsoft.com/credentials/certifications/azure-fundamentals/' },
  { id: 'ms-ai900', vendor: 'Microsoft', exam: 'AI-900', title: 'Azure AI Fundamentals', level: 'Fundamentals', url: 'https://learn.microsoft.com/credentials/certifications/azure-ai-fundamentals/' },
  { id: 'ms-dp900', vendor: 'Microsoft', exam: 'DP-900', title: 'Azure Data Fundamentals', level: 'Fundamentals', url: 'https://learn.microsoft.com/credentials/certifications/azure-data-fundamentals/' },
  { id: 'ms-sc900', vendor: 'Microsoft', exam: 'SC-900', title: 'Security, Compliance, and Identity Fundamentals', level: 'Fundamentals', url: 'https://learn.microsoft.com/credentials/certifications/security-compliance-and-identity-fundamentals/' },
  { id: 'az-104', vendor: 'Microsoft', exam: 'AZ-104', title: 'Azure Administrator Associate', level: 'Associate', url: 'https://learn.microsoft.com/credentials/certifications/azure-administrator/' },
  { id: 'az-204', vendor: 'Microsoft', exam: 'AZ-204', title: 'Azure Developer Associate', level: 'Associate', url: 'https://learn.microsoft.com/credentials/certifications/azure-developer/' },
  { id: 'az-500', vendor: 'Microsoft', exam: 'AZ-500', title: 'Azure Security Engineer Associate', level: 'Associate', url: 'https://learn.microsoft.com/credentials/certifications/azure-security-engineer/' },
  { id: 'az-700', vendor: 'Microsoft', exam: 'AZ-700', title: 'Azure Network Engineer Associate', level: 'Associate', url: 'https://learn.microsoft.com/credentials/certifications/azure-network-engineer-associate/' },
  { id: 'ms-ai102', vendor: 'Microsoft', exam: 'AI-102', title: 'Azure AI Engineer Associate', level: 'Associate', url: 'https://learn.microsoft.com/credentials/certifications/azure-ai-engineer/' },
  { id: 'ms-dp100', vendor: 'Microsoft', exam: 'DP-100', title: 'Azure Data Scientist Associate', level: 'Associate', url: 'https://learn.microsoft.com/credentials/certifications/azure-data-scientist/' },
  { id: 'ms-dp203', vendor: 'Microsoft', exam: 'DP-203', title: 'Azure Data Engineer Associate', level: 'Associate', url: 'https://learn.microsoft.com/credentials/certifications/azure-data-engineer/' },
  { id: 'az-305', vendor: 'Microsoft', exam: 'AZ-305', title: 'Azure Solutions Architect Expert', level: 'Expert', url: 'https://learn.microsoft.com/credentials/certifications/azure-solutions-architect/' },
  { id: 'az-400', vendor: 'Microsoft', exam: 'AZ-400', title: 'DevOps Engineer Expert', level: 'Expert', url: 'https://learn.microsoft.com/credentials/certifications/devops-engineer/' },
  { id: 'ms-sc100', vendor: 'Microsoft', exam: 'SC-100', title: 'Microsoft Cybersecurity Architect', level: 'Expert', url: 'https://learn.microsoft.com/credentials/certifications/cybersecurity-architect-expert/' },
  // GCP
  { id: 'gcp-cdl', vendor: 'GCP', exam: 'CDL', title: 'Cloud Digital Leader', level: 'Fundamentals', url: 'https://cloud.google.com/certification/cloud-digital-leader' },
  { id: 'gcp-gai', vendor: 'GCP', exam: 'GAI', title: 'Generative AI Leader', level: 'Fundamentals', url: 'https://cloud.google.com/learn/certification/generative-ai-leader' },
  { id: 'gcp-ace', vendor: 'GCP', exam: 'ACE', title: 'Associate Cloud Engineer', level: 'Associate', url: 'https://cloud.google.com/certification/cloud-engineer' },
  { id: 'gcp-adp', vendor: 'GCP', exam: 'ADP', title: 'Associate Data Practitioner', level: 'Associate', url: 'https://cloud.google.com/learn/certification/data-practitioner' },
  { id: 'gcp-pca', vendor: 'GCP', exam: 'PCA', title: 'Professional Cloud Architect', level: 'Professional', url: 'https://cloud.google.com/certification/cloud-architect' },
  { id: 'gcp-pde', vendor: 'GCP', exam: 'PDE', title: 'Professional Data Engineer', level: 'Professional', url: 'https://cloud.google.com/certification/data-engineer' },
  { id: 'gcp-pcd', vendor: 'GCP', exam: 'PCD', title: 'Professional Cloud Developer', level: 'Professional', url: 'https://cloud.google.com/certification/cloud-developer' },
  { id: 'gcp-pcdo', vendor: 'GCP', exam: 'PCDO', title: 'Professional Cloud DevOps Engineer', level: 'Professional', url: 'https://cloud.google.com/certification/cloud-devops-engineer' },
  { id: 'gcp-psec', vendor: 'GCP', exam: 'PSEC', title: 'Professional Cloud Security Engineer', level: 'Professional', url: 'https://cloud.google.com/certification/cloud-security-engineer' },
  { id: 'gcp-pne', vendor: 'GCP', exam: 'PNE', title: 'Professional Cloud Network Engineer', level: 'Professional', url: 'https://cloud.google.com/certification/cloud-network-engineer' },
  { id: 'gcp-pmle', vendor: 'GCP', exam: 'PMLE', title: 'Professional Machine Learning Engineer', level: 'Professional', url: 'https://cloud.google.com/certification/machine-learning-engineer' },
  { id: 'gcp-psoc', vendor: 'GCP', exam: 'PSOC', title: 'Professional Security Operations Engineer', level: 'Professional', url: 'https://cloud.google.com/learn/certification/security-operations-engineer' },
]

function computeRecommendations(answers: QuizAnswers): Recommendation[] {
  const scores = new Map<string, number>()
  const reasons = new Map<string, string[]>()

  const add = (id: string, pts: number, reason: string) => {
    scores.set(id, (scores.get(id) ?? 0) + pts)
    const r = reasons.get(id) ?? []
    if (!r.includes(reason)) r.push(reason)
    reasons.set(id, r)
  }

  const { experience, cloudExp, role, vendor, specialization, time } = answers

  // ── Vendor filter ──────────────────────────────────────────────
  const allowed = vendor === 'Any'
    ? (['AWS', 'Microsoft', 'GCP'] as const)
    : ([vendor] as const)

  const db = CERT_DB.filter(c => (allowed as readonly string[]).includes(c.vendor))

  // ── Experience → level scoring ─────────────────────────────────
  const fundIds = db.filter(c => c.level === 'Fundamentals').map(c => c.id)
  const assocIds = db.filter(c => c.level === 'Associate').map(c => c.id)
  const proIds = db.filter(c => c.level === 'Professional' || c.level === 'Expert').map(c => c.id)
  const specIds = db.filter(c => c.level === 'Specialty').map(c => c.id)

  if (experience === 'none' || cloudExp === 'none') {
    fundIds.forEach(id => add(id, 10, 'Great starting point for beginners'))
    assocIds.forEach(id => add(id, 2, 'Consider after a foundational cert'))
  } else if (experience === 'beginner' || cloudExp === 'basic') {
    fundIds.forEach(id => add(id, 7, 'Validates foundational cloud knowledge'))
    assocIds.forEach(id => add(id, 8, 'Ideal next step with some experience'))
  } else if (experience === 'intermediate' || cloudExp === 'intermediate') {
    assocIds.forEach(id => add(id, 10, 'Matches your intermediate experience level'))
    proIds.forEach(id => add(id, 5, 'Stretch goal after associate level'))
    specIds.forEach(id => add(id, 4, 'Adds a specialization to your profile'))
  } else {
    // advanced
    proIds.forEach(id => add(id, 10, 'Validates expert-level skills'))
    specIds.forEach(id => add(id, 8, 'Deep specialization for experienced pros'))
    assocIds.forEach(id => add(id, 3, 'Quick foundation cert to fill gaps'))
  }

  // ── Time available ─────────────────────────────────────────────
  if (time === 'short') {
    fundIds.forEach(id => add(id, 4, 'Can be completed in a few weeks'))
    assocIds.forEach(id => add(id, 2, 'Doable with focused 2–3 month prep'))
    proIds.forEach(id => add(id, -3, 'Requires longer preparation time'))
  } else if (time === 'long') {
    proIds.forEach(id => add(id, 3, 'You have time for a professional-level cert'))
    specIds.forEach(id => add(id, 3, 'Worth the longer prep investment'))
  }

  // ── Role scoring ───────────────────────────────────────────────
  const roleMap: Record<Role, string[]> = {
    developer: ['aws-dva-c02', 'az-204', 'gcp-pcd', 'aws-saa-c03'],
    admin:     ['aws-soa-c03', 'az-104', 'gcp-ace', 'aws-saa-c03'],
    architect: ['aws-sap-c02', 'az-305', 'gcp-pca', 'aws-saa-c03'],
    security:  ['aws-scs-c02', 'az-500', 'gcp-psec', 'ms-sc100', 'ms-sc900', 'ms-sc200'],
    data:      ['aws-dea-c01', 'aws-mla-c01', 'ms-dp203', 'ms-dp100', 'gcp-pde', 'gcp-adp', 'ms-dp900'],
    devops:    ['aws-dop-c02', 'az-400', 'gcp-pcdo', 'aws-soa-c03'],
    general:   ['aws-clf-c02', 'az-900', 'gcp-cdl'],
  }
  ;(roleMap[role] ?? []).forEach(id => {
    if (db.find(c => c.id === id)) add(id, 6, `Highly relevant for your ${role} role`)
  })

  // ── Specialization scoring ─────────────────────────────────────
  const specMap: Record<Specialization, string[]> = {
    security:     ['aws-scs-c02', 'az-500', 'gcp-psec', 'ms-sc100', 'ms-sc900', 'ms-ai102', 'gcp-psoc'],
    data:         ['aws-dea-c01', 'ms-dp203', 'ms-dp100', 'gcp-pde', 'gcp-pdbe', 'ms-dp900', 'gcp-adp'],
    devops:       ['aws-dop-c02', 'az-400', 'gcp-pcdo', 'aws-soa-c03'],
    networking:   ['aws-ans-c01', 'az-700', 'gcp-pne'],
    ai:           ['aws-mla-c01', 'aws-gai-c01', 'ms-ai102', 'ms-ai900', 'gcp-pmle', 'gcp-gai', 'aws-aif-c01'],
    architecture: ['aws-sap-c02', 'az-305', 'gcp-pca'],
    general:      ['aws-saa-c03', 'az-104', 'gcp-ace'],
  }
  ;(specMap[specialization] ?? []).forEach(id => {
    if (db.find(c => c.id === id)) add(id, 8, `Aligns with your ${specialization} specialization`)
  })

  // ── AI bonus for AI specialization ────────────────────────────
  if (specialization === 'ai') {
    ;['aws-aif-c01', 'ms-ai900', 'gcp-gai'].forEach(id => {
      if (db.find(c => c.id === id)) add(id, 3, 'Great AI entry-level cert')
    })
  }

  // ── Vendor bonus ───────────────────────────────────────────────
  if (vendor !== 'Any') {
    db.forEach(c => add(c.id, 2, `Your preferred vendor: ${vendor}`))
  }

  // ── Build result ───────────────────────────────────────────────
  return db
    .map(c => ({
      ...c,
      score: scores.get(c.id) ?? 0,
      reason: (reasons.get(c.id) ?? []).slice(0, 2).join(' · '),
    }))
    .filter(c => c.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
}

const LEVEL_COLOR: Record<string, string> = {
  Fundamentals: '#22d3ee',
  Associate:    '#4ade80',
  Professional: '#a78bfa',
  Expert:       '#a78bfa',
  Specialty:    '#fb923c',
}

const VENDOR_COLOR: Record<string, string> = {
  AWS:       '#f59e0b',
  Microsoft: '#3b82f6',
  GCP:       '#22c55e',
}

// ── Wizard steps ─────────────────────────────────────────────────

type Step = {
  id: string
  question: string
  subtitle?: string
  options: { value: string; label: string; icon: string }[]
  field: keyof QuizAnswers
}

const STEPS: Step[] = [
  {
    id: 'experience',
    question: 'How many years of IT experience do you have?',
    subtitle: 'Including any tech roles, not just cloud.',
    field: 'experience',
    options: [
      { value: 'none',         label: 'I\'m just starting out',    icon: '🌱' },
      { value: 'beginner',     label: '1–2 years',                 icon: '📚' },
      { value: 'intermediate', label: '3–5 years',                 icon: '💼' },
      { value: 'advanced',     label: '6+ years',                  icon: '🏆' },
    ],
  },
  {
    id: 'cloudExp',
    question: 'How familiar are you with cloud platforms?',
    field: 'cloudExp',
    options: [
      { value: 'none',         label: 'No cloud experience',       icon: '☁️' },
      { value: 'basic',        label: 'I\'ve used a few services',  icon: '🔌' },
      { value: 'intermediate', label: 'I work with cloud daily',   icon: '⚙️' },
      { value: 'deep',         label: 'I architect cloud systems', icon: '🏗️' },
    ],
  },
  {
    id: 'role',
    question: 'What best describes your current or target role?',
    field: 'role',
    options: [
      { value: 'developer',  label: 'Developer / Software Engineer',  icon: '👨‍💻' },
      { value: 'admin',      label: 'SysAdmin / Cloud Admin / Ops',   icon: '🖥️' },
      { value: 'devops',     label: 'DevOps / SRE / Platform Eng.',  icon: '🔁' },
      { value: 'architect',  label: 'Solutions / Cloud Architect',   icon: '📐' },
      { value: 'security',   label: 'Security / Compliance',         icon: '🔒' },
      { value: 'data',       label: 'Data Engineer / Analyst / ML',  icon: '📊' },
      { value: 'general',    label: 'Business / General IT',         icon: '🌐' },
    ],
  },
  {
    id: 'vendor',
    question: 'Do you have a preferred cloud vendor?',
    subtitle: 'Pick one to focus results, or let us suggest across all three.',
    field: 'vendor',
    options: [
      { value: 'AWS',       label: 'Amazon Web Services (AWS)',  icon: '🟠' },
      { value: 'Microsoft', label: 'Microsoft Azure',            icon: '🔵' },
      { value: 'GCP',       label: 'Google Cloud (GCP)',         icon: '🟢' },
      { value: 'Any',       label: 'No preference — show all',   icon: '⭐' },
    ],
  },
  {
    id: 'specialization',
    question: 'Which area do you want to focus on?',
    field: 'specialization',
    options: [
      { value: 'general',      label: 'General / Infrastructure',    icon: '☁️' },
      { value: 'developer',    label: 'Application Development',     icon: '💻' },
      { value: 'devops',       label: 'DevOps / CI-CD / IaC',       icon: '🔄' },
      { value: 'security',     label: 'Security & Compliance',       icon: '🛡️' },
      { value: 'data',         label: 'Data, Analytics & Databases', icon: '🗄️' },
      { value: 'ai',           label: 'AI / Machine Learning',       icon: '🤖' },
      { value: 'networking',   label: 'Networking',                  icon: '🌐' },
      { value: 'architecture', label: 'Solution Architecture',       icon: '🏛️' },
    ],
  },
  {
    id: 'time',
    question: 'How much time can you dedicate to exam preparation?',
    field: 'time',
    options: [
      { value: 'short',  label: 'Up to 4 weeks',        icon: '⚡' },
      { value: 'medium', label: '1–3 months',            icon: '📅' },
      { value: 'long',   label: '3+ months — no rush',  icon: '🧘' },
    ],
  },
]

const INITIAL: QuizAnswers = {
  experience:     'intermediate',
  cloudExp:       'basic',
  role:           'general',
  vendor:         'Any',
  specialization: 'general',
  time:           'medium',
}

export default function CertQuiz() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<QuizAnswers>(INITIAL)
  const [results, setResults] = useState<Recommendation[] | null>(null)
  const [selected, setSelected] = useState<string | null>(null)

  const current = STEPS[step]

  const choose = (value: string) => {
    const updated = { ...answers, [current.field]: value }
    setAnswers(updated)
    setSelected(value)
    setTimeout(() => {
      setSelected(null)
      if (step < STEPS.length - 1) {
        setStep(s => s + 1)
      } else {
        setResults(computeRecommendations(updated))
      }
    }, 220)
  }

  const reset = () => {
    setStep(0)
    setAnswers(INITIAL)
    setResults(null)
    setSelected(null)
  }

  const back = () => {
    if (step > 0) setStep(s => s - 1)
  }

  if (results) {
    return (
      <div className="quiz-container">
        <div className="quiz-results">
          <div className="quiz-results-header">
            <span className="quiz-results-icon">🎯</span>
            <h2>Your Recommended Certifications</h2>
            <p className="quiz-results-sub">Based on your answers, here are the best certifications for you — sorted by fit.</p>
          </div>
          <div className="quiz-results-grid">
            {results.map((rec, i) => (
              <a
                key={rec.id}
                href={rec.url}
                target="_blank"
                rel="noopener noreferrer"
                className="quiz-rec-card"
              >
                <div className="quiz-rec-rank">#{i + 1}</div>
                <div className="quiz-rec-vendor" style={{ color: VENDOR_COLOR[rec.vendor] }}>
                  {rec.vendor}
                </div>
                <div className="quiz-rec-exam" style={{ color: VENDOR_COLOR[rec.vendor] }}>
                  {rec.exam}
                </div>
                <div className="quiz-rec-title">{rec.title}</div>
                <div
                  className="quiz-rec-level"
                  style={{
                    color: LEVEL_COLOR[rec.level] ?? '#94a3b8',
                    borderColor: LEVEL_COLOR[rec.level] ?? '#94a3b8',
                  }}
                >
                  {rec.level}
                </div>
                <div className="quiz-rec-reason">{rec.reason}</div>
                <div className="quiz-rec-link">View certification →</div>
              </a>
            ))}
          </div>
          <div className="quiz-actions">
            <button className="quiz-btn-secondary" onClick={reset}>
              🔄 Retake Quiz
            </button>
          </div>
        </div>
      </div>
    )
  }

  const progress = ((step) / STEPS.length) * 100

  return (
    <div className="quiz-container">
      <div className="quiz-card">
        {/* Header */}
        <div className="quiz-header">
          <div className="quiz-progress-bar">
            <div className="quiz-progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="quiz-step-label">
            Step {step + 1} of {STEPS.length}
          </div>
        </div>

        {/* Question */}
        <div className="quiz-question-block">
          <h2 className="quiz-question">{current.question}</h2>
          {current.subtitle && (
            <p className="quiz-subtitle">{current.subtitle}</p>
          )}
        </div>

        {/* Options */}
        <div className={`quiz-options ${current.options.length > 5 ? 'quiz-options-grid' : ''}`}>
          {current.options.map(opt => (
            <button
              key={opt.value}
              className={`quiz-option ${selected === opt.value ? 'quiz-option-selected' : ''} ${answers[current.field] === opt.value && selected === null ? 'quiz-option-prev' : ''}`}
              onClick={() => choose(opt.value)}
            >
              <span className="quiz-option-icon">{opt.icon}</span>
              <span className="quiz-option-label">{opt.label}</span>
            </button>
          ))}
        </div>

        {/* Navigation */}
        <div className="quiz-nav">
          {step > 0 && (
            <button className="quiz-btn-secondary" onClick={back}>
              ← Back
            </button>
          )}
          <div style={{ flex: 1 }} />
          <span className="quiz-nav-hint">Click an option to continue</span>
        </div>
      </div>
    </div>
  )
}
