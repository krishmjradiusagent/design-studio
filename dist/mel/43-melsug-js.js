/* ---------- mel/43 — one "Mel suggests" per format tab.
   The format tabs live as body classes (msaf-fmt-*, see mel/27). For each format
   Mel has one pick; the class moves with the tab, so exactly one card in view
   ever carries the label. Card layout is untouched — display only. ---------- */
(function(){
  const FMTS = ['post','story','reel','flier','site','email','cards','signs','carousel'];
  /* Mel's pick per format — the template she would use for this share */
  const PICK = { post:'wave', story:'editorial', reel:'wave', carousel:'carousel',
                 flier:'feature', site:'website', email:'feature',
                 cards:'card-1', signs:'sign-1' };

  const activeFmt = () => FMTS.find(f => document.body.classList.contains('msaf-fmt-' + f)) || 'post';

  function paint(){
    const key = PICK[activeFmt()];
    const cards = document.querySelectorAll('.msafcard--tpl');
    if(!cards.length) return;
    let hit = 0;
    cards.forEach(c => {
      const on = c.dataset.nftpl === key;
      c.classList.toggle('melsug-on', on);
      if(on) hit++;
    });
    if(!hit) console.warn('[melsug] no card for Mel\'s pick "' + key + '" on the ' + activeFmt() + ' tab');
  }

  new MutationObserver(paint).observe(document.body, { attributes:true, attributeFilter:['class'] });
  const grid = document.querySelector('.msafgrid') || document.body;
  new MutationObserver(() => requestAnimationFrame(paint)).observe(grid, { childList:true });
  paint();
})();
