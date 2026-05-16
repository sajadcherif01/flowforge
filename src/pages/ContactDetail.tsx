import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { User, Contact, Conversation } from '../types'
import { ArrowLeft, MessageCircle, Mail, Globe, Loader } from 'lucide-react'

interface ContactDetailProps {
  user: User
}

interface Message {
  id: string
  role: string
  content: string
  platform: string
  created_at: string
}

const platformIcons: Record<string, React.ElementType> = {
  telegram: MessageCircle,
  email: Mail,
  web: Globe,
}

export default function ContactDetail(_props: ContactDetailProps) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [contact, setContact] = useState<Contact | null>(null)
  const [conversations, setConversations] = useState<(Conversation & { flow_name: string })[]>([])
  const [selectedConv, setSelectedConv] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    supabase.from('contacts').select('*').eq('id', id).single().then(({ data }) => {
      if (data) setContact(data)
    })
    supabase
      .from('conversations')
      .select('*, flows!inner(name)')
      .eq('contact_id', id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) {
      setConversations(
        data.map((c: Record<string, unknown>) => ({
          id: c.id as string,
          flow_id: c.flow_id as string,
          contact_id: c.contact_id as string,
          status: c.status as 'active' | 'completed' | 'waiting',
          current_node_id: c.current_node_id as string,
          data: c.data as Record<string, unknown>,
          created_at: c.created_at as string,
          updated_at: c.updated_at as string,
          flow_name: ((c.flows as Record<string, unknown>)?.name as string) || 'Unknown',
        }))
      )
        }
        setLoading(false)
      })
  }, [id])

  const loadMessages = async (convId: string) => {
    setSelectedConv(convId)
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: true })
    if (data) setMessages(data)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader size={24} className="animate-spin text-gray-400" />
      </div>
    )
  }

  if (!contact) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p>Contact not found</p>
        <button onClick={() => navigate('/contacts')} className="text-cyan-400 hover:underline mt-2 text-sm cursor-pointer">Back to contacts</button>
      </div>
    )
  }

  const PlatformIcon = platformIcons[contact.platform] || Globe

  return (
    <div className="p-8">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate('/contacts')}
          className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex items-center gap-4">
          <div className="p-2.5 rounded-lg bg-gray-800">
            <PlatformIcon size={20} className="text-gray-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{contact.name || 'Unknown'}</h1>
            <p className="text-sm text-gray-400 capitalize">{contact.platform}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-3">Contact Info</h3>
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-xs text-gray-500">Platform ID</p>
              <p className="text-gray-300 font-mono">{contact.platform_id}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Created</p>
              <p className="text-gray-300">{new Date(contact.created_at).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Conversations</p>
              <p className="text-gray-300">{conversations.length}</p>
            </div>
          </div>
        </div>

        <div className="col-span-2">
          {conversations.length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
              <MessageCircle size={32} className="text-gray-600 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No conversations yet</p>
            </div>
          ) : (
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-800">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Conversations</h3>
              </div>
              <div className="divide-y divide-gray-800">
                {conversations.map((conv) => (
                  <div key={conv.id}>
                    <button
                      onClick={() => loadMessages(conv.id)}
                      className={`w-full px-5 py-3 text-left hover:bg-gray-800/50 transition-colors flex items-center justify-between cursor-pointer ${
                        selectedConv === conv.id ? 'bg-gray-800' : ''
                      }`}
                    >
                      <div>
                        <p className="text-sm font-medium text-white">{conv.flow_name}</p>
                        <p className="text-xs text-gray-500">{new Date(conv.created_at).toLocaleString()}</p>
                      </div>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        conv.status === 'active' ? 'text-green-400 bg-green-500/10' :
                        conv.status === 'completed' ? 'text-blue-400 bg-blue-500/10' :
                        'text-amber-400 bg-amber-500/10'
                      }`}>
                        {conv.status}
                      </span>
                    </button>
                    {selectedConv === conv.id && (
                      <div className="px-5 py-4 bg-gray-900/50 border-t border-gray-800 space-y-3 max-h-80 overflow-y-auto">
                        {messages.length === 0 ? (
                          <p className="text-xs text-gray-500 text-center py-4">No messages in this conversation</p>
                        ) : (
                          messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[80%] rounded-xl px-4 py-2.5 ${
                                msg.role === 'user'
                                  ? 'bg-cyan-500/10 border border-cyan-500/20'
                                  : 'bg-gray-800 border border-gray-700'
                              }`}>
                                <p className="text-xs text-gray-300">{msg.content}</p>
                                <p className="text-[10px] text-gray-500 mt-1">{new Date(msg.created_at).toLocaleTimeString()}</p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
