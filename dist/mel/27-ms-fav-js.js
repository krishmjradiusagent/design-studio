/* Template favourites (reusable across listings) + the upload conversation. Additive. */
(function(){
  const B = document.body, KEY = 'crm-tplfavs';
  let favs = [];
  try { favs = JSON.parse(localStorage.getItem(KEY) || '[]') || []; } catch(_){ console.warn('[tplfavs] unreadable store'); favs = []; }
  B.classList.add('msaf-fmt-post');

  const cards = () => document.querySelectorAll('.msafcard--tpl[data-nftpl]');
  /* injected cards live for one session only — drop their keys so the count can't outlive them */
  function prune(){
    const live = new Set([...cards()].map(c => c.dataset.nftpl));
    const before = favs.length;
    favs = favs.filter(k => live.has(k));
    if(favs.length !== before) save();
  }
  function save(){ try { localStorage.setItem(KEY, JSON.stringify(favs)); } catch(_){ console.warn('[tplfavs] write failed'); } }

  function paint(){
    cards().forEach(c => {
      const on = favs.indexOf(c.dataset.nftpl) >= 0;
      c.classList.toggle('fav', on);
      const b = c.querySelector('.msaf-favbtn');
      if(b){
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
        b.title = on ? 'Remove from favourites' : 'Save to favourites';
        b.setAttribute('aria-label', b.title);
      }
    });
    const cnt = document.getElementById('msaf-favcnt');
    if(cnt) cnt.textContent = favs.length;
    applyFilter();
  }

  /* ---- source filter: All / Radius / Your templates / Favourites ----
     One state, four tabs. The mask is recomputed from data-nfformats every time, so it
     composes with the format tabs instead of fighting them over .hide. */
  const FMTS = ['post','story','reel','flier','site','email','cards','signs','carousel'];
  const SRCS = ['all','radius','mine','fav'];
  let src = 'all';
  const isMine = c => c.dataset.nfcat === 'Uploaded' || /^up-/.test(c.dataset.nftpl || '');
  const activeFmt = () => FMTS.find(x => B.classList.contains('msaf-fmt-' + x)) || 'post';
  const inFmt = c => (c.dataset.nfformats || '').split(/\s+/).includes(activeFmt());

  function counts(){
    const live = [...cards()].filter(c => !c.hasAttribute('hidden'));
    const base = live.filter(inFmt);
    const mine = live.filter(isMine);
    const set = (id, n) => { const el = document.getElementById(id); if(el) el.textContent = n; };
    set('msaf-tplcnt', base.length);
    set('msaf-radiuscnt', base.filter(c => !isMine(c)).length);
    set('msaf-minecnt', mine.length);
    set('msaf-favcnt', favs.length);
    B.classList.toggle('msaf-minezero', mine.length === 0);
  }

  /* Favourites ignores the format tabs — a favourite is reusable on any listing. */
  function applyFilter(){
    if(src === 'fav'){
      cards().forEach(c => c.classList.toggle('hide', !c.classList.contains('fav')));
      B.classList.toggle('msaf-favzero', document.querySelectorAll('.msafcard--tpl.fav:not([hidden])').length === 0);
    } else {
      cards().forEach(c => {
        const mine = isMine(c);
        const ok = inFmt(c) && (src === 'all' ? true : src === 'mine' ? mine : !mine);
        c.classList.toggle('hide', !ok);
      });
    }
    counts();
  }

  /* fav toggle — capture phase so the card's own select handler never fires */
  document.addEventListener('click', e => {
    const fb = e.target.closest && e.target.closest('[data-msfav]');
    if(!fb) return;
    e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
    const card = fb.closest('.msafcard--tpl');
    if(!card) return;
    const k = card.dataset.nftpl, i = favs.indexOf(k);
    const name = (card.querySelector('.msafcard-addr') || {}).textContent || 'Template';
    if(i >= 0) favs.splice(i, 1); else favs.push(k);
    save(); paint();
    if(window.sonner) sonner(i >= 0 ? 'Removed from favourites' : 'Saved to favourites',
      i >= 0 ? name + ' will not be pinned on new listings' : name + ' now shows up on every listing you open');
  }, true);

  /* travelling underline: one bar, positioned off the selected tab's box */
  function posInd(){
    const list = document.querySelector('.msaf-vtabs .rds-tabs__list');
    if(!list) return;
    const on = list.querySelector('.msaf-vtab[aria-selected="true"]');
    if(!on || !on.offsetWidth){ console.warn('[vtabs] no measurable selected tab'); return; }
    list.style.setProperty('--vt-x', on.offsetLeft + 'px');
    list.style.setProperty('--vt-w', on.offsetWidth);
    requestAnimationFrame(() => list.setAttribute('data-vtready',''));
  }
  window.__msPosTabInd = posInd;
  (function watchInd(){
    const list = document.querySelector('.msaf-vtabs .rds-tabs__list');
    if(!list){ requestAnimationFrame(watchInd); return; }
    requestAnimationFrame(posInd);
    if(window.ResizeObserver) new ResizeObserver(posInd).observe(list);
    const lab = document.getElementById('msaf-tpllab');
    if(lab) new MutationObserver(posInd).observe(lab, {childList:true, characterData:true, subtree:true});
    const cnt = document.getElementById('msaf-tplcnt');
    if(cnt) new MutationObserver(posInd).observe(cnt, {childList:true, characterData:true, subtree:true});
  })();

  /* sync the four source tabs — aria-selected drives the travelling underline */
  function syncTabs(){
    document.querySelectorAll('.msaf-vtab[data-msrc]').forEach(b => {
      const on = b.dataset.msrc === src;
      b.setAttribute('aria-selected', on ? 'true' : 'false');
      if(b.hasAttribute('aria-pressed')) b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    SRCS.forEach(s => B.classList.toggle('msaf-src-' + s, s === src));
    B.classList.toggle('msaf-favon', src === 'fav');
    posInd();
  }

  /* source tab click */
  document.addEventListener('click', e => {
    const st = e.target.closest && e.target.closest('[data-msrc]');
    if(st){
      if(st.dataset.msrc !== src){ src = st.dataset.msrc; syncTabs(); applyFilter(); }
      return;
    }
    /* format tab → mirror the active format onto <body> for the dropbox label; source stays */
    const fm = e.target.closest && e.target.closest('[data-nfformat]');
    if(fm){
      const f = fm.dataset.nfformat;
      FMTS.forEach(x => B.classList.toggle('msaf-fmt-' + x, x === f));
      setTimeout(applyFilter, 0);
    }
  });

  /* ================= upload a template: one conversation, no stepper =================
     Mel asks one question at a time. Answers come from the clickable suggestions or
     from the composer at the bottom — the same bar the studio uses. */
  const m = document.getElementById('msaf-upmodal');
  const box = document.getElementById('msaf-upbox');
  const $ = id => document.getElementById(id);
  const U = { cat:'post', label:'Post', uses:[], name:'', file:null, brand:null,
              link:'', fontMode:'match', font:'Mona Sans', cdn:'', team:true, def:false };
  const PREVH = { post:120, story:154, reel:154, flier:134, email:96, site:92, carousel:120, cards:80 };
  const FMTCLS = ['post','story','reel','flier','site','email','cards','signs','carousel'];
  const LABELS = { post:'Post', story:'Story', reel:'Reel', flier:'Flyer', email:'Emailer',
                   site:'Website / listing page', carousel:'Carousel', cards:'Business card', signs:'Yard sign' };
  const ORDER = ['ref','kind','use','name','font','build','share','def'];
  const PLACE = {
    ref:'Paste a Canva, Figma or website link',
    kind:'Or type what it is — “story”, “flyer”…',
    use:'Or type a use case of your own',
    name:'Type a name for the gallery',
    font:'Or type the font you want',
    build:'Tell Mel what to change',
    share:'Or type who should get it',
    def:'Or type yes or no'
  };
  let cur = 'ref';

  const qEl = n => box ? box.querySelector('.msup-q[data-q="' + n + '"]') : null;
  const bar = () => $('msaf-upbarin');

  function setAns(step, text){
    const q = qEl(step); if(!q) return;
    const a = q.querySelector('.msup-ans');
    if(a) a.textContent = text;
    q.classList.add('done');
  }
  function show(step){
    const q = qEl(step); if(!q) { console.warn('[tplup] no question ' + step); return; }
    cur = step;
    q.classList.remove('done');
    q.classList.add('on');
    const b = bar();
    if(b){ b.value = ''; b.placeholder = PLACE[step] || 'Answer Mel'; }
    const bd = $('msaf-upbd');
    if(bd) requestAnimationFrame(() => { bd.scrollTop = bd.scrollHeight; });
    if(step === 'build') runScan();
    if(step === 'use') syncUseDone();
  }
  function advance(from){
    const i = ORDER.indexOf(from);
    const next = ORDER[i + 1];
    if(next) setTimeout(() => show(next), 220);
  }
  function answered(step, text){ setAns(step, text); advance(step); }

  function reset(){
    if(!box) return;
    U.uses = []; U.name = ''; U.file = null; U.brand = null; U.link = '';
    U.fontMode = 'match'; U.font = 'Mona Sans'; U.cdn = ''; U.team = true; U.def = false;
    const active = FMTCLS.find(f => B.classList.contains('msaf-fmt-' + f)) || 'post';
    U.cat = active; U.label = LABELS[active] || 'Post';
    box.querySelectorAll('.msup-q').forEach(q => {
      q.classList.remove('on','done');
      const a = q.querySelector('.msup-ans'); if(a) a.textContent = '';
    });
    box.querySelectorAll('[data-upuse]').forEach(x => x.setAttribute('aria-pressed','false'));
    const row = $('msaf-upfilerow'); if(row) row.hidden = true;
    const fonts = $('msaf-upfonts'); if(fonts) fonts.hidden = true;
    const res = $('msaf-upres'); if(res) res.hidden = true;
    const scan = $('msaf-upscan'); if(scan){ scan.hidden = false; scan.querySelectorAll('li').forEach(r => r.classList.remove('done')); }
    const log = $('msaf-uplog'); if(log){ log.hidden = true; log.innerHTML = ''; }
    const ch = $('msaf-upchanges'); if(ch) ch.classList.remove('show');
    const prev = $('msaf-upprev');
    if(prev){ prev.style.removeProperty('--mel-accent'); const a2 = prev.querySelector('.msup-prevaddr'); if(a2) a2.style.fontSize = ''; }
    ['msaf-upinput','msaf-upbrandinput'].forEach(id => { const f = $(id); if(f) f.value = ''; });
    closePlus();
    show('ref');
  }

  function openUp(start){
    /* v2 owns this screen now (mel/33): it opens inside the templates card instead of
       covering the studio with this old thread UI. The .msup markup is gone, so without
       the hand-off there is nothing left to render. */
    if(window.MELTPLUP){ window.MELTPLUP.open(start); return; }
    if(!m){ console.warn('[tplup] upload screen missing — mel/33 did not load'); return; }
    m.classList.add('open');
    m.setAttribute('aria-hidden','false');
    reset();
    /* the CTA already said where the design comes from — open that door straight away */
    if(start === 'brand' || start === 'image'){
      setTimeout(() => pickRef(start === 'brand' ? 'brand' : 'file'), 260);
      return;
    }
    setTimeout(() => { const b = bar(); if(b) b.focus(); }, 60);
  }
  function closeUp(){ if(!m) return; m.classList.remove('open'); m.setAttribute('aria-hidden','true'); closePlus(); }

  /* ---- composer + menu ---- */
  function openPlus(){ const mn = $('msaf-upplusmenu'), b = $('msaf-upplus'); if(mn) mn.classList.add('open'); if(b) b.setAttribute('aria-expanded','true'); }
  function closePlus(){ const mn = $('msaf-upplusmenu'), b = $('msaf-upplus'); if(mn) mn.classList.remove('open'); if(b) b.setAttribute('aria-expanded','false'); }

  function pickRef(kind){
    closePlus();
    if(kind === 'file'){ const i = $('msaf-upinput'); if(i){ i.value = ''; i.click(); } return; }
    if(kind === 'brand'){ const i = $('msaf-upbrandinput'); if(i){ i.value = ''; i.click(); } return; }
    const b = bar();
    if(b){ b.placeholder = 'Paste the link — Canva, Figma or a live page'; b.focus(); }
  }

  /* ---- reference file ---- */
  function showFileRow(f){
    const row = $('msaf-upfilerow'), nm = $('msaf-upfilename'), sub = $('msaf-upfile'), bar2 = $('msaf-upbar');
    if(!row){ console.warn('[tplup] file row missing'); return; }
    row.hidden = false;
    if(nm) nm.textContent = f.name;
    const kb = f.size ? (f.size > 1048576 ? (f.size / 1048576).toFixed(1) + ' MB' : Math.round(f.size / 1024) + ' KB') : '';
    const stub = (f.name.split('.').pop() || '').toUpperCase() + (kb ? ' \u00b7 ' + kb : '');
    if(sub) sub.textContent = stub + ' \u00b7 uploading\u2026';
    if(bar2){ bar2.style.width = '0'; requestAnimationFrame(() => { bar2.style.width = '62%'; }); }
    setTimeout(() => {
      if(bar2) bar2.style.width = '100%';
      if(sub) sub.textContent = stub + ' \u00b7 read';
    }, 1000);
  }
  function takeFile(f){
    if(!f) return;
    U.file = f;
    showFileRow(f);
    if(cur === 'ref') answered('ref', f.name + ' — got it.');
  }

  /* ---- Mel reads the reference ---- */
  function runScan(){
    const scan = $('msaf-upscan'), res = $('msaf-upres'), changes = $('msaf-upchanges');
    if(!scan || !res){ console.warn('[tplup] preview nodes missing'); return; }
    scan.hidden = false; res.hidden = true;
    if(changes) changes.classList.remove('show');
    const rows = scan.querySelectorAll('.msup-scanlist li');
    rows.forEach(r => r.classList.remove('done'));
    rows.forEach((r, i) => setTimeout(() => r.classList.add('done'), 420 * (i + 1)));
    setTimeout(() => {
      scan.hidden = true; res.hidden = false;
      if(changes) changes.classList.add('show');
      paintPreview();
      const bd = $('msaf-upbd');
      if(bd) requestAnimationFrame(() => { bd.scrollTop = bd.scrollHeight; });
    }, 420 * rows.length + 320);
  }

  function paintPreview(){
    const prev = $('msaf-upprev');
    if(!prev){ console.warn('[tplup] preview frame missing'); return; }
    const addr = prev.querySelector('.msup-prevaddr');
    const photo = prev.querySelector('.msup-prevphoto');
    const eyebrow = prev.querySelector('.msup-preveyebrow');
    const fam = U.fontMode === 'cdn' ? 'Mona Sans' : U.font;
    if(addr) addr.style.fontFamily = "'" + fam + "', 'Mona Sans', system-ui";
    if(photo) photo.style.height = (PREVH[U.cat] || 120) + 'px';
    if(eyebrow) eyebrow.textContent = U.uses[0] || 'Just listed';
    const t = $('msaf-upmtype');
    if(t) t.textContent = U.fontMode === 'match' ? fam + ' — closest free match to your reference'
      : U.fontMode === 'cdn' ? (U.cdn ? 'Loaded from your CDN link' : 'Your CDN link') : fam;
    const l = $('msaf-upmlayout');
    if(l) l.textContent = U.cat === 'site' ? 'Full-width hero, details in two columns'
      : U.cat === 'carousel' ? '6 slides — hero, 4 rooms, agent card'
      : U.cat === 'story' || U.cat === 'reel' ? 'Full-bleed photo, copy stacked bottom-left'
      : U.cat === 'email' ? 'Header photo, headline, one button'
      : 'Photo top, details left-aligned below';
  }

  /* fake change requests — each one visibly moves the preview */
  function applyAsk(txt){
    const t = txt.toLowerCase();
    const prev = $('msaf-upprev'); if(!prev) return 'Noted — I applied that.';
    const addr = prev.querySelector('.msup-prevaddr');
    const price = prev.querySelector('.msup-prevprice');
    const body = prev.querySelector('.msup-prevbody');
    const photo = prev.querySelector('.msup-prevphoto');
    if(/bigger|larger|address/.test(t) && addr){ addr.style.fontSize = '19px'; return 'Address is up to 19px and still clears the safe margin.'; }
    if(/dark|accent|colou?r/.test(t)){
      prev.style.setProperty('--mel-accent', '#8C3F27');
      const pal = $('msaf-upmpal');
      if(pal) pal.textContent = 'Cream, ink, deeper clay accent';
      return 'Accent darkened two steps. Contrast is still AA on cream.';
    }
    if(/logo/.test(t)){
      const lg = $('msaf-upmlogo');
      if(lg) lg.textContent = /right/.test(t) ? 'Bottom-right, 24px clear space' : 'Bottom-left, 24px clear space';
      return 'Logo moved, clear space kept at 24px.';
    }
    if(/price/.test(t) && price && body && addr){ body.insertBefore(price, addr); return 'Price now leads, address underneath.'; }
    if(/crop|tighten|photo/.test(t) && photo){ photo.style.height = Math.max(72, parseInt(photo.style.height || 120, 10) - 22) + 'px'; return 'Tightened the crop — horizon holds.'; }
    return 'Done. I kept the type scale and margins from your reference.';
  }
  function logAsk(q, a2){
    const log = $('msaf-uplog'); if(!log) return;
    log.hidden = false;
    const row = document.createElement('div');
    row.className = 'msup-logrow';
    const you = document.createElement('span'); you.textContent = q;
    const mel = document.createElement('span');
    mel.innerHTML = '<b>Mel</b> ';
    mel.appendChild(document.createTextNode(a2));
    row.appendChild(you); row.appendChild(mel);
    log.appendChild(row);
    const bd = $('msaf-upbd');
    if(bd) requestAnimationFrame(() => { bd.scrollTop = bd.scrollHeight; });
  }

  function syncUseDone(){
    const d = $('msaf-upusedone');
    if(d) d.textContent = U.uses.length ? "That's all" : 'Skip for now';
  }

  function nameFallback(){ return U.label + ' template'; }

  function saveTemplate(){
    const proto = document.querySelector('.msafcard--up');
    if(!proto){ console.warn('[tplup] no card prototype in the gallery'); return; }
    const key = 'up-' + Date.now();
    const card = proto.cloneNode(true);
    card.classList.remove('msafcard--up');
    card.hidden = false;
    card.dataset.nftpl = key;
    card.dataset.nfcat = 'Uploaded';
    card.dataset.nfformats = U.cat + ' ' + FMTCLS.filter(f => f !== U.cat).join(' ');
    const name = U.name || nameFallback();
    card.setAttribute('aria-label', name);
    const addr = card.querySelector('.msafcard-addr');
    if(addr) addr.textContent = name;
    const loc = card.querySelector('.msafcard-loc span');
    if(loc) loc.textContent = U.label + ' · ' + (U.team ? 'Team library' : 'Only you') + (U.uses.length ? ' · ' + U.uses[0] : '');
    const hint = card.querySelector('.msafcard-hinttx');
    if(hint) hint.textContent = 'Mel matched ' + (U.fontMode === 'cdn' ? 'your CDN font' : U.font) + ', your palette and crop';
    if(U.def){
      card.classList.add('isdefault');
      document.querySelectorAll('.msafcard--tpl.isdefault').forEach(c => { if(c !== card){ c.classList.remove('isdefault'); const bd = c.querySelector('.msaf-sysbadge--def'); if(bd) bd.remove(); } });
      const row = card.querySelector('.msafcard-titlecol');
      if(row){
        const badge = document.createElement('span');
        badge.className = 'msaf-sysbadge msaf-sysbadge--def';
        badge.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3.5 2.6 5.5 6 .8-4.4 4.2 1.1 6-5.3-2.9-5.3 2.9 1.1-6L3.4 9.8l6-.8z"/></svg>Default';
        row.appendChild(badge);
      }
    }
    const grid = document.getElementById('msnf-tplgrid');
    const first = grid && grid.querySelector('.msafcard--tpl');
    if(grid){ if(first) grid.insertBefore(card, first); else grid.appendChild(card); }
    if(favs.indexOf(key) < 0){ favs.push(key); save(); }
    paint();
    if(window.sonner) sonner(U.team ? 'Saved to the team library' : 'Saved to your templates',
      name + ' · ' + U.label + (U.def ? ' · now the default for ' + U.label.toLowerCase() : '') + ' · available on every listing');
  }
  function finish(){ closeUp(); saveTemplate(); }

  /* ---- the studio composer's + opens the same menu ---- */
  document.addEventListener('click', e => {
    const T0 = e.target;
    if(!T0.closest) return;
    const sm = document.getElementById('msnf-plusmenu'), sb = document.getElementById('msnf-plus');
    if(!sm) return;
    if(T0.closest('#msnf-plus')){
      const on = !sm.classList.contains('open');
      sm.classList.toggle('open', on);
      if(sb) sb.setAttribute('aria-expanded', on ? 'true' : 'false');
      return;
    }
    if(!T0.closest('#msnf-plusmenu')){ sm.classList.remove('open'); if(sb) sb.setAttribute('aria-expanded','false'); return; }
    sm.classList.remove('open');
    if(sb) sb.setAttribute('aria-expanded','false');
  });

  /* ---- clicks ---- */
  document.addEventListener('click', e => {
    const start = e.target.closest && e.target.closest('[data-upstart]');
    if(start){ e.preventDefault(); openUp(start.dataset.upstart); return; }
    if(e.target.closest && e.target.closest('[data-msupload]')){ e.preventDefault(); openUp(); return; }
    if(!m || !m.classList.contains('open')) return;
    const T = e.target;

    if(T.closest('[data-msupclose]')){ closeUp(); return; }

    if(T.closest('#msaf-upplus')){
      const mn = $('msaf-upplusmenu');
      mn && mn.classList.contains('open') ? closePlus() : openPlus();
      return;
    }
    if(!T.closest('#msaf-upplusmenu') && !T.closest('#msaf-upplus')) closePlus();

    const ref = T.closest('[data-upref]');
    if(ref){ pickRef(ref.dataset.upref); return; }

    if(T.closest('#msaf-upfilex')){
      U.file = null;
      const row = $('msaf-upfilerow'), fe = $('msaf-upinput');
      if(row) row.hidden = true;
      if(fe) fe.value = '';
      return;
    }

    const cat = T.closest('[data-upcat]');
    if(cat){
      const c = cat.dataset.upcat;
      if(c === 'auto'){
        U.cat = FMTCLS.find(f => B.classList.contains('msaf-fmt-' + f)) || 'post';
        U.label = LABELS[U.cat] || 'Post';
        answered('kind', "Mel read it off the file — it's a " + U.label.toLowerCase() + '.');
      } else {
        U.cat = c; U.label = cat.dataset.uplabel || LABELS[c] || c;
        answered('kind', U.label);
      }
      return;
    }

    const use = T.closest('[data-upuse]');
    if(use){
      const v = use.dataset.upuse, i = U.uses.indexOf(v);
      if(i >= 0){ U.uses.splice(i, 1); use.setAttribute('aria-pressed','false'); }
      else { U.uses.push(v); use.setAttribute('aria-pressed','true'); }
      syncUseDone();
      return;
    }
    if(T.closest('#msaf-upusedone')){
      answered('use', U.uses.length ? U.uses.join(' · ') : 'No particular moment — general use');
      return;
    }

    const nm = T.closest('[data-upname]');
    if(nm){
      const v = nm.dataset.upname;
      U.name = v === 'auto' ? nameFallback() : v;
      answered('name', U.name);
      return;
    }

    const fm = T.closest('[data-upfontmode]');
    if(fm){
      U.fontMode = fm.dataset.upfontmode;
      const list = $('msaf-upfonts');
      if(U.fontMode === 'pick'){
        if(list) list.hidden = false;
        setAns('font', 'Pick a supported font');
        qEl('font').classList.remove('done');
        const bd = $('msaf-upbd'); if(bd) requestAnimationFrame(() => { bd.scrollTop = bd.scrollHeight; });
        return;
      }
      if(list) list.hidden = true;
      if(U.fontMode === 'cdn'){
        const b = bar();
        if(b){ b.placeholder = 'Paste your font stylesheet URL'; b.focus(); }
        return;
      }
      answered('font', "Find the closest free match");
      return;
    }

    const fnt = T.closest('[data-upfont]');
    if(fnt){
      U.font = fnt.dataset.upfont;
      document.querySelectorAll('[data-upfont]').forEach(x => x.setAttribute('aria-pressed', x === fnt ? 'true' : 'false'));
      const list = $('msaf-upfonts'); if(list) list.hidden = true;
      answered('font', U.font);
      return;
    }

    const sug = T.closest('[data-upsug]');
    if(sug){ const q = sug.dataset.upsug; logAsk(q, applyAsk(q)); paintPreview(); return; }
    if(T.closest('#msaf-upbuildok')){ answered('build', 'Looks right'); return; }

    const sh = T.closest('[data-upshare]');
    if(sh){
      U.team = sh.dataset.upshare === 'team';
      answered('share', U.team ? 'The whole team' : 'Just me');
      return;
    }

    const df = T.closest('[data-updef]');
    if(df){
      U.def = df.dataset.updef === '1';
      setAns('def', U.def ? 'Yes, make it the default' : 'No, keep the current one');
      setTimeout(finish, 320);
      return;
    }
  });

  /* ---- typed answers: the composer is the only input on this surface ---- */
  document.addEventListener('melchat:send', e => {
    if(!m || !m.classList.contains('open')) return;
    const c = e.target;
    if(!c || c.id !== 'msaf-upbarchat') return;
    const v = (e.detail && e.detail.text || '').trim();
    if(!v) return;
    const t = v.toLowerCase();

    if(cur === 'ref'){ U.link = v; answered('ref', v); return; }
    if(cur === 'kind'){
      const hit = Object.keys(LABELS).find(k => t.includes(k) || (LABELS[k] || '').toLowerCase().includes(t));
      U.cat = hit || 'post'; U.label = LABELS[U.cat];
      answered('kind', U.label);
      return;
    }
    if(cur === 'use'){
      U.uses.push(v); syncUseDone();
      logAsk(v, 'Added — I will offer it for ' + v.toLowerCase() + '.');
      return;
    }
    if(cur === 'name'){ U.name = v; answered('name', v); return; }
    if(cur === 'font'){
      if(U.fontMode === 'cdn' && /https?:\/\//.test(t)){ U.cdn = v; answered('font', 'Font loaded from your CDN link'); return; }
      const f = ['Mona Sans','Playfair Display','DM Serif Display','Sora','Libre Baskerville']
        .find(x => x.toLowerCase().includes(t) || t.includes(x.toLowerCase()));
      if(f){ U.font = f; U.fontMode = 'pick'; answered('font', f); return; }
      U.fontMode = 'match'; answered('font', 'Find the closest free match');
      return;
    }
    if(cur === 'build'){ logAsk(v, applyAsk(v)); paintPreview(); return; }
    if(cur === 'share'){
      U.team = !/just me|only me|myself|private/.test(t);
      answered('share', U.team ? 'The whole team' : 'Just me');
      return;
    }
    if(cur === 'def'){
      U.def = /^y|yes|sure|make it|default/.test(t);
      setAns('def', U.def ? 'Yes, make it the default' : 'No, keep the current one');
      setTimeout(finish, 320);
    }
  });

  /* ---- drag a reference anywhere onto the surface ---- */
  if(m){
    let depth = 0;
    m.addEventListener('dragenter', e => { e.preventDefault(); depth++; m.classList.add('drag'); });
    m.addEventListener('dragover', e => { e.preventDefault(); });
    m.addEventListener('dragleave', () => { depth = Math.max(0, depth - 1); if(!depth) m.classList.remove('drag'); });
    m.addEventListener('drop', e => {
      e.preventDefault(); depth = 0; m.classList.remove('drag');
      const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
      takeFile(f);
    });
  }

  const upIn = document.getElementById('msaf-upinput');
  if(upIn) upIn.addEventListener('change', () => takeFile(upIn.files && upIn.files[0]));
  const brIn = document.getElementById('msaf-upbrandinput');
  if(brIn) brIn.addEventListener('change', () => {
    const f = brIn.files && brIn.files[0];
    if(!f) return;
    U.brand = f;
    if(cur === 'ref'){ answered('ref', f.name + ' — reading your brand guidelines.'); }
    else logAsk(f.name, 'Brand guidelines locked in — palette, logo rules and type scale come from these.');
    if(window.sonner) sonner('Brand guidelines attached', f.name);
  });

  document.addEventListener('keydown', e => {
    if(e.key !== 'Escape' || !m || !m.classList.contains('open')) return;
    const mn = $('msaf-upplusmenu');
    if(mn && mn.classList.contains('open')){ closePlus(); return; }
    closeUp();
  });

  /* the old action-bar upload button opens this conversation instead of a bare file picker */
  document.addEventListener('click', e => {
    const b2 = e.target.closest && e.target.closest('#msaf-upload-btn');
    if(b2){ e.preventDefault(); e.stopImmediatePropagation(); openUp(); }
  }, true);

  /* role gate: swap to the agent (read-only) view from the console or a tweak */
  window.__msSetUploadRole = function(role){ B.classList.toggle('msaf-noupload', role === 'agent'); };

  prune();
  syncTabs();
  paint();
})();
