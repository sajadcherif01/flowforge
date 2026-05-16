export interface VariableDefinition {
  label: string
  value: string
  category: string
  description: string
}

export const AVAILABLE_VARIABLES: VariableDefinition[] = [
  { label: 'Contact Name', value: '{{contact.name}}', category: 'Contact', description: 'Contact display name' },
  { label: 'Contact ID', value: '{{contact.id}}', category: 'Contact', description: 'Unique contact identifier' },
  { label: 'Contact Platform', value: '{{contact.platform}}', category: 'Contact', description: 'Platform (telegram, email, web)' },
  { label: 'Contact Platform ID', value: '{{contact.platform_id}}', category: 'Contact', description: 'ID on the platform' },
  { label: 'Flow Name', value: '{{flow.name}}', category: 'Flow', description: 'Current flow name' },
  { label: 'Timestamp', value: '{{now}}', category: 'System', description: 'Current date and time' },
  { label: 'Previous Output', value: '{{prev.output}}', category: 'System', description: 'Output from previous node' },
  { label: 'User Input', value: '{{input}}', category: 'System', description: 'Original user message' },
]

export function substituteVariables(text: string, context: Record<string, string>): string {
  return text.replace(/\{\{(\w+(?:\.\w+)?)\}\}/g, (match, key) => {
    return context[key] ?? match
  })
}

export function getVariablesInText(text: string): string[] {
  const matches = text.match(/\{\{(\w+(?:\.\w+)?)\}\}/g)
  return matches ? matches.map((m) => m.replace(/[{}]/g, '')) : []
}
