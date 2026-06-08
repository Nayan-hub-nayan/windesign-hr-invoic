import { useMemo, useRef, useState } from 'react'
import {
  BtnPrimary,
  BtnSecondary,
  Fieldset,
  FormActions,
  FormPanel,
  Label,
  PreviewShell,
  SegmentedControl,
  TextArea,
  TextInput,
  TwoCol,
} from '../ui'
import {
  DetailTable,
  firstName,
  internDuration,
  LetterBody,
  LetterFooter,
  LetterHead,
  LetterPaper,
} from '../letters/LetterParts'
import { addDaysISO, fmtDate, fmtRupee, todayISO } from '../../utils/formatters'
import { exportLetterPDF, exportLetterWord } from '../../exports/letterExport'

type InternMode = 'joining' | 'completion'

export function InternshipTab() {
  const paperRef = useRef<HTMLDivElement>(null)
  const [mode, setMode] = useState<InternMode>('joining')
  const [name, setName] = useState('Priya Patel')
  const [college, setCollege] = useState('VNIT Nagpur')
  const [role, setRole] = useState('Framer Design Intern')
  const [dept, setDept] = useState('Design')
  const [start, setStart] = useState(addDaysISO(7))
  const [end, setEnd] = useState(addDaysISO(97))
  const [stipend, setStipend] = useState(5000)
  const [mentor, setMentor] = useState('Jitu Mistry')
  const [feedback, setFeedback] = useState(
    'demonstrated exceptional skills and a proactive attitude throughout the internship period.',
  )
  const [issueDate, setIssueDate] = useState(todayISO())
  const [date, setDate] = useState(todayISO())
  const [notes, setNotes] = useState(
    'This internship is unpaid/paid as per the stipend mentioned. Work from office unless otherwise communicated.',
  )

  const dur = useMemo(() => internDuration(start, end), [start, end])
  const exportContent = () => paperRef.current?.innerText || ''
  const filename = 'InternLetter_' + name.replace(/\s+/g, '_')

  return (
    <div className="max-w-[1280px] mx-auto my-7 px-8 grid grid-cols-[460px_1fr] gap-7 max-[1060px]:grid-cols-1">
      <FormPanel
        title="Internship Letter"
        subtitle="Generate an internship joining letter or a completion/experience certificate."
      >
        <SegmentedControl
          value={mode}
          onChange={(v) => setMode(v as InternMode)}
          options={[
            { value: 'joining', label: 'Joining / Offer Letter' },
            { value: 'completion', label: 'Completion Certificate' },
          ]}
        />

        <Fieldset legend="Intern Details">
          <TwoCol>
            <div>
              <Label>Intern Full Name</Label>
              <TextInput value={name} onChange={setName} />
            </div>
            <div>
              <Label>College / University</Label>
              <TextInput value={college} onChange={setCollege} />
            </div>
          </TwoCol>
          <TwoCol>
            <div>
              <Label>Internship Role</Label>
              <TextInput value={role} onChange={setRole} />
            </div>
            <div>
              <Label>Department</Label>
              <TextInput value={dept} onChange={setDept} />
            </div>
          </TwoCol>
          <TwoCol>
            <div>
              <Label>Start Date</Label>
              <TextInput type="date" value={start} onChange={setStart} />
            </div>
            <div>
              <Label>End Date</Label>
              <TextInput type="date" value={end} onChange={setEnd} />
            </div>
          </TwoCol>
          <TwoCol>
            <div>
              <Label>Monthly Stipend (₹)</Label>
              <TextInput type="number" value={stipend} onChange={(v) => setStipend(parseFloat(v) || 0)} />
            </div>
            <div>
              <Label>Mentor / Supervisor</Label>
              <TextInput value={mentor} onChange={setMentor} />
            </div>
          </TwoCol>
        </Fieldset>

        {mode === 'completion' && (
          <Fieldset legend="Completion Details">
            <Label>Performance / Feedback Line</Label>
            <TextArea value={feedback} onChange={setFeedback} />
            <Label>Certificate Issue Date</Label>
            <TextInput type="date" value={issueDate} onChange={setIssueDate} />
          </Fieldset>
        )}

        <Fieldset legend="Letter Details">
          <Label>Letter Date</Label>
          <TextInput type="date" value={date} onChange={setDate} />
          <Label>Additional Notes</Label>
          <TextArea value={notes} onChange={setNotes} />
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
              {mode === 'joining' ? (
                <>
                  <LetterHead subtitle="Internship Offer Letter" />
                  <LetterBody>
                    <div className="mb-3.5">
                      <b>Date:</b> {fmtDate(date)}
                    </div>
                    <div className="mb-3.5">
                      <b>To,</b>
                      <br />
                      <b className="text-[13px]">{name}</b>
                      <br />
                      {college}
                    </div>
                    <div className="mb-4">
                      <b>Sub: Internship Offer — {role}</b>
                    </div>
                    <p className="mb-2.5">
                      Dear <b>{firstName(name)}</b>,
                    </p>
                    <p className="mb-2.5">
                      We are pleased to offer you an internship opportunity at{' '}
                      <b>Windesign Labs (OPC) Pvt. Ltd.</b> as a <b>{role}</b> in the{' '}
                      <b>{dept}</b> department.
                    </p>
                    <DetailTable
                      title="INTERNSHIP DETAILS"
                      rows={[
                        { label: 'Internship Role', value: role },
                        { label: 'Department', value: dept },
                        { label: 'Start Date', value: fmtDate(start) },
                        { label: 'End Date', value: fmtDate(end) },
                        { label: 'Duration', value: dur },
                        { label: 'Monthly Stipend', value: fmtRupee(stipend) },
                        { label: 'Supervisor / Mentor', value: mentor },
                      ]}
                    />
                    <p className="mb-2.5">{notes}</p>
                    <p className="mb-2.5">
                      We expect you to maintain the highest standards of professionalism and
                      confidentiality during your internship. We look forward to having you on
                      board.
                    </p>
                    <p>Yours sincerely,</p>
                  </LetterBody>
                  <LetterFooter dateStr={date} />
                  <div className="px-9 pb-5 text-[9px] text-[#888] border-t border-[#eee] mx-9 pt-2.5">
                    <b>Acceptance:</b> I, {name}, accept the above internship offer.
                    <br />
                    Signature: ______________________________ &nbsp;&nbsp; Date: ______________
                  </div>
                </>
              ) : (
                <>
                  <LetterHead subtitle="Internship Completion Certificate" />
                  <LetterBody>
                    <div className="mb-3.5">
                      <b>Date:</b> {fmtDate(issueDate)}
                    </div>
                    <div className="text-center my-5">
                      <div className="text-sm font-bold text-green tracking-wide">
                        INTERNSHIP COMPLETION CERTIFICATE
                      </div>
                      <div className="text-[10px] text-[#888] mt-1">This is to certify that</div>
                    </div>
                    <div className="text-center my-4">
                      <div className="text-xl font-bold font-playfair text-green border-b-2 border-gold inline-block pb-1">
                        {name}
                      </div>
                      <div className="text-[10px] text-[#555] mt-1.5">{college}</div>
                    </div>
                    <p className="mb-2.5 text-center">
                      has successfully completed an internship as <b>{role}</b> in the{' '}
                      <b>{dept}</b> department at <b>Windesign Labs (OPC) Pvt. Ltd.</b>
                    </p>
                    <DetailTable
                      title="INTERNSHIP DETAILS"
                      rows={[
                        {
                          label: 'Duration',
                          value: `${fmtDate(start)} to ${fmtDate(end)} (${dur})`,
                        },
                        { label: 'Supervisor / Mentor', value: mentor },
                      ]}
                    />
                    <p className="mb-2.5">
                      During the internship, <b>{firstName(name)}</b> {feedback}
                    </p>
                    <p className="mb-2.5">We wish them all the best for their future endeavours.</p>
                    <p>Yours sincerely,</p>
                  </LetterBody>
                  <LetterFooter dateStr={issueDate} />
                </>
              )}
            </div>
          </LetterPaper>
        </PreviewShell>
      </div>
    </div>
  )
}
