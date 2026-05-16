import { Handle, Position, type NodeProps } from '@xyflow/react'
import { Split } from 'lucide-react'

export default function ConditionNode({ data }: NodeProps) {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-lg w-64">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-700 bg-amber-500/10 rounded-t-xl">
        <Split size={14} className="text-amber-400" />
        <span className="text-xs font-medium text-amber-400">Condition</span>
      </div>
      <div className="px-4 py-3">
        <p className="text-sm text-gray-300">{data.condition as string || 'If...'}</p>
      </div>
      <Handle type="source" position={Position.Bottom} id="true" className="w-3 h-3 bg-green-500 border-2 border-gray-900" />
      <Handle type="source" position={Position.Right} id="false" className="w-3 h-3 bg-red-500 border-2 border-gray-900" />
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-amber-500 border-2 border-gray-900" />
    </div>
  )
}
