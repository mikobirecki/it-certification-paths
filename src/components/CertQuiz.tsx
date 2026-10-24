import { useState } from 'react'
import type { Cert, Vendor } from '../types'
import { defaultCerts } from '../data/defaultData'
import { getRetirementStatus } from '../utils/retirement'

type VendorChoice = Vendor | 'Any'
type Role = 'developer' | 'admin' | 'architect' | 'security' | 'data' | 'devops' | 'general'
type Specialization = 'security' | 'data' | 'devops' | 'networking' | 'ai' | 'architecture' | 'developer' | 'general'
type Experience = 'none' | 'beginner' | 'intermediate' | 'advanced'
type CloudExp = 'none' | 'basic' | 'intermediate' | 'deep'

interface QuizAnswers {
  experience: Experience
  cloudExp: CloudExp
  role: Role
  vendor: VendorChoice
  specialization: Specialization
  time: 'short' | 'medium' | 'long'
}

interface Recommendation {
  id: string
  vendor: Vendor
  exam: string
  title: string
  level: string
  url: string
  reason: string
  score: number
}

type NormalizedLevel = 'Fundamentals' | 'Associate' | 'Professional' | 'Specialty'

function normalizedLevel(c: Cert): NormalizedLevel {
  if (c.vendor === 'RedHat' && c.rhLevel != null) {
    if (c.rhLevel === 1) return 'Fundamentals'
    if (c.rhLevel === 2) return 'Associate'
    if (c.rhLevel === 4) return 'Specialty'
    return 'Professional'
  }
  switch (c.level) {
    case 'Fundamentals': return 'Fundamentals'
    case 'Associate': return 'Associate'
    case 'Specialty': return 'Specialty'
    default: return 'Professional'
  }
}

// Candidates: everything except retired certs and Red Hat courses/bundles
const CERT_DB = defaultCerts.filter(
  c => getRetirementStatus(c) !== 'retired' && !(c.vendor === 'RedHat' && (c.level === 'Course' || c.level === 'Bundle')),
)


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
  const db = CERT_DB.filter(c => vendor === 'Any' || c.vendor === vendor)

  // ── Experience → level scoring ─────────────────────────────────
  const fundIds = db.filter(c => normalizedLevel(c) === 'Fundamentals').map(c => c.id)
  const assocIds = db.filter(c => normalizedLevel(c) === 'Associate').map(c => c.id)
  const proIds = db.filter(c => normalizedLevel(c) === 'Professional').map(c => c.id)
  const specIds = db.filter(c => normalizedLevel(c) === 'Specialty').map(c => c.id)

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
  const roleTracks: Partial<Record<Role, Cert['roles'][number]>> = {
    admin: 'SysAdmin', devops: 'DevOps', architect: 'Architect',
    security: 'Security', data: 'Data&AI', general: 'General',
  }
  db.forEach(c => {
    const track = roleTracks[role]
    const matches = role === 'developer'
      ? c.roles.includes('DevOps') || /develop|application|api|code/i.test(`${c.title} ${c.domain ?? ''}`)
      : track !== undefined && c.roles.includes(track)
    if (matches) add(c.id, 6, `Highly relevant for your ${role} role`)
  })

  // ── Specialization scoring ─────────────────────────────────────
  const specRegex: Record<Specialization, RegExp> = {
    security:     /secur|identity|compliance|threat/i,
    data:         /\bdata\b|database|analytics|fabric|sql|cosmos|warehouse/i,
    devops:       /devops|automation|terraform|ansible|gitops|ci\/cd|actions|platform eng/i,
    networking:   /network/i,
    ai:           /\bai\b|machine learning|\bml\b|generative|agent|claude|llm/i,
    architecture: /architect/i,
    developer:    /develop|application/i,
    general:      /administrator|cloud engineer|fundamentals|infrastructure|practitioner/i,
  }
  db.forEach(c => {
    const hay = `${c.title} ${c.domain ?? ''} ${c.description ?? ''}`
    if (specRegex[specialization].test(hay)) add(c.id, 8, `Aligns with your ${specialization} specialization`)
  })

  // ── AI bonus for AI specialization ────────────────────────────
  if (specialization === 'ai') {
    db.forEach(c => {
      if (normalizedLevel(c) === 'Fundamentals' && specRegex.ai.test(`${c.title} ${c.domain ?? ''} ${c.description ?? ''}`)) {
        add(c.id, 3, 'Great AI entry-level cert')
      }
    })
  }

  // ── Retiring penalty ──────────────────────────────────────────
  db.forEach(c => {
    if (getRetirementStatus(c) === 'retiring') add(c.id, -4, `Retiring on ${c.retirementDate}`)
  })

  // ── Vendor bonus ───────────────────────────────────────────────
  if (vendor !== 'Any') {
    db.forEach(c => add(c.id, 2, `Your preferred vendor: ${vendor}`))
  }

  // ── Build result ───────────────────────────────────────────────
  return db
    .map(c => ({
      id: c.id,
      vendor: c.vendor,
      exam: c.exam ?? c.code ?? '',
      title: c.title,
      level: c.levelDisplay ?? normalizedLevel(c),
      url: c.url ?? '',
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
  AWS:        '#f59e0b',
  Microsoft:  '#3b82f6',
  GCP:        '#22c55e',
  RedHat:     '#ef4444',
  HashiCorp:  '#ffd814',
  Kubernetes: '#326ce5',
  GitHub:     '#e2e8f0',
  Anthropic:  '#d97757',
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
    subtitle: 'Pick one to focus results, or let us suggest across all vendors.',
    field: 'vendor',
    options: [
      { value: 'AWS',        label: 'Amazon Web Services (AWS)', icon: '🟠' },
      { value: 'Microsoft',  label: 'Microsoft Azure',           icon: '🔵' },
      { value: 'GCP',        label: 'Google Cloud (GCP)',        icon: '🟢' },
      { value: 'Kubernetes', label: 'Kubernetes / CNCF',         icon: '⚓' },
      { value: 'RedHat',     label: 'Red Hat',                   icon: '🎩' },
      { value: 'HashiCorp',  label: 'HashiCorp',                 icon: '🧩' },
      { value: 'GitHub',     label: 'GitHub',                    icon: '�' },
      { value: 'Anthropic',  label: 'Anthropic (Claude)',        icon: '🤖' },
      { value: 'Any',        label: 'No preference — show all',  icon: '⭐' },
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
