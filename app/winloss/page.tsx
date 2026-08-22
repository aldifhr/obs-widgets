import { Suspense } from 'react'
import { WinLoss } from '../../components/WinLoss'

export const metadata = { title: 'Win Loss' }

export default function WinLossPage() {
  return (
    <Suspense>
      <WinLoss />
    </Suspense>
  )
}
