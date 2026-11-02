'use client'

import { useEffect, useState } from 'react'
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

const EASE = [0.22, 1, 0.36, 1] as const

const PRINCIPLES = [
  { n: '01', title: 'Find your direction.', body: 'Write the goal in your own words. ShiftDesk turns it into a space.' },
  { n: '02', title: 'Make progress visible.', body: 'Tasks and milestones roll up into progress you can actually see.' },
  { n: '03', title: 'Find your focus.', body: 'A quiet timer and a clear next step — nothing else competing.' },
]

function Letters({ word, from, delay, className }: { word: string; from: 'up' | 'down'; delay: number; className?: string }) {
  const reduce = useReducedMotion()
  return (
    <span className={className} aria-hidden="true">
      {word.split('').map((ch, i) => (
        <span key={i} className="-mr-[0.08em] inline-block overflow-hidden pr-[0.08em] align-bottom leading-[0.9]">
          <motion.span
            className="inline-block"
            initial={reduce ? { opacity: 0 } : { y: from === 'up' ? '105%' : '-105%' }}
            animate={reduce ? { opacity: 1 } : { y: '0%' }}
            transition={{ duration: reduce ? 0.2 : 0.9, delay: reduce ? 0 : delay + i * 0.07, ease: EASE }}
          >
            {ch}
          </motion.span>
        </span>
      ))}
    </span>
  )
}

export function Intro({ onContinue }: { onContinue: () => void }) {
  const reduce = useReducedMotion()
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), reduce ? 50 : 1900)
    return () => clearTimeout(t)
  }, [reduce])

  return (
    <motion.section
      className="relative flex min-h-dvh flex-col px-6 py-6 md:px-12 md:py-8"
      exit={{ opacity: 0, y: reduce ? 0 : -40 }}
      transition={{ duration: 0.6, ease: EASE }}
      aria-label="ShiftDesk introduction"
    >
      <header className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-muted-foreground">
        <span>Your Work, Your Space</span>
        <button
          type="button"
          onClick={onContinue}
          className="rounded-full px-3 py-1.5 transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-2"
        >
          Skip intro
        </button>
      </header>

      <motion.div layout transition={{ duration: 0.9, ease: EASE }} className={`flex flex-1 flex-col ${revealed ? 'justify-start pt-10 md:pt-14' : 'justify-center'}`}>
        <motion.h1
          layout="position"
          className="font-serif text-[clamp(4.5rem,17vw,15rem)] leading-[0.85] tracking-[-0.02em] text-foreground"
        >
          <span className="sr-only">ShiftDesk</span>
          <Letters word="SHIFT" from="up" delay={0.15} />
          <Letters word="DESK" from="down" delay={0.55} className="italic text-accent" />
        </motion.h1>

        <motion.div
          className="mt-6 h-px origin-left bg-foreground/20"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: reduce ? 0.2 : 1.2, delay: reduce ? 0 : 1, ease: EASE }}
        />

        <AnimatePresence>
          {revealed && (
            <motion.div
              key="content"
              initial="hidden"
              animate="show"
              variants={{ show: { transition: { staggerChildren: reduce ? 0 : 0.12 } } }}
              className="mt-10 grid gap-12 md:mt-14 md:grid-cols-12"
            >
              <div className="md:col-span-7">
                <motion.h2
                  variants={fadeUp(reduce)}
                  className="text-balance font-serif text-4xl leading-[1.05] md:text-6xl"
                >
                  Your goals deserve a space <span className="italic text-terracotta">of their own.</span>
                </motion.h2>
                <motion.p variants={fadeUp(reduce)} className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">
                  Turn your ideas into organized workspaces. Track your progress, manage your milestones, and focus on what matters next.
                </motion.p>
                <motion.div variants={fadeUp(reduce)} className="mt-10">
                  <button
                    type="button"
                    onClick={onContinue}
                    className="group inline-flex items-center gap-3 rounded-full bg-primary px-7 py-4 text-sm font-medium text-primary-foreground shadow-[0_1px_0_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(36,37,34,0.5)] transition-all hover:gap-4 hover:bg-foreground/90 focus-visible:outline-2 focus-visible:outline-offset-2"
                  >
                    {"Let's get to work"}
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                  </button>
                </motion.div>
              </div>

              <ol className="flex flex-col md:col-span-5 md:pt-2">
                {PRINCIPLES.map((p) => (
                  <motion.li key={p.n} variants={fadeUp(reduce)} className="flex gap-5 border-t border-foreground/15 py-5 last:border-b">
                    <span className="pt-1 font-mono text-xs text-muted-foreground">{p.n}</span>
                    <div>
                      <p className="font-serif text-2xl leading-tight">{p.title}</p>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
                    </div>
                  </motion.li>
                ))}
              </ol>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.section>
  )
}

function fadeUp(reduce: boolean | null) {
  return {
    hidden: { opacity: 0, y: reduce ? 0 : 18 },
    show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
  }
}
