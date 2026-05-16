import { Handle, Position, type NodeProps } from '@xyflow/react'
import { Send } from 'lucide-react'

export default function TelegramNode({ data }: NodeProps) {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-lg w-64">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-700 bg-sky-500/10 rounded-t-xl">
        <Send size={14} className="text-sky-400" />
        <span className="text-xs font-medium text-sky-400">Telegram</span>
      </div>
      <div className="px-4 py-3">
        <p className="text-sm text-gray-300 line-clamp-2">{data.text as string || 'Send Telegram message...'}</p>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-sky-500 border-2 border-gray-900" />
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-sky-500 border-2 border-gray-900" />
    </div>
  )
}
