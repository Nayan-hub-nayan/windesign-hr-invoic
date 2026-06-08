import { jsPDF } from 'jspdf'
import { SIG_B64 } from '../constants/signature'
import { CUR } from '../constants'
import type {
  BankFields,
  CalcResult,
  CustomerFields,
  InvoiceItem,
  ProviderFields,
} from '../types'
import type { InvoiceMode } from '../constants'
import { fmtDate } from '../utils/formatters'

export interface InvoiceExportData {
  mode: InvoiceMode
  provider: ProviderFields
  customer: CustomerFields
  bank: BankFields
  invNo: string
  invDate: string
  revCharge: string
  transport: string
  curr: string
  items: InvoiceItem[]
  t1lbl: string
  t2lbl: string
  t1rate: string
  t2rate: string
  calc: CalcResult
}

export function exportInvoicePDF(data: InvoiceExportData): void {
  const {
    mode,
    provider,
    customer,
    bank,
    invNo,
    invDate,
    revCharge,
    transport,
    curr,
    items,
    calc,
  } = data
  const ind = mode === 'IND'
  const doc = new jsPDF('p', 'pt', 'a4')
  const currLabel = curr === 'INR' ? 'Rs.' : CUR[curr] || curr + ' '
  const moneyPDF = (n: number) =>
    currLabel +
    Number(n).toLocaleString('en-IN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })

  const L = 44
  const R = 551
  const PW = 507
  let y = 0
  const cGREEN = [31, 78, 61] as const
  const cGOLD = [176, 137, 72] as const
  const cMUTED = [110, 100, 96] as const
  const cINK = [28, 28, 28] as const
  const cLINE = [210, 205, 198] as const

  y = 40
  doc.setFont('times', 'bold')
  doc.setFontSize(20)
  doc.setTextColor(cINK[0], cINK[1], cINK[2])
  doc.text(provider.pName, L, y)
  doc.setFont('times', 'bold')
  doc.setFontSize(32)
  doc.setTextColor(cGREEN[0], cGREEN[1], cGREEN[2])
  doc.text(ind ? 'INVOICE' : 'EXPORT INVOICE', R, y, { align: 'right' })
  y += 14
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(cMUTED[0], cMUTED[1], cMUTED[2])
  doc.text('INVOICE FOR DESIGN SERVICES', L, y)
  doc.setFont('times', 'italic')
  doc.setFontSize(9)
  doc.text(
    ind
      ? 'GST Invoice  \u00B7  CIN: ' + provider.pCin
      : 'Export Invoice  \u00B7  Zero-rated export of services',
    R,
    y,
    { align: 'right' },
  )

  y += 12
  doc.setDrawColor(cGOLD[0], cGOLD[1], cGOLD[2])
  doc.setLineWidth(2)
  doc.line(L, y, R, y)
  y += 18

  const metaCols: [string, string][] = [
    ['INVOICE NO.', invNo],
    ['DATE', fmtDate(invDate)],
    ['REVERSE\nCHARGE', revCharge],
    ['TRANSPORT', transport],
  ]
  if (ind) metaCols.push(['GSTIN\n(PROVIDER)', provider.pGstin])
  const colW = PW / metaCols.length
  metaCols.forEach((col, i) => {
    const cx = L + i * colW
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7)
    doc.setTextColor(cGOLD[0], cGOLD[1], cGOLD[2])
    const labelLines = col[0].split('\n')
    labelLines.forEach((ll, li) => doc.text(ll, cx, y + li * 9))
    doc.setFont('times', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(cINK[0], cINK[1], cINK[2])
    doc.text(String(col[1] || ''), cx, y + labelLines.length * 9 + 2)
  })
  y += 38
  doc.setDrawColor(cLINE[0], cLINE[1], cLINE[2])
  doc.setLineWidth(0.5)
  doc.line(L, y, R, y)
  y += 16

  function addrBlock(label: string, lines: string[], x: number, startY: number, maxW: number) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(cGOLD[0], cGOLD[1], cGOLD[2])
    doc.text(label, x, startY)
    let yy = startY + 14
    lines.forEach((ln) => {
      if (!ln) return
      if (yy === startY + 14) doc.setFont('times', 'bold')
      else doc.setFont('times', 'normal')
      doc.setFontSize(9)
      doc.setTextColor(cINK[0], cINK[1], cINK[2])
      doc.splitTextToSize(String(ln), maxW).forEach((l: string) => {
        doc.text(l, x, yy)
        yy += 12
      })
    })
    return yy
  }

  const half = (PW - 20) / 2
  const fromLines = [
    provider.pName,
    provider.pAddr,
    provider.pCountry,
    provider.pMobile + ' \u00B7 ' + provider.pWeb,
    provider.pEmail,
  ]
  if (ind) fromLines.push('GSTIN: ' + provider.pGstin)
  const toLines = [customer.cName, customer.cAddr, customer.cCountry]
  if (ind && customer.cGstin) toLines.push('GSTIN: ' + customer.cGstin)
  const y1 = addrBlock('FROM (PROVIDER)', fromLines, L, y, half)
  const y2 = addrBlock('CUSTOMER DETAILS', toLines, L + half + 20, y, half)
  y = Math.max(y1, y2) + 18

  doc.setFillColor(cGREEN[0], cGREEN[1], cGREEN[2])
  doc.rect(L, y, PW, 24, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.5)
  doc.setTextColor(255, 255, 255)
  doc.text('SR. NO.', L + 8, y + 15)
  doc.text('SERVICE NAME', L + 70, y + 15)
  doc.text('DURATION / QTY', L + 295, y + 15, { align: 'center' })
  doc.text('RATE', L + 390, y + 15, { align: 'right' })
  doc.text('TOTAL', PW + L, y + 15, { align: 'right' })
  y += 24

  items.forEach((it, i) => {
    const q = typeof it.qty === 'number' ? it.qty : 1
    const descLines = doc.splitTextToSize(it.desc || '', 210)
    const rowH = Math.max(26, descLines.length * 13 + 10)
    if (i % 2 === 1) {
      doc.setFillColor(248, 246, 242)
      doc.rect(L, y, PW, rowH, 'F')
    }
    doc.setFont('times', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(cINK[0], cINK[1], cINK[2])
    doc.text(String(i + 1), L + 8, y + 16)
    doc.text(descLines, L + 70, y + 16)
    doc.text(String(it.qty), L + 295, y + 16, { align: 'center' })
    doc.text(moneyPDF(it.rate), L + 390, y + 16, { align: 'right' })
    doc.text(moneyPDF(q * it.rate), PW + L, y + 16, { align: 'right' })
    doc.setDrawColor(cLINE[0], cLINE[1], cLINE[2])
    doc.setLineWidth(0.4)
    doc.line(L, y + rowH, R, y + rowH)
    y += rowH
  })
  y += 10

  const txL = L + PW * 0.5
  if (ind) {
    calc.taxRows.forEach((t) => {
      doc.setFont('times', 'normal')
      doc.setFontSize(10)
      doc.setTextColor(cMUTED[0], cMUTED[1], cMUTED[2])
      doc.text(t[0] + ' :', txL, y)
      doc.text(moneyPDF(t[1]), R, y, { align: 'right' })
      y += 16
    })
  }
  doc.setDrawColor(cGREEN[0], cGREEN[1], cGREEN[2])
  doc.setLineWidth(1)
  doc.line(txL, y, R, y)
  y += 10
  doc.setFont('times', 'bold')
  doc.setFontSize(15)
  doc.setTextColor(cGREEN[0], cGREEN[1], cGREEN[2])
  doc.text('Total Amount' + (ind ? '' : ' (' + curr + ')') + ' :', txL, y + 4)
  doc.text(moneyPDF(calc.grand), R, y + 4, { align: 'right' })
  y += 30

  doc.setDrawColor(cLINE[0], cLINE[1], cLINE[2])
  doc.setLineWidth(0.5)
  doc.line(L, y, R, y)
  y += 16
  doc.setFont('times', 'italic')
  doc.setFontSize(9)
  doc.setTextColor(cMUTED[0], cMUTED[1], cMUTED[2])
  doc.text('Declaration: The particulars given above are true and correct.', L, y)
  const sigW = 100
  const sigH = 40
  doc.addImage(SIG_B64, 'PNG', R - sigW, y - 14, sigW, sigH)
  y += 30
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(cMUTED[0], cMUTED[1], cMUTED[2])
  doc.text('Authorise Signature', R, y, { align: 'right' })
  y += 20

  doc.setFillColor(232, 240, 236)
  doc.rect(L - 4, y, PW + 8, 4, 'F')
  doc.setFillColor(cGREEN[0], cGREEN[1], cGREEN[2])
  doc.rect(L - 4, y, PW + 8, 3, 'F')
  y += 12
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(cGREEN[0], cGREEN[1], cGREEN[2])
  doc.text('BANK DETAILS', L, y)
  y += 13
  doc.setFont('times', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(60, 55, 52)
  const bk = [
    ['Name: ' + bank.bName, 'SWIFT: ' + bank.bSwift],
    ['Account: ' + bank.bAcc, 'Bank: ' + bank.bBank],
    ['IFSC: ' + bank.bIfsc, 'Branch: ' + bank.bBranch],
  ]
  bk.forEach((r) => {
    doc.text(r[0], L, y)
    doc.text(r[1], L + PW / 2 + 10, y)
    y += 13
  })
  y += 4
  doc.setFont('times', 'italic')
  doc.setFontSize(8.5)
  doc.setTextColor(cMUTED[0], cMUTED[1], cMUTED[2])
  doc.text('Payment within 15 days via money transfer only.', L, y)

  doc.save(invNo + '.pdf')
}
