'use client'

import { motion } from 'framer-motion'
import { CalendarDays } from 'lucide-react'
import type { Workspace } from '@/lib/types'
import { TYPE_LABEL, daysUntil, formatDate, progressOf, statusOf } from '@/lib/workspace-utils'
import { Pill } from '../primitives'

export function OverviewSection({ workspace }: { workspace: Workspace }) {
  const { total, done, percent } = progressOf(workspace)
  const status = statusOf(workspace)
  const current = workspace.milestones.find((m) => m.status === 'in-progress')
  const days = workspace.deadline ? daysUntil(workspace.deadline) : null

  return (
    <section id="overview" aria-labelledby="overview-heading" className="scroll-mt-28">
      <div className="flex flex-wrap items-center gap-2">
        <Pill tone={status.tone}>
          <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
          {status.label}
        </Pill>
        <Pill>{TYPE_LABEL[workspace.type]}</Pill>
        {workspace.isSample && <Pill tone="terracotta">Sample workspace</Pill>}
      </div>

      <h1 id="overview-heading" className="mt-5 text-balance font-serif text-5xl leading-[1.02] md:text-6xl">
        {workspace.name}
      </h1>
      <p className="mt-4 max-w-2xl text-pretty text-lg leading-relaxed text-foreground/80">{workspace.goal}</p>
      {workspace.description && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{workspace.description}</p>}

      <dl className="mt-10 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-3">
        <div className="bg-paper p-5 sm:col-span-2">
          <dt className="flex items-baseline justify-between text-xs uppercase tracking-[0.15em] text-muted-foreground">
            Progress
            <span className="normal-case tracking-normal">
              {done} of {total} task{total === 1 ? '' : 's'}
            </span>
          </dt>
          <dd className="mt-3">
            <span className="font-serif text-5xl leading-none">
              {percent}
              <span className="text-2xl text-muted-foreground">%</span>
            </span>
            <div
              className="mt-4 h-1.5 overflow-hidden rounded-full bg-secondary"
              role="progressbar"
              aria-valuenow={percent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Workspace progress"
            >
              <motion.div className="h-full rounded-full bg-accent" initial={false} animate={{ width: `${percent}%` }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }} />
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              {current ? (
                <>
                  Current milestone: <span className="text-foreground">{current.title}</span>
                </>
              ) : total === 0 ? (
                'Add tasks to start tracking progress.'
              ) : (
                'Calculated from completed tasks.'
              )}
            </p>
          </dd>
        </div>
        <div className="bg-paper p-5">
          <dt className="text-xs uppercase tracking-[0.15em] text-muted-foreground">Deadline</dt>
          {workspace.deadline && days !== null ? (
            <dd className="mt-3">
              <span className={`font-serif text-5xl leading-none ${days < 0 ? 'text-terracotta' : days <= 3 ? 'text-terracotta' : ''}`}>{Math.abs(days)}</span>
              <span className="ml-2 text-sm text-muted-foreground">
                {days < 0 ? `day${days === -1 ? '' : 's'} overdue` : days === 0 ? 'Due today' : `day${days === 1 ? '' : 's'} left`}
              </span>
              <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                <CalendarDays className="size-3.5" aria-hidden="true" />
                {formatDate(workspace.deadline, { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </dd>
          ) : (
            <dd className="mt-3 text-sm leading-relaxed text-muted-foreground">No deadline set. Add one in settings if it helps.</dd>
          )}
        </div>
      </dl>
    </section>
  )
}
