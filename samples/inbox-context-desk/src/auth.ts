import { BrowserCacheLocation, InteractionRequiredAuthError, PublicClientApplication } from '@azure/msal-browser'

export function createAuth(tenantId: string, clientId: string) {
  const guid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!guid.test(tenantId) || !guid.test(clientId)) {
    throw new Error('Set VITE_TENANT_ID and VITE_CLIENT_ID in .env.local using your approved SPA registration, then restart Vite.')
  }
  const app = new PublicClientApplication({
    auth: {
      clientId,
      authority: `https://login.microsoftonline.com/${tenantId}`,
      redirectUri: window.location.origin,
    },
    cache: { cacheLocation: BrowserCacheLocation.MemoryStorage },
  })
  const scopes = ['https://graph.microsoft.com/Mail.Read']
  return {
    initialize: () => app.initialize(),
    async signIn() {
      const result = await app.loginPopup({ scopes, prompt: 'select_account' })
      if (!result.account) throw new Error('Sign-in completed without an account.')
      app.setActiveAccount(result.account)
    },
    async signOut() {
      await app.logoutPopup({ account: app.getActiveAccount(), postLogoutRedirectUri: window.location.origin })
    },
    async token() {
      const account = app.getActiveAccount()
      if (!account) throw new Error('Sign in before loading your inbox.')
      try {
        const result = await app.acquireTokenSilent({ account, scopes })
        return result.accessToken
      } catch (error) {
        if (error instanceof InteractionRequiredAuthError) {
          throw new Error('Your session needs interaction. Sign out and sign in again.')
        }
        throw error
      }
    },
  }
}

export type Auth = ReturnType<typeof createAuth>
