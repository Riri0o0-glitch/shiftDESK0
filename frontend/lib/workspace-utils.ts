import type { Workspace, WorkspaceType, Task, Milestone } from './types'

export const uid = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36)

export const TYPE_LABEL: Record<WorkspaceType, string> = {
  study: 'Study',
  project: 'Project',
  personal: 'Personal',
}

export function progressOf(w: Workspace) {
  const total = w.tasks.length
  const done = w.tasks.filter((t) => t.done).length
  return { total, done, percent: total === 0 ? 0 : Math.round((done / total) * 100) }
}

export function todayISO() {
  const d = new Date()
  const off = d.getTimezoneOffset()
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10)
}

export function daysUntil(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  const target = new Date(y, m - 1, d).getTime()
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  return Math.round((target - today) / 86400000)
}

export function formatDate(iso: string, opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' }) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', opts)
}

export function addDaysISO(days: number) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  const off = d.getTimezoneOffset()
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10)
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function statusOf(w: Workspace): { label: string; tone: 'olive' | 'terracotta' | 'muted' } {
  const { total, percent } = progressOf(w)
  if (total > 0 && percent === 100) return { label: 'Complete', tone: 'olive' }
  if (w.deadline && daysUntil(w.deadline) < 0) return { label: 'Past deadline', tone: 'terracotta' }
  if (total === 0) return { label: 'Getting started', tone: 'muted' }
  return { label: 'In progress', tone: 'olive' }
}

const STARTERS: Record<WorkspaceType, { tasks: string[]; milestones: string[] }> = {
  study: {
    tasks: ['Collect syllabus, notes and reading list', 'Outline the key topics to cover', 'Schedule the first focused study session'],
    milestones: ['Materials gathered', 'First full revision pass', 'Ready for submission'],
  },
  project: {
    tasks: ['Write a one-paragraph project brief', 'List the core requirements', 'Set up the working files or repository'],
    milestones: ['Scope defined', 'First working version', 'Final review and delivery'],
  },
  personal: {
    tasks: ['Write down why this goal matters', 'Choose the smallest first step', 'Block time in your week for it'],
    milestones: ['Clear starting plan', 'Consistent routine', 'Goal reached'],
  },
}

export function createWorkspace(input: {
  goal: string
  name: string
  description: string
  type: WorkspaceType
  deadline?: string
  withStarter: boolean
}): Workspace {
  const now = Date.now()
  const starter = STARTERS[input.type]
  const tasks: Task[] = input.withStarter
    ? starter.tasks.map((title, i) => ({ id: uid(), title, done: false, createdAt: now + i }))
    : []
  const milestones: Milestone[] = input.withStarter
    ? starter.milestones.map((title, i) => ({ id: uid(), title, status: i === 0 ? 'in-progress' : 'upcoming' }))
    : []
  const goal = input.goal.trim()
  return {
    id: uid(),
    name: input.name.trim() || deriveName(goal),
    goal,
    description: input.description.trim(),
    type: input.type,
    deadline: input.deadline || undefined,
    createdAt: now,
    tasks,
    milestones,
    notes: [],
    documents: [],
  }
}

function deriveName(goal: string) {
  const firstLine = goal.split(/[.\n]/)[0].trim()
  const words = firstLine.split(/\s+/).slice(0, 6).join(' ')
  const name = words.length < firstLine.length ? `${words}…` : words
  return name.charAt(0).toUpperCase() + name.slice(1)
}

export function createSampleWorkspace(): Workspace {
  const now = Date.now()
  const t = (title: string, done: boolean, i: number): Task => ({
    id: uid(),
    title,
    done,
    createdAt: now - (10 - i) * 3600000,
    completedAt: done ? now - (5 - i) * 3600000 : undefined,
  })
  return {
    id: uid(),
    name: 'Campus Event Finder',
    goal: 'Design and ship a web app that helps students discover events on campus, for my final-year mini project review.',
    description: 'A Flask + React web app with event listings, category filters, and a personal saved-events list.',
    type: 'project',
    deadline: addDaysISO(24),
    createdAt: now - 6 * 86400000,
    isSample: true,
    tasks: [
      t('Write the project abstract and problem statement', true, 0),
      t('Sketch the main screens on paper', true, 1),
      t('Set up the Flask API skeleton', true, 2),
      t('Design the event data model', false, 3),
      t('Build the event listing page', false, 4),
      t('Add category filters and search', false, 5),
      t('Prepare review slides and demo script', false, 6),
    ],
    milestones: [
      { id: uid(), title: 'Proposal approved', date: addDaysISO(-4), status: 'completed' },
      { id: uid(), title: 'Core features working', date: addDaysISO(8), status: 'in-progress' },
      { id: uid(), title: 'User testing with classmates', date: addDaysISO(16), status: 'upcoming' },
      { id: uid(), title: 'Final review & submission', date: addDaysISO(24), status: 'upcoming' },
    ],
    notes: [
      {
        id: uid(),
        title: 'Feedback from guide',
        body: 'Focus on a clean demo flow. Show search working end to end. Keep the architecture slide simple.',
        updatedAt: now - 2 * 86400000,
      },
      {
        id: uid(),
        title: 'Ideas for later',
        body: 'Calendar export, reminders before events, club pages.',
        updatedAt: now - 86400000,
      },
    ],
    documents: [
      { id: uid(), name: 'project-proposal.pdf', size: 482_133, mime: 'application/pdf', addedAt: now - 5 * 86400000, storage: 'local' },
    ],
  }
}
