import type { Node, Edge } from '@xyflow/react'

export interface ExecutionResult {
  nodeId: string
  nodeType: string
  input: string
  output: string
  duration: number
}

async function executeNode(
  node: Node,
  _nodes: Node[],
  _edges: Edge[],
  results: ExecutionResult[],
  userId: string,
): Promise<string> {
  const start = performance.now()
  let output = ''
  let input = results.length > 0 ? results[results.length - 1].output : ''

  switch (node.type) {
    case 'message':
      output = (node.data.text as string) || ''
      break

    case 'condition': {
      const condition = (node.data.condition as string) || ''
      const result = await evaluateCondition(condition, node, input)
      output = result ? 'true' : 'false'
      break
    }

    case 'delay': {
      const delayStr = (node.data.delay as string) || '0'
      output = `Waited ${delayStr}`
      break
    }

    case 'ai': {
      const prompt = (node.data.prompt as string) || 'Generate a response'
      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-generate`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt, userId }),
          },
        )
        const data = await response.json()
        output = data.content || 'AI response failed'
      } catch {
        output = 'AI service unavailable'
      }
      break
    }

    case 'telegram':
      output = (node.data.text as string) || ''
      break

    case 'email':
      output = `Email: ${(node.data.subject as string) || 'No subject'}`
      break

    case 'webhook':
      output = `Webhook: ${(node.data.url as string) || 'No URL'}`
      break

    default:
      output = `[${node.type || 'unknown'} node executed]`
  }

  const duration = performance.now() - start
  results.push({
    nodeId: node.id,
    nodeType: node.type || 'unknown',
    input,
    output,
    duration: Math.round(duration),
  })

  return output
}

async function evaluateCondition(_condition: string, node: Node, input: string): Promise<boolean> {
  const data = node.data as Record<string, string>
  const variable = data.variable || '{{prev.output}}'
  const operator = data.operator || 'is_not_empty'
  const value = data.value || ''

  const actualValue = variable === '{{prev.output}}' ? input : variable === '{{input}}' ? input : ''

  switch (operator) {
    case 'is_not_empty': return actualValue.trim().length > 0
    case 'is_empty': return actualValue.trim().length === 0
    case 'equals': return actualValue.toLowerCase() === value.toLowerCase()
    case 'not_equals': return actualValue.toLowerCase() !== value.toLowerCase()
    case 'contains': return actualValue.toLowerCase().includes(value.toLowerCase())
    case 'starts_with': return actualValue.toLowerCase().startsWith(value.toLowerCase())
    case 'greater_than': return Number(actualValue) > Number(value)
    case 'less_than': return Number(actualValue) < Number(value)
    default: return true
  }
}

export async function executeFlow(
  nodes: Node[],
  edges: Edge[],
  userId: string,
): Promise<ExecutionResult[]> {
  const results: ExecutionResult[] = []

  const triggerNode = nodes.find((n) => n.type === 'trigger')
  if (!triggerNode) {
    results.push({
      nodeId: 'error',
      nodeType: 'error',
      input: '',
      output: 'No trigger node found',
      duration: 0,
    })
    return results
  }

  let currentNode: Node | undefined = triggerNode

  while (currentNode) {
    await executeNode(currentNode, nodes, edges, results, userId)

    const last = results[results.length - 1]
    const conditionPassed = last?.output === 'true'

    const nextEdge = edges.find((e) => {
      if (currentNode?.type === 'condition') {
        return e.source === currentNode!.id && e.sourceHandle === (conditionPassed ? 'true' : 'false')
      }
      return e.source === currentNode!.id
    })

    if (!nextEdge) break
    currentNode = nodes.find((n) => n.id === nextEdge.target)
  }

  return results
}
