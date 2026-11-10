# Sources and delivery readiness

This page records the evidence behind the first draft and the remaining work before a facilitated delivery. It is not a claim that the lab has been run end to end.

## References inspected

| Source | Used for |
| --- | --- |
| Existing `microsoft/agent365-labs` README and Copilot Studio lab | Scenario/objectives, prerequisites, steps, checkpoints, and prompt/change/verification structure |
| Author-provided **FY27 Agentic Bootcamp - Day 3**, slides 39-68, read in PowerPoint Online | Build/govern/extend/port narrative; Code versus GitHub Copilot; API migration; preview and governance talking points |
| Author's Daily Meeting Briefing, read-only repository inspection | Day navigation/timeline, six briefing sections, Work IQ integration |
| New Daily Meeting Briefing built in Code (Diamond tenant, November 9, 2026) | Code landing, prompt, build progress, preview, connections dialog, publish toast and published-app consent screenshots |
| Author's Inbox Context Desk local source | Outlook `GetEmailsV3`, Work IQ `mcp_m365copilot`, MCP session/result handling, App Player integration, prior DLP failure note |
| Installed `ms` CLI 0.31.1 help | `init`, connector discovery/binding, `dev`, `play --mode preview --commit`, settings, deployment syntax |
| Read-only connector discovery in the demo environment | `GetEmailsV3` and `mcp_m365copilot` reported **Allow** on November 9, 2026 |
| Current Microsoft Learn pages linked below | Supported hosting and repository boundaries, billing, action policy, CSP, and local/preview/live semantics |

The deck is an internal reference, not a learner prerequisite or a redistributed asset. No deck copy, tenant binding, connection metadata, or real mailbox content is included in this lab folder.

## Deliberate teaching choices

- **Start from scratch in Code:** Exercise 1 assumes no earlier app. Learners go straight to the Code tab with a single prompt.
- **Read-only:** The app has no email-sending action, so the exercise needs no send permission or real outbound message.
- **Explicit briefing generation:** The reference implementation can fetch briefing data when a meeting is selected. The lab asks for an explicit button to make disclosure and metered requests easier to teach.
- **API-first means actual API access:** The pro-code starter uses delegated Graph calls and an approved SPA registration, not local mock REST endpoints. It contains no tenant-specific defaults.
- **Context is not equivalent before/after:** The baseline finds related email by subject. Work IQ adds generated, permission-bound organizational context during migration.
- **Pin the deployment commit:** Installed CLI help and prose documentation differ in descriptions of default deployment selection. An explicit reviewed SHA avoids teaching an ambiguous default.
- **No tenant-wide policy experiment:** Governance changes require approval and an isolated training scope. Do not disable DLP/CSP, force-push, or take ownership of Microsoft's curated default policy merely to finish the exercise.

## Verification state

| Item | State |
| --- | --- |
| Presentation read | Slides 39-68 inspected through the live online document |
| Reference app calendar | Rendered real connector-backed synthetic training appointments in the managed host |
| Reference app Work IQ briefing | Request observed in the searching state; no successful source-grounded result established in this walkthrough |
| Outlook and Work IQ discovery | Both required operations reported Allow; this does not prove runtime success |
| Code availability | Code tab, New session and Create anything composer visible in the Diamond demo tenant |
| New Code app creation/publishing | Executed November 9, 2026 with the Exercise 1 prompt: build took about 15 minutes, connectors bound automatically, preview rendered calendar data, **Publish** succeeded with one click (no dialog), and the published app at `play.preview.managedapps.cloud.microsoft` showed the per-user connection consent dialog. Consent was not accepted by automation. Briefing returned "nothing relevant" because training content was not indexed in that tenant. The app was not shared. |
| Setup script | `scripts/Install-Prerequisites.ps1 -CheckOnly` reported all tools ready in Windows PowerShell 5.1 and PowerShell 7 |
| Governance/billing exercises | Spending-policy wizard and environment-group paths taken from Microsoft Learn; no policy, budget, sharing, or billing changes executed |
| New API starter | Dependency restore, TypeScript/Vite build, and eight synthetic-response tests completed |
| Starter browser behavior | Missing-config error, reader/context flow, refresh/sign-out clearing, inert email HTML, and unsafe-link rejection checked with explicitly synthetic injected services, not live Graph |
| API starter sign-in/live Graph | Requires a separately approved SPA registration and learner mailbox; not established by unit tests |
| Full API-to-connector migration and publish | Learner workflow documented; fresh-app end-to-end rehearsal pending |

The earlier Inbox Context Desk README records an Outlook runtime failure: HTTP 442 with a DLP block. Current discovery reports Allow, so this draft does **not** assert that the historical block is still present or has been resolved. Recheck a real learner request.

## Before teaching

1. Rehearse named-user sharing and capture the Share dialog. Confirm the exact permission labels used in Exercise 1, Step 6.
2. Confirm Code's build billing and enablement. Public documentation covers running managed apps but not the cost of building them in Code.
3. Use the Exercise 2 app registration to verify popup sign-in, `Mail.Read`, inbox loading, subject search, and sign-out.
4. Run the migration prompts in a fresh standalone working copy. Verify generated signatures, MCP tool schema/session handling, actual Work IQ evidence, and cloud package restore.
5. Demonstrate B locally/preview/live and C only locally/preview until explicit deployment. Verify build banners, version markers, commit IDs, and recipient access.
6. Rehearse approved policy changes with a training-only scope, including restoration and propagation time.
7. Capture sanitized managed dev, preview build banner, and administrator screenshots (billing wizard, environment group). Do not fabricate screenshots for unverified steps or expose accounts, billing details, tokens, or work data.

## Microsoft Learn sources

Retrieved November 9, 2026. Recheck for preview changes before delivery.

- [Admin overview and key concepts](https://learn.microsoft.com/microsoft-365/admin/manage/apps/)
- [Default governance and roles](https://learn.microsoft.com/microsoft-365/admin/manage/apps/governance)
- [Licensing FAQ and metered activities](https://learn.microsoft.com/microsoft-365/admin/manage/apps/licensing-faq)
- [SDK overview and prerequisites](https://learn.microsoft.com/microsoft-365/copilot-managed-runtime/developer/apps/)
- [Architecture and generated-file ownership](https://learn.microsoft.com/microsoft-365/copilot-managed-runtime/developer/apps/architecture)
- [Connector discovery, consent, and policy](https://learn.microsoft.com/microsoft-365/copilot-managed-runtime/developer/apps/connect-to-data)
- [Local, build, preview, and live behavior](https://learn.microsoft.com/microsoft-365/copilot-managed-runtime/developer/apps/dev-inner-loop)
- [CLI quickstart and local network access](https://learn.microsoft.com/microsoft-365/copilot-managed-runtime/developer/apps/quickstart-managed-apps-cli)
- [GitHub Copilot and plugin setup](https://learn.microsoft.com/microsoft-365/copilot-managed-runtime/developer/apps/quickstart-github-copilot)

## No-code walkthrough video

`docs/videos/no-code-walkthrough.mp4` is rendered from the HyperFrames project in `video/no-code/` (`index.html`, brief in `SPEC.md`, voice text in `narration.json`).

1. Voice: Azure Speech in the Foundry project `agent365-labs` (Entra token only, local auth is disabled). Use the resource endpoint `https://<resource>.cognitiveservices.azure.com/tts/cognitiveservices/v1`, voice `en-US-AndrewMultilingualNeural`, prosody rate -4%, output `riff-24khz-16bit-mono-pcm`. Save the clips as `assets/voice/s01-hook.wav` … `s11-close.wav`. If a clip's length changes, update the scene starts `S` in `index.html`.
2. Put FFmpeg on `PATH`, then run `npx hyperframes check`, `npx hyperframes snapshot` and `npx hyperframes render` from `video/no-code/`.
3. Copy the render from `video/no-code/renders/` to `docs/videos/no-code-walkthrough.mp4`.

The video is voice-only (no music or sound effects). Screenshots come from `docs/images/`; re-render if they change.

## Billing policy video

`docs/videos/billing-policy-setup.mp4` is rendered from `video/billing/`. Edit `index.template.tpl` and `narration.json`, never `index.html` directly.

1. Screenshots come from the Microsoft 365 admin center at a 1600×900 viewport. The originals stay in `video/billing/raw/` (git-ignored). The copies in `assets/shots/` have the Azure subscription name and ID painted over. Re-apply the mask if you recapture.
2. Generate the voice clips into `assets/voice/` with the same Azure Speech settings as the no-code video.
3. Run `python build.py`. It reads the WAV lengths, computes the scene starts and writes `index.html`.
4. Run `npx hyperframes check`, `snapshot` and `render`, then copy the render to `docs/videos/billing-policy-setup.mp4`.

Capturing the screenshots created a real policy, **Managed apps lab**, in the authoring tenant. Delete it after a recapture. The video is voice-only.


## Admin controls video

`docs/videos/admin-controls.mp4` is rendered from `video/admin/` with the same pipeline as the billing video (edit `index.template.tpl` and `narration.json`, then `python build.py`, `check`, `snapshot`, `render`).

1. The screenshots were captured read-only at a 1600×900 viewport: every panel was closed with **Cancel** or **Close**, and nothing was saved. The originals are in `video/admin/raw/` (git-ignored).
2. Shots used: App settings, Environment groups, Default Environment Group rules, Control data sources for apps, Office 365 Outlook selected, Edit actions list, Connector catalog, Sharing, Content security policy, All apps, and the app's Connectors tab.
3. The app **Details** tab (`raw/a14.png`) was skipped because it shows the owner and app IDs. Routing and Usage were captured but not used.
4. The video is voice-only.
