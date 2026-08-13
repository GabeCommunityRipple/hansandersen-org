// Contact the Campaign (Vercel Serverless Function)
// Lives at /api/contact. Requires the RESEND_API_KEY environment variable
// (Vercel dashboard → Project → Settings → Environment Variables).
// The key stays server-side; nothing ships to the browser.
//
// Sends through Resend's REST API with plain fetch — no npm dependencies,
// same approach as api/ask-hans.js.

// Sending domain verified in Resend. Replies never come back here — reply_to
// below points at the visitor, so Hans answers from his own inbox.
const FROM = 'Hans Andersen Campaign <noreply@postitpal.com>';
const TO = 'contact@hansandersen.org';

const LIMITS = { name: 120, email: 200, message: 4000 };

function clean(value, max) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

// Deliberately loose: catches obvious typos without rejecting unusual but valid
// addresses. Real delivery failures are Resend's business, not ours.
function looksLikeEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

// Keeps a stray newline in the name out of the subject line.
function oneLine(value) {
  return value.replace(/[\r\n]+/g, ' ');
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body || {};

  // Honeypot. The field is off-screen, so a person never fills it in — anything
  // here is a bot. Answer 200 so it believes it succeeded and moves on.
  if (clean(body.website, 200)) {
    return res.status(200).json({ ok: true });
  }

  const name = clean(body.name, LIMITS.name);
  const email = clean(body.email, LIMITS.email);
  const message = clean(body.message, LIMITS.message);

  if (!name) {
    return res.status(400).json({ error: 'Please include your name.' });
  }
  if (!looksLikeEmail(email)) {
    return res.status(400).json({ error: 'Please check your email address.' });
  }
  if (!message) {
    return res.status(400).json({ error: 'Please include a message.' });
  }

  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not set');
    return res.status(500).json({ error: 'Server error' });
  }

  const text =
    'New message from the hansandersen.org contact form\n\n' +
    'Name: ' + name + '\n' +
    'Email: ' + email + '\n\n' +
    message;

  const html =
    '<p><strong>New message from the hansandersen.org contact form</strong></p>' +
    '<p><strong>Name:</strong> ' + escapeHtml(name) + '<br>' +
    '<strong>Email:</strong> ' + escapeHtml(email) + '</p>' +
    '<p style="white-space:pre-wrap">' + escapeHtml(message) + '</p>';

  try {
    const upstream = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: 'Bearer ' + process.env.RESEND_API_KEY
      },
      body: JSON.stringify({
        from: FROM,
        to: [TO],
        reply_to: email, // so Hans can reply straight from his inbox
        subject: 'Campaign contact form — ' + oneLine(name),
        text,
        html
      })
    });

    if (!upstream.ok) {
      const detail = await upstream.text();
      console.error('Resend API error:', upstream.status, detail);
      return res.status(502).json({ error: 'Upstream error' });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Function error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
