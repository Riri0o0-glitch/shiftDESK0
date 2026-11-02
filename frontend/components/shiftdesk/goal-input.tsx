'use client'

import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, ArrowLeft } from 'lucide-react'
import type { WorkspaceType } from '@/lib/types'
import { TYPE_LABEL, todayISO } from '@/lib/workspace-utils'
import { cn } from '@/lib/utils'

export interface GoalFormValues {
  goal: string
  name: string
  description: string
  type: WorkspaceType
  deadline?: string
  withStarter: boolean
}

const EASE = [0.22, 1, 0.36, 1] as const

export function GoalInput({
  onCreate,
  onSample,
  onReturn,
  hasWorkspaces,
}: {
  onCreate: (v: GoalFormValues) => void
  onSample: () => void
  onReturn?: () => void
  hasWorkspaces: boolean
}) {
  const reduce = useReducedMotion()
  const [goal, setGoal] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<WorkspaceType>('project')
  const [deadline, setDeadline] = useState('')
  const [withStarter, setWithStarter] = useState(true)
  const [errors, setErrors] = useState<{ goal?: string; deadline?: string }>({})

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const next: typeof errors = {}
    if (goal.trim().length < 3) next.goal = 'Describe your goal in a few words to continue.'
    if (deadline && deadline < todayISO()) next.deadline = 'Choose today or a future date.'
    setErrors(next)
    if (Object.keys(next).length) return
    onCreate({ goal, name, description, type, deadline: deadline || undefined, withStarter })
  }

  const item = {
    hidden: { opacity: 0, y: reduce ? 0 : 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
  }

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: reduce ? 0 : -24, transition: { duration: 0.5, ease: EASE } }}
      className="min-h-dvh px-6 py-6 md:px-12 md:py-8"
      aria-labelledby="goal-heading"
    >
      <header className="flex items-center justify-between">
        <span className="font-serif text-2xl tracking-tight">
          Shift<span className="italic text-accent">Desk</span>
        </span>
        {hasWorkspaces && onReturn && (
          <button type="button" onClick={onReturn} className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to my desk
          </button>
        )}
      </header>

      <motion.form
        onSubmit={submit}
        noValidate
        initial="hidden"
        animate="show"
        variants={{ show: { transition: { staggerChildren: reduce ? 0 : 0.08, delayChildren: 0.1 } } }}
        className="mx-auto mt-12 max-w-4xl md:mt-20"
      >
        <motion.p variants={item} className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          New workspace
        </motion.p>
        <motion.h2 id="goal-heading" variants={item} className="mt-3 font-serif text-5xl leading-none md:text-7xl">
          What are we <span className="italic">working on?</span>
        </motion.h2>

        <motion.div variants={item} className="mt-10">
          <label htmlFor="goal" className="sr-only">Your goal</label>
          <textarea
            id="goal"
            autoFocus
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            rows={4}
            placeholder="Tell us what you want to accomplish..."
            aria-invalid={Boolean(errors.goal)}
            aria-describedby={errors.goal ? 'goal-error' : undefined}
            className="w-full resize-none rounded-lg border border-border bg-paper px-6 py-5 font-serif text-2xl leading-snug shadow-[0_1px_2px_rgba(36,37,34,0.04),0_12px_32px_-20px_rgba(36,37,34,0.25)] outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-accent md:text-3xl"
          />
          {errors.goal && <p id="goal-error" role="alert" className="mt-2 text-sm text-destructive">{errors.goal}</p>}
        </motion.div>

        <motion.div variants={item} className="mt-10 grid gap-x-8 gap-y-6 border-t border-border pt-8 md:grid-cols-2">
          <Field label="Workspace name" hint="Optional" htmlFor="ws-name">
            <input id="ws-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Final year project" className={inputCls} />
          </Field>
          <Field label="Target deadline" hint="Optional" htmlFor="ws-deadline">
            <input
              id="ws-deadline"
              type="date"
              min={todayISO()}
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              aria-invalid={Boolean(errors.deadline)}
              className={inputCls}
            />
            {errors.deadline && <p role="alert" className="mt-1.5 text-sm text-destructive">{errors.deadline}</p>}
          </Field>
          <Field label="Description" hint="Optional" htmlFor="ws-desc" className="md:col-span-2">
            <input id="ws-desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="A sentence of context for future you" className={inputCls} />
          </Field>
          <fieldset className="md:col-span-2">
            <legend className="mb-2 text-sm font-medium">Workspace type</legend>
            <div className="inline-flex rounded-full border border-border bg-paper p-1" role="radiogroup">
              {(Object.keys(TYPE_LABEL) as WorkspaceType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  role="radio"
                  aria-checked={type === t}
                  onClick={() => setType(t)}
                  className={cn(
                    'rounded-full px-5 py-2 text-sm transition-colors',
                    type === t ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {TYPE_LABEL[t]}
                </button>
              ))}
            </div>
          </fieldset>
          <label className="flex cursor-pointer items-start gap-3 text-sm md:col-span-2">
            <input type="checkbox" checked={withStarter} onChange={(e) => setWithStarter(e.target.checked)} className="mt-0.5 size-4 accent-[#747c61]" />
            <span>
              Start with a simple structure
              <span className="block text-muted-foreground">Three starter tasks and milestones for this type of work — edit or remove them anytime.</span>
            </span>
          </label>
        </motion.div>

        <motion.div variants={item} className="mt-12 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <button
            type="submit"
            className="group inline-flex items-center gap-3 rounded-full bg-primary px-7 py-4 text-sm font-medium text-primary-foreground shadow-[0_8px_24px_-12px_rgba(36,37,34,0.5)] transition-all hover:gap-4 focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            Create my workspace
            <ArrowRight className="size-4" aria-hidden="true" />
          </button>
          <button type="button" onClick={onSample} className="rounded-full px-5 py-4 text-sm text-foreground underline decoration-foreground/30 underline-offset-4 transition-colors hover:decoration-foreground">
            Explore sample workspace
          </button>
        </motion.div>
      </motion.form>
    </motion.section>
  )
}

const inputCls =
  'w-full rounded-md border border-border bg-paper px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-accent aria-[invalid=true]:border-destructive'

function Field({ label, hint, htmlFor, className, children }: { label: string; hint?: string; htmlFor: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-2 flex items-baseline justify-between text-sm font-medium">
        {label}
        {hint && <span className="text-xs font-normal text-muted-foreground">{hint}</span>}
      </label>
      {children}
    </div>
  )
}
