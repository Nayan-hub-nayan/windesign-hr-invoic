import { useEffect, useState } from 'react'
import { NAV_TABS, type TabId } from './constants'
import type { InvoiceSnapshot } from './types'
import { seedIfFirstRun } from './utils/invoice'
import { TopBar, Nav, ComingSoon } from './components/ui'
import { InvoiceTab } from './components/invoice/InvoiceTab'
import { InvoiceHistoryTab } from './components/invoice/InvoiceHistoryTab'
import { OfferLetterTab } from './components/offer/OfferLetterTab'
import { InternshipTab } from './components/internship/InternshipTab'
import { AppraisalTab } from './components/appraisal/AppraisalTab'

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('invoice')
  const [historyKey, setHistoryKey] = useState(0)
  const [openSnapshot, setOpenSnapshot] = useState<InvoiceSnapshot | null>(null)
  const [templateSnapshot, setTemplateSnapshot] = useState<InvoiceSnapshot | null>(null)

  useEffect(() => {
    seedIfFirstRun()
  }, [])

  const clearSnapshots = () => {
    setOpenSnapshot(null)
    setTemplateSnapshot(null)
  }

  return (
    <>
      <TopBar />
      <Nav active={activeTab} onChange={(t) => setActiveTab(t as TabId)} tabs={NAV_TABS} />

      {activeTab === 'invoice' && (
        <InvoiceTab
          onSaved={() => setHistoryKey((k) => k + 1)}
          openSnapshot={openSnapshot}
          templateSnapshot={templateSnapshot}
          onSnapshotConsumed={clearSnapshots}
        />
      )}

      {activeTab === 'history' && (
        <InvoiceHistoryTab
          refreshKey={historyKey}
          onOpenInvoice={setOpenSnapshot}
          onUseTemplate={setTemplateSnapshot}
          onGoToInvoice={() => setActiveTab('invoice')}
        />
      )}

      {activeTab === 'offer' && <OfferLetterTab />}
      {activeTab === 'internship' && <InternshipTab />}
      {activeTab === 'appraisal' && <AppraisalTab />}
      {activeTab === 'payslip' && <ComingSoon title="Salary Slip" />}
    </>
  )
}
