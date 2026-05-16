import { useState } from 'react'
import { supabase } from '../lib/supabase'
import type { User } from '../types'
import { Settings as SettingsIcon, Key, User as UserIcon } from 'lucide-react'

interface SettingsProps {
  user: User
}

export default function Settings({ user }: SettingsProps) {
  const [githubToken, setGithubToken] = useState('')
  const [saved, setSaved] = useState(false)

  const saveSettings = async () => {
    await supabase.from('user_settings').upsert({
      user_id: user.id,
      github_models_token: githubToken,
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-gray-400 text-sm mt-1">Manage your account and API keys</p>
      </div>

      <div className="space-y-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <UserIcon size={18} className="text-gray-400" />
            <h2 className="text-sm font-semibold text-white">Profile</h2>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Email</label>
              <input
                type="email"
                value={user.email || ''}
                disabled
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-400 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">User ID</label>
              <input
                type="text"
                value={user.id}
                disabled
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-400 font-mono cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Key size={18} className="text-cyan-400" />
            <h2 className="text-sm font-semibold text-white">GitHub Models API Key</h2>
          </div>
          <p className="text-xs text-gray-500 mb-3">
            Your GitHub Personal Access Token with <code className="text-cyan-400 bg-cyan-500/10 px-1 rounded">read:models</code> scope.
          </p>
          <div className="space-y-3">
            <input
              type="password"
              value={githubToken}
              onChange={(e) => setGithubToken(e.target.value)}
              placeholder="ghp_..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            />
            <button
              onClick={saveSettings}
              className="bg-cyan-500 hover:bg-cyan-400 text-white text-sm font-medium rounded-lg px-4 py-2 transition-colors cursor-pointer"
            >
              {saved ? 'Saved!' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
