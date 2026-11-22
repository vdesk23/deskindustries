import { createEmailWebhookHandler } from '@lovable.dev/email-js'
import { createClient } from '@supabase/supabase-js'
import { createFileRoute } from '@tanstack/react-router'

type Reason = 'bounce' | 'complaint' | 'unsubscribe'

const STATUS: Record<Reason, 'bounced' | 'complained' | 'suppressed'> = {
  bounce: 'bounced',
  complaint: 'complained',
  unsubscribe: 'suppressed',
}
const MESSAGE: Record<Reason, string> = {
  bounce: 'Permanent bounce — email address is invalid or rejected',
  complaint: 'Spam complaint — recipient marked email as spam',
  unsubscribe: 'Recipient unsubscribed',
}

// Notification-only copy of outcomes; Lovable enforces suppression at send time.
async function record(eventId: string, recipient: string, messageId: string | null | undefined, reason: Reason) {
  const url = import.meta.env.VITE_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Server configuration error')
  const db = createClient(url, key, { auth: { persistSession: false } })
  const email = recipient.toLowerCase()

  const { error: supErr } = await db
    .from('suppressed_emails')
    .upsert({ email, reason, metadata: null }, { onConflict: 'email' })
  if (supErr) {
    console.error('suppressed_emails upsert failed', { code: supErr.code, message: supErr.message, event_id: eventId })
    throw new Error('suppression write failed')
  }

  const { error: logErr } = await db.from('email_send_log').insert({
    message_id: messageId ?? null,
    template_name: 'system',
    recipient_email: email,
    status: STATUS[reason],
    error_message: MESSAGE[reason],
    metadata: null,
  })
  if (logErr) {
    console.error('email_send_log insert failed', { code: logErr.code, message: logErr.message, event_id: eventId })
    throw new Error('log write failed')
  }
}

export const Route = createFileRoute("/lovable/email/events")({
  server: {
    handlers: {
      POST: ({ request }) => {
        const apiKey = process.env['LOVABLE_API_KEY']
        if (!apiKey) {
          console.error('Missing required environment variables')
          return Response.json({ error: 'Server configuration error' }, { status: 500 })
        }
        const handler = createEmailWebhookHandler({
          apiKey,
          on: {
            'email.bounced': async (event) => {
              await record(event.event_id, event.data.recipient, event.data.message_id, 'bounce')
            },
            'email.complaint': async (event) => {
              await record(event.event_id, event.data.recipient, event.data.message_id, 'complaint')
            },
            'email.unsubscribed': async (event) => {
              await record(event.event_id, event.data.recipient, event.data.message_id, 'unsubscribe')
            },
          },
        })
        return handler(request)
      },
    },
  },
})
