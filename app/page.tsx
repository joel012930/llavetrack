'use client'

import dynamic from 'next/dynamic'

const LlaveTrackApp = dynamic(() => import('@/components/llavetrack/llavetrack-app'), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-dvh items-center justify-center font-mono text-xs uppercase tracking-[0.2em] text-zinc-600">
      Conectando con carrusel-01…
    </div>
  ),
})

export default function Page() {
  return <LlaveTrackApp />
}
