import { Suspense } from 'react'
import { LedgerTipjar } from '../../components/LedgerTipjar'

export default function LedgerPage() {
  return (
    <Suspense>
      <LedgerTipjar />
    </Suspense>
  )
}
