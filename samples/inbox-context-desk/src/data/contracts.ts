export interface Mail {
  id: string
  subject: string
  from: string
  received: string
  preview: string
  body: string
  isHtml: boolean
  isRead: boolean
  url?: string
}

export interface ContextItem {
  title: string
  detail: string
  url?: string
}

export interface ContextResult {
  explanation: string
  items: ContextItem[]
}

export interface InboxData {
  loadInbox(): Promise<Mail[]>
  findContext(mail: Mail): Promise<ContextResult>
}

export function safeHttpsUrl(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && !url.username && !url.password ? url.href : undefined
  } catch {
    return undefined
  }
}
