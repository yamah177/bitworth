import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#F7931A] flex items-center justify-center font-mono font-bold text-sm text-black">
            ₿
          </div>
          <span className="text-lg font-bold tracking-tight">Satsworth</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/auth/login"
            className="text-sm text-white/60 hover:text-white transition-colors px-4 py-2"
          >
            Log in
          </Link>
          <Link
            href="/auth/signup"
            className="text-sm bg-[#F7931A] text-black font-semibold px-4 py-2 rounded-lg hover:bg-[#e07a05] transition-colors"
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24">
        <div className="inline-flex items-center gap-2 bg-[#F7931A]/10 border border-[#F7931A]/20 rounded-full px-4 py-1.5 text-[#F7931A] text-sm font-medium mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-[#F7931A] inline-block"></span>
          Net worth in hard money
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight">
          Your wealth,<br />
          <span className="text-[#F7931A]">priced in Bitcoin</span>
        </h1>

        <p className="text-white/50 text-lg md:text-xl max-w-xl mb-12 leading-relaxed">
          Track retirement accounts, real estate, brokerage accounts, precious metals, 
          and debt — all denominated in BTC. See if you&apos;re actually getting richer 
          or just keeping up with inflation.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <Link
            href="/auth/signup"
            className="bg-[#F7931A] text-black font-bold px-8 py-4 rounded-xl text-lg hover:bg-[#e07a05] transition-colors"
          >
            Start tracking free
          </Link>
          <Link
            href="/auth/login"
            className="text-white/50 hover:text-white transition-colors text-sm"
          >
            Already have an account? Log in →
          </Link>
        </div>
      </div>

      {/* Feature grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-px border-t border-white/5 bg-white/5">
        {[
          {
            icon: '₿',
            title: 'BTC-denominated net worth',
            desc: 'When BTC price rises, your BTC-denominated worth falls — the honest measure of accumulation.',
          },
          {
            icon: '📊',
            title: 'Historical tracking',
            desc: 'Daily snapshots show your BTC wealth over time. Did you stack or slide?',
          },
          {
            icon: '🔒',
            title: 'Secure by design',
            desc: 'Manual entry only. No bank credentials stored. Row-level security on every record.',
          },
        ].map((f) => (
          <div key={f.title} className="bg-[#0a0a0a] p-8">
            <div className="text-3xl mb-4">{f.icon}</div>
            <div className="font-semibold text-white mb-2">{f.title}</div>
            <div className="text-white/40 text-sm leading-relaxed">{f.desc}</div>
          </div>
        ))}
      </div>

      <footer className="px-6 py-6 border-t border-white/5 text-center text-white/20 text-xs">
        © {new Date().getFullYear()} Bitworth — Track your wealth in Bitcoin
      </footer>
    </main>
  )
}
