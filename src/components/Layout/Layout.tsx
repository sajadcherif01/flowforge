import type { ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import Sidebar from './Sidebar'

interface LayoutProps {
  user: User
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex h-screen bg-gray-950 text-gray-100">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
