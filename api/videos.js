// Videos — Hans's YouTube channel feed (Vercel Serverless Function)
// Lives at /api/videos. No API key and no npm dependencies: YouTube publishes a
// public Atom feed per channel, so this fetches and parses it with plain fetch
// and regexes, the same dependency-free approach as the other functions here.
//
// Channel: https://www.youtube.com/@vote4hans

const CHANNEL_ID = 'UCcUB0UQN9g_7EiWS-LCRGQg';
const FEED = 'https://www.youtube.com/feeds/videos.xml?channel_id=' + CHANNEL_ID;

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

// Atom entries arrive newest first; keep that order rather than re-sorting,
// then sort by date anyway so a feed quirk cannot scramble the page.
function parseFeed(xml) {
  const entries = xml.match(/<entry>[\s\S]*?<\/entry>/g) || [];
  return entries
    .map(function (entry) {
      return {
        id: tag(entry, 'yt:videoId'),
        title: tag(entry, 'title'),
        published: tag(entry, 'published')
      };
    })
    .filter(function (v) { return v.id && v.title; })
    .sort(function (a, b) { return new Date(b.published) - new Date(a.published); });
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const upstream = await fetch(FEED, {
      headers: { 'user-agent': 'hansandersen.org video list' }
    });

    if (!upstream.ok) {
      console.error('YouTube feed error:', upstream.status);
      return res.status(502).json({ error: 'Upstream error' });
    }

    const videos = parseFeed(await upstream.text());

    // Cached at the edge for an hour; serve the stale copy for a day after that
    // while it refreshes, so a YouTube hiccup never empties the page.
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    return res.status(200).json(videos);
  } catch (err) {
    console.error('Function error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
