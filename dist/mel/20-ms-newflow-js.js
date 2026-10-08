/* Marketing Studio — new flow, step 1 (address) → step 2 (intent) → step 2b (package contents).
   Old flow is untouched; this only drives the .msnf screens. */
(function(){
  const root = document.getElementById('ms-newflow');
  if(!root) return;
  const B = document.body;
  const L = {
    grove: { a:'1420 Grove St',        mls:'424118902', photos:24, oh:'Sat 1–4',  drop:'Price drop · Aug 12',
             price:'$1,285,000', hood:'Noe Valley',        facts:'3 bd · 2 ba · 1,510 sqft', img:'assets/prop/s1.jpg',
             why:'Price drop 6 days ago — I would lead with a feed post.',
             tpl:'editorial', tplwhy:'Price drop reads better in Editorial — considered, not salesy.' },
    pine:  { a:'88 Pine St, Unit 12B', mls:'424106744', photos:18, oh:'Sat 11–1', drop:'11 days on market',
             price:'$842,000',   hood:'Financial District', facts:'2 bd · 2 ba · 1,120 sqft', img:'assets/prop/s2.jpg',
             why:'Eleven days on market and an open house Saturday — a feed post is the fastest way to fill it.',
             tpl:'feature', tplwhy:'A city condo sells on the numbers — Feature sheet puts them up front.' },
    maple: { a:'412 Maple Ave',        mls:'41069318',  photos:31, oh:'Sun 12–3', drop:'Price drop · Aug 4',
             price:'$975,000',   hood:'Rockridge',          facts:'4 bd · 3 ba · 2,240 sqft', img:'assets/prop/s3.jpg',
             why:'New price since Aug 4 and 31 photos to work with — a feed post carries it best.',
             tpl:'collage', tplwhy:'Thirty-one photos is a lot of house — Collage shows more of it in one frame.' },
    judah: { a:'1719 Judah St',        mls:'424097902', photos:22, oh:'Sun 1–4',  drop:'Price drop · Aug 13',
             price:'$1,149,000', hood:'Outer Sunset',       facts:'3 bd · 2 ba · 1,340 sqft', img:'assets/prop/s4.jpg',
             why:'Not your listing, but the price moved 6 days ago — a feed post is the safe lead.',
             tpl:'wave', tplwhy:'Not your listing, so Wave keeps it about the house, not the branding.' }
  };
  const ASSETS = {
    igpost:  'feed post',        website: 'property page', igstory: 'story',        reels: 'photo reel',
    tiktok:  'walkthrough clip', x:       'listing tweet', email:   'email blast',  flyer: 'open-house flyer'
  };
  const TPLNAME = { wave:'Wave', feature:'Feature sheet', editorial:'Editorial', collage:'Collage', minimal:'Minimal' };
  const S = { prop:'grove', intent:null, keys:[], tpl:null };

  function screen(name){
    root.querySelectorAll('.msnfs').forEach(s => s.classList.toggle('on', s.dataset.nf === name));
  }
  /* other scripts (e.g. the IG modal's post-completion return) send the flow back to a screen */
  window.__msnfScreen = screen;
  function paintProp(){
    const p = L[S.prop];
    root.querySelectorAll('[data-nfaddr]').forEach(el => { el.textContent = p.a; });
    const chips = root.querySelectorAll('#msnf-insight .msnfchip');
    if(chips.length === 3){
      chips[0].textContent = p.drop;
      chips[1].textContent = 'Open house ' + p.oh;
      chips[2].textContent = p.photos + ' photos';
    }
    const why = root.querySelector('.msnfcard.rec .whytx');
    if(why) why.textContent = p.why;
    root.querySelectorAll('[data-nfprice]').forEach(el => { el.textContent = p.price; });
    root.querySelectorAll('[data-nfhood]').forEach(el => { el.textContent = p.hood; });
    root.querySelectorAll('[data-nffacts]').forEach(el => { el.textContent = p.facts; });
    root.querySelectorAll('[data-nfphoto]').forEach(el => { el.style.backgroundImage = "url('" + p.img + "')"; });
  }
  function paintCount(){
    const boxes = [...root.querySelectorAll('[data-nfasset]')];
    const n = boxes.filter(b => b.checked).length;
    const cnt = document.getElementById('msnf-cnt'), lbl = document.getElementById('msnf-golbl'),
          go = document.getElementById('msnf-go');
    if(cnt) cnt.textContent = n + ' of ' + boxes.length + ' selected';
    if(lbl) lbl.textContent = n === 1 ? 'Generate 1 asset' : 'Generate ' + n + ' assets';
    if(go) go.disabled = n === 0;
  }

  /* 01b notices: delegated on document, because the toast stack is mounted on #mel-page —
     outside this root — so .msnfs cannot become a containing block for its fixed position. */
  document.addEventListener('click', e => {
    const ret = e.target.closest('[data-nfret]');
    if(!ret) return;
    e.stopPropagation();
    const k = ret.dataset.nfret;
    const banner = document.getElementById('msnf-return'), toast = document.getElementById('msnf-toast');
    if(k === 'hidebanner'){ if(banner) banner.classList.add('gone'); return; }
    if(k === 'dismiss'){ if(toast) toast.classList.add('gone'); return; }
    if(k === 'view'){
      if(window.sonner) sonner('1420 Grove St package', '6 assets · published Thu · 2,412 reach');
      else console.warn('[nfret] sonner unavailable — View has nowhere to go');
      return;
    }
    if(k === 'all' || k === 'alltpl'){
      if(window.sonner) sonner(k === 'all' ? 'All packages' : 'All templates', 'Opening your library');
      else console.warn('[nfret] sonner unavailable — ' + k + ' has nowhere to go');
      return;
    }
    if(k === 'viewpkg'){
      if(window.sonner) sonner('88 Pine St, Unit 12B', 'Published Mon · 1.8k reach · 6 assets');
      else console.warn('[nfret] sonner unavailable — viewpkg has nowhere to go');
      return;
    }
    if(k === 'resume'){
      S.workflow = 'package'; S.intent = null; S.keys = [];
      if(ret.dataset.nfprop && L[ret.dataset.nfprop]) S.prop = ret.dataset.nfprop;
      paintProp(); paintCount(); screen('address');
      return;
    }
    if(k === 'start'){
      if(toast) toast.classList.add('gone');
      S.workflow = 'package'; S.intent = null; S.keys = []; S.prop = 'pine';
      paintProp(); paintCount(); screen('address');
      return;
    }
  });

  root.addEventListener('click', e => {
    const notify = e.target.closest('[data-nfnotify]');
    if(notify){
      e.stopPropagation();
      const on = notify.classList.toggle('on');
      notify.textContent = on ? '✓ We\'ll notify you' : 'Notify me';
      return;
    }
    const work = e.target.closest('[data-nfwork]');
    if(work && !work.disabled){
      const kind = work.dataset.nfwork;
      S.workflow = kind;
      root.querySelectorAll('.msnfcard').forEach(c => c.classList.remove('sel'));
      if(kind === 'website'){
        S.intent = 'website'; S.keys = ['website'];
      } else {
        S.intent = null; S.keys = [];
      }
      paintProp(); paintCount();
      screen('address');
      return;
    }
    const pick = e.target.closest('[data-nfpick]');
    if(pick){
      S.prop = pick.dataset.nfpick;
      /* Combined mode: honour the intent seeded when the user clicked a hub card.
         'package' routes through the scope screen; single-intent goes straight to templates. */
      if(B.classList.contains('msflow-combined') && S.intent){
        if(S.intent === 'package'){ paintCount(); screen('scope'); return; }
        S.keys = [S.intent];
        openTemplates();
        applyIntentFilter();
        return;
      }
      /* New flow: address → next depends on workflow (package → straight to templates with all assets, website → templates). */
      if(B.classList.contains('msflow-new')){
        if(S.workflow === 'website'){ S.intent = 'website'; S.keys = ['website']; openTemplates(); return; }
        S.intent = 'package';
        S.keys = ['igpost','website','igstory','reels','tiktok','x','email','flyer'];
        openTemplates();
        return;
      }
      S.intent = 'igpost'; S.keys = ['igpost']; openTemplates(); return;
    }
    const back = e.target.closest('[data-nfback]');
    if(back){ screen(back.dataset.nfback); return; }
    const intent = e.target.closest('[data-nfintent]');
    if(intent){
      const k = intent.dataset.nfintent;
      if(k === 'package'){ S.intent = 'package'; paintCount(); screen('scope'); return; }
      S.intent = k;
      root.querySelectorAll('.msnfcard').forEach(c => c.classList.toggle('sel', c === intent));
      if(window.__msnfTemplates) window.__msnfTemplates(S.prop, k);
    }
  });
  root.addEventListener('change', e => { if(e.target.closest('[data-nfasset]')) paintCount(); });

  const field = document.getElementById('msnf-addr'), wrap = document.getElementById('msnf-search');
  if(field && wrap){
    field.addEventListener('focus', () => wrap.classList.add('on'));
    field.addEventListener('blur', () => wrap.classList.remove('on'));
    field.addEventListener('input', () => wrap.classList.remove('miss'));
    /* the field cycles through what it accepts, so nobody has to guess */
    const HINTS = ['Search a property address, or pick one below', 'Try “1420 Grove St”', 'Try an MLS number — “424118902”', 'Or create a template from your own design →', 'Try “pull in 1719 Judah St”'];
    const slow = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(!slow){
      let i = 0;
      setInterval(() => {
        if(document.activeElement === field || field.value) return;
        if(!wrap.closest('.msnfs').classList.contains('on')) return;
        /* a placeholder edited in text-edit mode wins over the hint cycle */
        if(window.MELEDIT && window.MELEDIT.attrLocked(field, 'placeholder')) return;
        i = (i + 1) % HINTS.length;
        field.animate([
          { opacity:1, filter:'blur(0px)', transform:'translateY(0)' },
          { opacity:0, filter:'blur(4px)', transform:'translateY(-3px)', offset:.45 },
          { opacity:0, filter:'blur(4px)', transform:'translateY(3px)', offset:.55 },
          { opacity:1, filter:'blur(0px)', transform:'translateY(0)' }
        ], { duration:900, easing:'cubic-bezier(.77,0,.175,1)' });
        setTimeout(() => { field.placeholder = HINTS[i]; }, 450);
      }, 4200);
    }
    field.addEventListener('keydown', e => {
      if(e.key !== 'Enter') return;
      const t = field.value.trim().toLowerCase();
      if(!t) return;
      const num = t.replace(/[^0-9]/g, '');
      const byMls = num.length >= 7 ? Object.keys(L).find(k => L[k].mls === num) : null;
      const q = t.replace(/^pull in\s*/, '');
      const byAddr = q ? Object.keys(L).find(k => L[k].a.toLowerCase().includes(q) || k.includes(q)) : null;
      const hit = byMls || byAddr;
      if(!hit){ wrap.classList.add('miss'); return; }
      wrap.classList.remove('miss');
      /* Mel pulls the listing — the ring runs while it does */
      wrap.classList.add('loading');
      field.blur();
      setTimeout(() => {
        wrap.classList.remove('loading');
        if(document.body.classList.contains('msflow-new')){
          if(S.workflow === 'website'){
            S.prop = hit; S.intent = 'website'; S.keys = ['website']; openTemplates();
          } else {
            S.prop = hit; S.intent = 'package';
            S.keys = ['igpost','website','igstory','reels','tiktok','x','email','flyer'];
            openTemplates();
          }
        } else {
          S.prop = hit; S.intent = 'igpost'; S.keys = ['igpost']; openTemplates();
        }
      }, 620);
    });
  }

  const goBtn = document.getElementById('msnf-go');
  if(goBtn) goBtn.addEventListener('click', () => {
    const keys = [...root.querySelectorAll('[data-nfasset]')].filter(b => b.checked).map(b => b.dataset.nfasset);
    if(window.__msnfGenerate) window.__msnfGenerate(S.prop, keys);
  });

  /* ---------- step 3: template wall ---------- */
  const wall = document.getElementById('msnf-tplgrid'), why = document.getElementById('msnf-tplwhy'),
        whyTx = document.getElementById('msnf-tplwhytx'), what = document.getElementById('msnf-tplwhat');

  function openTemplates(){
    S.tpl = null;
    /* Reset the package-build state on every templates entry so the button never
       shows a stale "Continue with 4 templates · Ready" from a previous visit. */
    S.pkgPicks = {};
    document.body.classList.remove('msaf-pkgmode');
    const _pkgBtn = document.getElementById('msaf-package-btn');
    if(_pkgBtn){
      _pkgBtn.classList.remove('on','ready');
      const _lbl = _pkgBtn.querySelector('.msaf-actionlbl');
      const _cnt = _pkgBtn.querySelector('.msaf-actioncnt');
      if(_lbl) _lbl.textContent = 'Build listing package';
      if(_cnt) _cnt.textContent = '4 assets';
    }
    if(why) why.classList.remove('on');
    root.querySelectorAll('.msnftpl,.msafcard--tpl').forEach(t => t.classList.remove('sel','dim','melpick'));
    root.querySelectorAll('.msafcard--tpl [data-nfcheck]').forEach(c => { c.checked = false; });
    pkgPips();
    pkgLabel();
    if(what) what.textContent = S.keys.length > 1 ? 'listing package' : (ASSETS[S.intent] || 'feed post');
    /* highlight Mel's recommended template + copy its 'why' onto the card */
    const p = L[S.prop];
    if(p && p.tpl){
      const rec = root.querySelector('.msafcard--tpl[data-nftpl="' + p.tpl + '"]');
      if(rec){
        rec.classList.add('melpick');
        const whyBox = rec.querySelector('[data-nfwhy]');
        if(whyBox && p.tplwhy) whyBox.textContent = p.tplwhy;
      }
    }
    /* reset format tabs to Post and rebuild visibility + label */
    const tabs = root.querySelectorAll('[data-nfformat]');
    tabs.forEach(t => { const on = t.dataset.nfformat === 'post'; t.classList.toggle('on', on); t.setAttribute('aria-selected', on ? 'true' : 'false'); });
    root.querySelectorAll('.msafcard--tpl').forEach(c => {
      const ok = (c.dataset.nfformats || '').split(/\s+/).includes('post');
      c.classList.toggle('hide', !ok);
    });
    const cnt = document.getElementById('msaf-tplcnt');
    /* the source tabs own this label now — mel/27 keeps the counts in sync */
    /* [hidden] as well as .hide: the uploaded-template card carries the hidden attribute until a
       team lead uploads one, and counting it made the section read 9 against the tab's 8. */
    if(cnt) cnt.textContent = root.querySelectorAll('.msafcard--tpl:not(.hide):not([hidden])').length;
    paintProp();
    screen('templates');
  }
  window.__msnfTemplates = function(prop, key){ S.prop = prop; S.intent = key; S.keys = [key]; openTemplates(); };
  window.__msnfGenerate  = function(prop, keys){ S.prop = prop; S.intent = 'package'; S.keys = keys.slice(); openTemplates(); };

  /* ---------- package mode: MULTI-select templates inside every asset tab ----------
     S.pkgPicks[format] is an ARRAY of template keys (a legacy single string is normalised).
     Any number per tab; a format counts as filled at one or more. */
  const PKG_NEED = ['post','story','reel','site'];
  const FMT_KEY = { post:'igpost', story:'igstory', reel:'reels', site:'website', flier:'flyer', email:'email', carousel:'igpost', cards:'igpost', signs:'flyer' };
  const CARD_TPL_NM = {
    wave:'Wave', feature:'Feature sheet', editorial:'Editorial', collage:'Collage', minimal:'Minimal',
    jlserif:'Editorial', jlsans:'Minimal', undercontract:'Editorial', justsold:'Wave',
    ohflyer:'Editorial', website:'Minimal', split:'Editorial'
  };
  function pkgList(f){
    const v = (S.pkgPicks || {})[f];
    if(!v) return [];
    return Array.isArray(v) ? v.slice() : [v];
  }
  function pkgSet(f, list){
    S.pkgPicks = S.pkgPicks || {};
    if(list.length) S.pkgPicks[f] = list; else delete S.pkgPicks[f];
  }
  function pkgTotal(){ return PKG_NEED.reduce((n, f) => n + pkgList(f).length, 0); }
  function pkgFilled(){ return PKG_NEED.filter(f => pkgList(f).length).length; }
  /* every tab, not just the package four */
  function pkgFormats(){ return Object.keys(S.pkgPicks || {}).filter(f => pkgList(f).length); }
  function pkgAllTotal(){ return pkgFormats().reduce((n, f) => n + pkgList(f).length, 0); }
  /* one label routine for all three states of the action button */
  function pkgLabel(){
    const btn = document.getElementById('msaf-package-btn');
    if(!btn) return;
    /* the bar's left cluster (Selected · N + thumbs) repaints from the same state */
    if(window.MELTPLBAR) window.MELTPLBAR.paint();
    const lbl = btn.querySelector('.msaf-actionlbl'), cnt = btn.querySelector('.msaf-actioncnt');
    const inPkg = document.body.classList.contains('msaf-pkgmode');
    if(inPkg){
      const filled = pkgFilled();
      if(filled >= PKG_NEED.length){
        /* one asset per format — extra picks in a tab ride along as that asset's variations */
        if(lbl) lbl.textContent = 'Continue with ' + PKG_NEED.length + ' assets';
        if(cnt) cnt.textContent = 'Ready';
        btn.classList.add('ready');
      } else {
        if(lbl) lbl.textContent = 'Pick at least one for each';
        if(cnt) cnt.textContent = filled + ' of ' + PKG_NEED.length;
        btn.classList.remove('ready');
      }
      /* the gate is the button state, not a toast: nothing picked = nothing to continue with */
      btn.disabled = filled < PKG_NEED.length;
      return;
    }
    btn.disabled = false;
    const fmts = pkgFormats().length, all = pkgAllTotal();
    if(all > 0){
      /* the bar carries the count on the left ("Selected · N"), so the button states the
         action: add those N picked templates to the package. */
      if(lbl) lbl.textContent = 'Add ' + all + ' to package';
      if(cnt) cnt.textContent = fmts + (fmts === 1 ? ' asset' : ' assets');
      btn.classList.add('ready');
    } else {
      if(lbl) lbl.textContent = 'Build listing package';
      if(cnt) cnt.textContent = '4 assets';
      btn.classList.remove('ready');
    }
  }
  window.__pkgSetLabel = pkgLabel;
  /* picked keys, flattened across every asset tab — read by the action bar (mel/35) */
  /* picks grouped by format — read by the preview dialog (mel/37) */
  window.__pkgPicksByFormat = () => {
    const out = {};
    Object.keys(S.pkgPicks || {}).forEach(f => { const l = pkgList(f); if(l.length) out[f] = l; });
    return out;
  };
  window.__pkgPickedKeys = () => {
    const out = [];
    Object.keys(S.pkgPicks || {}).forEach(f => pkgList(f).forEach(k => { if(out.indexOf(k) < 0) out.push(k); }));
    return out;
  };
  /* count pip on every tab, so picks on tabs you are not looking at stay visible */
  function pkgPips(){
    root.querySelectorAll('[data-nfformat]').forEach(tab => {
      const n = pkgList(tab.dataset.nfformat).length;
      let pip = tab.querySelector('.msaf-tabpick');
      if(!n){ if(pip) pip.remove(); return; }
      if(!pip){
        pip = document.createElement('span');
        pip.className = 'msaf-tabpick';
        tab.appendChild(pip);
      }
      pip.textContent = n;
    });
  }
  function pkgMark(card, on){
    card.classList.toggle('sel', on);
    card.setAttribute('aria-pressed', on ? 'true' : 'false');
    const cbx = card.querySelector('[data-nfcheck]');
    if(cbx){
      cbx.checked = on;
      cbx.toggleAttribute('checked', on);
      cbx.setAttribute('aria-checked', on ? 'true' : 'false');
    } else console.warn('[msaf] card ' + card.dataset.nftpl + ' has no checkbox');
  }
  /* repaint the selected state of the visible grid for the active tab */
  function pkgPaint(){
    root.querySelectorAll('.msafcard--tpl').forEach(c => pkgMark(c, false));
    const activeTab = root.querySelector('.msaf-tab.on[data-nfformat], .msaf-moreitem.on[data-nfformat]');
    const list = activeTab ? pkgList(activeTab.dataset.nfformat) : [];
    root.querySelectorAll('.msafcard--tpl:not(.hide)').forEach(c => {
      pkgMark(c, list.indexOf(c.dataset.nftpl) > -1);
    });
    pkgPips();
    pkgLabel();
  }

  root.addEventListener('click', e => {
    /* More tab toggle */
    const moreBtn = e.target.closest('#msaf-tabmore');
    if(moreBtn){
      const pop = document.getElementById('msaf-morepop');
      if(pop){
        const open = moreBtn.getAttribute('aria-expanded') === 'true';
        moreBtn.setAttribute('aria-expanded', open ? 'false' : 'true');
        pop.hidden = open;
      }
      return;
    }
    const fm = e.target.closest('[data-nfformat]');
    if(fm){
      const f = fm.dataset.nfformat;
      const fmap = { post:'Post', story:'Story', reel:'Reel', flier:'Flyers', email:'Email header', site:'Listing website', cards:'Business cards', signs:'Signs' };
      const inMore = !!fm.closest('.msaf-morepop');
      /* clear tab actives */
      root.querySelectorAll('.msaf-tab').forEach(b => { b.classList.remove('on'); b.setAttribute('aria-selected','false'); });
      root.querySelectorAll('.msaf-moreitem').forEach(b => b.classList.remove('on'));
      /* set active */
      if(inMore){
        fm.classList.add('on');
        const more = document.getElementById('msaf-tabmore');
        const lbl2 = document.getElementById('msaf-morelbl');
        const cnt2 = document.getElementById('msaf-morecnt');
        if(more){ more.classList.add('on'); more.setAttribute('aria-selected','true'); more.setAttribute('aria-expanded','false'); }
        if(lbl2) lbl2.textContent = fmap[f];
        if(cnt2) cnt2.hidden = true;
        const pop = document.getElementById('msaf-morepop'); if(pop) pop.hidden = true;
      } else {
        fm.classList.add('on');
        fm.setAttribute('aria-selected','true');
        const lbl2 = document.getElementById('msaf-morelbl');
        if(lbl2) lbl2.textContent = 'More';
        const more = document.getElementById('msaf-tabmore'); if(more) more.setAttribute('aria-expanded','false');
        const pop = document.getElementById('msaf-morepop'); if(pop) pop.hidden = true;
      }
      /* filter grid */
      root.querySelectorAll('.msafcard--tpl').forEach(c => {
        const ok = (c.dataset.nfformats || '').split(/\s+/).includes(f);
        c.classList.toggle('hide', !ok);
      });
      /* restore every pick for this format (multi-select is always on) */
      pkgPaint();
      const cnt = document.getElementById('msaf-tplcnt');
      /* label is fixed ("All templates"); mel/27 recomputes every tab count after this */
      if(cnt) cnt.textContent = root.querySelectorAll('.msafcard--tpl:not(.hide):not([hidden])').length;
      return;
    }
    /* Upload template button */
    const upBtn = e.target.closest('#msaf-upload-btn');
    if(upBtn){
      const inp = document.getElementById('msaf-upload-input');
      if(inp) inp.click();
      return;
    }
    /* Action button — three jobs, in this order:
       picks in hand (normal grid) → create one asset per picked tab;
       nothing picked            → turn on package mode (the 4-format gate);
       package mode              → gate on at least one template per format. */
    const pkgBtn = e.target.closest('#msaf-package-btn');
    if(pkgBtn){
      const B = document.body;
      const NEED = PKG_NEED;
      const PKG_KEY = FMT_KEY;
      S.pkgPicks = S.pkgPicks || {};
      const onMode = B.classList.contains('msaf-pkgmode');
      const count = pkgFilled();
      const setPkgLabel = pkgLabel;
      window.__pkgSetLabel = pkgLabel;
      if(!onMode && pkgAllTotal() > 0){
        /* free-form multi-select: one asset per tab that has picks, first pick leads */
        const fmts = pkgFormats();
        const picks = {};
        fmts.forEach(f => {
          const key = FMT_KEY[f];
          if(!key){ console.warn('[msaf] no collateral key for format ' + f); return; }
          const names = pkgList(f).map(k => CARD_TPL_NM[k] || k);
          picks[key] = names.length > 1 ? names : names[0];
        });
        const keys = Object.keys(picks);
        if(!keys.length){
          console.warn('[msaf] picks present but no collateral keys resolved');
          return;
        }
        if(window.MSPACKET && window.MSPACKET.buildPackage){
          window.MSPACKET.buildPackage(S.prop, keys, picks);
        } else {
          console.warn('[msaf] MSPACKET.buildPackage unavailable — falling back to a single asset');
          runGen(pkgList(fmts[0])[0]);
          return;
        }
        const extra = pkgAllTotal() - keys.length;
        if(extra > 0 && window.sonner){
          sonner(keys.length + (keys.length === 1 ? ' asset · ' : ' assets · ') + pkgAllTotal() + ' templates',
                 'Your first pick in each tab leads; the other ' + extra + ' ride along as variations you can swap in');
        }
        return;
      }
      if(!onMode){
        B.classList.add('msaf-pkgmode');
        pkgBtn.classList.add('on');
        S.pkgPicks = {};
        S.intent = 'package';
        S.keys = ['igpost','igstory','reels','website'];
        setPkgLabel();
        /* jump to Post tab so the first pick is obvious */
        const postTab = root.querySelector('.msaf-tab[data-nfformat="post"]');
        if(postTab) postTab.click();
        return;
      }
      if(count < NEED.length){
        if(window.sonner) sonner('Pick at least one for each', 'Post, Story, Reel, and the property page — pick as many templates as you want in each tab');
        return;
      }
      /* every format filled — launch editor with those templates */
      const collateralPicks = {};
      NEED.forEach(f => {
        const names = pkgList(f).map(k => CARD_TPL_NM[k] || k);
        collateralPicks[PKG_KEY[f]] = names.length > 1 ? names : names[0];
      });
      if(window.MSPACKET && window.MSPACKET.buildPackage){
        window.MSPACKET.buildPackage(S.prop, Object.keys(collateralPicks), collateralPicks);
      }
      const extra = pkgTotal() - NEED.length;
      if(extra > 0 && window.sonner){
        sonner('4 assets · ' + pkgTotal() + ' templates', 'Your first pick in each tab leads; the other ' + extra + ' ride along as variations you can swap in');
      }
      B.classList.remove('msaf-pkgmode');
      pkgBtn.classList.remove('on','ready');
      return;
    }
    /* Exit package mode */
    const pkgClear = e.target.closest('#msaf-pkgclear');
    if(pkgClear){
      document.body.classList.remove('msaf-pkgmode');
      const pb = document.getElementById('msaf-package-btn');
      if(pb) pb.classList.remove('on','ready');
      S.pkgPicks = {};
      pkgPaint();
      S.intent = 'igpost';
      S.keys = ['igpost'];
      return;
    }
    /* click outside closes More popup */
    if(!e.target.closest('.msaf-moregroup')){
      const more = document.getElementById('msaf-tabmore');
      const pop = document.getElementById('msaf-morepop');
      if(more && pop && !pop.hidden){ more.setAttribute('aria-expanded','false'); pop.hidden = true; }
    }
    const t = e.target.closest('[data-nftpl]');
    if(t){
      const activeTab = root.querySelector('.msaf-tab.on[data-nfformat], .msaf-moreitem.on[data-nfformat]');
      const format = activeTab && activeTab.dataset.nfformat;
      if(!format){
        console.warn('[msaf] no active format tab — cannot record a template pick');
        return;
      }
      if(document.body.classList.contains('msaf-pkgmode') && PKG_NEED.indexOf(format) < 0){
        if(window.sonner) sonner('Not part of the package', 'Only post, story, reel, and the property page are picked here');
        return;
      }
      /* MULTI-SELECT, every tab: the card toggles in and out of this tab's pick list.
         Nothing launches the editor from here — the action button does that. */
      const list = pkgList(format), key = t.dataset.nftpl, at = list.indexOf(key);
      if(at > -1) list.splice(at, 1); else list.push(key);
      pkgSet(format, list);
      pkgMark(t, at < 0);
      pkgPips();
      pkgLabel();
      return;
    }
  });

  const melPick = document.getElementById('msnf-melpick');
  if(melPick) melPick.addEventListener('click', () => {
    const p = L[S.prop], pick = root.querySelector('[data-nftpl="' + p.tpl + '"]');
    if(!pick) return;
    root.querySelectorAll('[data-nffilter]').forEach(b => b.classList.toggle('on', b.dataset.nffilter === 'All'));
    root.querySelectorAll('.msnftpl').forEach(x => { x.classList.remove('hide'); x.classList.toggle('sel', x === pick); x.classList.toggle('dim', x !== pick); });
    if(whyTx) whyTx.textContent = p.tplwhy;
    if(why) why.classList.add('on');
    S.tpl = p.tpl;
  });

  /* ---------- step 4: skip the interstitial, land straight in the editor ---------- */
  function runGen(tplKey){
    S.tpl = tplKey;
    /* Single-asset flow: pin S.keys to just the collateral matching the active format tab,
       so the editor never inherits a stale package list from earlier in this session. */
    const activeTab = root.querySelector('.msaf-tab.on[data-nfformat], .msaf-moreitem.on[data-nfformat]');
    const fmt = activeTab && activeTab.dataset.nfformat;
    const FMT_TO_KEY = { post:'igpost', story:'igstory', reel:'reels', site:'website', flier:'flyer', email:'email', cards:'igpost', signs:'flyer' };
    const single = FMT_TO_KEY[fmt] || 'igpost';
    S.intent = single; S.keys = [single];
    paintProp();
    if(window.__msnfEditor) window.__msnfEditor(S.prop, S.keys);
  }

  /* Tweaks → Marketing Studio → Flow: 'old' | 'new' | 'combined' */
  window.__applyMsFlow = function(v){
    const isNew = v === 'new';
    const isCombined = v === 'combined';
    B.classList.toggle('msflow-new', isNew);
    B.classList.toggle('msflow-combined', isCombined);
    if(!isCombined) B.classList.remove('mscn-on');
    if(!isCombined) B.classList.remove('msaf-hidefmttabs');
    try { localStorage.setItem('crm-msflow', isNew ? 'new' : (isCombined ? 'combined' : 'old')); } catch(_){}
    if(isNew){
      resetFlow();
      paintProp(); paintCount(); screen('workflows');
    } else if(isCombined){
      /* Prime the internal state; the overlay itself stays hidden until a hub card
         or the propbar search sets .mscn-on. */
      resetFlow();
      paintProp(); paintCount(); screen('address');
    }
  };

  /* Every re-entry into the flow starts clean — a stale intent/keys/tpl from the previous
     run is read downstream (address routing here, S.keys in the packet builder), so a
     second package would otherwise inherit the first one's assets and template. */
  function resetFlow(){
    S.intent = null;
    S.keys = [];
    S.tpl = null;
    S.workflow = null;
    root.querySelectorAll('.msnfcard').forEach(c => c.classList.remove('sel'));
    root.querySelectorAll('.msnftpl,.msafcard--tpl').forEach(t => t.classList.remove('sel','dim','melpick'));
  }

  /* ---------- Combined mode routing ----------
     Intercept hub-card and propbar clicks at capture phase so the old-flow handlers
     (CHANNELS map, packet-card override, propbar → openPacket) never fire. */
  const INTENT_FMT = { igpost:'post', igstory:'story', reels:'reel', tiktok:'reel', x:'post', website:'site', email:'email', flyer:'flier' };
  function applyIntentFilter(){
    /* Only combined mode gets the single-format lockdown. Package keeps all tabs. */
    if(!B.classList.contains('msflow-combined') || !S.intent || S.intent === 'package'){
      B.classList.remove('msaf-hidefmttabs');
      return;
    }
    const f = INTENT_FMT[S.intent];
    if(!f){ B.classList.remove('msaf-hidefmttabs'); return; }
    const target = root.querySelector('.msaf-tab[data-nfformat="' + f + '"]') ||
                   root.querySelector('.msaf-moreitem[data-nfformat="' + f + '"]');
    if(target) target.click();
    B.classList.add('msaf-hidefmttabs');
  }

  document.addEventListener('click', e => {
    if(!B.classList.contains('msflow-combined') || B.classList.contains('mscn-on')) return;
    const card = e.target.closest('#ms-hub .mshcard[data-hub]');
    if(card){
      e.preventDefault();
      e.stopImmediatePropagation();
      const hub = card.dataset.hub;
      /* map old-hub key → new-flow intent (packet = full listing package) */
      const intent = hub === 'packet' ? 'package' : hub;
      S.intent = intent;
      S.keys = intent === 'package' ? ['igpost','igstory','reels','flier','website'] : [intent];
      root.querySelectorAll('.msnfcard').forEach(c => c.classList.toggle('sel', c.dataset.nfintent === intent));
      paintProp(); paintCount();
      screen('address');
      B.classList.add('mscn-on');
      return;
    }
    const row = e.target.closest('#ms-propbar [data-pbp]');
    if(row){
      e.preventDefault();
      e.stopImmediatePropagation();
      /* Map the propbar row's address back to a new-flow listing key by slug. */
      const bTag = row.querySelector('b');
      const addr = (bTag && bTag.textContent || '').toLowerCase();
      const key = ['grove','pine','maple','judah'].find(k => addr.includes(k)) || 'grove';
      S.prop = key; S.intent = 'igpost'; S.keys = ['igpost'];
      openTemplates();
      applyIntentFilter();
      B.classList.add('mscn-on');
      const bar = document.getElementById('ms-propbar');
      if(bar) bar.classList.remove('open');
      return;
    }
    const mls = e.target.closest('#ms-propbar [data-pbmls]');
    if(mls){
      e.preventDefault();
      e.stopImmediatePropagation();
      /* MLS lookup mirrors the packet-flow's synthetic hit (1719 Judah St). */
      S.prop = 'judah'; S.intent = 'igpost'; S.keys = ['igpost'];
      openTemplates();
      applyIntentFilter();
      B.classList.add('mscn-on');
      const bar = document.getElementById('ms-propbar');
      if(bar) bar.classList.remove('open');
      return;
    }
  }, true);

  ['ms-navstudio','mel-new'].forEach(id => {
    const el = document.getElementById(id);
    if(!el) return;
    el.addEventListener('click', () => {
      /* Marketing Studio always re-enters the new flow at its first screen. The old dark
         gradient hub is retired — nothing drops .msflow-new any more, so it never surfaces. */
      let pref = null;
      try { pref = localStorage.getItem('crm-msflow'); } catch(_){}
      if(pref === 'combined'){
        if(!B.classList.contains('msflow-combined')) window.__applyMsFlow('combined');
        return;
      }
      if(!B.classList.contains('msflow-new')) window.__applyMsFlow('new');
      else setTimeout(() => window.__applyMsFlow('new'), 0);
    });
  });

  let saved = null;
  const upInp = document.getElementById('msaf-upload-input');
  if(upInp) upInp.addEventListener('change', () => {
    const f = upInp.files && upInp.files[0];
    if(f && window.MEL && typeof window.MEL.toast === 'function') window.MEL.toast('Template uploaded: ' + f.name);
    else if(f) console.log('Template uploaded:', f.name);
    upInp.value = '';
  });
  try { saved = localStorage.getItem('crm-msflow'); } catch(_){}
  /* New flow is the only default now — ignore any legacy 'old' / 'combined' preference
     saved from an earlier build, and overwrite it so the tweak reflects the truth. */
  try { localStorage.setItem('crm-msflow', 'new'); } catch(_){}
  window.__applyMsFlow('new');

  /* --- msaf full-page mode: hide Mel copilot secondary sidebar on address screen only --- */
  (function(){
    const bod = document.body;
    const pageEl = document.getElementById('mel-page');
    function inMS(){ return pageEl && pageEl.classList.contains('studio') && (bod.classList.contains('msflow-new') || (bod.classList.contains('msflow-combined') && bod.classList.contains('mscn-on'))); }
    function syncFull(){
      const addrOn = !!root.querySelector('.msnfs[data-nf="address"].on, .msnfs[data-nf="templates"].on');
      const shellPlain = pageEl && !pageEl.classList.contains('paneled') && !pageEl.classList.contains('canvason') && !pageEl.classList.contains('packeton') && !pageEl.classList.contains('library') && !pageEl.classList.contains('pkediton');
      bod.classList.toggle('msfull', addrOn && inMS() && shellPlain);
    }
    ['ms-navstudio','mel-new','ms-navlib'].forEach(id => {
      const el = document.getElementById(id);
      if(el) el.addEventListener('click', () => setTimeout(syncFull, 40));
    });
    let syncing = false;
    function safeSync(){
      if(syncing) return;
      syncing = true;
      try { syncFull(); } finally { setTimeout(() => { syncing = false; }, 0); }
    }
    const obs = new MutationObserver(safeSync);
    root.querySelectorAll('.msnfs').forEach(s => obs.observe(s, {attributes:true, attributeFilter:['class']}));
    if(pageEl) new MutationObserver(safeSync).observe(pageEl, {attributes:true, attributeFilter:['class']});
    /* Body class changes (msflow-combined / mscn-on) also affect inMS() — observe them. */
    new MutationObserver(safeSync).observe(bod, {attributes:true, attributeFilter:['class']});
    setTimeout(safeSync, 0);
    setTimeout(safeSync, 400);

    const back = document.getElementById('msaf-back');
    if(back) back.addEventListener('click', () => {
      bod.classList.remove('msfull');
      /* Combined mode: just drop the overlay and land back on the old hub. */
      if(bod.classList.contains('msflow-combined')){ bod.classList.remove('mscn-on','msaf-hidefmttabs'); return; }
      /* New flow: land on the workflows menu — never exit the studio. */
      if(bod.classList.contains('msflow-new')){
        document.querySelectorAll('#ms-newflow .msnfs').forEach(s => s.classList.toggle('on', s.dataset.nf === 'workflows'));
        return;
      }
      if(window.MEL && typeof window.MEL.newChat === 'function') window.MEL.newChat();
      else if(pageEl) pageEl.classList.remove('studio','packeton','canvason','library','paneled');
    });
  })();
})();


