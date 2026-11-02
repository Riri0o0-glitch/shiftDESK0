'use client'

import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, X } from 'lucide-react'
import type { Workspace, WorkspaceUpdater } from '@/lib/types'
import type { FocusTimer as Timer } from '@/lib/use-focus-timer'
import { FocusTimer } from './focus-timer'

export function FocusMode({ open, onClose, timer, workspace, update }: { open: boolean; onClose: () => void; timer: Timer; workspace: Workspace; update: WorkspaceUpdater }) {
  const next = workspace.tasks.find((t) => !t.done)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Focus mode"
          className="fixed inset-0 z-50 flex flex-col bg-background"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center justify-between px-6 py-5 md:px-10">
            <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Focus mode · {workspace.name}</span>
            <button type="button" onClick={onClose} autoFocus className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground">
              <X className="size-4" aria-hidden="true" /> Exit
            </button>
          </div>
          <motion.div
            className="flex flex-1 flex-col items-center justify-center gap-12 px-6 pb-16"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="max-w-2xl text-center">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Working on</p>
              <p className="mt-3 text-balance font-serif text-4xl leading-tight md:text-5xl">{next ? next.title : 'Every task is done.'}</p>
              {next && (
                <button
                  type="button"
                  onClick={() => update((w) => ({ ...w, tasks: w.tasks.map((t) => (t.id === next.id ? { ...t, done: true, completedAt: Date.now() } : t)) }))}
                  className="mt-5 inline-flex items-center gap-2 rounded-full border border-border px-4 py-1.5 text-sm text-muted-foreground transition-colors hover:border-accent hover:text-accent"
                >
                  <Check className="size-4" aria-hidden="true" /> Mark done
                </button>
              )}
            </div>
            <FocusTimer timer={timer} size="large" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
