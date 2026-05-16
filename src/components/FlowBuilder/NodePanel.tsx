import { MessageSquare, Split, Timer, Brain, Send, Mail, Webhook, Zap } from 'lucide-react'

const nodeTypes = [
  { type: 'trigger', icon: Zap, label: 'Trigger', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  { type: 'message', icon: MessageSquare, label: 'Message', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { type: 'condition', icon: Split, label: 'Condition', color: 'text-amber-400', bg: 'bg-amber-500/10' },
  { type: 'delay', icon: Timer, label: 'Delay', color: 'text-purple-400', bg: 'bg-purple-500/10' },
  { type: 'ai', icon: Brain, label: 'AI Generate', color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  { type: 'telegram', icon: Send, label: 'Telegram', color: 'text-sky-400', bg: 'bg-sky-500/10' },
  { type: 'email', icon: Mail, label: 'Email', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { type: 'webhook', icon: Webhook, label: 'Webhook', color: 'text-rose-400', bg: 'bg-rose-500/10' },
]

const onDragStart = (event: React.DragEvent, nodeType: string) => {
  event.dataTransfer.setData('application/reactflow', nodeType)
  event.dataTransfer.effectAllowed = 'move'
}

export default function NodePanel() {
  return (
    <div className="w-64 bg-gray-900/50 border-r border-gray-800 p-4 overflow-y-auto">
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Nodes</h3>
      <div className="space-y-2">
        {nodeTypes.map((node) => (
          <div
            key={node.type}
            draggable
            onDragStart={(e) => onDragStart(e, node.type)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg ${node.bg} border border-transparent hover:border-gray-700 cursor-grab active:cursor-grabbing transition-all`}
          >
            <node.icon size={16} className={node.color} />
            <span className="text-sm font-medium text-gray-200">{node.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
