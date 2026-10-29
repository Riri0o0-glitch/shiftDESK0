'use client'

import { useCallback, useEffect, useState } from 'react'
import type { Workspace } from './types'

const STORAGE_KEY = 'shiftdesk:v1'

interface Store {
  workspaces: Workspace[]
  activeId: string | null
}

export function useWorkspaces() {
  const [store, setStore] = useState<Store>({ workspaces: [], activeId: null })
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setStore(JSON.parse(raw) as Store)
    } catch {
      // Corrupted storage: start fresh rather than crash.
    }
    setReady(true)
  }, [])

  useEffect(() => {
    if (ready) localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
  }, [store, ready])

  const add = useCallback((w: Workspace) => {
    setStore((s) => ({ workspaces: [...s.workspaces, w], activeId: w.id }))
  }, [])

  const select = useCallback((id: string) => setStore((s) => ({ ...s, activeId: id })), [])

  const remove = useCallback((id: string) => {
    setStore((s) => {
      const workspaces = s.workspaces.filter((w) => w.id !== id)
      return { workspaces, activeId: s.activeId === id ? (workspaces[0]?.id ?? null) : s.activeId }
    })
  }, [])

  const updateActive = useCallback((fn: (w: Workspace) => Workspace) => {
    setStore((s) => ({ ...s, workspaces: s.workspaces.map((w) => (w.id === s.activeId ? fn(w) : w)) }))
  }, [])

  const active = store.workspaces.find((w) => w.id === store.activeId) ?? null

  return { ready, workspaces: store.workspaces, active, add, select, remove, updateActive }
}
