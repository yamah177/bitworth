'use client'

import { useState } from 'react'
import { Modal } from './Modal'
import {
  AccountType, LiabilityType,
  ACCOUNT_TYPE_LABELS, LIABILITY_TYPE_LABELS,
  Account, Liability
} from '@/types'

// ─── Account Form ───────────────────────────────────────────

interface AccountFormProps {
  onClose: () => void
  onSaved: () => void
  existing?: Account
}

export function AccountFormModal({ onClose, onSaved, existing }: AccountFormProps) {
  const [name, setName] = useState(existing?.name ?? '')
  const [type, setType] = useState<AccountType>(existing?.type ?? 'brokerage')
  const [institution, setInstitution] = useState(existing?.institution ?? '')
  const [value, setValue] = useState(existing?.usd_value?.toString() ?? '')
  const [notes, setNotes] = useState(existing?.notes ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const usd_value = parseFloat(value.replace(/,/g, ''))
    if (isNaN(usd_value) || usd_value < 0) {
      setError('Enter a valid dollar amount')
      return
    }

    setLoading(true)
    const payload = { name, type, institution, usd_value, notes }
    const url = existing ? `/api/accounts/${existing.id}` : '/api/accounts'
    const method = existing ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Something went wrong')
      setLoading(false)
      return
    }

    onSaved()
    onClose()
  }

  return (
    <Modal title={existing ? 'Edit asset' : 'Add asset'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs text-white/40 mb-1.5 uppercase tracking-wider">Account name</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)}
            placeholder="e.g. Fidelity 401k" required />
        </div>

        <div>
          <label className="block text-xs text-white/40 mb-1.5 uppercase tracking-wider">Type</label>
          <select value={type} onChange={e => setType(e.target.value as AccountType)}>
            {Object.entries(ACCOUNT_TYPE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-white/40 mb-1.5 uppercase tracking-wider">Institution (optional)</label>
          <input type="text" value={institution} onChange={e => setInstitution(e.target.value)}
            placeholder="e.g. Fidelity, Vanguard" />
        </div>

        <div>
          <label className="block text-xs text-white/40 mb-1.5 uppercase tracking-wider">Current value (USD)</label>
          <input type="number" value={value} onChange={e => setValue(e.target.value)}
            placeholder="150000" min="0" step="0.01" required />
        </div>

        <div>
          <label className="block text-xs text-white/40 mb-1.5 uppercase tracking-wider">Notes (optional)</label>
          <input type="text" value={notes} onChange={e => setNotes(e.target.value)}
            placeholder="Any notes about this account" />
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-red-400 text-sm">{error}</div>
        )}

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose}
            className="flex-1 py-2.5 rounded-lg border border-white/10 text-white/50 text-sm hover:bg-white/5 transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={loading}
            className="flex-1 py-2.5 rounded-lg bg-[#F7931A] text-black font-bold text-sm hover:bg-[#e07a05] transition-colors disabled:opacity-50">
            {loading ? 'Saving...' : existing ? 'Save changes' : 'Add asset'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

// ─── Liability Form ──────────────────────────────────────────

interface LiabilityFormProps {
  onClose: () => void
  onSaved: () => void
  existing?: Liability
}

export function LiabilityFormModal({ onClose, onSaved, existing }: LiabilityFormProps) {
  const [name, setName] = useState(existing?.name ?? '')
  const [type, setType] = useState<LiabilityType>(existing?.type ?? 'mortgage')
  const [institution, setInstitution] = useState(existing?.institution ?? '')
  const [balance, setBalance] = useState(existing?.usd_balance?.toString() ?? '')
  const [notes, setNotes] = useState(existing?.notes ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const usd_balance = parseFloat(balance.replace(/,/g, ''))
    if (isNaN(usd_balance) || usd_balance < 0) {
      setError('Enter a valid dollar amount')
      return
    }

    setLoading(true)
    const payload = { name, type, institution, usd_balance, notes }
    const url = existing ? `/api/liabilities/${existing.id}` : '/api/liabilities'
    const method = existing ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Something went wrong')
      setLoading(false)
      return
    }

    onSaved()
    onClose()
  }

  return (
    <Modal title={existing ? 'Edit liability' : 'Add liability'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs text-white/40 mb-1.5 uppercase tracking-wider">Name</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)}
            placeholder="e.g. Primary mortgage" required />
        </div>

        <div>
          <label className="block text-xs text-white/40 mb-1.5 uppercase tracking-wider">Type</label>
          <select value={type} onChange={e => setType(e.target.value as LiabilityType)}>
            {Object.entries(LIABILITY_TYPE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-white/40 mb-1.5 uppercase tracking-wider">Lender (optional)</label>
          <input type="text" value={institution} onChange={e => setInstitution(e.target.value)}
            placeholder="e.g. Chase, Sallie Mae" />
        </div>

        <div>
          <label className="block text-xs text-white/40 mb-1.5 uppercase tracking-wider">Current balance owed (USD)</label>
          <input type="number" value={balance} onChange={e => setBalance(e.target.value)}
            placeholder="250000" min="0" step="0.01" required />
        </div>

        <div>
          <label className="block text-xs text-white/40 mb-1.5 uppercase tracking-wider">Notes (optional)</label>
          <input type="text" value={notes} onChange={e => setNotes(e.target.value)}
            placeholder="Interest rate, term, etc." />
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-red-400 text-sm">{error}</div>
        )}

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose}
            className="flex-1 py-2.5 rounded-lg border border-white/10 text-white/50 text-sm hover:bg-white/5 transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={loading}
            className="flex-1 py-2.5 rounded-lg bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition-colors disabled:opacity-50">
            {loading ? 'Saving...' : existing ? 'Save changes' : 'Add liability'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
