'use client'

import { Coffee, Pause, Play, RotateCcw } from 'lucide-react'
import { type FocusTimer as Timer, formatClock } from '@/lib/use-focus-timer'
import { cn } from '@/lib/utils'

export function FocusTimer({ timer, size = 'compact' }: { timer: Timer; size?: 'compact' | 'large' }) {
  const { mode, remaining, status, total, sessions } = timer
  const fraction = 1 - remaining / total
  const large = size === 'large'
  const r = large ? 140 : 52
  const stroke = large ? 3 : 2.5
  const c = 2 * Math.PI * r
  const box = (r + stroke) * 2

  return (
    <div className={cn('flex flex-col items-center', large ? 'gap-10' : 'gap-5')}>
      <div className="inline-flex rounded-full border border-border bg-background p-0.5 text-xs" role="radiogroup" aria-label="Timer mode">
        {(['focus', 'break'] as const).map((m) => (
          <button
            key={m}
            type="button"
            role="radio"
            aria-checked={mode === m}
            onClick={() => timer.switchMode(m)}
            className={cn('rounded-full px-3 py-1 transition-colors', mode === m ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground')}
          >
            {m === 'focus' ? 'Focus · 25' : 'Break · 5'}
          </button>
        ))}
      </div>

      <div className="relative" style={{ width: box, height: box }}>
        <svg width={box} height={box} className="-rotate-90" aria-hidden="true">
          <circle cx={box / 2} cy={box / 2} r={r} fill="none" stroke="var(--border)" strokeWidth={stroke} />
          <circle
            cx={box / 2}
            cy={box / 2}
            r={r}
            fill="none"
            stroke={mode === 'focus' ? 'var(--accent)' : 'var(--terracotta)'}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={c * (1 - fraction)}
            className="transition-[stroke-dashoffset] duration-300 ease-linear"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn('font-serif tabular-nums leading-none', large ? 'text-8xl' : 'text-4xl')} role="timer" aria-live="off">
            {formatClock(remaining)}
          </span>
          <span className={cn('mt-1 text-muted-foreground', large ? 'text-sm' : 'text-[11px]')}>
            {status === 'finished' ? (mode === 'focus' ? 'Session complete' : 'Break over') : status === 'paused' ? 'Paused' : mode === 'focus' ? 'Focus' : 'Break'}
          </span>
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {status === 'finished' ? (mode === 'focus' ? 'Focus session complete.' : 'Break finished.') : ''}
      </p>

      <div className="flex items-center gap-2">
        {status === 'running' ? (
          <TimerBtn primary onClick={timer.pause} icon={<Pause className="size-4" />}>Pause</TimerBtn>
        ) : (
          <TimerBtn primary onClick={timer.start} icon={<Play className="size-4" />}>
            {status === 'paused' ? 'Resume' : status === 'finished' ? 'Again' : 'Start'}
          </TimerBtn>
        )}
        <TimerBtn onClick={timer.reset} icon={<RotateCcw className="size-4" />} label="Reset timer" />
        {mode === 'focus' && <TimerBtn onClick={timer.startBreak} icon={<Coffee className="size-4" />} label="Start a 5-minute break" />}
      </div>
      {sessions > 0 && (
        <p className="text-xs text-muted-foreground">
          {sessions} focus session{sessions === 1 ? '' : 's'} completed today
        </p>
      )}
    </div>
  )
}

function TimerBtn({ onClick, icon, children, label, primary }: { onClick: () => void; icon: React.ReactNode; children?: React.ReactNode; label?: string; primary?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex h-9 items-center justify-center gap-1.5 rounded-full text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2',
        primary ? 'bg-primary px-5 text-primary-foreground hover:opacity-90' : 'w-9 border border-border text-muted-foreground hover:bg-secondary hover:text-foreground',
      )}
    >
      <span aria-hidden="true">{icon}</span>
      {children}
    </button>
  )
}
