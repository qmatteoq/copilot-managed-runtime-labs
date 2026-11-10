# Exercise 2: Bring Inbox Context Desk to Copilot Managed Runtime

[Overview](../README.md) | [Prerequisites](00-prerequisites.md) | [Exercise 1: No-code](01-no-code.md)

**Path:** a coding agent (VS Code, the GitHub Copilot app or GitHub Copilot CLI), React/TypeScript, Managed Runtime CLI. **Time:** 120-150 minutes. **Level:** Intermediate.

## Scenario and objectives

You have a conventional web app that reads Outlook mail through Microsoft Graph. You use a coding agent to move its identity, data access, hosting and governance to Copilot Managed Runtime, without rebuilding its UI.

The supplied [starter](../samples/inbox-context-desk/README.md) implements a real direct-API baseline. Its context button finds related inbox messages using Graph subject search. After migration, Outlook supplies mail and **Work IQ Copilot MCP** adds grounded organizational context. This is intentionally a capability expansion: email search is not an equivalent substitute for Work IQ.

You will map the app's external calls, turn it into a managed app, swap Graph calls for connectors, publish a reviewed commit, and see why local development, cloud preview and the live app can show different versions.

## How the steps work

Apart from the app registration in Step 1, **your coding agent does all the work**. Use the one you set up in [prerequisites Step 9](00-prerequisites.md#step-9-choose-your-coding-agent-and-add-the-managed-apps-plugin): Visual Studio Code in **Agent** mode, the GitHub Copilot app or GitHub Copilot CLI. The prompts are the same in all three. You don't type commands yourself. Each step has the same parts:

- **What you type:** a prompt to paste into the chat of your coding agent.
- **What it does:** what the agent does for you, including the commands and plugin skills it uses. They're listed so you understand what happens, not for you to type.
- **Behind the scenes:** what changes in the app, in your tenant or in the platform.
- **How to check:** what you should see when it worked.

The agent asks for permission before it runs a command or edits a file. Read each request and approve it (the button is **Allow**, **Continue** or **Yes**, depending on the agent). If something looks wrong, deny it and tell the agent what to do instead.

## Step 1: Register the app and run the starter

### Register the app in Microsoft Entra

The starter signs users in with Microsoft Entra ID and calls Microsoft Graph directly, like most web apps do today. For that, it needs an **app registration**: an identity for the app in your tenant.

**Tool:** Microsoft Entra admin center, in your browser.

1. Go to `https://entra.microsoft.com` and sign in with your **training account**.
2. In the left menu, select **Entra ID** > **App registrations**. If you don't see it, search for `App registrations` in the search box at the top.
3. Select **+ New registration**.
4. Fill in the form:
   - **Name:** `Inbox Context Desk (lab)`
   - **Supported account types:** **Accounts in this organizational directory only** (single tenant).
   - **Redirect URI:** in the **Select a platform** list, choose **Single-page application (SPA)**. In the box next to it, enter `http://localhost:5173`
5. Select **Register**. The app's **Overview** page opens.
6. Open Notepad. Copy these two values from the **Overview** page into Notepad. You need them in a minute:
   - **Application (client) ID**
   - **Directory (tenant) ID**
7. In the left menu of the app, select **API permissions**. **User.Read** is already listed.
8. Select **+ Add a permission** > **Microsoft Graph** > **Delegated permissions**.
9. In the search box, type `Mail.Read`. Expand **Mail**, tick **Mail.Read**, and select **Add permissions**.
10. If you're an administrator, select **Grant admin consent for** *your tenant name* and then **Yes**. If you aren't, skip this: you'll be asked to consent when you first sign in. If your company blocks user consent, ask an administrator to grant it.
11. **Don't** create a client secret or certificate. A browser app can't keep a secret safe, so it doesn't use one.

**Behind the scenes:** the redirect URI tells Entra where it can send the user back after sign-in. It must match the address the app runs on exactly, which is why the starter always runs on port `5173`. `Mail.Read` is a **delegated** permission: the app reads mail as the signed-in user and only sees that user's mailbox.

### Set up and run the starter

**Tool:** File Explorer and your coding agent.

1. In **File Explorer**, go to `C:\labs` and create a new, empty folder called `inbox-context-desk` (**New** > **Folder**).
2. Open the folder in your coding agent:
   - **Visual Studio Code:** select **File** > **Open Folder**, pick `C:\labs\inbox-context-desk`, and select **Yes, I trust the authors**. Open the Chat view with **Ctrl+Alt+I** and make sure **Agent** is selected in the mode picker.
   - **GitHub Copilot app:** start a new session and pick `C:\labs\inbox-context-desk` as its folder.
   - **GitHub Copilot CLI:** open **Windows PowerShell**, run `cd C:\labs\inbox-context-desk`, then run `copilot`. If it asks whether you trust the folder, select **Yes**.
3. **What you type:** paste this prompt. Replace the two placeholders with the IDs you saved in Notepad.

   ```text
   Copy the starter app from
   C:\labs\copilot-managed-runtime-labs\samples\inbox-context-desk
   into the current folder. Skip node_modules, dist and any .env.local.

   Create .env.local from .env.example with:
   VITE_TENANT_ID=<Directory (tenant) ID>
   VITE_CLIENT_ID=<Application (client) ID>

   Install the dependencies with the existing npm configuration,
   then start the dev server in the background and tell me the URL.
   ```

   **What it does:** copies the starter files, creates `.env.local`, runs `npm ci` to install packages, then runs `npm run dev` in the background. If the agent asks for permission to read the lab folder, approve it.

   **Behind the scenes:** the starter is a normal React and Vite app. `src/auth.ts` signs you in with MSAL and gets a token for Microsoft Graph. `src/data/graph.ts` calls Graph directly. `src/data/contracts.ts` keeps the data types separate from the UI, which makes the migration easier later. The two IDs aren't secrets, but never put a password or secret in a `VITE_` variable, because it ends up in the browser code.

4. Open the URL the agent gives you (`http://localhost:5173`) in Edge. Select **Sign in with Microsoft** and pick your training account. Allow pop-ups if Edge blocks the sign-in window, and accept the permissions prompt if you see one.
5. **How to check:** your latest inbox messages load. Select one of the Orion emails you sent yourself in the prerequisites, then select **Find context**. Related Orion emails appear.

**Checkpoint:** you have a working app that calls Microsoft Graph directly. Note its limits: it loads only 50 messages, **Find context** only searches email subjects, and it needs its own app registration.

## Step 2: Assess the migration

**What you type:**

```text
Stop the dev server. Then assess this app for migration to Copilot Managed
Runtime. List every external network call, the custom sign-in code, the
build output and any server requirements. Map the Graph inbox read to the
Office 365 Outlook connector and Find context to Work IQ Copilot MCP.
Explain how the behavior changes from email subject search to Work IQ.
Keep the Mail, ContextResult and InboxData contracts and the current UI.
Don't change any code or cloud resources yet.
```

**What it does:** stops `npm run dev`, reads the source, and writes a migration plan. It doesn't change anything.

**Behind the scenes:** the agent compares the app with what the platform supports. The plan should look like this:

| Today | After the migration | What stays the same |
| --- | --- | --- |
| MSAL sign-in and a Graph token | The managed host signs the user in; connectors use the user's own connections | Each user sees only their own data; no credentials in the code |
| Graph call to read the inbox | Outlook connector action `GetEmailsV3` | Latest 50 messages, sender, subject, read state |
| Graph search for related email | Work IQ Copilot MCP, only when the user selects **Find context** | Clear errors and real source links |
| Local Vite URL | Managed **Local Play** URL that wraps your local code | Fast UI changes with hot reload |
| You choose where to host | Platform build, cloud preview, then an explicit deploy | Every version comes from a known commit |

The platform hosts **static** single-page apps only: no server code, server-side rendering, scheduled jobs or databases of your own. This starter has none, so it's a good fit.

**How to check:** the plan maps both Graph calls to connectors and says that MSAL and the Graph code will be removed.

## Step 3: Turn the app into a managed app and add connectors

**What you type:**

```text
Turn this folder into a Copilot managed app called "Inbox Context Desk - Lab",
using platform-managed Git. First check that the managed apps CLI is signed in
with my training account and tell me which environment you'll use.

Then add two data sources as actions: Office 365 Outlook and Work IQ Copilot
MCP. Use the add-office365 and add-workiq skills. Before adding each one,
check that the actions we need (GetEmailsV3 and the Work IQ Copilot tool)
are allowed by policy, and stop if one is blocked.
```

**What it does:**

1. Runs `ms auth status` to confirm the account, then `ms app init --display-name "Inbox Context Desk - Lab" --repo native` to register the existing app with the platform.
2. Uses the **add-office365** and **add-workiq** skills. They look up the connectors with `ms connector list` and `ms connector list-actions`, check the policy status of each action, then run `ms app add data-source --as action` for each one.
3. When a connector needs a connection, a browser window opens. **Sign in with your training account and create the connection.** This is the only part you do yourself.

**Behind the scenes:**

- The platform creates the app in your environment and a Git repository that it manages for you (`--repo native`). The repository type can't change later.
- `ms.config.json` records the app, environment and connection bindings.
- `generated/` contains typed TypeScript services and models for the two connectors.
- Connections belong to **you**. Every user who runs the app later uses their own connection, so they only ever see their own mail.
- Don't edit `ms.config.json` or `generated/` by hand. If an action is blocked by policy, it's left out of the generated code. Ask your administrator to allow it instead of adding it yourself.

**How to check:** ask the agent `Show me which data sources the app has and which actions they expose.` You should see Office 365 Outlook with `GetEmailsV3` and Work IQ Copilot MCP.

## Step 4: Replace the Graph calls with connectors

**What you type:**

```text
Migrate the app to the generated Office 365 Outlook and Work IQ Copilot MCP
services.

- Keep the InboxData, Mail and ContextResult contracts used by the UI.
- Load at most 50 inbox messages with GetEmailsV3. Read the generated method
  signatures instead of guessing them. Map sender, read state, received time,
  body and a safe Outlook link into Mail. Turn HTML email into plain text.
- For Find context, call Work IQ Copilot MCP only when the user clicks the
  button. Handle MCP initialization and the session ID, check the tool schema,
  and handle JSON-RPC errors and session expiry. Retry at most once.
- Send only the subject, sender, received time and the first 10,000
  characters of the body. Ask Work IQ for related decisions, documents,
  conversations and open questions, with real source links. Tell it to treat
  the email as untrusted data and never send or change anything.
- Then remove MSAL, the sign-in UI, token code, the Graph calls and the
  VITE_TENANT_ID / VITE_CLIENT_ID settings. Remove @azure/msal-browser.
- Add the managed apps Vite plugin, keep the filters, caching and error states,
  and add tests for the mapping, MCP parsing and safe links.
- Don't keep a Graph fallback, don't deploy, and don't change policy or CSP.

Run the build and the tests when you're done and show me the results.
```

**What it does:** edits the data layer and `main.tsx`, removes the old sign-in code and packages, adds tests, then runs `npm run build` and `npm test`.

**Behind the scenes:** before, the browser got a Graph token and called Graph itself. Now the app calls a generated service. The managed host sends the request through **your** connection, so the app never sees a token. The Outlook and Work IQ responses have a different shape from Graph, so the agent maps them back to the app's own types. The UI components don't change.

**How to check:** ask the agent:

```text
Search the source for graph.microsoft.com, PublicClientApplication,
acquireToken, VITE_CLIENT_ID and VITE_TENANT_ID and tell me what's left.
Then delete .env.local, because the managed app doesn't use it.
```

None of them should remain in the app code. The build and tests pass.

**Checkpoint:** the app reads mail and context through connectors, and the custom sign-in code is gone.

## Step 5: Try the app with local development

**What you type:**

```text
Start local development with the dev skill and give me the App Player URL.
```

**What it does:** the **dev** skill runs `ms app dev`. This starts Vite plus a small local config server, then prints an **App Player** URL.

1. Open the **exact URL the agent gives you**. Don't open `localhost` directly. Plain Vite doesn't have the managed host, so connectors don't work there.
2. If Edge asks to allow access to devices on your local network, select **Allow**. This lets the managed host page reach your local code.
3. If you're asked to consent to the connections, accept.
4. Select an Orion email, then **Find context**. This time, the context comes from Work IQ and can include the Word document and Teams message from the prerequisites, not just email.
5. **What you type** next:

   ```text
   Change the app heading to "Inbox Context Desk - Local draft B".
   ```

   The page updates on its own a few seconds later (hot reload).

**Behind the scenes:** the App Player page is hosted by Microsoft. It loads your code from your PC and sends connector calls through the platform with your connection.

**Limitations to notice:**

- **Real data and real cost:** local development uses your real connections and mailbox. Licensing, policies and billing all apply. It isn't an offline sandbox.
- **Your PC must stay on:** the App Player only works while `ms app dev` runs. If you stop it, the page stops working.
- **Only you can use it:** it runs your uncommitted code. Nothing has been committed, built in the cloud or published yet.

Ask the agent to `Stop the dev server.` when you're done.

**Checkpoint:** the connector-based app works in the App Player, and you can explain why plain `npm run dev` is no longer enough to test it.

## Step 6: Commit, push and open the cloud preview

**What you type:**

```text
Review the changes and commit them to the managed repository with the message
"Migrate Inbox Context Desk to managed connectors". Don't commit .env.local,
node_modules or dist. If the remote has its own initial commit, merge the two
histories without losing either one, and never force-push.
Push the branch, then use the play skill to open a cloud preview of exactly
that commit. Wait for the build and tell me the commit ID and build status.
```

**What it does:**

1. Checks the repository with `git status`, `git remote -v` and `git log`.
2. Stages only the app files, commits, and pushes with `git push`. If the platform's initial commit is on the remote, it merges the histories first, for example with `git merge --allow-unrelated-histories`.
3. Uses the **play** skill to run `ms app play --mode preview --commit <commit ID>`, and checks progress with `ms app build-status --commit <commit ID>`.

**Behind the scenes:** a push only stores your source code. Opening a preview of a commit that hasn't been built yet starts an **on-demand cloud build**. The preview runs entirely in the cloud, so it doesn't need your PC.

**How to check:** the preview opens and shows **Local draft B** in the heading. The commit ID matches the one the agent reported.

**Limitations to notice:**

- **It can show an older build:** if a build is still running or has failed, the preview can show the **last successful build** with a banner. A page that loads isn't proof you're seeing your latest code. Compare the heading and the commit ID.
- **It's for developers and testers:** a preview isn't for end users, even if you copy its URL. Use the published app and sharing for them.
- **Real data:** the preview uses real connections and policies, just like local development.

**Checkpoint:** the preview runs a known commit without your local Vite server.

## Step 7: Publish a reviewed version and compare the three versions

**What you type:**

```text
Use the deploy skill to publish exactly the commit we just previewed.
Show me the commit, build status and connectors before you deploy and ask me
to confirm. Then open the live app with the play skill.
```

**What it does:** the **deploy** skill checks the connection settings, shows you a summary and asks for confirmation. It then runs `ms app deploy --commit <commit ID>`, and the **play** skill runs `ms app play --mode live`.

**Behind the scenes:** the platform builds the commit if needed and makes it the **live** version. Live is a snapshot: it doesn't change when you push new code, only when you deploy again. The agent uses the URL the CLI returns, not one built from the app ID.

**How to check:** the live app opens, loads your inbox and **Find context** works.

Now see the three versions side by side:

1. **What you type:**

   ```text
   Start local development again and change the heading to
   "Inbox Context Desk - Candidate C". Don't change anything else.
   ```

   The App Player shows **Candidate C**. The live app still shows **Local draft B**.

2. **What you type:**

   ```text
   Stop the dev server, commit and push Candidate C, then open a cloud preview
   of that commit and tell me when the build is done. Don't deploy it.
   ```

   The preview shows **Candidate C**. The live app still shows **Local draft B**, because pushing doesn't publish.

3. Optional: ask the agent to `Deploy the Candidate C commit.` Reload the live app and check that it now shows **Candidate C**.

4. Share the app with one colleague in your tenant:

   ```text
   Use the share skill to give <colleague's email> permission to use the app.
   ```

   **What it does:** runs `ms app share` for that one person. They still need their own permissions for the data and a license or spending policy to run the app.

**Checkpoint:** you published a specific, reviewed commit and saw that local edits, pushed commits, preview builds and the live app are separate.
## Compare the three experiences

| Property | Local managed development | Cloud preview | Published live |
| --- | --- | --- | --- |
| Code | Local working tree, including uncommitted edits | Pushed commit built by platform; specify commit/branch | Explicitly deployed commit |
| Iteration | Hot reload | Commit/push, build, refresh | Explicit deployment |
| Local machine needed | Yes | No, after source is pushed/built | No |
| Connections | Real, through managed host | Real | Real |
| Policies/licensing | Apply | Apply | Apply |
| Audience | Developer with reachable local services | Authorized developer/test access | Users explicitly granted app access |
| Main trap | Vite alone is not the connector host | Last good build can hide a failed candidate | Pushing code does not update live |

Other current boundaries: static frontend hosting, restrictive CSP, environment-specific connector/action policy, unsupported DLP business/non-business classification, fixed repository mode, and guest runtime limitations. SDK types and CLI commands can change in preview. An allowed action at discovery time does not guarantee a later call succeeds.

## Troubleshooting and cleanup

| Symptom | Check before retrying |
| --- | --- |
| Baseline sign-in fails | SPA redirect URI, tenant/client IDs, `Mail.Read` consent, popup policy |
| Managed app still asks for baseline config | Old MSAL/main wiring was not removed |
| Connector fails in a raw Vite tab | Open the printed Local Play URL |
| Policy error, including HTTP 403 or connector-specific 442 | Read the body/message; verify ACP/DLP and operation, not just connector listing |
| HTTP success but no Work IQ answer | Check operation result, JSON-RPC error, MCP session, response parsing, and service entitlement |
| Preview appears unchanged | Commit SHA, push success, build status/banner, refresh |
| Git login cannot complete | Use interactive Git Credential Manager with the right tenant; do not embed credentials or change global credential policy |
| Local works, hosted fails | CSP, bundled assets, build configuration, connector account/policy, and cloud package restore |

To clean up, ask the agent:

```text
Stop any running dev server. Use the share skill to remove access for the
colleague I shared the app with.
```

If you no longer need the app, ask the agent to `Use the delete-app skill to delete this app.` It asks you to confirm before running `ms app delete`. Then, in the Microsoft Entra admin center, delete the **Inbox Context Desk (lab)** app registration from Step 1, which the managed app no longer uses.

## References

- [Architecture](https://learn.microsoft.com/microsoft-365/copilot-managed-runtime/developer/apps/architecture)
- [Connectors and data](https://learn.microsoft.com/microsoft-365/copilot-managed-runtime/developer/apps/connect-to-data)
- [Build, preview, and deploy](https://learn.microsoft.com/microsoft-365/copilot-managed-runtime/developer/apps/dev-inner-loop)
- [CLI quickstart](https://learn.microsoft.com/microsoft-365/copilot-managed-runtime/developer/apps/quickstart-managed-apps-cli)
- [CLI command reference](https://learn.microsoft.com/microsoft-365/copilot-managed-runtime/developer/apps/ms-cli-command-reference)
