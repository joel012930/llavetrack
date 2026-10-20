export type EstadoLlave = 'DISPONIBLE' | 'RESERVADA' | 'PRESTADA'
export type Rol = 'profesor' | 'admin'
export type Vista = 'login' | 'profesor' | 'admin'
export type EstadoReserva = 'PENDIENTE' | 'COMPLETADA' | 'CANCELADA' | 'EXPIRADA'

export interface Usuario {
  id: string
  nombre: string
  email: string
  telefono: string
  rol: Rol
  activo: boolean
  google_sub: string | null
}

export interface Llave {
  id: string
  aula_nombre: string
  piso: 1 | 2 | 3
  rfid_uid: string
  slot: number
  estado: EstadoLlave
  poseedor_id: string | null
  hora_retiro: number | null
}

export interface Reserva {
  id: string
  llave_id: string
  usuario_id: string
  codigo: string
  creada_en: number
  expira_en: number
  estado: EstadoReserva
}

export interface Prestamo {
  id: string
  llave_id: string
  usuario_id: string
  retirado_en: number
  devuelto_en: number | null
}

export interface Dispositivo {
  device_id: string
  nombre: string
  online: boolean
  ultimo_contacto: number
  slots_totales: number
  posicion_actual: number
  firmware: string
}

export interface Toast {
  id: string
  title: string
  description?: string
  tone: 'success' | 'warning' | 'error' | 'info'
}

export interface AppState {
  vista: Vista
  usuarios: Usuario[]
  llaves: Llave[]
  reservas: Reserva[]
  prestamos: Prestamo[]
  dispositivo: Dispositivo
  devolucion_pendiente: string | null
  toasts: Toast[]
  now: number
}

export const PROFESOR_ACTUAL_ID = 'u-juan'
export const RESERVA_DURACION_MS = 5 * 60 * 1000

const MIN = 60 * 1000
const HORA = 60 * MIN
const DIA = 24 * HORA

const UIDS_FIJOS: Record<string, string> = {
  '204': 'E4F92A11',
  '105': '9B3C10AA',
  '301': '7D2E88FF',
}

function uidDesdeAula(aula: string): string {
  let h = 2166136261
  for (const c of `llave-${aula}`) {
    h ^= c.charCodeAt(0)
    h = Math.imul(h, 16777619)
  }
  return (h >>> 0).toString(16).toUpperCase().padStart(8, '0')
}

export function crearAulas(): Llave[] {
  const llaves: Llave[] = []
  let slot = 1
  for (const piso of [1, 2, 3] as const) {
    for (const sufijo of ['01', '02', '03', '04', '05', '11', '12', '13', '14', '15']) {
      const nombre = `${piso}${sufijo}`
      llaves.push({
        id: `k-${nombre}`,
        aula_nombre: nombre,
        piso,
        rfid_uid: UIDS_FIJOS[nombre] ?? uidDesdeAula(nombre),
        slot,
        estado: 'DISPONIBLE',
        poseedor_id: null,
        hora_retiro: null,
      })
      slot++
    }
  }
  return llaves
}

export function crearEstadoInicial(now: number): AppState {
  const usuarios: Usuario[] = [
    {
      id: PROFESOR_ACTUAL_ID,
      nombre: 'Juan Pérez',
      email: 'jperez@escuela.edu.ar',
      telefono: '+54 9 11 4521-3390',
      rol: 'profesor',
      activo: true,
      google_sub: '108233457712',
    },
    {
      id: 'u-maria',
      nombre: 'María López',
      email: 'mlopez@escuela.edu.ar',
      telefono: '+54 9 11 6012-8874',
      rol: 'profesor',
      activo: true,
      google_sub: null,
    },
    {
      id: 'u-pedro',
      nombre: 'Pedro García',
      email: 'pgarcia@escuela.edu.ar',
      telefono: '+54 9 11 3388-1022',
      rol: 'profesor',
      activo: true,
      google_sub: '104552190033',
    },
    {
      id: 'u-ana',
      nombre: 'Ana Gómez',
      email: 'agomez@escuela.edu.ar',
      telefono: '+54 9 11 5590-4417',
      rol: 'profesor',
      activo: false,
      google_sub: null,
    },
    {
      id: 'u-admin',
      nombre: 'Preceptoría',
      email: 'preceptoria@escuela.edu.ar',
      telefono: '+54 9 11 4000-0000',
      rol: 'admin',
      activo: true,
      google_sub: null,
    },
  ]

  const retiroMaria = now - (2 * HORA + 15 * MIN)
  const llaves = crearAulas().map((l) =>
    l.aula_nombre === '105'
      ? { ...l, estado: 'PRESTADA' as const, poseedor_id: 'u-maria', hora_retiro: retiroMaria }
      : l,
  )

  const prestamos: Prestamo[] = [
    { id: 'p-1', llave_id: 'k-105', usuario_id: 'u-maria', retirado_en: retiroMaria, devuelto_en: null },
    {
      id: 'p-2',
      llave_id: 'k-301',
      usuario_id: 'u-pedro',
      retirado_en: now - 4 * HORA,
      devuelto_en: now - 4 * HORA + 85 * MIN,
    },
    {
      id: 'p-3',
      llave_id: 'k-213',
      usuario_id: 'u-ana',
      retirado_en: now - 6 * HORA,
      devuelto_en: now - 5 * HORA,
    },
    {
      id: 'p-4',
      llave_id: 'k-204',
      usuario_id: PROFESOR_ACTUAL_ID,
      retirado_en: now - DIA - 3 * HORA,
      devuelto_en: now - DIA - 1 * HORA,
    },
    {
      id: 'p-5',
      llave_id: 'k-112',
      usuario_id: PROFESOR_ACTUAL_ID,
      retirado_en: now - DIA - 7 * HORA,
      devuelto_en: now - DIA - 5 * HORA - 20 * MIN,
    },
    {
      id: 'p-6',
      llave_id: 'k-311',
      usuario_id: PROFESOR_ACTUAL_ID,
      retirado_en: now - 2 * DIA - 4 * HORA,
      devuelto_en: now - 2 * DIA - 2 * HORA - 10 * MIN,
    },
  ]

  return {
    vista: 'profesor',
    usuarios,
    llaves,
    reservas: [],
    prestamos,
    dispositivo: {
      device_id: 'carrusel-01',
      nombre: 'Carrusel-01',
      online: true,
      ultimo_contacto: now - 2000,
      slots_totales: 30,
      posicion_actual: 1,
      firmware: 'v1.4.2',
    },
    devolucion_pendiente: null,
    toasts: [],
    now,
  }
}

export function formatHora(ts: number): string {
  return new Date(ts).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false })
}

export function formatFecha(ts: number, now: number): string {
  const d = new Date(ts)
  const hoy = new Date(now)
  const ayer = new Date(now - DIA)
  if (d.toDateString() === hoy.toDateString()) return 'Hoy'
  if (d.toDateString() === ayer.toDateString()) return 'Ayer'
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })
}

export function formatDuracion(ms: number): string {
  const totalMin = Math.max(0, Math.floor(ms / MIN))
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  if (h === 0) return `${m}m`
  return `${h}h ${m.toString().padStart(2, '0')}m`
}

export function formatCuentaRegresiva(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000))
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

export function generarCodigo(): string {
  return Math.floor(1000 + Math.random() * 9000).toString()
}
