import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { User, Contact } from '../types'
import { Send, Users, Search, Loader, CheckCircle, ArrowLeft } from 'lucide-react'

interface BroadcastProps {
  user: User
}

export default function Broadcast({ user }: BroadcastProps) {
  const navigate = useNavigate()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [flowOptions, setFlowOptions] = useState<{ id: string; name: string }[]>([])
  const [selectedContactIds, setSelectedContactIds] = useState<Set<string>>(new Set())
  const [selectAll, setSelectAll] = useState(false)
  const [message, setMessage] = useState('')
  const [flowId, setFlowId] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(0)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [mode, setMode] = useState<'message' | 'flow'>('message')

  useEffect(() => {
    supabase.from('contacts').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).then(({ data }) => {
      if (data) setContacts(data)
    })
    supabase.from('flows').select('id, name').eq('user_id', user.id).eq('is_active', true).then(({ data }) => {
      if (data) setFlowOptions(data)
    })
  }, [user.id])

  const filtered = contacts.filter((c) =>
    c.name?.toLowerCase().includes(search.toLowerCase())
  )

  const toggleContact = (id: string) => {
    const next = new Set(selectedContactIds)
    if (next.has(id)) next.delete(id); else next.add(id)
    setSelectedContactIds(next)
    setSelectAll(next.size === filtered.length)
  }

  const toggleAll = () => {
    if (selectAll) {
      setSelectedContactIds(new Set())
      setSelectAll(false)
    } else {
      setSelectedContactIds(new Set(filtered.map((c) => c.id)))
      setSelectAll(true)
    }
  }

  const handleSend = async () => {
    const targets = contacts.filter((c) => selectedContactIds.has(c.id))
    setTotal(targets.length)
    setSent(0)
    setSending(true)

    for (const contact of targets) {
      try {
        const meta = contact.metadata as Record<string, unknown>
        const chatId = meta?.chat_id || contact.platform_id

        if (mode === 'message' && message.trim()) {
          const { data: settings } = await supabase
            .from('user_settings')
            .select('telegram_bot_token')
            .eq('user_id', user.id)
            .single()

          if (settings?.telegram_bot_token && contact.platform === 'telegram') {
            await fetch(`https://api.telegram.org/bot${settings.telegram_bot_token}/sendMessage`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ chat_id: Number(chatId), text: message }),
            })
          }
        }

        if (mode === 'flow' && flowId) {
          await supabase.from('conversations').insert({
            flow_id: flowId,
            contact_id: contact.id,
            current_node_id: '',
            status: 'active',
          })
        }
      } catch { /* skip failed sends */ }

      setSent((prev) => prev + 1)
    }

    setSending(false)
    setSelectedContactIds(new Set())
    setSelectAll(false)
  }

  const isValid = selectedContactIds.size > 0 && (mode === 'flow' ? flowId : message.trim())

  return (
    <div className="p-8">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">Broadcast</h1>
          <p className="text-gray-400 text-sm mt-1">Send messages to your contacts</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users size={16} className="text-gray-400" />
                <span className="text-sm text-gray-300">{selectedContactIds.size} of {contacts.length} selected</span>
              </div>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search..."
                  className="bg-gray-800 border border-gray-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 w-48"
                />
              </div>
            </div>
            <div className="overflow-y-auto max-h-96">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800 bg-gray-900/50">
                    <th className="w-12 px-4 py-2">
                      <input
                        type="checkbox"
                        checked={selectAll && filtered.length > 0}
                        onChange={toggleAll}
                        className="rounded border-gray-600 bg-gray-700 text-cyan-500 focus:ring-cyan-500/50 cursor-pointer"
                      />
                    </th>
                    <th className="text-left px-4 py-2 text-xs font-medium text-gray-400">Name</th>
                    <th className="text-left px-4 py-2 text-xs font-medium text-gray-400">Platform</th>
                    <th className="text-left px-4 py-2 text-xs font-medium text-gray-400">Contact ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {filtered.map((contact) => (
                    <tr
                      key={contact.id}
                      onClick={() => toggleContact(contact.id)}
                      className={`hover:bg-gray-800/50 transition-colors cursor-pointer ${selectedContactIds.has(contact.id) ? 'bg-cyan-500/5' : ''}`}
                    >
                      <td className="px-4 py-2.5">
                        <input
                          type="checkbox"
                          checked={selectedContactIds.has(contact.id)}
                          onChange={() => toggleContact(contact.id)}
                          className="rounded border-gray-600 bg-gray-700 text-cyan-500 focus:ring-cyan-500/50 cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-2.5 text-sm font-medium text-white">{contact.name || 'Unknown'}</td>
                      <td className="px-4 py-2.5 text-sm text-gray-400">{contact.platform}</td>
                      <td className="px-4 py-2.5 text-sm text-gray-500 font-mono">{contact.platform_id}</td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center py-8 text-sm text-gray-500">No contacts found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Broadcast Settings</h3>

            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setMode('message')}
                className={`flex-1 text-xs font-medium rounded-lg px-3 py-2 transition-colors cursor-pointer ${
                  mode === 'message' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'bg-gray-800 text-gray-400 border border-transparent'
                }`}
              >
                Send Message
              </button>
              <button
                onClick={() => setMode('flow')}
                className={`flex-1 text-xs font-medium rounded-lg px-3 py-2 transition-colors cursor-pointer ${
                  mode === 'flow' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'bg-gray-800 text-gray-400 border border-transparent'
                }`}
              >
                Trigger Flow
              </button>
            </div>

            {mode === 'message' ? (
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Enter your broadcast message..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 h-28 resize-none"
                  rows={4}
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Flow</label>
                <select
                  value={flowId}
                  onChange={(e) => setFlowId(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                >
                  <option value="">Select a flow...</option>
                  {flowOptions.map((f) => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-2">Each contact will start this flow from the beginning.</p>
              </div>
            )}

            <button
              onClick={handleSend}
              disabled={!isValid || sending}
              className="w-full mt-4 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg px-4 py-2.5 transition-all disabled:opacity-50 cursor-pointer"
            >
              {sending ? (
                <><Loader size={16} className="animate-spin" /> Sending... {sent}/{total}</>
              ) : (
                <><Send size={16} /> Send to {selectedContactIds.size} contact{selectedContactIds.size !== 1 ? 's' : ''}</>
              )}
            </button>

            {sending && (
              <div className="mt-3">
                <div className="w-full bg-gray-800 rounded-full h-1.5">
                  <div
                    className="bg-emerald-500 h-1.5 rounded-full transition-all"
                    style={{ width: `${total > 0 ? (sent / total) * 100 : 0}%` }}
                  />
                </div>
              </div>
            )}

            {!sending && sent > 0 && (
              <div className="mt-3 flex items-center gap-2 text-xs text-green-400">
                <CheckCircle size={12} />
                Sent to {sent} of {total} contacts
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
