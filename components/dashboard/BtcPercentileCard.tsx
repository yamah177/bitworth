'use client'

const DISTRIBUTION = [
  { min: 0,        max: 0.00001,  addresses: 3637113  },
  { min: 0.00001,  max: 0.0001,   addresses: 9669214  },
  { min: 0.0001,   max: 0.001,    addresses: 12033220 },
  { min: 0.001,    max: 0.01,     addresses: 11199874 },
  { min: 0.01,     max: 0.1,      addresses: 7854775  },
  { min: 0.1,      max: 1,        addresses: 3469859  },
  { min: 1,        max: 10,       addresses: 862469   },
  { min: 10,       max: 100,      addresses: 141306   },
  { min: 100,      max: 1000,     addresses: 13874    },
  { min: 1000,     max: 10000,    addresses: 1901     },
  { min: 10000,    max: 100000,   addresses: 104      },
  { min: 100000,   max: 1000000,  addresses: 4        },
]

const TOTAL_ADDRESSES = DISTRIBUTION.reduce((s, d) => s + d.addresses, 0)

function calcPercentile(btc: number) {
  if (btc <= 0) return { topPctHolders: 100, betterThanPct: 0, addressesAbove: TOTAL_ADDRESSES }
  const bracket = DISTRIBUTION.find(d => btc >= d.min && btc < d.max) ?? DISTRIBUTION[DISTRIBUTION.length - 1]
  let addressesAbove = 0
  for (const d of DISTRIBUTION) { if (d.min >= bracket.max) addressesAbove += d.addresses }
  const betterThanPct = ((TOTAL_ADDRESSES - addressesAbove) / TOTAL_ADDRESSES) * 100
  const topPctHolders = (addressesAbove / TOTAL_ADDRESSES) * 100
  return { topPctHolders, betterThanPct, addressesAbove }
}

function getLabel(btc: number): { label: string; color: string } {
  if (btc >= 10000)  return { label: 'Ultra whale 🐋',   color: '#a855f7' }
  if (btc >= 1000)   return { label: 'Whale 🐳',          color: '#6366f1' }
  if (btc >= 100)    return { label: 'Humpback 🐋',       color: '#3b82f6' }
  if (btc >= 10)     return { label: 'Shark 🦈',          color: '#10b981' }
  if (btc >= 1)      return { label: 'Dolphin 🐬',        color: '#10b981' }
  if (btc >= 0.1)    return { label: 'Fish 🐟',           color: '#F7931A' }
  if (btc >= 0.01)   return { label: 'Shrimp 🦐',         color: '#F7931A' }
  if (btc >= 0.001)  return { label: 'Crab 🦀',           color: '#eab308' }
  return                    { label: 'Plankton 🦠',       color: '#888'   }
}

function getMotivation(btc: number): string {
  const multiple = (btc / (21_000_000 / 8_000_000_000)).toFixed(0)
  if (btc <= 0)    return ''
  if (btc < 0.001) return `You hold ${Math.round(btc * 1e8).toLocaleString()} sats. Every sat counts — keep stacking.`
  if (btc < 0.1)   return `You hold ${multiple}× what the average person would have if Bitcoin were divided equally among 8 billion people.`
  if (btc < 1)     return `Less than 9% of all Bitcoin addresses hold this much. You're ahead of the vast majority.`
  if (btc < 10)    return `Fewer than 2% of all Bitcoin addresses hold ≥ 1 BTC. You're in rare company.`
  if (btc < 100)   return `You're in the top 0.32% of all Bitcoin addresses on Earth. A true Bitcoin holder.`
  if (btc < 1000)  return `You hold more Bitcoin than 99.97% of all addresses. Generational wealth territory.`
  return `You are among the rarest Bitcoin holders on the planet. Fewer than 2,000 addresses hold this much.`
}

function formatPct(pct: number): string {
  if (pct < 0.01)  return `${pct.toFixed(3)}%`
  if (pct < 0.1)   return `${pct.toFixed(2)}%`
  if (pct < 1)     return `${pct.toFixed(2)}%`
  return `${pct.toFixed(1)}%`
}

interface Props { netWorthBtc: number }

export function BtcPercentileCard({ netWorthBtc }: Props) {
  if (netWorthBtc <= 0) return null
  const { topPctHolders, betterThanPct, addressesAbove } = calcPercentile(netWorthBtc)
  const { label, color } = getLabel(netWorthBtc)
  const motivation = getMotivation(netWorthBtc)
  const barPosition = Math.min(98, betterThanPct)
  const sats = Math.round(netWorthBtc * 100_000_000)

  const milestones = [0.001, 0.01, 0.1, 1, 10, 100, 1000, 10000]
  const nextMilestone = milestones.find(m => m > netWorthBtc)
  const prevMilestone = [...milestones].reverse().find(m => m <= netWorthBtc) ?? 0
  const progressToNext = nextMilestone
    ? ((netWorthBtc - prevMilestone) / (nextMilestone - prevMilestone)) * 100
    : 100

  return (
    <div className="bg-[#111] border border-white/5 rounded-2xl p-5">
      <div className="flex items-start justify-between mb-5">
        <div>
          <div className="text-xs text-white/40 uppercase tracking-wider font-medium mb-2">
            Global BTC percentile
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div style={{ color, fontFamily: 'monospace', fontSize: '32px', fontWeight: 700, lineHeight: 1 }}>
              Top {formatPct(topPctHolders)}
            </div>
            <div style={{ background: color + '20', border: `1px solid ${color}40`, color, borderRadius: '100px', padding: '3px 12px', fontSize: '12px', fontWeight: 600 }}>
              {label}
            </div>
          </div>
          <div className="text-xs text-white/25 mt-1">of all Bitcoin addresses</div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-xs text-white/25 mb-1">Your sats</div>
          <div className="font-mono text-sm font-bold text-white/60">{sats.toLocaleString()}</div>
          <div className="text-xs text-white/20">satoshis</div>
        </div>
      </div>

      {/* Bar vs BTC holders */}
      <div className="mb-5">
        <div className="flex justify-between mb-1">
          <span className="text-xs text-white/25">Position among {(TOTAL_ADDRESSES / 1_000_000).toFixed(1)}M BTC addresses</span>
          <span className="text-xs font-mono" style={{ color }}>{betterThanPct.toFixed(1)}% below you</span>
        </div>
        <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '100px', position: 'relative' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${barPosition}%`, borderRadius: '100px', background: `linear-gradient(90deg, #333 0%, ${color} 100%)`, transition: 'width 0.8s ease' }} />
          <div style={{ position: 'absolute', left: `${barPosition}%`, top: '50%', transform: 'translate(-50%, -50%)', width: '14px', height: '14px', borderRadius: '50%', background: color, boxShadow: `0 0 10px ${color}80`, border: '2px solid #111' }} />
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="text-xs text-white/15">Smallest holders</span>
          <span className="text-xs text-white/15">Largest holders</span>
        </div>
      </div>

      {/* Progress to next milestone */}
      {nextMilestone && (
        <div className="mb-4">
          <div className="flex justify-between mb-1">
            <span className="text-xs text-white/25">Progress to ₿ {nextMilestone} milestone</span>
            <span className="text-xs font-mono text-white/40">{progressToNext.toFixed(1)}%</span>
          </div>
          <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '100px' }}>
            <div style={{ height: '100%', width: `${progressToNext}%`, borderRadius: '100px', background: '#F7931A', transition: 'width 0.8s ease' }} />
          </div>
          <div className="text-xs text-white/20 mt-1">
            ₿ {(nextMilestone - netWorthBtc).toFixed(4)} more to reach next tier
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white/[0.03] rounded-xl px-3 py-2.5">
          <div className="text-xs text-white/25 mb-1">Richer than</div>
          <div className="font-mono text-sm font-bold" style={{ color }}>{betterThanPct.toFixed(1)}%</div>
          <div className="text-xs text-white/20">of all BTC addresses</div>
        </div>
        <div className="bg-white/[0.03] rounded-xl px-3 py-2.5">
          <div className="text-xs text-white/25 mb-1">Addresses above you</div>
          <div className="font-mono text-sm font-bold text-white/60">{addressesAbove.toLocaleString()}</div>
          <div className="text-xs text-white/20">out of {(TOTAL_ADDRESSES / 1_000_000).toFixed(1)}M tracked</div>
        </div>
      </div>

      {motivation && (
        <p className="text-xs text-white/40 leading-relaxed border-t border-white/5 pt-4">⚡ {motivation}</p>
      )}
      <p className="text-xs text-white/15 mt-2">
        Based on Bitcoin address distribution from BitInfoCharts. One person may control multiple addresses.
      </p>
    </div>
  )
}
