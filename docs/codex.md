# Codex sessions

Select **Codex** in a project's settings to make it the default, or use **File › New Codex Session**. Session settings can override the project. Codex uses its existing CLI login and configuration; omux does not implement a separate login or read its credentials.

Each Codex terminal and omux's management client connect to the same private local app-server. Each terminal has its own server, so closing it does not stop an external Codex daemon or another terminal's server. Servers require a random bearer token kept in memory and passed to the TUI through its environment. No token is saved in `workspace.json`.

Codex permits one writing app-server per conversation. A conversation currently running in another app-server must be closed there before opening it in omux; omux reports the failure and keeps the saved ID. Restart waits for its previous server to exit before reopening the conversation.

Codex subagents appear in the sidebar/header. Their preview shows up to 100 recent protocol items. Review notes and browser picks are pasted into the selected session's prompt. Managed sessions use the Codex provider selection; custom wrappers remain terminal commands.

## Requirements

- Codex CLI **0.165.0 or later** installed as `codex`. Tested with 0.166.0; the app-server integration is experimental on the Codex side.

## Checks

```sh
swift test
OMUX_CODEX_INTEGRATION=1 swift test
node scripts/codex-protocol-smoke.mjs
```

The opt-in Swift test starts the installed CLI with a temporary Codex home and tests exact thread IDs across server restarts. The Node 22+ smoke test uses a local fake model and real Codex CLI/TUI to check shared approvals, Allow, Deny, interruption, transcript items, and completion. Neither check sends a prompt to a real model or reads your saved conversations.
