export const apiConfig = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL ?? '',
  endpoints: {
    uploadDocument: '/api/workspaces',
  },
} as const

export const isBackendConfigured = Boolean(apiConfig.baseUrl)
export const canUploadDocuments = isBackendConfigured

export async function uploadDocument(file: File, workspaceId: string): Promise<void> {
  if (!canUploadDocuments) throw new Error('No upload endpoint is configured.')
  const body = new FormData()
  body.append('file', file)
  const res = await fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.uploadDocument}/${encodeURIComponent(workspaceId)}/documents`, {
    method: 'POST',
    body,
  })
  if (!res.ok) throw new Error(`Upload failed (${res.status})`)
}
