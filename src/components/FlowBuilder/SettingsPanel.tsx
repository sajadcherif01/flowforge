import type { Node } from '@xyflow/react'
import { MessageSquare, Split, Timer, Brain, Send, Mail, Webhook, Zap } from 'lucide-react'

interface SettingsPanelProps {
  node: Node | null
  onUpdate: (id: string, data: Record<string, unknown>) => void
}

const iconMap: Record<string, React.ElementType> = {
  trigger: Zap, message: MessageSquare, condition: Split, delay: Timer,
  ai: Brain, telegram: Send, email: Mail, webhook: Webhook,
}

const colorMap: Record<string, string> = {
  trigger: 'text-yellow-400', message: 'text-blue-400', condition: 'text-amber-400',
  delay: 'text-purple-400', ai: 'text-cyan-400', telegram: 'text-sky-400',
  email: 'text-emerald-400', webhook: 'text-rose-400',
}

export default function SettingsPanel({ node, onUpdate }: SettingsPanelProps) {
  if (!node) {
    return (
      <div className="w-80 bg-gray-900/50 border-l border-gray-800 p-6">
        <div className="text-center py-12">
          <Zap size={32} className="text-gray-600 mx-auto mb-3" />
          <p className="text-sm text-gray-500">Select a node to configure</p>
        </div>
      </div>
    )
  }

  const Icon = iconMap[node.type!] || Zap

  const renderFields = () => {
    switch (node.type) {
      case 'message':
        return (
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Message Text</label>
            <textarea
              value={(node.data.text as string) || ''}
              onChange={(e) => onUpdate(node.id, { ...node.data, text: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 h-24 resize-none"
              placeholder="Enter your message..."
            />
          </div>
        )
      case 'condition':
        return (
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Condition</label>
            <textarea
              value={(node.data.condition as string) || ''}
              onChange={(e) => onUpdate(node.id, { ...node.data, condition: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 h-20 resize-none"
              placeholder="e.g. {{contact.name}} is not empty"
            />
          </div>
        )
      case 'delay':
        return (
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Duration</label>
            <input
              type="text"
              value={(node.data.delay as string) || ''}
              onChange={(e) => onUpdate(node.id, { ...node.data, delay: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              placeholder="e.g. 5 minutes, 1 hour"
            />
          </div>
        )
      case 'ai':
        return (
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">AI Prompt</label>
            <textarea
              value={(node.data.prompt as string) || ''}
              onChange={(e) => onUpdate(node.id, { ...node.data, prompt: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 h-24 resize-none"
              placeholder="Enter the prompt for the AI..."
            />
          </div>
        )
      case 'telegram':
        return (
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Telegram Message</label>
            <textarea
              value={(node.data.text as string) || ''}
              onChange={(e) => onUpdate(node.id, { ...node.data, text: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 h-24 resize-none"
              placeholder="Enter Telegram message..."
            />
          </div>
        )
      case 'email':
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Subject</label>
              <input
                type="text"
                value={(node.data.subject as string) || ''}
                onChange={(e) => onUpdate(node.id, { ...node.data, subject: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                placeholder="Email subject..."
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Body</label>
              <textarea
                value={(node.data.body as string) || ''}
                onChange={(e) => onUpdate(node.id, { ...node.data, body: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 h-24 resize-none"
                placeholder="Email body..."
              />
            </div>
          </div>
        )
      case 'webhook':
        return (
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Webhook URL</label>
            <input
              type="url"
              value={(node.data.url as string) || ''}
              onChange={(e) => onUpdate(node.id, { ...node.data, url: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              placeholder="https://..."
            />
          </div>
        )
      case 'trigger':
        return (
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Trigger Event</label>
            <select
              value={(node.data.event as string) || 'telegram_message'}
              onChange={(e) => onUpdate(node.id, { ...node.data, event: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            >
              <option value="telegram_message">Telegram Message</option>
              <option value="email_received">Email Received</option>
              <option value="webhook_received">Webhook Received</option>
              <option value="schedule">Schedule</option>
            </select>
          </div>
        )
      default:
        return <p className="text-sm text-gray-500">No configuration available</p>
    }
  }

  return (
    <div className="w-80 bg-gray-900/50 border-l border-gray-800 p-6 overflow-y-auto">
      <div className="flex items-center gap-2 mb-5 pb-4 border-b border-gray-800">
        <Icon size={16} className={colorMap[node.type!] || 'text-gray-400'} />
        <h3 className="text-sm font-semibold text-white capitalize">{node.type}</h3>
      </div>
      <div className="space-y-4">{renderFields()}</div>
    </div>
  )
}
