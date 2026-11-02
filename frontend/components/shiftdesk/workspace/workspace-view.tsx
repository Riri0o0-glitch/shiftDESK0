'use client'

import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { CheckSquare, FileText, Flag, LayoutGrid } from 'lucide-react'
import type { Workspace, WorkspaceUpdater } from '@/lib/types'
import { useFocusTimer } from '@/lib/use-focus-timer'
import { progressOf } from '@/lib/workspace-utils'
import { cn } from '@/lib/utils'
import { WorkspaceHeader } from './workspace-header'
import { OverviewSection } from './overview-section'
import { TasksSection } from './tasks-section'
import { MilestonesSection } from './milestones-section'
import { FocusTimer } from './focus-timer'
import { DeskCompanion } from './desk-companion'
import { NotesPanel } from './notes-panel'
import { DocumentsPanel } from './documents-panel'
import { SettingsDialog } from './settings-dialog'
import { FocusMode } from './focus-mode'
import { SectionHeading } from '../primitives'

const NAV = [
  { id: 'overview', label: 'Overview', icon: LayoutGrid },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
  { id: 'milestones', label: 'Milestones', icon: Flag },
  { id: 'notes', label: 'Notes & Documents', icon: FileText },
]

const EASE = [0.22, 1, 0.36, 1] as const

export function WorkspaceView({
  workspace,
  workspaces,
  update,
  onSelect,
  onNew,
  onDelete,
}: {
  workspace: Workspace
  workspaces: Workspace[]
  update: WorkspaceUpdater
  onSelect: (id: string) => void
  onNew: () => void
  onDelete: (id: string) => void
}) {
  const reduce = useReducedMotion()
  const timer = useFocusTimer()
  const [focus, setFocus] = useState(false)
  const [settings, setSettings] = useState(false)
  const active = useActiveSection(workspace.id)
  const { percent } = progressOf(workspace)

  const slide = (x: number, y: number, delay: number) => ({
    initial: { opacity: 0, x: reduce ? 0 : x, y: reduce ? 0 : y },
    animate: { opacity: 1, x: 0, y: 0 },
    transition: { duration: 0.8, delay: reduce ? 0 : delay, ease: EASE },
  })

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-dvh">
      <WorkspaceHeader workspace={workspace} workspaces={workspaces} onSelect={onSelect} onNew={onNew} onFocus={() => setFocus(true)} onSettings={() => setSettings(true)} />

      <nav aria-label="Workspace sections" className="sticky top-16 z-20 border-b border-border bg-background/90 backdrop-blur-sm lg:hidden">
        <ul className="flex gap-1 overflow-x-auto px-4 py-2">
          {NAV.map((n) => (
            <li key={n.id}>
              <a href={`#${n.id}`} aria-current={active === n.id ? 'location' : undefined} className={cn('block whitespace-nowrap rounded-full px-3 py-1.5 text-sm transition-colors', active === n.id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary')}>
                {n.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div key={workspace.id} className="mx-auto flex max-w-[1440px] gap-10 px-4 md:px-8">
        <motion.aside {...slide(-24, 0, 0.1)} className="sticky top-16 hidden h-[calc(100dvh-4rem)] w-52 shrink-0 flex-col py-10 lg:flex">
          <nav aria-label="Workspace sections">
            <ul className="space-y-0.5">
              {NAV.map((n) => (
                <li key={n.id}>
                  <a
                    href={`#${n.id}`}
                    aria-current={active === n.id ? 'location' : undefined}
                    className={cn('relative flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors', active === n.id ? 'text-foreground' : 'text-muted-foreground hover:text-foreground')}
                  >
                    {active === n.id && <motion.span layoutId="nav-indicator" className="absolute inset-0 rounded-md bg-secondary" transition={{ duration: 0.3, ease: EASE }} />}
                    <n.icon className="relative size-4" aria-hidden="true" />
                    <span className="relative">{n.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="mt-auto border-t border-border pt-5">
            <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground">Progress</p>
            <p className="mt-1 font-serif text-3xl">{percent}%</p>
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-secondary" aria-hidden="true">
              <motion.div className="h-full bg-accent" initial={false} animate={{ width: `${percent}%` }} />
            </div>
          </div>
        </motion.aside>

        <main className="min-w-0 flex-1 py-10 lg:border-l lg:border-border lg:pl-10">
          <motion.div {...slide(0, 32, 0.2)}>
            <OverviewSection workspace={workspace} />
          </motion.div>

          <motion.div {...slide(0, 32, 0.35)} className="mt-14 grid gap-14 xl:grid-cols-[minmax(0,1fr)_300px] xl:gap-10">
            <div className="min-w-0 space-y-16">
              <TasksSection workspace={workspace} update={update} />
              <MilestonesSection workspace={workspace} update={update} />
              <section id="notes" aria-labelledby="notes-heading" className="scroll-mt-28">
                <SectionHeading id="notes-heading" index="04" title="Notes & Documents" />
                <div className="grid gap-10 md:grid-cols-2">
                  <NotesPanel workspace={workspace} update={update} />
                  <DocumentsPanel workspace={workspace} update={update} />
                </div>
              </section>
            </div>

            <aside className="space-y-6 xl:sticky xl:top-24 xl:self-start" aria-label="Focus tools">
              <section aria-labelledby="timer-heading" className="rounded-lg border border-border bg-paper p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h2 id="timer-heading" className="text-sm font-medium">Focus timer</h2>
                  <button type="button" onClick={() => setFocus(true)} className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
                    Full screen
                  </button>
                </div>
                <FocusTimer timer={timer} />
              </section>
              <DeskCompanion workspace={workspace} />
            </aside>
          </motion.div>

          <footer className="mt-20 border-t border-border pt-6 text-xs text-muted-foreground">
            ShiftDesk — Your Work, Your Space.{workspace.isSample && ' This is a demonstration workspace; changes are saved in this browser.'}
          </footer>
        </main>
      </div>

      <SettingsDialog
        open={settings}
        onClose={() => setSettings(false)}
        workspace={workspace}
        update={update}
        onDelete={() => {
          setSettings(false)
          onDelete(workspace.id)
        }}
      />
      <FocusMode open={focus} onClose={() => setFocus(false)} timer={timer} workspace={workspace} update={update} />
    </motion.div>
  )
}

function useActiveSection(resetKey: string) {
  const [active, setActive] = useState('overview')
  useEffect(() => {
    const els = NAV.map((n) => document.getElementById(n.id)).filter(Boolean) as HTMLElement[]
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActive(visible[0].target.id)
      },
      { rootMargin: '-20% 0px -60% 0px' },
    )
    els.forEach((el) => obs.observe(el))
    return () => obs.disconnect()
  }, [resetKey])
  return active
}
