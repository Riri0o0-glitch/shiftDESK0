'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, Pencil, Plus, Trash2 } from 'lucide-react'
import type { Task, Workspace, WorkspaceUpdater } from '@/lib/types'
import { uid } from '@/lib/workspace-utils'
import { cn } from '@/lib/utils'
import { IconButton, SectionHeading, fieldCls, isComposing } from '../primitives'

type Filter = 'all' | 'open' | 'done'

export function TasksSection({ workspace, update }: { workspace: Workspace; update: WorkspaceUpdater }) {
  const [draft, setDraft] = useState('')
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<Filter>('all')

  const open = workspace.tasks.filter((t) => !t.done)
  const done = workspace.tasks.filter((t) => t.done)
  const visible = filter === 'open' ? open : filter === 'done' ? done : [...open, ...done]

  function add(e: React.FormEvent) {
    e.preventDefault()
    const title = draft.trim()
    if (!title) return setError('Write a task before adding it.')
    if (title.length > 200) return setError('Keep tasks under 200 characters.')
    update((w) => ({ ...w, tasks: [...w.tasks, { id: uid(), title, done: false, createdAt: Date.now() }] }))
    setDraft('')
    setError('')
  }

  const setTask = (id: string, patch: Partial<Task>) =>
    update((w) => ({ ...w, tasks: w.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)) }))
  const removeTask = (id: string) => update((w) => ({ ...w, tasks: w.tasks.filter((t) => t.id !== id) }))

  return (
    <section id="tasks" aria-labelledby="tasks-heading" className="scroll-mt-28">
      <SectionHeading
        id="tasks-heading"
        index="02"
        title="Tasks"
        aside={
          <div className="flex gap-1 text-xs" role="tablist" aria-label="Filter tasks">
            {(['all', 'open', 'done'] as Filter[]).map((f) => (
              <button
                key={f}
                role="tab"
                aria-selected={filter === f}
                onClick={() => setFilter(f)}
                className={cn('rounded-full px-3 py-1 capitalize transition-colors', filter === f ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary')}
              >
                {f} <span className="opacity-60">{f === 'all' ? workspace.tasks.length : f === 'open' ? open.length : done.length}</span>
              </button>
            ))}
          </div>
        }
      />

      <form onSubmit={add} className="flex gap-2">
        <label htmlFor="new-task" className="sr-only">New task</label>
        <input
          id="new-task"
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value)
            if (error) setError('')
          }}
          onKeyDown={(e) => e.key === 'Enter' && isComposing(e) && e.preventDefault()}
          placeholder="Add a task and press Enter"
          className={cn(fieldCls, 'py-3')}
          aria-invalid={Boolean(error)}
        />
        <button type="submit" className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-primary px-4 text-sm text-primary-foreground transition-opacity hover:opacity-90">
          <Plus className="size-4" aria-hidden="true" /> Add
        </button>
      </form>
      {error && <p role="alert" className="mt-2 text-sm text-destructive">{error}</p>}

      {visible.length === 0 ? (
        <div className="mt-6 rounded-lg border border-dashed border-border px-6 py-10 text-center">
          <p className="font-serif text-2xl">{workspace.tasks.length === 0 ? 'A clean slate.' : filter === 'done' ? 'Nothing completed yet.' : 'Everything is done.'}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {workspace.tasks.length === 0 ? 'Add the first small step toward your goal above.' : 'Switch filters to see the rest of your list.'}
          </p>
        </div>
      ) : (
        <ul className="mt-4 divide-y divide-border border-y border-border">
          <AnimatePresence initial={false}>
            {visible.map((task) => (
              <TaskRow key={task.id} task={task} onToggle={() => setTask(task.id, { done: !task.done, completedAt: task.done ? undefined : Date.now() })} onRename={(title) => setTask(task.id, { title })} onDelete={() => removeTask(task.id)} />
            ))}
          </AnimatePresence>
        </ul>
      )}
    </section>
  )
}

function TaskRow({ task, onToggle, onRename, onDelete }: { task: Task; onToggle: () => void; onRename: (t: string) => void; onDelete: () => void }) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(task.title)

  function save() {
    const v = value.trim()
    if (v) onRename(v)
    else setValue(task.title)
    setEditing(false)
  }

  return (
    <motion.li layout initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 12 }} transition={{ duration: 0.25 }} className="group flex items-center gap-3 py-3">
      <button
        type="button"
        role="checkbox"
        aria-checked={task.done}
        aria-label={task.done ? `Mark "${task.title}" as not done` : `Mark "${task.title}" as done`}
        onClick={onToggle}
        className={cn(
          'flex size-5 shrink-0 items-center justify-center rounded-[5px] border transition-all focus-visible:outline-2 focus-visible:outline-offset-2',
          task.done ? 'border-accent bg-accent text-accent-foreground' : 'border-foreground/30 hover:border-accent',
        )}
      >
        <AnimatePresence>
          {task.done && (
            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
              <Check className="size-3.5" strokeWidth={3} aria-hidden="true" />
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {editing ? (
        <input
          autoFocus
          aria-label="Edit task"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={save}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !isComposing(e)) save()
            if (e.key === 'Escape') {
              setValue(task.title)
              setEditing(false)
            }
          }}
          className={cn(fieldCls, 'py-1.5')}
        />
      ) : (
        <span
          onDoubleClick={() => setEditing(true)}
          className={cn('flex-1 text-[15px] leading-snug transition-colors', task.done && 'text-muted-foreground line-through decoration-foreground/30')}
        >
          {task.title}
        </span>
      )}

      {!editing && (
        <div className="flex shrink-0 gap-0.5 opacity-100 transition-opacity md:opacity-0 md:group-focus-within:opacity-100 md:group-hover:opacity-100">
          <IconButton label="Edit task" onClick={() => setEditing(true)}>
            <Pencil className="size-3.5" />
          </IconButton>
          <IconButton label="Delete task" onClick={onDelete} className="hover:text-destructive">
            <Trash2 className="size-3.5" />
          </IconButton>
        </div>
      )}
    </motion.li>
  )
}
