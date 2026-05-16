import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { User, Contact } from '../types'
import { Users, Search, MessageCircle, Mail, Globe, ExternalLink } from 'lucide-react'

interface ContactsProps {
  user: User
}

const platformIcons: Record<string, React.ElementType> = {
  telegram: MessageCircle,
  email: Mail,
  web: Globe,
}

export default function Contacts({ user }: ContactsProps) {
  const navigate = useNavigate()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    supabase
      .from('contacts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setContacts(data)
        setLoading(false)
      })
  }, [])

  const filtered = contacts.filter((c) =>
    c.name?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-400" />
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Contacts</h1>
          <p className="text-gray-400 text-sm mt-1">{contacts.length} total contacts</p>
        </div>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search contacts..."
            className="bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 w-64"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <Users size={48} className="text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-400 mb-2">No contacts yet</h3>
          <p className="text-gray-500 text-sm">Contacts will appear here when users interact with your flows</p>
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Name</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Platform</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Platform ID</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filtered.map((contact) => {
                const PlatformIcon = platformIcons[contact.platform] || Globe
                return (
                  <tr key={contact.id} className="hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <button
                        onClick={() => navigate(`/contacts/${contact.id}`)}
                        className="text-sm font-medium text-white hover:text-cyan-400 transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        {contact.name || 'Unknown'}
                        <ExternalLink size={12} className="opacity-0 group-hover:opacity-100" />
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-2 text-sm text-gray-300">
                        <PlatformIcon size={14} className="text-gray-400" />
                        {contact.platform}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400 font-mono">{contact.platform_id}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(contact.created_at).toLocaleDateString()}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
