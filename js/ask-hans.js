// Ask Hans — Campaign Edition
// Frontend chat that talks to a serverless function which holds the API key.
// Deployed on Vercel: the function lives at api/ask-hans.js → /api/ask-hans.

var ENDPOINT = '/api/ask-hans';

(function () {
  var log = document.getElementById('chat-log');
  var input = document.getElementById('chat-input');
  var sendBtn = document.getElementById('chat-send');
  var history = []; // {role: 'user'|'assistant', content: string}

  function addMsg(text, who) {
    var div = document.createElement('div');
    div.className = 'msg ' + who;
    div.textContent = text;
    log.appendChild(div);
    log.scrollTop = log.scrollHeight;
    return div;
  }

  function setBusy(busy) {
    sendBtn.disabled = busy;
    input.disabled = busy;
    if (!busy) input.focus();
  }

  function send(question) {
    var q = (question || input.value).trim();
    if (!q) return;
    input.value = '';
    addMsg(q, 'user');
    history.push({ role: 'user', content: q });
    var thinking = addMsg('Hans is thinking…', 'hans thinking');
    setBusy(true);

    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: history.slice(-12) }) // last 12 turns for context
    })
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function (data) {
        thinking.remove();
        var reply = data.reply || "I'm sorry — I didn't catch that. Try asking again.";
        addMsg(reply, 'hans');
        history.push({ role: 'assistant', content: reply });
      })
      .catch(function () {
        thinking.remove();
        addMsg(
          "I'm having trouble answering right now — the Ask Hans service isn't reachable. " +
          "(If you're previewing this site locally, the chat only works once it's deployed with its serverless function.) " +
          "In the meantime, my platform and record are laid out on this site — and thanks for your patience.",
          'hans'
        );
      })
      .finally(function () {
        setBusy(false);
      });
  }

  sendBtn.addEventListener('click', function () { send(); });
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') send();
  });
  document.querySelectorAll('.starters button').forEach(function (b) {
    b.addEventListener('click', function () { send(b.getAttribute('data-q')); });
  });
})();
