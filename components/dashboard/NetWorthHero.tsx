'use client'

import { formatBtc, formatUsd, formatBtcChange } from '@/lib/utils'
import { NetWorthSnapshot } from '@/types'

interface Props {
  netWorthBtc: number
  netWorthUsd: number
  totalAssetsUsd: number
  totalLiabilitiesUsd: number
  btcPrice: number
  snapshots: NetWorthSnapshot[]
}

export function NetWorthHero({
  netWorthBtc,
  netWorthUsd,
  totalAssetsUsd,
  totalLiabilitiesUsd,
  btcPrice,
  snapshots,
}: Props) {
  // Calculate change vs oldest snapshot in last 30 days
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const recentSnaps = snapshots.filter(
    s => new Date(s.created_at) >= thirtyDaysAgo
  )
  const oldest = recentSnaps[0]
  const btcChange = oldest
    ? netWorthBtc - Number(oldest.net_worth_btc)
    : null
  const usdChange = oldest
    ? netWorthUsd - Number(oldest.net_worth_usd)
    : null

  const isPositive = btcChange !== null && btcChange >= 0

  return (
    <div className="relative bg-[#111] border border-white/5 rounded-2xl p-6 overflow-hidden">
      {/* Subtle BTC glow accent */}
      <div className="absolute -top-16 -right-16 w-48 h-48 bg-[#F7931A]/5 rounded-full blur-2xl pointer-events-none" />

      <div className="relative">
        <div className="text-xs text-white/30 uppercase tracking-widest mb-3 font-medium">
          Total net worth
        </div>

        {/* Main BTC figure */}
        <div className="font-mono text-5xl sm:text-6xl font-bold text-[#F7931A] leading-none mb-2 tracking-tight">
          ₿ {netWorthBtc.toFixed(4)}
        </div>

        {/* USD equivalent */}
        <div className="text-white/30 text-lg mb-5">
          ≈ {formatUsd(netWorthUsd)} USD
        </div>

        {/* Change badge */}
        {btcChange !== null && (
          <div className="flex items-center gap-3 mb-5">
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
              isPositive
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-red-500/10 text-red-400 border border-red-500/20'
            }`}>
              <span>{isPositive ? '↑' : '↓'}</span>
              <span className="font-mono">{formatBtcChange(btcChange)}</span>
              <span className="text-xs opacity-70">30d</span>
            </div>
            {usdChange !== null && (
              <span className="text-white/20 text-sm">
                {usdChange >= 0 ? '+' : ''}{formatUsd(usdChange)} USD
              </span>
            )}
          </div>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Gross assets', value: formatUsd(totalAssetsUsd), sub: null },
            { label: 'Total debt', value: formatUsd(totalLiabilitiesUsd), sub: null, red: true },
            { label: 'BTC price', value: `$${Math.round(btcPrice).toLocaleString()}`, sub: null },
          ].map(stat => (
            <div key={stat.label} className="bg-white/[0.03] rounded-xl px-3 py-2.5">
              <div className="text-xs text-white/25 mb-1">{stat.label}</div>
              <div className={`text-sm font-mono font-bold ${stat.red ? 'text-red-400' : 'text-white/80'}`}>
                {stat.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
