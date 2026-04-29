import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      <nav className="flex items-center justify-between px-6 py-5 border-b border-white/5">
        <div style={{ fontFamily: 'system-ui, sans-serif', fontWeight: 700, fontSize: '18px', letterSpacing: '2px', userSelect: 'none' }}>
          <span style={{ color: '#F7931A' }}>S</span>
          <span style={{ color: '#f0f0f0' }}>ATSWORTH</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/auth/login" className="text-sm text-white/60 hover:text-white transition-colors px-4 py-2">
            Log in
          </Link>
          <Link href="/auth/signup" className="text-sm bg-[#F7931A] text-black font-semibold px-4 py-2 rounded-lg hover:bg-[#e07a05] transition-colors">
            Get started
          </Link>
        </div>
      </nav>

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
          <Link href="/auth/signup"
            className="bg-[#F7931A] text-black font-bold px-8 py-4 rounded-xl text-lg hover:bg-[#e07a05] transition-colors">
            Start tracking free
          </Link>
          <Link href="/guest"
            className="border border-white/15 text-white/70 hover:text-white hover:border-white/30 font-medium px-8 py-4 rounded-xl text-lg transition-colors">
            Try without account →
          </Link>
        </div>

        <p className="text-white/20 text-xs mt-6">
          Guest mode stores data on your device only · No email required
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-px border-t border-white/5 bg-white/5">
        {[
          {
            icon: '₿',
            title: 'BTC-denominated net worth',
            desc: 'When BTC price rises, your BTC-denominated worth falls — the honest measure of accumulation.',
          },
          {
            icon: '🔒',
            title: 'Privacy first',
            desc: 'Guest mode needs zero signup. Cloud accounts use row-level security — your data is yours only.',
          },
          {
            icon: '📊',
            title: 'Global BTC percentile',
            desc: 'See exactly where your Bitcoin wealth ranks among all holders on Earth.',
          },
        ].map(f => (
          <div key={f.title} className="bg-[#0a0a0a] p-8">
            <div className="text-3xl mb-4">{f.icon}</div>
            <div className="font-semibold text-white mb-2">{f.title}</div>
            <div className="text-white/40 text-sm leading-relaxed">{f.desc}</div>
          </div>
        ))}
      </div>

      <footer className="px-6 py-6 border-t border-white/5 text-center text-white/20 text-xs">
        © {new Date().getFullYear()} Satsworth — Track your wealth in Bitcoin
      </footer>
    </main>
  )
}
