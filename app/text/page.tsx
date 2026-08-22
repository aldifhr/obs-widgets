import { Suspense } from 'react'
import { TextOverlay } from '../../components/TextOverlay'

export const metadata = { title: 'Text Overlay' }

export default function Page() {
  return (
    <Suspense>
      <TextOverlay />
    </Suspense>
  )
}
