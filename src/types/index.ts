export interface User {
  id: string
  email: string
  created_at: string
}

export interface Flow {
  id: string
  user_id: string
  name: string
  description: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface FlowNode {
  id: string
  flow_id: string
  node_id: string
  type: NodeType
  position_x: number
  position_y: number
  data: Record<string, unknown>
  created_at: string
}

export interface FlowEdge {
  id: string
  flow_id: string
  edge_id: string
  source_node_id: string
  target_node_id: string
  source_handle: string
  target_handle: string
  created_at: string
}

export type NodeType = 'message' | 'condition' | 'delay' | 'ai' | 'telegram' | 'email' | 'webhook' | 'trigger'

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
