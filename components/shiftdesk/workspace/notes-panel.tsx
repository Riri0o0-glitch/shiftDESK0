'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus, Trash2 } from 'lucide-react'
import type { Note, Workspace, WorkspaceUpdater } from '@/lib/types'
import { uid } from '@/lib/workspace-utils'
import { IconButton, fieldCls } from '../primitives'
import { cn } from '@/lib/utils'

export function NotesPanel({ workspace, update }: { workspace: Workspace; update: WorkspaceUpdater }) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const notes = [...workspace.notes].sort((a, b) => b.updatedAt - a.updatedAt)

  function create() {
    const note: Note = { id: uid(), title: '', body: '', updatedAt: Date.now() }
    update((w) => ({ ...w, notes: [note, ...w.notes] }))
    setEditingId(note.id)
  }
  const save = (n: Note) => update((w) => ({ ...w, notes: w.notes.map((x) => (x.id === n.id ? { ...n, updatedAt: Date.now() } : x)) }))
  const remove = (id: string) => update((w) => ({ ...w, notes: w.notes.filter((n) => n.id !== id) }))

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-medium">Notes <span className="text-muted-foreground">{notes.length}</span></h3>
        <button type="button" onClick={create} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
          <Plus className="size-3.5" aria-hidden="true" /> New note
        </button>
      </div>
      {notes.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">Ideas, feedback, links — keep them next to the work.</p>
      ) : (
        <ul className="space-y-3">
          <AnimatePresence initial={false}>
            {notes.map((n) => (
              <motion.li key={n.id} layout initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                {editingId === n.id ? (
                  <NoteEditor
                    note={n}
                    onSave={(next) => {
                      if (!next.title.trim() && !next.body.trim()) remove(n.id)
                      else save(next)
                      setEditingId(null)
                    }}
                    onDelete={() => {
                      remove(n.id)
                      setEditingId(null)
                    }}
                  />
                ) : (
                  <div className="group relative rounded-lg border border-border bg-paper transition-shadow hover:shadow-[0_8px_24px_-16px_rgba(36,37,34,0.35)]">
                    <button type="button" onClick={() => setEditingId(n.id)} className="block w-full p-4 pr-12 text-left">
                      <p className="font-serif text-lg leading-tight">{n.title || 'Untitled note'}</p>
                      {n.body && <p className="mt-1 line-clamp-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{n.body}</p>}
                      <p className="mt-2 text-[11px] text-muted-foreground/80">
                        Edited {new Date(n.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </button>
                    <IconButton label="Delete note" onClick={() => remove(n.id)} className="absolute right-2 top-2 hover:text-destructive md:opacity-0 md:group-hover:opacity-100 md:focus:opacity-100">
                      <Trash2 className="size-3.5" />
                    </IconButton>
                  </div>
                )}
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </div>
  )
}

function NoteEditor({ note, onSave, onDelete }: { note: Note; onSave: (n: Note) => void; onDelete: () => void }) {
  const [title, setTitle] = useState(note.title)
  const [body, setBody] = useState(note.body)
  return (
    <div className="space-y-2 rounded-lg border border-accent/60 bg-paper p-3">
      <label className="sr-only" htmlFor={`note-title-${note.id}`}>Note title</label>
      <input id={`note-title-${note.id}`} autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className={cn(fieldCls, 'border-transparent font-serif text-lg focus:border-transparent')} />
      <label className="sr-only" htmlFor={`note-body-${note.id}`}>Note</label>
      <textarea id={`note-body-${note.id}`} value={body} onChange={(e) => setBody(e.target.value)} rows={4} placeholder="Write something…" className={cn(fieldCls, 'resize-y border-transparent focus:border-transparent')} />
      <div className="flex justify-between">
        <button type="button" onClick={onDelete} className="rounded-md px-3 py-1.5 text-xs text-muted-foreground hover:text-destructive">Delete</button>
        <button type="button" onClick={() => onSave({ ...note, title: title.trim(), body })} className="rounded-md bg-primary px-4 py-1.5 text-xs text-primary-foreground hover:opacity-90">Save note</button>
      </div>
    </div>
  )
}
