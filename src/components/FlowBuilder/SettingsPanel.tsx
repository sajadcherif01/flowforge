import { useRef, useCallback } from 'react'
import type { Node } from '@xyflow/react'
import { MessageSquare, Split, Timer, Brain, Send, Mail, Webhook, Zap } from 'lucide-react'
import VariablePicker from './VariablePicker'

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

interface FieldProps {
  label: string
  value: string
  onChange: (val: string) => void
  placeholder?: string
  multiline?: boolean
  rows?: number
}

function FieldWithVariables({ label, value, onChange, placeholder, multiline, rows }: FieldProps) {
  const ref = useRef<HTMLTextAreaElement | HTMLInputElement>(null)

  const handleVariableSelect = useCallback((variable: string) => {
    const el = ref.current
    if (!el) {
      onChange(value + variable)
      return
    }
    const start = el.selectionStart ?? value.length
    const end = el.selectionEnd ?? value.length
    const newVal = value.slice(0, start) + variable + value.slice(end)
    onChange(newVal)
    requestAnimationFrame(() => {
      const pos = start + variable.length
      el.setSelectionRange(pos, pos)
      el.focus()
    })
  }, [value, onChange])

  const inputClass = "w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 resize-none"

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="block text-xs font-medium text-gray-400">{label}</label>
        <VariablePicker onSelect={handleVariableSelect} />
      </div>
      {multiline ? (
        <textarea
          ref={ref as React.Ref<HTMLTextAreaElement>}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={inputClass + ` h-${rows || 24} resize-none`}
          placeholder={placeholder}
          rows={rows || 4}
        />
      ) : (
        <input
          ref={ref as React.Ref<HTMLInputElement>}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={inputClass}
          placeholder={placeholder}
        />
      )}
    </div>
  )
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
    const val = (key: string) => (node.data[key] as string) || ''
    const upd = (key: string) => (v: string) => onUpdate(node.id, { ...node.data, [key]: v })

    switch (node.type) {
      case 'message':
        return (
          <FieldWithVariables
            label="Message Text"
            value={val('text')}
            onChange={upd('text')}
            placeholder="Enter your message..."
            multiline
            rows={6}
          />
        )
      case 'condition':
        return (
          <div>
            <FieldWithVariables
              label="Variable"
              value={val('variable')}
              onChange={upd('variable')}
              placeholder="e.g. {{contact.name}}"
            />
            <div className="mt-3">
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Operator</label>
              <select
                value={val('operator') || 'is_not_empty'}
                onChange={(e) => onUpdate(node.id, { ...node.data, operator: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              >
                <option value="is_not_empty">Is not empty</option>
                <option value="is_empty">Is empty</option>
                <option value="equals">Equals</option>
                <option value="not_equals">Not equals</option>
                <option value="contains">Contains</option>
                <option value="starts_with">Starts with</option>
                <option value="greater_than">Greater than</option>
                <option value="less_than">Less than</option>
              </select>
            </div>
            <div className="mt-3">
              <FieldWithVariables
                label="Value"
                value={val('value')}
                onChange={upd('value')}
                placeholder="Value to compare"
              />
            </div>
          </div>
        )
      case 'delay':
        return (
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Duration</label>
            <input
              type="text"
              value={val('delay')}
              onChange={(e) => onUpdate(node.id, { ...node.data, delay: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              placeholder="e.g. 5 minutes, 1 hour"
            />
          </div>
        )
      case 'ai':
        return (
          <FieldWithVariables
            label="AI Prompt"
            value={val('prompt')}
            onChange={upd('prompt')}
            placeholder="Enter the prompt for the AI..."
            multiline
            rows={6}
          />
        )
      case 'telegram':
        return (
          <FieldWithVariables
            label="Telegram Message"
            value={val('text')}
            onChange={upd('text')}
            placeholder="Enter Telegram message..."
            multiline
            rows={4}
          />
        )
      case 'email':
        return (
          <div className="space-y-3">
            <FieldWithVariables
              label="Subject"
              value={val('subject')}
              onChange={upd('subject')}
              placeholder="Email subject..."
            />
            <FieldWithVariables
              label="Body"
              value={val('body')}
              onChange={upd('body')}
              placeholder="Email body..."
              multiline
              rows={6}
            />
          </div>
        )
      case 'webhook':
        return (
          <FieldWithVariables
            label="Webhook URL"
            value={val('url')}
            onChange={upd('url')}
            placeholder="https://..."
          />
        )
      case 'trigger':
        return (
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Trigger Event</label>
            <select
              value={val('event') || 'telegram_message'}
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
