export type WorkspaceType = 'study' | 'project' | 'personal'
export type MilestoneStatus = 'upcoming' | 'in-progress' | 'completed'

export interface Task {
  id: string
  title: string
  done: boolean
  createdAt: number
  completedAt?: number
}

export interface Milestone {
  id: string
  title: string
  date?: string
  status: MilestoneStatus
}

export interface Note {
  id: string
  title: string
  body: string
  updatedAt: number
}

export interface DocumentItem {
  id: string
  name: string
  size: number
  mime: string
  addedAt: number
  storage: 'local' | 'uploaded'
}

export interface Workspace {
  id: string
  name: string
  goal: string
  description: string
  type: WorkspaceType
  deadline?: string
  createdAt: number
  isSample?: boolean
  tasks: Task[]
  milestones: Milestone[]
  notes: Note[]
  documents: DocumentItem[]
}

export type WorkspaceUpdater = (fn: (w: Workspace) => Workspace) => void
