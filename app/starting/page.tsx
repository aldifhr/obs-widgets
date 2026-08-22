import { Suspense } from 'react'
import { StartingSoon } from '../../components/StartingSoon'

export const metadata = { title: 'Starting Soon' }

export default function Page() {
  return (
    <Suspense>
      <StartingSoon />
    </Suspense>
  )
}
