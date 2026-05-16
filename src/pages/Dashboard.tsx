import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { User, Flow } from '../types'
import { Plus, GitBranch, Play, Pause, Trash2, ExternalLink, Copy, Search, Users, Zap, Download, Upload } from 'lucide-react'

interface DashboardProps {
  user: User
}

export default function Dashboard({ user }: DashboardProps) {
  const [flows, setFlows] = useState<Flow[]>([])
  const [contactsCount, setContactsCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [search, setSearch] = useState('')
  const [duplicating, setDuplicating] = useState<string | null>(null)
  const navigate = useNavigate()

  const loadFlows = async () => {
    const { data } = await supabase
      .from('flows')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
    if (data) setFlows(data)
    setLoading(false)
  }

  const loadStats = async () => {
    const { count } = await supabase
      .from('contacts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
    if (count !== null) setContactsCount(count)
  }

  useEffect(() => {
    loadFlows()
    loadStats()
  }, [])

  const createFlow = async () => {
    if (!newName.trim()) return
    const { data } = await supabase
      .from('flows')
      .insert({ user_id: user.id, name: newName })
      .select()
      .single()
    if (data) {
      setFlows([data, ...flows])
      setShowCreate(false)
      setNewName('')
      navigate(`/flow/${data.id}`)
    }
  }

  const duplicateFlow = async (flow: Flow) => {
    setDuplicating(flow.id)
    const { data } = await supabase
      .from('flows')
      .insert({
        user_id: user.id,
        name: `${flow.name} (copy)`,
        nodes: flow.nodes,
        edges: flow.edges,
      })
      .select()
      .single()
    if (data) {
      setFlows([data, ...flows])
    }
    setDuplicating(null)
  }

  const toggleFlow = async (flow: Flow) => {
    await supabase
      .from('flows')
      .update({ is_active: !flow.is_active })
      .eq('id', flow.id)
    loadFlows()
  }

  const deleteFlow = async (id: string) => {
    await supabase.from('flows').delete().eq('id', id)
    setFlows(flows.filter(f => f.id !== id))
  }

  const filteredFlows = flows.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-400" />
      </div>
    )
  }

  const activeFlows = flows.filter((f) => f.is_active).length

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Your Flows</h1>
          <p className="text-gray-400 text-sm mt-1">Build and manage your automation flows</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-white font-medium rounded-lg px-4 py-2.5 transition-all shadow-lg shadow-cyan-500/25 cursor-pointer"
        >
          <Plus size={18} />
          New Flow
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <GitBranch size={18} className="text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{flows.length}</p>
              <p className="text-xs text-gray-400">Total Flows</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <Zap size={18} className="text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{activeFlows}</p>
              <p className="text-xs text-gray-400">Active Flows</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <Users size={18} className="text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{contactsCount}</p>
              <p className="text-xs text-gray-400">Contacts</p>
            </div>
          </div>
        </div>
      </div>

      {showCreate && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-6 flex items-center gap-3">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Flow name..."
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && createFlow()}
          />
          <button onClick={createFlow} className="bg-cyan-500 hover:bg-cyan-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer">Create</button>
          <button onClick={() => { setShowCreate(false); setNewName('') }} className="text-gray-400 hover:text-white px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer">Cancel</button>
        </div>
      )}

      {flows.length > 0 && (
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search flows..."
              className="bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 w-72"
            />
          </div>
          <label className="flex items-center gap-2 text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-lg px-4 py-2 text-sm font-medium transition-colors cursor-pointer">
            <Upload size={16} />
            Import
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (!file) return
                const reader = new FileReader()
                reader.onload = async (ev) => {
                  try {
                    const data = JSON.parse(ev.target?.result as string)
                    const { data: newFlow } = await supabase.from('flows').insert({
                      user_id: user.id,
                      name: data.name || 'Imported Flow',
                      description: data.description || '',
                      nodes: data.nodes || [],
                      edges: data.edges || [],
                    }).select().single()
                    if (newFlow) {
                      setFlows([newFlow, ...flows])
                    }
                  } catch { /* invalid JSON */ }
                }
                reader.readAsText(file)
                e.target.value = ''
              }}
            />
          </label>
        </div>
      )}

      {filteredFlows.length === 0 ? (
        <div className="text-center py-20">
          <GitBranch size={48} className="text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-400 mb-2">
            {flows.length === 0 ? 'No flows yet' : 'No flows match your search'}
          </h3>
          {flows.length === 0 && (
            <>
              <p className="text-gray-500 text-sm mb-6">Create your first automation flow to get started</p>
              <button
                onClick={() => setShowCreate(true)}
                className="inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-white font-medium rounded-lg px-4 py-2.5 transition-colors cursor-pointer"
              >
                <Plus size={18} />
                Create your first flow
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredFlows.map((flow) => (
            <div key={flow.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className={`w-2 h-2 rounded-full ${flow.is_active ? 'bg-green-400' : 'bg-gray-600'}`} />
                  <div>
                    <h3 className="font-medium text-white">{flow.name}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {flow.description || 'No description'} · Created {new Date(flow.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const blob = new Blob([JSON.stringify({ name: flow.name, description: flow.description, nodes: flow.nodes, edges: flow.edges }, null, 2)], { type: 'application/json' })
                      const url = URL.createObjectURL(blob)
                      const a = document.createElement('a')
                      a.href = url
                      a.download = `${flow.name.replace(/\s+/g, '_')}.flowforge.json`
                      a.click()
                      URL.revokeObjectURL(url)
                    }}
                    className="p-2 rounded-lg text-gray-500 hover:text-amber-400 hover:bg-amber-500/10 transition-colors cursor-pointer"
                    title="Export"
                  >
                    <Download size={16} />
                  </button>
                  <button
                    onClick={() => duplicateFlow(flow)}
                    disabled={duplicating === flow.id}
                    className="p-2 rounded-lg text-gray-500 hover:text-purple-400 hover:bg-purple-500/10 transition-colors disabled:opacity-50 cursor-pointer"
                    title="Duplicate"
                  >
                    <Copy size={16} />
                  </button>
                  <button
                    onClick={() => toggleFlow(flow)}
                    className={`p-2 rounded-lg transition-colors cursor-pointer ${flow.is_active ? 'text-green-400 hover:bg-green-500/10' : 'text-gray-500 hover:bg-gray-800'}`}
                    title={flow.is_active ? 'Pause' : 'Activate'}
                  >
                    {flow.is_active ? <Pause size={16} /> : <Play size={16} />}
                  </button>
                  <button
                    onClick={() => navigate(`/flow/${flow.id}`)}
                    className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
                    title="Edit"
                  >
                    <ExternalLink size={16} />
                  </button>
                  <button
                    onClick={() => deleteFlow(flow.id)}
                    className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
