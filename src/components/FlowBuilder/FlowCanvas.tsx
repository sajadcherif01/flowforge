import { useCallback, useRef, useState } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
  type Connection,
  type NodeTypes,
  addEdge,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  type ReactFlowInstance,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import TriggerNode from './nodes/TriggerNode'
import MessageNode from './nodes/MessageNode'
import ConditionNode from './nodes/ConditionNode'
import DelayNode from './nodes/DelayNode'
import AINode from './nodes/AINode'
import TelegramNode from './nodes/TelegramNode'
import EmailNode from './nodes/EmailNode'
import WebhookNode from './nodes/WebhookNode'

const nodeTypes: NodeTypes = {
  trigger: TriggerNode,
  message: MessageNode,
  condition: ConditionNode,
  delay: DelayNode,
  ai: AINode,
  telegram: TelegramNode,
  email: EmailNode,
  webhook: WebhookNode,
}

interface FlowCanvasProps {
  initialNodes?: Node[]
  initialEdges?: Edge[]
  onNodesChange?: (nodes: Node[]) => void
  onEdgesChange?: (edges: Edge[]) => void
  onSelectNode?: (node: Node | null) => void
}

function FlowCanvasInner({ initialNodes = [], initialEdges = [], onSelectNode }: FlowCanvasProps) {
  const [nodes, setNodes, onNodesChangeInternal] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChangeInternal] = useEdgesState(initialEdges)
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null)

  const onConnect = useCallback((params: Connection) => {
    setEdges((eds) => addEdge(params, eds))
  }, [setEdges])

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()
      const type = event.dataTransfer.getData('application/reactflow')
      if (!type || !reactFlowInstance) return
      if (!['trigger', 'message', 'condition', 'delay', 'ai', 'telegram', 'email', 'webhook'].includes(type)) return

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })

      const defaults: Record<string, Record<string, unknown>> = {
        trigger: { event: 'telegram_message' },
        message: { text: 'New message' },
        condition: { condition: 'New condition' },
        delay: { delay: '5 minutes' },
        ai: { prompt: 'Generate a response' },
        telegram: { text: 'New Telegram message' },
        email: { subject: 'New email', body: 'Email body' },
        webhook: { url: 'https://' },
      }

      const newNode: Node = {
        id: crypto.randomUUID(),
        type,
        position,
        data: defaults[type] || {},
      }

      setNodes((nds) => [...nds, newNode])
    },
    [reactFlowInstance, setNodes],
  )

  return (
    <div ref={reactFlowWrapper} className="flex-1 h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChangeInternal}
        onEdgesChange={onEdgesChangeInternal}
        onConnect={onConnect}
        onInit={setReactFlowInstance}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeClick={(_, node) => onSelectNode?.(node)}
        onPaneClick={() => onSelectNode?.(null)}
        nodeTypes={nodeTypes}
        fitView
        className="bg-gray-950"
      >
        <Background color="#1f2937" gap={20} />
        <Controls className="bg-gray-800 border-gray-700 rounded-lg [&_button]:text-gray-300 [&_button]:border-gray-700 [&_button]:hover:bg-gray-700" />
        <MiniMap
          className="bg-gray-900 border border-gray-800 rounded-lg"
          nodeColor="#374151"
          maskColor="rgba(0,0,0,0.6)"
        />
      </ReactFlow>
    </div>
  )
}

export default function FlowCanvas(props: FlowCanvasProps) {
  return (
    <ReactFlowProvider>
      <FlowCanvasInner {...props} />
    </ReactFlowProvider>
  )
}
