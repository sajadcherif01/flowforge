import { Handle, Position, type NodeProps } from '@xyflow/react'
import { Webhook } from 'lucide-react'

export default function WebhookNode({ data }: NodeProps) {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-lg w-64">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-700 bg-rose-500/10 rounded-t-xl">
        <Webhook size={14} className="text-rose-400" />
        <span className="text-xs font-medium text-rose-400">Webhook</span>
      </div>
      <div className="px-4 py-3">
        <p className="text-sm text-gray-300 line-clamp-2">{data.url as string || 'https://...'}</p>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-rose-500 border-2 border-gray-900" />
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-rose-500 border-2 border-gray-900" />
    </div>
  )
}
