import { createRoot } from 'react-dom/client'
import { App } from './App.tsx'
import { createAuth } from './auth.ts'
import { GraphInbox } from './data/graph.ts'
import './styles.css'

const root = createRoot(document.getElementById('root')!)

async function start() {
  try {
    const hash = new URLSearchParams(window.location.hash.slice(1))
    const query = new URLSearchParams(window.location.search)
    if ([hash, query].some((params) => params.has('state') && (params.has('code') || params.has('error')))) {
      const { broadcastResponseToMainFrame } = await import('@azure/msal-browser/redirect-bridge')
      await broadcastResponseToMainFrame()
      return
    }
    const auth = createAuth(import.meta.env.VITE_TENANT_ID || '', import.meta.env.VITE_CLIENT_ID || '')
    await auth.initialize()
    root.render(<App auth={auth} data={new GraphInbox(() => auth.token())} />)
  } catch (error) {
    root.render(<main className="shell"><h1>Inbox Context Desk needs configuration</h1>
      <p role="alert">{error instanceof Error ? error.message : 'Startup failed.'}</p>
      <p>Follow the sample README. Do not enter a password, token, or client secret in configuration.</p>
    </main>)
  }
}

void start()
