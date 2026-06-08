import { useMemo, useRef, useState } from 'react'
import {
  BtnPrimary,
  BtnSecondary,
  Fieldset,
  FormActions,
  FormPanel,
  Label,
  PreviewShell,
  TextArea,
  TextInput,
  TwoCol,
} from '../ui'
import {
  firstName,
  LetterBody,
  LetterFooter,
  LetterHead,
  LetterPaper,
} from '../letters/LetterParts'
import { fmtDate, fmtRupee, todayISO } from '../../utils/formatters'
import { exportLetterPDF, exportLetterWord } from '../../exports/letterExport'

export function AppraisalTab() {
  const paperRef = useRef<HTMLDivElement>(null)
  const [name, setName] = useState('Rahul Sharma')
  const [empId, setEmpId] = useState('WD-001')
  const [oldRole, setOldRole] = useState('UI/UX Designer')
  const [newRole, setNewRole] = useState('Senior UI/UX Designer')
  const [dept, setDept] = useState('Design')
  const [effective, setEffective] = useState(todayISO())
  const [oldCtc, setOldCtc] = useState(480000)
  const [basic, setBasic] = useState(360000)
  const [hra, setHra] = useState(144000)
  const [special, setSpecial] = useState(72000)
  const [other, setOther] = useState(0)
  const [perf, setPerf] = useState(
    'You have consistently delivered high-quality work and demonstrated strong leadership qualities. Your contributions to the team have been invaluable and we look forward to your continued growth.',
  )
  const [date, setDate] = useState(todayISO())

  const ctc = useMemo(
    () => ({ b: basic, h: hra, s: special, o: other, total: basic + hra + special + other }),
    [basic, hra, special, other],
  )
  const hike = oldCtc > 0 ? Math.round(((ctc.total - oldCtc) / oldCtc) * 100) : 0
  const isPromo = newRole !== oldRole
  const exportContent = () => paperRef.current?.innerText || ''
  const filename = 'AppraisalLetter_' + name.replace(/\s+/g, '_')

  const fmt = (n: number) => fmtRupee(n)

  return (
    <div className="max-w-[1280px] mx-auto my-7 px-8 grid grid-cols-[460px_1fr] gap-7 max-[1060px]:grid-cols-1">
      <FormPanel
        title="Appraisal Letter"
        subtitle="Generate a formal appraisal letter with promotion, revised salary, and performance note."
      >
        <Fieldset legend="Employee Details">
          <TwoCol>
            <div>
              <Label>Employee Full Name</Label>
              <TextInput value={name} onChange={setName} />
            </div>
            <div>
              <Label>Employee ID</Label>
              <TextInput value={empId} onChange={setEmpId} />
            </div>
          </TwoCol>
          <TwoCol>
            <div>
              <Label>Current Designation</Label>
              <TextInput value={oldRole} onChange={setOldRole} />
            </div>
            <div>
              <Label>New Designation</Label>
              <TextInput value={newRole} onChange={setNewRole} />
            </div>
          </TwoCol>
          <TwoCol>
            <div>
              <Label>Department</Label>
              <TextInput value={dept} onChange={setDept} />
            </div>
            <div>
              <Label>Effective Date</Label>
              <TextInput type="date" value={effective} onChange={setEffective} />
            </div>
          </TwoCol>
        </Fieldset>

        <Fieldset legend="Revised Salary (Annual ₹)">
          <TwoCol>
            <div>
              <Label>Previous CTC</Label>
              <TextInput type="number" value={oldCtc} onChange={(v) => setOldCtc(parseFloat(v) || 0)} />
            </div>
            <div>
              <Label>New Basic</Label>
              <TextInput type="number" value={basic} onChange={(v) => setBasic(parseFloat(v) || 0)} />
            </div>
          </TwoCol>
          <TwoCol>
            <div>
              <Label>New HRA</Label>
              <TextInput type="number" value={hra} onChange={(v) => setHra(parseFloat(v) || 0)} />
            </div>
            <div>
              <Label>Special Allowance</Label>
              <TextInput type="number" value={special} onChange={(v) => setSpecial(parseFloat(v) || 0)} />
            </div>
          </TwoCol>
          <TwoCol>
            <div>
              <Label>Other Allowance</Label>
              <TextInput type="number" value={other} onChange={(v) => setOther(parseFloat(v) || 0)} />
            </div>
            <div>
              <Label>
                <span className="font-bold text-green not-italic">
                  New CTC: {fmtRupee(ctc.total)}/yr
                </span>
              </Label>
              <div className="h-2.5" />
            </div>
          </TwoCol>
        </Fieldset>

        <Fieldset legend="Performance Note">
          <Label>Performance Summary</Label>
          <TextArea value={perf} onChange={setPerf} rows={3} />
          <Label>Letter Date</Label>
          <TextInput type="date" value={date} onChange={setDate} />
        </Fieldset>

        <FormActions>
          <BtnPrimary onClick={() => exportLetterPDF(exportContent(), filename)}>
            Download PDF
          </BtnPrimary>
          <BtnSecondary onClick={() => exportLetterWord(exportContent(), filename)}>
            Download Word
          </BtnSecondary>
        </FormActions>
      </FormPanel>

      <div className="p-0 border-none bg-transparent">
        <PreviewShell>
          <LetterPaper>
            <div ref={paperRef}>
              <LetterHead subtitle="Appraisal Letter" />
              <LetterBody>
                <div className="mb-3.5">
                  <b>Date:</b> {fmtDate(date)}
                </div>
                <div className="mb-3.5">
                  <b>To,</b>
                  <br />
                  <b className="text-[13px]">{name}</b>
                  <br />
                  Employee ID: {empId}
                  <br />
                  Department: {dept}
                </div>
                <div className="mb-4">
                  <b>
                    Sub: {isPromo ? 'Promotion & ' : ''} Appraisal Letter — Effective{' '}
                    {fmtDate(effective)}
                  </b>
                </div>
                <p className="mb-2.5">
                  Dear <b>{firstName(name)}</b>,
                </p>
                <p className="mb-2.5">{perf}</p>
                <p className="mb-3.5">
                  It gives us great pleasure to inform you that your annual appraisal has been
                  completed and, in recognition of your performance, the following revision has been
                  approved effective <b>{fmtDate(effective)}</b>:
                </p>
                {isPromo && (
                  <div className="bg-green-light border-l-[3px] border-green py-2.5 px-3.5 mb-4 text-[11px]">
                    <b>Designation Change:</b> {oldRole} → <b>{newRole}</b>
                  </div>
                )}
                <div className="border border-[#ddd] mb-4">
                  <div className="bg-green text-white py-2 px-3 text-[10px] tracking-wide font-bold">
                    REVISED COMPENSATION (ANNUAL)
                  </div>
                  <table className="w-full border-collapse text-[10.5px]">
                    <thead>
                      <tr className="bg-[#fafafa]">
                        <th className="py-[7px] px-3 text-left text-[#888] text-[9.5px] font-semibold">
                          COMPONENT
                        </th>
                        <th className="py-[7px] px-3 text-right text-[#888] text-[9.5px] font-semibold">
                          PREVIOUS
                        </th>
                        <th className="py-[7px] px-3 text-right text-[#888] text-[9.5px] font-semibold">
                          REVISED
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {(
                        [
                          { label: 'Basic Salary', val: ctc.b },
                          { label: 'HRA', val: ctc.h },
                          ...(ctc.s ? [{ label: 'Special Allowance', val: ctc.s }] : []),
                          ...(ctc.o ? [{ label: 'Other Allowance', val: ctc.o }] : []),
                        ] as { label: string; val: number }[]
                      ).map(({ label, val }) => (
                        <tr key={label} className="border-b border-[#eee]">
                          <td className="py-[7px] px-3">{label}</td>
                          <td className="py-[7px] px-3 text-right text-[#888]">—</td>
                          <td className="py-[7px] px-3 text-right">{fmt(val)}</td>
                        </tr>
                      ))}
                      <tr className="bg-green-light font-bold">
                        <td className="py-2 px-3">Total CTC</td>
                        <td className="py-2 px-3 text-right text-[#888]">{fmt(oldCtc)}</td>
                        <td className="py-2 px-3 text-right text-green">{fmt(ctc.total)}</td>
                      </tr>
                      {hike > 0 && (
                        <tr>
                          <td colSpan={3} className="py-1.5 px-3 text-[9.5px] text-[#1f7a4d]">
                            <b>Increment: {hike}% hike</b> on previous CTC
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <p className="mb-2.5">
                  The revised compensation will be effective from <b>{fmtDate(effective)}</b>. Your
                  updated appointment letter / addendum will follow. Please sign and return a copy of
                  this letter as acknowledgement.
                </p>
                <p>Congratulations and keep up the excellent work!</p>
                <p>Yours sincerely,</p>
              </LetterBody>
              <LetterFooter dateStr={date} />
              <div className="px-9 pb-5 text-[9px] text-[#888] border-t border-[#eee] mx-9 pt-2.5">
                <b>Acknowledgement:</b> I, {name} (ID: {empId}), acknowledge receipt of this
                appraisal letter.
                <br />
                Signature: ______________________________ &nbsp;&nbsp; Date: ______________
              </div>
            </div>
          </LetterPaper>
        </PreviewShell>
      </div>
    </div>
  )
}
