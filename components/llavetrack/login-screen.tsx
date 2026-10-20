'use client'

import { useState, type FormEvent } from 'react'
import { ArrowRight, Eye, EyeOff, Lock, Mail, X } from 'lucide-react'
import { Logo } from './logo'
import { useLlaveTrack } from './store'

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.1V7.06H2.18A11 11 0 0 0 1 12c0 1.77.43 3.45 1.18 4.94l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
      />
    </svg>
  )
}

function RecuperarModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState('')
  const [enviado, setEnviado] = useState(false)
  return (
    <div className="absolute inset-0 z-30 flex items-end bg-black/70 backdrop-blur-sm animate-in fade-in" role="dialog" aria-modal="true" aria-labelledby="recuperar-titulo">
      <div className="w-full rounded-t-3xl border-t border-zinc-800 bg-zinc-900 p-5 pb-8 animate-in slide-in-from-bottom-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 id="recuperar-titulo" className="text-base font-semibold">Recuperar clave</h2>
          <button type="button" onClick={onClose} className="rounded-md p-1 text-zinc-400 hover:text-zinc-100" aria-label="Cerrar">
            <X className="size-4" />
          </button>
        </div>
        {enviado ? (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-zinc-400">
              Enviamos un enlace a <span className="text-zinc-100">{email}</span>. El token vence en 30 minutos.
            </p>
            <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-3">
              <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">recuperacion_clave.token</p>
              <p className="mt-1 break-all font-mono text-xs text-emerald-400">rk_7f3a9c21e8b04d6fa1c2</p>
            </div>
            <button type="button" onClick={onClose} className="h-10 rounded-lg bg-zinc-100 text-sm font-medium text-zinc-900 hover:bg-white">
              Entendido
            </button>
          </div>
        ) : (
          <form
            className="flex flex-col gap-3"
            onSubmit={(e) => {
              e.preventDefault()
              if (email) setEnviado(true)
            }}
          >
            <p className="text-sm text-zinc-400">Ingresá tu email institucional y te enviaremos un token de recuperación.</p>
            <label htmlFor="rec-email" className="sr-only">Email</label>
            <input
              id="rec-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nombre@escuela.edu.ar"
              className="h-10 rounded-lg border border-zinc-800 bg-zinc-950 px-3 text-sm placeholder:text-zinc-600 focus:border-zinc-600 focus:outline-none"
            />
            <button type="submit" className="h-10 rounded-lg bg-zinc-100 text-sm font-medium text-zinc-900 hover:bg-white">
              Enviar token
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export function LoginScreen() {
  const { dispatch } = useLlaveTrack()
  const [email, setEmail] = useState('jperez@escuela.edu.ar')
  const [password, setPassword] = useState('')
  const [verClave, setVerClave] = useState(false)
  const [recuperar, setRecuperar] = useState(false)

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    dispatch({ type: 'SET_VISTA', vista: email.toLowerCase().includes('precep') || email.includes('admin') ? 'admin' : 'profesor' })
  }

  return (
    <div className="relative flex min-h-full flex-col px-6 pb-6 pt-10">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.12),transparent_70%)]"
        aria-hidden="true"
      />
      <div className="relative flex flex-col items-center text-center">
        <Logo size="lg" />
        <h1 className="mt-8 text-2xl font-semibold tracking-tight">LlaveTrack</h1>
        <p className="mt-1.5 text-sm text-zinc-400">Control automatizado de llaves de aulas</p>
        <p className="mt-3 rounded-full border border-zinc-800 bg-zinc-900 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-zinc-500">
          ESP32 · RFID · 30 slots
        </p>
      </div>

      <div className="relative mt-10 flex flex-col gap-4">
        <button
          type="button"
          onClick={() => dispatch({ type: 'SET_VISTA', vista: 'profesor' })}
          className="flex h-11 items-center justify-center gap-2.5 rounded-xl bg-zinc-50 text-sm font-medium text-zinc-900 transition-colors hover:bg-white"
        >
          <GoogleIcon />
          Continuar con Google
        </button>

        <div className="flex items-center gap-3">
          <span className="h-px flex-1 bg-zinc-800" />
          <span className="text-[11px] text-zinc-500">o ingresá con tu cuenta institucional</span>
          <span className="h-px flex-1 bg-zinc-800" />
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="login-email" className="text-xs font-medium text-zinc-400">Email</label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500" aria-hidden="true" />
              <input
                id="login-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 w-full rounded-xl border border-zinc-800 bg-zinc-900/90 pl-10 pr-3 text-sm placeholder:text-zinc-600 focus:border-zinc-600 focus:outline-none"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="login-pass" className="text-xs font-medium text-zinc-400">Contraseña</label>
              <button type="button" onClick={() => setRecuperar(true)} className="text-xs text-zinc-400 underline-offset-4 hover:text-zinc-100 hover:underline">
                ¿Olvidaste tu clave?
              </button>
            </div>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500" aria-hidden="true" />
              <input
                id="login-pass"
                type={verClave ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-11 w-full rounded-xl border border-zinc-800 bg-zinc-900/90 pl-10 pr-10 text-sm placeholder:text-zinc-600 focus:border-zinc-600 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setVerClave((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-zinc-500 hover:text-zinc-200"
                aria-label={verClave ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {verClave ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            className="mt-2 flex h-11 items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800 text-sm font-medium text-zinc-100 transition-colors hover:bg-zinc-700"
          >
            Iniciar Sesión
            <ArrowRight className="size-4" aria-hidden="true" />
          </button>
        </form>
      </div>

      <p className="relative mt-auto pt-8 text-center text-[11px] text-zinc-600">
        Tip demo: usá <span className="font-mono text-zinc-400">preceptoria@…</span> para entrar como Admin
      </p>

      {recuperar && <RecuperarModal onClose={() => setRecuperar(false)} />}
    </div>
  )
}
