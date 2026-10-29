'use client'

import { useCallback, useEffect, useState } from 'react'
import type { Workspace } from './types'
import { createWorkspace, deleteWorkspace, fetchWorkspaces, isBackendConfigured, updateWorkspace } from './api-config'

const STORAGE_KEY = 'shiftdesk:v1'

interface Store {
  workspaces: Workspace[]
  activeId: string | null
}

export function useWorkspaces() {
  const [store, setStore] = useState<Store>({ workspaces: [], activeId: null })
  const [ready, setReady] = useState(false)
  const [syncError, setSyncError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setStore(JSON.parse(raw) as Store)
    } catch {
      // Corrupted storage: start fresh rather than crash.
    }
    if (!isBackendConfigured) {
      setReady(true)
      return () => { cancelled = true }
    }

    fetchWorkspaces<Workspace>()
      .then((workspaces) => {
        if (cancelled) return
        setStore((current) => ({
          workspaces,
          activeId: workspaces.some((w) => w.id === current.activeId) ? current.activeId : (workspaces[0]?.id ?? null),
        }))
        setSyncError(null)
      })
      .catch((error: unknown) => {
        if (!cancelled) setSyncError(error instanceof Error ? error.message : 'Could not load workspaces from the backend.')
      })
      .finally(() => {
        if (!cancelled) setReady(true)
      })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (ready) localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
  }, [store, ready])

  const add = useCallback((w: Workspace) => {
    setStore((s) => ({ workspaces: [...s.workspaces, w], activeId: w.id }))
    if (isBackendConfigured) {
      createWorkspace(w).then(() => setSyncError(null)).catch((error: unknown) => {
        setSyncError(error instanceof Error ? error.message : 'Could not save workspace.')
      })
    }
  }, [])

  const select = useCallback((id: string) => setStore((s) => ({ ...s, activeId: id })), [])

  const remove = useCallback((id: string) => {
    setStore((s) => {
      const workspaces = s.workspaces.filter((w) => w.id !== id)
      return { workspaces, activeId: s.activeId === id ? (workspaces[0]?.id ?? null) : s.activeId }
    })
    if (isBackendConfigured) {
      deleteWorkspace(id).then(() => setSyncError(null)).catch((error: unknown) => {
        setSyncError(error instanceof Error ? error.message : 'Could not delete workspace.')
      })
    }
  }, [])

  const active = store.workspaces.find((w) => w.id === store.activeId) ?? null

  const updateActive = useCallback((fn: (w: Workspace) => Workspace) => {
    if (!active) return
    const next = fn(active)
    setStore((s) => ({ ...s, workspaces: s.workspaces.map((w) => (w.id === next.id ? next : w)) }))
    if (isBackendConfigured) {
      updateWorkspace(next).then(() => setSyncError(null)).catch((error: unknown) => {
        setSyncError(error instanceof Error ? error.message : 'Could not save workspace changes.')
      })
    }
  }, [active])

  return { ready, syncError, workspaces: store.workspaces, active, add, select, remove, updateActive }
}
