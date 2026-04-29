'use client'

import { useState } from 'react'
import { Pencil, Trash2, Plus } from 'lucide-react'
import { Account, ACCOUNT_TYPE_LABELS, ACCOUNT_TYPE_ICONS } from '@/types'
import { formatBtc, usdToBtc } from '@/lib/utils'
import { formatFiat, CurrencyCode } from '@/lib/currencies'
import { guestApi } from '@/lib/guestApi'
import { Modal } from '@/components/ui/Modal'

interface FormProps {
  onClose: () => void
  onSaved: () => void
  existing?: Account
}

function AccountForm({ onClose, onSaved, existing }: FormProps) {
  const [name, setName] = useState(existing?.name ?? '')
  const [type, setType] = useState(existing?.type ?? 'brokerage')
  const [institution, setInstitution] = useState(existing?.institution ?? '')
  const [value, setValue] = useState(existing?.usd_value?.toString() ?? '')
  const [notes, setNotes] = useState(existing?.notes ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const usd_value = parseFloat(value)
    if (isNaN(usd_value) || usd_value < 0) { setError('Enter a valid amount'); return }
    setLoading(true)
    if (existing) {
      await guestApi.updateAccount(existing.id, { name, type, institution, usd_value, notes })
    } else {
      await guestApi.createAccount({ name, type, institution, usd_value, notes })
    }
    onSaved()
    onClose()
  }

  return (
    <Modal title={existing ? 'Edit asset' : 'Add asset'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs text-white/40 mb-1.5 uppercase tracking-wider">Account name</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Fidelity 401k" required />
        </div>
        <div>
          <label className="block text-xs text-white/40 mb-1.5 uppercase tracking-wider">Type</label>
          <select value={type} onChange={e => setType(e.target.value)}>
            {Object.entries(ACCOUNT_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-white/40 mb-1.5 uppercase tracking-wider">Institution (optional)</label>
          <input type="text" value={institution} onChange={e => setInstitution(e.target.value)} placeholder="e.g. Fidelity" />
        </div>
        <div>
          <label className="block text-xs text-white/40 mb-1.5 uppercase tracking-wider">Value (USD)</label>
          <input type="number" value={value} onChange={e => setValue(e.target.value)} placeholder="100000" min="0" step="0.01" required />
        </div>
        <div>
          <label className="block text-xs text-white/40 mb-1.5 uppercase tracking-wider">Notes (optional)</label>
          <input type="text" value={notes} onChange={e => setNotes(e.target.value)} />
        </div>
        {error && <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-red-400 text-sm">{error}</div>}
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-white/10 text-white/50 text-sm hover:bg-white/5 transition-colors">Cancel</button>
          <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-lg bg-[#F7931A] text-black font-bold text-sm hover:bg-[#e07a05] transition-colors disabled:opacity-50">
            {loading ? 'Saving...' : existing ? 'Save changes' : 'Add asset'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

interface Props {
  accounts: Account[]
  btcPrice: number
  currency: CurrencyCode
  onRefresh: () => void
}

export function GuestAssetsList({ accounts, btcPrice, currency, onRefresh }: Props) {
  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState<Account | null>(null)
  const total = accounts.reduce((s, a) => s + a.usd_value, 0)

  async function handleDelete(id: string) {
    await guestApi.deleteAccount(id)
    onRefresh()
  }

  return (
    <div className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
        <div>
          <span className="text-xs text-white/40 uppercase tracking-wider font-medium">Assets</span>
          {accounts.length > 0 && <span className="ml-2 text-xs text-white/20">{accounts.length} accounts</span>}
        </div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-1.5 text-xs text-[#F7931A] hover:text-[#e07a05] transition-colors font-medium">
          <Plus size={14} /> Add asset
        </button>
      </div>
      {accounts.length === 0 ? (
        <div className="px-5 py-10 text-center text-white/20 text-sm">
          <div className="text-3xl mb-2">🏦</div>No assets yet — add your first one
        </div>
      ) : (
        <div>
          {accounts.map(account => {
            const btcVal = usdToBtc(account.usd_value, btcPrice)
            const pct = total > 0 ? (account.usd_value / total) * 100 : 0
            return (
              <div key={account.id} className="flex items-center gap-4 px-5 py-3.5 border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors group">
                <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-base flex-shrink-0">
                  {ACCOUNT_TYPE_ICONS[account.type as keyof typeof ACCOUNT_TYPE_ICONS]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">{account.name}</div>
                  <div className="text-xs text-white/30 mt-0.5">
                    {ACCOUNT_TYPE_LABELS[account.type as keyof typeof ACCOUNT_TYPE_LABELS]}
                    {account.institution && ` · ${account.institution}`}
                    {' · '}<span className="text-white/20">{pct.toFixed(1)}%</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="font-mono text-sm font-bold text-[#F7931A]">{formatBtc(btcVal)}</div>
                  <div className="text-xs text-white/30 mt-0.5">{formatFiat(account.usd_value, currency)}</div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <button onClick={() => setEditing(account)} className="w-7 h-7 flex items-center justify-center rounded-lg text-white/30 hover:text-white hover:bg-white/5 transition-colors"><Pencil size={13} /></button>
                  <button onClick={() => handleDelete(account.id)} className="w-7 h-7 flex items-center justify-center rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-colors"><Trash2 size={13} /></button>
                </div>
              </div>
            )
          })}
          <div className="flex items-center justify-between px-5 py-3 bg-white/[0.02]">
            <span className="text-xs text-white/30 uppercase tracking-wider">Total assets</span>
            <div className="text-right">
              <div className="font-mono text-sm font-bold text-white">{formatBtc(usdToBtc(total, btcPrice))}</div>
              <div className="text-xs text-white/30">{formatFiat(total, currency)}</div>
            </div>
          </div>
        </div>
      )}
      {showAdd && <AccountForm onClose={() => setShowAdd(false)} onSaved={onRefresh} />}
      {editing && <AccountForm existing={editing} onClose={() => setEditing(null)} onSaved={onRefresh} />}
    </div>
  )
}
