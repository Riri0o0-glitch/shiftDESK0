'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, ChevronDown, Plus, Settings2, Target } from 'lucide-react'
import type { Workspace } from '@/lib/types'
import { progressOf } from '@/lib/workspace-utils'
import { isBackendConfigured } from '@/lib/api-config'
import { IconButton } from '../primitives'
import { cn } from '@/lib/utils'

export function WorkspaceHeader({
  workspace,
  workspaces,
  onSelect,
  onNew,
  onFocus,
  onSettings,
}: {
  workspace: Workspace
  workspaces: Workspace[]
  onSelect: (id: string) => void
  onNew: () => void
  onFocus: () => void
  onSettings: () => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false)
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-3 px-4 md:px-8">
        <span className="hidden font-serif text-2xl tracking-tight sm:inline">
          Shift<span className="italic text-accent">Desk</span>
        </span>
        <span className="hidden h-5 w-px bg-border sm:inline-block" aria-hidden="true" />

        <div ref={ref} className="relative min-w-0">
          <button
            type="button"
            aria-haspopup="listbox"
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
            className="flex min-w-0 max-w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-secondary"
          >
            <span className="truncate font-medium">{workspace.name}</span>
            <ChevronDown className={cn('size-4 shrink-0 text-muted-foreground transition-transform', open && 'rotate-180')} aria-hidden="true" />
          </button>
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="absolute left-0 top-full mt-2 w-72 rounded-lg border border-border bg-paper p-1.5 shadow-[0_16px_40px_-16px_rgba(36,37,34,0.35)]"
              >
                <p className="px-2.5 pb-1 pt-1.5 text-[11px] uppercase tracking-[0.15em] text-muted-foreground">Workspaces</p>
                <ul role="listbox" aria-label="Switch workspace">
                  {workspaces.map((w) => {
                    const p = progressOf(w)
                    return (
                      <li key={w.id}>
                        <button
                          type="button"
                          role="option"
                          aria-selected={w.id === workspace.id}
                          onClick={() => {
                            onSelect(w.id)
                            setOpen(false)
                          }}
                          className="flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-left text-sm transition-colors hover:bg-secondary"
                        >
                          <span className="min-w-0 flex-1">
                            <span className="block truncate">{w.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {p.percent}% · {p.total} task{p.total === 1 ? '' : 's'}
                              {w.isSample ? ' · Sample' : ''}
                            </span>
                          </span>
                          {w.id === workspace.id && <Check className="size-4 text-accent" aria-hidden="true" />}
                        </button>
                      </li>
                    )
                  })}
                </ul>
                <div className="mt-1 border-t border-border pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false)
                      onNew()
                    }}
                    className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-sm transition-colors hover:bg-secondary"
                  >
                    <Plus className="size-4" aria-hidden="true" /> New workspace
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-1.5">
          <span className="hidden items-center gap-1.5 text-xs text-muted-foreground md:inline-flex" title={isBackendConfigured ? 'Backend URL configured' : 'Data is stored in localStorage on this device'}>
            <span className="size-1.5 rounded-full bg-accent" aria-hidden="true" />
            Saved in this browser
          </span>
          <button
            type="button"
            onClick={onFocus}
            className="inline-flex items-center gap-2 rounded-full border border-foreground/80 px-3 py-1.5 text-sm sm:ml-2 sm:px-4 transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            <Target className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">Focus mode</span>
            <span className="sm:hidden">Focus</span>
          </button>
          <IconButton label="Workspace settings" onClick={onSettings} className="size-9">
            <Settings2 className="size-4" />
          </IconButton>
        </div>
      </div>
    </header>
  )
}
