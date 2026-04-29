'use client'

import { useState } from 'react'
import { Pencil, Trash2, Plus } from 'lucide-react'
import { Liability, LIABILITY_TYPE_LABELS, LIABILITY_TYPE_ICONS } from '@/types'
import { formatBtc, usdToBtc } from '@/lib/utils'
import { formatFiat, CurrencyCode } from '@/lib/currencies'
import { guestApi } from '@/lib/guestApi'
import { Modal } from '@/components/ui/Modal'

interface FormProps {
  onClose: () => void
  onSaved: () => void
  existing?: Liability
}

function LiabilityForm({ onClose, onSaved, existing }: FormProps) {
  const [name, setName] = useState(existing?.name ?? '')
  const [type, setType] = useState(existing?.type ?? 'mortgage')
  const [institution, setInstitution] = useState(existing?.institution ?? '')
  const [balance, setBalance] = useState(existing?.usd_balance?.toString() ?? '')
  const [notes, setNotes] = useState(existing?.notes ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const usd_balance = parseFloat(balance)
    if (isNaN(usd_balance) || usd_balance < 0) { setError('Enter a valid amount'); return }
    setLoading(true)
    if (existing) {
      await guestApi.updateLiability(existing.id, { name, type, institution, usd_balance, notes })
    } else {
      await guestApi.createLiability({ name, type, institution, usd_balance, notes })
    }
    onSaved()
    onClose()
  }

  return (
    <Modal title={existing ? 'Edit liability' : 'Add liability'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs text-white/40 mb-1.5 uppercase tracking-wider">Name</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Primary mortgage" required />
        </div>
        <div>
          <label className="block text-xs text-white/40 mb-1.5 uppercase tracking-wider">Type</label>
          <select value={type} onChange={e => setType(e.target.value)}>
            {Object.entries(LIABILITY_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-white/40 mb-1.5 uppercase tracking-wider">Lender (optional)</label>
          <input type="text" value={institution} onChange={e => setInstitution(e.target.value)} placeholder="e.g. Chase" />
        </div>
        <div>
          <label className="block text-xs text-white/40 mb-1.5 uppercase tracking-wider">Balance owed (USD)</label>
          <input type="number" value={balance} onChange={e => setBalance(e.target.value)} placeholder="250000" min="0" step="0.01" required />
        </div>
        <div>
          <label className="block text-xs text-white/40 mb-1.5 uppercase tracking-wider">Notes (optional)</label>
          <input type="text" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Interest rate, term, etc." />
        </div>
        {error && <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-red-400 text-sm">{error}</div>}
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-white/10 text-white/50 text-sm hover:bg-white/5 transition-colors">Cancel</button>
          <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-lg bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition-colors disabled:opacity-50">
            {loading ? 'Saving...' : existing ? 'Save changes' : 'Add liability'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

interface Props {
  liabilities: Liability[]
  btcPrice: number
  currency: CurrencyCode
  onRefresh: () => void
}

export function GuestLiabilitiesList({ liabilities, btcPrice, currency, onRefresh }: Props) {
  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState<Liability | null>(null)
  const total = liabilities.reduce((s, l) => s + l.usd_balance, 0)

  async function handleDelete(id: string) {
    await guestApi.deleteLiability(id)
    onRefresh()
  }

  return (
    <div className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
        <div>
          <span className="text-xs text-white/40 uppercase tracking-wider font-medium">Liabilities</span>
          {liabilities.length > 0 && <span className="ml-2 text-xs text-white/20">{liabilities.length} items</span>}
        </div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors font-medium">
          <Plus size={14} /> Add liability
        </button>
      </div>
      {liabilities.length === 0 ? (
        <div className="px-5 py-10 text-center text-white/20 text-sm">
          <div className="text-3xl mb-2">✅</div>No liabilities — stay that way!
        </div>
      ) : (
        <div>
          {liabilities.map(liability => {
            const btcVal = usdToBtc(liability.usd_balance, btcPrice)
            return (
              <div key={liability.id} className="flex items-center gap-4 px-5 py-3.5 border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors group">
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
                  <div className="font-mono text-sm font-bold text-red-400">−{formatBtc(btcVal)}</div>
                  <div className="text-xs text-white/30 mt-0.5">{formatFiat(liability.usd_balance, currency)}</div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <button onClick={() => setEditing(liability)} className="w-7 h-7 flex items-center justify-center rounded-lg text-white/30 hover:text-white hover:bg-white/5 transition-colors"><Pencil size={13} /></button>
                  <button onClick={() => handleDelete(liability.id)} className="w-7 h-7 flex items-center justify-center rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-colors"><Trash2 size={13} /></button>
                </div>
              </div>
            )
          })}
          <div className="flex items-center justify-between px-5 py-3 bg-white/[0.02]">
            <span className="text-xs text-white/30 uppercase tracking-wider">Total owed</span>
            <div className="text-right">
              <div className="font-mono text-sm font-bold text-red-400">−{formatBtc(usdToBtc(total, btcPrice))}</div>
              <div className="text-xs text-white/30">{formatFiat(total, currency)}</div>
            </div>
          </div>
        </div>
      )}
      {showAdd && <LiabilityForm onClose={() => setShowAdd(false)} onSaved={onRefresh} />}
      {editing && <LiabilityForm existing={editing} onClose={() => setEditing(null)} onSaved={onRefresh} />}
    </div>
  )
}
