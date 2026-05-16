import { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { User, Flow } from '../types'
import { ArrowLeft, Save, Play, X, Loader, CheckCircle, XCircle, AlertTriangle, ListChecks } from 'lucide-react'
import FlowCanvas from '../components/FlowBuilder/FlowCanvas'
import NodePanel from '../components/FlowBuilder/NodePanel'
import SettingsPanel from '../components/FlowBuilder/SettingsPanel'
import { executeFlow, type ExecutionResult } from '../lib/flowExecutor'
import { validateFlow, type ValidationIssue } from '../lib/flowValidator'
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
  const [saveStatus, setSaveStatus] = useState<'saved' | 'unsaved' | 'saving'>('saved')
  const [testing, setTesting] = useState(false)
  const [testResults, setTestResults] = useState<ExecutionResult[] | null>(null)
  const [showTestModal, setShowTestModal] = useState(false)
  const [validation, setValidation] = useState<ValidationIssue[]>([])
  const [showValidation, setShowValidation] = useState(false)
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const markDirty = useCallback(() => {
    setSaveStatus('unsaved')
  }, [])

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
    setSaveStatus('saving')
    await supabase.from('flows').update({
      nodes: nodes as unknown as Record<string, unknown>,
      edges: edges as unknown as Record<string, unknown>,
      updated_at: new Date().toISOString(),
    }).eq('id', id)
    setSaveStatus('saved')
  }, [id, nodes, edges])

  const syncDebounced = useCallback(() => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    autoSaveTimer.current = setTimeout(() => {
      saveFlow()
    }, 3000)
  }, [saveFlow])

  useEffect(() => {
    if (saveStatus === 'unsaved') syncDebounced()
    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current) }
  }, [saveStatus, syncDebounced])

  const handleNodesChange = useCallback((newNodes: Node[]) => {
    setNodes(newNodes)
    markDirty()
  }, [markDirty])

  const handleEdgesChange = useCallback((newEdges: Edge[]) => {
    setEdges(newEdges)
    markDirty()
  }, [markDirty])

  const handleNodeUpdate = useCallback((nodeId: string, data: Record<string, unknown>) => {
    setNodes((nds) => nds.map((n) => (n.id === nodeId ? { ...n, data } : n)))
    markDirty()
  }, [markDirty])

  useEffect(() => {
    setValidation(validateFlow(nodes, edges))
  }, [nodes, edges])

  const errorCount = useMemo(() => validation.filter((v) => v.type === 'error').length, [validation])
  const warningCount = useMemo(() => validation.filter((v) => v.type === 'warning').length, [validation])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
        saveFlow()
      }
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedNode) {
        setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id))
        setEdges((eds) => eds.filter((ed) => ed.source !== selectedNode.id && ed.target !== selectedNode.id))
        setSelectedNode(null)
        markDirty()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [saveFlow, markDirty, selectedNode])

  const handleTest = useCallback(async () => {
    if (nodes.length === 0) return
    setTesting(true)
    setTestResults(null)
    setShowTestModal(true)
    const results = await executeFlow(nodes, edges, user.id)
    setTestResults(results)
    setTesting(false)
  }, [nodes, edges, user.id])

  const statusColor = { saved: 'text-green-400', unsaved: 'text-amber-400', saving: 'text-cyan-400' }
  const statusLabel = { saved: 'Saved', unsaved: 'Unsaved', saving: 'Saving...' }

  if (!flow) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-400" />
      </div>
    )
  }

  const resultIcon = (r: ExecutionResult) => {
    if (r.nodeType === 'error') return <XCircle size={16} className="text-red-400" />
    if (r.duration > 0) return <CheckCircle size={16} className="text-green-400" />
    return <CheckCircle size={16} className="text-gray-500" />
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
          <span className={`text-xs ${statusColor[saveStatus]} flex items-center gap-1`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusColor[saveStatus]}`} />
            {statusLabel[saveStatus]}
          </span>
          <button
            onClick={() => { setShowValidation(!showValidation) }}
            className={`flex items-center gap-1.5 text-xs font-medium rounded-lg px-3 py-1.5 transition-colors cursor-pointer ${
              errorCount > 0
                ? 'text-red-400 bg-red-500/10 hover:bg-red-500/20'
                : warningCount > 0
                  ? 'text-amber-400 bg-amber-500/10 hover:bg-amber-500/20'
                  : 'text-green-400 bg-green-500/10 hover:bg-green-500/20'
            }`}
          >
            <ListChecks size={14} />
            {errorCount > 0 ? `${errorCount} error${errorCount > 1 ? 's' : ''}` : warningCount > 0 ? `${warningCount} warning${warningCount > 1 ? 's' : ''}` : 'Valid'}
          </button>
          <button
            onClick={() => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current); saveFlow() }}
            disabled={saveStatus === 'saving'}
            className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-white text-sm font-medium rounded-lg px-4 py-2 transition-all shadow-lg shadow-cyan-500/25 disabled:opacity-50 cursor-pointer"
          >
            <Save size={16} />
            {saveStatus === 'saving' ? 'Saving...' : 'Save'}
          </button>
          <button
            onClick={handleTest}
            disabled={testing || nodes.length === 0}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg px-4 py-2 transition-all disabled:opacity-50 cursor-pointer"
          >
            {testing ? <Loader size={16} className="animate-spin" /> : <Play size={16} />}
            Test
          </button>
        </div>
      </header>

      {showValidation && validation.length > 0 && (
        <div className="bg-gray-900 border-b border-gray-800 px-6 py-3">
          <p className="text-xs font-medium text-gray-400 mb-2">Flow Validation</p>
          <div className="space-y-1.5">
            {validation.map((v, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                {v.type === 'error'
                  ? <XCircle size={12} className="text-red-400 shrink-0" />
                  : <AlertTriangle size={12} className="text-amber-400 shrink-0" />
                }
                <span className={v.type === 'error' ? 'text-red-300' : 'text-amber-300'}>{v.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

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

      {showTestModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-800 rounded-xl w-[600px] max-h-[80vh] overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Play size={14} className="text-emerald-400" />
                Flow Test Results
              </h3>
              <button
                onClick={() => { setShowTestModal(false); setTestResults(null) }}
                className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-60px)]">
              {testing ? (
                <div className="flex flex-col items-center gap-3 py-12">
                  <Loader size={24} className="animate-spin text-emerald-400" />
                  <p className="text-sm text-gray-400">Executing flow...</p>
                </div>
              ) : testResults && testResults.length > 0 ? (
                <div className="space-y-3">
                  {testResults.map((r, i) => (
                    <div key={i} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {resultIcon(r)}
                          <span className="text-sm font-medium text-white capitalize">
                            {r.nodeType === 'error' ? 'Error' : r.nodeType}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">{r.duration}ms</span>
                      </div>
                      <p className="text-sm text-gray-300 mb-1">
                        <span className="text-gray-500">Output:</span> {r.output || '(empty)'}
                      </p>
                      {r.input && (
                        <p className="text-xs text-gray-500">
                          <span className="text-gray-600">Input:</span> {r.input}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 text-center py-8">No results</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
