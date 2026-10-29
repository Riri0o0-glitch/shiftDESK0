'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Workspace } from '@/lib/types'
import { suggestNext, summarize } from '@/lib/companion'
import { cn } from '@/lib/utils'

export function DeskCompanion({ workspace }: { workspace: Workspace }) {
  const [view, setView] = useState<'next' | 'summary'>('next')
  const lines = view === 'next' ? suggestNext(workspace) : summarize(workspace)

  return (
    <section aria-labelledby="companion-heading" className="rounded-lg border border-border bg-paper p-5">
      <div className="flex items-center justify-between">
        <h2 id="companion-heading" className="text-sm font-medium">Desk companion</h2>
        <span className="text-[11px] text-muted-foreground">Rule-based · no AI</span>
      </div>
      <div className="mt-3 flex gap-1 text-xs" role="tablist" aria-label="Companion view">
        {(
          [
            ['next', 'Suggest next step'],
            ['summary', 'Summarize'],
          ] as const
        ).map(([k, l]) => (
          <button
            key={k}
            role="tab"
            aria-selected={view === k}
            onClick={() => setView(k)}
            className={cn('rounded-full border px-3 py-1 transition-colors', view === k ? 'border-foreground/80 text-foreground' : 'border-border text-muted-foreground hover:text-foreground')}
          >
            {l}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.ul key={view} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="mt-4 space-y-3">
          {lines.map((l, i) => (
            <li key={i} className="border-l-2 border-accent/40 pl-3">
              <p className="text-sm leading-snug">{l.title}</p>
              {l.detail && <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{l.detail}</p>}
            </li>
          ))}
        </motion.ul>
      </AnimatePresence>
    </section>
  )
}
