import { useMemo, useRef, useState } from 'react'
import {
  BtnPrimary,
  BtnSecondary,
  Fieldset,
  FormActions,
  FormPanel,
  Label,
  PreviewShell,
  SelectInput,
  TextArea,
  TextInput,
  TwoCol,
} from '../ui'
import {
  CtcTable,
  firstName,
  LetterBody,
  LetterFooter,
  LetterHead,
  LetterPaper,
} from '../letters/LetterParts'
import { addDaysISO, fmtDate, fmtRupee, todayISO } from '../../utils/formatters'
import { exportLetterPDF, exportLetterWord } from '../../exports/letterExport'

export function OfferLetterTab() {
  const paperRef = useRef<HTMLDivElement>(null)
  const [name, setName] = useState('Rahul Sharma')
  const [role, setRole] = useState('UI/UX Designer')
  const [dept, setDept] = useState('Design')
  const [joining, setJoining] = useState(addDaysISO(30))
  const [location, setLocation] = useState('Nagpur, Maharashtra')
  const [manager, setManager] = useState('Jitu Mistry')
  const [basic, setBasic] = useState(300000)
  const [hra, setHra] = useState(120000)
  const [special, setSpecial] = useState(60000)
  const [other, setOther] = useState(0)
  const [probation, setProbation] = useState('3 months')
  const [notice, setNotice] = useState('30 days')
  const [date, setDate] = useState(todayISO())
  const [notes, setNotes] = useState(
    'This offer is subject to satisfactory background verification and submission of required documents.',
  )

  const ctc = useMemo(
    () => ({
      b: basic,
      h: hra,
      s: special,
      o: other,
      total: basic + hra + special + other,
    }),
    [basic, hra, special, other],
  )

  const exportContent = () => paperRef.current?.innerText || ''

  return (
    <div className="max-w-[1280px] mx-auto my-7 px-8 grid grid-cols-[460px_1fr] gap-7 max-[1060px]:grid-cols-1">
      <FormPanel
        title="Offer Letter"
        subtitle="Generate a formal offer letter for a new employee. Download as PDF or Word."
      >
        <Fieldset legend="Candidate Details">
          <TwoCol>
            <div>
              <Label>Candidate Full Name</Label>
              <TextInput value={name} onChange={setName} />
            </div>
            <div>
              <Label>Designation / Role</Label>
              <TextInput value={role} onChange={setRole} />
            </div>
          </TwoCol>
          <TwoCol>
            <div>
              <Label>Department</Label>
              <TextInput value={dept} onChange={setDept} />
            </div>
            <div>
              <Label>Date of Joining</Label>
              <TextInput type="date" value={joining} onChange={setJoining} />
            </div>
          </TwoCol>
          <TwoCol>
            <div>
              <Label>Work Location</Label>
              <TextInput value={location} onChange={setLocation} />
            </div>
            <div>
              <Label>Reporting Manager</Label>
              <TextInput value={manager} onChange={setManager} />
            </div>
          </TwoCol>
        </Fieldset>

        <Fieldset legend="CTC & Salary Breakdown (Annual)">
          <TwoCol>
            <div>
              <Label>Basic Salary (₹/yr)</Label>
              <TextInput type="number" value={basic} onChange={(v) => setBasic(parseFloat(v) || 0)} />
            </div>
            <div>
              <Label>HRA (₹/yr)</Label>
              <TextInput type="number" value={hra} onChange={(v) => setHra(parseFloat(v) || 0)} />
            </div>
          </TwoCol>
          <TwoCol>
            <div>
              <Label>Special Allowance (₹/yr)</Label>
              <TextInput type="number" value={special} onChange={(v) => setSpecial(parseFloat(v) || 0)} />
            </div>
            <div>
              <Label>Other Allowance (₹/yr)</Label>
              <TextInput type="number" value={other} onChange={(v) => setOther(parseFloat(v) || 0)} />
            </div>
          </TwoCol>
          <Label>
            <span className="font-bold text-green not-italic">
              Total CTC: {fmtRupee(ctc.total)} per annum
            </span>
          </Label>
        </Fieldset>

        <Fieldset legend="Terms">
          <TwoCol>
            <div>
              <Label>Probation Period</Label>
              <SelectInput value={probation} onChange={setProbation}>
                <option>3 months</option>
                <option>6 months</option>
                <option>1 year</option>
              </SelectInput>
            </div>
            <div>
              <Label>Notice Period</Label>
              <SelectInput value={notice} onChange={setNotice}>
                <option>30 days</option>
                <option>60 days</option>
                <option>90 days</option>
              </SelectInput>
            </div>
          </TwoCol>
          <Label>Offer Letter Date</Label>
          <TextInput type="date" value={date} onChange={setDate} />
          <Label>Additional Terms / Notes</Label>
          <TextArea value={notes} onChange={setNotes} />
        </Fieldset>

        <FormActions>
          <BtnPrimary
            onClick={() =>
              exportLetterPDF(exportContent(), 'OfferLetter_' + name.replace(/\s+/g, '_'))
            }
          >
            Download PDF
          </BtnPrimary>
          <BtnSecondary
            onClick={() =>
              exportLetterWord(exportContent(), 'OfferLetter_' + name.replace(/\s+/g, '_'))
            }
          >
            Download Word
          </BtnSecondary>
        </FormActions>
      </FormPanel>

      <div className="p-0 border-none bg-transparent">
        <PreviewShell>
          <LetterPaper>
            <div ref={paperRef}>
              <LetterHead subtitle="Offer Letter" />
              <LetterBody>
                <div className="mb-3.5">
                  <b>Date:</b> {fmtDate(date)}
                </div>
                <div className="mb-3.5">
                  <b>To,</b>
                  <br />
                  <b className="text-[13px]">{name}</b>
                </div>
                <div className="mb-4">
                  <b>Sub: Offer of Employment — {role}</b>
                </div>
                <p className="mb-2.5">
                  Dear <b>{firstName(name)}</b>,
                </p>
                <p className="mb-2.5">
                  We are pleased to offer you the position of <b>{role}</b> in the{' '}
                  <b>{dept}</b> department at Windesign Labs (OPC) Pvt. Ltd. Your appointment will
                  be effective from <b>{fmtDate(joining)}</b>.
                </p>
                <p className="mb-4">
                  You will be based at <b>{location}</b> and will report directly to{' '}
                  <b>{manager}</b>.
                </p>
                <CtcTable
                  title="COMPENSATION DETAILS (ANNUAL)"
                  rows={[
                    { label: 'Basic Salary', value: ctc.b },
                    { label: 'House Rent Allowance (HRA)', value: ctc.h },
                    { label: 'Special Allowance', value: ctc.s },
                    { label: 'Other Allowance', value: ctc.o },
                  ]}
                  total={ctc.total}
                  monthly
                />
                <p className="mb-2">
                  <b>Terms & Conditions:</b>
                </p>
                <ul className="pl-[18px] mb-3.5 list-disc">
                  <li>
                    Probation Period: <b>{probation}</b> from the date of joining.
                  </li>
                  <li>
                    Notice Period: <b>{notice}</b> after completion of probation.
                  </li>
                  <li>{notes}</li>
                </ul>
                <p className="mb-2.5">
                  Please confirm your acceptance of this offer by signing and returning a copy of
                  this letter. We look forward to welcoming you to the Windesign team.
                </p>
                <p>Yours sincerely,</p>
              </LetterBody>
              <LetterFooter dateStr={date} />
              <div className="px-9 pb-5 text-[9px] text-[#888] border-t border-[#eee] mx-9 pt-2.5">
                <b>Acceptance:</b> I, {name}, accept the above offer of employment.
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
