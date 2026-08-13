# hansandersen.org

Campaign-first personal site for Hans Andersen — candidate for Utah County Auditor (Nov 2026) — built to grow into a life-story / legacy site after the election.

## Structure

| File | Purpose |
|---|---|
| `index.html` | Campaign homepage — hero, why Hans, record highlights, life/books/accounting teasers, Ask Hans promo |
| `platform.html` | Platform & political beliefs |
| `record.html` | Orem City Council + watchdog record timeline (UTOPIA, pumpkin farmer, records requests, Prop 1, utility rates, SCERA) |
| `life.html` | Life story: family of 11, eight sons, military, scouting, orchard, Hans & Melodee — written so it can grow into a legacy/memorial page |
| `books.html` | Books he's helped write (placeholder cards — fill in titles/covers/links) |
| `accounting.html` | The practice + backlinks to andersenaccounting.com and the tax Ask Hans |
| `ask-hans.html` + `js/ask-hans.js` | Campaign-edition Ask Hans chat |
| `api/ask-hans.js` | Vercel serverless function that calls the Anthropic API (keeps the key server-side) |
| `css/style.css` | All styling — palette variables at the top |
| `images/` | Empty — drop photos here (filenames referenced in the photo placeholders) |

## Deploy (Vercel — same as the other sites)

1. Push this folder to a Git repo and import it in Vercel (or run `vercel` from the folder).
   No build step needed — Vercel serves the static files and auto-detects `api/ask-hans.js`.
2. In Vercel: **Project → Settings → Environment Variables** → add `ANTHROPIC_API_KEY`
   (same key setup as the andersenaccounting.com Ask Hans, if you built it the same way).
3. Add `hansandersen.org` under **Project → Settings → Domains** and point the domain's DNS
   at Vercel (the domain currently has no DNS records).
4. Done — the chat posts to `/api/ask-hans`.

## Before launch — TODO list

- [ ] Photos: replace every striped "PHOTO PLACEHOLDER" box (filenames are noted in each one)
- [ ] `books.html`: real titles, covers, descriptions, links
- [ ] `record.html`: council term years + dates/links for each timeline item
- [ ] `life.html`: hometown, military branch/years, education
- [ ] Footer on every page: campaign-finance disclosure line ("Paid for by …")
- [ ] Confirm party/filing status — Hans was not listed among the UCRP convention candidates for auditor as of Feb 2026, so the site deliberately doesn't state a party
- [ ] Contact info / email for the campaign (add to footer or a contact page if wanted)
- [ ] Favicon + social share image (`og:image`)

## Notes

- Every fact on the site came from andersenaccounting.com, the archived vote4hans.com
  content, and news coverage (Salt Lake Tribune archive) — nothing invented. Anything
  unverified is marked with a yellow "To fill in" note or an HTML `<!-- TODO -->` comment.
- The Ask Hans system prompt (in the Netlify function) is instructed to answer only from
  Hans's published record and to refuse to invent positions.
