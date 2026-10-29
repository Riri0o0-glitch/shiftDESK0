'use client'

import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { FileImage, FileText, Loader2, Trash2, UploadCloud } from 'lucide-react'
import type { DocumentItem, Workspace, WorkspaceUpdater } from '@/lib/types'
import { formatBytes, uid } from '@/lib/workspace-utils'
import { canUploadDocuments, uploadDocument } from '@/lib/api-config'
import { IconButton, Pill } from '../primitives'
import { cn } from '@/lib/utils'

const ACCEPT = '.pdf,.docx,.txt,image/*'
const MAX_BYTES = 15 * 1024 * 1024
const ALLOWED = /\.(pdf|docx|txt|png|jpe?g|gif|webp|svg|heic)$/i

export function DocumentsPanel({ workspace, update }: { workspace: Workspace; update: WorkspaceUpdater }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const files = useRef(new Map<string, File>())
  const [dragging, setDragging] = useState(false)
  const [message, setMessage] = useState<{ tone: 'error' | 'info'; text: string } | null>(null)
  const [uploading, setUploading] = useState<string | null>(null)

  function addFiles(list: FileList | null) {
    if (!list) return
    const accepted: DocumentItem[] = []
    const rejected: string[] = []
    for (const f of Array.from(list)) {
      if (!ALLOWED.test(f.name) && !f.type.startsWith('image/')) rejected.push(`${f.name} (unsupported type)`)
      else if (f.size > MAX_BYTES) rejected.push(`${f.name} (over 15 MB)`)
      else {
        const id = uid()
        files.current.set(id, f)
        accepted.push({ id, name: f.name, size: f.size, mime: f.type, addedAt: Date.now(), storage: 'local' })
      }
    }
    if (accepted.length) update((w) => ({ ...w, documents: [...accepted, ...w.documents] }))
    setMessage(rejected.length ? { tone: 'error', text: `Skipped: ${rejected.join(', ')}` } : null)
    if (inputRef.current) inputRef.current.value = ''
  }

  async function upload(doc: DocumentItem) {
    const file = files.current.get(doc.id)
    if (!file) return setMessage({ tone: 'info', text: 'Re-select this file to upload it — local files are not kept after a reload.' })
    setUploading(doc.id)
    try {
      await uploadDocument(file)
      update((w) => ({ ...w, documents: w.documents.map((d) => (d.id === doc.id ? { ...d, storage: 'uploaded' } : d)) }))
      setMessage(null)
    } catch (err) {
      setMessage({ tone: 'error', text: err instanceof Error ? err.message : 'Upload failed.' })
    } finally {
      setUploading(null)
    }
  }

  const remove = (id: string) => {
    files.current.delete(id)
    update((w) => ({ ...w, documents: w.documents.filter((d) => d.id !== id) }))
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-medium">Documents <span className="text-muted-foreground">{workspace.documents.length}</span></h3>
        <span className="text-[11px] text-muted-foreground">PDF, DOCX, TXT, images</span>
      </div>

      <label
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          addFiles(e.dataTransfer.files)
        }}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed px-4 py-6 text-center transition-colors focus-within:border-accent',
          dragging ? 'border-accent bg-accent/5' : 'border-border hover:border-foreground/30',
        )}
      >
        <UploadCloud className="size-5 text-muted-foreground" aria-hidden="true" />
        <span className="mt-2 text-sm">Drop files or <span className="underline underline-offset-4">browse</span></span>
        <span className="mt-1 text-xs text-muted-foreground">Up to 15 MB each</span>
        <input ref={inputRef} type="file" multiple accept={ACCEPT} className="sr-only" onChange={(e) => addFiles(e.target.files)} />
      </label>

      <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
        {canUploadDocuments
          ? 'Local attachments stay in this browser until you upload them to the backend.'
          : 'No backend is connected, so attachments are local: only the name and size are remembered on this device.'}
      </p>

      {message && (
        <p role={message.tone === 'error' ? 'alert' : 'status'} className={cn('mt-3 text-xs', message.tone === 'error' ? 'text-destructive' : 'text-muted-foreground')}>
          {message.text}
        </p>
      )}

      {workspace.documents.length > 0 && (
        <ul className="mt-4 divide-y divide-border border-y border-border">
          <AnimatePresence initial={false}>
            {workspace.documents.map((d) => {
              const Icon = d.mime.startsWith('image/') ? FileImage : FileText
              return (
                <motion.li key={d.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-3 py-2.5">
                  <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm">{d.name}</p>
                    <p className="text-[11px] text-muted-foreground">{formatBytes(d.size)}</p>
                  </div>
                  {d.storage === 'uploaded' ? <Pill tone="olive">Uploaded</Pill> : <Pill>Local</Pill>}
                  {d.storage === 'local' && canUploadDocuments && (
                    <IconButton label={`Upload ${d.name}`} onClick={() => upload(d)} disabled={uploading === d.id}>
                      {uploading === d.id ? <Loader2 className="size-3.5 animate-spin" /> : <UploadCloud className="size-3.5" />}
                    </IconButton>
                  )}
                  <IconButton label={`Remove ${d.name}`} onClick={() => remove(d.id)} className="hover:text-destructive">
                    <Trash2 className="size-3.5" />
                  </IconButton>
                </motion.li>
              )
            })}
          </AnimatePresence>
        </ul>
      )}
    </div>
  )
}
