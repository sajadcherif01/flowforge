import type { Node, Edge } from '@xyflow/react'

export interface ValidationIssue {
  type: 'error' | 'warning'
  message: string
  nodeId?: string
}

export function validateFlow(nodes: Node[], edges: Edge[]): ValidationIssue[] {
  const issues: ValidationIssue[] = []

  const triggerNodes = nodes.filter((n) => n.type === 'trigger')
  if (triggerNodes.length === 0) {
    issues.push({ type: 'error', message: 'Flow must have a Trigger node' })
  } else if (triggerNodes.length > 1) {
    issues.push({ type: 'error', message: 'Flow can only have one Trigger node', nodeId: triggerNodes[1].id })
  }

  if (triggerNodes.length === 1) {
    const trigger = triggerNodes[0]
    const triggerEdge = edges.find((e) => e.source === trigger.id)
    if (!triggerEdge) {
      issues.push({ type: 'warning', message: 'Trigger is not connected to any node', nodeId: trigger.id })
    }
  }

  for (const node of nodes) {
    const outgoingEdges = edges.filter((e) => e.source === node.id)
    const incomingEdges = edges.filter((e) => e.target === node.id)

    if (node.type === 'condition') {
      const trueEdge = outgoingEdges.find((e) => e.sourceHandle === 'true')
      const falseEdge = outgoingEdges.find((e) => e.sourceHandle === 'false')
      if (!trueEdge) {
        issues.push({ type: 'warning', message: 'Condition node missing True path', nodeId: node.id })
      }
      if (!falseEdge) {
        issues.push({ type: 'warning', message: 'Condition node missing False path', nodeId: node.id })
      }
    }

    if (node.type !== 'trigger' && incomingEdges.length === 0) {
      issues.push({ type: 'warning', message: `${node.type} node is not connected to anything`, nodeId: node.id })
    }
  }

  for (const edge of edges) {
    const sourceExists = nodes.some((n) => n.id === edge.source)
    const targetExists = nodes.some((n) => n.id === edge.target)
    if (!sourceExists) {
      issues.push({ type: 'error', message: 'Edge references a deleted source node', nodeId: edge.target })
    }
    if (!targetExists) {
      issues.push({ type: 'error', message: 'Edge references a deleted target node', nodeId: edge.source })
    }
  }

  return issues
}
