'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, Pencil, Plus, Trash2 } from 'lucide-react'
import type { Milestone, MilestoneStatus, Workspace, WorkspaceUpdater } from '@/lib/types'
import { formatDate, uid } from '@/lib/workspace-utils'
import { cn } from '@/lib/utils'
import { IconButton, SectionHeading, fieldCls } from '../primitives'

const STATUS_LABEL: Record<MilestoneStatus, string> = { upcoming: 'Upcoming', 'in-progress': 'In progress', completed: 'Completed' }

export function MilestonesSection({ workspace, update }: { workspace: Workspace; update: WorkspaceUpdater }) {
  const [adding, setAdding] = useState(false)

  const save = (m: Milestone) =>
    update((w) => {
      const exists = w.milestones.some((x) => x.id === m.id)
      return { ...w, milestones: exists ? w.milestones.map((x) => (x.id === m.id ? m : x)) : [...w.milestones, m] }
    })
  const remove = (id: string) => update((w) => ({ ...w, milestones: w.milestones.filter((m) => m.id !== id) }))

  const sorted = [...workspace.milestones].sort((a, b) => (a.date ?? '9999').localeCompare(b.date ?? '9999'))

  return (
    <section id="milestones" aria-labelledby="milestones-heading" className="scroll-mt-28">
      <SectionHeading
        id="milestones-heading"
        index="03"
        title="Milestones"
        aside={
          !adding && (
            <button type="button" onClick={() => setAdding(true)} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
              <Plus className="size-3.5" aria-hidden="true" /> Add milestone
            </button>
          )
        }
      />

      {adding && (
        <div className="mb-6">
          <MilestoneForm
            onCancel={() => setAdding(false)}
            onSave={(m) => {
              save(m)
              setAdding(false)
            }}
          />
        </div>
      )}

      {sorted.length === 0 && !adding ? (
        <div className="rounded-lg border border-dashed border-border px-6 py-10 text-center">
          <p className="font-serif text-2xl">No milestones yet.</p>
          <p className="mt-1 text-sm text-muted-foreground">Milestones mark the bigger checkpoints between today and done.</p>
        </div>
      ) : (
        <ol className="relative">
          <AnimatePresence initial={false}>
            {sorted.map((m, i) => (
              <MilestoneRow key={m.id} milestone={m} last={i === sorted.length - 1} onSave={save} onDelete={() => remove(m.id)} />
            ))}
          </AnimatePresence>
        </ol>
      )}
    </section>
  )
}

function MilestoneRow({ milestone, last, onSave, onDelete }: { milestone: Milestone; last: boolean; onSave: (m: Milestone) => void; onDelete: () => void }) {
  const [editing, setEditing] = useState(false)
  const { status } = milestone

  return (
    <motion.li layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="group relative flex gap-5 pb-8 last:pb-0">
      {!last && <span aria-hidden="true" className={cn('absolute left-[9px] top-6 bottom-0 w-px', status === 'completed' ? 'bg-accent/50' : 'bg-border')} />}
      <span
        aria-hidden="true"
        className={cn(
          'relative mt-1 flex size-[19px] shrink-0 items-center justify-center rounded-full border-2',
          status === 'completed' && 'border-accent bg-accent text-accent-foreground',
          status === 'in-progress' && 'border-terracotta bg-paper',
          status === 'upcoming' && 'border-foreground/25 bg-paper',
        )}
      >
        {status === 'completed' && <Check className="size-3" strokeWidth={3} />}
        {status === 'in-progress' && <span className="size-2 animate-pulse rounded-full bg-terracotta" />}
      </span>

      <div className="min-w-0 flex-1">
        {editing ? (
          <MilestoneForm
            initial={milestone}
            onCancel={() => setEditing(false)}
            onSave={(m) => {
              onSave(m)
              setEditing(false)
            }}
          />
        ) : (
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className={cn('font-serif text-xl leading-snug', status === 'completed' && 'text-muted-foreground')}>{milestone.title}</p>
              <p className="mt-1 flex flex-wrap items-center gap-x-3 text-xs text-muted-foreground">
                <span className={cn(status === 'in-progress' && 'text-terracotta', status === 'completed' && 'text-accent')}>{STATUS_LABEL[status]}</span>
                {milestone.date && <span>{formatDate(milestone.date)}</span>}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-0.5">
              <label className="sr-only" htmlFor={`ms-status-${milestone.id}`}>Status</label>
              <select
                id={`ms-status-${milestone.id}`}
                value={status}
                onChange={(e) => onSave({ ...milestone, status: e.target.value as MilestoneStatus })}
                className="rounded-md border border-transparent bg-transparent px-1.5 py-1 text-xs text-muted-foreground transition-colors hover:border-border focus:border-accent focus:outline-none"
              >
                {Object.entries(STATUS_LABEL).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
              <IconButton label="Edit milestone" onClick={() => setEditing(true)}>
                <Pencil className="size-3.5" />
              </IconButton>
              <IconButton label="Delete milestone" onClick={onDelete} className="hover:text-destructive">
                <Trash2 className="size-3.5" />
              </IconButton>
            </div>
          </div>
        )}
      </div>
    </motion.li>
  )
}

function MilestoneForm({ initial, onSave, onCancel }: { initial?: Milestone; onSave: (m: Milestone) => void; onCancel: () => void }) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [date, setDate] = useState(initial?.date ?? '')
  const [status, setStatus] = useState<MilestoneStatus>(initial?.status ?? 'upcoming')
  const [error, setError] = useState('')

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (!title.trim()) return setError('Give the milestone a name.')
        onSave({ id: initial?.id ?? uid(), title: title.trim(), date: date || undefined, status })
      }}
      className="grid gap-3 rounded-lg border border-border bg-paper p-4 sm:grid-cols-[1fr_auto_auto]"
    >
      <div className="sm:col-span-3">
        <label htmlFor="ms-title" className="sr-only">Milestone name</label>
        <input id="ms-title" autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Milestone name" className={fieldCls} aria-invalid={Boolean(error)} />
        {error && <p role="alert" className="mt-1.5 text-sm text-destructive">{error}</p>}
      </div>
      <label className="sr-only" htmlFor="ms-date">Target date</label>
      <input id="ms-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className={fieldCls} />
      <label className="sr-only" htmlFor="ms-status">Status</label>
      <select id="ms-status" value={status} onChange={(e) => setStatus(e.target.value as MilestoneStatus)} className={fieldCls}>
        {Object.entries(STATUS_LABEL).map(([v, l]) => (
          <option key={v} value={v}>{l}</option>
        ))}
      </select>
      <div className="flex gap-2 sm:col-span-3 sm:justify-end">
        <button type="button" onClick={onCancel} className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-secondary">Cancel</button>
        <button type="submit" className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:opacity-90">Save milestone</button>
      </div>
    </form>
  )
}
