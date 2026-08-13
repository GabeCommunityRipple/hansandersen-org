// Contact the Campaign — form submit
// Posts to a serverless function which holds the Resend API key.
// Deployed on Vercel: the function lives at api/contact.js → /api/contact.

var ENDPOINT = '/api/contact';

(function () {
  var form = document.getElementById('contact-form');
  if (!form) return;

  var button = document.getElementById('cf-submit');
  var status = document.getElementById('cf-status');

  function setStatus(text, kind) {
    status.textContent = text;
    status.className = 'form-status' + (kind ? ' ' + kind : '');
  }

  function setBusy(busy) {
    button.disabled = busy;
    button.textContent = busy ? 'Sending…' : 'Send message';
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var payload = {
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      message: form.message.value.trim(),
      website: form.website.value // honeypot — should always be empty
    };

    // Check here too so people get an answer without a round trip; the function
    // validates again, since anything can post to it.
    if (!payload.name) return setStatus('Please include your name.', 'err');
    if (!payload.email) return setStatus('Please include your email address.', 'err');
    if (!payload.message) return setStatus('Please include a message.', 'err');

    setStatus('', '');
    setBusy(true);

    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(function (res) {
        return res.json().then(function (data) {
          return { ok: res.ok, data: data };
        });
      })
      .then(function (result) {
        if (!result.ok) {
          setStatus(
            result.data.error || 'Something went wrong sending your message. Please try again.',
            'err'
          );
          return;
        }
        form.reset();
        setStatus('Thank you — your message is on its way. Hans reads what comes in.', 'ok');
      })
      .catch(function () {
        setStatus(
          'The message could not be sent right now. (If you are previewing this site ' +
          'locally, the form only works once it is deployed with its serverless function.) ' +
          'You can always email contact@hansandersen.org directly.',
          'err'
        );
      })
      .finally(function () {
        setBusy(false);
      });
  });
})();
