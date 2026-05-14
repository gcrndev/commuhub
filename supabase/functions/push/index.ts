import { createClient } from 'npm:@supabase/supabase-js@2'
import { JWT } from 'npm:google-auth-library@9'

type NotificationRecord = {
  id: string
  user_id: string
  title: string | null
  body: string
  data: Record<string, string> | null
}

type WebhookPayload = {
  type: 'INSERT'
  table: 'notifications'
  schema: 'public'
  record: NotificationRecord
}

type FirebaseServiceAccount = {
  project_id: string
  client_email: string
  private_key: string
}

const supabase = createClient(
  requiredEnv('SUPABASE_URL'),
  getSupabaseServiceKey(),
)

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405)
  }

  let payload: WebhookPayload
  try {
    payload = await req.json()
  } catch {
    return jsonResponse({ error: 'Invalid JSON payload' }, 400)
  }

  if (
    payload.type !== 'INSERT' ||
    payload.schema !== 'public' ||
    payload.table !== 'notifications'
  ) {
    return jsonResponse({ error: 'Unsupported webhook payload' }, 400)
  }

  const notification = payload.record

  try {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('fcm_token')
      .eq('id', notification.user_id)
      .single()

    if (profileError) {
      throw new Error(`Profile lookup failed: ${profileError.message}`)
    }

    if (!profile?.fcm_token) {
      throw new Error('User has no FCM token')
    }

    const serviceAccount = getFirebaseServiceAccount()
    const accessToken = await getAccessToken(serviceAccount)
    const fcmResponse = await sendFcmMessage({
      accessToken,
      serviceAccount,
      fcmToken: profile.fcm_token,
      notification,
    })

    await markNotificationSent(notification.id)

    return jsonResponse({ ok: true, fcm: fcmResponse })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    await markNotificationFailed(notification.id, message)
    return jsonResponse({ ok: false, error: message }, 500)
  }
})

function getSupabaseServiceKey() {
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (serviceRoleKey) {
    return serviceRoleKey
  }

  const secretKeys = Deno.env.get('SUPABASE_SECRET_KEYS')
  if (secretKeys) {
    const parsed = JSON.parse(secretKeys) as Record<string, string>
    if (parsed.default) {
      return parsed.default
    }
  }

  throw new Error('Supabase service role key missing')
}

function getFirebaseServiceAccount() {
  const raw = requiredEnv('FCM_SERVICE_ACCOUNT_JSON')
  return JSON.parse(raw) as FirebaseServiceAccount
}

function getAccessToken(serviceAccount: FirebaseServiceAccount) {
  return new Promise<string>((resolve, reject) => {
    const jwtClient = new JWT({
      email: serviceAccount.client_email,
      key: serviceAccount.private_key,
      scopes: ['https://www.googleapis.com/auth/firebase.messaging'],
    })

    jwtClient.authorize((error, tokens) => {
      if (error) {
        reject(error)
        return
      }

      if (!tokens?.access_token) {
        reject(new Error('FCM access token missing'))
        return
      }

      resolve(tokens.access_token)
    })
  })
}

async function sendFcmMessage({
  accessToken,
  serviceAccount,
  fcmToken,
  notification,
}: {
  accessToken: string
  serviceAccount: FirebaseServiceAccount
  fcmToken: string
  notification: NotificationRecord
}) {
  const response = await fetch(
    `https://fcm.googleapis.com/v1/projects/${serviceAccount.project_id}/messages:send`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        message: {
          token: fcmToken,
          data: stringifyData({
            ...(notification.data ?? {}),
            title: notification.title ?? 'Commuhub',
            body: notification.body,
          }),
        },
      }),
    },
  )

  const responseBody = await response.json().catch(() => null)
  if (!response.ok) {
    throw new Error(
      `FCM send failed (${response.status}): ${JSON.stringify(responseBody)}`,
    )
  }

  return responseBody
}

async function markNotificationSent(notificationId: string) {
  const { error } = await supabase
    .from('notifications')
    .update({ sent_at: new Date().toISOString(), send_error: null })
    .eq('id', notificationId)

  if (error) {
    throw new Error(`Failed to mark notification sent: ${error.message}`)
  }
}

async function markNotificationFailed(notificationId: string, message: string) {
  const { error } = await supabase
    .from('notifications')
    .update({ send_error: message })
    .eq('id', notificationId)

  if (error) {
    console.error('Failed to mark notification failed', error)
  }
}

function stringifyData(data: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => [key, String(value)]),
  )
}

function requiredEnv(name: string) {
  const value = Deno.env.get(name)
  if (!value) {
    throw new Error(`${name} missing`)
  }
  return value
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}
