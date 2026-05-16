import { useState } from 'react'
import type { User } from '../types'
import { Send, Mail, Webhook, Plug, Check, X, Key } from 'lucide-react'

interface IntegrationsProps {
  user: User
}

interface Integration {
  id: string
  name: string
  description: string
  icon: React.ElementType
  color: string
  bgColor: string
  fields: { key: string; label: string; type: string; placeholder: string }[]
  connected: boolean
}

const defaultIntegrations: Integration[] = [
  {
    id: 'telegram',
    name: 'Telegram Bot',
    description: 'Connect your Telegram bot to send and receive messages',
    icon: Send,
    color: 'text-sky-400',
    bgColor: 'bg-sky-500/10',
    fields: [{ key: 'bot_token', label: 'Bot Token', type: 'password', placeholder: 'Enter your Telegram bot token' }],
    connected: false,
  },
  {
    id: 'smtp',
    name: 'SMTP Email',
    description: 'Send emails through your SMTP server',
    icon: Mail,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    fields: [
      { key: 'host', label: 'SMTP Host', type: 'text', placeholder: 'smtp.example.com' },
      { key: 'port', label: 'Port', type: 'text', placeholder: '587' },
      { key: 'username', label: 'Username', type: 'text', placeholder: 'user@example.com' },
      { key: 'password', label: 'Password', type: 'password', placeholder: 'SMTP password' },
    ],
    connected: false,
  },
  {
    id: 'webhook',
    name: 'Webhooks',
    description: 'Receive and send webhook data',
    icon: Webhook,
    color: 'text-rose-400',
    bgColor: 'bg-rose-500/10',
    fields: [{ key: 'secret', label: 'Webhook Secret', type: 'password', placeholder: 'Optional webhook secret' }],
    connected: false,
  },
]

export default function Integrations({ user: _user }: IntegrationsProps) {
  const [integrations, setIntegrations] = useState(defaultIntegrations)
  const [configuring, setConfiguring] = useState<string | null>(null)
  const [formValues, setFormValues] = useState<Record<string, string>>({})

  const handleConfigure = (id: string) => {
    setConfiguring(id)
    setFormValues({})
  }

  const handleSave = (id: string) => {
    setIntegrations((prev) =>
      prev.map((i) => (i.id === id ? { ...i, connected: true } : i))
    )
    setConfiguring(null)
  }

  const handleDisconnect = (id: string) => {
    setIntegrations((prev) =>
      prev.map((i) => (i.id === id ? { ...i, connected: false } : i))
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Integrations</h1>
        <p className="text-gray-400 text-sm mt-1">Connect your channels and services</p>
      </div>

      <div className="grid gap-4 max-w-2xl">
        {integrations.map((integration) => {
          const Icon = integration.icon
          const isConfiguring = configuring === integration.id

          return (
            <div key={integration.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={`p-2.5 rounded-lg ${integration.bgColor}`}>
                    <Icon size={20} className={integration.color} />
                  </div>
                  <div>
                    <h3 className="font-medium text-white">{integration.name}</h3>
                    <p className="text-sm text-gray-400 mt-0.5">{integration.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {integration.connected ? (
                    <>
                      <span className="flex items-center gap-1.5 text-xs text-green-400 bg-green-500/10 px-2.5 py-1 rounded-full">
                        <Check size={12} />
                        Connected
                      </span>
                      <button
                        onClick={() => handleDisconnect(integration.id)}
                        className="text-xs text-gray-400 hover:text-red-400 px-2 py-1 rounded transition-colors cursor-pointer"
                      >
                        Disconnect
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleConfigure(integration.id)}
                      className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                    >
                      <Key size={12} />
                      Configure
                    </button>
                  )}
                </div>
              </div>

              {isConfiguring && (
                <div className="mt-4 pt-4 border-t border-gray-800 space-y-3">
                  {integration.fields.map((field) => (
                    <div key={field.key}>
                      <label className="block text-xs font-medium text-gray-400 mb-1">{field.label}</label>
                      <input
                        type={field.type}
                        value={formValues[field.key] || ''}
                        onChange={(e) => setFormValues({ ...formValues, [field.key]: e.target.value })}
                        placeholder={field.placeholder}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                      />
                    </div>
                  ))}
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={() => handleSave(integration.id)}
                      className="bg-cyan-500 hover:bg-cyan-400 text-white text-sm font-medium rounded-lg px-4 py-2 transition-colors cursor-pointer"
                    >
                      Save & Connect
                    </button>
                    <button
                      onClick={() => setConfiguring(null)}
                      className="text-gray-400 hover:text-white px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}

        <div className="bg-gray-900/50 border border-dashed border-gray-700 rounded-xl p-6 text-center">
          <Plug size={24} className="text-gray-600 mx-auto mb-2" />
          <p className="text-sm text-gray-500">More integrations coming soon</p>
        </div>
      </div>
    </div>
  )
}
