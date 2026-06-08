import {
  AlignmentType,
  Document,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from 'docx'
import { saveAs } from 'file-saver'
import type { InvoiceExportData } from './invoicePdf'
import { fmtDate, money } from '../utils/formatters'

export async function exportInvoiceWord(data: InvoiceExportData): Promise<void> {
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

  function P(
    t: string,
    o: { b?: boolean; s?: number; col?: string; r?: boolean; c?: boolean; after?: number } = {},
  ) {
    return new Paragraph({
      alignment: o.r
        ? AlignmentType.RIGHT
        : o.c
          ? AlignmentType.CENTER
          : AlignmentType.LEFT,
      spacing: { after: o.after == null ? 60 : o.after },
      children: [
        new TextRun({
          text: t,
          bold: o.b,
          size: o.s || 18,
          color: o.col || '222222',
        }),
      ],
    })
  }

  function cell(
    t: string | number,
    o: { w?: number; h?: boolean; b?: boolean; r?: boolean; c?: boolean } = {},
  ) {
    return new TableCell({
      width: { size: o.w || 20, type: WidthType.PERCENTAGE },
      shading: o.h ? { fill: '111111' } : undefined,
      children: [
        new Paragraph({
          alignment: o.r
            ? AlignmentType.RIGHT
            : o.c
              ? AlignmentType.CENTER
              : AlignmentType.LEFT,
          children: [
            new TextRun({
              text: String(t),
              bold: o.h || o.b,
              color: o.h ? 'FFFFFF' : '222222',
              size: o.h ? 15 : 17,
            }),
          ],
        }),
      ],
    })
  }

  const hdr = new TableRow({
    children: [
      cell('SR.', { h: true, w: 8, c: true }),
      cell('SERVICE NAME', { h: true, w: 46 }),
      cell('QTY', { h: true, w: 12, c: true }),
      cell('RATE', { h: true, w: 17, r: true }),
      cell('TOTAL', { h: true, w: 17, r: true }),
    ],
  })
  const brows = items.map((it, i) =>
    new TableRow({
      children: [
        cell(i + 1, { w: 8, c: true }),
        cell(it.desc, { w: 46 }),
        cell(it.qty, { w: 12, c: true }),
        cell(money(it.rate, curr), { w: 17, r: true }),
        cell(money((typeof it.qty === 'number' ? it.qty : 1) * it.rate, curr), { w: 17, r: true }),
      ],
    }),
  )

  const kids: (Paragraph | Table)[] = [
    P('Invoice for design services', { b: true, s: 30 }),
    P(ind ? 'GST Invoice   CIN: ' + provider.pCin : 'Export Invoice', {
      s: 16,
      col: '777777',
      after: 200,
    }),
    P('PROVIDER', { b: true, s: 15, col: '2828B4' }),
  ]

  ;['Name: ' + provider.pName, 'Address: ' + provider.pAddr, 'Country: ' + provider.pCountry]
    .concat(ind ? ['GSTIN: ' + provider.pGstin] : [])
    .concat([
      'Mobile: ' + provider.pMobile,
      'Web: ' + provider.pWeb,
      'Email: ' + provider.pEmail,
    ])
    .forEach((t) => kids.push(P(t)))

  kids.push(P('', { after: 120 }), P('INVOICE DETAILS', { b: true, s: 15, col: '2828B4' }))
  ;[
    'Invoice: ' + invNo,
    'Date: ' + fmtDate(invDate),
    'Reverse charge: ' + revCharge,
    'Mode Of Transport: ' + transport,
  ].forEach((t) => kids.push(P(t)))

  kids.push(P('', { after: 120 }), P('CUSTOMER DETAILS', { b: true, s: 15, col: '2828B4' }))
  ;['Name: ' + customer.cName, 'Address: ' + customer.cAddr, 'Country: ' + customer.cCountry]
    .concat(ind ? ['GSTIN: ' + customer.cGstin] : [])
    .forEach((t) => kids.push(P(t)))

  kids.push(
    P('', { after: 160 }),
    new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [hdr, ...brows] }),
    P('', { after: 140 }),
  )

  if (ind) calc.taxRows.forEach((t) => kids.push(P(t[0] + ' : ' + money(t[1], curr), { r: true })))

  kids.push(
    P(
      'Total Amount' +
        (ind ? '' : ' (' + curr + ')') +
        ' : ' +
        money(calc.grand, curr),
      { r: true, b: true, s: 24, after: 240 },
    ),
    P('Declaration: The particular given above are true and correct', {
      s: 16,
      col: '555555',
    }),
    P('Authorise signature', { r: true, s: 16, col: '555555', after: 200 }),
    P('BANK DETAILS', { b: true, s: 15, col: '136B41' }),
  )

  ;[
    'Name: ' + bank.bName,
    'Account number: ' + bank.bAcc,
    'IFSC: ' + bank.bIfsc,
    'SWIFT code: ' + bank.bSwift,
    'Bank name: ' + bank.bBank,
    'Branch: ' + bank.bBranch,
  ].forEach((t) => kids.push(P(t)))

  kids.push(
    P('Payment within 15 days via money transfer only to the given account', {
      s: 15,
      col: '888888',
    }),
  )

  const blob = await Packer.toBlob(new Document({ sections: [{ children: kids }] }))
  saveAs(blob, invNo + '.docx')
}
