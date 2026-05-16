import { Handle, Position, type NodeProps } from '@xyflow/react'
import { MessageSquare } from 'lucide-react'

export default function MessageNode({ data }: NodeProps) {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-lg w-64">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-700 bg-blue-500/10 rounded-t-xl">
        <MessageSquare size={14} className="text-blue-400" />
        <span className="text-xs font-medium text-blue-400">Send Message</span>
      </div>
      <div className="px-4 py-3">
        <p className="text-sm text-gray-300 line-clamp-3">{data.text as string || 'Enter your message...'}</p>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-blue-500 border-2 border-gray-900" />
    </div>
  )
}
