/* V2 listing screen (listingLayout tweak).
   NOTE: the listings screen now has ONE job - pick the address - so the "Create template"
   button (#msnf-plus) was removed from the composer and the branding rail has no trigger
   here; the create/upload fork lives on the template picker, where the options are visible.
   The morph below is kept intact for whatever re-opens the rail; branding is part of Templates now,
   so there is no Branding step in the header.

   "Create template" does not open a panel - it BECOMES the panel: a container
   transform (clip-path inset from the button's rect to the rail's rect) with the
   button hidden for the panel's lifetime, reversed on close. No open/close state
   to reconcile beyond the one body class; the origin is always the button.
   Loads last on purpose: mel/27 owns #msnf-plus with a bubble-phase document click
   handler, so the capture listener below has to stop the event before it reaches it. */
(function(){
  var RAIL = 'msafv2-rail-on';
  var EASE = 'cubic-bezier(.2,.8,.24,1)';
  var FULL = 'inset(0px 0px 0px 0px round 0px)';
  function v2(){ return document.body.classList.contains('msafv2'); }
  function btn(){ return document.getElementById('msnf-plus'); }
  function rail(){ return document.getElementById('msafv2-rail'); }
  function isOpen(){ return document.body.classList.contains(RAIL); }
  function reduced(){ return matchMedia('(prefers-reduced-motion:reduce)').matches; }

  /* rect -> clip-path inset on the target element's own box */
  function insetFrom(from, to){
    var t = Math.max(0, from.top - to.top), r = Math.max(0, to.right - from.right),
        b = Math.max(0, to.bottom - from.bottom), l = Math.max(0, from.left - to.left);
    return 'inset(' + t + 'px ' + r + 'px ' + b + 'px ' + l + 'px round 14px)';
  }
  function cancelMorph(el){                 /* fill:'both' keeps finished morphs alive - drop them */
    if(!el.getAnimations) return;
    el.getAnimations().forEach(function(a){ if(a.__morph) a.cancel(); });
  }
  function morph(el, a, b, dur, after){
    cancelMorph(el);
    var anim = el.animate(
      [{ clipPath: a, opacity: a === FULL ? 1 : 0.55 },
       { clipPath: b, opacity: b === FULL ? 1 : 0.55 }],
      { duration: dur, easing: EASE, fill: 'both' });
    anim.__morph = true;
    anim.onfinish = function(){ el.style.clipPath = ''; if(after) after(); };
    anim.oncancel = function(){ if(after) after(); };
    return anim;
  }

  function openRail(){
    var b = btn(), r = rail();
    var from = b ? b.getBoundingClientRect() : null;
    document.body.classList.add(RAIL);
    if(b) b.setAttribute('aria-expanded', 'true');
    var m = document.getElementById('msnf-plusmenu'); if(m) m.classList.remove('open');
    if(!r || !from || reduced()) return;
    morph(r, insetFrom(from, r.getBoundingClientRect()), FULL, 340);
    for(var i = 0; i < r.children.length; i++){
      r.children[i].animate(
        [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }],
        { duration: 220, delay: 110 + i * 30, easing: 'cubic-bezier(.23,1,.32,1)', fill: 'both' });
    }
  }

  function closeRail(){
    var b = btn(), r = rail();
    var done = function(){
      document.body.classList.remove(RAIL);
      if(b) b.setAttribute('aria-expanded', 'false');
    };
    if(!r || !b || reduced()){ done(); return; }
    /* Collapse toward where the button will LAND, not where it sits while the panel
       holds 300px of the row: drop the class, measure, put it back to animate. */
    document.body.classList.remove(RAIL);
    var target = b.getBoundingClientRect();
    document.body.classList.add(RAIL);
    for(var i = 0; i < r.children.length; i++){
      r.children[i].animate([{ opacity: 1 }, { opacity: 0 }], { duration: 120, easing: 'ease', fill: 'both' });
    }
    morph(r, FULL, insetFrom(target, r.getBoundingClientRect()), 260, done);
  }

  document.addEventListener('click', function(e){
    var t = e.target; if(!t || !t.closest) return;
    if(v2() && t.closest('#msnf-plus')){
      e.preventDefault(); e.stopPropagation();
      if(isOpen()) closeRail(); else openRail();
      return;
    }
    if(t.closest('#msafv2-railx')){ closeRail(); return; }
    if(t.closest('#msafv2-back')){
      var v1 = document.getElementById('msaf-back'); if(v1) v1.click(); return;
    }
    if(t.closest('#msafv2-melbtn')){
      if(window.sonner) window.sonner('Building your branding', 'Mel is reading BrandGuide.pdf - palette, logo rules and type.');
      else console.warn('[msafv2] sonner missing, no confirmation shown');
    }
  }, true);

  document.addEventListener('keydown', function(e){ if(e.key === 'Escape' && isOpen()) closeRail(); });
})();

/* Listings zero-state: the empty action just hands focus to the address field. */
(function(){
  document.addEventListener('click', function(e){
    var b = e.target.closest && e.target.closest('#msaf-emptysearch');
    if(!b) return;
    var f = document.getElementById('msnf-addr');
    if(f){ f.focus(); } else { console.warn('[msaf-empty] #msnf-addr missing, nothing to focus'); }
  });
})();
