// ═══════════════════════════════════════════════════════════════
// SMVS Seva Management System — Shared TypeScript Types
// ═══════════════════════════════════════════════════════════════

export type Role = 'super_admin' | 'center_admin' | 'member'

export interface Center {
  id: string
  name: string
  location: string | null
  admin_name: string | null
  created_at: string
}

export interface AdminUser {
  id: string
  role: 'super_admin' | 'center_admin'
  center_id: string | null
  name: string
  email: string
  created_at: string
}

export interface Member {
  global_id: string
  name: string
  phone: string
  center_id: string
  active: boolean
  created_at: string
  // joined
  center?: Center
}

export interface SevaCategory {
  id: string
  center_id: string
  name: string
  description: string | null
  created_at: string
  center?: Center
}

export interface Seva {
  id: string
  category_id: string
  center_id: string
  name: string
  description: string | null
  frequency: 'daily' | 'weekly' | 'monthly' | 'one-time' | 'custom'
  active: boolean
  created_at: string
  // joined
  category?: SevaCategory
  center?: Center
  assignments?: SevaAssignment[]
}

export interface SevaAssignment {
  id: string
  seva_id: string
  member_id: string
  center_id: string
  role: 'leader' | 'member'
  assigned_date: string
  created_at: string
  // joined
  seva?: Seva
  member?: Member
  completions?: SevaCompletion[]
}

export interface SevaCompletion {
  id: string
  assignment_id: string
  member_id: string
  seva_id: string
  center_id: string
  completed_date: string
  proof_url: string | null
  proof_public_id: string | null
  user_suchan: string | null
  admin_remark: string | null
  remark_media_url: string | null
  remark_media_public_id: string | null
  media_expires_at: string | null
  created_at: string
  // joined
  member?: Member
  seva?: Seva
  assignment?: SevaAssignment
}

// ── Auth session payload stored in JWT ──
export interface SessionPayload {
  userId: string
  role: Role
  centerId: string | null
  memberGlobalId: string | null  // for member logins
  name: string
  email: string | null
  iat?: number
  exp?: number
}

// ── API response wrapper ──
export interface ApiResponse<T = unknown> {
  data?: T
  error?: string
}

// ── Dashboard stats ──
export interface CenterStats {
  center: Center
  memberCount: number
  sevaCount: number
  assignmentCount: number
  completionCount: number
  pendingCount: number
}
