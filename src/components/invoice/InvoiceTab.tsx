import { useCallback, useEffect, useMemo, useState } from 'react'
import type { InvoiceMode } from '../../constants'
import type { BankFields, CustomerFields, InvoiceItem, ProviderFields } from '../../types'
import {
  BtnPrimary,
  BtnSecondary,
  Fieldset,
  FormActions,
  FormPanel,
  Hint,
  Label,
  PreviewShell,
  SegmentedControl,
  SelectInput,
  TextArea,
  TextInput,
  ThreeCol,
  TwoCol,
} from '../ui'
import { InvoicePaper } from './InvoicePaper'
import {
  bumpSequence,
  calcInvoice,
  getDefaultBank,
  getDefaultCustomer,
  getDefaultProvider,
  loadInvoices,
  loadSeq,
  nextInvoiceNumber,
  saveInvoices,
  saveSeq,
  snapshotFromForm,
} from '../../utils/invoice'
import { todayISO } from '../../utils/formatters'
import { exportInvoicePDF } from '../../exports/invoicePdf'
import { exportInvoiceWord } from '../../exports/invoiceWord'

const MODE_HINTS: Record<InvoiceMode, string> = {
  IND: 'GST Invoice: shows CIN, your & customer GSTIN, two editable tax lines (your template uses IGST 9% + SGST 9%). Numbering prefix: IND.',
  INT: 'Export Invoice: no GST/tax shown, foreign currency, customer GSTIN hidden. Numbering prefix: INT.',
}

interface InvoiceTabProps {
  onSaved?: () => void
  openSnapshot?: import('../../types').InvoiceSnapshot | null
  templateSnapshot?: import('../../types').InvoiceSnapshot | null
  onSnapshotConsumed?: () => void
}

function applySnapshot(
  snapshot: import('../../types').InvoiceSnapshot,
  setters: {
    setMode: (m: InvoiceMode) => void
    setProvider: (p: ProviderFields) => void
    setCustomer: (p: CustomerFields) => void
    setBank: (p: BankFields) => void
    setRevCharge: (v: string) => void
    setTransport: (v: string) => void
    setCurr: (v: string) => void
    setT1lbl: (v: string) => void
    setT2lbl: (v: string) => void
    setT1rate: (v: string) => void
    setT2rate: (v: string) => void
    setItems: (items: InvoiceItem[]) => void
    setInvDate: (v: string) => void
    setInvNo: (v: string) => void
  },
  options: { resetAmounts?: boolean; invDate?: string },
) {
  setters.setMode(snapshot.mode)
  setters.setProvider({ ...snapshot.p, pCin: snapshot.pCin })
  setters.setCustomer(snapshot.c)
  setters.setBank(snapshot.b)
  setters.setRevCharge(snapshot.revCharge)
  setters.setTransport(snapshot.transport)
  setters.setCurr(snapshot.curr)
  setters.setT1lbl(snapshot.t1lbl)
  setters.setT2lbl(snapshot.t2lbl)
  setters.setT1rate(snapshot.t1rate)
  setters.setT2rate(snapshot.t2rate)
  setters.setItems(
    options.resetAmounts
      ? snapshot.items.map((it) => ({ ...it, rate: 0 }))
      : JSON.parse(JSON.stringify(snapshot.items)),
  )
  setters.setInvDate(options.invDate ?? snapshot.invDate)
  if (!options.resetAmounts) setters.setInvNo(snapshot.invNo)
}

export function InvoiceTab({
  onSaved,
  openSnapshot,
  templateSnapshot,
  onSnapshotConsumed,
}: InvoiceTabProps) {
  const [mode, setMode] = useState<InvoiceMode>('IND')
  const [provider, setProvider] = useState(getDefaultProvider)
  const [customer, setCustomer] = useState(getDefaultCustomer)
  const [bank, setBank] = useState(getDefaultBank)
  const [invDate, setInvDate] = useState(todayISO())
  const [invNo, setInvNo] = useState('')
  const [revCharge, setRevCharge] = useState('No')
  const [transport, setTransport] = useState('Digital')
  const [curr, setCurr] = useState('INR')
  const [t1lbl, setT1lbl] = useState('IGST 9%')
  const [t2lbl, setT2lbl] = useState('SGST 9%')
  const [t1rate, setT1rate] = useState('9')
  const [t2rate, setT2rate] = useState('9')
  const [items, setItems] = useState<InvoiceItem[]>([
    { desc: 'Framer Website Development advance', qty: 1, rate: 60000 },
  ])

  const refreshNumber = useCallback(() => {
    const seq = loadSeq()
    setInvNo(nextInvoiceNumber(mode, invDate, seq))
  }, [mode, invDate])

  useEffect(() => {
    refreshNumber()
  }, [refreshNumber])

  useEffect(() => {
    if (!openSnapshot) return
    applySnapshot(
      openSnapshot,
      {
        setMode,
        setProvider,
        setCustomer,
        setBank,
        setRevCharge,
        setTransport,
        setCurr,
        setT1lbl,
        setT2lbl,
        setT1rate,
        setT2rate,
        setItems,
        setInvDate,
        setInvNo,
      },
      {},
    )
    onSnapshotConsumed?.()
  }, [openSnapshot, onSnapshotConsumed])

  useEffect(() => {
    if (!templateSnapshot) return
    applySnapshot(
      templateSnapshot,
      {
        setMode,
        setProvider,
        setCustomer,
        setBank,
        setRevCharge,
        setTransport,
        setCurr,
        setT1lbl,
        setT2lbl,
        setT1rate,
        setT2rate,
        setItems,
        setInvDate,
        setInvNo,
      },
      { resetAmounts: true, invDate: todayISO() },
    )
    onSnapshotConsumed?.()
  }, [templateSnapshot, onSnapshotConsumed])

  const setModeAndDefaults = (m: InvoiceMode) => {
    setMode(m)
    setCurr(m === 'IND' ? 'INR' : 'USD')
  }

  const calc = useMemo(
    () => calcInvoice(mode, items, t1lbl, t2lbl, t1rate, t2rate),
    [mode, items, t1lbl, t2lbl, t1rate, t2rate],
  )

  const updateProvider = (k: keyof ProviderFields, v: string) =>
    setProvider((p) => ({ ...p, [k]: v }))
  const updateCustomer = (k: keyof CustomerFields, v: string) =>
    setCustomer((p) => ({ ...p, [k]: v }))
  const updateBank = (k: keyof BankFields, v: string) => setBank((p) => ({ ...p, [k]: v }))

  const addItem = () => setItems((prev) => [...prev, { desc: '', qty: 1, rate: 0 }])
  const delItem = (i: number) => setItems((prev) => prev.filter((_, idx) => idx !== i))
  const updItem = (i: number, k: keyof InvoiceItem, v: string) => {
    setItems((prev) =>
      prev.map((it, idx) =>
        idx === i
          ? { ...it, [k]: k === 'qty' || k === 'rate' ? parseFloat(v) || 0 : v }
          : it,
      ),
    )
  }

  const saveInvoice = () => {
    let seq = loadSeq()
    seq = bumpSequence(mode, invDate, seq)
    saveSeq(seq)
    const rec = {
      id: Date.now(),
      mode,
      invNo,
      date: invDate,
      month: invDate.slice(0, 7).replace('-', ''),
      customer: customer.cName,
      currency: curr,
      sub: calc.sub,
      tax: calc.tax,
      grand: calc.grand,
      snapshot: snapshotFromForm(
        mode,
        provider,
        customer,
        bank,
        {
          invDate,
          revCharge,
          transport,
          curr,
          t1lbl,
          t2lbl,
          t1rate,
          t2rate,
          invNo,
          pCin: provider.pCin,
        },
        items,
      ),
    }
    const all = loadInvoices()
    all.unshift(rec)
    saveInvoices(all)
    refreshNumber()
    onSaved?.()
    alert(`Saved: ${rec.invNo}`)
  }

  const ind = mode === 'IND'

  return (
    <div className="max-w-[1280px] mx-auto my-7 px-8 grid grid-cols-[460px_1fr] gap-7 max-[1060px]:grid-cols-1">
      <FormPanel
        title="Create Invoice"
        subtitle='GST invoice for Indian clients · Export invoice for international clients. Tip: to repeat a client, go to Invoice History → "Use as Template".'
      >
        <SegmentedControl
          value={mode}
          onChange={(v) => setModeAndDefaults(v as InvoiceMode)}
          options={[
            { value: 'IND', label: 'GST Invoice (India)' },
            { value: 'INT', label: 'Export Invoice (Intl)' },
          ]}
        />
        <Hint>{MODE_HINTS[mode]}</Hint>

        <Fieldset legend="Provider (You)">
          <Label>Name</Label>
          <TextInput value={provider.pName} onChange={(v) => updateProvider('pName', v)} />
          <Label>Address</Label>
          <TextArea value={provider.pAddr} onChange={(v) => updateProvider('pAddr', v)} />
          <TwoCol>
            <div>
              <Label>Country</Label>
              <TextInput value={provider.pCountry} onChange={(v) => updateProvider('pCountry', v)} />
            </div>
            <div>
              <Label>Your GSTIN</Label>
              <TextInput value={provider.pGstin} onChange={(v) => updateProvider('pGstin', v)} />
            </div>
          </TwoCol>
          <ThreeCol>
            <div>
              <Label>Mobile</Label>
              <TextInput value={provider.pMobile} onChange={(v) => updateProvider('pMobile', v)} />
            </div>
            <div>
              <Label>Web</Label>
              <TextInput value={provider.pWeb} onChange={(v) => updateProvider('pWeb', v)} />
            </div>
            <div>
              <Label>Email</Label>
              <TextInput value={provider.pEmail} onChange={(v) => updateProvider('pEmail', v)} />
            </div>
          </ThreeCol>
          <Label>CIN (shown on GST invoices)</Label>
          <TextInput value={provider.pCin} onChange={(v) => updateProvider('pCin', v)} />
        </Fieldset>

        <Fieldset legend="Customer">
          <Label>Name</Label>
          <TextInput value={customer.cName} onChange={(v) => updateCustomer('cName', v)} />
          <Label>Address</Label>
          <TextArea value={customer.cAddr} onChange={(v) => updateCustomer('cAddr', v)} />
          <TwoCol>
            <div>
              <Label>Country</Label>
              <TextInput value={customer.cCountry} onChange={(v) => updateCustomer('cCountry', v)} />
            </div>
            {ind && (
              <div>
                <Label>Customer GSTIN</Label>
                <TextInput value={customer.cGstin} onChange={(v) => updateCustomer('cGstin', v)} />
              </div>
            )}
          </TwoCol>
        </Fieldset>

        <Fieldset legend="Invoice Meta">
          <TwoCol>
            <div>
              <Label>Invoice No. (auto)</Label>
              <TextInput value={invNo} readOnly className="!bg-[#f4f5f7]" />
            </div>
            <div>
              <Label>Date</Label>
              <TextInput type="date" value={invDate} onChange={setInvDate} />
            </div>
          </TwoCol>
          <ThreeCol>
            <div>
              <Label>Reverse charge</Label>
              <SelectInput value={revCharge} onChange={setRevCharge}>
                <option>No</option>
                <option>Yes</option>
              </SelectInput>
            </div>
            <div>
              <Label>Mode of Transport</Label>
              <TextInput value={transport} onChange={setTransport} />
            </div>
            <div>
              <Label>Currency</Label>
              <SelectInput value={curr} onChange={setCurr}>
                <option value="INR">INR</option>
                <option value="USD">USD</option>
                <option value="GBP">GBP</option>
                <option value="EUR">EUR</option>
                <option value="AED">AED</option>
              </SelectInput>
            </div>
          </ThreeCol>
        </Fieldset>

        <Fieldset legend="Services">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="text-[9px] uppercase tracking-wide text-muted text-left py-1.5 px-[3px] font-semibold">
                  Service Name
                </th>
                <th className="text-[9px] uppercase tracking-wide text-muted text-left py-1.5 px-[3px] font-semibold w-[54px]">
                  Qty
                </th>
                <th className="text-[9px] uppercase tracking-wide text-muted text-left py-1.5 px-[3px] font-semibold w-[84px]">
                  Rate
                </th>
                <th className="w-[30px]" />
              </tr>
            </thead>
            <tbody>
              {items.map((it, i) => (
                <tr key={i}>
                  <td className="p-[3px_2px]">
                    <input
                      value={it.desc}
                      onChange={(e) => updItem(i, 'desc', e.target.value)}
                      className="w-full py-1.5 px-[7px] border border-line text-[11px] font-serif"
                    />
                  </td>
                  <td className="p-[3px_2px]">
                    <input
                      type="number"
                      value={it.qty}
                      onChange={(e) => updItem(i, 'qty', e.target.value)}
                      className="w-full py-1.5 px-[7px] border border-line text-[11px] font-serif"
                    />
                  </td>
                  <td className="p-[3px_2px]">
                    <input
                      type="number"
                      value={it.rate}
                      onChange={(e) => updItem(i, 'rate', e.target.value)}
                      className="w-full py-1.5 px-[7px] border border-line text-[11px] font-serif"
                    />
                  </td>
                  <td className="p-[3px_2px]">
                    <button
                      type="button"
                      onClick={() => delItem(i)}
                      className="bg-transparent border-none text-danger cursor-pointer text-[15px] px-[5px]"
                    >
                      &times;
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            type="button"
            onClick={addItem}
            className="bg-transparent border border-dashed border-green text-green py-[7px] px-3 text-[11px] cursor-pointer mt-2 font-serif hover:bg-green-light"
          >
            + Add service
          </button>
        </Fieldset>

        {ind && (
          <Fieldset legend="GST">
            <TwoCol>
              <div>
                <Label>Tax line 1 label</Label>
                <TextInput value={t1lbl} onChange={setT1lbl} />
              </div>
              <div>
                <Label>Rate %</Label>
                <TextInput type="number" value={t1rate} onChange={setT1rate} />
              </div>
            </TwoCol>
            <TwoCol>
              <div>
                <Label>Tax line 2 label</Label>
                <TextInput value={t2lbl} onChange={setT2lbl} />
              </div>
              <div>
                <Label>Rate %</Label>
                <TextInput type="number" value={t2rate} onChange={setT2rate} />
              </div>
            </TwoCol>
          </Fieldset>
        )}

        <Fieldset legend="Bank Details">
          <Label>Account Name</Label>
          <TextInput value={bank.bName} onChange={(v) => updateBank('bName', v)} />
          <TwoCol>
            <div>
              <Label>Account Number</Label>
              <TextInput value={bank.bAcc} onChange={(v) => updateBank('bAcc', v)} />
            </div>
            <div>
              <Label>IFSC</Label>
              <TextInput value={bank.bIfsc} onChange={(v) => updateBank('bIfsc', v)} />
            </div>
          </TwoCol>
          <TwoCol>
            <div>
              <Label>SWIFT</Label>
              <TextInput value={bank.bSwift} onChange={(v) => updateBank('bSwift', v)} />
            </div>
            <div>
              <Label>Bank Name</Label>
              <TextInput value={bank.bBank} onChange={(v) => updateBank('bBank', v)} />
            </div>
          </TwoCol>
          <Label>Branch</Label>
          <TextInput value={bank.bBranch} onChange={(v) => updateBank('bBranch', v)} />
        </Fieldset>

        <FormActions>
          <BtnPrimary onClick={saveInvoice}>Save to History</BtnPrimary>
          <BtnSecondary
            onClick={() =>
              exportInvoicePDF({
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
                t1lbl,
                t2lbl,
                t1rate,
                t2rate,
                calc,
              })
            }
          >
            Download PDF
          </BtnSecondary>
          <BtnSecondary
            onClick={() =>
              exportInvoiceWord({
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
                t1lbl,
                t2lbl,
                t1rate,
                t2rate,
                calc,
              })
            }
          >
            Download Word
          </BtnSecondary>
        </FormActions>
      </FormPanel>

      <div className="p-0 border-none bg-transparent">
        <PreviewShell>
          <InvoicePaper
            mode={mode}
            provider={provider}
            customer={customer}
            bank={bank}
            invNo={invNo}
            invDate={invDate}
            revCharge={revCharge}
            transport={transport}
            curr={curr}
            items={items}
            calc={calc}
          />
        </PreviewShell>
      </div>
    </div>
  )
}
