# CLAUDE.md — hansandersen.org

Campaign site for Hans Andersen, candidate for Utah County Auditor (Nov 2026).
Built to grow into a life-story/legacy site after the election.

## Stack & deployment

- Plain static HTML/CSS/JS — **no framework, no build step**. Keep it that way.
- Serverless functions in `api/` (Vercel, ESM) — listed under Structure. Keys
  (`ANTHROPIC_API_KEY`, `RESEND_API_KEY`) come from Vercel env vars. Never put a key in client code.
- Hosted on Vercel, repo on GitHub (GabeCommunityRipple/hansandersen-org),
  DNS on Cloudflare (records must be DNS-only / grey cloud, not proxied).
- Related site: andersenaccounting.com (Hans's tax practice, separate Vercel project).
  This site backlinks to it; its own "Ask Hans" there handles tax questions.

## Structure

- `index.html` — campaign homepage
- `platform.html` — platform & beliefs
- `record.html` — council + watchdog record timeline
- `compare.html` — "The 2026 Choice": Tanner's own published words beside Hans's answer
- `payroll.html` — "Utah County Payroll", the flagship issue: commissioner pay, the tax math, payroll table (gold 🚀 nav link)
- `life.html` — life story (family, military, scouting, orchard)
- `books.html` — books he's helped write (placeholders pending real titles)
- `videos.html` + `js/videos.js` — his YouTube channel and featured playlist (loads from `/api/videos`)
- `accounting.html` — the practice, backlinks to andersenaccounting.com
- `contact.html` + `js/contact.js` — contact form (posts to `/api/contact`)
- `ask-hans.html` + `js/ask-hans.js` — campaign chat UI (posts to `/api/ask-hans`)
- `privacy.html` — plain-language privacy page; linked from the footer legal line, not the nav
- `api/ask-hans.js` — Ask Hans serverless function; calls Anthropic with `ANTHROPIC_API_KEY`
- `api/contact.js` — contact-form serverless function; emails the campaign inbox via Resend with `RESEND_API_KEY`
- `api/videos.js` — reads the channel's and playlist's public YouTube feeds; no key needed
- `css/style.css` — ALL styling; palette variables at the top; edit here, no inline style sprawl
- `js/site.js` — nav toggle + active-link highlight
- Nav and footer are duplicated in every HTML page — **any nav/footer change must be
  applied identically to every HTML page in the repo (find them all — don't
  assume the count).**

## Hard rules

**Editorial north star:** Hans's primary goal is educating people on his principles of
government — winning the election is secondary. When a choice trades electoral polish
against stating his views plainly and authentically, authenticity wins. This does not
loosen the rules below: facts stay verified, opponents stay undisparaged, and the site
stays honest about what is Hans's own voice vs. content he's sharing.

1. **Never invent facts about Hans.** Every claim on this site is sourced from his real
   record. If content is missing (dates, titles, photos), leave a clearly visible
   placeholder (`.todo-note` div or `<!-- TODO -->`) rather than making something up.
2. **No mention of Melodee, Hans's ex-wife, his marriage, or divorce** — anywhere in
   pages, prompts, comments, or commit messages. The Ask Hans system prompt must keep
   its rule to politely decline such questions.
3. **Hans runs as a candidate of the Independent American Party** (confirmed by Hans,
   13 August 2026 — this supersedes the earlier "affiliation deliberately unstated"
   rule, and explains why he was not on the UCRP convention list). State the
   affiliation accurately wherever a voter would look for it; do not editorialize
   about the party, and do not describe the party's platform as though it were
   Hans's. His positions are the ones sourced on this site.
4. The footer campaign-finance disclosure reads exactly **"Paid for by Hans Andersen."**
   (confirmed by Hans, 13 August 2026). It appears on every HTML page in the repo (find
   them all — don't assume the count) — change it in all of them or none.
5. Ask Hans (campaign edition) answers only campaign/record/bio questions, never
   disparages opponents, routes tax questions to andersenaccounting.com/ask-hans,
   and never handles donations.
6. Keep the site dependency-free: no npm packages, no frameworks, no trackers
   except the Google Ads gtag (AW-18525867908), added October 2026 for campaign
   ad conversion tracking. Google Fonts CDN and that tag are the only external
   resources.

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
  parity across every HTML page in the repo if they were touched (find them
  all — don't assume the count).
