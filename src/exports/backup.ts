import { LS, SEQ } from '../constants'
import type { BackupPayload, InvoiceRecord, SeqStore } from '../types'
import { load, save } from '../utils/storage'
import { loadInvoices, saveInvoices, saveSeq } from '../utils/invoice'

export function backupData(): void {
  const payload: BackupPayload = {
    _type: 'windesign_hr_backup',
    _version: 1,
    _exportedAt: new Date().toISOString(),
    invoices: loadInvoices(),
    seq: load(SEQ, { IND: {}, INT: {} }),
  }
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = 'Windesign_Backup_' + new Date().toISOString().slice(0, 10) + '.json'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(a.href)
  alert(
    'Backup downloaded.\n' +
      payload.invoices.length +
      ' invoice(s) saved.\n\nKeep this file safe (Google Drive / a backup folder). You can restore it any time, even after clearing browser data.',
  )
}

export function restoreData(file: File, onDone: () => void): void {
  const reader = new FileReader()
  reader.onload = (e) => {
    let data: BackupPayload
    try {
      data = JSON.parse(e.target?.result as string)
    } catch {
      alert('That file is not a valid backup (could not read JSON).')
      return
    }
    if (!data || data._type !== 'windesign_hr_backup' || !Array.isArray(data.invoices)) {
      alert(
        'That file is not a Windesign backup file. Please choose a file created by the "Backup All Data" button.',
      )
      return
    }
    const existing = loadInvoices()
    const msg =
      'This backup contains ' +
      data.invoices.length +
      ' invoice(s) (exported ' +
      (data._exportedAt ? new Date(data._exportedAt).toLocaleString() : 'unknown date') +
      ').\n\n'
    let mode: 'merge' | 'replace'
    if (existing.length) {
      mode = confirm(
        msg +
          'You currently have ' +
          existing.length +
          ' invoice(s) in this browser.\n\n' +
          'OK = MERGE backup into current data (keeps both, skips duplicates)\n' +
          'Cancel = REPLACE everything with the backup',
      )
        ? 'merge'
        : 'replace'
    } else {
      if (!confirm(msg + 'Restore these records now?')) return
      mode = 'replace'
    }
    if (mode === 'replace') {
      saveInvoices(data.invoices)
      saveSeq(data.seq || { IND: {}, INT: {} })
    } else {
      const ids: Record<number, number> = {}
      const nums: Record<string, number> = {}
      existing.forEach((r) => {
        ids[r.id] = 1
        nums[r.invNo] = 1
      })
      let added = 0
      data.invoices.forEach((r) => {
        if (!ids[r.id] && !nums[r.invNo]) {
          existing.push(r)
          added++
        }
      })
      existing.sort((a, b) => b.id - a.id)
      saveInvoices(existing)
      const seq = load<SeqStore>(SEQ, { IND: {}, INT: {} })
      const bseq = data.seq || { IND: {}, INT: {} }
      ;(['IND', 'INT'] as const).forEach((t) => {
        seq[t] = seq[t] || {}
        bseq[t] = bseq[t] || {}
        Object.keys(bseq[t]).forEach((ym) => {
          seq[t][ym] = Math.max(seq[t][ym] || 0, bseq[t][ym] || 0)
        })
      })
      save(SEQ, seq)
      alert(
        added +
          ' new invoice(s) added from backup (' +
          (data.invoices.length - added) +
          ' were already present and skipped).',
      )
    }
    onDone()
    if (mode === 'replace') alert('Restore complete. ' + data.invoices.length + ' invoice(s) loaded.')
  }
  reader.readAsText(file)
}

export function deleteInvoice(id: number): InvoiceRecord[] {
  const next = loadInvoices().filter((x) => x.id !== id)
  save(LS, next)
  return next
}

export function getUniqueMonths(invoices: InvoiceRecord[]): string[] {
  return Array.from(new Set(invoices.map((r) => r.month))).sort().reverse()
}

export function monthLabel(m: string): string {
  const y = m.slice(0, 4)
  const mo = new Date(Number(y), Number(m.slice(4)) - 1).toLocaleString('en', {
    month: 'long',
  })
  return mo + ' ' + y
}
