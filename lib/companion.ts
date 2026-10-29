import type { Workspace } from './types'
import { daysUntil, progressOf, formatDate, todayISO } from './workspace-utils'

export interface CompanionLine {
  title: string
  detail?: string
}

export function summarize(w: Workspace): CompanionLine[] {
  const { total, done, percent } = progressOf(w)
  const open = w.tasks.filter((t) => !t.done)
  const lines: CompanionLine[] = []
  lines.push({
    title: total === 0 ? 'No tasks yet.' : `${done} of ${total} tasks complete (${percent}%).`,
    detail: open.length ? `Still open: ${open.slice(0, 3).map((t) => t.title).join('; ')}${open.length > 3 ? ` and ${open.length - 3} more` : ''}.` : undefined,
  })
  const current = w.milestones.find((m) => m.status === 'in-progress')
  const doneMs = w.milestones.filter((m) => m.status === 'completed').length
  if (w.milestones.length) {
    lines.push({
      title: `${doneMs} of ${w.milestones.length} milestones reached.`,
      detail: current ? `Currently working toward “${current.title}”.` : undefined,
    })
  }
  if (w.deadline) {
    const d = daysUntil(w.deadline)
    lines.push({
      title: d >= 0 ? `${d} day${d === 1 ? '' : 's'} until ${formatDate(w.deadline)}.` : `Deadline passed ${-d} day${d === -1 ? '' : 's'} ago.`,
    })
  }
  return lines
}

export function suggestNext(w: Workspace): CompanionLine[] {
  const open = w.tasks.filter((t) => !t.done)
  const out: CompanionLine[] = []
  if (w.tasks.length === 0) {
    out.push({ title: 'Break the goal into three small tasks.', detail: 'Start with something you can finish in under 30 minutes.' })
  } else if (open.length === 0) {
    out.push({ title: 'Every task is done.', detail: 'Mark the current milestone complete, or add the next set of tasks.' })
  } else {
    out.push({ title: `Next up: ${open[0].title}`, detail: 'Start a 25-minute focus session on just this.' })
  }

  const today = todayISO()
  const overdue = w.milestones.find((m) => m.status !== 'completed' && m.date && m.date < today)
  if (overdue) out.push({ title: `“${overdue.title}” is past its date.`, detail: 'Update its date or mark it complete.' })
  else if (w.milestones.length > 0 && !w.milestones.some((m) => m.status === 'in-progress')) {
    const next = w.milestones.find((m) => m.status === 'upcoming')
    if (next) out.push({ title: `Mark “${next.title}” as in progress.`, detail: 'Naming the current milestone keeps the work pointed.' })
  }

  if (w.deadline && open.length > 0) {
    const d = daysUntil(w.deadline)
    if (d > 0) {
      const perDay = open.length / d
      out.push({
        title: perDay >= 1 ? `Aim for about ${Math.ceil(perDay)} task${Math.ceil(perDay) === 1 ? '' : 's'} a day.` : `One task every ${Math.floor(1 / perDay)} days keeps you on track.`,
        detail: `${open.length} open task${open.length === 1 ? '' : 's'}, ${d} day${d === 1 ? '' : 's'} left.`,
      })
    }
  }
  if (w.notes.length === 0) out.push({ title: 'Capture what you already know in a note.', detail: 'Ideas, feedback, links — anything you would otherwise forget.' })
  return out.slice(0, 3)
}
