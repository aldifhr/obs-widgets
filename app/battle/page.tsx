import { Suspense } from 'react'
import { PixelBattle } from '../../components/PixelBattle'

export const metadata = { title: 'Pixel Battle' }

export default function Page() {
  return (
    <Suspense>
      <PixelBattle />
    </Suspense>
  )
}
