import {
  AlignmentType,
  Document,
  Packer,
  Paragraph,
  TextRun,
} from 'docx'
import { saveAs } from 'file-saver'
import { jsPDF } from 'jspdf'
import { SIG_B64 } from '../constants/signature'

export function exportLetterPDF(content: string, filename: string): void {
  const doc = new jsPDF('p', 'pt', 'a4')
  const L = 44
  const R = 551
  const PW = 507
  let y = 0
  const cGREEN = [31, 78, 61] as const
  const cMUTED = [110, 100, 96] as const
  const cINK = [28, 28, 28] as const
  const cLINE = [210, 205, 198] as const

  y = 38
  doc.setFont('times', 'bold')
  doc.setFontSize(18)
  doc.setTextColor(cGREEN[0], cGREEN[1], cGREEN[2])
  doc.text('Windesign Labs (OPC) Pvt. Ltd.', L, y)
  y += 13
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(cMUTED[0], cMUTED[1], cMUTED[2])
  doc.text(
    'FLAT NO 808 RACHANA, ASHWINI APT JAGDISH NAGAR, Katolroad, Nagpur - 440013, Maharashtra',
    L,
    y,
  )
  y += 11
  doc.text(
    'CIN: U62010MH2024OPC427928  |  GSTIN: 27AADCW8668C1ZZ  |  windesign.io  |  jitu@windesign.io',
    L,
    y,
  )
  y += 8
  doc.setDrawColor(cGREEN[0], cGREEN[1], cGREEN[2])
  doc.setLineWidth(1.5)
  doc.line(L, y, R, y)
  y += 18

  const lines = content
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0)

  doc.setFont('times', 'normal')
  doc.setFontSize(9.5)
  doc.setTextColor(cINK[0], cINK[1], cINK[2])

  lines.forEach((line) => {
    if (y > 790) {
      doc.addPage()
      y = 40
    }
    if (
      line.indexOf('Windesign Labs') === 0 ||
      line.indexOf('FLAT NO 808') === 0 ||
      line.indexOf('CIN:') === 0 ||
      line.indexOf('windesign.io') === 0
    )
      return
    if (line === line.toUpperCase() && line.length > 4 && line.length < 80) {
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8)
      doc.setTextColor(cGREEN[0], cGREEN[1], cGREEN[2])
      doc.text(line, L, y)
      y += 13
      doc.setFont('times', 'normal')
      doc.setFontSize(9.5)
      doc.setTextColor(cINK[0], cINK[1], cINK[2])
      return
    }
    doc.splitTextToSize(line, PW).forEach((wl: string) => {
      if (y > 790) {
        doc.addPage()
        y = 40
      }
      doc.text(wl, L, y)
      y += 13
    })
  })

  y += 10
  if (y > 720) {
    doc.addPage()
    y = 40
  }
  doc.setDrawColor(cLINE[0], cLINE[1], cLINE[2])
  doc.setLineWidth(0.5)
  doc.line(L, y, R, y)
  y += 14
  doc.setFont('times', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(cGREEN[0], cGREEN[1], cGREEN[2])
  doc.text('Windesign Labs (OPC) Pvt. Ltd.', L, y)
  doc.addImage(SIG_B64, 'PNG', R - 100, y - 14, 100, 38)
  y += 38
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(cMUTED[0], cMUTED[1], cMUTED[2])
  doc.text('Authorised Signatory', R, y, { align: 'right' })

  doc.save(filename + '.pdf')
}

export async function exportLetterWord(content: string, filename: string): Promise<void> {
  function P(
    t: string,
    o: { b?: boolean; s?: number; col?: string; r?: boolean; c?: boolean; after?: number; i?: boolean } = {},
  ) {
    return new Paragraph({
      alignment: o.c
        ? AlignmentType.CENTER
        : o.r
          ? AlignmentType.RIGHT
          : AlignmentType.LEFT,
      spacing: { after: o.after == null ? 80 : o.after },
      children: [
        new TextRun({
          text: String(t || ''),
          bold: o.b,
          size: o.s || 20,
          color: o.col || '222222',
          italics: o.i,
        }),
      ],
    })
  }

  const lines = content
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0)

  const kids = [
    P('Windesign Labs (OPC) Pvt. Ltd.', { b: true, s: 28, col: '1F4E3D' }),
    P(
      'FLAT NO 808 RACHANA, ASHWINI APT JAGDISH NAGAR, Katolroad, Nagpur - 440013, Maharashtra',
      { s: 15, col: '777777' },
    ),
    P('CIN: U62010MH2024OPC427928  |  GSTIN: 27AADCW8668C1ZZ  |  windesign.io', {
      s: 15,
      col: '777777',
      after: 160,
    }),
  ]

  lines.forEach((line) => {
    if (
      line.indexOf('Windesign Labs') === 0 ||
      line.indexOf('FLAT NO 808') === 0 ||
      line.indexOf('CIN:') === 0 ||
      line.indexOf('windesign.io') === 0 ||
      line.indexOf('Authorised Signatory') === 0
    )
      return
    const isHdr = line === line.toUpperCase() && line.length > 4 && line.length < 80
    kids.push(P(line, isHdr ? { b: true, s: 17, col: '1F4E3D' } : { s: 20 }))
  })

  kids.push(P('', { after: 120 }))
  kids.push(P('Windesign Labs (OPC) Pvt. Ltd.', { b: true, s: 20, col: '1F4E3D' }))
  kids.push(P('Authorised Signatory', { s: 16, col: '888888' }))

  const blob = await Packer.toBlob(new Document({ sections: [{ children: kids }] }))
  saveAs(blob, filename + '.docx')
}
