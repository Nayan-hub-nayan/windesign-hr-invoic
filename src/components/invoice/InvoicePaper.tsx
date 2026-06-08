import { SIG_B64 } from '../../constants/signature'
import type { InvoiceMode } from '../../constants'
import type { BankFields, CustomerFields, InvoiceItem, ProviderFields } from '../../types'
import type { CalcResult } from '../../types'
import { esc, fmtDate, money } from '../../utils/formatters'

interface InvoicePaperProps {
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
  calc: CalcResult
}

export function InvoicePaper({
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
}: InvoicePaperProps) {
  const ind = mode === 'IND'

  return (
    <div className="bg-white w-full max-w-[580px] mx-auto shadow-[0_4px_20px_rgba(0,0,0,0.15)] text-[11px] font-serif">
      <div className="px-8 pt-7 pb-5 flex justify-between items-start">
        <div>
          <div className="font-playfair text-base font-bold text-green leading-tight">
            {provider.pName}
            <small className="font-serif text-[9px] tracking-[2px] uppercase text-muted font-normal block mt-0.5">
              Invoice for Design Services
            </small>
          </div>
        </div>
        <div className="text-right">
          <h3 className="font-playfair text-[26px] font-bold text-green tracking-[2px]">INVOICE</h3>
          <div className="text-[10px] text-muted mt-1 italic">
            {ind ? (
              <>GST Invoice &nbsp;·&nbsp; CIN: {provider.pCin}</>
            ) : (
              'Export Invoice'
            )}
          </div>
        </div>
      </div>

      <div className="h-0.5 bg-green mx-8" />

      <div className="px-8 py-4 flex justify-between gap-5 bg-[#fafafa] border-b border-line">
        <MetaCol label="Invoice No." value={invNo} big />
        <MetaCol label="Date" value={fmtDate(invDate)} />
        <MetaCol label="Reverse Charge" value={revCharge} />
        <MetaCol label="Transport" value={transport} />
        {ind && <MetaCol label="GSTIN (Provider)" value={provider.pGstin} />}
      </div>

      <div className="px-8 py-4 grid grid-cols-2 gap-5">
        <div>
          <h4 className="text-[9px] uppercase tracking-[1.5px] text-gold font-semibold mb-1.5">
            From (Provider)
          </h4>
          <p className="text-[10.5px] leading-[1.65] text-[#444]">
            <strong>{provider.pName}</strong>
            <br />
            {provider.pAddr.split('\n').map((line, i) => (
              <span key={i}>
                {line}
                <br />
              </span>
            ))}
            {provider.pCountry}
            <br />
            {provider.pMobile} · {provider.pWeb}
            <br />
            {provider.pEmail}
            {ind && (
              <>
                <br />
                GSTIN: {provider.pGstin}
              </>
            )}
          </p>
        </div>
        <div>
          <h4 className="text-[9px] uppercase tracking-[1.5px] text-gold font-semibold mb-1.5">
            Customer Details
          </h4>
          <p className="text-[10.5px] leading-[1.65] text-[#444]">
            <strong>{customer.cName}</strong>
            <br />
            {customer.cAddr.split('\n').map((line, i) => (
              <span key={i}>
                {line}
                <br />
              </span>
            ))}
            {customer.cCountry}
            {ind && customer.cGstin && (
              <>
                <br />
                GSTIN: {customer.cGstin}
              </>
            )}
          </p>
        </div>
      </div>

      <table className="w-[calc(100%-64px)] mx-8 mt-1 border-collapse">
        <thead>
          <tr className="bg-green">
            <th className="text-white text-[9px] uppercase tracking-[0.8px] py-2.5 px-2 text-left font-semibold font-serif text-center w-16">
              Sr. No.
            </th>
            <th className="text-white text-[9px] uppercase tracking-[0.8px] py-2.5 px-2 text-left font-semibold font-serif">
              Service Name
            </th>
            <th className="text-white text-[9px] uppercase tracking-[0.8px] py-2.5 px-2 text-left font-semibold font-serif text-center">
              Duration / Qty
            </th>
            <th className="text-white text-[9px] uppercase tracking-[0.8px] py-2.5 px-2 text-left font-semibold font-serif text-right">
              Rate
            </th>
            <th className="text-white text-[9px] uppercase tracking-[0.8px] py-2.5 px-2 text-left font-semibold font-serif text-right">
              Total
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((it, i) => (
            <tr key={i}>
              <td className="py-[11px] px-2 text-[10.5px] border-b border-[#efefef] text-[#333] text-center">
                {i + 1}
              </td>
              <td className="py-[11px] px-2 text-[10.5px] border-b border-[#efefef] text-[#333]">
                {it.desc}
              </td>
              <td className="py-[11px] px-2 text-[10.5px] border-b border-[#efefef] text-[#333] text-center">
                {it.qty}
              </td>
              <td className="py-[11px] px-2 text-[10.5px] border-b border-[#efefef] text-[#333] text-right">
                {money(it.rate, curr)}
              </td>
              <td className="py-[11px] px-2 text-[10.5px] border-b border-[#efefef] text-[#333] text-right">
                {money(
                  (typeof it.qty === 'number' ? it.qty : 1) * it.rate,
                  curr,
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="py-2 px-8 flex justify-end">
        <div className="w-[56%] border-t border-line">
          {ind &&
            calc.taxRows.map(([label, amt], i) => (
              <div key={i} className="flex justify-between py-[5px] text-[11px] text-[#555]">
                <span>{esc(label)} :</span>
                <span>{money(amt, curr)}</span>
              </div>
            ))}
          <div className="flex justify-between border-t-2 border-green mt-1 pt-2.5 text-base font-bold text-green font-playfair">
            <span>Total Amount{ind ? '' : ` (${curr})`} :</span>
            <span>{money(calc.grand, curr)}</span>
          </div>
        </div>
      </div>

      <div className="px-8 py-5 flex justify-between items-end border-t border-line mt-3">
        <div className="text-[9.5px] text-[#666] max-w-[55%] leading-normal">
          <strong>Declaration:</strong> The particulars given above are true and correct.
        </div>
        <div className="text-center text-[9px] text-[#888]">
          <img
            src={SIG_B64}
            alt="Signature"
            className="h-[38px] block mb-0.5 mix-blend-multiply"
          />
          <span className="text-[9px] text-[#888]">Authorise Signature</span>
        </div>
      </div>

      <div className="bg-green-light border-t-2 border-green px-8 py-4">
        <div className="text-[9px] uppercase tracking-[2px] text-green font-bold mb-2.5">
          Bank Details
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-[9.5px] text-[#444]">
          <div>
            Name: <b className="text-green">{bank.bName}</b>
          </div>
          <div>
            SWIFT: <b className="text-green">{bank.bSwift}</b>
          </div>
          <div>
            Account: <b className="text-green">{bank.bAcc}</b>
          </div>
          <div>
            Bank: <b className="text-green">{bank.bBank}</b>
          </div>
          <div>
            IFSC: <b className="text-green">{bank.bIfsc}</b>
          </div>
          <div>
            Branch: <b className="text-green">{bank.bBranch}</b>
          </div>
        </div>
        <div className="text-[9px] text-muted mt-2 italic">
          Payment within 15 days via money transfer only.
        </div>
      </div>
    </div>
  )
}

function MetaCol({
  label,
  value,
  big,
}: {
  label: string
  value: string
  big?: boolean
}) {
  return (
    <div className="flex-1">
      <div className="text-[9px] uppercase tracking-[1.5px] text-gold font-semibold mb-[3px]">
        {label}
      </div>
      <div
        className={`text-[11px] font-semibold text-ink ${big ? 'text-[13px] text-green' : ''}`}
      >
        {value}
      </div>
    </div>
  )
}

export function getInvoicePaperText(root: HTMLElement): string {
  return root.innerText || root.textContent || ''
}
