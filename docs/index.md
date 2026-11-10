# Copilot Managed Runtime Labs

Hands-on labs that take an internal application from an idea to a governed app published on the **Copilot Managed Runtime**. Follow either path on its own, or complete both to compare the business-user and developer experiences.

Both paths end on the same runtime: Microsoft-managed hosting, Entra sign-in, governed connector access, Git-backed versioning, and administrator visibility. **No-code describes how you author the app, not the absence of generated code.** These are applications, not Agent 365 registrations or Copilot Studio conversational agents.

## Start here

<div class="cc-cards">
<cc-card-grid>
  <cc-card
    title="Prerequisites"
    description="Training data, licences and tools. Pro-code learners also run the setup script. Work through this page first."
    href="00-prerequisites/"
    target="_self">
  </cc-card>
  <cc-card
    title="Exercise 1 — No-code"
    description="Build Daily Meeting Briefing in the Code tab of the Copilot app, publish it and practise the admin controls. 75-90 minutes, beginner."
    href="01-no-code/"
    target="_self">
  </cc-card>
  <cc-card
    title="Exercise 2 — Pro-code"
    description="Use a coding agent to move Inbox Context Desk from direct Microsoft Graph calls to managed connectors, then publish it. 120-150 minutes."
    href="02-pro-code/"
    target="_self">
  </cc-card>
</cc-card-grid>
</div>

## Exercises

| Exercise | Scenario | Estimated time |
| --- | --- | --- |
| [1. No-code](01-no-code.md) | Build **Daily Meeting Briefing** in the **Code** tab of the Copilot app, publish it, and practise the administrator controls for billing, connectors and sharing | 75-90 minutes |
| [2. Pro-code](02-pro-code.md) | Register and run **Inbox Context Desk**, a standard Microsoft Graph app, then use a coding agent (VS Code, the GitHub Copilot app or GitHub Copilot CLI) to replace its direct API calls with connectors and compare local development, cloud preview, and live deployment | 120-150 minutes |

## Videos

Narrated, voice-only walkthroughs for Exercise 1. Each one is also linked at the start of the step it covers.

| Video | Covers | Length |
| --- | --- | --- |
| [Build and publish the app](videos/no-code-walkthrough.mp4) | Steps 1-6 | 1.5 minutes |
| [Set up a billing policy](videos/billing-policy-setup.mp4) | Step 7a | 2 minutes |
| [App controls for connectors and policies](videos/admin-controls.mp4) | Steps 7b and 7c | 3 minutes |

!!! warning "Preview"
    The Copilot Managed Runtime is in preview. Confirm feature availability, licensing, CLI syntax and policies before each delivery. These labs are not a production-readiness endorsement or official product documentation.
