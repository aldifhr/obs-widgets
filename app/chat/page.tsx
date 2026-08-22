import { Suspense } from 'react'
import { LiveChat } from '../../components/LiveChat'

export const metadata = { title: 'Live Chat' }

export default function Page() {
  return (
    <Suspense>
      <LiveChat />
    </Suspense>
  )
}
