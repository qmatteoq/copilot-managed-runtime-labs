# Inbox Context Desk: API-first starting point

This React/TypeScript SPA is the **before migration** state for [Exercise 2](../../docs/02-pro-code.md). It uses MSAL sign-in and direct Microsoft Graph REST calls. It contains no Managed Runtime SDK, generated connector clients, app IDs, tenant bindings, backend, or client secret.

The starter loads the latest 50 inbox messages. **Find context** performs a subject-based Graph search for at most 10 inbox messages, excluding the selected message. It does **not** call Work IQ, generate an AI summary, search Teams/documents, or pretend that email search is equivalent to Work IQ grounding.

## Set up the Graph baseline

Register the app first by following [Exercise 2, Step 1](../../docs/02-pro-code.md#register-the-app-in-microsoft-entra): a single-tenant **Single-page application** registration with redirect URI `http://localhost:5173` and the delegated Microsoft Graph `Mail.Read` permission.

Open a standalone working copy of this folder, not the lab root or the author's already-deployed demo:

```powershell
Copy-Item .env.example .env.local
```

Set the public tenant and client IDs in `.env.local`:

```dotenv
VITE_TENANT_ID=<your-tenant-guid>
VITE_CLIENT_ID=<your-spa-client-guid>
```

Never put a password, token, or secret in a `VITE_` variable: these values are bundled into client code. Use the organization's configured package registry/proxy for every package operation.

```powershell
npm ci
npm run build
npm test
npm run dev
```

Open `http://localhost:5173`, choose **Sign in with Microsoft**, and select the training account. Popups must be permitted for sign-in. Vite uses a strict port so it cannot silently move away from the registered redirect URI.

Missing configuration appears as an explicit startup error. Authentication, permission, throttling, and service failures are surfaced; there is no mock fallback. The first page is intentionally bounded; filters apply only to the 50 loaded messages, and Graph search is subject-based within the inbox, not a full-text organizational search.

## Files to examine with GitHub Copilot

| File | Before migration | Lab change |
| --- | --- | --- |
| `src/auth.ts` | MSAL authorization-code/PKCE flow, token acquisition | Remove after host-managed connections work |
| `src/data/graph.ts` | Graph fetches, token header, response normalization | Replace with generated connector services |
| `src/data/contracts.ts` | App-owned `Mail`, `ContextResult`, `InboxData` | Preserve these UI-facing contracts |
| `src/main.tsx` | Wires auth and `GraphInbox` | Wire managed adapter, remove baseline config gate |
| `src/App.tsx` | Reader, filters, on-demand context, visible errors | Remove custom sign-in UI and update context labels |
| `vite.config.ts` | Ordinary React/Vite SPA | Integrate the installed Managed Apps tooling |

Use the [migration prompts and checkpoints](../../docs/02-pro-code.md). Do not deploy the direct-Graph baseline and try to allow it through CSP. The exercise changes **how data is accessed**, not just where the same bundle is hosted.

## Data handling

- Read-only Graph GET requests; no sending, marking read, or mailbox writes.
- Access tokens use MSAL's memory cache. Authentication transaction state can still be managed by MSAL; this is not a claim that the identity platform uses no browser state.
- `main.tsx` handles MSAL 5's redirect-bridge response before initializing the normal app, so popup authentication can return to the registered root URI.
- Messages and context results stay in React memory and are cleared on refresh/sign-out. Normal Microsoft 365 service-side retention still applies.
- HTML email is converted to inert text. The app does not render message markup, scripts, or remote images.
- Only credential-free HTTPS source URLs become clickable links.
- Requests start after explicit actions. No background polling or automatic AI calls.
- In-flight results are scoped to the current inbox session so older requests cannot repopulate cleared data.

## Checks and boundaries

`npm test` uses synthetic responses to verify the Graph request shape, search boundaries, errors, malformed data, and URL safety. It never authenticates or reads a mailbox. `npm run build` type-checks app and test code and builds the SPA.

Live sign-in and mailbox behavior require the learner's approved registration and account. A green build is not live Graph verification, and the post-migration connector flow must be tested separately inside the Managed Runtime App Player.
