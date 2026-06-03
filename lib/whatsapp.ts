/**
 * SMVS Seva Management System — WhatsApp Messaging via Green API
 * Docs: https://green-api.com/en/docs/api/sending/SendMessage/
 */

const INSTANCE_ID = process.env.GREEN_API_INSTANCE_ID!
const TOKEN       = process.env.GREEN_API_TOKEN!
const BASE_URL    = `https://api.green-api.com/waInstance${INSTANCE_ID}`

/**
 * Send a WhatsApp text message.
 * @param phone - 10-digit Indian mobile (we prepend 91)
 * @param message - Plain text message
 */
export async function sendWhatsApp(phone: string, message: string): Promise<boolean> {
  try {
    // Normalise: strip leading 0 or +91, always prefix 91
    const digits = phone.replace(/\D/g, '')
    const chatId = (digits.startsWith('91') ? digits : `91${digits}`) + '@c.us'

    const res = await fetch(`${BASE_URL}/sendMessage/${TOKEN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatId, message }),
    })

    if (!res.ok) {
      console.error('[WhatsApp] send failed:', await res.text())
      return false
    }
    return true
  } catch (err) {
    console.error('[WhatsApp] error:', err)
    return false
  }
}

// ─── Message Templates ─────────────────────────────────────────

export function msgAssignmentLeader(params: {
  leaderName: string
  sevaName: string
  frequency: string
  centerName: string
  memberNames: string[]
}): string {
  return `🙏 *Jai Swaminarayan*, ${params.leaderName}bhai!

You have been appointed as *Leader* for the following seva at *${params.centerName}*:

📌 *Seva:* ${params.sevaName}
🔁 *Frequency:* ${params.frequency}
👥 *Your Team:* ${params.memberNames.join(', ')}

As leader, please coordinate with your team and ensure the seva is performed on time. Members have also been notified.

*SMVS Seva Management System*`
}

export function msgAssignmentMember(params: {
  memberName: string
  sevaName: string
  frequency: string
  centerName: string
  leaderName: string
  leaderPhone: string
}): string {
  return `🙏 *Jai Swaminarayan*, ${params.memberName}bhai!

You have been assigned the following seva at *${params.centerName}*:

📌 *Seva:* ${params.sevaName}
🔁 *Frequency:* ${params.frequency}
👑 *Your Leader:* ${params.leaderName} (${params.leaderPhone})

Please log in to the SMVS Seva App to view details and submit completion.

*SMVS Seva Management System*`
}

