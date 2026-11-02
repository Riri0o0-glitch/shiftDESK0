'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

export type TimerMode = 'focus' | 'break'
export type TimerStatus = 'idle' | 'running' | 'paused' | 'finished'

export const DURATIONS: Record<TimerMode, number> = { focus: 25 * 60, break: 5 * 60 }

export function useFocusTimer() {
  const [mode, setMode] = useState<TimerMode>('focus')
  const [remaining, setRemaining] = useState(DURATIONS.focus)
  const [status, setStatus] = useState<TimerStatus>('idle')
  const [sessions, setSessions] = useState(0)
  const endAt = useRef<number | null>(null)

  useEffect(() => {
    if (status !== 'running') return
    const id = setInterval(() => {
      if (endAt.current === null) return
      const left = Math.max(0, Math.ceil((endAt.current - Date.now()) / 1000))
      setRemaining(left)
      if (left === 0) {
        endAt.current = null
        setStatus('finished')
        if (mode === 'focus') setSessions((n) => n + 1)
      }
    }, 250)
    return () => clearInterval(id)
  }, [status, mode])

  const run = useCallback((seconds: number) => {
    endAt.current = Date.now() + seconds * 1000
    setRemaining(seconds)
    setStatus('running')
  }, [])

  const start = useCallback(() => run(status === 'finished' ? DURATIONS[mode] : remaining), [run, status, mode, remaining])

  const pause = useCallback(() => {
    if (endAt.current !== null) setRemaining(Math.max(0, Math.ceil((endAt.current - Date.now()) / 1000)))
    endAt.current = null
    setStatus('paused')
  }, [])

  const reset = useCallback(() => {
    endAt.current = null
    setStatus('idle')
    setRemaining(DURATIONS[mode])
  }, [mode])

  const switchMode = useCallback((next: TimerMode) => {
    endAt.current = null
    setMode(next)
    setStatus('idle')
    setRemaining(DURATIONS[next])
  }, [])

  const startBreak = useCallback(() => {
    setMode('break')
    run(DURATIONS.break)
  }, [run])

  return { mode, remaining, status, sessions, total: DURATIONS[mode], start, pause, reset, switchMode, startBreak }
}

export type FocusTimer = ReturnType<typeof useFocusTimer>

export const formatClock = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
