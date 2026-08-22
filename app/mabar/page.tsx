import { Suspense } from 'react'
import { QueueMabar } from '../../components/QueueMabar'

export const metadata = { title: 'Queue Mabar' }

export default function MabarPage() {
  return (
    <Suspense>
      <QueueMabar />
    </Suspense>
  )
}
