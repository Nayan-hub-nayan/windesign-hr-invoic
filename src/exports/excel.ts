import * as XLSX from 'xlsx'
import { CUR } from '../constants'
import type { InvoiceRecord } from '../types'
import { fmtDate } from '../utils/formatters'
import { loadInvoices } from '../utils/invoice'

export function exportExcel(): void {
  const all = loadInvoices()
  if (!all.length) {
    alert('No invoices to export.')
    return
  }
  const data = all.map((r) => ({
    'Invoice No': r.invNo,
    Type: r.mode === 'IND' ? 'India GST' : 'Export',
    Date: fmtDate(r.date),
    Month: r.month,
    Customer: r.customer,
    Currency: r.currency,
    Subtotal: r.sub,
    Tax: r.tax,
    Total: r.grand,
  }))
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(data)
  ws['!cols'] = [
    { wch: 14 },
    { wch: 12 },
    { wch: 16 },
    { wch: 9 },
    { wch: 38 },
    { wch: 9 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
  ]
  XLSX.utils.book_append_sheet(wb, ws, 'All Invoices')
  const ind = data.filter((d) => d.Type === 'India GST')
  const intl = data.filter((d) => d.Type === 'Export')
  if (ind.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(ind), 'Indian')
  if (intl.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(intl), 'International')
  XLSX.writeFile(wb, 'Windesign_Invoices_' + new Date().toISOString().slice(0, 10) + '.xlsx')
}

export function formatHistoryAmount(r: InvoiceRecord): string {
  return (CUR[r.currency] || '') + Number(r.grand).toLocaleString('en-IN')
}
