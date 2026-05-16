import { Handle, Position, type NodeProps } from '@xyflow/react'
import { Zap } from 'lucide-react'

export default function TriggerNode({ data }: NodeProps) {
  const eventLabels: Record<string, string> = {
    telegram_message: 'Telegram Message',
    email_received: 'Email Received',
    webhook_received: 'Webhook Received',
    schedule: 'Schedule',
  }

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-lg w-64">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-700 bg-yellow-500/10 rounded-t-xl">
        <Zap size={14} className="text-yellow-400" />
        <span className="text-xs font-medium text-yellow-400">Trigger</span>
      </div>
      <div className="px-4 py-3">
        <p className="text-sm text-gray-300">
          On: {eventLabels[data.event as string] || (data.event as string) || 'Select event'}
        </p>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-yellow-500 border-2 border-gray-900" />
    </div>
  )
}
