export interface FlowTemplate {
  id: string
  name: string
  description: string
  icon: string
  category: string
  nodes: Record<string, unknown>[]
  edges: Record<string, unknown>[]
}

const TRIGGER_ID = 'trigger-1'

export const FLOW_TEMPLATES: FlowTemplate[] = [
  {
    id: 'welcome',
    name: 'Welcome Message',
    description: 'Send a welcome message when someone starts a conversation',
    icon: 'Sun',
    category: 'Onboarding',
    nodes: [
      { id: TRIGGER_ID, type: 'trigger', position: { x: 300, y: 50 }, data: { event: 'telegram_message' } },
      { id: 'msg-1', type: 'message', position: { x: 300, y: 200 }, data: { text: 'Hello {{contact.name}}! Welcome to our bot. How can I help you today?' } },
    ],
    edges: [
      { id: 'e1', source: TRIGGER_ID, target: 'msg-1' },
    ],
  },
  {
    id: 'faq',
    name: 'FAQ Bot',
    description: 'Answer common questions automatically with AI',
    icon: 'HelpCircle',
    category: 'Support',
    nodes: [
      { id: TRIGGER_ID, type: 'trigger', position: { x: 300, y: 50 }, data: { event: 'telegram_message' } },
      { id: 'ai-1', type: 'ai', position: { x: 300, y: 200 }, data: { prompt: 'Answer the following question briefly and helpfully: {{input}}' } },
      { id: 'msg-1', type: 'telegram', position: { x: 300, y: 350 }, data: { text: '{{prev.output}}' } },
    ],
    edges: [
      { id: 'e1', source: TRIGGER_ID, target: 'ai-1' },
      { id: 'e2', source: 'ai-1', target: 'msg-1' },
    ],
  },
  {
    id: 'lead-capture',
    name: 'Lead Capture',
    description: 'Collect name and email from new contacts',
    icon: 'UserPlus',
    category: 'Marketing',
    nodes: [
      { id: TRIGGER_ID, type: 'trigger', position: { x: 300, y: 50 }, data: { event: 'telegram_message' } },
      { id: 'msg-1', type: 'message', position: { x: 300, y: 200 }, data: { text: "Hi! I'd love to learn more about you. What's your name?" } },
      { id: 'cond-1', type: 'condition', position: { x: 300, y: 350 }, data: { variable: '{{input}}', operator: 'is_not_empty', value: '' } },
      { id: 'msg-2', type: 'message', position: { x: 100, y: 500 }, data: { text: "Great {{input}}! What's your email address so I can keep in touch?" } },
      { id: 'msg-3', type: 'email', position: { x: 100, y: 650 }, data: { subject: 'Welcome {{input}}!', body: "Thanks for connecting! We'll be in touch soon." } },
    ],
    edges: [
      { id: 'e1', source: TRIGGER_ID, target: 'msg-1' },
      { id: 'e2', source: 'msg-1', target: 'cond-1' },
      { id: 'e3', source: 'cond-1', target: 'msg-2', sourceHandle: 'true' },
      { id: 'e4', source: 'cond-1', target: 'msg-3', sourceHandle: 'false' },
    ],
  },
  {
    id: 'feedback',
    name: 'Feedback Collector',
    description: 'Ask for feedback after a conversation ends',
    icon: 'ThumbsUp',
    category: 'Support',
    nodes: [
      { id: TRIGGER_ID, type: 'trigger', position: { x: 300, y: 50 }, data: { event: 'telegram_message' } },
      { id: 'msg-1', type: 'telegram', position: { x: 300, y: 200 }, data: { text: "Thanks for reaching out! Before you go, could you rate our support?" } },
      { id: 'msg-2', type: 'message', position: { x: 300, y: 350 }, data: { text: "Please reply with a rating from 1-5 stars." } },
      { id: 'cond-1', type: 'condition', position: { x: 300, y: 500 }, data: { variable: '{{input}}', operator: 'is_not_empty', value: '' } },
      { id: 'msg-3', type: 'telegram', position: { x: 150, y: 650 }, data: { text: "Thanks for your feedback! We appreciate it." } },
    ],
    edges: [
      { id: 'e1', source: TRIGGER_ID, target: 'msg-1' },
      { id: 'e2', source: 'msg-1', target: 'msg-2' },
      { id: 'e3', source: 'msg-2', target: 'cond-1' },
      { id: 'e4', source: 'cond-1', target: 'msg-3', sourceHandle: 'true' },
    ],
  },
  {
    id: 'delay-followup',
    name: 'Follow-up Sequence',
    description: 'Send a follow-up message after a delay',
    icon: 'Clock',
    category: 'Marketing',
    nodes: [
      { id: TRIGGER_ID, type: 'trigger', position: { x: 300, y: 50 }, data: { event: 'telegram_message' } },
      { id: 'msg-1', type: 'message', position: { x: 300, y: 200 }, data: { text: "Thanks for your interest {{contact.name}}! I'll send you more info shortly." } },
      { id: 'delay-1', type: 'delay', position: { x: 300, y: 350 }, data: { delay: '1 hour' } },
      { id: 'msg-2', type: 'telegram', position: { x: 300, y: 500 }, data: { text: "Hi {{contact.name}}, here's that information you requested. Let me know if you have questions!" } },
    ],
    edges: [
      { id: 'e1', source: TRIGGER_ID, target: 'msg-1' },
      { id: 'e2', source: 'msg-1', target: 'delay-1' },
      { id: 'e3', source: 'delay-1', target: 'msg-2' },
    ],
  },
  {
    id: 'webhook-notify',
    name: 'Webhook Notifier',
    description: 'Send a Telegram message when a webhook is received',
    icon: 'Webhook',
    category: 'Automation',
    nodes: [
      { id: TRIGGER_ID, type: 'trigger', position: { x: 300, y: 50 }, data: { event: 'webhook_received' } },
      { id: 'msg-1', type: 'telegram', position: { x: 300, y: 200 }, data: { text: '🔔 Webhook received! Data: {{input}}' } },
    ],
    edges: [
      { id: 'e1', source: TRIGGER_ID, target: 'msg-1' },
    ],
  },
]
