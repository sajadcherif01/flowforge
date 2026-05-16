import { Handle, Position, type NodeProps } from '@xyflow/react'
import { Mail } from 'lucide-react'

export default function EmailNode({ data }: NodeProps) {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-lg w-64">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-700 bg-emerald-500/10 rounded-t-xl">
        <Mail size={14} className="text-emerald-400" />
        <span className="text-xs font-medium text-emerald-400">Send Email</span>
      </div>
      <div className="px-4 py-3">
        <p className="text-sm text-gray-300 line-clamp-2">{data.subject as string || 'Email subject...'}</p>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-emerald-500 border-2 border-gray-900" />
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-emerald-500 border-2 border-gray-900" />
    </div>
  )
}
