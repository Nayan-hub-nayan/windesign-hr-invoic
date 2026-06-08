import type { InvoiceMode } from '../constants'

export interface InvoiceItem {
  desc: string
  qty: number | string
  rate: number
}

export interface ProviderFields {
  pName: string
  pAddr: string
  pCountry: string
  pGstin: string
  pMobile: string
  pWeb: string
  pEmail: string
  pCin: string
}

export interface CustomerFields {
  cName: string
  cAddr: string
  cCountry: string
  cGstin: string
}

export interface BankFields {
  bName: string
  bAcc: string
  bIfsc: string
  bSwift: string
  bBank: string
  bBranch: string
}

export interface InvoiceSnapshot {
  p: ProviderFields
  c: CustomerFields
  b: BankFields
  invDate: string
  revCharge: string
  transport: string
  curr: string
  t1lbl: string
  t2lbl: string
  t1rate: string
  t2rate: string
  invNo: string
  pCin: string
  items: InvoiceItem[]
  mode: InvoiceMode
}

export interface InvoiceRecord {
  id: number
  mode: InvoiceMode
  invNo: string
  date: string
  month: string
  customer: string
  currency: string
  sub: number
  tax: number
  grand: number
  snapshot: InvoiceSnapshot
}

export interface SeqStore {
  IND: Record<string, number>
  INT: Record<string, number>
}

export interface BackupPayload {
  _type: 'windesign_hr_backup'
  _version: 1
  _exportedAt: string
  invoices: InvoiceRecord[]
  seq: SeqStore
}

export interface CalcResult {
  sub: number
  taxRows: [string, number][]
  tax: number
  grand: number
}
