import type { User as SupabaseUser } from '@supabase/supabase-js'

export type User = SupabaseUser

export interface Flow {
  id: string
  user_id: string
  name: string
  description: string
  is_active: boolean
  nodes?: Record<string, unknown>[]
  edges?: Record<string, unknown>[]
  created_at: string
  updated_at: string
}

export interface Contact {
  id: string
  user_id: string
  name: string
  platform: string
  platform_id: string
  metadata: Record<string, unknown>
  created_at: string
}

export interface Conversation {
  id: string
  flow_id: string
  contact_id: string
  status: 'active' | 'completed' | 'waiting'
  current_node_id: string
  data: Record<string, unknown>
  created_at: string
  updated_at: string
}
