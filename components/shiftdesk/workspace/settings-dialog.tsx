'use client'

import { useState } from 'react'
import type { Workspace, WorkspaceType, WorkspaceUpdater } from '@/lib/types'
import { TYPE_LABEL } from '@/lib/workspace-utils'
import { isBackendConfigured } from '@/lib/api-config'
import { Modal, fieldCls } from '../primitives'

export function SettingsDialog({
  open,
  onClose,
  workspace,
  update,
  onDelete,
}: {
  open: boolean
  onClose: () => void
  workspace: Workspace
  update: WorkspaceUpdater
  onDelete: () => void
}) {
  return (
    <Modal open={open} onClose={onClose} title="Workspace settings">
      <SettingsForm key={workspace.id + String(open)} workspace={workspace} update={update} onClose={onClose} onDelete={onDelete} />
    </Modal>
  )
}

function SettingsForm({ workspace, update, onClose, onDelete }: { workspace: Workspace; update: WorkspaceUpdater; onClose: () => void; onDelete: () => void }) {
  const [name, setName] = useState(workspace.name)
  const [goal, setGoal] = useState(workspace.goal)
  const [description, setDescription] = useState(workspace.description)
  const [type, setType] = useState<WorkspaceType>(workspace.type)
  const [deadline, setDeadline] = useState(workspace.deadline ?? '')
  const [confirm, setConfirm] = useState(false)
  const [error, setError] = useState('')

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault()
        if (!name.trim() || !goal.trim()) return setError('Name and goal are required.')
        update((w) => ({ ...w, name: name.trim(), goal: goal.trim(), description: description.trim(), type, deadline: deadline || undefined }))
        onClose()
      }}
    >
      <Field id="s-name" label="Name">
        <input id="s-name" value={name} onChange={(e) => setName(e.target.value)} className={fieldCls} />
      </Field>
      <Field id="s-goal" label="Goal">
        <textarea id="s-goal" rows={3} value={goal} onChange={(e) => setGoal(e.target.value)} className={`${fieldCls} resize-none`} />
      </Field>
      <Field id="s-desc" label="Description">
        <input id="s-desc" value={description} onChange={(e) => setDescription(e.target.value)} className={fieldCls} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field id="s-type" label="Type">
          <select id="s-type" value={type} onChange={(e) => setType(e.target.value as WorkspaceType)} className={fieldCls}>
            {(Object.keys(TYPE_LABEL) as WorkspaceType[]).map((t) => (
              <option key={t} value={t}>{TYPE_LABEL[t]}</option>
            ))}
          </select>
        </Field>
        <Field id="s-deadline" label="Deadline">
          <div className="flex gap-1">
            <input id="s-deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className={fieldCls} />
            {deadline && (
              <button type="button" onClick={() => setDeadline('')} className="rounded-md px-2 text-xs text-muted-foreground hover:bg-secondary">Clear</button>
            )}
          </div>
        </Field>
      </div>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}

      <div className="rounded-md bg-secondary/60 p-3 text-xs leading-relaxed text-muted-foreground">
        <p className="font-medium text-foreground">Storage</p>
        <p className="mt-1">
          Workspace data is saved in this browser&apos;s localStorage.{' '}
          {isBackendConfigured ? 'A backend URL is configured in lib/api-config.ts.' : 'No backend is connected yet — set the Flask API URL in lib/api-config.ts.'}
        </p>
      </div>

      <div className="flex items-center justify-between border-t border-border pt-4">
        {confirm ? (
          <div className="flex items-center gap-2 text-xs">
            <span>Delete permanently?</span>
            <button type="button" onClick={onDelete} className="rounded-md bg-destructive px-3 py-1.5 text-primary-foreground">Delete</button>
            <button type="button" onClick={() => setConfirm(false)} className="rounded-md px-2 py-1.5 text-muted-foreground hover:bg-secondary">Keep</button>
          </div>
        ) : (
          <button type="button" onClick={() => setConfirm(true)} className="text-xs text-destructive hover:underline">Delete workspace</button>
        )}
        <button type="submit" className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:opacity-90">Save changes</button>
      </div>
    </form>
  )
}

function Field({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</label>
      {children}
    </div>
  )
}
