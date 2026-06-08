import { CUR } from '../constants'

export function esc(s: string | number | undefined | null): string {
  return String(s ?? '').replace(/[&<>"]/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] ?? c,
  )
}

export function curSym(currency: string): string {
  return CUR[currency] ?? ''
}

export function money(n: number, currency: string): string {
  return (
    curSym(currency) +
    Number(n).toLocaleString('en-IN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })
  )
}

export function fmtDate(d: string): string {
  if (!d) return ''
  const x = new Date(d)
  return `${x.getDate()} ${x.toLocaleString('en', { month: 'long' })} ${x.getFullYear()}`
}

export function fmtRupee(n: number): string {
  return '\u20B9' + Number(n).toLocaleString('en-IN')
}

export function fmtRupeePDF(n: number): string {
  return 'Rs.' + Number(n).toLocaleString('en-IN')
}

export function pad2(n: number): string {
  return String(n).padStart(2, '0')
}

export function yy(dateStr: string): string {
  return (dateStr || '').slice(2, 4)
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

export function addDaysISO(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}
