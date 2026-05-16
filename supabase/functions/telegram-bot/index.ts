import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const update = await req.json()

  // Verify webhook from Telegram
  if (!update.message) return new Response('ok')

  const chatId = update.message.chat.id
  const text = update.message.text || ''
  const username = update.message.from?.first_name || 'User'

  // Get Supabase client
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, supabaseKey)

  // Find the flow that has this Telegram bot token
  const { data: settings } = await supabase
    .from('user_settings')
    .select('user_id')

  if (!settings || settings.length === 0) return new Response('no settings')

  for (const setting of settings) {
    const botToken = setting.telegram_bot_token
    if (!botToken) continue

    // Verify this webhook is for this bot by comparing tokens (simplified)
    const { data: flows } = await supabase
      .from('flows')
      .select('id, name, nodes, edges')
      .eq('user_id', setting.user_id)
      .eq('is_active', true)

    if (!flows) continue

    for (const flow of flows) {
      const nodes = flow.nodes as any[] || []
      const edges = flow.edges as any[] || []
      if (nodes.length === 0) continue

      // Find trigger node
      const triggerNode = nodes.find((n: any) => n.type === 'trigger')
      if (!triggerNode) continue

      // Find or create contact
      const { data: contact } = await supabase
        .from('contacts')
        .select('id')
        .eq('user_id', setting.user_id)
        .eq('platform', 'telegram')
        .eq('platform_id', String(chatId))
        .single()

      let contactId: string
      if (contact) {
        contactId = contact.id
      } else {
        const { data: newContact } = await supabase
          .from('contacts')
          .insert({
            user_id: setting.user_id,
            name: username,
            platform: 'telegram',
            platform_id: String(chatId),
            metadata: { chat_id: chatId },
          })
          .select('id')
          .single()
        contactId = newContact!.id
      }

      // Create conversation
      const { data: conversation } = await supabase
        .from('conversations')
        .insert({
          flow_id: flow.id,
          contact_id: contactId,
          current_node_id: triggerNode.id,
        })
        .select('id')
        .single()

      // Store user message
      await supabase.from('messages').insert({
        conversation_id: conversation!.id,
        role: 'user',
        content: text,
        platform: 'telegram',
      })

      // Execute flow: find next node after trigger
      const triggerEdge = edges.find((e: any) => e.source === triggerNode.id)
      if (!triggerEdge) continue

      const nextNode = nodes.find((n: any) => n.id === triggerEdge.target)
      if (!nextNode) continue

      // Process node chain
      await processNode(nextNode, nodes, edges, conversation!.id, setting.user_id, supabase, botToken, chatId)
    }
  }

  return new Response('ok')
})

async function processNode(
  node: any,
  nodes: any[],
  edges: any[],
  conversationId: string,
  userId: string,
  supabase: any,
  botToken: string,
  chatId: number,
) {
  let output = ''

  switch (node.type) {
    case 'message':
      output = node.data.text || ''
      break

    case 'ai': {
      const prompt = node.data.prompt || 'Generate a friendly response'
      const { data: settings } = await supabase
        .from('user_settings')
        .select('github_models_token')
        .eq('user_id', userId)
        .single()

      const token = settings?.github_models_token
      if (token) {
        try {
          const response = await fetch('https://models.inference.ai.azure.com/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'gpt-4o',
              messages: [{ role: 'user', content: prompt }],
            }),
          })
          const data = await response.json()
          output = data.choices?.[0]?.message?.content || 'AI response failed'
        } catch {
          output = 'AI service unavailable'
        }
      } else {
        output = 'GitHub Models token not configured'
      }
      break
    }

    case 'telegram':
      output = node.data.text || ''
      break

    default:
      output = ''
  }

  if (output) {
    // Send via Telegram
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: output }),
    })

    // Store message
    await supabase.from('messages').insert({
      conversation_id: conversationId,
      role: 'assistant',
      content: output,
      platform: 'telegram',
    })
  }

  // Continue to next node
  const nextEdge = edges.find((e: any) => e.source === node.id)
  if (nextEdge) {
    const nextNode = nodes.find((n: any) => n.id === nextEdge.target)
    if (nextNode) {
      await processNode(nextNode, nodes, edges, conversationId, userId, supabase, botToken, chatId)
    }
  }
}
