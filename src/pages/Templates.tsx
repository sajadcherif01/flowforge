import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { User } from '../types'
import { FLOW_TEMPLATES, type FlowTemplate } from '../lib/templates'
import { LayoutTemplate, Sun, HelpCircle, UserPlus, ThumbsUp, Clock, Webhook, Loader, Check, ArrowLeft } from 'lucide-react'

interface TemplatesProps {
  user: User
}

const iconMap: Record<string, React.ElementType> = {
  Sun, HelpCircle, UserPlus, ThumbsUp, Clock, Webhook,
}

export default function Templates({ user }: TemplatesProps) {
  const navigate = useNavigate()
  const [importing, setImporting] = useState<string | null>(null)
  const [imported, setImported] = useState<string | null>(null)

  const handleImport = async (template: FlowTemplate) => {
    setImporting(template.id)
    const { data } = await supabase
      .from('flows')
      .insert({
        user_id: user.id,
        name: template.name,
        description: template.description,
        nodes: template.nodes,
        edges: template.edges,
      })
      .select()
      .single()
    if (data) {
      setImported(template.id)
      setTimeout(() => navigate(`/flow/${data.id}`), 600)
    }
    setImporting(null)
  }

  return (
    <div className="p-8">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate('/')}
          className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">Flow Templates</h1>
          <p className="text-gray-400 text-sm mt-1">Start with a pre-built template and customize it</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {FLOW_TEMPLATES.map((template) => {
          const Icon = iconMap[template.icon] || LayoutTemplate

          return (
            <div
              key={template.id}
              className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 transition-all group"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-2.5 rounded-lg bg-cyan-500/10">
                    <Icon size={20} className="text-cyan-400" />
                  </div>
                  <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wider px-2 py-1 bg-gray-800 rounded-full">
                    {template.category}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-white mb-1">{template.name}</h3>
                <p className="text-xs text-gray-400 mb-4 line-clamp-2">{template.description}</p>
                <div className="flex items-center gap-2 text-[10px] text-gray-500 mb-4">
                  <span>{template.nodes.length} nodes</span>
                  <span>·</span>
                  <span>{template.edges.length} connections</span>
                </div>
                <button
                  onClick={() => handleImport(template)}
                  disabled={importing === template.id}
                  className="w-full flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-white text-sm font-medium rounded-lg px-4 py-2 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {importing === template.id ? (
                    <><Loader size={14} className="animate-spin" /> Importing...</>
                  ) : imported === template.id ? (
                    <><Check size={14} /> Imported!</>
                  ) : (
                    <><LayoutTemplate size={14} /> Use Template</>
                  )}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
