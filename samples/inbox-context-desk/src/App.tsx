import { useRef, useState } from 'react'
import type { Auth } from './auth.ts'
import type { ContextResult, InboxData, Mail } from './data/contracts.ts'
import { safeHttpsUrl } from './data/contracts.ts'

function errorText(error: unknown): string {
  return error instanceof Error ? error.message : 'Unexpected request failure.'
}

function plainBody(mail: Mail): string {
  if (!mail.isHtml) return mail.body
  const document = new DOMParser().parseFromString(mail.body, 'text/html')
  document.querySelectorAll('script,style,head').forEach((node) => node.remove())
  document.querySelectorAll('br').forEach((node) => node.replaceWith('\n'))
  document.querySelectorAll('p,div,li').forEach((node) => node.append('\n'))
  return document.body.textContent || ''
}

export function App({ data, auth }: { data: InboxData; auth: Auth }) {
  const [signedIn, setSignedIn] = useState(false)
  const [messages, setMessages] = useState<Mail[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [filter, setFilter] = useState('')
  const [busy, setBusy] = useState(false)
  const [contextBusy, setContextBusy] = useState(false)
  const [error, setError] = useState('')
  const [contextError, setContextError] = useState('')
  const [results, setResults] = useState<Record<string, ContextResult>>({})
  const epoch = useRef(0)
  const authBusy = useRef(false)
  const contextLock = useRef(false)

  async function refresh() {
    const version = ++epoch.current
    setBusy(true)
    setError('')
    setMessages([])
    setResults({})
    setSelectedId('')
    setContextError('')
    try {
      const inbox = await data.loadInbox()
      if (epoch.current !== version) return
      setMessages(inbox)
      setSelectedId(inbox[0]?.id || '')
    } catch (cause) {
      if (epoch.current === version) setError(errorText(cause))
    } finally {
      if (epoch.current === version) setBusy(false)
    }
  }

  async function signIn() {
    if (authBusy.current) return
    authBusy.current = true
    setBusy(true)
    setError('')
    try {
      await auth.signIn()
      setSignedIn(true)
      await refresh()
    } catch (cause) {
      setError(errorText(cause))
    } finally {
      authBusy.current = false
      setBusy(false)
    }
  }

  async function signOut() {
    if (authBusy.current) return
    authBusy.current = true
    ++epoch.current
    setBusy(true)
    setMessages([])
    setResults({})
    setSelectedId('')
    setContextError('')
    setError('')
    setSignedIn(false)
    try {
      await auth.signOut()
    } catch (cause) {
      setError(`Sign-out did not complete: ${errorText(cause)} Reload before using another account.`)
    } finally {
      authBusy.current = false
      setBusy(false)
    }
  }

  async function findContext(mail: Mail) {
    if (contextLock.current) return
    contextLock.current = true
    const version = epoch.current
    setContextBusy(true)
    setContextError('')
    try {
      const result = await data.findContext(mail)
      if (epoch.current === version) setResults((old) => ({ ...old, [mail.id]: result }))
    } catch (cause) {
      if (epoch.current === version) setContextError(errorText(cause))
    } finally {
      contextLock.current = false
      setContextBusy(false)
    }
  }

  const visible = messages.filter((mail) =>
    `${mail.subject} ${mail.from}`.toLowerCase().includes(filter.toLowerCase()))
  const selected = visible.find((mail) => mail.id === selectedId) ?? visible[0]
  const result = selected ? results[selected.id] : undefined
  const sourceUrl = safeHttpsUrl(selected?.url)

  return <div className="shell">
    <a className="skip" href="#inbox">Skip to inbox</a>
    <header>
      <div><p className="eyebrow">API-FIRST STARTER</p><h1>Inbox Context Desk</h1></div>
      <button disabled={busy || contextBusy} onClick={() => void (signedIn ? signOut() : signIn())}>
        {signedIn ? 'Sign out' : 'Sign in with Microsoft'}
      </button>
    </header>
    <p>Read your inbox. Find related email. Then move the data layer to governed connectors.</p>
    <p className="notice">Direct Microsoft Graph baseline. Not hosted on Copilot Managed Runtime.
      Context search is email-only, not Work IQ or an AI-generated answer.</p>
    {error && <div role="alert" className="error">{error}</div>}
    {!signedIn ? <section><h2>Start with your own mailbox</h2>
      <p>Use your approved lab account. This app reads mail but cannot send or modify it.
        No mailbox data is stored in browser storage.</p></section>
      : <main id="inbox" className="workspace">
        <aside aria-label="Inbox">
          <div className="row"><h2>Latest 50 messages</h2>
            <button disabled={busy || contextBusy} onClick={() => void refresh()}>Refresh</button></div>
          <label>Filter loaded subjects or senders
            <input type="search" disabled={busy || contextBusy} value={filter} onChange={(event) => {
              setFilter(event.target.value)
              setContextError('')
            }} /></label>
          {busy ? <p role="status">Loading inbox...</p>
            : error ? <p>Inbox could not be loaded. Resolve the error above, then refresh.</p>
              : visible.length === 0 ? <p>No messages match. Clear the filter or refresh your inbox.</p>
                : <ul className="messages">{visible.map((mail) => <li key={mail.id}>
                  <button disabled={contextBusy} className="message" aria-pressed={selected?.id === mail.id}
                    onClick={() => { setSelectedId(mail.id); setContextError('') }}>
                    <strong>{mail.subject}</strong><span>{mail.from}</span>
                    <span>{mail.isRead ? 'Read' : 'Unread'} - {mail.received ? new Date(mail.received).toLocaleString() : 'Date unavailable'}</span>
                  </button>
                </li>)}</ul>}
        </aside>
        <section aria-label="Selected message and context" aria-busy={contextBusy}>
          {selected && !busy ? <>
            <h2>{selected.subject}</h2><p>{selected.from}</p>
            {sourceUrl && <a href={sourceUrl} target="_blank" rel="noopener noreferrer">Open message in Outlook</a>}
            <pre className="body">{plainBody(selected)}</pre>
            <h3>Related context</h3>
            <button disabled={contextBusy || !!result} onClick={() => void findContext(selected)}>
              {contextBusy ? 'Finding context...' : result ? 'Context loaded' : 'Find context'}
            </button>
            <p className="muted">Runs only after your click. Refresh clears this session's cached results.</p>
            {contextError && <p role="alert" className="error">{contextError}</p>}
            {contextBusy && <p role="status">Searching related messages...</p>}
            {result && <><p>{result.explanation}</p>
              {result.items.length === 0 ? <p>No related evidence found.</p>
                : <ul>{result.items.map((item, index) => {
                  const url = safeHttpsUrl(item.url)
                  return <li key={index}><h4>{url
                    ? <a href={url} target="_blank" rel="noopener noreferrer">{item.title}</a>
                    : item.title}</h4><p>{item.detail}</p></li>
                })}</ul>}</>}
          </> : <p>Select an inbox message after loading.</p>}
        </section>
      </main>}
    <footer>Read-only requests. No mock fallback. Session-memory cache. Check linked sources.</footer>
  </div>
}
