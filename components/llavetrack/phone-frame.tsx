'use client'

import { useEffect, type ReactNode } from 'react'
import { BatteryFull, CheckCircle2, Info, Signal, TriangleAlert, Wifi, X, XCircle } from 'lucide-react'
import { formatHora, type Toast } from '@/lib/llavetrack'
import { cn } from '@/lib/utils'
import { useLlaveTrack } from './store'

function ToastItem({ toast }: { toast: Toast }) {
  const { dispatch } = useLlaveTrack()
  useEffect(() => {
    const id = setTimeout(() => dispatch({ type: 'DISMISS_TOAST', id: toast.id }), 3800)
    return () => clearTimeout(id)
  }, [toast.id, dispatch])

  const Icon =
    toast.tone === 'success' ? CheckCircle2 : toast.tone === 'error' ? XCircle : toast.tone === 'warning' ? TriangleAlert : Info
  const color =
    toast.tone === 'success'
      ? 'text-emerald-400'
      : toast.tone === 'error'
        ? 'text-rose-400'
        : toast.tone === 'warning'
          ? 'text-amber-400'
          : 'text-zinc-300'

  return (
    <div
      role="status"
      className="pointer-events-auto flex items-start gap-2.5 rounded-xl border border-zinc-800 bg-zinc-900/95 p-3 shadow-xl shadow-black/50 backdrop-blur animate-in fade-in slide-in-from-top-2"
    >
      <Icon className={cn('mt-0.5 size-4 shrink-0', color)} aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-medium text-zinc-100">{toast.title}</p>
        {toast.description && <p className="mt-0.5 text-[11px] leading-snug text-zinc-400">{toast.description}</p>}
      </div>
      <button
        type="button"
        onClick={() => dispatch({ type: 'DISMISS_TOAST', id: toast.id })}
        className="rounded p-0.5 text-zinc-500 hover:text-zinc-200"
        aria-label="Cerrar notificación"
      >
        <X className="size-3.5" />
      </button>
    </div>
  )
}

export function PhoneFrame({ children, bottomNav }: { children: ReactNode; bottomNav?: ReactNode }) {
  const { state } = useLlaveTrack()
  return (
    <div className="relative h-[820px] w-[390px] shrink-0 rounded-[44px] border-[8px] border-zinc-800 bg-zinc-950 shadow-[0_0_0_1px_#3f3f46,0_40px_120px_-20px_rgba(0,0,0,0.9),0_0_80px_-30px_rgba(16,185,129,0.25)]">
      <div className="absolute -left-[11px] top-28 h-8 w-[3px] rounded-l bg-zinc-700" aria-hidden="true" />
      <div className="absolute -left-[11px] top-44 h-14 w-[3px] rounded-l bg-zinc-700" aria-hidden="true" />
      <div className="absolute -right-[11px] top-36 h-20 w-[3px] rounded-r bg-zinc-700" aria-hidden="true" />

      <div className="relative flex h-full flex-col overflow-hidden rounded-[36px] bg-zinc-950 text-zinc-100">
        <div className="relative z-30 flex h-11 shrink-0 items-center justify-between px-7 pt-1 text-[13px] font-semibold">
          <span className="font-mono tabular-nums">{formatHora(state.now)}</span>
          <div className="absolute left-1/2 top-2 h-[26px] w-[110px] -translate-x-1/2 rounded-full bg-black" aria-hidden="true" />
          <span className="flex items-center gap-1" aria-hidden="true">
            <Signal className="size-3.5" />
            <Wifi className="size-3.5" />
            <BatteryFull className="size-4" />
          </span>
        </div>

        <div className="pointer-events-none absolute inset-x-3 top-12 z-40 flex flex-col gap-2" aria-live="polite">
          {state.toasts.map((t) => (
            <ToastItem key={t.id} toast={t} />
          ))}
        </div>

        <div className="relative flex-1 overflow-y-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {children}
        </div>

        {bottomNav}
        <div className="flex h-5 shrink-0 items-start justify-center bg-zinc-950" aria-hidden="true">
          <span className="h-1 w-32 rounded-full bg-zinc-600" />
        </div>
      </div>
    </div>
  )
}

export function BottomNav<T extends string>({
  value,
  onChange,
  items,
}: {
  value: T
  onChange: (v: T) => void
  items: { value: T; label: string; icon: ReactNode; badge?: number }[]
}) {
  return (
    <nav className="shrink-0 border-t border-zinc-800/80 bg-zinc-950/95 px-2 pt-2 backdrop-blur" aria-label="Navegación principal">
      <ul className="flex items-center justify-around">
        {items.map((it) => {
          const active = it.value === value
          return (
            <li key={it.value} className="flex-1">
              <button
                type="button"
                onClick={() => onChange(it.value)}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'relative flex w-full flex-col items-center gap-1 rounded-lg py-1.5 text-[10px] font-medium transition-colors',
                  active ? 'text-zinc-50' : 'text-zinc-500 hover:text-zinc-300',
                )}
              >
                <span className="relative">
                  {it.icon}
                  {!!it.badge && (
                    <span className="absolute -right-2.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 font-mono text-[9px] font-semibold text-white">
                      {it.badge}
                    </span>
                  )}
                </span>
                {it.label}
                {active && <span className="absolute -top-2 h-0.5 w-6 rounded-full bg-zinc-100" aria-hidden="true" />}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
