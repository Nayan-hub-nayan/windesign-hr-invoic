import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { InvoiceRecord, InvoiceSnapshot } from '../../types'
import { loadInvoices } from '../../utils/invoice'
import { esc, fmtDate } from '../../utils/formatters'
import { BtnPrimary, BtnSecondary } from '../ui'
import {
  backupData,
  deleteInvoice,
  getUniqueMonths,
  monthLabel,
  restoreData,
} from '../../exports/backup'
import { exportExcel, formatHistoryAmount } from '../../exports/excel'

interface InvoiceHistoryTabProps {
  refreshKey: number
  onOpenInvoice: (snapshot: InvoiceSnapshot) => void
  onUseTemplate: (snapshot: InvoiceSnapshot) => void
  onGoToInvoice: () => void
}

export function InvoiceHistoryTab({
  refreshKey,
  onOpenInvoice,
  onUseTemplate,
  onGoToInvoice,
}: InvoiceHistoryTabProps) {
  const [fType, setFType] = useState('')
  const [fMonth, setFMonth] = useState('')
  const [invoices, setInvoices] = useState<InvoiceRecord[]>(() => loadInvoices())
  const restoreRef = useRef<HTMLInputElement>(null)

  const reload = useCallback(() => setInvoices(loadInvoices()), [])

  useEffect(() => {
    void refreshKey
    reload()
  }, [refreshKey, reload])

  const months = useMemo(() => getUniqueMonths(invoices), [invoices])

  const filtered = useMemo(
    () =>
      invoices.filter(
        (r) => (!fType || r.mode === fType) && (!fMonth || r.month === fMonth),
      ),
    [invoices, fType, fMonth],
  )

  const stats = useMemo(
    () => ({
      count: invoices.length,
      ind: invoices.filter((r) => r.mode === 'IND').length,
      int: invoices.filter((r) => r.mode === 'INT').length,
    }),
    [invoices],
  )

  const handleDelete = (id: number) => {
    if (!confirm('Remove this invoice from history? (This does not roll back its number.)')) return
    setInvoices(deleteInvoice(id))
  }

  const handleTemplate = (r: InvoiceRecord) => {
    onUseTemplate(r.snapshot)
    onGoToInvoice()
    alert(
      'Template loaded from ' +
        r.invNo +
        '.\n\nReused: provider, customer, bank, tax & currency setup.\nReset for you: date (today), invoice number (new), and amounts (set to 0).\n\nJust update the amount(s) and save.',
    )
  }

  return (
    <div className="max-w-[1280px] mx-auto my-7 px-8">
      <div className="bg-card border border-line overflow-hidden">
        <div className="py-5 px-6 flex justify-between items-center border-b border-line flex-wrap gap-2.5">
          <div>
            <h2 className="font-playfair text-xl text-green">Invoice History</h2>
            <div className="flex gap-6 text-[11px] text-muted mt-2">
              <div>
                <b className="text-green text-lg font-playfair block">{stats.count}</b>
                Total invoices
              </div>
              <div>
                <b className="text-green text-lg font-playfair block">{stats.ind}</b>
                Indian
              </div>
              <div>
                <b className="text-green text-lg font-playfair block">{stats.int}</b>
                International
              </div>
            </div>
          </div>
          <div className="flex gap-2 items-center flex-wrap">
            <select
              value={fType}
              onChange={(e) => setFType(e.target.value)}
              className="py-[7px] px-2.5 text-xs w-auto font-serif border border-line"
            >
              <option value="">All types</option>
              <option value="IND">Indian only</option>
              <option value="INT">International only</option>
            </select>
            <select
              value={fMonth}
              onChange={(e) => setFMonth(e.target.value)}
              className="py-[7px] px-2.5 text-xs w-auto font-serif border border-line"
            >
              <option value="">All months</option>
              {months.map((m) => (
                <option key={m} value={m}>
                  {monthLabel(m)}
                </option>
              ))}
            </select>
            <BtnSecondary onClick={exportExcel} className="!py-2 !px-3.5">
              Export Excel
            </BtnSecondary>
            <BtnPrimary onClick={backupData} className="!col-span-1 !py-2 !px-3.5">
              Backup All Data
            </BtnPrimary>
            <BtnSecondary
              onClick={() => restoreRef.current?.click()}
              className="!py-2 !px-3.5"
            >
              Restore from Backup
            </BtnSecondary>
            <input
              ref={restoreRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                e.target.value = ''
                if (file) restoreData(file, reload)
              }}
            />
          </div>
        </div>

        {!filtered.length ? (
          <div className="py-[60px] px-5 text-center text-muted text-[13px] italic">
            No invoices yet. Create one and click &ldquo;Save to History&rdquo;.
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="bg-green-light text-[10px] uppercase tracking-[0.8px] text-green py-3 px-4 text-left font-bold">
                  Invoice No.
                </th>
                <th className="bg-green-light text-[10px] uppercase tracking-[0.8px] text-green py-3 px-4 text-left font-bold">
                  Type
                </th>
                <th className="bg-green-light text-[10px] uppercase tracking-[0.8px] text-green py-3 px-4 text-left font-bold">
                  Date
                </th>
                <th className="bg-green-light text-[10px] uppercase tracking-[0.8px] text-green py-3 px-4 text-left font-bold">
                  Customer
                </th>
                <th className="bg-green-light text-[10px] uppercase tracking-[0.8px] text-green py-3 px-4 text-left font-bold">
                  Amount
                </th>
                <th className="bg-green-light text-[10px] uppercase tracking-[0.8px] text-green py-3 px-4 text-left font-bold">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="group hover:[&>td]:bg-gold-light">
                  <td className="py-3 px-4 text-xs border-b border-line">
                    <b>{esc(r.invNo)}</b>
                  </td>
                  <td className="py-3 px-4 text-xs border-b border-line">
                    <span
                      className={`text-[10px] font-semibold py-[3px] px-2 border ${
                        r.mode === 'IND'
                          ? 'bg-green-light text-green border-[#aacfbc]'
                          : 'bg-gold-light text-[#7a5c1e] border-[#d4aa6a]'
                      }`}
                    >
                      {r.mode === 'IND' ? 'India GST' : 'Export'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-xs border-b border-line">{fmtDate(r.date)}</td>
                  <td className="py-3 px-4 text-xs border-b border-line">{esc(r.customer)}</td>
                  <td className="py-3 px-4 text-xs border-b border-line">
                    <b>{formatHistoryAmount(r)}</b>
                  </td>
                  <td className="py-3 px-4 text-xs border-b border-line">
                    <button
                      type="button"
                      onClick={() => {
                        onOpenInvoice(r.snapshot)
                        onGoToInvoice()
                      }}
                      className="bg-transparent border border-line py-[5px] px-2.5 text-[11px] cursor-pointer mr-1 font-serif transition-colors hover:border-green hover:text-green"
                    >
                      Open
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTemplate(r)}
                      className="bg-transparent border border-green text-green font-semibold py-[5px] px-2.5 text-[11px] cursor-pointer mr-1 font-serif transition-colors hover:bg-green hover:text-white"
                    >
                      Use as Template
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(r.id)}
                      className="bg-transparent border border-line py-[5px] px-2.5 text-[11px] cursor-pointer font-serif transition-colors hover:border-danger hover:text-danger"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
