import { Suspense } from 'react'
import { PixelTipjarCustomizer } from '@/components/PixelTipjar'

export default function TipjarPage() {
  return (
    <Suspense>
      <PixelTipjarCustomizer />
    </Suspense>
  )
}
