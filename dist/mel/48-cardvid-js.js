/* CARD VIDEO AUTOPLAY — .msnfhcvid (Marketing Studio "Create a listing package" card art)
   The `autoplay` attribute is a no-op on this surface: #ms-studio / #ms-newflow are display:none at
   document load, and Chrome's deferred muted-autoplay only resumes for elements that were RENDERED
   but offscreen. An element that never rendered loses the attempt and never retries when shown, so
   the card sat on its poster forever. This starts playback the first time the video is actually
   visible, and pauses it when it scrolls away (decode cost on a page this dense is not free).
   The poster + the .msnfhcimg layer under it stay the loading/failure state — nothing to do here. */
(function () {
  'use strict';
  if (window.__melCardVid) return;
  window.__melCardVid = true;

  var SEL = 'video.msnfhcvid';

  function kick(v) {
    if (!v || !v.paused) return;
    var p = v.play();
    if (p && p.catch) p.catch(function (err) {
      /* autoplay can still be refused (Low Power Mode, a strict autoplay policy). The poster is a
         legitimate resting state, so this is not fatal — but never swallow it silently. */
      console.warn('[cardvid] play refused: ' + (err && err.name ? err.name : err));
    });
  }

  var io = ('IntersectionObserver' in window) ? new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) kick(e.target);
      else if (!e.target.paused) e.target.pause();
    });
  }, { threshold: 0.15 }) : null;

  var seen = new WeakSet();
  function attach() {
    document.querySelectorAll(SEL).forEach(function (v) {
      if (seen.has(v)) return;
      seen.add(v);
      v.muted = true;              // belt and braces: a muted *attribute* alone loses to JS state
      v.setAttribute('playsinline', '');
      if (io) io.observe(v); else kick(v);
    });
  }

  attach();
  /* the card lives in a lazily shown panel and the studio home is re-rendered on some paths, so
     re-scan on DOM growth rather than assuming one pass is enough. */
  if ('MutationObserver' in window) {
    new MutationObserver(attach).observe(document.body, { childList: true, subtree: true });
  }
  document.addEventListener('click', function () { setTimeout(attach, 60); }, true);
})();
