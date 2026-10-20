'use client'

import { GraduationCap, LogIn, ShieldCheck, Wifi, WifiOff } from 'lucide-react'
import type { Vista } from '@/lib/llavetrack'
import { cn } from '@/lib/utils'
import { Esp32Simulator } from './esp32-simulator'
import { Segmented, Switch } from './primitives'
import { useLlaveTrack } from './store'
import { Logo } from './logo'

export function DemoToolbar() {
  const { state, dispatch } = useLlaveTrack()
  const { online, ultimo_contacto, nombre } = state.dispositivo
  const heartbeat = Math.max(0, Math.round((state.now - ultimo_contacto) / 1000))

  return (
    <header className="z-20 border-b border-zinc-800/80 bg-[#050505]/85 backdrop-blur-md lg:sticky lg:top-0">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <div className="flex items-center gap-2.5">
            <Logo size="sm" />
            <div className="leading-tight">
              <p className="text-sm font-semibold text-zinc-100">LlaveTrack</p>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">Demo · Hardware toolbar</p>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">Rol activo</span>
            <Segmented<Vista>
              label="Rol activo"
              value={state.vista}
              onChange={(vista) => dispatch({ type: 'SET_VISTA', vista })}
              options={[
                { value: 'login', label: <><LogIn className="size-3.5" aria-hidden="true" />Login</> },
                {
                  value: 'profesor',
                  label: <><GraduationCap className="size-3.5" aria-hidden="true" />Profesor (Juan Pérez)</>,
                },
                { value: 'admin', label: <><ShieldCheck className="size-3.5" aria-hidden="true" />Admin</> },
              ]}
            />
          </div>

          <div className="flex flex-col gap-1">
            <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">{nombre} · US-20</span>
            <div
              className={cn(
                'flex items-center gap-3 rounded-lg border px-3 py-1.5',
                online ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-rose-500/30 bg-rose-500/5',
              )}
            >
              <Switch
                checked={online}
                onChange={(v) => dispatch({ type: 'SET_ONLINE', online: v })}
                label="Estado del carrusel"
              />
              {online ? (
                <span className="flex items-center gap-1.5 font-mono text-[11px] text-emerald-400">
                  <Wifi className="size-3.5" aria-hidden="true" />
                  ONLINE <span className="text-zinc-500">· heartbeat hace {heartbeat}s</span>
                </span>
              ) : (
                <span className="flex items-center gap-1.5 font-mono text-[11px] text-rose-400">
                  <WifiOff className="size-3.5" aria-hidden="true" />
                  OFFLINE <span className="text-zinc-500">· sin MQTT/HTTP</span>
                </span>
              )}
            </div>
          </div>
        </div>

        <Esp32Simulator />
      </div>
    </header>
  )
}
