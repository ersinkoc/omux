# Claude Code and Codex session management

## Goal

Run Claude Code and Codex sessions side by side without losing conversation identity,
worktree isolation, or the existing terminal interface.

## Decisions

- Keep SwiftTerm, the sidebar, Git/worktree actions, Files, Changes, and Browser.
- Separate provider identity and launch/resume behavior from terminal lifecycle.
- Preserve saved Claude UUIDs and existing custom commands when loading old workspaces.
- Use Codex's app-server protocol for thread identity, status, approvals, history,
  and usage. Each terminal and its native client share a private per-terminal server.
- Never use `--last` to identify an Omux session. Never stop a shared external daemon.
- Keep approval decisions associated with their request and thread IDs. Do not
  translate Codex approvals into Claude's Return/Escape keystrokes.
- Treat the app-server transport as experimental; validate the installed CLI's
  capabilities and report connection failures without starting a different chat.

## Ordered increments

### 1. Prove the connection

- [x] Initialize two clients against an isolated local Codex app-server.
- [x] Create a thread and rejoin the same ID from a second client.
- [x] Establish how the TUI and native client share events and approvals.
- Verification: local protocol probe; no model turn required for identity checks.

### 2. Select and resume providers

Depends on 1.

- [x] Select Claude Code, Codex, Shell, or a custom command in session/project settings.
- [x] Persist Codex's assigned thread ID separately from the Claude conversation ID.
- [x] Start/restart/play use the selected provider and exact conversation.
- [x] Old workspaces retain their existing commands and Claude IDs.
- Verification: migration/launch tests and Swift build.

### 3. Connect live management

Depends on 2.

- [x] Map Codex working, idle, approval, user-input, and error states to Omux.
- [x] Route Allow/Deny by request ID; invalidate resolved or disconnected requests.
- [x] Interrupt only the selected thread; handle close/quit without stopping foreign work.
- Verification: protocol fixtures, lifecycle tests, and local connection checks.

### 4. History and limits

Depends on 3.

- [x] Show recent Claude and Codex conversations with provider labels.
- [x] Reopen a Codex conversation by its saved ID.
- [x] Show Codex usage for Codex sessions without displaying Claude quota as Codex quota.
- Verification: decoding/pagination tests, build, and UI inspection.

### 5. Subagents and release checks

Depends on 3 and 4.

- [x] Show Codex child threads and their transcripts through the protocol.
- [x] Make review-note and browser-pick copy provider-aware.
- [x] Verify two Codex sessions in one directory retain distinct IDs across restart.
- [ ] Manually verify mixed Claude/Codex sessions, worktree creation, and native UI controls.
- [ ] Exercise live Codex subagents and account quota with a real signed-in provider.
- [x] Document supported CLI version, experimental surfaces, and any unverified behavior.
- Verification: focused tests, full build, diff check, and manual smoke checks where available.

## Scope

The unrelated browser message-validation and release-script findings remain separate.
Do not install over `/Applications/omux.app` during development verification.

## Status

Initial implementation is in place on top of upstream `eff67ea`.

- `env OMUX_CODEX_INTEGRATION=1 swift test`: 15 tests pass, including the installed
  Codex CLI, two distinct conversations across restart, and independent server shutdown.
- `swift build -c release`: passed without installing the application.
- `build/omux.app`: assembled locally; ad-hoc signature passes `codesign --verify --strict`.
- `node scripts/codex-protocol-smoke.mjs`: passes with Codex CLI 0.165.0 and a local
  fake Responses provider. Covers two authenticated clients, Allow, Deny, resolution
  in the other client, interruption, persisted command output, and the real TUI.
- The test model is local; no real inference request, account quota request, or user
  conversation is used. Sparse quota and child-approval behavior use protocol fixtures.
- Codex permits only one writing server per conversation. Restart waits for the
  old server to stop; resuming a chat active in another server reports an error.
- Other Codex permission forms, MCP interactions, and questions remain in the TUI.
- Child previews show the latest 100 protocol items.
- Native UI inspection was attempted with a disposable `omux Review` app and workspace.
  Computer Use rejected app access with `Computer Use was not approved to use omux Review`.
  Visual checks and a live mixed-provider/worktree smoke test remain pending.
- No application was installed over `/Applications/omux.app`; no commit or push was made.
