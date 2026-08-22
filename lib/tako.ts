'use client'

import { useEffect, useRef, useState } from 'react'

export interface TakoTip {
  kind: 'tip'
  id: string
  name: string
  amount: number
  message: string
  method: string
  createdAt: string
  at: number
}

export interface TiktokLike {
  kind: 'like'
  user: string
  count: number
  at: number
}

export interface TiktokGift {
  kind: 'gift'
  id: string
  user: string
  giftName: string
  diamondCount: number
  repeatCount: number
  at: number
}

export type TakoEvent = TakoTip | TiktokLike | TiktokGift
export type TakoStatus = 'connecting' | 'open' | 'closed'

export function useTakoEvents(server: string, onData?: (e: TakoEvent) => void) {
  const cbRef = useRef(onData)
  cbRef.current = onData
  const [status, setStatus] = useState<TakoStatus>('connecting')

  useEffect(() => {
    const url = server ? `${server.replace(/\/$/, '')}/api/tako/webhook` : '/api/tako/webhook'
    const es = new EventSource(url)
    es.onopen = () => setStatus('open')
    es.onerror = () => setStatus('connecting')
    es.onmessage = (m) => {
      try {
        const p = JSON.parse(m.data) as TakoEvent
        cbRef.current?.(p)
      } catch { /* skip malformed */ }
    }
    return () => { es.close(); setStatus('connecting') }
  }, [server])

  return status
}
