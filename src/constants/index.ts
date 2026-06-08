export const CUR: Record<string, string> = {
  INR: '\u20B9',
  USD: '$',
  GBP: '\u00A3',
  EUR: '\u20AC',
  AED: 'AED ',
}

export const LS = 'windesign_invoices_v2'
export const SEQ = 'windesign_seq_v2'
export const SEEDED = 'windesign_seeded_v2'

export type TabId =
  | 'invoice'
  | 'history'
  | 'offer'
  | 'internship'
  | 'appraisal'
  | 'payslip'

export const NAV_TABS: { id: TabId; label: string }[] = [
  { id: 'invoice', label: 'Create Invoice' },
  { id: 'history', label: 'Invoice History' },
  { id: 'offer', label: 'Offer Letter' },
  { id: 'internship', label: 'Internship Letter' },
  { id: 'appraisal', label: 'Appraisal Letter' },
  { id: 'payslip', label: 'Salary Slip' },
]

export type InvoiceMode = 'IND' | 'INT'
