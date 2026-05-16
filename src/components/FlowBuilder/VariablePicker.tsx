import { useState } from 'react'
import { AVAILABLE_VARIABLES, type VariableDefinition } from '../../lib/variables'
import { Plus } from 'lucide-react'

interface VariablePickerProps {
  onSelect: (variable: string) => void
}

export default function VariablePicker({ onSelect }: VariablePickerProps) {
  const [open, setOpen] = useState(false)

  const categories = AVAILABLE_VARIABLES.reduce(
    (acc, v) => {
      if (!acc[v.category]) acc[v.category] = []
      acc[v.category].push(v)
      return acc
    },
    {} as Record<string, VariableDefinition[]>,
  )

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="text-xs text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 px-2 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer"
      >
        <Plus size={12} />
        Variable
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute top-full right-0 mt-1 z-20 w-64 bg-gray-800 border border-gray-700 rounded-xl shadow-xl overflow-hidden">
            <div className="px-3 py-2 border-b border-gray-700">
              <p className="text-xs font-medium text-gray-400">Insert Variable</p>
            </div>
            <div className="max-h-64 overflow-y-auto p-2 space-y-2">
              {Object.entries(categories).map(([category, vars]) => (
                <div key={category}>
                  <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider px-2 py-1">{category}</p>
                  {vars.map((v) => (
                    <button
                      key={v.value}
                      type="button"
                      onClick={() => { onSelect(v.value); setOpen(false) }}
                      className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
                    >
                      <p className="text-sm text-white">{v.label}</p>
                      <p className="text-[10px] text-gray-500 font-mono">{v.value}</p>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
