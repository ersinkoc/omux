#!/usr/bin/env python3
"""Builds the comparison pages (site/<slug>.html), sitemap.xml and robots.txt.

Run after editing the data below: python3 scripts/build-pages.py
Facts about other tools come from their own READMEs and sites; keep them fair and current.
"""
import html, json, pathlib, datetime

root = pathlib.Path(__file__).resolve().parent.parent
site = root / "site"
BASE = "https://omux.app"
TODAY = datetime.date.today().isoformat()

OMUX_FEATURES = [
    ("Projects with sessions under them, in a sidebar", "yes"),
    ("Shows whether each agent is working, needs you or is done", "yes"),
    ("Allow or Deny an agent's permission request without switching to it", "yes"),
    ("Lists a session's subagents and opens their transcripts", "yes"),
    ("Resumes each Claude Code and Codex conversation after a relaunch", "yes"),
    ("Git worktree per session, with pull request status and merge", "yes"),
    ("Files, Changes (diff with review notes) and Browser panels", "yes"),
    ("Claude and Codex plan usage limits in the sidebar", "yes"),
    ("macOS notifications with sound", "yes"),
]

PAGES = [
    {
        "slug": "tmux-alternative",
        "other": "tmux",
        "other_url": "https://github.com/tmux/tmux",
        "title": "omux vs tmux: a native macOS alternative for Claude Code and Codex sessions",
        "meta": "Looking for a tmux alternative for running many Claude Code or Codex sessions? omux is a native macOS app with projects, live agent status, Allow/Deny from the sidebar, worktrees and resumable conversations. Honest comparison.",
        "h1": "A tmux alternative for running many coding agents",
        "intro": [
            "tmux is the tool most people reach for when they run several Claude Code or Codex sessions at once: one window per project, split panes, detach and come back later. It works, and it works everywhere.",
            "omux takes a different approach. It's a native macOS app built for exactly this job, so instead of remembering which pane holds which agent, you get a sidebar of projects and sessions that shows which agent is working, which one is waiting on you, and buttons to answer it. This page is a fair look at where each one fits.",
        ],
        "rows": [
            ("Runs on", "macOS only", "macOS, Linux, BSD, anywhere with a terminal"),
            ("Interface", "Native macOS window with a sidebar and panels", "Keyboard-driven, inside any terminal"),
            ("Knows what the agent is doing", "Yes: status from Claude Code's and Codex's own signals, no screen scraping", "No: a pane is a pane"),
            ("Answer a permission prompt", "Allow and Deny buttons under the session, without switching to it", "Switch to the pane and type"),
            ("Subagents", "Listed under the session, transcripts in the side panel", "Not visible unless the agent prints them"),
            ("Conversations after a restart", "Each session resumes its exact Claude or Codex conversation", "Sessions are gone when the server stops, unless you add a resurrect plugin and resume by hand"),
            ("Git worktrees and pull requests", "One worktree per session, PR status in the sidebar, merge and clean up", "Manual"),
            ("Diff, files and browser next to the agent", "Built-in panels", "Other tools in other panes"),
            ("Split panes", "No", "Yes, any layout"),
            ("Detach and reattach", "No: sessions live as long as the app runs", "Yes, the server keeps running"),
            ("Remote machines over SSH", "No", "Yes, tmux runs on the remote end"),
            ("Scripting", "No", "Full CLI, scriptable"),
            ("Price and license", "Free, MIT", "Free, ISC"),
        ],
        "better_other": [
            "You work on Linux, over SSH, or on a remote box: tmux runs where the shell runs.",
            "You rely on detach and reattach, or on custom pane layouts and keybindings.",
            "You script your sessions, or drive them from other tools.",
        ],
        "better_omux": [
            "You run several Claude Code or Codex sessions on a Mac and want to see at a glance which one needs you.",
            "You'd rather click Allow than hunt for the pane that's asking.",
            "You want each session's conversation back after a restart, its own worktree, and the diff and files beside it, without setting any of that up.",
        ],
        "faq": [
            ("Can I use omux and tmux together?", "Yes. A plain shell session in omux is a normal login shell, so you can run tmux inside it. omux's agent-aware features apply to sessions that run Claude Code or Codex directly."),
            ("Does omux replace tmux for remote work?", "No. omux runs sessions on your Mac only. For agents on remote machines, tmux or a tool like herdr is the better fit."),
            ("Does omux need Claude Code or Codex to be installed?", "For agent sessions, yes: Claude Code as claude, and optionally the Codex CLI as codex. Plain shell sessions work without either."),
        ],
    },
    {
        "slug": "cmux-alternative",
        "other": "cmux",
        "other_url": "https://github.com/manaflow-ai/cmux",
        "title": "omux vs cmux: two native macOS terminals for coding agents, compared",
        "meta": "omux and cmux are both native macOS terminals for AI coding agents. cmux is a Ghostty-based terminal with splits, SSH and a scripting API; omux is built around Claude Code and Codex sessions with status, Allow/Deny, subagents, worktrees and resumable conversations. Honest comparison.",
        "h1": "A cmux alternative built around Claude Code and Codex",
        "intro": [
            "cmux and omux want the same thing: a Mac terminal that makes running many coding agents bearable. Both are native Swift apps, both are free and open source, and both light up when an agent needs you.",
            "They differ in what they're built around. cmux is a general terminal, rendered by libghostty, with workspaces, split panes, SSH, an in-app browser with an automation API, and a CLI and socket API that scripts can drive. omux is narrower on purpose: it's a session manager for Claude Code and Codex, and it reads their own signals to show status, permissions, subagents and usage limits.",
        ],
        "rows": [
            ("Runs on", "macOS", "macOS"),
            ("Built with", "SwiftUI and SwiftTerm", "Swift and AppKit on libghostty; reads your Ghostty config"),
            ("Organizing work", "Projects, each with sessions; optional worktree per session", "Workspaces with vertical tabs showing branch, directory, ports and PR status"),
            ("Agent needs attention", "Status from Claude Code's and Codex's own protocols: working, needs you, done, and what it's doing", "Notification rings and a notification panel, fed by OSC 9/99/777 and the cmux notify CLI"),
            ("Answer a permission prompt", "Allow and Deny buttons in the sidebar and header; Codex approvals show the command", "Jump to the pane"),
            ("Subagents", "Listed per session with transcripts; Codex child agents too", "Claude Code Teams mode, teammates as native splits"),
            ("Conversations after a restart", "Each session resumes its exact Claude or Codex conversation", "Layout, directories and saved session ids restored; supported agents resume"),
            ("Pull requests", "PR status per worktree session, create, merge, clean up", "PR status shown in the sidebar"),
            ("Side panels", "Files, Changes (diff with review notes sent to the agent) and Browser", "In-app browser with a scriptable automation API"),
            ("Usage limits", "Claude and Codex plan limits in the sidebar", "No"),
            ("Split panes", "No", "Yes, right and down"),
            ("Remote machines over SSH", "No", "Yes, cmux ssh"),
            ("Scripting", "No", "CLI and Unix socket API"),
            ("Updates", "In-app, signed, notarized", "In-app via Sparkle, DMG and Homebrew"),
            ("License", "MIT", "GPL-3.0 for the app"),
        ],
        "better_other": [
            "You want split panes, SSH workspaces, or a terminal you can script from the outside.",
            "You already use Ghostty and want its rendering and config.",
            "You run agents beyond Claude Code and Codex and want them all treated the same way.",
        ],
        "better_omux": [
            "Your sessions are Claude Code and Codex, and you want status, permissions and subagents read from the agents themselves rather than from notifications.",
            "You want a worktree per session with the pull request's state, the diff and review notes right there.",
            "You like a smaller, MIT-licensed app with no scripting surface to think about.",
        ],
        "faq": [
            ("Which is more mature?", "cmux has a broader feature set and a larger community. omux is newer and focused; check both changelogs and pick the one whose direction matches how you work."),
            ("Can omux read Ghostty themes?", "No. omux has its own themes and font settings. cmux reads your Ghostty configuration."),
            ("Does omux have a CLI?", "Not beyond open -a omux <folder>. If you need to script your terminal, cmux is the better fit today."),
        ],
    },
    {
        "slug": "warp-alternative",
        "other": "Warp",
        "other_url": "https://www.warp.dev",
        "title": "omux vs Warp: a free, local alternative for running Claude Code and Codex",
        "meta": "Warp is an AI terminal and agent platform with its own agent, cloud runs and usage-based pricing. omux is a free native macOS app that hosts the Claude Code and Codex sessions you already pay for, with no account, no credits and no telemetry. Honest comparison.",
        "h1": "A Warp alternative that just runs your own agents",
        "intro": [
            "Warp has grown from a modern terminal into an agent platform: its own coding agent, cloud agents triggered from issues and Slack, factories defined as code, and pricing per agent run. If you want that whole stack, Warp is the product for it.",
            "omux is the opposite shape. It doesn't bring an agent, a cloud or a login. It's a native macOS window that runs the Claude Code and Codex sessions you already have, many at a time, and makes them easy to watch and answer. This page is for people deciding between those two shapes.",
        ],
        "rows": [
            ("What it is", "A session manager for Claude Code and Codex", "A terminal plus an agent platform with its own agent and cloud runs"),
            ("Runs on", "macOS", "macOS, Linux, Windows"),
            ("Account required", "No", "Sign-in for AI features"),
            ("Pricing", "Free, MIT; you pay only your Claude or Codex plan", "Usage-based, priced per agent run; free tier with limits"),
            ("Whose agent", "Yours: Claude Code and Codex as installed, with their own logins", "Warp's agent, plus bring-your-own agents such as Claude Code and Codex"),
            ("Agent status and permissions", "Working, needs you, done; Allow and Deny from the sidebar; subagents listed", "Agent UI inside Warp; third-party CLI agents run as programs in the terminal"),
            ("Conversations after a restart", "Each session resumes its exact conversation", "Warp's own agent sessions persist; CLI agents depend on the agent"),
            ("Git worktrees and pull requests", "One worktree per session, PR status, merge and clean up", "Not a worktree manager"),
            ("Cloud and background agents", "No", "Yes: cloud runs, triggers from Slack, Linear and GitHub, factories"),
            ("Telemetry", "None", "Yes, with settings"),
            ("Terminal features", "Basic: one terminal per session", "Rich: blocks, completions, command search, split panes"),
        ],
        "better_other": [
            "You want an AI terminal with completions, blocks and an agent of its own, on any platform.",
            "You want agents that run in the cloud, kick off from issues or chat, and produce pull requests while you sleep.",
            "Your team wants one managed, billed platform rather than individual subscriptions.",
        ],
        "better_omux": [
            "You already pay for Claude Code or Codex and want a calm place to run many sessions of them on your Mac.",
            "You don't want another account, credit balance or telemetry.",
            "You care about seeing which session needs you and answering it in one click, with the diff and files beside it.",
        ],
        "faq": [
            ("Does omux include an AI agent?", "No. It runs Claude Code and Codex, which you install and sign in to yourself. omux never sees your prompts or your API keys."),
            ("Can omux run agents in the cloud?", "No. Sessions run on your Mac. For cloud or scheduled agents, Warp and similar platforms are built for that."),
            ("Is omux really free?", "Yes. It's MIT-licensed and the app has no paid tier. Your only cost is the Claude or Codex plan you use with it."),
        ],
    },
    {
        "slug": "herdr-alternative",
        "other": "herdr",
        "other_url": "https://github.com/ogulcancelik/herdr",
        "title": "omux vs herdr: a native Mac app versus a terminal multiplexer for coding agents",
        "meta": "herdr is a cross-platform terminal multiplexer for coding agents, a single Rust binary with working/blocked/idle status, detach and a socket API. omux is a native macOS app for Claude Code and Codex sessions with Allow/Deny, subagents, worktrees and resumable conversations. Honest comparison.",
        "h1": "A herdr alternative with a native macOS interface",
        "intro": [
            "herdr is a terminal multiplexer made for coding agents: one Rust binary, a background server that keeps terminals alive, panes marked working, blocked or idle, and a socket API that lets agents spawn and wait on each other. It runs in whatever terminal you already use, on several machines at once.",
            "omux solves the same visibility problem with a window instead of a TUI. It's macOS only and has no server or API, but it shows status, permissions, subagents, diffs and pull requests for Claude Code and Codex sessions in a sidebar and panels you click. Which one fits depends on where your agents run and how you like to look at them.",
        ],
        "rows": [
            ("Runs on", "macOS, as a native app", "macOS, Linux and Windows, inside any terminal"),
            ("Interface", "Sidebar, session header and side panels", "Terminal UI with keyboard and mouse"),
            ("Agents supported", "Claude Code and Codex, with provider-specific integration; plain shells too", "Claude Code, Codex, Cursor, OpenCode, Grok and others"),
            ("Agent status", "Working, needs you, done, plus what it's doing and its subagents", "Working, blocked or idle per pane"),
            ("Answer a permission prompt", "Allow and Deny buttons without switching", "Switch to the pane"),
            ("Conversations after a restart", "Each session resumes its exact conversation", "Layouts restored; supported agent sessions resume"),
            ("Detach and reattach", "No", "Yes, terminals persist in a background server"),
            ("Remote machines", "No", "Yes, local and SSH machines in one list"),
            ("Agents controlling the multiplexer", "No", "Yes, CLI and socket API; agents can spawn panes and wait on each other"),
            ("Git worktrees and pull requests", "One worktree per session, PR status, merge and clean up", "Not built in"),
            ("Diff, files and browser", "Built-in panels, review notes sent to the agent", "Other tools"),
            ("Usage limits", "Claude and Codex plan limits in the sidebar", "No"),
            ("License", "MIT", "Apache-2.0"),
        ],
        "better_other": [
            "Your agents run on Linux or remote machines, or you need to detach and reattach.",
            "You want agents to orchestrate each other through an API.",
            "You run a mix of agent CLIs beyond Claude Code and Codex.",
        ],
        "better_omux": [
            "You work on a Mac and prefer a window with a sidebar, notifications and panels to a TUI.",
            "You want Allow and Deny buttons, subagent transcripts and the diff next to the session.",
            "You want worktrees and pull request status handled for you.",
        ],
        "faq": [
            ("Can I run herdr inside omux?", "Yes, in a plain shell session, though you'd then have two layers doing similar jobs. Use omux's own sessions for Claude Code and Codex to get its status and permission buttons."),
            ("Does omux work over SSH?", "No. Sessions run locally. herdr is a better fit for remote machines."),
            ("Which has fewer moving parts?", "omux: it's one app with no server and no API. herdr runs a background server so terminals outlive the client."),
        ],
    },
]

def esc(s): return html.escape(s, quote=False)

def head_html(title, meta, canonical, extra=""):
    return f'''<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{esc(title)}</title>
  <meta name="description" content="{html.escape(meta)}">
  <link rel="canonical" href="{canonical}">
  <meta name="theme-color" content="#0F0F0F">
  <meta name="color-scheme" content="dark">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="omux">
  <meta property="og:url" content="{canonical}">
  <meta property="og:title" content="{html.escape(title)}">
  <meta property="og:description" content="{html.escape(meta)}">
  <meta property="og:image" content="{BASE}/social-preview.png">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="favicon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="apple-touch-icon.png">
  <link rel="stylesheet" href="style.css?v=4">
{extra}</head>'''

HEADER = '''<header class="site-header">
  <div class="container header-row">
    <a class="brand" href="/" aria-label="omux home">
      <img src="favicon.svg" alt="" width="28" height="28">
      <span>omux</span>
    </a>
    <nav class="site-nav" aria-label="Primary">
      <a href="/#features">Features</a>
      <a href="/#install">Install</a>
      <a href="https://github.com/onurozcan/omux">GitHub</a>
      <a class="btn btn-small btn-primary" href="https://github.com/onurozcan/omux/releases/latest" data-download>Download</a>
    </nav>
  </div>
</header>'''

def footer_html(current=None):
    links = "".join(f'<a href="/{p["slug"]}">omux vs {esc(p["other"])}</a>' for p in PAGES if p["slug"] != current)
    return f'''<footer class="site-footer">
  <div class="container">
    <nav class="footer-links" aria-label="Footer">
      <a href="https://github.com/onurozcan/omux">GitHub</a>
      <a href="https://github.com/onurozcan/omux/releases">Releases</a>
      <a href="/changelog">Changelog</a>
      <a href="https://github.com/onurozcan/omux/issues">Issues</a>
      <a href="https://github.com/onurozcan/omux/blob/main/LICENSE">MIT license</a>
    </nav>
    <nav class="footer-links footer-compare" aria-label="Comparisons">
      <span class="muted">Compare:</span>{links}
    </nav>
    <p class="fineprint">omux is an independent project, not affiliated with or endorsed by Anthropic or OpenAI. Claude and Claude Code are trademarks of Anthropic; Codex is a trademark of OpenAI. Other product names belong to their owners; comparisons reflect their public documentation as of {TODAY} and may be out of date.</p>
  </div>
</footer>'''

def page_html(p):
    canonical = f"{BASE}/{p['slug']}"
    faq_ld = {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [
        {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in p["faq"]]}
    crumbs_ld = {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
        {"@type": "ListItem", "position": 1, "name": "omux", "item": BASE + "/"},
        {"@type": "ListItem", "position": 2, "name": f"omux vs {p['other']}", "item": canonical}]}
    extra = f'  <script type="application/ld+json">{json.dumps(faq_ld)}</script>\n  <script type="application/ld+json">{json.dumps(crumbs_ld)}</script>\n'
    rows = "".join(f"<tr><th scope=\"row\">{esc(f)}</th><td>{esc(o)}</td><td>{esc(t)}</td></tr>\n" for f, o, t in p["rows"])
    intro = "".join(f"<p class=\"lede\">{esc(x)}</p>\n" for x in p["intro"])
    better_other = "".join(f"<li>{esc(x)}</li>" for x in p["better_other"])
    better_omux = "".join(f"<li>{esc(x)}</li>" for x in p["better_omux"])
    faq = "".join(f"<details><summary>{esc(q)}</summary><p>{esc(a)}</p></details>\n" for q, a in p["faq"])
    others = ", ".join(f'<a href="/{q["slug"]}">{esc(q["other"])}</a>' for q in PAGES if q["slug"] != p["slug"])
    return f'''{head_html(p["title"], p["meta"], canonical, extra)}
<body>

{HEADER}

<main class="section compare">
  <div class="container narrow">
    <nav class="crumbs" aria-label="Breadcrumb"><a href="/">omux</a> › omux vs {esc(p["other"])}</nav>
    <h1>{esc(p["h1"])}</h1>
{intro}
    <div class="cta-row">
      <a class="btn btn-primary" href="https://github.com/onurozcan/omux/releases/latest" data-download>Download omux for macOS</a>
      <a class="btn btn-secondary" href="{p["other_url"]}" rel="nofollow noopener">About {esc(p["other"])}</a>
    </div>

    <h2>Side by side</h2>
    <div class="table-wrap">
    <table class="compare-table">
      <thead><tr><th scope="col"></th><th scope="col">omux</th><th scope="col">{esc(p["other"])}</th></tr></thead>
      <tbody>
{rows}      </tbody>
    </table>
    </div>

    <div class="split">
      <div class="card">
        <h2>Pick {esc(p["other"])} if</h2>
        <ul>{better_other}</ul>
      </div>
      <div class="card">
        <h2>Pick omux if</h2>
        <ul>{better_omux}</ul>
      </div>
    </div>

    <h2>What omux does for every session</h2>
    <ul class="checklist">
{"".join(f"      <li>{esc(f)}</li>{chr(10)}" for f, _ in OMUX_FEATURES)}    </ul>

    <h2>Questions</h2>
{faq}
    <p class="muted">Also compared: {others}. Facts about {esc(p["other"])} come from its public documentation as of {TODAY}; if something is out of date, <a href="https://github.com/onurozcan/omux/issues">open an issue</a>.</p>
  </div>
</main>

{footer_html(p["slug"])}
<script src="main.js" defer></script>
</body>
</html>
'''

for p in PAGES:
    (site / f"{p['slug']}.html").write_text(page_html(p))

urls = [("", "1.0", "weekly"), ("changelog", "0.7", "weekly")] + [(p["slug"], "0.8", "monthly") for p in PAGES]
sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + "".join(
    f"  <url><loc>{BASE}/{u}</loc><lastmod>{TODAY}</lastmod><changefreq>{c}</changefreq><priority>{pr}</priority></url>\n" for u, pr, c in urls) + "</urlset>\n"
(site / "sitemap.xml").write_text(sitemap)
(site / "robots.txt").write_text(f"User-agent: *\nAllow: /\n\nSitemap: {BASE}/sitemap.xml\n")
print("wrote", ", ".join(p["slug"] + ".html" for p in PAGES), "sitemap.xml robots.txt")
