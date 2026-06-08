import type { ReactNode } from 'react'
import { SIG_B64 } from '../../constants/signature'
import { fmtDate } from '../../utils/formatters'

export function LetterHead({ subtitle }: { subtitle: string }) {
  return (
    <div className="pt-7 px-9 pb-0">
      <div className="flex justify-between items-start pb-4 border-b-2 border-green">
        <div>
          <div className="font-playfair text-xl font-bold text-green">
            Windesign Labs (OPC) Pvt. Ltd.
          </div>
          <div className="text-[10px] text-muted mt-[3px] italic">
            FLAT NO 808 RACHANA, ASHWINI APT JAGDISH NAGAR, Katolroad, Nagpur - 440013, Maharashtra
          </div>
          <div className="text-[10px] text-muted">
            CIN: U62010MH2024OPC427928 &nbsp;|&nbsp; GSTIN: 27AADCW8668C1ZZ &nbsp;|&nbsp; windesign.io
          </div>
        </div>
        <div className="text-right font-playfair text-[13px] font-bold text-gold tracking-wide uppercase mt-1">
          {subtitle}
        </div>
      </div>
    </div>
  )
}

export function LetterFooter({ dateStr }: { dateStr: string }) {
  return (
    <div className="px-9 pt-6 pb-7">
      <div className="flex justify-between items-end mt-9">
        <div className="text-[10px] text-muted">
          <div className="font-bold text-green text-[11px]">Windesign Labs (OPC) Pvt. Ltd.</div>
          <div>Date: {dateStr ? fmtDate(dateStr) : ''}</div>
        </div>
        <div className="text-center">
          <img src={SIG_B64} alt="Signature" className="h-11 block mb-0.5" />
          <div className="text-[9px] text-[#888] border-t border-[#ccc] pt-1 w-[140px]">
            Authorised Signatory
          </div>
        </div>
      </div>
      <div className="mt-[18px] pt-3 border-t border-[#e4e0d8] bg-green-light px-4 py-2.5 text-[9px] text-green">
        Windesign Labs (OPC) Pvt. Ltd. &nbsp;·&nbsp; +919730627087 &nbsp;·&nbsp; jitu@windesign.io
        &nbsp;·&nbsp; windesign.io
      </div>
    </div>
  )
}

export function LetterPaper({ children }: { children: ReactNode }) {
  return (
    <div className="bg-white max-w-[600px] mx-auto shadow-[0_4px_20px_rgba(0,0,0,0.15)]">
      {children}
    </div>
  )
}

export function LetterBody({ children }: { children: ReactNode }) {
  return (
    <div className="px-9 py-5 text-[11px] font-serif leading-[1.7] text-[#222]">{children}</div>
  )
}

export function DetailTable({
  title,
  rows,
}: {
  title: string
  rows: { label: string; value: string }[]
}) {
  return (
    <div className="border border-[#ddd] mb-4">
      <div className="bg-green text-white py-2 px-3 text-[10px] tracking-wide font-bold">
        {title}
      </div>
      <table className="w-full border-collapse text-[10.5px]">
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-[#eee]">
              <td className="py-[7px] px-3 text-[#555] text-[10px]">{row.label}</td>
              <td className="py-[7px] px-3 font-semibold">{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function CtcTable({
  title,
  rows,
  total,
  monthly,
}: {
  title: string
  rows: { label: string; value: number }[]
  total: number
  monthly?: boolean
}) {
  const fmt = (n: number) => '\u20B9' + Number(n).toLocaleString('en-IN')
  return (
    <div className="border border-[#ddd] mb-4">
      <div className="bg-green text-white py-2 px-3 text-[10px] tracking-wide font-bold">
        {title}
      </div>
      <table className="w-full border-collapse text-[10.5px]">
        <tbody>
          {rows.map(
            (row) =>
              row.value > 0 && (
                <tr key={row.label} className="border-b border-[#eee]">
                  <td className="py-[7px] px-3">{row.label}</td>
                  <td className="py-[7px] px-3 text-right">{fmt(row.value)}</td>
                </tr>
              ),
          )}
          <tr className="bg-green-light font-bold">
            <td className="py-2 px-3">Total Cost to Company (CTC)</td>
            <td className="py-2 px-3 text-right text-green">
              {fmt(total)} per annum
            </td>
          </tr>
          {monthly && (
            <tr>
              <td className="py-1.5 px-3 text-[#555] text-[9.5px]">Monthly In-hand (approx.)</td>
              <td className="py-1.5 px-3 text-right text-[#555] text-[9.5px]">
                {fmt(Math.round(total / 12))} per month
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export function internDuration(start: string, end: string): string {
  const s = new Date(start)
  const e = new Date(end)
  if (isNaN(s.getTime()) || isNaN(e.getTime())) return '—'
  const diff = Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24))
  if (diff < 0) return '—'
  const months = Math.floor(diff / 30)
  const days = diff % 30
  const parts: string[] = []
  if (months) parts.push(months + ' month' + (months > 1 ? 's' : ''))
  if (days) parts.push(days + ' day' + (days > 1 ? 's' : ''))
  return parts.join(' ') || '0 days'
}

export function firstName(full: string): string {
  return full.split(' ')[0] || full
}
