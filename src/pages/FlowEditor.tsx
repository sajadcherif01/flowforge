import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { User, Flow } from '../types'
import { ArrowLeft, Save, Play, Trash2 } from 'lucide-react'
import FlowCanvas from '../components/FlowBuilder/FlowCanvas'
import NodePanel from '../components/FlowBuilder/NodePanel'
import SettingsPanel from '../components/FlowBuilder/SettingsPanel'
import type { Node, Edge } from '@xyflow/react'

interface FlowEditorProps {
  user: User
}

export default function FlowEditor({ user }: FlowEditorProps) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [flow, setFlow] = useState<Flow | null>(null)
  const [nodes, setNodes] = useState<Node[]>([])
  const [edges, setEdges] = useState<Edge[]>([])
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    if (!id) return
    supabase.from('flows').select('*').eq('id', id).single().then(({ data }) => {
      if (data) {
        setFlow(data)
        if (data.nodes) setNodes(data.nodes as unknown as Node[])
        if (data.edges) setEdges(data.edges as unknown as Edge[])
      }
    })
  }, [id])

  const saveFlow = useCallback(async () => {
    if (!id) return
    setSaving(true)
    await supabase.from('flows').update({
      nodes: nodes as unknown as Record<string, unknown>,
      edges: edges as unknown as Record<string, unknown>,
      updated_at: new Date().toISOString(),
    }).eq('id', id)
    setSaving(false)
    setDirty(false)
  }, [id, nodes, edges])

  const handleNodesChange = useCallback((newNodes: Node[]) => {
    setNodes(newNodes)
    setDirty(true)
  }, [])

  const handleEdgesChange = useCallback((newEdges: Edge[]) => {
    setEdges(newEdges)
    setDirty(true)
  }, [])

  const handleNodeUpdate = useCallback((nodeId: string, data: Record<string, unknown>) => {
    setNodes((nds) => nds.map((n) => (n.id === nodeId ? { ...n, data } : n)))
    setDirty(true)
  }, [])

  if (!flow) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-400" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen">
      <header className="flex items-center justify-between px-6 py-3 bg-gray-900/80 border-b border-gray-800 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="text-sm font-semibold text-white">{flow.name}</h2>
            <p className="text-xs text-gray-500">{flow.description || 'No description'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {dirty && <span className="text-xs text-amber-400">Unsaved changes</span>}
          <button
            onClick={saveFlow}
            disabled={saving}
            className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-white text-sm font-medium rounded-lg px-4 py-2 transition-all shadow-lg shadow-cyan-500/25 disabled:opacity-50 cursor-pointer"
          >
            <Save size={16} />
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg px-4 py-2 transition-all cursor-pointer">
            <Play size={16} />
            Test
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <NodePanel />
        <div className="flex-1 relative">
          <FlowCanvas
            initialNodes={nodes}
            initialEdges={edges}
            onNodesChange={handleNodesChange}
            onEdgesChange={handleEdgesChange}
            onSelectNode={setSelectedNode}
          />
        </div>
        <SettingsPanel node={selectedNode} onUpdate={handleNodeUpdate} />
      </div>
    </div>
  )
}
