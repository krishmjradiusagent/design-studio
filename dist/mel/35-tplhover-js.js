/* ---------- Template card hover actions ----------
   Edit template (pencil) : picks this template for the active format, then hands off to the
                            existing package/editor entry (#msaf-package-btn).
   View (eye)             : opens the card's own render, scaled up, in a preview overlay.
   Both stop propagation so the card's select-toggle does not also fire. */
(function(){
  function esc(s){ return (s||'').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }

  function closeView(){
    const v = document.querySelector('.mstplv');
    if(v) v.remove();
    document.removeEventListener('keydown', onKey);
  }
  function onKey(e){ if(e.key === 'Escape') closeView(); }

  function openView(card){
    const photo = card.querySelector('.msafcard-photo');
    if(!photo){ console.warn('[tplhover] card ' + card.dataset.nftpl + ' has no .msafcard-photo to preview'); return; }
    closeView();
    const r = photo.getBoundingClientRect();
    const w = r.width, h = r.height;
    if(!w || !h){ console.warn('[tplhover] preview skipped: photo has no size'); return; }
    const k = Math.min((window.innerWidth - 96) / w, (window.innerHeight - 190) / h, 2.6);
    const name = (card.querySelector('.msafcard-addr') || {}).textContent || 'Template';

    const clone = photo.cloneNode(true);
    clone.removeAttribute('aria-hidden');
    clone.querySelectorAll('.msafcard-tplhover,.msaf-favbtn').forEach(n => n.remove());
    clone.style.cssText += ';width:' + w + 'px;height:' + h + 'px;transform:scale(' + k + ')';

    const v = document.createElement('div');
    v.className = 'mstplv';
    v.setAttribute('role','dialog');
    v.setAttribute('aria-modal','true');
    v.setAttribute('aria-label', name + ' preview');
    v.innerHTML =
      '<div class="mstplv-stage" style="width:' + (w * k) + 'px;height:' + (h * k) + 'px"></div>' +
      '<div class="mstplv-bar"><span class="mstplv-name">' + esc(name) + '</span>' +
      '<button class="mstplv-close" type="button" title="Close preview" aria-label="Close preview">' +
      '<i class="ph ph-x" aria-hidden="true"></i></button></div>';
    v.querySelector('.mstplv-stage').appendChild(clone);
    v.addEventListener('click', e => { if(e.target === v || e.target.closest('.mstplv-close')) closeView(); });
    document.body.appendChild(v);
    document.addEventListener('keydown', onKey);
    const c = v.querySelector('.mstplv-close'); if(c) c.focus();
  }

  /* ---------- floating bar: Selected · N + picked-template thumbs ---------- */
  function pickedCards(){
    const keys = (window.__pkgPickedKeys && window.__pkgPickedKeys()) || [];
    return keys.map(k => document.querySelector('.msafcard--tpl[data-nftpl="' + k + '"]')).filter(Boolean);
  }
  /* every card shares one photo box size; take it from any laid-out card */
  function refPhotoSize(){
    const cards = document.querySelectorAll('.msafcard--tpl:not(.hide) .msafcard-photo');
    for(const p of cards){ const r = p.getBoundingClientRect(); if(r.width && r.height) return r; }
    return null;
  }
  function thumbOf(card, ref){
    const box = document.createElement('span');
    box.className = 'msaf-selthumb';
    const src = card.querySelector('.msafcard-photo');
    if(!src || !ref){ console.warn('[tplhover] no render to thumb for ' + card.dataset.nftpl); return box; }
    const k = 28 / ref.width;
    const clone = src.cloneNode(true);
    clone.removeAttribute('aria-hidden');
    clone.querySelectorAll('.msafcard-tplhover,.msaf-favbtn,.msafcard-status,.msafcard-melbadge').forEach(n => n.remove());
    clone.style.cssText += ';width:' + ref.width + 'px;height:' + ref.height + 'px;transform:scale(' + k + ')';
    box.appendChild(clone);
    return box;
  }
  function closePickedMenu(menu, focusTrigger){
    if(!menu) return;
    menu.hidden = true;
    menu.style.display = 'none';
    const trigger = menu.parentElement && menu.parentElement.querySelector('.msaf-selthumb-trigger');
    if(trigger){
      trigger.setAttribute('aria-expanded', 'false');
      if(focusTrigger) trigger.focus();
    }
  }
  document.addEventListener('click', e => {
    document.querySelectorAll('.msaf-selthumb-menu:not([hidden])').forEach(menu => {
      if(!menu.parentElement.contains(e.target)) closePickedMenu(menu, false);
    });
  });
  document.addEventListener('keydown', e => {
    const root = e.target.closest && e.target.closest('.msaf-selthumbs');
    const menu = root && root.querySelector('.msaf-selthumb-menu');
    if(!menu || menu.hidden) return;
    if(e.key === 'Escape'){
      e.preventDefault();
      closePickedMenu(menu, true);
      return;
    }
    if(e.key === 'Tab'){
      setTimeout(() => closePickedMenu(menu, false), 0);
      return;
    }
    if(!['ArrowDown','ArrowUp','Home','End'].includes(e.key)) return;
    const items = [...menu.querySelectorAll('[role="menuitem"]')];
    if(!items.length) return;
    e.preventDefault();
    const current = items.indexOf(document.activeElement);
    const next = e.key === 'Home' ? 0 : e.key === 'End' ? items.length - 1
      : current < 0 ? (e.key === 'ArrowDown' ? 0 : items.length - 1)
      : (current + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
    items.forEach((item, i) => { item.tabIndex = i === next ? 0 : -1; });
    items[next].focus();
  });
  const BAR = {
    paint(){
      const wrap = document.querySelector('.msaf-actionbar');
      if(!wrap) return;
      const cnt = wrap.querySelector('.msaf-selcnt'), thumbs = wrap.querySelector('.msaf-selthumbs'),
            prev = document.getElementById('msaf-preview-btn');
      const cards = pickedCards();
      if(cnt) cnt.textContent = cards.length;
      if(prev) prev.disabled = cards.length === 0;
      if(!thumbs) return;
      thumbs.textContent = '';
      if(!cards.length) return;
      thumbs.style.position = 'relative';
      const ref = refPhotoSize();
      const trigger = document.createElement('button');
      trigger.type = 'button';
      trigger.className = 'rds-btn rds-btn--ghost rds-btn--icon rds-btn--sm msaf-selthumb-trigger';
      trigger.setAttribute('aria-label', 'Show selected templates');
      trigger.setAttribute('aria-haspopup', 'menu');
      trigger.setAttribute('aria-expanded', 'false');
      trigger.setAttribute('aria-controls', 'msaf-selected-templates-menu');
      trigger.innerHTML = '<i class="ph ph-caret-down" aria-hidden="true" style="font-size:16px"></i>';
      const menu = document.createElement('div');
      menu.className = 'rds-menu msaf-selthumb-menu';
      menu.id = 'msaf-selected-templates-menu';
      menu.setAttribute('role', 'menu');
      menu.setAttribute('aria-label', 'Selected templates');
      menu.hidden = true;
      menu.style.cssText = 'position:absolute;bottom:calc(100% + var(--space-1-5));left:0;z-index:60;width:max-content;display:none';
      cards.forEach(card => {
        const item = document.createElement('div');
        item.className = 'rds-menu__item';
        item.setAttribute('role', 'menuitem');
        item.tabIndex = -1;
        item.style.whiteSpace = 'nowrap';
        const name = document.createElement('span');
        name.textContent = ((card.querySelector('.msafcard-addr') || {}).textContent || card.dataset.nftpl || 'Template').trim();
        name.style.whiteSpace = 'nowrap';
        item.append(thumbOf(card, ref), name);
        menu.appendChild(item);
      });
      trigger.addEventListener('click', e => {
        e.stopPropagation();
        const open = menu.hidden;
        menu.hidden = !open;
        menu.style.display = open ? 'block' : 'none';
        trigger.setAttribute('aria-expanded', String(open));
        if(open && e.detail === 0){
          const first = menu.querySelector('[role="menuitem"]');
          if(first){ first.tabIndex = 0; first.focus(); }
        }
      });
      trigger.addEventListener('keydown', e => {
        if(e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
        e.preventDefault();
        menu.hidden = false;
        menu.style.display = 'block';
        trigger.setAttribute('aria-expanded', 'true');
        const items = [...menu.querySelectorAll('[role="menuitem"]')];
        if(!items.length) return;
        const next = e.key === 'ArrowDown' ? 0 : items.length - 1;
        items.forEach((item, i) => { item.tabIndex = i === next ? 0 : -1; });
        items[next].focus();
      });
      thumbs.append(trigger, menu);
    }
  };
  window.MELTPLBAR = BAR;

  function openEdit(card){
    /* make sure this template is the one the editor opens with */
    const box = card.querySelector('[data-nfcheck]');
    if(box && !box.checked) card.click();
    const go = document.getElementById('msaf-package-btn');
    if(go) go.click();
    else console.warn('[tplhover] no #msaf-package-btn — cannot open the editor');
  }

  /* Preview all — every picked template, side by side, in the same overlay */
  function openViewAll(){
    const cards = pickedCards();
    if(!cards.length) return;
    if(cards.length === 1){ openView(cards[0]); return; }
    closeView();
    const ref = refPhotoSize();
    if(!ref){ console.warn('[tplhover] preview all skipped: no laid-out card to size from'); return; }
    const per = Math.min((window.innerWidth - 96 - 16 * (cards.length - 1)) / cards.length, 300);
    const k = Math.min(per / ref.width, (window.innerHeight - 190) / ref.height);
    const v = document.createElement('div');
    v.className = 'mstplv';
    v.setAttribute('role','dialog');
    v.setAttribute('aria-modal','true');
    v.setAttribute('aria-label','Preview of ' + cards.length + ' selected templates');
    v.innerHTML = '<div class="mstplv-row"></div>' +
      '<div class="mstplv-bar"><span class="mstplv-name">' + cards.length + ' selected templates</span>' +
      '<button class="mstplv-close" type="button" title="Close preview" aria-label="Close preview">' +
      '<i class="ph ph-x" aria-hidden="true"></i></button></div>';
    const row = v.querySelector('.mstplv-row');
    cards.forEach(card => {
      const src = card.querySelector('.msafcard-photo');
      if(!src){ console.warn('[tplhover] ' + card.dataset.nftpl + ' has no render'); return; }
      const stage = document.createElement('div');
      stage.className = 'mstplv-stage';
      stage.style.cssText = 'width:' + (ref.width * k) + 'px;height:' + (ref.height * k) + 'px';
      const clone = src.cloneNode(true);
      clone.removeAttribute('aria-hidden');
      clone.querySelectorAll('.msafcard-tplhover,.msaf-favbtn').forEach(n => n.remove());
      clone.style.cssText += ';width:' + ref.width + 'px;height:' + ref.height + 'px;transform:scale(' + k + ')';
      stage.appendChild(clone);
      row.appendChild(stage);
    });
    v.addEventListener('click', e => { if(e.target === v || e.target.closest('.mstplv-close')) closeView(); });
    document.body.appendChild(v);
    document.addEventListener('keydown', onKey);
    const c = v.querySelector('.mstplv-close'); if(c) c.focus();
  }
  document.addEventListener('click', e => {
    if(e.target.closest('#msaf-preview-btn')){
      e.preventDefault();
      if(window.MELTPLPV) window.MELTPLPV.openAll(); else openViewAll();
      return;
    }
    const btn = e.target.closest('[data-tplact]');
    if(!btn) return;
    /* carousel is mel/41's action — leave it alone, or this capture handler would
       stopImmediatePropagation() and open the editor instead */
    if(btn.dataset.tplact !== 'edit' && btn.dataset.tplact !== 'view') return;
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    const card = btn.closest('.msafcard--tpl');
    if(!card){ console.warn('[tplhover] action button outside a template card'); return; }
    if(btn.dataset.tplact === 'view'){
      if(window.MELTPLPV) window.MELTPLPV.openOne(card); else openView(card);
    } else openEdit(card);
  }, true);
})();
