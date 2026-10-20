import { KeyRound } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Logo({ size = 'md' }: { size?: 'sm' | 'lg' | 'md' }) {
  const box = size === 'lg' ? 'size-16 rounded-2xl' : size === 'md' ? 'size-10 rounded-xl' : 'size-8 rounded-lg'
  const icon = size === 'lg' ? 'size-7' : size === 'md' ? 'size-5' : 'size-4'
  return (
    <span
      className={cn(
        'relative inline-flex items-center justify-center border border-zinc-700 bg-gradient-to-b from-zinc-800 to-zinc-900 text-zinc-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]',
        box,
      )}
      aria-hidden="true"
    >
      <KeyRound className={cn(icon, '-rotate-45')} strokeWidth={2} />
      <span className="absolute -right-1 -top-1 flex items-center">
        <span className="size-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
      </span>
      {size === 'lg' && (
        <>
          <span className="absolute inset-[-8px] rounded-[22px] border border-emerald-500/20" />
          <span className="absolute inset-[-16px] rounded-[28px] border border-emerald-500/10" />
        </>
      )}
    </span>
  )
}
