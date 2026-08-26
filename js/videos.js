// In His Own Words — renders Hans's featured playlist and latest uploads.
// Talks to the serverless function at api/videos.js → /api/videos, which reads
// the channel's and the playlist's public Atom feeds and returns
// { featured: [...], latest: [...] } with the featured videos already removed
// from latest so nothing shows up twice.

var ENDPOINT = '/api/videos';
var CHANNEL = 'https://www.youtube.com/@vote4hans';

(function () {
  var grid = document.getElementById('video-grid');
  var status = document.getElementById('video-status');
  var featuredGrid = document.getElementById('featured-grid');
  var featuredSection = document.getElementById('featured-section');
  if (!grid) return;

  function formatDate(iso) {
    var d = new Date(iso);
    if (isNaN(d)) return '';
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  function showMessage(html) {
    status.innerHTML = html;
    status.hidden = false;
  }

  function card(v) {
    var card = document.createElement('div');
    card.className = 'video-card';

    var frame = document.createElement('div');
    frame.className = 'video-frame';

    var iframe = document.createElement('iframe');
    // youtube-nocookie keeps YouTube from setting tracking cookies on visitors
    // who never press play.
    iframe.src = 'https://www.youtube-nocookie.com/embed/' + v.id;
    iframe.title = v.title;
    iframe.loading = 'lazy';
    iframe.allow = 'accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    iframe.setAttribute('allowfullscreen', '');
    iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
    frame.appendChild(iframe);

    var meta = document.createElement('div');
    meta.className = 'video-meta';

    var h3 = document.createElement('h3');
    h3.textContent = v.title;
    meta.appendChild(h3);

    var date = formatDate(v.published);
    if (date) {
      var p = document.createElement('p');
      p.className = 'video-date';
      p.textContent = date;
      meta.appendChild(p);
    }

    card.appendChild(frame);
    card.appendChild(meta);
    return card;
  }

  function render(target, videos) {
    videos.forEach(function (v) { target.appendChild(card(v)); });
  }

  fetch(ENDPOINT)
    .then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    })
    .then(function (data) {
      var featured = (data && Array.isArray(data.featured)) ? data.featured : [];
      var latest = (data && Array.isArray(data.latest)) ? data.latest : [];

      // The playlist can be empty or its feed can be down while uploads are
      // fine: in that case the section simply stays hidden.
      if (featured.length > 0 && featuredGrid && featuredSection) {
        render(featuredGrid, featured);
        featuredSection.hidden = false;
      }

      if (latest.length === 0) {
        showMessage(
          featured.length > 0
            ? 'That is everything for now. More on ' +
              '<a href="' + CHANNEL + '" target="_blank" rel="noopener">Hans\'s YouTube channel</a>.'
            : 'No videos to show just yet. You can always watch on ' +
              '<a href="' + CHANNEL + '" target="_blank" rel="noopener">Hans\'s YouTube channel</a>.'
        );
        return;
      }

      status.hidden = true;
      render(grid, latest);
    })
    .catch(function () {
      showMessage(
        'The video list is not loading right now. (If you are previewing this site locally, ' +
        'it only works once deployed with its serverless function.) You can watch every video on ' +
        '<a href="' + CHANNEL + '" target="_blank" rel="noopener">Hans\'s YouTube channel</a>.'
      );
    });
})();
