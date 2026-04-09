'use client'

import { Account, ACCOUNT_TYPE_LABELS } from '@/types'
import { formatUsd, formatBtc, usdToBtc } from '@/lib/utils'

interface Props {
  accounts: Account[]
  btcPrice: number
}

// Color palette for allocation segments
const COLORS = [
  '#F7931A', // btc orange
  '#3B82F6', // blue
  '#10B981', // emerald
  '#8B5CF6', // violet
  '#F59E0B', // amber
  '#EC4899', // pink
  '#14B8A6', // teal
  '#6366F1', // indigo
]

interface DonutSegment {
  color: string
  pct: number
  offset: number
}

function DonutChart({ segments }: { segments: DonutSegment[] }) {
  const r = 40
  const cx = 50
  const cy = 50
  const circumference = 2 * Math.PI * r
  let cumulativeOffset = 0

  return (
    <svg viewBox="0 0 100 100" className="w-20 h-20 -rotate-90">
      {segments.map((seg, i) => {
        const dashArray = (seg.pct / 100) * circumference
        const dashOffset = circumference - dashArray
        const strokeDashoffset = circumference - (cumulativeOffset / 100) * circumference
        cumulativeOffset += seg.pct

        return (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={seg.color}
            strokeWidth="12"
            strokeDasharray={`${dashArray} ${circumference - dashArray}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="butt"
          />
        )
      })}
      {/* Center hole */}
      <circle cx={cx} cy={cy} r="28" fill="#111" />
    </svg>
  )
}

export function AllocationBreakdown({ accounts, btcPrice }: Props) {
  if (accounts.length === 0) return null

  const total = accounts.reduce((s, a) => s + a.usd_value, 0)
  if (total === 0) return null

  // Group by type
  const groups: Record<string, number> = {}
  for (const a of accounts) {
    groups[a.type] = (groups[a.type] ?? 0) + a.usd_value
  }

  const sorted = Object.entries(groups)
    .sort((a, b) => b[1] - a[1])
    .map(([type, usd], i) => ({
      type,
      usd,
      pct: (usd / total) * 100,
      color: COLORS[i % COLORS.length],
      label: ACCOUNT_TYPE_LABELS[type as keyof typeof ACCOUNT_TYPE_LABELS] ?? type,
    }))

  // Build donut segments (leave small gap between segments)
  let offset = 0
  const segments: DonutSegment[] = sorted.map(s => {
    const seg = { color: s.color, pct: s.pct, offset }
    offset += s.pct
    return seg
  })

  return (
    <div className="bg-[#111] border border-white/5 rounded-2xl p-5">
      <div className="text-xs text-white/40 uppercase tracking-wider font-medium mb-4">
        Allocation
      </div>

      <div className="flex items-center gap-5">
        {/* Donut */}
        <div className="flex-shrink-0">
          <DonutChart segments={segments} />
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-2 min-w-0">
          {sorted.map(item => (
            <div key={item.type} className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-sm flex-shrink-0"
                style={{ background: item.color }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-xs text-white/50 truncate">{item.label}</span>
                  <span className="text-xs font-mono text-white/40 flex-shrink-0">
                    {item.pct.toFixed(1)}%
                  </span>
                </div>
                {/* Progress bar */}
                <div className="h-0.5 bg-white/5 rounded-full mt-1 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${item.pct}%`, background: item.color }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* BTC equivalent of each */}
      <div className="mt-4 pt-4 border-t border-white/5 space-y-1.5">
        {sorted.slice(0, 4).map(item => (
          <div key={item.type} className="flex items-center justify-between text-xs">
            <span className="text-white/25">{item.label}</span>
            <span className="font-mono text-white/40">
              {formatBtc(usdToBtc(item.usd, btcPrice))}
            </span>
          </div>
        ))}
        {sorted.length > 4 && (
          <div className="text-xs text-white/20 text-right">
            +{sorted.length - 4} more categories
          </div>
        )}
      </div>
    </div>
  )
}
