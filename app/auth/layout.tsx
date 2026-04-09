import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      <nav className="px-6 py-5 border-b border-white/5">
        <Link href="/" className="flex items-center gap-3 w-fit">
          <div className="w-8 h-8 rounded-full bg-[#F7931A] flex items-center justify-center font-mono font-bold text-sm text-black">
            ₿
          </div>
          <span className="text-lg font-bold tracking-tight text-white">Bitworth</span>
        </Link>
      </nav>
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        {children}
      </div>
    </div>
  )
}
