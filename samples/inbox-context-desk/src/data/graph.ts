import { safeHttpsUrl } from './contracts.ts'
import type { ContextResult, InboxData, Mail } from './contracts.ts'

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function text(value: unknown, name: string): string {
  if (value === undefined || value === null) return ''
  if (typeof value !== 'string') throw new Error(`Graph returned an invalid ${name}.`)
  return value
}

export function toMail(value: unknown): Mail {
  if (!isRecord(value) || typeof value.id !== 'string' || !value.id.trim()) {
    throw new Error('Graph returned a message without a valid ID.')
  }
  const sender = isRecord(value.from) && isRecord(value.from.emailAddress)
    ? value.from.emailAddress : undefined
  const body = isRecord(value.body) ? value.body : undefined
  return {
    id: value.id,
    subject: text(value.subject, 'subject') || '(No subject)',
    from: text(sender?.name, 'sender name') || text(sender?.address, 'sender address') || 'Unknown sender',
    received: text(value.receivedDateTime, 'received date'),
    preview: text(value.bodyPreview, 'body preview'),
    body: text(body?.content, 'body') || text(value.bodyPreview, 'body preview'),
    isHtml: text(body?.contentType, 'body content type').toLowerCase() === 'html',
    isRead: value.isRead === true,
    url: safeHttpsUrl(value.webLink),
  }
}

export function searchPhrase(subject: string): string {
  const phrase = subject.replace(/^(?:(?:re|fw|fwd)\s*:\s*)+/i, '')
    .replace(/[^\p{L}\p{N}]+/gu, ' ').trim().split(/\s+/).slice(0, 6).join(' ').slice(0, 80).trim()
  if (!phrase) throw new Error('This message has no searchable subject. Select another message.')
  return phrase
}

const fields = 'id,subject,from,receivedDateTime,bodyPreview,body,isRead,webLink'

export class GraphInbox implements InboxData {
  private readonly getToken: () => Promise<string>
  private readonly request: typeof fetch

  constructor(
    getToken: () => Promise<string>,
    request: typeof fetch = fetch,
  ) {
    this.getToken = getToken
    this.request = request
  }

  private async messages(query: URLSearchParams): Promise<Mail[]> {
    const token = await this.getToken()
    const response = await this.request(
      `https://graph.microsoft.com/v1.0/me/mailFolders/inbox/messages?${query}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Prefer: 'outlook.body-content-type="text"',
        },
      },
    )
    if (!response.ok) {
      const requestId = response.headers.get('request-id')
      const retryAfter = response.headers.get('Retry-After')
      throw new Error(
        `Graph inbox request failed (HTTP ${response.status}).`
        + (requestId ? ` Request ID: ${requestId}.` : '')
        + (response.status === 401 ? ' Sign out and sign in again.' : '')
        + (response.status === 403 ? ' Check Mail.Read consent and mailbox access with your administrator.' : '')
        + (response.status === 429 ? ` Throttled; retry later${retryAfter ? ` (Retry-After: ${retryAfter})` : ''}.` : ''),
      )
    }
    const result: unknown = await response.json()
    if (!isRecord(result) || !Array.isArray(result.value)) {
      throw new Error('Graph returned an unexpected message collection.')
    }
    return result.value.map(toMail)
  }

  async loadInbox(): Promise<Mail[]> {
    return this.messages(new URLSearchParams({
      $select: fields, $top: '50', $orderby: 'receivedDateTime desc',
    }))
  }

  async findContext(mail: Mail): Promise<ContextResult> {
    const phrase = searchPhrase(mail.subject)
    const related = await this.messages(new URLSearchParams({
      $select: fields, $top: '10', $search: `"subject:${phrase}"`,
    }))
    return {
      explanation: `Direct Graph subject search for "${phrase}" in your inbox (at most 10 hits, selected message excluded). This is related email, not an AI briefing or cross-Microsoft 365 retrieval.`,
      items: related.filter((item) => item.id !== mail.id).map((item) => ({
        title: item.subject,
        detail: `${item.from}: ${item.preview}`,
        url: item.url,
      })),
    }
  }
}
