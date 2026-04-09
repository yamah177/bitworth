'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, RefreshCw } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { CurrencySelector } from '@/components/ui/CurrencySelector'
import { CurrencyCode, formatFiat } from '@/lib/currencies'

interface Props {
  userEmail: string
  btcPrice: number
  currency: CurrencyCode
  onCurrencyChange: (code: CurrencyCode) => void
  onRefresh: () => void
  refreshing: boolean
}

export function DashboardNav({ userEmail, btcPrice, currency, onCurrencyChange, onRefresh, refreshing }: Props) {
  const router = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)
  const [priceFlash, setPriceFlash] = useState(false)
  const [prevPrice, setPrevPrice] = useState(btcPrice)

  useEffect(() => {
    if (btcPrice !== prevPrice && btcPrice > 0) {
      setPriceFlash(true)
      setPrevPrice(btcPrice)
      setTimeout(() => setPriceFlash(false), 800)
    }
  }, [btcPrice, prevPrice])

  async function handleLogout() {
    setLoggingOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const initials = userEmail?.slice(0, 2).toUpperCase() ?? '??'

  return (
    <nav className="sticky top-0 z-40 bg-[#0a0a0a]/90 backdrop-blur-sm border-b border-white/5">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">

        <div style={{ fontFamily: 'system-ui, sans-serif', fontWeight: 700, fontSize: '20px', letterSpacing: '2px', userSelect: 'none' }}>
          <span style={{ color: '#F7931A' }}>S</span>
          <span style={{ color: '#f0f0f0' }}>ATSWORTH</span>
        </div>

        <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-mono transition-colors duration-300 ${
          priceFlash
            ? 'bg-[#F7931A]/20 border-[#F7931A]/40 text-[#F7931A]'
            : 'bg-white/5 border-white/10 text-white/50'
        }`}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#F7931A] inline-block"></span>
          1 BTC = {btcPrice > 0 ? formatFiat(btcPrice, currency) : '...'}
        </div>

        <div className="flex items-center gap-2">
          <CurrencySelector value={currency} onChange={onCurrencyChange} />
          <button onClick={onRefresh} disabled={refreshing}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-white/30 hover:text-white hover:bg-white/5 transition-colors">
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          </button>
          <div className="w-7 h-7 rounded-full bg-[#F7931A]/15 flex items-center justify-center text-[#F7931A] text-xs font-bold">
            {initials}
          </div>
          <button onClick={handleLogout} disabled={loggingOut}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-white/30 hover:text-white hover:bg-white/5 transition-colors">
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </nav>
  )
}
