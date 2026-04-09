'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { SUPPORTED_CURRENCIES, CurrencyCode } from '@/lib/currencies'

interface Props {
  value: CurrencyCode
  onChange: (code: CurrencyCode) => void
}

export function CurrencySelector({ value, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const selected = SUPPORTED_CURRENCIES.find(c => c.code === value) ?? SUPPORTED_CURRENCIES[0]

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  async function handleSelect(code: CurrencyCode) {
    setOpen(false)
    onChange(code)
    await fetch('/api/preferences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currency: code }),
    })
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '8px', padding: '5px 10px',
          color: '#f0f0f0', fontSize: '13px', fontWeight: '600',
          cursor: 'pointer', fontFamily: 'monospace',
          letterSpacing: '0.03em', whiteSpace: 'nowrap',
        }}
      >
        <span style={{ fontSize: '14px' }}>{selected.flag}</span>
        <span>{selected.code.toUpperCase()}</span>
        <ChevronDown size={12} style={{
          opacity: 0.5,
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.15s',
        }} />
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', right: 0,
          background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '12px', padding: '6px', minWidth: '200px',
          zIndex: 100, boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}>
          {SUPPORTED_CURRENCIES.map(currency => (
            <button
              key={currency.code}
              onClick={() => handleSelect(currency.code as CurrencyCode)}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                width: '100%', padding: '8px 10px',
                background: value === currency.code ? 'rgba(247,147,26,0.1)' : 'transparent',
                border: 'none', borderRadius: '8px',
                cursor: 'pointer', textAlign: 'left',
              }}
            >
              <span style={{ fontSize: '16px', width: '20px' }}>{currency.flag}</span>
              <span style={{ flex: 1 }}>
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#f0f0f0', fontFamily: 'monospace' }}>
                  {currency.code.toUpperCase()}
                </span>
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginLeft: '6px' }}>
                  {currency.name}
                </span>
              </span>
              {value === currency.code && <Check size={13} style={{ color: '#F7931A' }} />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
