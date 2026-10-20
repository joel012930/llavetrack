'use client'

import { AdminView } from './admin-view'
import { DemoToolbar } from './demo-toolbar'
import { LoginScreen } from './login-screen'
import { PhoneFrame } from './phone-frame'
import { LlaveTrackProvider, useLlaveTrack } from './store'
import { TeacherView } from './teacher-view'

function Pantalla() {
  const { state } = useLlaveTrack()
  if (state.vista === 'admin') return <AdminView />
  if (state.vista === 'profesor') return <TeacherView />
  return (
    <PhoneFrame>
      <LoginScreen />
    </PhoneFrame>
  )
}

export default function LlaveTrackApp() {
  return (
    <LlaveTrackProvider>
      <div className="flex min-h-dvh flex-col">
        <DemoToolbar />
        <main className="flex flex-1 items-start justify-center overflow-x-auto px-4 py-10">
          <Pantalla />
        </main>
      </div>
    </LlaveTrackProvider>
  )
}
