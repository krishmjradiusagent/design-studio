/* ---------- 39 · Group actions on the templates page ----------
   Multi-select already exists (mel/20 keeps S.pkgPicks per format). This file gives the
   selection somewhere to go:

     social tabs  (post, story, reel, carousel) -> Group publish sheet
     print tabs   (flier, cards, signs)         -> Download sheet / Send sheet
     site + email                               -> unchanged package button

   It never touches the single-item publish path (pke share panel) and it never rewrites
   mel/20's selection state — it only reads __pkgPicksByFormat() and repaints the bar.
   Loads last so the bar sync wins over mel/34-35's paint. */
(function(){
  const SOCIAL = ['post','story','reel','carousel'];
  const PRINT  = ['flier','cards','signs'];
  const FMT_NM = { post:'Post', story:'Story', reel:'Reel', carousel:'Carousel',
                   flier:'Flyer', cards:'Business card', signs:'Sign',
                   site:'Listing website', email:'Emailer' };

  /* conn:false = no account linked yet. TikTok has no direct publish for business accounts, so
     once linked it stays "Export ready" and its assets come out as files to post by hand. */
  const PLATS = [
    { k:'tt', ico:'ph-tiktok-logo',    nm:'TikTok',    sub:'@mayarealtor',       state:'Export ready', conn:false, exportOnly:true },
    { k:'ig', ico:'ph-instagram-logo', nm:'Instagram', sub:'@mayarealtor',       state:'Connected',    conn:true },
    { k:'fb', ico:'ph-facebook-logo',  nm:'Facebook',  sub:'Maya Kapoor Realty', state:'Connected',    conn:true }
  ];

  const S = { plats:{ tt:false, ig:true, fb:true }, timing:'now', scope:'all',
              conn:{ tt:false, ig:true, fb:true },
              dlFmt:'pdf', dlSize:'letter', sendTo:'printer' };
  function linked(p){ return !!S.conn[p.k]; }
  function subline(p){ return linked(p) ? p.sub + ' \u00b7 ' + p.state : 'Not connected'; }

  function esc(s){ return (s||'').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }

  function activeFormat(){
    const t = document.querySelector('.msaf-tab.on[data-nfformat], .msaf-moreitem.on[data-nfformat]');
    return (t && t.dataset.nfformat) || 'post';
  }
  function picksByFormat(){
    return (window.__pkgPicksByFormat && window.__pkgPicksByFormat()) || {};
  }
  /* [{key, fmt, name}] — the whole basket, every tab */
  function selection(){
    const by = picksByFormat(), out = [];
    Object.keys(by).forEach(f => by[f].forEach(k => {
      const card = document.querySelector('.msafcard--tpl[data-nftpl="' + k + '"]');
      const nm = card ? (card.querySelector('.msafcard-addr') || {}).textContent : k;
      out.push({ key:k, fmt:f, name:(nm || k).trim() });
    }));
    return out;
  }
  function selectionFor(kinds){ return selection().filter(a => kinds.indexOf(a.fmt) > -1); }

  /* ---------- floating bar ---------- */
  function syncBar(){
    const bar = document.querySelector('.msaf-actionbar');
    if(!bar) return;
    const pub  = bar.querySelector('#msaf-grouppub-btn'),
          dl   = bar.querySelector('#msaf-groupdl-btn'),
          shr  = bar.querySelector('#msaf-groupshare-btn'),
          pkg  = bar.querySelector('#msaf-package-btn'),
          clr  = bar.querySelector('#msaf-selclear');
    if(!pub || !dl || !shr || !pkg){ console.warn('[groupact] action bar is missing the group buttons'); return; }
    const fmt = activeFormat();
    const soc = selectionFor(SOCIAL), prn = selectionFor(PRINT), all = selection();
    const inPkg = document.body.classList.contains('msaf-pkgmode');
    if(clr) clr.hidden = all.length === 0;

    /* package mode keeps its own gate — leave the bar exactly as mel/20 painted it */
    if(inPkg){ pub.hidden = dl.hidden = shr.hidden = true; pkg.hidden = false; return; }

    /* a group action is only ever live for the assets in scope on this tab */
    pub.disabled = soc.length === 0;
    dl.disabled = shr.disabled = prn.length === 0;

    const isSocial = SOCIAL.indexOf(fmt) > -1, isPrint = PRINT.indexOf(fmt) > -1;
    /* The tab owns the action, and it shows in its disabled state at zero selection —
       social tabs publish, print tabs download/send. "Build listing package" is the v1
       button and only stands in on site + email, which have no group action of their own. */
    if(isSocial){
      pub.hidden = false; dl.hidden = shr.hidden = true; pkg.hidden = true;
      pub.querySelector('.msaf-actionlbl').textContent = S.timing === 'sched' ? 'Schedule' : 'Publish';
      pub.querySelector('.msaf-actioncnt').textContent = soc.length + (soc.length === 1 ? ' asset' : ' assets');
    } else if(isPrint){
      pub.hidden = true; dl.hidden = shr.hidden = false; pkg.hidden = true;
      dl.querySelector('.msaf-actioncnt').textContent = prn.length;
      shr.querySelector('.msaf-actioncnt').textContent = prn.length;
    } else {
      pub.hidden = dl.hidden = shr.hidden = true; pkg.hidden = false;
    }
  }
  window.__melSyncGroupBar = syncBar;

  /* every selection change funnels through MELTPLBAR.paint() — extend it */
  function hookPaint(){
    const B = window.MELTPLBAR;
    if(!B || B.__ga) return false;
    const orig = B.paint.bind(B);
    B.paint = function(){ orig(); syncBar(); };
    B.__ga = true;
    return true;
  }
  if(!hookPaint()){
    let n = 0;
    const t = setInterval(() => { if(hookPaint() || ++n > 40) clearInterval(t); }, 50);
  }

  /* ---------- sheet plumbing ---------- */
  function close(){
    const s = document.querySelector('.mga');
    if(s) s.remove();
    document.removeEventListener('keydown', onKey);
  }
  function onKey(e){ if(e.key === 'Escape') close(); }
  function open(html, wire){
    close();
    const s = document.createElement('div');
    s.className = 'mga';
    s.setAttribute('role','dialog');
    s.setAttribute('aria-modal','true');
    s.innerHTML = '<div class="mga-card">' + html + '</div>';
    s.addEventListener('click', e => {
      if(e.target === s || e.target.closest('[data-mgaclose]')) { close(); return; }
    });
    document.body.appendChild(s);
    document.addEventListener('keydown', onKey);
    if(wire) wire(s);
    const f = s.querySelector('.mga-btn--pri, .mga-x');
    if(f) f.focus();
    return s;
  }
  function head(title, sub){
    return '<div class="mga-hd"><div class="mga-hdtx"><h2>' + esc(title) + '</h2><p>' + esc(sub) + '</p></div>' +
      '<button class="mga-x" type="button" data-mgaclose aria-label="Close"><i class="ph ph-x" aria-hidden="true"></i></button></div>';
  }
  function addr(){
    const a = document.querySelector('.msnfs[data-nf="templates"] [data-nfaddr]');
    return (a && a.textContent.trim()) || 'this listing';
  }
  /* one photo box size for every card — used to scale row thumbs */
  function refSize(){
    const list = document.querySelectorAll('.msafcard--tpl:not(.hide) .msafcard-photo');
    for(const p of list){ const r = p.getBoundingClientRect(); if(r.width && r.height) return r; }
    return null;
  }
  function paintThumbs(scope){
    const ref = refSize();
    scope.querySelectorAll('.mga-rowth[data-tpl]').forEach(box => {
      const src = document.querySelector('.msafcard--tpl[data-nftpl="' + box.dataset.tpl + '"] .msafcard-photo');
      if(!src || !ref){ console.warn('[groupact] no render to thumb for ' + box.dataset.tpl); return; }
      const k = 34 / ref.width;
      const c = src.cloneNode(true);
      c.removeAttribute('aria-hidden');
      c.querySelectorAll('.msafcard-tplhover,.msaf-favbtn,.msafcard-status,.msafcard-melbadge').forEach(n => n.remove());
      c.style.cssText += ';width:' + ref.width + 'px;height:' + ref.height + 'px;transform:scale(' + k + ')';
      box.textContent = '';
      box.appendChild(c);
    });
  }
  function today(){ const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().slice(0,10); }
  function row(a, inputs){
    return '<div class="mga-row" data-key="' + esc(a.key) + '">' +
      '<span class="mga-rowth" data-tpl="' + esc(a.key) + '"><i class="ph ph-image" aria-hidden="true"></i></span>' +
      '<span class="mga-rowtx"><b>' + esc(a.name) + '</b><i>' + esc(FMT_NM[a.fmt] || a.fmt) + '</i></span>' +
      '<span class="mga-rowin">' + inputs + '</span></div>';
  }
  function whenInputs(){
    return '<input class="mga-in mga-in--date" type="date" value="' + today() + '" aria-label="Date">' +
           '<input class="mga-in mga-in--time" type="time" value="18:10" aria-label="Time">';
  }
  const SPARK = '<svg class="msp" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
    '<path d="M12 2c.6 5 4 8.4 9 9-5 .6-8.4 4-9 9-.6-5-4-8.4-9-9 5-.6 8.4-4 9-9z"/></svg>';

  /* ---------- group publish ---------- */
  function publishSheet(){
    const assets = selectionFor(SOCIAL);
    if(!assets.length){ console.warn('[groupact] publish with nothing selected — button should be disabled'); return; }
    const platCard = p =>
      '<button class="mga-plat' + (linked(p) && S.plats[p.k] ? ' on' : '') + (linked(p) ? '' : ' off') +
      '" type="button" data-plat="' + p.k + '" aria-pressed="' + (linked(p) && S.plats[p.k] ? 'true' : 'false') + '">' +
      (linked(p)
        ? '<span class="tick"><i class="ph ph-check" aria-hidden="true"></i></span>'
        : '<span class="mga-conn" data-connect="' + p.k + '">Connect</span>') +
      '<span class="ico"><i class="ph ' + p.ico + '" aria-hidden="true"></i></span>' +
      '<b>' + p.nm + '</b><i>' + subline(p) + '</i></button>';
    const plats = PLATS.map(platCard).join('');
    const noneLinked = PLATS.every(p => !linked(p));

    const body =
      '<div class="mga-body">' +
        '<div class="mga-sec">' +
          '<span class="mga-lb">Where <em>· pick one or more</em></span>' +
          '<div class="mga-plats">' + plats + '</div>' +
          '<div class="mga-noconn"' + (noneLinked ? '' : ' hidden') + '>' +
            '<i class="ph ph-warning-circle" aria-hidden="true"></i>' +
            '<span>No accounts connected yet. Connect one above, or download the assets and post them by hand — ' +
            'Mel keeps every caption with the file.</span></div>' +
        '</div>' +
        '<div class="mga-sec">' +
          '<span class="mga-lb">When</span>' +
          '<div class="mga-seg" role="group" aria-label="Timing">' +
            '<button type="button" data-timing="now" class="' + (S.timing === 'now' ? 'on' : '') + '">Publish now</button>' +
            '<button type="button" data-timing="sched" class="' + (S.timing === 'sched' ? 'on' : '') + '">Schedule</button>' +
          '</div>' +
          '<div class="mga-schedwrap" ' + (S.timing === 'sched' ? '' : 'hidden') + '>' +
            '<div class="mga-when">' +
              '<div class="mga-seg" role="group" aria-label="Time scope">' +
                '<button type="button" data-scope="all" class="' + (S.scope === 'all' ? 'on' : '') + '">Same time for all</button>' +
                '<button type="button" data-scope="asset" class="' + (S.scope === 'asset' ? 'on' : '') + '">Per asset</button>' +
                '<button type="button" data-scope="plat" class="' + (S.scope === 'plat' ? 'on' : '') + '">Per platform</button>' +
              '</div>' +
            '</div>' +
            '<div class="mga-scopebody"></div>' +
            '<button class="melsugchip" type="button" data-melsug>' + SPARK +
              '<span class="mlab">Thu 6:10 PM landed best on your last three listings — use it</span></button>' +
          '</div>' +
        '</div>' +
      '</div>';

    const ft =
      '<div class="mga-ft">' +
        '<span class="mga-ftnote"></span>' +
        '<button class="mga-btn mga-btn--ghost" type="button" data-mgaclose>Cancel</button>' +
        '<button class="mga-btn mga-btn--pri" type="button" data-go>' +
          '<i class="ph ph-paper-plane-tilt" aria-hidden="true"></i><span class="lb">Publish</span></button>' +
      '</div>';

    open(head('Publish ' + assets.length + (assets.length === 1 ? ' asset' : ' assets'),
              addr() + ' · ' + assets.map(a => FMT_NM[a.fmt] || a.fmt)
                .filter((v,i,arr) => arr.indexOf(v) === i).join(' · ')) + body + ft, sheet => {
      const scopeBody = sheet.querySelector('.mga-scopebody'),
            note = sheet.querySelector('.mga-ftnote'),
            go = sheet.querySelector('[data-go]'),
            golb = go.querySelector('.lb');

      function onPlats(){ return PLATS.filter(p => S.plats[p.k] && linked(p)); }
      function paintScope(){
        if(S.timing !== 'sched'){ scopeBody.innerHTML = ''; return; }
        if(S.scope === 'all'){
          scopeBody.innerHTML = '<div class="mga-when">' + whenInputs() +
            '<span class="mga-tz">Pacific time · every selected asset and platform</span></div>';
        } else if(S.scope === 'asset'){
          scopeBody.innerHTML = '<div class="mga-rows">' +
            assets.map(a => row(a, whenInputs())).join('') + '</div>';
          paintThumbs(scopeBody);
        } else {
          const ps = onPlats();
          scopeBody.innerHTML = ps.length
            ? '<div class="mga-rows">' + ps.map(p =>
                '<div class="mga-row"><span class="mga-rowth"><i class="ph ' + p.ico + '" aria-hidden="true"></i></span>' +
                '<span class="mga-rowtx"><b>' + p.nm + '</b><i>' + assets.length +
                (assets.length === 1 ? ' asset' : ' assets') + ' · ' + p.sub + '</i></span>' +
                '<span class="mga-rowin">' + whenInputs() + '</span></div>').join('') + '</div>'
            : '<div class="mga-rows"><div class="mga-row"><span class="mga-rowth"><i class="ph ph-warning" aria-hidden="true"></i></span>' +
              '<span class="mga-rowtx"><b>Pick a platform first</b><i>Times are set per platform</i></span></div></div>';
        }
      }
      function paint(){
        const ps = onPlats();
        go.disabled = ps.length === 0;
        golb.textContent = S.timing === 'sched'
          ? 'Schedule ' + assets.length + (assets.length === 1 ? ' post' : ' posts')
          : 'Publish ' + assets.length + (assets.length === 1 ? ' asset' : ' assets') + ' now';
        note.textContent = ps.length
          ? assets.length + (assets.length === 1 ? ' asset' : ' assets') + ' → ' + ps.map(p => p.nm).join(', ')
          : (PLATS.every(x => !linked(x)) ? 'Connect an account to publish from here.' : 'Pick at least one platform.');
        sheet.querySelector('.mga-schedwrap').hidden = S.timing !== 'sched';
        paintScope();
        syncBar();
      }
      /* Linking an account: the card shows its own progress, then becomes selectable and is
         pre-checked, because the agent only connects it in order to post to it. */
      function connect(card, k){
        const p = PLATS.find(x => x.k === k);
        if(!p){ console.warn('[groupact] connect for unknown platform ' + k); return; }
        if(card.classList.contains('busy')) return;
        card.classList.add('busy');
        const pill = card.querySelector('.mga-conn');
        if(pill) pill.textContent = 'Connecting\u2026';
        setTimeout(() => {
          S.conn[k] = true;
          S.plats[k] = true;
          card.classList.remove('busy');
          card.outerHTML = platCard(p);
          const fresh = sheet.querySelector('[data-plat="' + k + '"]');
          if(fresh){ fresh.classList.add('on'); fresh.setAttribute('aria-pressed', 'true'); }
          const nc = sheet.querySelector('.mga-noconn');
          if(nc) nc.hidden = PLATS.some(x => linked(x));
          if(window.sonner) sonner(p.nm + ' connected', p.exportOnly
            ? 'No direct posting on this account — Mel exports the file and holds the caption for you'
            : 'Mel can publish and schedule to ' + p.sub + ' from here');
          paint();
        }, 1100);
      }

      sheet.addEventListener('click', e => {
        const cn = e.target.closest('[data-connect]');
        if(cn){ connect(cn.closest('[data-plat]'), cn.dataset.connect); return; }
        const p = e.target.closest('[data-plat]');
        if(p){
          const k = p.dataset.plat;
          if(!S.conn[k]){ connect(p, k); return; }   /* the whole card is the connect target */
          S.plats[k] = !S.plats[k];
          p.classList.toggle('on', S.plats[k]);
          p.setAttribute('aria-pressed', S.plats[k] ? 'true' : 'false');
          paint(); return;
        }
        const t = e.target.closest('[data-timing]');
        if(t){
          S.timing = t.dataset.timing;
          sheet.querySelectorAll('[data-timing]').forEach(b => b.classList.toggle('on', b === t));
          paint(); return;
        }
        const sc = e.target.closest('[data-scope]');
        if(sc){
          S.scope = sc.dataset.scope;
          sheet.querySelectorAll('[data-scope]').forEach(b => b.classList.toggle('on', b === sc));
          paintScope(); return;
        }
        if(e.target.closest('[data-melsug]')){
          S.timing = 'sched'; S.scope = 'all';
          sheet.querySelectorAll('[data-timing]').forEach(b => b.classList.toggle('on', b.dataset.timing === 'sched'));
          sheet.querySelectorAll('[data-scope]').forEach(b => b.classList.toggle('on', b.dataset.scope === 'all'));
          paint();
          const d = sheet.querySelector('.mga-in--time'); if(d) d.value = '18:10';
          return;
        }
        if(e.target.closest('[data-go]')) confirmPublish(sheet, assets, onPlats());
      });
      paint();
    });
  }

  function confirmPublish(sheet, assets, plats){
    const names = plats.map(p => p.nm).join(' + ');
    const sched = S.timing === 'sched';
    const scopeTx = S.scope === 'all' ? 'one time for all'
                  : S.scope === 'asset' ? 'a time per asset' : 'a time per platform';
    const card = sheet.querySelector('.mga-card');
    card.innerHTML = head(sched ? 'Scheduled' : 'Publishing now', addr()) +
      '<div class="mga-done"><span class="mga-doneico"><i class="ph ph-check" aria-hidden="true"></i></span>' +
      '<h3>' + assets.length + (assets.length === 1 ? ' asset ' : ' assets ') + (sched ? 'scheduled' : 'going out') + ' · ' + esc(names) + '</h3>' +
      '<p>' + (sched ? 'Set with ' + scopeTx + '. Mel posts them and logs the result — nothing else needed from you.'
                     : 'Mel is posting them now. You will see each result in the library.') +
        (plats.some(p => p.exportOnly)
          ? ' ' + plats.filter(p => p.exportOnly).map(p => p.nm).join(' and ') +
            ' has no direct posting — the file and caption are in your downloads, ready to post.'
          : '') + '</p></div>' +
      '<div class="mga-ft"><span class="mga-ftnote">Saved to the library as ' + (sched ? 'Scheduled' : 'Posted') + '.</span>' +
      '<button class="mga-btn mga-btn--ghost" type="button" data-mgaclose>Back to templates</button>' +
      '<button class="mga-btn mga-btn--pri" type="button" data-mgaclose>View in library</button></div>';
    if(window.sonner) sonner(sched ? 'Scheduled · ' + assets.length + ' assets' : 'Publishing ' + assets.length + ' assets',
                             names + ' · ' + (sched ? scopeTx : 'going out now'));
  }

  /* ---------- flyers: download ---------- */
  function downloadSheet(){
    const assets = selectionFor(PRINT);
    if(!assets.length) return;
    const FMTS = [
      { k:'pdf', nm:'Print-ready PDF', sub:'300 DPI, crop marks, CMYK — what a print shop wants' },
      { k:'png', nm:'PNG',             sub:'Transparent-safe, best for screens and text messages' },
      { k:'jpg', nm:'JPG',             sub:'Smallest file — fine for email attachments' }
    ];
    const SIZES = [['letter','Letter 8.5×11'],['a4','A4'],['tab','11×17'],['post','18×24']];
    const body =
      '<div class="mga-body">' +
        '<div class="mga-sec"><span class="mga-lb">File</span><div class="mga-opts">' +
          FMTS.map(f => '<button class="mga-opt' + (S.dlFmt === f.k ? ' on' : '') + '" type="button" data-dlfmt="' + f.k + '">' +
            '<span class="dot"></span><span class="mga-opttx"><b>' + f.nm + '</b><i>' + f.sub + '</i></span></button>').join('') +
        '</div></div>' +
        '<div class="mga-sec"><span class="mga-lb">Paper size</span><div class="mga-chips">' +
          SIZES.map(s => '<button class="mga-chip' + (S.dlSize === s[0] ? ' on' : '') + '" type="button" data-dlsize="' + s[0] + '">' + s[1] + '</button>').join('') +
        '</div></div>' +
        '<div class="mga-sec"><span class="mga-lb">Files <em>· one per selected flyer</em></span>' +
          '<div class="mga-rows">' + assets.map(a => row(a, '<span class="mga-tz" data-ext>PDF</span>')).join('') + '</div>' +
        '</div>' +
      '</div>';
    const ft = '<div class="mga-ft"><span class="mga-ftnote">' + assets.length +
      (assets.length === 1 ? ' file' : ' files') + ' · zipped if more than one</span>' +
      '<button class="mga-btn mga-btn--ghost" type="button" data-mgaclose>Cancel</button>' +
      '<button class="mga-btn mga-btn--pri" type="button" data-go><i class="ph ph-download-simple" aria-hidden="true"></i>' +
      '<span class="lb">Download ' + assets.length + '</span></button></div>';

    open(head('Download ' + assets.length + (assets.length === 1 ? ' flyer' : ' flyers'), addr()) + body + ft, sheet => {
      paintThumbs(sheet);
      function exts(){ sheet.querySelectorAll('[data-ext]').forEach(e => { e.textContent = S.dlFmt.toUpperCase(); }); }
      sheet.addEventListener('click', e => {
        const f = e.target.closest('[data-dlfmt]');
        if(f){ S.dlFmt = f.dataset.dlfmt;
          sheet.querySelectorAll('[data-dlfmt]').forEach(b => b.classList.toggle('on', b === f)); exts(); return; }
        const s = e.target.closest('[data-dlsize]');
        if(s){ S.dlSize = s.dataset.dlsize;
          sheet.querySelectorAll('[data-dlsize]').forEach(b => b.classList.toggle('on', b === s)); return; }
        if(e.target.closest('[data-go]')){
          close();
          if(window.sonner) sonner('Downloading ' + assets.length + (assets.length === 1 ? ' flyer' : ' flyers'),
                                   S.dlFmt.toUpperCase() + ' · ' + (SIZES.find(x => x[0] === S.dlSize) || [,''])[1]);
        }
      });
    });
  }

  /* ---------- flyers: send / share ---------- */
  function sendSheet(){
    const assets = selectionFor(PRINT);
    if(!assets.length) return;
    const TO = [
      { k:'printer', nm:'Print shop',    sub:'Bay Print Co. · orders@bayprint.co — saved contact', ico:'ph-printer' },
      { k:'email',   nm:'Email',         sub:'Attach the print-ready PDFs to a new message',       ico:'ph-envelope-simple' },
      { k:'text',    nm:'Text message',  sub:'Sends a link — best for a client or a co-agent',     ico:'ph-device-mobile' },
      { k:'link',    nm:'Copy link',     sub:'One link to all selected flyers, viewer can download', ico:'ph-link-simple' }
    ];
    const body =
      '<div class="mga-body">' +
        '<div class="mga-sec"><span class="mga-lb">Send to</span><div class="mga-opts">' +
          TO.map(t => '<button class="mga-opt' + (S.sendTo === t.k ? ' on' : '') + '" type="button" data-sendto="' + t.k + '">' +
            '<span class="dot"></span><span class="mga-opttx"><b>' + t.nm + '</b><i>' + t.sub + '</i></span></button>').join('') +
        '</div>' +
        '<textarea class="mga-note" placeholder="Note for the recipient — quantity, paper, pickup date">' +
          'Please run ' + assets.length + ' — 100 each on 100 lb gloss. Pickup Friday.</textarea>' +
        '</div>' +
        '<div class="mga-sec"><span class="mga-lb">Attached</span><div class="mga-rows">' +
          assets.map(a => row(a, '<span class="mga-tz">Print-ready PDF</span>')).join('') + '</div></div>' +
      '</div>';
    const ft = '<div class="mga-ft"><span class="mga-ftnote">Nothing is published — flyers only send.</span>' +
      '<button class="mga-btn mga-btn--ghost" type="button" data-mgaclose>Cancel</button>' +
      '<button class="mga-btn mga-btn--pri" type="button" data-go><i class="ph ph-paper-plane-tilt" aria-hidden="true"></i>' +
      '<span class="lb">Send ' + assets.length + '</span></button></div>';

    open(head('Send ' + assets.length + (assets.length === 1 ? ' flyer' : ' flyers'), addr()) + body + ft, sheet => {
      paintThumbs(sheet);
      sheet.addEventListener('click', e => {
        const t = e.target.closest('[data-sendto]');
        if(t){ S.sendTo = t.dataset.sendto;
          sheet.querySelectorAll('[data-sendto]').forEach(b => b.classList.toggle('on', b === t)); return; }
        if(e.target.closest('[data-go]')){
          const to = TO.find(x => x.k === S.sendTo) || TO[0];
          close();
          if(window.sonner) sonner('Sent ' + assets.length + (assets.length === 1 ? ' flyer' : ' flyers'), to.nm + ' · ' + to.sub.split(' · ')[0]);
        }
      });
    });
  }

  /* ---------- bar clicks ---------- */
  document.addEventListener('click', e => {
    if(e.target.closest('#msaf-grouppub-btn')){ e.preventDefault(); publishSheet(); return; }
    if(e.target.closest('#msaf-groupdl-btn')){ e.preventDefault(); downloadSheet(); return; }
    if(e.target.closest('#msaf-groupshare-btn')){ e.preventDefault(); sendSheet(); return; }
    if(e.target.closest('#msaf-selclear')){
      e.preventDefault();
      const by = picksByFormat();
      Object.keys(by).forEach(f => by[f].slice().forEach(k => {
        const card = document.querySelector('.msafcard--tpl[data-nftpl="' + k + '"]');
        if(card && card.classList.contains('sel')) card.click();
      }));
      if(window.MELTPLBAR) window.MELTPLBAR.paint();
      syncBar();
      return;
    }
    /* tab switch repaints which group actions apply — run after mel/20's handler */
    if(e.target.closest('[data-nfformat]')) setTimeout(syncBar, 0);
  });

  /* ---------- edit -> save -> back to the selection view ----------
     The pencil already opens the editor (mel/35). Window-capture runs before document
     handlers, so we get to record which card is being edited before mel/35 stops the event.
     On save we mark that card so the agent sees the edit came back with them. */
  window.addEventListener('click', e => {
    const btn = e.target.closest && e.target.closest('[data-tplact="edit"]');
    if(!btn) return;
    const card = btn.closest('.msafcard--tpl');
    if(card) window.__melEditReturn = { key: card.dataset.nftpl, fmt: activeFormat() };
  }, true);

  document.addEventListener('click', e => {
    if(!e.target.closest('#pke-save')) return;
    const r = window.__melEditReturn;
    if(!r) return;
    const card = document.querySelector('.msafcard--tpl[data-nftpl="' + r.key + '"]');
    if(!card){ console.warn('[groupact] edited card ' + r.key + ' is no longer in the grid'); return; }
    card.classList.add('is-edited');
    const box = card.querySelector('[data-nfcheck]');
    if(box && !box.checked) card.click();
    if(window.MELTPLBAR) window.MELTPLBAR.paint();
    syncBar();
    if(window.sonner) sonner('Saved', 'Back on the templates list — it is selected, ready to publish or send');
  });

  document.addEventListener('DOMContentLoaded', syncBar);
  setTimeout(syncBar, 400);
})();
