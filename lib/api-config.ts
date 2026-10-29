// Point these at your Flask backend once the MongoDB-backed endpoints exist.
// While empty, ShiftDesk keeps all data in this browser (localStorage) and says so in the UI.
export const apiConfig = {
  baseUrl: '',
  endpoints: {
    uploadDocument: '',
  },
} as const

export const isBackendConfigured = apiConfig.baseUrl.length > 0
export const canUploadDocuments = isBackendConfigured && apiConfig.endpoints.uploadDocument.length > 0

export async function uploadDocument(file: File): Promise<void> {
  if (!canUploadDocuments) throw new Error('No upload endpoint is configured.')
  const body = new FormData()
  body.append('file', file)
  const res = await fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.uploadDocument}`, { method: 'POST', body })
  if (!res.ok) throw new Error(`Upload failed (${res.status})`)
}
