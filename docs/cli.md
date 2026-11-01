# The `omux` command

Every session omux starts has an `omux` command on its PATH. Programs in the session, Claude Code and Codex included, use it to see the other sessions of the project and to start sessions of their own.

```
omux list                          sessions of this project, with their state
omux status [session]              one session's state (default: this one)
omux screen [session] [-n LINES]   the last lines on a session's screen (default 40, max 500)
omux send SESSION TEXT… [--submit] type text into a session you started; --submit presses Return
omux send SESSION - [--submit]     the text comes from stdin
omux new [--name NAME] [--dir DIR] [--provider claude|codex|shell]
                                   start a session in this project; prints its id
omux close SESSION                 close a session you started
omux wait [session] [--for STATE,…] [--timeout SECONDS]
                                   block until the session reaches one of the states
omux --json …                      machine-readable output
```

A session is addressed by its id or its exact name. States are the agent's `idle`, `working`, `done`, `blocked` and `error`, plus `running` for a shell with no agent status and `stopped` for a session nothing runs in. `wait` defaults to `blocked,done,error,stopped` and a timeout of 600 seconds.

An agent that wants a helper, for example:

```sh
id=$(omux new --name "Tests" --provider claude --json | jq -r .session.id)
omux send "$id" "Run the test suite and fix what fails. Don't touch files outside tests/." --submit
omux wait "$id"
omux screen "$id" -n 60
```

## What a session may do

- **Read** every session of its own project: list them, read their state, read their screens.
- **Start** sessions in its own project, inside the project's folder. Claude Code, Codex or a plain shell. Never a custom command.
- **Send text to and close** only the sessions it started itself, and itself. It cannot type into a session you are driving, or into a sibling another session started.
- Nothing outside its project.

Each of these shows up as a banner in omux: "API → Tests: Run the test suite…", "API started Tests", "API closed Tests".

## How it is secured

- The tool is only on the PATH of sessions omux starts. It isn't installed anywhere else.
- The app listens on a Unix socket in a folder only your user can open, created with mode 0600 inside a 0700 folder under your private temporary directory. The path changes every launch.
- Every connection is checked to come from your user id.
- Every request carries a token that is generated at launch and reaches programs only through the environment of sessions omux starts. A program that isn't in such a session has no token.
- Requests are one line of JSON, read within two seconds and one megabyte, answered with one line of JSON. Nothing is executed on the app side: the request names a session and an action, and the app does the same thing it would for a click.
- Text sent to a session goes through the same paste path as ⌘V, so escape sequences in it can't end the paste early.
- Settings › Sessions › "Give sessions the omux command" turns it off. Sessions started after that get no tool, no token and no socket, and the app refuses every request.

Scope is per launch. Sessions restored after a relaunch aren't anyone's children any more, so nothing can send text to them until a session starts a new one.
