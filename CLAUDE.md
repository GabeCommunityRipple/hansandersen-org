# CLAUDE.md — hansandersen.org

Campaign site for Hans Andersen, candidate for Utah County Auditor (Nov 2026).
Built to grow into a life-story/legacy site after the election.

## Stack & deployment

- Plain static HTML/CSS/JS — **no framework, no build step**. Keep it that way.
- One serverless function: `api/ask-hans.js` (Vercel, ESM) — the "Ask Hans" AI chat.
  Uses `ANTHROPIC_API_KEY` from Vercel env vars. Never put the key in client code.
- Hosted on Vercel, repo on GitHub (GabeCommunityRipple/hansandersen-org),
  DNS on Cloudflare (records must be DNS-only / grey cloud, not proxied).
- Related site: andersenaccounting.com (Hans's tax practice, separate Vercel project).
  This site backlinks to it; its own "Ask Hans" there handles tax questions.

## Structure

- `index.html` — campaign homepage
- `platform.html` — platform & beliefs
- `record.html` — council + watchdog record timeline
- `life.html` — life story (family, military, scouting, orchard)
- `books.html` — books he's helped write (placeholders pending real titles)
- `accounting.html` — the practice, backlinks to andersenaccounting.com
- `ask-hans.html` + `js/ask-hans.js` — campaign chat UI (posts to `/api/ask-hans`)
- `css/style.css` — ALL styling; palette variables at the top; edit here, no inline style sprawl
- `js/site.js` — nav toggle + active-link highlight
- Nav and footer are duplicated in every HTML page — **any nav/footer change must be
  applied to all 7 pages identically.**

## Hard rules

1. **Never invent facts about Hans.** Every claim on this site is sourced from his real
   record. If content is missing (dates, titles, photos), leave a clearly visible
   placeholder (`.todo-note` div or `<!-- TODO -->`) rather than making something up.
2. **No mention of Melodee, Hans's ex-wife, his marriage, or divorce** — anywhere in
   pages, prompts, comments, or commit messages. The Ask Hans system prompt must keep
   its rule to politely decline such questions.
3. **Party affiliation is deliberately unstated** until confirmed (Hans was not on the
   UCRP convention list for auditor as of Feb 2026). Don't add a party.
4. The footer "Paid for by [Committee Name — TODO]" line stays as a loud placeholder
   until the real campaign-finance disclosure wording is provided.
5. Ask Hans (campaign edition) answers only campaign/record/bio questions, never
   disparages opponents, routes tax questions to andersenaccounting.com/ask-hans,
   and never handles donations.
6. Keep the site dependency-free: no npm packages, no frameworks, no trackers.
   Google Fonts CDN is the only external resource.

## Conventions

- Photo placeholders are `.photo-ph` divs that name their target file
  (e.g. `images/orchard.jpg`) — when adding a real photo, replace the div with an
  `<img class="photo">` using that filename, `width`/`height`, `loading="lazy"`,
  and a meaningful `alt`.
- `images/` holds web-optimized JPEGs only (max 1600px wide, `sips -Z 1600`, never
  upscaled). Full-resolution untouched originals live in `images/originals/` —
  re-derive from there, don't re-compress the web copies.
- Visible content TODOs use `<div class="todo-note">`; invisible ones use `<!-- TODO -->`.
- Tone of site copy: plain-spoken, warm, confident; "statesman not politician";
  short paragraphs; no corporate jargon.
- After any change, verify: open the affected pages locally (e.g.
  `python3 -m http.server`) and check desktop + mobile widths; confirm nav/footer
  parity across all 7 pages if they were touched.
