/* Flyer asset in the package editor: Print size picker (top of the canvas) + Print in the floating bar. */
(function(){
  const edit = document.querySelector('.pkedit'), main = edit && edit.querySelector('.main'), acts = document.getElementById('pke-acts'), stack = document.getElementById('pke-stack');
  if(!edit || !main || !acts || !stack){ console.warn('[flyer-print] editor shell not found'); return; }
  const SIZES = [
    { k:'letter', n:'Letter', d:'8.5 × 11 in', r:'8.5/11', w:'320px', rw:8.5, rh:11 },
    { k:'a4', n:'A4', d:'210 × 297 mm', r:'210/297', w:'310px', rw:210, rh:297 },
    { k:'half', n:'Half page', d:'5.5 × 8.5 in', r:'5.5/8.5', w:'290px', rw:5.5, rh:8.5 },
    { k:'post', n:'Postcard', d:'6 × 4 in', r:'6/4', w:'460px', rw:6, rh:4 }
  ];
  const P = { size:'letter', bleed:true, marks:true };
  const bar = document.createElement('div'); bar.id = 'pke-psize';
  main.appendChild(bar);
  const paintBar = () => {
    bar.innerHTML = '<span class="pl">Print size</span><div class="po">' + SIZES.map(z => {
      const h = 16, w = Math.max(10, Math.round(h * z.rw / z.rh));
      return '<button type="button" data-psz="' + z.k + '" class="' + (z.k === P.size ? 'on' : '') + '"><i style="width:' + w + 'px;height:' + h + 'px"></i>' + z.n + '<small>' + z.d + '</small></button>';
    }).join('') + '</div>';
  };
  const apply = () => {
    const z = SIZES.find(x => x.k === P.size);
    edit.style.setProperty('--pk-r', z.r); edit.style.setProperty('--pk-w', z.w);
    edit.classList.toggle('pk-bleed', P.bleed);
    paintBar();
  };
  /* Print button joins the floating bar: Regenerate | Print | Save */
  const save = document.getElementById('pke-save');
  const sep = document.createElement('span'); sep.className = 'sep'; sep.id = 'pke-printsep'; sep.setAttribute('aria-hidden', 'true');
  const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'tx'; btn.id = 'pke-print'; btn.title = 'Print'; btn.setAttribute('aria-label', 'Print');
  btn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9V3h12v6"/><rect x="3" y="9" width="18" height="9" rx="2"/><path d="M7 14h10v7H7z"/></svg><span class="lb">Print</span>';
  if(save){ acts.insertBefore(sep, save); acts.insertBefore(btn, save); } else { acts.appendChild(sep); acts.appendChild(btn); }

  const sync = () => {
    const a = stack.querySelector('.pkast.active');
    edit.classList.toggle('pk-isflyer', !!a && a.dataset.pk === 'flyer');
  };
  new MutationObserver(sync).observe(stack, { attributes:true, attributeFilter:['class'], subtree:true, childList:true });
  sync(); apply();

  const dlgw = document.createElement('div'); dlgw.className = 'pkp-w';
  (document.querySelector('.melwrap') || document.body).appendChild(dlgw);
  const close = () => dlgw.classList.remove('open');
  const open = () => {
    const z = SIZES.find(x => x.k === P.size);
    dlgw.innerHTML = '<div class="pkp"><div class="hd"><h3>Print flyer</h3><p>' + z.n + ' · ' + z.d + '</p></div><div class="bd">' +
      '<div class="rw"><span>Add 0.125 in bleed<small>Background runs to the trim edge</small></span><button type="button" class="tg' + (P.bleed ? ' on' : '') + '" data-pp="bleed" aria-label="Bleed"></button></div>' +
      '<div class="rw"><span>Crop marks<small>Printers use these to trim the sheet</small></span><button type="button" class="tg' + (P.marks ? ' on' : '') + '" data-pp="marks" aria-label="Crop marks"></button></div></div>' +
      '<div class="ft"><span class="sp"></span><button type="button" class="b" data-pp="close">Cancel</button><button type="button" class="b pri" data-pp="go">Download print PDF</button></div></div>';
    dlgw.classList.add('open');
  };
  const run = () => {
    dlgw.innerHTML = '<div class="pkp"><div class="hd"><h3>Preparing your file</h3></div><div class="bd"><div class="prog"><i id="pkp-pr"></i></div></div></div>';
    let p = 0; const iv = setInterval(() => { p += 22; const el = document.getElementById('pkp-pr'); if(el) el.style.width = Math.min(p, 100) + '%';
      if(p >= 100){ clearInterval(iv); close(); if(window.sonner) sonner('Print PDF ready', SIZES.find(x => x.k === P.size).n + (P.bleed ? ' · with bleed' : '') + (P.bleed && P.marks ? ' and crop marks' : '')); } }, 240);
  };
  document.addEventListener('click', e => {
    const s = e.target.closest('[data-psz]');
    if(s){ P.size = s.dataset.psz; apply(); return; }
    if(e.target.closest('#pke-print')){ open(); return; }
    const b = e.target.closest('[data-pp]');
    if(b){
      const a = b.dataset.pp;
      if(a === 'close') close();
      else if(a === 'go') run();
      else { P[a] = !P[a]; apply(); open(); }
      return;
    }
    if(e.target === dlgw) close();
  });
})();
