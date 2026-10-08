/* ---------- mel/45 — carousel template slide switching on the card.
   Two entry points, one state: the rest-state dots and the hover-overlay stepper
   both call show(card, i). The photo list is MELSTUDIO.PHOTOS (objects:
   {c, n, img}); the card art writes its photo as an inline background-image on
   .ph, and slide 0 keeps the card's own hero. Card layout is never touched. */
(function(){
  function photos(){
    const p = (window.MELSTUDIO && window.MELSTUDIO.PHOTOS) || [];
    if(!Array.isArray(p)) return [];
    return p.map(x => (x && (x.img || x.src)) || (typeof x === 'string' ? x : '')).filter(Boolean);
  }

  /* count and position come from the counter itself — "1/6" */
  function total(card){
    const ct = card.querySelector('[data-carstep] .ct');
    const m = ct && (ct.textContent || '').match(/\/\s*(\d+)/);
    return m ? (parseInt(m[1], 10) || 1) : 1;
  }
  function current(card){
    const lab = card.querySelector('[data-carstep-i]');
    return lab ? Math.max(0, (parseInt(lab.textContent, 10) || 1) - 1) : 0;
  }

  function show(card, i){
    const n = total(card);
    const idx = Math.max(0, Math.min(n - 1, i));
    const step = card.querySelector('[data-carstep]');
    if(step){
      const lab = step.querySelector('[data-carstep-i]');
      if(lab) lab.textContent = idx + 1;
      const prev = step.querySelector('[data-carstep-btn="prev"]');
      const next = step.querySelector('[data-carstep-btn="next"]');
      if(prev){ if(idx === 0) prev.dataset.off = 'true'; else delete prev.dataset.off; }
      if(next){ if(idx === n - 1) next.dataset.off = 'true'; else delete next.dataset.off; }
    }
    const art = card.querySelector('[data-carart]');
    const ph = art && art.querySelector('.ph');
    const list = photos();
    if(!ph || !list.length){
      console.warn('[cartpl] no card art photo to switch on ' + card.dataset.nftpl);
      return;
    }
    const base = ph.dataset.carbase || (ph.dataset.carbase = ph.style.backgroundImage);
    ph.style.backgroundImage = idx === 0 ? base : "url('" + list[idx % list.length] + "')";
  }

  document.addEventListener('click', e => {
    if(!e.target.closest) return;
    const btn = e.target.closest('[data-carstep-btn]');
    if(!btn) return;
    const card = btn.closest('.msafcard--tpl');
    if(!card) return;
    e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
    show(card, current(card) + (btn.dataset.carstepBtn === 'prev' ? -1 : 1));
  }, true);

  /* paint the initial disabled arrow on every carousel card */
  document.querySelectorAll('.msafcard--tpl [data-carstep]').forEach(s => {
    const card = s.closest('.msafcard--tpl');
    if(card) show(card, current(card));
  });
})();
