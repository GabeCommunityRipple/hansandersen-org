// Videos — Hans's YouTube channel + featured playlist (Vercel Serverless Function)
// Lives at /api/videos. No API key and no npm dependencies: YouTube publishes a
// public Atom feed per channel and per playlist, so this fetches and parses them
// with plain fetch and regexes, the same dependency-free approach as the other
// functions here.
//
// Channel:  https://www.youtube.com/@vote4hans
// Playlist: https://youtube.com/playlist?list=PLRCTtxs2s4_s  ("Vote for Hans")

const CHANNEL_ID = 'UCcUB0UQN9g_7EiWS-LCRGQg';
const PLAYLIST_ID = 'PLRCTtxs2s4_s';

const CHANNEL_FEED = 'https://www.youtube.com/feeds/videos.xml?channel_id=' + CHANNEL_ID;
const PLAYLIST_FEED = 'https://www.youtube.com/feeds/videos.xml?playlist_id=' + PLAYLIST_ID;

function decodeEntities(str) {
  return str
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, function (_, code) { return String.fromCharCode(parseInt(code, 10)); })
    .replace(/&#x([0-9a-fA-F]+);/g, function (_, code) { return String.fromCharCode(parseInt(code, 16)); })
    .replace(/&amp;/g, '&'); // last, so a literal &amp;lt; survives correctly
}

function tag(entry, name) {
  const m = entry.match(new RegExp('<' + name + '[^>]*>([\\s\\S]*?)</' + name + '>'));
  return m ? decodeEntities(m[1].trim()) : '';
}

// The channel that actually published the video. Hans's playlist includes clips
// from other people's channels, and the page bylines them so nobody mistakes
// someone else's video for his. Scoped to the <author> block so it cannot pick
// up a <name> from elsewhere in the entry.
function authorName(entry) {
  const block = entry.match(/<author>[\s\S]*?<\/author>/);
  return block ? tag(block[0], 'name') : '';
}

// sortByDate: true for channel uploads, where newest-first is what people expect.
// false for the playlist, where the feed arrives in the order Hans arranged it —
// that curation is the whole point of a featured list, so it is left alone.
function parseFeed(xml, sortByDate) {
  const entries = xml.match(/<entry>[\s\S]*?<\/entry>/g) || [];
  const videos = entries
    .map(function (entry) {
      return {
        id: tag(entry, 'yt:videoId'),
        title: tag(entry, 'title'),
        published: tag(entry, 'published'),
        channel: authorName(entry)
      };
    })
    .filter(function (v) { return v.id && v.title; });

  return sortByDate
    ? videos.sort(function (a, b) { return new Date(b.published) - new Date(a.published); })
    : videos;
}

// Resolves to a video array, or to [] if this feed is unavailable. One feed
// failing must not take the other down with it.
async function loadFeed(url, sortByDate, label) {
  try {
    const upstream = await fetch(url, {
      headers: { 'user-agent': 'hansandersen.org video list' }
    });
    if (!upstream.ok) {
      console.error('YouTube ' + label + ' feed error:', upstream.status);
      return null;
    }
    return parseFeed(await upstream.text(), sortByDate);
  } catch (err) {
    console.error('YouTube ' + label + ' feed fetch failed:', err);
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const [featuredResult, latestResult] = await Promise.all([
      loadFeed(PLAYLIST_FEED, false, 'playlist'),
      loadFeed(CHANNEL_FEED, true, 'channel')
    ]);

    // Both feeds down means we have nothing to show: let the page fall back to
    // its "watch on YouTube" message rather than rendering empty sections.
    if (featuredResult === null && latestResult === null) {
      return res.status(502).json({ error: 'Upstream error' });
    }

    const featured = featuredResult || [];
    const latest = latestResult || [];

    // A featured video is usually also a recent upload. Show it once, up top.
    const featuredIds = new Set(featured.map(function (v) { return v.id; }));
    const dedupedLatest = latest.filter(function (v) { return !featuredIds.has(v.id); });

    // Cached at the edge for an hour; serve the stale copy for a day after that
    // while it refreshes, so a YouTube hiccup never empties the page.
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    return res.status(200).json({ featured: featured, latest: dedupedLatest });
  } catch (err) {
    console.error('Function error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
