'use client'

import { useState } from 'react'
import {
  ArrowDownToLine,
  Clock,
  History,
  KeyRound,
  LayoutGrid,
  LogOut,
  Search,
  TriangleAlert,
  UserRound,
  X,
} from 'lucide-react'
import {
  formatCuentaRegresiva,
  formatDuracion,
  formatFecha,
  formatHora,
  generarCodigo,
  PROFESOR_ACTUAL_ID,
  RESERVA_DURACION_MS,
  type Llave,
} from '@/lib/llavetrack'
import { cn } from '@/lib/utils'
import { BottomNav, PhoneFrame } from './phone-frame'
import { Card, EstadoBadge, PulseDot, Segmented, SectionLabel, Switch } from './primitives'
import { useDerivados, useLlaveTrack } from './store'

type Tab = 'aulas' | 'prestamos' | 'cuenta'
type FiltroPiso = 'todas' | '1' | '2' | '3'

function CarruselPill({ online }: { online: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-medium',
        online ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' : 'border-rose-500/30 bg-rose-500/10 text-rose-400',
      )}
    >
      <PulseDot online={online} />
      {online ? 'Carrusel Online' : 'Desconectado'}
    </span>
  )
}

export function OfflineBanner() {
  return (
    <div role="alert" className="flex gap-2.5 rounded-xl border border-rose-500/40 bg-rose-500/10 p-3">
      <TriangleAlert className="mt-0.5 size-4 shrink-0 text-rose-400" aria-hidden="true" />
      <p className="text-xs leading-relaxed text-rose-200">
        <span className="font-semibold text-rose-300">El equipo está desconectado.</span> No se pueden retirar ni devolver
        llaves hasta recuperar conexión.
      </p>
    </div>
  )
}

function ReservaCard() {
  const { state, dispatch } = useLlaveTrack()
  const { llavePorId } = useDerivados()
  const reserva = state.reservas.find((r) => r.usuario_id === PROFESOR_ACTUAL_ID && r.estado === 'PENDIENTE')
  if (!reserva) return null
  const llave = llavePorId(reserva.llave_id)
  const restante = reserva.expira_en - state.now
  const progreso = Math.max(0, Math.min(1, restante / RESERVA_DURACION_MS))

  return (
    <div className="relative overflow-hidden rounded-2xl border border-amber-500/50 bg-gradient-to-b from-amber-500/10 to-zinc-900/90 p-4 shadow-[0_0_40px_-12px_rgba(245,158,11,0.5)]">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-amber-400">
          Llave reservada · Aula {llave?.aula_nombre} (Slot #{llave?.slot})
        </p>
        <span className="flex items-center gap-1 font-mono text-xs tabular-nums text-amber-300">
          <Clock className="size-3" aria-hidden="true" />
          {formatCuentaRegresiva(restante)}
        </span>
      </div>
      <div className="my-4 flex justify-center gap-2" aria-label={`Código PIN ${reserva.codigo.split('').join(' ')}`}>
        {reserva.codigo.split('').map((d, i) => (
          <span
            key={i}
            className="flex h-16 w-14 items-center justify-center rounded-xl border border-amber-500/30 bg-zinc-950 font-mono text-4xl font-semibold text-amber-300 [text-shadow:0_0_14px_rgba(252,211,77,0.5)]"
            aria-hidden="true"
          >
            {d}
          </span>
        ))}
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-zinc-800" aria-hidden="true">
        <div className="h-full rounded-full bg-amber-400 transition-[width] duration-1000 ease-linear" style={{ width: `${progreso * 100}%` }} />
      </div>
      <p className="mt-3 text-center text-xs text-zinc-300">
        Acercate al carrusel, ingresá el código y presioná <span className="font-mono text-amber-300">#</span>
      </p>
      <button
        type="button"
        onClick={() => dispatch({ type: 'CANCELAR_RESERVA', reservaId: reserva.id })}
        className="mt-3 flex h-9 w-full items-center justify-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-900 text-xs font-medium text-zinc-300 hover:bg-zinc-800"
      >
        <X className="size-3.5" aria-hidden="true" />
        Cancelar reserva
      </button>
    </div>
  )
}

function MiLlaveCard({ llave }: { llave: Llave }) {
  const { state, dispatch } = useLlaveTrack()
  const online = state.dispositivo.online
  const enDevolucion = state.devolucion_pendiente === llave.id
  return (
    <div className="rounded-2xl border border-emerald-500/40 bg-gradient-to-b from-emerald-500/10 to-zinc-900/90 p-4 shadow-[0_0_40px_-14px_rgba(16,185,129,0.5)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-emerald-400">En tu poder</p>
          <p className="mt-1 text-lg font-semibold tracking-tight">Tenés la llave del Aula {llave.aula_nombre}</p>
          <p className="mt-0.5 text-xs text-zinc-400">
            Retirada a las <span className="font-mono text-zinc-200">{llave.hora_retiro ? formatHora(llave.hora_retiro) : '--:--'}</span>
            {' · '}
            <span className="font-mono">Slot #{llave.slot}</span>
          </p>
        </div>
        <span className="flex size-10 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
          <KeyRound className="size-5 -rotate-45" aria-hidden="true" />
        </span>
      </div>
      {enDevolucion ? (
        <div className="mt-4 rounded-xl border border-emerald-500/30 bg-zinc-950 p-3">
          <p className="flex items-center gap-2 text-xs text-emerald-300">
            <span className="size-1.5 animate-pulse rounded-full bg-emerald-400" aria-hidden="true" />
            Hueco <span className="font-mono">#{llave.slot}</span> posicionado en la ventana
          </p>
          <p className="mt-1 text-[11px] text-zinc-400">Colocá la llave en el carrusel. El lector RFID detectará el tag automáticamente.</p>
          <button
            type="button"
            onClick={() => dispatch({ type: 'CANCELAR_DEVOLUCION' })}
            className="mt-2 text-[11px] text-zinc-400 underline underline-offset-4 hover:text-zinc-200"
          >
            Cancelar devolución
          </button>
        </div>
      ) : (
        <button
          type="button"
          disabled={!online}
          onClick={() => dispatch({ type: 'SOLICITAR_DEVOLUCION', llaveId: llave.id })}
          className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 text-sm font-semibold text-emerald-950 transition-colors hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500"
        >
          <ArrowDownToLine className="size-4" aria-hidden="true" />
          Devolver llave {llave.aula_nombre}
        </button>
      )}
    </div>
  )
}

function AulaCard({ llave, puedeRetirar, motivo }: { llave: Llave; puedeRetirar: boolean; motivo?: string }) {
  const { dispatch } = useLlaveTrack()
  const { usuarioPorId } = useDerivados()
  const poseedor = usuarioPorId(llave.poseedor_id)
  const esMia = llave.poseedor_id === PROFESOR_ACTUAL_ID

  return (
    <Card
      className={cn(
        'flex flex-col gap-2 p-3',
        llave.estado === 'PRESTADA' && 'border-rose-500/20',
        llave.estado === 'RESERVADA' && 'border-amber-500/30',
      )}
    >
      <div className="flex items-start justify-between gap-1">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-zinc-500">Aula</p>
          <p className="font-mono text-2xl font-semibold leading-none tracking-tight">{llave.aula_nombre}</p>
        </div>
        <span className="font-mono text-[10px] text-zinc-500">#{llave.slot.toString().padStart(2, '0')}</span>
      </div>
      <EstadoBadge estado={llave.estado} className="self-start" />
      {llave.estado === 'DISPONIBLE' ? (
        <button
          type="button"
          disabled={!puedeRetirar}
          title={motivo}
          onClick={() => dispatch({ type: 'RESERVAR', llaveId: llave.id, codigo: generarCodigo() })}
          className="mt-auto h-8 rounded-lg bg-zinc-100 text-xs font-semibold text-zinc-900 transition-colors hover:bg-white disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500"
        >
          Retirar
        </button>
      ) : (
        <p className="mt-auto min-h-8 text-[11px] leading-tight text-zinc-400">
          {esMia ? (
            <span className={llave.estado === 'RESERVADA' ? 'text-amber-300' : 'text-emerald-300'}>
              {llave.estado === 'RESERVADA' ? 'Tu reserva activa' : 'En tu poder'}
            </span>
          ) : (
            <>
              Prof. {poseedor?.nombre}
              {llave.hora_retiro && <span className="block font-mono text-zinc-500">desde {formatHora(llave.hora_retiro)}</span>}
            </>
          )}
        </p>
      )}
    </Card>
  )
}

function AulasTab() {
  const { state } = useLlaveTrack()
  const [busqueda, setBusqueda] = useState('')
  const [piso, setPiso] = useState<FiltroPiso>('todas')
  const [soloDisponibles, setSoloDisponibles] = useState(false)
  const online = state.dispositivo.online
  const misLlaves = state.llaves.filter((l) => l.estado === 'PRESTADA' && l.poseedor_id === PROFESOR_ACTUAL_ID)
  const tieneReserva = state.reservas.some((r) => r.usuario_id === PROFESOR_ACTUAL_ID && r.estado === 'PENDIENTE')
  const disponibles = state.llaves.filter((l) => l.estado === 'DISPONIBLE').length

  const filtradas = state.llaves.filter(
    (l) =>
      (piso === 'todas' || l.piso.toString() === piso) &&
      (!soloDisponibles || l.estado === 'DISPONIBLE') &&
      l.aula_nombre.includes(busqueda.trim()),
  )

  const motivo = !online ? 'Carrusel desconectado' : tieneReserva ? 'Ya tenés una reserva activa' : undefined

  return (
    <div className="flex flex-col gap-4 px-4 pb-6">
      {!online && <OfflineBanner />}
      <ReservaCard />
      {misLlaves.map((l) => (
        <MiLlaveCard key={l.id} llave={l} />
      ))}

      <div className="flex flex-col gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500" aria-hidden="true" />
          <label htmlFor="buscar-aula" className="sr-only">Buscar aula</label>
          <input
            id="buscar-aula"
            inputMode="numeric"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value.replace(/\D/g, '').slice(0, 3))}
            placeholder="Buscar aula, ej. 204"
            className="h-10 w-full rounded-xl border border-zinc-800 bg-zinc-900/90 pl-10 pr-3 font-mono text-sm placeholder:font-sans placeholder:text-zinc-600 focus:border-zinc-600 focus:outline-none"
          />
        </div>
        <div className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none]">
          <Segmented<FiltroPiso>
            label="Filtrar por piso"
            size="sm"
            value={piso}
            onChange={setPiso}
            options={[
              { value: 'todas', label: `Todas (${state.llaves.length})` },
              { value: '1', label: 'Piso 1' },
              { value: '2', label: 'Piso 2' },
              { value: '3', label: 'Piso 3' },
            ]}
          />
        </div>
        <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/60 px-3 py-2">
          <span className="text-xs text-zinc-300">
            Solo disponibles <span className="font-mono text-emerald-400">({disponibles})</span>
          </span>
          <Switch checked={soloDisponibles} onChange={setSoloDisponibles} label="Mostrar solo disponibles" />
        </div>
      </div>

      <SectionLabel right={<span className="font-mono text-[10px] text-zinc-500">{filtradas.length} resultados</span>}>
        Aulas
      </SectionLabel>
      {filtradas.length === 0 ? (
        <p className="py-8 text-center text-sm text-zinc-500">No hay aulas que coincidan.</p>
      ) : (
        <ul className="grid grid-cols-2 gap-2.5">
          {filtradas.map((l) => (
            <li key={l.id} className="flex">
              <div className="flex w-full flex-col [&>*]:flex-1">
                <AulaCard llave={l} puedeRetirar={online && !tieneReserva} motivo={motivo} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function PrestamosTab() {
  const { state } = useLlaveTrack()
  const { llavePorId } = useDerivados()
  const mios = state.prestamos
    .filter((p) => p.usuario_id === PROFESOR_ACTUAL_ID)
    .sort((a, b) => b.retirado_en - a.retirado_en)

  return (
    <div className="flex flex-col gap-3 px-4 pb-6">
      <SectionLabel right={<span className="font-mono text-[10px] text-zinc-500">{mios.length} registros</span>}>
        Mis préstamos
      </SectionLabel>
      <ul className="flex flex-col gap-2">
        {mios.map((p) => {
          const llave = llavePorId(p.llave_id)
          const abierto = p.devuelto_en === null
          return (
            <li key={p.id}>
              <Card className="flex items-center gap-3 p-3">
                <span
                  className={cn(
                    'flex size-11 shrink-0 items-center justify-center rounded-xl border font-mono text-sm font-semibold',
                    abierto ? 'border-rose-500/30 bg-rose-500/10 text-rose-300' : 'border-zinc-800 bg-zinc-950 text-zinc-200',
                  )}
                >
                  {llave?.aula_nombre}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">
                    Aula {llave?.aula_nombre} <span className="text-xs font-normal text-zinc-500">· {formatFecha(p.retirado_en, state.now)}</span>
                  </p>
                  <p className="mt-0.5 font-mono text-[11px] text-zinc-400">
                    {formatHora(p.retirado_en)} → {p.devuelto_en ? formatHora(p.devuelto_en) : '— —'}
                  </p>
                </div>
                <div className="text-right">
                  {abierto ? (
                    <EstadoBadge estado="PRESTADA" />
                  ) : (
                    <span className="font-mono text-[11px] text-zinc-500">
                      {formatDuracion((p.devuelto_en ?? 0) - p.retirado_en)}
                    </span>
                  )}
                </div>
              </Card>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function CuentaTab() {
  const { state, dispatch } = useLlaveTrack()
  const yo = state.usuarios.find((u) => u.id === PROFESOR_ACTUAL_ID)!
  return (
    <div className="flex flex-col gap-3 px-4 pb-6">
      <Card className="flex items-center gap-3 p-4">
        <span className="flex size-12 items-center justify-center rounded-full bg-zinc-800 text-base font-semibold">JP</span>
        <div>
          <p className="font-medium">{yo.nombre}</p>
          <p className="text-xs text-zinc-400">{yo.email}</p>
        </div>
      </Card>
      <Card className="divide-y divide-zinc-800 text-sm">
        {[
          ['Rol', 'profesor'],
          ['Teléfono', yo.telefono],
          ['Google vinculado', yo.google_sub ? `sub ${yo.google_sub}` : 'No'],
        ].map(([k, v]) => (
          <div key={k} className="flex items-center justify-between px-4 py-3">
            <span className="text-zinc-400">{k}</span>
            <span className="font-mono text-xs text-zinc-200">{v}</span>
          </div>
        ))}
      </Card>
      <button
        type="button"
        onClick={() => dispatch({ type: 'SET_VISTA', vista: 'login' })}
        className="flex h-11 items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 text-sm font-medium text-rose-400 hover:bg-zinc-800"
      >
        <LogOut className="size-4" aria-hidden="true" />
        Cerrar sesión
      </button>
    </div>
  )
}

export function TeacherView() {
  const { state } = useLlaveTrack()
  const [tab, setTab] = useState<Tab>('aulas')
  const enPoder = state.llaves.filter((l) => l.estado === 'PRESTADA' && l.poseedor_id === PROFESOR_ACTUAL_ID).length

  return (
    <PhoneFrame
      bottomNav={
        <BottomNav<Tab>
          value={tab}
          onChange={setTab}
          items={[
            { value: 'aulas', label: 'Aulas', icon: <LayoutGrid className="size-5" aria-hidden="true" /> },
            { value: 'prestamos', label: 'Mis Préstamos', icon: <History className="size-5" aria-hidden="true" />, badge: enPoder },
            { value: 'cuenta', label: 'Cuenta', icon: <UserRound className="size-5" aria-hidden="true" /> },
          ]}
        />
      }
    >
      <header className="sticky top-0 z-20 flex items-center justify-between gap-2 bg-zinc-950/90 px-4 pb-3 pt-2 backdrop-blur">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-lg font-semibold tracking-tight">Hola, Juan Pérez</h1>
          </div>
          <span className="mt-0.5 inline-block rounded-md border border-zinc-800 bg-zinc-900 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-zinc-400">
            Profesor
          </span>
        </div>
        <CarruselPill online={state.dispositivo.online} />
      </header>
      {tab === 'aulas' && <AulasTab />}
      {tab === 'prestamos' && <PrestamosTab />}
      {tab === 'cuenta' && <CuentaTab />}
    </PhoneFrame>
  )
}

export { CarruselPill }
