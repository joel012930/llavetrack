'use client'

import { useEffect, useRef, useState } from 'react'
import { ArrowDownToLine, ArrowUpFromLine, Cpu, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDerivados, useLlaveTrack } from './store'

type Lineas = [string, string]

function pad16(s: string) {
  return s.slice(0, 16).padEnd(16, ' ')
}

function LcdDisplay({ lineas, online }: { lineas: Lineas; online: boolean }) {
  return (
    <div
      className="rounded-md border-2 border-zinc-700 bg-[#0a1a0e] p-2 shadow-[inset_0_0_18px_rgba(0,0,0,0.85)]"
      role="status"
      aria-live="polite"
      aria-label={`Display LCD: ${lineas[0].trim()} ${lineas[1].trim()}`}
    >
      <div className="flex flex-col gap-[3px]">
        {lineas.map((linea, fila) => (
          <div key={fila} className="flex gap-[2px]" aria-hidden="true">
            {pad16(linea)
              .split('')
              .map((c, i) => (
                <span
                  key={i}
                  className={cn(
                    'flex h-[18px] w-[11px] items-center justify-center rounded-[1px] font-mono text-[13px] leading-none',
                    online || fila === 0
                      ? 'bg-[#112a17] text-[#7dff9a] [text-shadow:0_0_6px_rgba(125,255,154,0.7)]'
                      : 'bg-[#112a17] text-[#7dff9a]/70',
                  )}
                >
                  {c === ' ' ? '\u00A0' : c}
                </span>
              ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function Led({ on, color, label }: { on: boolean; color: 'green' | 'red'; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span
        className={cn(
          'size-3.5 rounded-full border border-zinc-700 transition-all',
          on
            ? color === 'green'
              ? 'bg-emerald-400 shadow-[0_0_10px_2px_rgba(52,211,153,0.7)]'
              : 'bg-rose-500 shadow-[0_0_10px_2px_rgba(244,63,94,0.7)]'
            : 'bg-zinc-800',
        )}
        aria-hidden="true"
      />
      <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-500">{label}</span>
      <span className="sr-only">{on ? 'encendido' : 'apagado'}</span>
    </div>
  )
}

export function Esp32Simulator() {
  const { state, dispatch } = useLlaveTrack()
  const { reservaPendiente, prestadas, llavePorId } = useDerivados()
  const [secuencia, setSecuencia] = useState<Lineas | null>(null)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  const online = state.dispositivo.online

  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  function correr(pasos: { lineas: Lineas; ms: number; efecto?: () => void }[]) {
    let acumulado = 0
    pasos.forEach((p) => {
      timers.current.push(
        setTimeout(() => {
          setSecuencia(p.lineas)
          p.efecto?.()
        }, acumulado),
      )
      acumulado += p.ms
    })
    timers.current.push(setTimeout(() => setSecuencia(null), acumulado))
  }

  const llaveReservada = reservaPendiente ? llavePorId(reservaPendiente.llave_id) : null
  const llaveDevolucion = state.devolucion_pendiente ? llavePorId(state.devolucion_pendiente) : null

  function simularRetiro() {
    if (!reservaPendiente || !llaveReservada) return
    const c = reservaPendiente.codigo
    const slot = llaveReservada.slot
    correr([
      { lineas: [`Aula ${llaveReservada.aula_nombre}`, 'Codigo: _'], ms: 350 },
      { lineas: [`Aula ${llaveReservada.aula_nombre}`, `Codigo: ${c[0]}`], ms: 350 },
      { lineas: [`Aula ${llaveReservada.aula_nombre}`, `Codigo: ${c.slice(0, 2)}`], ms: 350 },
      { lineas: [`Aula ${llaveReservada.aula_nombre}`, `Codigo: ${c.slice(0, 3)}`], ms: 350 },
      { lineas: [`Aula ${llaveReservada.aula_nombre}`, `Codigo: ${c}#`], ms: 600 },
      { lineas: ['Codigo valido', 'Verificando...'], ms: 700 },
      {
        lineas: ['Girando motor', `-> Slot #${slot}`],
        ms: 1300,
        efecto: () => dispatch({ type: 'MOVER_CARRUSEL', slot }),
      },
      { lineas: ['Retire la llave', `Aula ${llaveReservada.aula_nombre}`], ms: 1100 },
      {
        lineas: ['RFID: sin tag', 'Prestamo OK'],
        ms: 1300,
        efecto: () => dispatch({ type: 'HW_RETIRAR' }),
      },
    ])
  }

  function simularDevolucion() {
    if (!llaveDevolucion) return
    correr([
      { lineas: ['Devolucion', `Hueco #${llaveDevolucion.slot} listo`], ms: 900 },
      { lineas: ['Leyendo RFID...', ''], ms: 900 },
      { lineas: [`UID ${llaveDevolucion.rfid_uid}`, 'Tag detectado!'], ms: 900 },
      {
        lineas: ['Gracias!', `Llave ${llaveDevolucion.aula_nombre} OK`],
        ms: 1400,
        efecto: () => dispatch({ type: 'HW_DEVOLVER' }),
      },
    ])
  }

  const alternar = Math.floor(state.now / 2500) % 2 === 0
  let lineas: Lineas
  if (!online) lineas = ['Sin conexion', 'MQTT/HTTP x']
  else if (secuencia) lineas = secuencia
  else if (llaveReservada) lineas = [`Aula ${llaveReservada.aula_nombre} -`, 'Ingrese codigo:']
  else if (llaveDevolucion) lineas = [`Devolver ${llaveDevolucion.aula_nombre}`, `Slot #${llaveDevolucion.slot} abierto`]
  else if (prestadas.length > 0 && !alternar)
    lineas = [`Faltan: ${prestadas.map((l) => l.aula_nombre).join(' ')}`, `${prestadas.length} fuera / 30`]
  else lineas = ['Sistema listo', state.dispositivo.nombre]

  const ocupado = secuencia !== null
  const puedeRetirar = online && !!reservaPendiente && !ocupado
  const puedeDevolver = online && !!llaveDevolucion && !ocupado

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 sm:flex-row sm:items-center">
      <div className="flex items-center gap-3">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-zinc-500">
            <Cpu className="size-3" aria-hidden="true" />
            ESP32 · LCD 16x2
          </div>
          <LcdDisplay lineas={lineas} online={online} />
        </div>
        <div className="flex gap-3 self-end pb-1">
          <Led on={online} color="green" label="Conex." />
          <Led on={prestadas.length > 0} color="red" label="Faltan" />
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2">
        <button
          type="button"
          onClick={simularRetiro}
          disabled={!puedeRetirar}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-300 transition-colors hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:border-zinc-800 disabled:bg-zinc-900 disabled:text-zinc-600"
        >
          {ocupado && reservaPendiente ? (
            <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
          ) : (
            <ArrowUpFromLine className="size-3.5" aria-hidden="true" />
          )}
          Simular: Ingresar PIN y Retirar
        </button>
        <button
          type="button"
          onClick={simularDevolucion}
          disabled={!puedeDevolver}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-300 transition-colors hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:border-zinc-800 disabled:bg-zinc-900 disabled:text-zinc-600"
        >
          {ocupado && llaveDevolucion ? (
            <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
          ) : (
            <ArrowDownToLine className="size-3.5" aria-hidden="true" />
          )}
          Simular: Colocar Llave en el Carrusel
        </button>
      </div>
    </div>
  )
}
