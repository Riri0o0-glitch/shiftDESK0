'use client'

import { useEffect } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

const EASE = [0.22, 1, 0.36, 1] as const

export function DeskTransition({ name, onDone }: { name: string; onDone: () => void }) {
  const reduce = useReducedMotion()

  useEffect(() => {
    const t = setTimeout(onDone, reduce ? 300 : 1900)
    return () => clearTimeout(t)
  }, [onDone, reduce])

  return (
    <motion.section
      className="relative flex min-h-dvh items-center justify-center overflow-hidden px-6"
      exit={{ opacity: 0, transition: { duration: 0.5 } }}
      aria-live="polite"
    >
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          aria-hidden="true"
          className="absolute inset-y-0 w-1/3 border-r border-border bg-paper"
          style={{ left: `${i * 33.333}%` }}
          initial={{ y: reduce ? 0 : '100%' }}
          animate={{ y: reduce ? 0 : ['100%', '0%', '0%', '-100%'] }}
          transition={{ duration: 1.9, times: [0, 0.3, 0.75, 1], delay: i * 0.06, ease: EASE }}
        />
      ))}
      <motion.div
        className="relative text-center"
        initial={{ opacity: 0, y: reduce ? 0 : 12 }}
        animate={{ opacity: [0, 1, 1, 0], y: reduce ? 0 : [12, 0, 0, -12] }}
        transition={{ duration: 1.7, times: [0, 0.3, 0.75, 1], delay: 0.15, ease: EASE }}
      >
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Clearing a space for</p>
        <p className="mt-3 text-balance font-serif text-4xl italic md:text-6xl">{name}</p>
      </motion.div>
    </motion.section>
  )
}
