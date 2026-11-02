'use client'

import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

export function SectionHeading({ id, index, title, aside }: { id: string; index: string; title: string; aside?: React.ReactNode }) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4 border-b border-border pb-3">
      <h2 id={id} className="flex items-baseline gap-3 font-serif text-3xl leading-none">
        <span className="font-mono text-xs text-muted-foreground">{index}</span>
        {title}
      </h2>
      {aside}
    </div>
  )
}

export const fieldCls =
  'w-full rounded-md border border-border bg-paper px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-accent'

export function isComposing(e: React.KeyboardEvent) {
  return e.nativeEvent.isComposing || e.keyCode === 229
}

export function IconButton({ label, className, children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-2 disabled:pointer-events-none disabled:opacity-40',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export function Pill({ tone = 'muted', children }: { tone?: 'olive' | 'terracotta' | 'muted'; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs',
        tone === 'olive' && 'border-accent/30 bg-accent/10 text-accent',
        tone === 'terracotta' && 'border-terracotta/30 bg-terracotta/10 text-terracotta',
        tone === 'muted' && 'border-border bg-secondary/60 text-muted-foreground',
      )}
    >
      {children}
    </span>
  )
}

export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  const panel = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    panel.current?.querySelector<HTMLElement>('input, button, textarea, select')?.focus()
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <button type="button" aria-label="Close" className="absolute inset-0 bg-foreground/30" onClick={onClose} />
          <motion.div
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-t-xl border border-border bg-paper p-6 shadow-2xl sm:rounded-xl"
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-serif text-3xl">{title}</h2>
              <IconButton label="Close dialog" onClick={onClose}>
                <X className="size-4" />
              </IconButton>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
