import { Suspense } from 'react'
import { GlassTipjar } from '../../components/GlassTipjar'

export const metadata = { title: 'Glass Tipjar' }

export default function GlassTipjarPage() {
  return (
    <Suspense>
      <GlassTipjar />
    </Suspense>
  )
}
