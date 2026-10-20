'use client'

import { createContext, useContext, useEffect, useReducer, type Dispatch, type ReactNode } from 'react'
import {
  crearEstadoInicial,
  PROFESOR_ACTUAL_ID,
  RESERVA_DURACION_MS,
  type AppState,
  type Toast,
  type Vista,
} from '@/lib/llavetrack'

export type Action =
  | { type: 'TICK'; now: number }
  | { type: 'SET_VISTA'; vista: Vista }
  | { type: 'SET_ONLINE'; online: boolean }
  | { type: 'RESERVAR'; llaveId: string; codigo: string }
  | { type: 'CANCELAR_RESERVA'; reservaId: string }
  | { type: 'HW_RETIRAR' }
  | { type: 'SOLICITAR_DEVOLUCION'; llaveId: string }
  | { type: 'CANCELAR_DEVOLUCION' }
  | { type: 'HW_DEVOLVER' }
  | { type: 'MOVER_CARRUSEL'; slot: number }
  | { type: 'TOAST'; toast: Omit<Toast, 'id'> }
  | { type: 'DISMISS_TOAST'; id: string }
  | { type: 'ACTUALIZAR_RFID'; llaveId: string; uid: string }
  | { type: 'TOGGLE_USUARIO'; usuarioId: string }

let toastSeq = 0
function conToast(state: AppState, toast: Omit<Toast, 'id'>): AppState {
  toastSeq += 1
  return { ...state, toasts: [...state.toasts.slice(-2), { ...toast, id: `t-${state.now}-${toastSeq}` }] }
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'TICK': {
      let next: AppState = { ...state, now: action.now }
      if (next.dispositivo.online && action.now - next.dispositivo.ultimo_contacto > 4000) {
        next = { ...next, dispositivo: { ...next.dispositivo, ultimo_contacto: action.now } }
      }
      const vencida = next.reservas.find((r) => r.estado === 'PENDIENTE' && r.expira_en <= action.now)
      if (vencida) {
        const llave = next.llaves.find((l) => l.id === vencida.llave_id)
        next = {
          ...next,
          reservas: next.reservas.map((r) => (r.id === vencida.id ? { ...r, estado: 'EXPIRADA' } : r)),
          llaves: next.llaves.map((l) =>
            l.id === vencida.llave_id ? { ...l, estado: 'DISPONIBLE', poseedor_id: null } : l,
          ),
        }
        next = conToast(next, {
          tone: 'warning',
          title: 'Reserva expirada',
          description: `El código del Aula ${llave?.aula_nombre} venció. La llave volvió a estar disponible.`,
        })
      }
      return next
    }
    case 'SET_VISTA':
      return { ...state, vista: action.vista }
    case 'SET_ONLINE':
      return {
        ...state,
        dispositivo: {
          ...state.dispositivo,
          online: action.online,
          ultimo_contacto: action.online ? state.now : state.dispositivo.ultimo_contacto,
        },
      }
    case 'RESERVAR': {
      const llave = state.llaves.find((l) => l.id === action.llaveId)
      if (!llave || llave.estado !== 'DISPONIBLE' || !state.dispositivo.online) return state
      if (state.reservas.some((r) => r.usuario_id === PROFESOR_ACTUAL_ID && r.estado === 'PENDIENTE')) return state
      const next: AppState = {
        ...state,
        llaves: state.llaves.map((l) =>
          l.id === llave.id ? { ...l, estado: 'RESERVADA', poseedor_id: PROFESOR_ACTUAL_ID } : l,
        ),
        reservas: [
          ...state.reservas,
          {
            id: `r-${state.now}`,
            llave_id: llave.id,
            usuario_id: PROFESOR_ACTUAL_ID,
            codigo: action.codigo,
            creada_en: state.now,
            expira_en: state.now + RESERVA_DURACION_MS,
            estado: 'PENDIENTE',
          },
        ],
      }
      return conToast(next, {
        tone: 'info',
        title: `Aula ${llave.aula_nombre} reservada`,
        description: 'Tenés 5 minutos para retirarla del carrusel.',
      })
    }
    case 'CANCELAR_RESERVA': {
      const reserva = state.reservas.find((r) => r.id === action.reservaId)
      if (!reserva || reserva.estado !== 'PENDIENTE') return state
      return conToast(
        {
          ...state,
          reservas: state.reservas.map((r) => (r.id === reserva.id ? { ...r, estado: 'CANCELADA' } : r)),
          llaves: state.llaves.map((l) =>
            l.id === reserva.llave_id ? { ...l, estado: 'DISPONIBLE', poseedor_id: null } : l,
          ),
        },
        { tone: 'info', title: 'Reserva cancelada' },
      )
    }
    case 'MOVER_CARRUSEL':
      return { ...state, dispositivo: { ...state.dispositivo, posicion_actual: action.slot } }
    case 'HW_RETIRAR': {
      const reserva = state.reservas.find((r) => r.estado === 'PENDIENTE')
      if (!reserva || !state.dispositivo.online) return state
      const llave = state.llaves.find((l) => l.id === reserva.llave_id)
      return conToast(
        {
          ...state,
          reservas: state.reservas.map((r) => (r.id === reserva.id ? { ...r, estado: 'COMPLETADA' } : r)),
          llaves: state.llaves.map((l) =>
            l.id === reserva.llave_id
              ? { ...l, estado: 'PRESTADA', poseedor_id: reserva.usuario_id, hora_retiro: state.now }
              : l,
          ),
          prestamos: [
            ...state.prestamos,
            {
              id: `p-${state.now}`,
              llave_id: reserva.llave_id,
              usuario_id: reserva.usuario_id,
              retirado_en: state.now,
              devuelto_en: null,
            },
          ],
        },
        {
          tone: 'success',
          title: `Llave ${llave?.aula_nombre} retirada`,
          description: 'El lector RFID confirmó el retiro. Préstamo registrado.',
        },
      )
    }
    case 'SOLICITAR_DEVOLUCION': {
      const llave = state.llaves.find((l) => l.id === action.llaveId)
      if (!llave) return state
      if (!state.dispositivo.online) {
        return conToast(state, {
          tone: 'error',
          title: 'Carrusel desconectado',
          description: 'No se puede iniciar la devolución sin conexión.',
        })
      }
      return conToast(
        {
          ...state,
          devolucion_pendiente: llave.id,
          dispositivo: { ...state.dispositivo, posicion_actual: llave.slot },
        },
        {
          tone: 'info',
          title: `Hueco #${llave.slot} posicionado`,
          description: 'Colocá la llave en la ventana del carrusel.',
        },
      )
    }
    case 'CANCELAR_DEVOLUCION':
      return { ...state, devolucion_pendiente: null }
    case 'HW_DEVOLVER': {
      const llaveId = state.devolucion_pendiente
      if (!llaveId || !state.dispositivo.online) return state
      const llave = state.llaves.find((l) => l.id === llaveId)
      return conToast(
        {
          ...state,
          devolucion_pendiente: null,
          llaves: state.llaves.map((l) =>
            l.id === llaveId ? { ...l, estado: 'DISPONIBLE', poseedor_id: null, hora_retiro: null } : l,
          ),
          prestamos: state.prestamos.map((p) =>
            p.llave_id === llaveId && p.devuelto_en === null ? { ...p, devuelto_en: state.now } : p,
          ),
        },
        {
          tone: 'success',
          title: `Llave ${llave?.aula_nombre} devuelta`,
          description: `Tag ${llave?.rfid_uid} detectado en el slot #${llave?.slot}.`,
        },
      )
    }
    case 'TOAST':
      return conToast(state, action.toast)
    case 'DISMISS_TOAST':
      return { ...state, toasts: state.toasts.filter((t) => t.id !== action.id) }
    case 'ACTUALIZAR_RFID':
      return conToast(
        {
          ...state,
          llaves: state.llaves.map((l) => (l.id === action.llaveId ? { ...l, rfid_uid: action.uid } : l)),
        },
        { tone: 'success', title: 'Asociación RFID actualizada', description: `Nuevo UID: ${action.uid}` },
      )
    case 'TOGGLE_USUARIO': {
      const usuario = state.usuarios.find((u) => u.id === action.usuarioId)
      if (!usuario) return state
      return conToast(
        {
          ...state,
          usuarios: state.usuarios.map((u) => (u.id === usuario.id ? { ...u, activo: !u.activo } : u)),
        },
        {
          tone: usuario.activo ? 'warning' : 'success',
          title: usuario.activo ? `${usuario.nombre} bloqueado` : `${usuario.nombre} habilitado`,
        },
      )
    }
    default:
      return state
  }
}

const LlaveTrackContext = createContext<{ state: AppState; dispatch: Dispatch<Action> } | null>(null)

export function LlaveTrackProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, () => crearEstadoInicial(Date.now()))

  useEffect(() => {
    const id = setInterval(() => dispatch({ type: 'TICK', now: Date.now() }), 1000)
    return () => clearInterval(id)
  }, [])

  return <LlaveTrackContext.Provider value={{ state, dispatch }}>{children}</LlaveTrackContext.Provider>
}

export function useLlaveTrack() {
  const ctx = useContext(LlaveTrackContext)
  if (!ctx) throw new Error('useLlaveTrack debe usarse dentro de LlaveTrackProvider')
  return ctx
}

export function useDerivados() {
  const { state } = useLlaveTrack()
  const usuarioPorId = (id: string | null) => state.usuarios.find((u) => u.id === id) ?? null
  const llavePorId = (id: string) => state.llaves.find((l) => l.id === id) ?? null
  const reservaPendiente = state.reservas.find((r) => r.estado === 'PENDIENTE') ?? null
  const prestadas = state.llaves.filter((l) => l.estado === 'PRESTADA')
  return { usuarioPorId, llavePorId, reservaPendiente, prestadas }
}
