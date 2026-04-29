'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { X, ArrowRight, FolderDown } from 'lucide-react'
import { Account, Liability } from '@/types'
import { GuestDataModal } from '@/components/ui/DataModal'

interface Props {
  accounts: Account[]
  liabilities: Liability[]
  snapshots: any[]
  onImported: () => void
}

export function GuestBanner({ accounts, liabilities, snapshots, onImported }: Props) {
  const router = useRouter()
  const [dismissed, setDismissed] = useState(false)
  const [showDataModal, setShowDataModal] = useState(false)

  if (dismissed) return null

  return (
    <>
      <div style={{
        background: 'linear-gradient(135deg, rgba(247,147,26,0.1) 0%, rgba(247,147,26,0.05) 100%)',
        border: '1px solid rgba(247,147,26,0.2)',
        borderRadius: '16px', padding: '14px 16px',
        display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap',
      }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#f0f0f0', marginBottom: '2px' }}>
            ⚡ Guest mode — data stored on this device only
          </div>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
            Create a free account to sync across devices and never lose your data.
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
          <button onClick={() => setShowDataModal(true)} style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '7px 12px', borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'transparent', color: 'rgba(255,255,255,0.5)',
            fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit',
          }}>
            <FolderDown size={12} />
            Export / Import
          </button>
          <button onClick={() => router.push('/auth/signup')} style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '7px 14px', borderRadius: '8px',
            border: 'none', background: '#F7931A',
            color: '#000', fontSize: '12px', fontWeight: 700,
            cursor: 'pointer', fontFamily: 'inherit',
          }}>
            Save my data <ArrowRight size={12} />
          </button>
          <button onClick={() => setDismissed(true)} style={{
            width: '28px', height: '28px', borderRadius: '8px',
            border: 'none', background: 'transparent',
            color: 'rgba(255,255,255,0.3)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <X size={14} />
          </button>
        </div>
      </div>
      {showDataModal && (
        <GuestDataModal
          onClose={() => setShowDataModal(false)}
          onImported={() => { onImported(); setShowDataModal(false) }}
          accounts={accounts}
          liabilities={liabilities}
          snapshots={snapshots}
        />
      )}
    </>
  )
}
