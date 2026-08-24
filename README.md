# Distraction Pad

**Type a thought. It becomes a scheduled note.**

Everyone keeps notes in one place and a calendar in another, and the thing they
meant to do falls into the gap between the two. Distraction Pad closes that gap
with a single input: you write `call mom saturday 6pm` in plain language, and it
becomes a note titled *Call mom*, scheduled for Saturday at 18:00. No forms, no
fields, no date picker.

The interface opens on almost nothing — one input on an empty canvas — and earns
its density as you use it.

---

## Status

Build in progress, in the open. See the commit history for how it came together.

| Milestone | Scope |
| --- | --- |
| **v0.1** | Splash reveal, home, capture to notepad, note card, expand/collapse |
| v0.2 | Multiple notes, persistence, edit and delete |
| v0.3 | Calendar view, events in day cells, note/calendar toggle |
| v0.4 | Pomodoro — dial, work/rounds/break, running timer |
| v0.5 | Express + MongoDB, auth |
| v1.0 | Natural-language parsing, deploy, docs |

## Stack

- **Front end** — React 18, TypeScript, Vite, Tailwind
- **Back end** — Express, MongoDB _(v0.5)_
- **Parsing** — natural language to `{ title, date }` _(v1.0)_

## Design

Designed in Figma before any code was written. Two details worth calling out,
because both are built rather than exported:

**The ribbon** is one S-curve path stroked several times at small perpendicular
offsets, three bundles woven together. That repetition is what produces the
folded-paper striping, and it keeps the artwork a few KB of SVG that scales to
any viewport instead of a bitmap.

**The P/D mark** is a pane of frosted glass cut to the shape of the letter — a
`clip-path` on an element carrying `backdrop-filter`, not a filled path. The
ribbon behind it shows through blurred and lifted, which is why it reads as
glass rather than as a striped stencil.

Palette and type live in `tailwind.config.js` as tokens, read off the prototype:

| Token | Value |
| --- | --- |
| `canvas` | `#EAEAEA` |
| `ink` | `#1E1E1E` |
| `ribbon.green` | `#0E8A62` |
| `ribbon.dark` | `#4A4A4A` |
| `ribbon.grey` | `#9A9A9A` |

## Running it

```bash
npm install
npm run dev
```

Build:

```bash
npm run build
```

---

Built by [Thameem Ashraf](https://thameemashraf.vercel.app).
