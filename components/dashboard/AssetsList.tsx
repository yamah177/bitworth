'use client'

import { useState } from 'react'
import { Pencil, Trash2, Plus } from 'lucide-react'
import { Account, ACCOUNT_TYPE_LABELS, ACCOUNT_TYPE_ICONS } from '@/types'
import { formatUsd, formatBtc, usdToBtc } from '@/lib/utils'
import { AccountFormModal } from '@/components/ui/FormModals'

interface Props {
  accounts: Account[]
  btcPrice: number
  onRefresh: () => void
}

export function AssetsList({ accounts, btcPrice, onRefresh }: Props) {
  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState<Account | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  async function handleDelete(id: string) {
    setDeleting(id)
    await fetch(`/api/accounts/${id}`, { method: 'DELETE' })
    onRefresh()
    setDeleting(null)
  }

  const total = accounts.reduce((s, a) => s + a.usd_value, 0)

  return (
    <div className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
        <div>
          <span className="text-xs text-white/40 uppercase tracking-wider font-medium">Assets</span>
          {accounts.length > 0 && (
            <span className="ml-2 text-xs text-white/20">{accounts.length} accounts</span>
          )}
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 text-xs text-[#F7931A] hover:text-[#e07a05] transition-colors font-medium"
        >
          <Plus size={14} />
          Add asset
        </button>
      </div>

      {/* List */}
      {accounts.length === 0 ? (
        <div className="px-5 py-10 text-center text-white/20 text-sm">
          <div className="text-3xl mb-2">🏦</div>
          No assets yet — add your first one
        </div>
      ) : (
        <div>
          {accounts.map((account) => {
            const btcVal = usdToBtc(account.usd_value, btcPrice)
            const pct = total > 0 ? (account.usd_value / total) * 100 : 0

            return (
              <div
                key={account.id}
                className="flex items-center gap-4 px-5 py-3.5 border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors group"
              >
                {/* Icon */}
                <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-base flex-shrink-0">
                  {ACCOUNT_TYPE_ICONS[account.type as keyof typeof ACCOUNT_TYPE_ICONS]}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">{account.name}</div>
                  <div className="text-xs text-white/30 mt-0.5">
                    {ACCOUNT_TYPE_LABELS[account.type as keyof typeof ACCOUNT_TYPE_LABELS]}
                    {account.institution && ` · ${account.institution}`}
                    {' · '}
                    <span className="text-white/20">{pct.toFixed(1)}% of assets</span>
                  </div>
                </div>

                {/* Values */}
                <div className="text-right flex-shrink-0">
                  <div className="font-mono text-sm font-bold text-[#F7931A]">
                    {formatBtc(btcVal)}
                  </div>
                  <div className="text-xs text-white/30 mt-0.5">{formatUsd(account.usd_value)}</div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <button
                    onClick={() => setEditing(account)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-white/30 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => handleDelete(account.id)}
                    disabled={deleting === account.id}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            )
          })}

          {/* Total row */}
          <div className="flex items-center justify-between px-5 py-3 bg-white/[0.02]">
            <span className="text-xs text-white/30 uppercase tracking-wider">Total assets</span>
            <div className="text-right">
              <div className="font-mono text-sm font-bold text-white">
                {formatBtc(usdToBtc(total, btcPrice))}
              </div>
              <div className="text-xs text-white/30">{formatUsd(total)}</div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showAdd && (
        <AccountFormModal
          onClose={() => setShowAdd(false)}
          onSaved={onRefresh}
        />
      )}
      {editing && (
        <AccountFormModal
          existing={editing}
          onClose={() => setEditing(null)}
          onSaved={onRefresh}
        />
      )}
    </div>
  )
}
