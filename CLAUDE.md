# Dragon Masters — Project Guide for Claude Code

Read `DESIGN.md` for the full game design and the phased build roadmap.
This file = the standing rules. DESIGN.md = the plan and the content.

## Who I am
I'm a beginner and not a programmer. Explain what you're doing in plain
language, and when you need me to do something, tell me exactly what to type
or click. Don't assume I know developer jargon.

## What we're building
A turn-based, math-powered dragon game for kids aged 8-10 (adaptive difficulty).
Mobile-first, touch-first, responsive web app. Runs in a browser, mainly on
phones and iPads. No backend, no login, no accounts — everything runs
on-device and works offline.

## Tech stack (decided — don't change without asking me)
- React + TypeScript, built with Vite
- Tailwind CSS for styling (mobile-first, large touch targets)
- Zustand for game state
- Browser localStorage for saving progress
- Plain HTML/CSS for the battlefield — no game engine, no canvas

## Commands
- Install dependencies: `npm install`
- Run the dev server: `npm run dev` (it prints both a Local and a Network URL)
- Build for production: `npm run build` (this also type-checks all the code)
- Preview the production build: `npm run preview`
Whenever you start the dev server, tell me BOTH the local URL and the network
URL, so I can open it on my phone/iPad on the same wifi.

## How we work
- Build ONE phase at a time, in order, from the roadmap in DESIGN.md. Don't jump ahead.
- At the start of a phase, show me a short plan before writing code.
- At the end of a phase, tell me how to run it and exactly what I should see and test.
- Keep all game content (dragons, moves, aspects, skills, regions) in data/config
  files, never hardcoded in components — so we can add content without new code.
- Commit to git after each working phase, with a clear message.

## Conventions
- TypeScript strict mode.
- Small, readable components. Comment the *why*, not the *what*.
- Kid-safe and gentle: never punish wrong math answers harshly; losing a battle
  means retreat, never permadeath.
- Accessibility: large tap targets, high contrast, no tiny text.

## Don't
- Don't add accounts, servers, databases, ads, or analytics.
- Don't break offline saving.
- Don't delete my files or run destructive commands without telling me first.
