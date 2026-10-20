'use client'

import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import type { EstadoLlave } from '@/lib/llavetrack'

const ESTADO_ESTILOS: Record<EstadoLlave, { label: string; className: string; dot: string }> = {
  DISPONIBLE: {
    label: 'Disponible',
    className: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
    dot: 'bg-emerald-400',
  },
  RESERVADA: {
    label: 'Reservada',
    className: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
    dot: 'bg-amber-400',
  },
  PRESTADA: {
    label: 'Ocupada',
    className: 'border-rose-500/30 bg-rose-500/10 text-rose-400',
    dot: 'bg-rose-400',
  },
}

export function EstadoBadge({ estado, className }: { estado: EstadoLlave; className?: string }) {
  const s = ESTADO_ESTILOS[estado]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider',
        s.className,
        className,
      )}
    >
      <span className={cn('size-1.5 rounded-full', s.dot)} aria-hidden="true" />
      {s.label}
    </span>
  )
}

export function PulseDot({ online, className }: { online: boolean; className?: string }) {
  return (
    <span className={cn('relative flex size-2', className)} aria-hidden="true">
      {online && <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60" />}
      <span className={cn('relative inline-flex size-2 rounded-full', online ? 'bg-emerald-400' : 'bg-rose-500')} />
    </span>
  )
}

export function Segmented<T extends string>({
  value,
  onChange,
  options,
  label,
  size = 'md',
}: {
  value: T
  onChange: (v: T) => void
  options: { value: T; label: ReactNode }[]
  label: string
  size?: 'sm' | 'md'
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="inline-flex items-center gap-0.5 rounded-lg border border-zinc-800 bg-zinc-950 p-0.5"
    >
      {options.map((o) => {
        const active = o.value === value
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={cn(
              'inline-flex items-center gap-1.5 whitespace-nowrap rounded-md font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-zinc-400',
              size === 'sm' ? 'px-2.5 py-1 text-[11px]' : 'px-3 py-1.5 text-xs',
              active ? 'bg-zinc-800 text-zinc-50 shadow-sm' : 'text-zinc-400 hover:text-zinc-200',
            )}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

export function Switch({
  checked,
  onChange,
  label,
  tone = 'emerald',
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
  tone?: 'emerald' | 'zinc'
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400',
        checked
          ? tone === 'emerald'
            ? 'border-emerald-500/50 bg-emerald-500/80'
            : 'border-zinc-500 bg-zinc-500'
          : 'border-zinc-700 bg-zinc-800',
      )}
    >
      <span
        className={cn(
          'inline-block size-3.5 rounded-full bg-zinc-50 shadow transition-transform',
          checked ? 'translate-x-[18px]' : 'translate-x-[2px]',
        )}
      />
    </button>
  )
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn('rounded-2xl border border-zinc-800 bg-zinc-900/90', className)}>{children}</div>
}

export function SectionLabel({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <div className="flex items-center justify-between px-1">
      <h2 className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-500">{children}</h2>
      {right}
    </div>
  )
}
