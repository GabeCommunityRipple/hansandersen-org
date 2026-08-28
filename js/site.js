// Mobile nav toggle + active link highlighting
document.addEventListener('DOMContentLoaded', function () {
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('nav.mainnav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }
  // Highlight current page in nav
  var here = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('nav.mainnav a').forEach(function (a) {
    var href = a.getAttribute('href');
    if (href === here) a.classList.add('active');
  });
});

// The $50M count-up on the homepage. Progressive enhancement: the markup ships
// with the final figure already in it, so with JavaScript off (or if anything
// here bails) the correct number is what people see. Only once we know we can
// animate do we reset it to zero.
document.addEventListener('DOMContentLoaded', function () {
  var counter = document.getElementById('fifty-counter');
  if (!counter) return;

  var valueEl = counter.querySelector('.counter-value');
  var bar = document.getElementById('fifty-yearbar');
  var segs = bar ? bar.querySelectorAll('.yb-seg') : [];
  var target = parseInt(counter.getAttribute('data-target'), 10);
  if (!valueEl || !target) return;

  function format(n) {
    return '$' + Math.round(n).toLocaleString('en-US');
  }

  function settle() {
    valueEl.textContent = format(target);
    for (var i = 0; i < segs.length; i++) segs[i].classList.add('on');
  }

  var reducedMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Anyone who asked for less motion, or whose browser cannot do this smoothly,
  // just gets the finished number and a full bar.
  if (reducedMotion || !('IntersectionObserver' in window) || !window.requestAnimationFrame) {
    settle();
    return;
  }

  var DURATION = 1800;

  function run() {
    var startedAt = null;
    function step(now) {
      if (startedAt === null) startedAt = now;
      var progress = Math.min((now - startedAt) / DURATION, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      valueEl.textContent = format(target * eased);
      var lit = Math.round(eased * segs.length);
      for (var i = 0; i < segs.length; i++) {
        segs[i].classList.toggle('on', i < lit);
      }
      if (progress < 1) window.requestAnimationFrame(step);
      else settle();
    }
    window.requestAnimationFrame(step);
  }

  valueEl.textContent = format(0);
  for (var i = 0; i < segs.length; i++) segs[i].classList.remove('on');

  var observer = new IntersectionObserver(function (entries) {
    for (var i = 0; i < entries.length; i++) {
      if (entries[i].isIntersecting) {
        observer.disconnect(); // count once, not on every scroll past
        run();
        return;
      }
    }
  }, { threshold: 0.35 });

  observer.observe(counter);
});
