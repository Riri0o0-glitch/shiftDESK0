'use client'

import { useCallback, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useWorkspaces } from '@/lib/use-workspaces'
import { createSampleWorkspace, createWorkspace } from '@/lib/workspace-utils'
import { Intro } from './intro'
import { GoalInput, type GoalFormValues } from './goal-input'
import { DeskTransition } from './desk-transition'
import { WorkspaceView } from './workspace/workspace-view'

type Stage = 'intro' | 'goal' | 'transition' | 'workspace'

export function ShiftDeskApp() {
  const store = useWorkspaces()
  const [stage, setStage] = useState<Stage>('intro')
  const [pendingName, setPendingName] = useState('')

  const enter = useCallback(() => setStage('workspace'), [])

  function create(values: GoalFormValues) {
    const ws = createWorkspace(values)
    store.add(ws)
    setPendingName(ws.name)
    setStage('transition')
  }

  function openSample() {
    const existing = store.workspaces.find((w) => w.isSample)
    if (existing) {
      store.select(existing.id)
      setPendingName(existing.name)
    } else {
      const ws = createSampleWorkspace()
      store.add(ws)
      setPendingName(ws.name)
    }
    setStage('transition')
  }

  return (
    <AnimatePresence mode="wait">
      {stage === 'intro' && <Intro key="intro" onContinue={() => setStage('goal')} />}
      {stage === 'goal' && (
        <GoalInput
          key="goal"
          onCreate={create}
          onSample={openSample}
          hasWorkspaces={store.ready && store.active !== null}
          onReturn={() => setStage('workspace')}
        />
      )}
      {stage === 'transition' && <DeskTransition key="transition" name={pendingName} onDone={enter} />}
      {stage === 'workspace' && store.active && (
        <WorkspaceView
          key="workspace"
          workspace={store.active}
          workspaces={store.workspaces}
          update={store.updateActive}
          onSelect={store.select}
          onNew={() => setStage('goal')}
          onDelete={(id) => {
            const remaining = store.workspaces.filter((w) => w.id !== id)
            store.remove(id)
            if (remaining.length === 0) setStage('goal')
          }}
        />
      )}
    </AnimatePresence>
  )
}
