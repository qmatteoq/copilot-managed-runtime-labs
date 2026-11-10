# Copilot Managed Runtime labs

Two hands-on exercises take an internal application from an idea to a governed, published app. Follow either path independently, or complete both to compare business-user and developer experiences.

| Exercise | Scenario | Videos | Estimated time |
| --- | --- | --- | --- |
| [1. No-code](docs/01-no-code.md) | Build **Daily Meeting Briefing** in the **Code** tab of the Copilot app, publish it, and practise the administrator controls for billing, connectors and sharing | [Build and publish the app](docs/videos/no-code-walkthrough.mp4) (1.5 min, steps 1-6)<br>[Set up a billing policy](docs/videos/billing-policy-setup.mp4) (2 min, step 7a)<br>[App controls for connectors and policies](docs/videos/admin-controls.mp4) (3 min, steps 7b-7c) | 75-90 minutes |
| [2. Pro-code](docs/02-pro-code.md) | Register and run **Inbox Context Desk**, a standard Microsoft Graph app, then use a coding agent (VS Code, the GitHub Copilot app or GitHub Copilot CLI) to replace its direct API calls with connectors and compare local development, cloud preview, and live deployment | None yet | 120-150 minutes |

Each video is also linked as **Watch first** at the start of the matching step in the exercise.

Start with [prerequisites](docs/00-prerequisites.md). Everyone prepares training data in Microsoft 365. Pro-code learners also run [`scripts/Install-Prerequisites.ps1`](scripts/Install-Prerequisites.ps1), which installs Node.js, Git, Visual Studio Code, GitHub Copilot CLI and the managed apps CLI. The pro-code exercise includes a runnable [API-first React/TypeScript starter](samples/inbox-context-desk/README.md), not a copy of an already-bound managed app.

## What you learn

Both paths converge on the same runtime: Microsoft-managed hosting, Entra sign-in, governed connector access, Git-backed versioning, and administrator visibility. **No-code describes how you author the app, not the absence of generated code.** These are applications, not Agent 365 registrations or Copilot Studio conversational agents.

The exercises follow the Agent 365 labs' scenario, objectives, step, and checkpoint structure. The pro-code prompts explain what to ask GitHub Copilot, what changes, what happens behind the scenes, and how to verify the result.

## Preview status

This is a **first lab draft**, grounded in the author's Daily Meeting Briefing app, Inbox Context Desk sample, slides 39-68 of the FY27 Agentic Bootcamp Day 3 deck, installed CLI help, and current Microsoft Learn documentation. See [source and verification notes](docs/authoring-notes.md) for what was inspected and what still needs a tenant walkthrough before teaching.

Do not treat a successful local build or connector discovery as proof that live data access, publishing, billing, or administrator policy changes have been rehearsed. Screenshots are included only when captured from an actual product surface; no generated portal mockups are used.

The product is in preview. Confirm feature availability, licensing, CLI syntax, and policies before each delivery. These labs are not a production-readiness endorsement or official product documentation.
