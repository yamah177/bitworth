'use client'

import { useState } from 'react'
import { Pencil, Trash2, Plus } from 'lucide-react'
import { Liability, LIABILITY_TYPE_LABELS, LIABILITY_TYPE_ICONS } from '@/types'
import { formatUsd, formatBtc, usdToBtc } from '@/lib/utils'
import { LiabilityFormModal } from '@/components/ui/FormModals'

interface Props {
  liabilities: Liability[]
  btcPrice: number
  onRefresh: () => void
}

export function LiabilitiesList({ liabilities, btcPrice, onRefresh }: Props) {
  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState<Liability | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  async function handleDelete(id: string) {
    setDeleting(id)
    await fetch(`/api/liabilities/${id}`, { method: 'DELETE' })
    onRefresh()
    setDeleting(null)
  }

  const total = liabilities.reduce((s, l) => s + l.usd_balance, 0)

  return (
    <div className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
        <div>
          <span className="text-xs text-white/40 uppercase tracking-wider font-medium">Liabilities</span>
          {liabilities.length > 0 && (
            <span className="ml-2 text-xs text-white/20">{liabilities.length} items</span>
          )}
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors font-medium"
        >
          <Plus size={14} />
          Add liability
        </button>
      </div>

      {liabilities.length === 0 ? (
        <div className="px-5 py-10 text-center text-white/20 text-sm">
          <div className="text-3xl mb-2">✅</div>
          No liabilities — stay that way!
        </div>
      ) : (
        <div>
          {liabilities.map((liability) => {
            const btcVal = usdToBtc(liability.usd_balance, btcPrice)

            return (
              <div
                key={liability.id}
                className="flex items-center gap-4 px-5 py-3.5 border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors group"
              >
                <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center text-base flex-shrink-0">
                  {LIABILITY_TYPE_ICONS[liability.type as keyof typeof LIABILITY_TYPE_ICONS]}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">{liability.name}</div>
                  <div className="text-xs text-white/30 mt-0.5">
                    {LIABILITY_TYPE_LABELS[liability.type as keyof typeof LIABILITY_TYPE_LABELS]}
                    {liability.institution && ` · ${liability.institution}`}
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <div className="font-mono text-sm font-bold text-red-400">
                    −{formatBtc(btcVal)}
                  </div>
                  <div className="text-xs text-white/30 mt-0.5">{formatUsd(liability.usd_balance)}</div>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <button
                    onClick={() => setEditing(liability)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-white/30 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => handleDelete(liability.id)}
                    disabled={deleting === liability.id}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            )
          })}

          <div className="flex items-center justify-between px-5 py-3 bg-white/[0.02]">
            <span className="text-xs text-white/30 uppercase tracking-wider">Total owed</span>
            <div className="text-right">
              <div className="font-mono text-sm font-bold text-red-400">
                −{formatBtc(usdToBtc(total, btcPrice))}
              </div>
              <div className="text-xs text-white/30">{formatUsd(total)}</div>
            </div>
          </div>
        </div>
      )}

      {showAdd && (
        <LiabilityFormModal onClose={() => setShowAdd(false)} onSaved={onRefresh} />
      )}
      {editing && (
        <LiabilityFormModal
          existing={editing}
          onClose={() => setEditing(null)}
          onSaved={onRefresh}
        />
      )}
    </div>
  )
}
