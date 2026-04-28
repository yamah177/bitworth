'use client'

import { useState, useRef } from 'react'
import { Modal } from './Modal'
import { Download, Upload, CheckCircle, AlertCircle } from 'lucide-react'
import { downloadCSV, exportAccountsToCSV, exportLiabilitiesToCSV, exportSnapshotsToCSV, exportAllToCSV, importFromCSV } from '@/lib/csvUtils'
import { Account, Liability } from '@/types'

interface AuthDataModalProps {
  onClose: () => void
  onImported: () => void
}

export function AuthDataModal({ onClose, onImported }: AuthDataModalProps) {
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<{ accounts: number; liabilities: number; errors: string[] } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImporting(true)
    setResult(null)
    const text = await file.text()
    const res = await fetch('/api/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ csv: text }),
    })
    const data = await res.json()
    setResult(data.imported ? { ...data.imported, errors: data.errors ?? [] } : { accounts: 0, liabilities: 0, errors: [data.error ?? 'Import failed'] })
    setImporting(false)
    if (data.imported?.accounts > 0 || data.imported?.liabilities > 0) onImported()
  }

  return (
    <Modal title="Export / Import data" onClose={onClose}>
      <div className="space-y-5">
        <div>
          <div className="text-xs text-white/40 uppercase tracking-wider mb-3">Export as CSV</div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { type: 'all', label: 'All data', icon: '📦' },
              { type: 'assets', label: 'Assets only', icon: '📈' },
              { type: 'liabilities', label: 'Liabilities only', icon: '📉' },
              { type: 'snapshots', label: 'Net worth history', icon: '📊' },
            ].map(({ type, label, icon }) => (
              <a key={type} href={`/api/export?type=${type}`} download
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 transition-colors cursor-pointer">
                <span className="text-base">{icon}</span>
                <div className="flex-1">
                  <div className="text-xs font-medium text-white">{label}</div>
                  <div className="text-xs text-white/30">.csv</div>
                </div>
                <Download size={12} className="text-white/30" />
              </a>
            ))}
          </div>
        </div>
        <div className="border-t border-white/5 pt-5">
          <div className="text-xs text-white/40 uppercase tracking-wider mb-3">Import CSV</div>
          <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
            <p className="text-xs text-white/40 mb-3 leading-relaxed">
              Import a Satsworth CSV export to restore or merge data. Existing data won&apos;t be deleted.
            </p>
            <input ref={fileRef} type="file" accept=".csv,.txt" onChange={handleImport} className="hidden" />
            <button onClick={() => fileRef.current?.click()} disabled={importing}
              className="flex items-center gap-2 w-full justify-center py-2.5 rounded-xl border border-white/15 text-white/60 hover:text-white hover:bg-white/5 transition-colors text-sm disabled:opacity-50">
              <Upload size={14} />
              {importing ? 'Importing...' : 'Choose CSV file'}
            </button>
          </div>
          {result && (
            <div className={`mt-3 p-3 rounded-xl border text-xs ${result.errors.length === 0 ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-yellow-500/10 border-yellow-500/20'}`}>
              {result.errors.length === 0 ? (
                <div className="flex items-center gap-2 text-emerald-400"><CheckCircle size={13} />Imported {result.accounts} assets and {result.liabilities} liabilities</div>
              ) : (
                <div>
                  <div className="flex items-center gap-2 text-yellow-400 mb-1"><AlertCircle size={13} />Imported with {result.errors.length} warning{result.errors.length > 1 ? 's' : ''}</div>
                  {result.errors.slice(0, 3).map((e, i) => <div key={i} className="text-yellow-400/60 pl-5">{e}</div>)}
                </div>
              )}
            </div>
          )}
        </div>
        <button onClick={onClose} className="w-full py-2.5 rounded-xl border border-white/10 text-white/40 text-sm hover:bg-white/5 transition-colors">Done</button>
      </div>
    </Modal>
  )
}

interface GuestDataModalProps {
  onClose: () => void
  onImported: () => void
  accounts: Account[]
  liabilities: Liability[]
  snapshots: any[]
}

export function GuestDataModal({ onClose, onImported, accounts, liabilities, snapshots }: GuestDataModalProps) {
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<{ accounts: number; liabilities: number; errors: string[] } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const date = new Date().toISOString().slice(0, 10)

  function handleExport(type: string) {
    const map: Record<string, [string, string]> = {
      all: [exportAllToCSV(accounts, liabilities, snapshots), `satsworth-export-${date}.csv`],
      assets: [exportAccountsToCSV(accounts), `satsworth-assets-${date}.csv`],
      liabilities: [exportLiabilitiesToCSV(liabilities), `satsworth-liabilities-${date}.csv`],
      snapshots: [exportSnapshotsToCSV(snapshots), `satsworth-history-${date}.csv`],
    }
    const [csv, filename] = map[type] ?? map.all
    downloadCSV(csv, filename)
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImporting(true)
    setResult(null)
    const text = await file.text()
    const { accounts: pa, liabilities: pl, errors } = importFromCSV(text)
    const { guestApi } = await import('@/lib/guestApi')
    await Promise.all([...pa.map(a => guestApi.createAccount(a)), ...pl.map(l => guestApi.createLiability(l))])
    setResult({ accounts: pa.length, liabilities: pl.length, errors })
    setImporting(false)
    if (pa.length > 0 || pl.length > 0) onImported()
  }

  return (
    <Modal title="Export / Import data" onClose={onClose}>
      <div className="space-y-5">
        <div>
          <div className="text-xs text-white/40 uppercase tracking-wider mb-3">Export as CSV</div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { type: 'all', label: 'All data', icon: '📦' },
              { type: 'assets', label: 'Assets only', icon: '📈' },
              { type: 'liabilities', label: 'Liabilities only', icon: '📉' },
              { type: 'snapshots', label: 'Net worth history', icon: '📊' },
            ].map(({ type, label, icon }) => (
              <button key={type} onClick={() => handleExport(type)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 transition-colors text-left">
                <span className="text-base">{icon}</span>
                <div className="flex-1">
                  <div className="text-xs font-medium text-white">{label}</div>
                  <div className="text-xs text-white/30">.csv</div>
                </div>
                <Download size={12} className="text-white/30" />
              </button>
            ))}
          </div>
        </div>
        <div className="border-t border-white/5 pt-5">
          <div className="text-xs text-white/40 uppercase tracking-wider mb-3">Import CSV</div>
          <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
            <p className="text-xs text-white/40 mb-3 leading-relaxed">
              Restore from a previous Satsworth export. Useful if you cleared your browser cache.
            </p>
            <input ref={fileRef} type="file" accept=".csv,.txt" onChange={handleImport} className="hidden" />
            <button onClick={() => fileRef.current?.click()} disabled={importing}
              className="flex items-center gap-2 w-full justify-center py-2.5 rounded-xl border border-white/15 text-white/60 hover:text-white hover:bg-white/5 transition-colors text-sm disabled:opacity-50">
              <Upload size={14} />
              {importing ? 'Importing...' : 'Choose CSV file'}
            </button>
          </div>
          {result && (
            <div className={`mt-3 p-3 rounded-xl border text-xs ${result.errors.length === 0 ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-yellow-500/10 border-yellow-500/20'}`}>
              {result.errors.length === 0 ? (
                <div className="flex items-center gap-2 text-emerald-400"><CheckCircle size={13} />Imported {result.accounts} assets and {result.liabilities} liabilities</div>
              ) : (
                <div>
                  <div className="flex items-center gap-2 text-yellow-400 mb-1"><AlertCircle size={13} />{result.accounts + result.liabilities} imported, {result.errors.length} warning{result.errors.length > 1 ? 's' : ''}</div>
                  {result.errors.slice(0, 3).map((e, i) => <div key={i} className="text-yellow-400/60 pl-5">{e}</div>)}
                </div>
              )}
            </div>
          )}
        </div>
        <button onClick={onClose} className="w-full py-2.5 rounded-xl border border-white/10 text-white/40 text-sm hover:bg-white/5 transition-colors">Done</button>
      </div>
    </Modal>
  )
}
