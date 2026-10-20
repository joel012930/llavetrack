'use client'

import { useState } from 'react'
import {
  BellRing,
  Check,
  Cpu,
  History,
  KeyRound,
  LogOut,
  Mail,
  Pencil,
  Phone,
  Search,
  X,
} from 'lucide-react'
import { formatDuracion, formatFecha, formatHora, type Llave } from '@/lib/llavetrack'
import { cn } from '@/lib/utils'
import { BottomNav, PhoneFrame } from './phone-frame'
import { Card, EstadoBadge, Segmented, SectionLabel, Switch } from './primitives'
import { useDerivados, useLlaveTrack } from './store'
import { CarruselPill, OfflineBanner } from './teacher-view'

type Tab = 'faltantes' | 'historial' | 'dispositivo'
type FiltroEstado = 'todos' | 'devuelta' | 'abierta'

const HORA = 60 * 60 * 1000

function FaltantesTab() {
  const { state, dispatch } = useLlaveTrack()
  const { usuarioPorId, llavePorId } = useDerivados()
  const abiertos = state.prestamos.filter((p) => p.devuelto_en === null).sort((a, b) => a.retirado_en - b.retirado_en)

  return (
    <div className="flex flex-col gap-4 px-4 pb-6">
      <Card className="relative overflow-hidden p-4">
        <div className="absolute -right-6 -top-6 size-28 rounded-full bg-rose-500/10 blur-2xl" aria-hidden="true" />
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">Fuera del carrusel · US-21</p>
        <div className="mt-2 flex items-end gap-2">
          <span className={cn('font-mono text-5xl font-semibold leading-none', abiertos.length ? 'text-rose-400' : 'text-emerald-400')}>
            {abiertos.length}
          </span>
          <span className="pb-1 text-sm text-zinc-400">/ {state.dispositivo.slots_totales} llaves</span>
        </div>
        <div className="mt-3 flex gap-[3px]" aria-hidden="true">
          {state.llaves.map((l) => (
            <span
              key={l.id}
              className={cn(
                'h-2 flex-1 rounded-sm',
                l.estado === 'PRESTADA' ? 'bg-rose-500' : l.estado === 'RESERVADA' ? 'bg-amber-400' : 'bg-zinc-700',
              )}
            />
          ))}
        </div>
      </Card>

      <SectionLabel>Préstamos sin devolver</SectionLabel>
      {abiertos.length === 0 ? (
        <Card className="flex flex-col items-center gap-2 p-6 text-center">
          <Check className="size-6 text-emerald-400" aria-hidden="true" />
          <p className="text-sm text-zinc-300">Todas las llaves están en el carrusel.</p>
        </Card>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {abiertos.map((p) => {
            const u = usuarioPorId(p.usuario_id)
            const l = llavePorId(p.llave_id)
            const transcurrido = state.now - p.retirado_en
            return (
              <li key={p.id}>
                <Card className="p-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="flex size-12 items-center justify-center rounded-xl border border-rose-500/30 bg-rose-500/10 font-mono text-base font-semibold text-rose-300">
                        {l?.aula_nombre}
                      </span>
                      <div>
                        <p className="text-sm font-medium">{u?.nombre}</p>
                        <p className="font-mono text-[11px] text-zinc-500">
                          Slot #{l?.slot} · retiro {formatHora(p.retirado_en)}
                        </p>
                      </div>
                    </div>
                    <span
                      className={cn(
                        'rounded-md px-1.5 py-0.5 font-mono text-[11px] font-medium',
                        transcurrido >= HORA ? 'bg-rose-500/15 text-rose-400' : 'bg-amber-500/15 text-amber-400',
                      )}
                    >
                      Hace {formatDuracion(transcurrido)}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-col gap-1 border-t border-zinc-800 pt-3 text-[11px] text-zinc-400">
                    <span className="flex items-center gap-1.5">
                      <Mail className="size-3" aria-hidden="true" />
                      {u?.email}
                    </span>
                    <span className="flex items-center gap-1.5 font-mono">
                      <Phone className="size-3" aria-hidden="true" />
                      {u?.telefono}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      dispatch({
                        type: 'TOAST',
                        toast: {
                          tone: 'success',
                          title: 'Recordatorio enviado',
                          description: `Se notificó a ${u?.nombre} que devuelva la llave del Aula ${l?.aula_nombre}.`,
                        },
                      })
                    }
                    className="mt-3 flex h-9 w-full items-center justify-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800 text-xs font-medium text-zinc-100 hover:bg-zinc-700"
                  >
                    <BellRing className="size-3.5" aria-hidden="true" />
                    Enviar recordatorio
                  </button>
                </Card>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

function HistorialTab() {
  const { state } = useLlaveTrack()
  const { usuarioPorId, llavePorId } = useDerivados()
  const [q, setQ] = useState('')
  const [estado, setEstado] = useState<FiltroEstado>('todos')
  const term = q.trim().toLowerCase()

  const filas = state.prestamos
    .map((p) => ({ p, u: usuarioPorId(p.usuario_id), l: llavePorId(p.llave_id) }))
    .filter(({ p, u, l }) => {
      if (estado === 'devuelta' && p.devuelto_en === null) return false
      if (estado === 'abierta' && p.devuelto_en !== null) return false
      if (!term) return true
      return (l?.aula_nombre.includes(term) ?? false) || (u?.nombre.toLowerCase().includes(term) ?? false)
    })
    .sort((a, b) => b.p.retirado_en - a.p.retirado_en)

  return (
    <div className="flex flex-col gap-3 px-4 pb-6">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500" aria-hidden="true" />
        <label htmlFor="buscar-hist" className="sr-only">Filtrar por aula o profesor</label>
        <input
          id="buscar-hist"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Aula o profesor…"
          className="h-10 w-full rounded-xl border border-zinc-800 bg-zinc-900/90 pl-10 pr-3 text-sm placeholder:text-zinc-600 focus:border-zinc-600 focus:outline-none"
        />
      </div>
      <Segmented<FiltroEstado>
        label="Filtrar por estado"
        size="sm"
        value={estado}
        onChange={setEstado}
        options={[
          { value: 'todos', label: 'Todos' },
          { value: 'devuelta', label: 'Devuelta' },
          { value: 'abierta', label: 'Sin devolver' },
        ]}
      />
      <SectionLabel right={<span className="font-mono text-[10px] text-zinc-500">{filas.length} movimientos</span>}>
        Tabla prestamo
      </SectionLabel>
      <Card className="overflow-hidden">
        <div className="grid grid-cols-[48px_1fr_auto] gap-2 border-b border-zinc-800 bg-zinc-950/60 px-3 py-2 font-mono text-[9px] uppercase tracking-wider text-zinc-500">
          <span>Aula</span>
          <span>Profesor · horario</span>
          <span>Estado</span>
        </div>
        {filas.length === 0 ? (
          <p className="p-6 text-center text-xs text-zinc-500">Sin resultados.</p>
        ) : (
          <ul className="divide-y divide-zinc-800">
            {filas.map(({ p, u, l }) => (
              <li key={p.id} className="grid grid-cols-[48px_1fr_auto] items-center gap-2 px-3 py-2.5">
                <span className="font-mono text-sm font-semibold">{l?.aula_nombre}</span>
                <div className="min-w-0">
                  <p className="truncate text-xs text-zinc-200">{u?.nombre}</p>
                  <p className="font-mono text-[10px] text-zinc-500">
                    {formatFecha(p.retirado_en, state.now)} · {formatHora(p.retirado_en)}→{p.devuelto_en ? formatHora(p.devuelto_en) : '--:--'}
                  </p>
                </div>
                <span
                  className={cn(
                    'rounded-full border px-2 py-0.5 text-[9px] font-medium uppercase tracking-wider',
                    p.devuelto_en
                      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                      : 'border-rose-500/30 bg-rose-500/10 text-rose-400',
                  )}
                >
                  {p.devuelto_en ? 'Devuelta' : 'Sin devolver'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}

function CarruselRing() {
  const { state } = useLlaveTrack()
  const { slots_totales, posicion_actual, online } = state.dispositivo
  const rotacion = -((posicion_actual - 1) * 360) / slots_totales
  const actual = state.llaves.find((l) => l.slot === posicion_actual)

  return (
    <div className="relative mx-auto size-[248px]">
      <div className="absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1 rounded-sm bg-zinc-100 px-1.5 py-0.5 font-mono text-[8px] font-semibold uppercase text-zinc-900">
        Ventana
      </div>
      <div className="absolute inset-0 rounded-full border border-zinc-800 bg-zinc-950" />
      <div
        className="absolute inset-0 transition-transform duration-1000 ease-in-out"
        style={{ transform: `rotate(${rotacion}deg)` }}
        role="img"
        aria-label={`Carrusel de ${slots_totales} slots, posición actual slot ${posicion_actual}`}
      >
        {state.llaves.map((l) => {
          const angulo = ((l.slot - 1) * 360) / slots_totales
          const presente = l.estado !== 'PRESTADA'
          return (
            <span
              key={l.id}
              className="absolute left-1/2 top-1/2"
              style={{ transform: `rotate(${angulo}deg) translateY(-108px)` }}
            >
              <span
                className={cn(
                  'flex size-[18px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[5px] border font-mono text-[7px] font-semibold',
                  l.estado === 'PRESTADA'
                    ? 'border-rose-500/60 bg-transparent text-rose-400'
                    : l.estado === 'RESERVADA'
                      ? 'border-amber-400/60 bg-amber-400/80 text-amber-950'
                      : 'border-emerald-500/50 bg-emerald-500/70 text-emerald-950',
                  l.slot === posicion_actual && 'ring-2 ring-zinc-100 ring-offset-1 ring-offset-zinc-950',
                )}
                title={`Slot ${l.slot} · Aula ${l.aula_nombre} · ${presente ? 'tag presente' : 'vacío'}`}
              >
                {l.slot}
              </span>
            </span>
          )
        })}
      </div>
      <div className="absolute inset-[52px] flex flex-col items-center justify-center rounded-full border border-zinc-800 bg-zinc-900 text-center">
        <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-500">Slot actual</span>
        <span className="font-mono text-3xl font-semibold">#{posicion_actual.toString().padStart(2, '0')}</span>
        <span className="text-[11px] text-zinc-400">Aula {actual?.aula_nombre}</span>
        <span className={cn('mt-1 font-mono text-[9px]', online ? 'text-emerald-400' : 'text-rose-400')}>
          {online ? 'MOTOR OK' : 'SIN SEÑAL'}
        </span>
      </div>
    </div>
  )
}

function LlaveRow({ llave }: { llave: Llave }) {
  const { dispatch } = useLlaveTrack()
  const [editando, setEditando] = useState(false)
  const [uid, setUid] = useState(llave.rfid_uid)
  const valido = /^[0-9A-F]{8}$/.test(uid)

  return (
    <li className="flex items-center gap-3 px-3 py-2.5">
      <span className="w-9 font-mono text-sm font-semibold">{llave.aula_nombre}</span>
      <span className="w-8 font-mono text-[10px] text-zinc-500">#{llave.slot.toString().padStart(2, '0')}</span>
      {editando ? (
        <form
          className="flex flex-1 items-center gap-1"
          onSubmit={(e) => {
            e.preventDefault()
            if (!valido) return
            dispatch({ type: 'ACTUALIZAR_RFID', llaveId: llave.id, uid })
            setEditando(false)
          }}
        >
          <label htmlFor={`uid-${llave.id}`} className="sr-only">UID RFID del aula {llave.aula_nombre}</label>
          <input
            id={`uid-${llave.id}`}
            autoFocus
            value={uid}
            onChange={(e) => setUid(e.target.value.toUpperCase().replace(/[^0-9A-F]/g, '').slice(0, 8))}
            aria-invalid={!valido}
            className={cn(
              'h-7 w-full min-w-0 rounded-md border bg-zinc-950 px-2 font-mono text-[11px] focus:outline-none',
              valido ? 'border-zinc-700' : 'border-rose-500/60',
            )}
          />
          <button type="submit" disabled={!valido} className="rounded p-1 text-emerald-400 disabled:text-zinc-600" aria-label="Guardar UID">
            <Check className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={() => {
              setUid(llave.rfid_uid)
              setEditando(false)
            }}
            className="rounded p-1 text-zinc-500 hover:text-zinc-200"
            aria-label="Cancelar edición"
          >
            <X className="size-3.5" />
          </button>
        </form>
      ) : (
        <>
          <span className="flex-1 font-mono text-[11px] text-zinc-300">{llave.rfid_uid}</span>
          <EstadoBadge estado={llave.estado} className="px-1.5 text-[8px]" />
          <button
            type="button"
            onClick={() => setEditando(true)}
            className="rounded-md p-1 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200"
            aria-label={`Editar RFID del aula ${llave.aula_nombre}`}
          >
            <Pencil className="size-3.5" />
          </button>
        </>
      )}
    </li>
  )
}

function DispositivoTab() {
  const { state, dispatch } = useLlaveTrack()
  const d = state.dispositivo
  const heartbeat = Math.max(0, Math.round((state.now - d.ultimo_contacto) / 1000))
  const presentes = state.llaves.filter((l) => l.estado !== 'PRESTADA').length
  const [verTodas, setVerTodas] = useState(false)
  const llaves = verTodas ? state.llaves : state.llaves.slice(0, 8)

  return (
    <div className="flex flex-col gap-4 px-4 pb-6">
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="size-4 text-zinc-400" aria-hidden="true" />
            <span className="font-mono text-sm">{d.device_id}</span>
          </div>
          <span
            className={cn(
              'rounded-md px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase',
              d.online ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400',
            )}
          >
            {d.online ? 'online' : 'offline'}
          </span>
        </div>
        <dl className="mt-3 grid grid-cols-2 gap-2">
          {[
            ['ultimo_contacto', d.online ? `hace ${heartbeat}s` : formatHora(d.ultimo_contacto)],
            ['slots_totales', d.slots_totales.toString()],
            ['tags_presentes', `${presentes}/${d.slots_totales}`],
            ['firmware', d.firmware],
          ].map(([k, v]) => (
            <div key={k} className="rounded-lg border border-zinc-800 bg-zinc-950 px-2.5 py-2">
              <dt className="font-mono text-[9px] uppercase tracking-wider text-zinc-500">{k}</dt>
              <dd className="mt-0.5 font-mono text-sm text-zinc-100">{v}</dd>
            </div>
          ))}
        </dl>
      </Card>

      <Card className="p-4">
        <CarruselRing />
        <div className="mt-4 flex justify-center gap-4 text-[10px] text-zinc-400">
          <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-emerald-500/70" aria-hidden="true" />Tag presente</span>
          <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-amber-400/80" aria-hidden="true" />Reservada</span>
          <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm border border-rose-500/60" aria-hidden="true" />Vacío</span>
        </div>
      </Card>

      <SectionLabel
        right={
          <button type="button" onClick={() => setVerTodas((v) => !v)} className="text-[11px] text-zinc-400 hover:text-zinc-100">
            {verTodas ? 'Ver menos' : `Ver las ${state.llaves.length}`}
          </button>
        }
      >
        Llaves · rfid_uid
      </SectionLabel>
      <Card className="overflow-hidden">
        <ul className="divide-y divide-zinc-800">
          {llaves.map((l) => (
            <LlaveRow key={`${l.id}-${l.rfid_uid}`} llave={l} />
          ))}
        </ul>
      </Card>

      <SectionLabel>Usuarios</SectionLabel>
      <Card className="overflow-hidden">
        <ul className="divide-y divide-zinc-800">
          {state.usuarios
            .filter((u) => u.rol === 'profesor')
            .map((u) => (
              <li key={u.id} className="flex items-center gap-3 px-3 py-2.5">
                <span className="flex size-8 items-center justify-center rounded-full bg-zinc-800 text-[11px] font-semibold">
                  {u.nombre.split(' ').map((p) => p[0]).join('')}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium">{u.nombre}</p>
                  <p className={cn('text-[10px]', u.activo ? 'text-emerald-400' : 'text-rose-400')}>
                    {u.activo ? 'Habilitado' : 'Bloqueado'}
                  </p>
                </div>
                <Switch
                  checked={u.activo}
                  onChange={() => dispatch({ type: 'TOGGLE_USUARIO', usuarioId: u.id })}
                  label={`${u.activo ? 'Bloquear' : 'Habilitar'} a ${u.nombre}`}
                />
              </li>
            ))}
        </ul>
      </Card>
    </div>
  )
}

export function AdminView() {
  const { state, dispatch } = useLlaveTrack()
  const [tab, setTab] = useState<Tab>('faltantes')
  const faltantes = state.prestamos.filter((p) => p.devuelto_en === null).length
  const titulos: Record<Tab, string> = {
    faltantes: 'Faltantes / En uso',
    historial: 'Historial general',
    dispositivo: 'Dispositivo y llaves',
  }

  return (
    <PhoneFrame
      bottomNav={
        <BottomNav<Tab>
          value={tab}
          onChange={setTab}
          items={[
            { value: 'faltantes', label: 'Faltantes', icon: <KeyRound className="size-5" aria-hidden="true" />, badge: faltantes },
            { value: 'historial', label: 'Historial', icon: <History className="size-5" aria-hidden="true" /> },
            { value: 'dispositivo', label: 'Dispositivo', icon: <Cpu className="size-5" aria-hidden="true" /> },
          ]}
        />
      }
    >
      <header className="sticky top-0 z-20 bg-zinc-950/90 px-4 pb-3 pt-2 backdrop-blur">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">Preceptoría · Admin</p>
            <h1 className="truncate text-lg font-semibold tracking-tight">{titulos[tab]}</h1>
          </div>
          <div className="flex items-center gap-1.5">
            <CarruselPill online={state.dispositivo.online} />
            <button
              type="button"
              onClick={() => dispatch({ type: 'SET_VISTA', vista: 'login' })}
              className="rounded-lg border border-zinc-800 p-1.5 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
              aria-label="Cerrar sesión"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </header>
      {!state.dispositivo.online && (
        <div className="px-4 pb-4">
          <OfflineBanner />
        </div>
      )}
      {tab === 'faltantes' && <FaltantesTab />}
      {tab === 'historial' && <HistorialTab />}
      {tab === 'dispositivo' && <DispositivoTab />}
    </PhoneFrame>
  )
}
