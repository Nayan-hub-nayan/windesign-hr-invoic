import type { InvoiceMode } from '../constants'
import { LS, SEEDED, SEQ } from '../constants'
import type {
  CalcResult,
  InvoiceItem,
  InvoiceRecord,
  InvoiceSnapshot,
  SeqStore,
} from '../types'
import { load, save } from './storage'

export function calcInvoice(
  mode: InvoiceMode,
  items: InvoiceItem[],
  t1lbl: string,
  t2lbl: string,
  t1rate: string,
  t2rate: string,
): CalcResult {
  const sub = items.reduce((a, it) => {
    const q = typeof it.qty === 'number' ? it.qty : 1
    return a + q * it.rate
  }, 0)
  let taxRows: [string, number][] = []
  let tax = 0
  if (mode === 'IND') {
    const r1 = parseFloat(t1rate) || 0
    const r2 = parseFloat(t2rate) || 0
    const a1 = (sub * r1) / 100
    const a2 = (sub * r2) / 100
    taxRows = [
      [t1lbl, a1],
      [t2lbl, a2],
    ]
    tax = a1 + a2
  }
  return { sub, taxRows, tax, grand: sub + tax }
}

export function nextInvoiceNumber(
  mode: InvoiceMode,
  invDate: string,
  seq: SeqStore,
): string {
  const y = (invDate || '').slice(2, 4)
  const cur = (seq[mode][y] || 0) + 1
  return mode + y + String(cur).padStart(2, '0')
}

export function bumpSequence(
  mode: InvoiceMode,
  invDate: string,
  seq: SeqStore,
): SeqStore {
  const y = (invDate || '').slice(2, 4)
  const next = { ...seq, [mode]: { ...seq[mode] } }
  next[mode][y] = (next[mode][y] || 0) + 1
  return next
}

export function seedIfFirstRun(): void {
  if (localStorage.getItem(SEEDED)) return
  if (load<InvoiceRecord[]>(LS, []).length > 0) {
    localStorage.setItem(SEEDED, '1')
    return
  }

  const CIN = 'U62010MH2024OPC427928'

  const P = {
    pName: 'Windesign Labs (OPC) Pvt. Ltd.',
    pAddr:
      'FLAT NO 808 RACHANA, ASHWINI APT JAGDISH NAGAR, Katolroad, Nagpur, Nagpur- 440013, Maharashtra',
    pCountry: 'India',
    pGstin: '27AADCW8668C1ZZ',
    pMobile: '+919730627087',
    pWeb: 'windesign.io',
    pEmail: 'jitu@windesign.io',
    pCin: CIN,
  }
  const B = {
    bName: 'WINDESIGN LABS (OPC) PRIVATE LIMITED',
    bAcc: '87306270872',
    bIfsc: 'IDFB0042504',
    bSwift: 'IDFBINBBMUM',
    bBank: 'IDFC FIRST',
    bBranch: 'NAGPUR - BYRAMJI TOWN BRANCH',
  }
  function mk(
    mode: InvoiceMode,
    no: string,
    date: string,
    cust: string,
    cAddr: string,
    cCountry: string,
    cGstin: string,
    curr: string,
    desc: string,
    qty: number | string,
    rate: number,
    t1?: string,
    t2?: string,
  ): InvoiceRecord {
    const sub = typeof qty === 'number' ? qty * rate : rate
    const tax = mode === 'IND' ? sub * 0.09 * 2 : 0
    return {
      id: Date.now() + Math.floor(Math.random() * 100000),
      mode,
      invNo: no,
      date,
      month: date.slice(0, 7).replace('-', ''),
      customer: cust,
      currency: curr,
      sub,
      tax,
      grand: sub + tax,
      snapshot: {
        p: P,
        b: B,
        c: { cName: cust, cAddr, cCountry, cGstin: cGstin || '' },
        invDate: date,
        revCharge: 'No',
        transport: 'Digital',
        curr,
        t1lbl: t1 || 'IGST 9%',
        t2lbl: t2 || 'SGST 9%',
        t1rate: '9',
        t2rate: '9',
        invNo: no,
        pCin: CIN,
        mode,
        items: [{ desc, qty, rate }],
      },
    }
  }

  const seeds = [
    mk(
      'IND',
      'IND2601',
      '2026-04-09',
      'BRUCIRA ONLINE SOLUTIONS PRIVATE LIMITED',
      'Powai Plaza Chs Ltd, Powai, Mumbai',
      'India',
      '27AAHCB8903D1ZS',
      'INR',
      'Framer Website Development advance',
      1,
      60000,
    ),
    mk(
      'INT',
      'INT2601',
      '2026-04-04',
      'Dub Technologies INC',
      '2261 Market Street STE 5906 San Francisco, CA 94114',
      'USA',
      '',
      'USD',
      'Framer Partner commission - Dub Partners payout',
      'Multiple Commissions',
      6881.48,
    ),
    mk(
      'INT',
      'INT2602',
      '2026-04-12',
      'Leverbrands Ltd',
      '138 Hepworth Court. 30 Gatliff Road. SW1W 8QP',
      'United Kingdom',
      '',
      'USD',
      'Leverbrands website development',
      1,
      700,
    ),
    mk(
      'INT',
      'INT2603',
      '2026-04-20',
      'MatchMove Pay Pte Ltd',
      '137 Telok Ayer Street #03-03 Singapore 068602',
      'Singapore',
      '',
      'USD',
      'Matchmove Web Framer Development - Final payment',
      1,
      1800,
    ),
    mk(
      'INT',
      'INT2604',
      '2026-04-22',
      'Dub Technologies INC',
      '2261 Market Street STE 5906 San Francisco, CA 94114',
      'USA',
      '',
      'USD',
      'Framer Partner commission - Dub Partners payout',
      'Multiple Commissions',
      5000,
    ),
  ]
  seeds.reverse()
  save(LS, seeds)
  save(SEQ, { IND: { '26': 1 }, INT: { '26': 4 } })
  localStorage.setItem(SEEDED, '1')
}

export function getDefaultProvider() {
  return {
    pName: 'Windesign Labs (OPC) Pvt. Ltd.',
    pAddr:
      'FLAT NO 808 RACHANA, ASHWINI APT JAGDISH NAGAR, Katolroad, Nagpur, Nagpur- 440013, Maharashtra',
    pCountry: 'India',
    pGstin: '27AADCW8668C1ZZ',
    pMobile: '+919730627087',
    pWeb: 'windesign.io',
    pEmail: 'jitu@windesign.io',
    pCin: 'U62010MH2024OPC427928',
  }
}

export function getDefaultCustomer() {
  return {
    cName: 'BRUCIRA ONLINE SOLUTIONS PRIVATE LIMITED',
    cAddr: 'Powai Plaza Chs Ltd, Powai, Mumbai',
    cCountry: 'India',
    cGstin: '27AAHCB8903D1ZS',
  }
}

export function getDefaultBank() {
  return {
    bName: 'WINDESIGN LABS (OPC) PRIVATE LIMITED',
    bAcc: '87306270872',
    bIfsc: 'IDFB0042504',
    bSwift: 'IDFBINBBMUM',
    bBank: 'IDFC FIRST',
    bBranch: 'NAGPUR - BYRAMJI TOWN BRANCH',
  }
}

export function snapshotFromForm(
  mode: InvoiceMode,
  provider: InvoiceSnapshot['p'],
  customer: InvoiceSnapshot['c'],
  bank: InvoiceSnapshot['b'],
  meta: Omit<
    InvoiceSnapshot,
    'p' | 'c' | 'b' | 'items' | 'mode' | 'pCin'
  > & { pCin: string },
  items: InvoiceItem[],
): InvoiceSnapshot {
  return {
    p: provider,
    c: customer,
    b: bank,
    ...meta,
    mode,
    items: JSON.parse(JSON.stringify(items)),
  }
}

export function loadSeq(): SeqStore {
  return load(SEQ, { IND: {}, INT: {} })
}

export function saveSeq(seq: SeqStore): void {
  save(SEQ, seq)
}

export function loadInvoices(): InvoiceRecord[] {
  return load(LS, [])
}

export function saveInvoices(invoices: InvoiceRecord[]): void {
  save(LS, invoices)
}
