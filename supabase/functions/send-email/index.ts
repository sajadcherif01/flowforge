import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { SmtpClient } from 'https://deno.land/x/smtp@v0.7.0/mod.ts'

serve(async (req) => {
  const { to, subject, body, userId } = await req.json()

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, supabaseKey)

  const { data: settings } = await supabase
    .from('user_settings')
    .select('smtp_host, smtp_port, smtp_username, smtp_password')
    .eq('user_id', userId)
    .single()

  if (!settings?.smtp_host) {
    return new Response(JSON.stringify({ error: 'SMTP not configured' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400,
    })
  }

  try {
    const client = new SmtpClient()
    await client.connect({
      hostname: settings.smtp_host,
      port: parseInt(settings.smtp_port || '587'),
      username: settings.smtp_username,
      password: settings.smtp_password,
    })

    await client.send({
      from: settings.smtp_username,
      to,
      subject,
      content: body,
    })

    await client.close()

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
