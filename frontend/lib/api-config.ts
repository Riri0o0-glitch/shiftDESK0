export const apiConfig = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL ?? '',
  endpoints: {
    workspaces: '/api/workspaces',
    uploadDocument: '/api/workspaces',
  },
} as const

export const isBackendConfigured = Boolean(apiConfig.baseUrl)
export const canUploadDocuments = isBackendConfigured

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${apiConfig.baseUrl}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  })
  if (!res.ok) {
    const body = await res.json().catch(() => null) as { error?: string } | null
    throw new Error(body?.error ?? `Request failed (${res.status})`)
  }
  return res.json() as Promise<T>
}

export async function fetchWorkspaces<T>(): Promise<T[]> {
  if (!isBackendConfigured) throw new Error('No backend is configured.')
  return request<T[]>(apiConfig.endpoints.workspaces)
}

export async function createWorkspace<T>(workspace: T): Promise<T> {
  if (!isBackendConfigured) throw new Error('No backend is configured.')
  return request<T>(apiConfig.endpoints.workspaces, { method: 'POST', body: JSON.stringify(workspace) })
}

export async function updateWorkspace<T extends { id: string }>(workspace: T): Promise<T> {
  if (!isBackendConfigured) throw new Error('No backend is configured.')
  return request<T>(`${apiConfig.endpoints.workspaces}/${encodeURIComponent(workspace.id)}`, {
    method: 'PUT',
    body: JSON.stringify(workspace),
  })
}

export async function deleteWorkspace(id: string): Promise<void> {
  if (!isBackendConfigured) throw new Error('No backend is configured.')
  await request(`${apiConfig.endpoints.workspaces}/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

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
