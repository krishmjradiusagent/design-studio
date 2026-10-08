/* Marketing Studio sidebar tab: palette icon under Mel opens Studio; Library is a tab inside it. The old Mel-rail rows stay in the DOM (other scripts click them) but are hidden. */
(function(){
  const page = document.getElementById('mel-page'), nav = document.getElementById('nav-studio'), tabs = document.getElementById('ms-tabs');
  const melPill = document.querySelector('.sidebar .mel');
  if(!page || !nav){ console.warn('[ms-sidebar] #mel-page or #nav-studio missing'); return; }
  const inStudio = () => page.classList.contains('studio') || page.classList.contains('library');
  const sync = () => {
    nav.classList.toggle('on', inStudio());
    if(tabs){ const lib = page.classList.contains('library'); document.querySelectorAll('[data-mstab]').forEach(b => b.setAttribute('aria-selected', String((b.dataset.mstab === 'library') === lib))); }
  };
  nav.setAttribute('role', 'button'); nav.setAttribute('tabindex', '0');
  const openStudio = e => {
    if(e) e.stopPropagation();
    if(window.MEL && window.MEL.openMel) window.MEL.openMel();
    const r = document.getElementById('ms-navstudio'); if(r) r.click(); else console.warn('[ms-sidebar] #ms-navstudio missing');
    sync();
  };
  nav.addEventListener('click', openStudio);
  nav.addEventListener('keydown', e => { if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); openStudio(e); } });
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-mstab]'); if(!b) return;
    const r = document.getElementById(b.dataset.mstab === 'library' ? 'ms-navlib' : 'ms-navstudio'); if(r) r.click();
    sync();
  });
  /* Mel pill is inert: this file is the Design studio only. */
  document.addEventListener('click', e => { if(e.target.closest && e.target.closest('.sidebar .mel')){ e.preventDefault(); e.stopPropagation(); } }, true);
  /* Turn every Design studio pill into a two-segment pill: Design studio | Library. */
  const lbc = document.querySelector('#ms-library .lbcrumb');
  if(lbc && !document.querySelector('#ms-library .msaf-eb')){ const eb = document.createElement('div'); eb.className = 'msaf-eb lbeb'; lbc.parentNode.insertBefore(eb, lbc); }
  document.querySelectorAll('.msaf-eb').forEach(eb => {
    eb.setAttribute('role', 'tablist'); eb.setAttribute('aria-label', 'Design studio');
    eb.innerHTML = '<button type="button" class="msaf-seg" role="tab" data-mstab="studio" aria-selected="true"><span class="msaf-ebring" aria-hidden="true"></span><span class="msaf-ebtx">Design studio</span></button><button type="button" class="msaf-seg" role="tab" data-mstab="library" aria-selected="false"><span class="msaf-ebring" aria-hidden="true"></span><span class="msaf-ebtx">Library</span></button>';
  });
  new MutationObserver(sync).observe(page, { attributes:true, attributeFilter:['class'] });
  sync();
  /* Land in Marketing Studio by default. */
  let tries = 0;
  const land = () => { if(inStudio()) return; openStudio(); if(!inStudio() && ++tries < 30) setTimeout(land, 150); };
  setTimeout(land, 60);
})();
