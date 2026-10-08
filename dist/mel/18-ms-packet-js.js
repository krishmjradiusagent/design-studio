/* =========================================================
   Listing packet + Match a design — additive layer, no touch
   on existing studio flow. Wires the packet card, the studio
   property search bar, and the "Match a design" panel in the
   channel editor viewer.
   ========================================================= */
(function(){
  const $ = id => document.getElementById(id);
  if(!window.MEL || !window.MEL.page) return;
  const page = window.MEL.page;
  const esc = window.MEL.esc || (s => String(s).replace(/[&<>"']/g, m => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m])));
  const money = n => '$' + n.toLocaleString('en-US');
  const sv = d => '<svg viewBox="0 0 24 24">' + d + '</svg>';
  const CHK = '<svg viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg>';
  const SPARK = '<svg viewBox="0 0 24 24"><path d="M12 2 14 9l7 2-7 2-2 7-2-7-7-2 7-2z"/></svg>';

  /* ---------- data ---------- */
  const FALLBACK_LISTINGS = [
    { id:'grove', a:'1420 Grove St', hood:'Noe Valley · San Francisco', bd:3, ba:2, sqft:'1,510', price:1285000, ph:'#cfc9c0', img:'assets/prop/s1.jpg', mls:'424118902' },
    { id:'maple', a:'412 Maple Ave', hood:'Rockridge · Oakland',       bd:4, ba:3, sqft:'2,240', price:975000,  ph:'#c7d0d2', img:'assets/prop/s2.jpg', mls:'41069318' },
    { id:'pine',  a:'88 Pine St, Unit 12B', hood:'Financial District · San Francisco', bd:2, ba:2, sqft:'1,120', price:842000, ph:'#d6cec4', img:'assets/prop/s3.jpg', mls:'424106744' }
  ];
  const LISTINGS_SRC = () => (window.MELSTUDIO && window.MELSTUDIO.LISTINGS) || FALLBACK_LISTINGS;
  /* backwards-name for a few local usages */
  const LISTINGS = new Proxy({}, { get(_, k){ return LISTINGS_SRC()[k]; }, has(_, k){ return k in LISTINGS_SRC(); }, ownKeys(){ return Object.keys(LISTINGS_SRC()); }, getOwnPropertyDescriptor(){ return { enumerable:true, configurable:true }; } });
  /* helper for iteration — always yields the live array */
  const LIST = () => LISTINGS_SRC();
  const thumb = p => "--ph:" + (p.ph || '#cfc9c0') + (p.img ? ";background-image:url('" + p.img + "'), linear-gradient(135deg," + (p.ph || '#cfc9c0') + "," + (p.ph || '#cfc9c0') + ")" : '');

  /* the 8 package assets — order controls the fill sequence */
  const PKG = [
    { key:'igpost',  cat:'Instagram',nm:'Feed post',        ratio:'sq',   ico:'<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="3.6"/><circle cx="17.4" cy="6.6" r="1" fill="currentColor" stroke="none"/>' },
    { key:'website', cat:'Website',  nm:'Property page',    ratio:'h169', ico:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18"/>' },
    { key:'igstory', cat:'Instagram',nm:'Story',            ratio:'v916', ico:'<rect x="7" y="2" width="10" height="20" rx="3"/><circle cx="12" cy="12" r="3"/>' },
    { key:'reels',   cat:'Reels',    nm:'Photo reel',       ratio:'v916', ico:'<rect x="3" y="3" width="18" height="18" rx="5"/><path d="m10 9 5 3-5 3z"/>' },
    { key:'tiktok',  cat:'TikTok',   nm:'Walkthrough clip', ratio:'v916', ico:'<path d="M12 15a3 3 0 1 1-3-3"/><path d="M12 15V3c1.4 2.6 3.1 3.7 5 4"/>' },
    { key:'x',       cat:'X',        nm:'Listing tweet',    ratio:'h169', ico:'<path d="m4 4 16 16M20 4 4 20"/>' },
    { key:'email',   cat:'Email',    nm:'Just-listed blast',ratio:'h169', ico:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 6 9 8 9-8"/>' },
    { key:'flyer',   cat:'Print',    nm:'Open-house flyer', ratio:'v916', ico:'<rect x="6" y="3" width="12" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h4"/>' }
  ];

  const S = { prop:null, checked:new Set(PKG.map(p => p.key)), generating:false, done:new Set(), timers:[] };

  /* ---------- Packet panel: build once, mount in .msstudio ---------- */
  const studio = document.getElementById('ms-studio');
  if(!studio) return;
  const panel = document.createElement('div');
  panel.className = 'mspacket';
  panel.id = 'ms-packet';
  panel.innerHTML =
    '<div class="head"><span class="eyebrow"><img src="assets/mel-icon.svg" alt="">Design studio</span>' +
      '<h2>Listing package</h2>' +
      '<p>Every asset from one address.</p></div>' +
    '<div id="pk-chipwrap"></div>' +
    '<div class="scope" id="pk-scope"><div class="slab"><span>Included in this package</span><span class="cnt" id="pk-cnt">8 of 8 selected</span></div><div class="list" id="pk-list"></div></div>' +
    '<button class="go" type="button" id="pk-go"><img src="assets/mel-icon.svg" alt="" class="gomel"><span>Generate listing package</span></button>';
  studio.appendChild(panel);

  const list = $('pk-list'), goBtn = $('pk-go');

  /* ---------- completed-packet records ----------
     Keyed by address so the chat thread it spawns rebuilds a real recap
     (what was generated + next actions) instead of showing an empty log. */
  const PACKETS = {};
  let lastPacket = null;
  const _recqr = arr => '<div class="msqr">' + arr.map(x =>
    '<button type="button" data-pkrec="' + x.k + '">' + esc(x.l) + '</button>').join('') + '</div>';
  function packetRecap(rec){
    const items = rec.items || [];
    const rows = items.map(x =>
      '<div class="pkrecrow"><span class="i">' + sv(x.ico) + '</span><span class="n">' + esc(x.nm) + '</span></div>'
    ).join('');
    /* SVG-heavy content is injected AFTER streaming (the streamer only handles prose) */
    const extra = '<div class="pkrec">' + rows + '</div>' + _recqr([
      { k:'review',  l:'Review the assets' },
      { k:'library', l:'Open in Library' },
      { k:'new',     l:'Start another packet' }
    ]);
    return {
      body:
        '<p>Here’s your listing package for <b>' + esc(rec.prop.a) + '</b> — ' + items.length +
        ' asset' + (items.length === 1 ? '' : 's') + ' from one address. Open it to review and refine each one — ' +
        'nothing posts until you say so.</p>',
      after: b => b.insertAdjacentHTML('beforeend', extra)
    };
  }
  /* returning to a "Listing packet — <address>" thread routes through here */
  if(window.MELSTUDIO && typeof window.MELSTUDIO.reply === 'function'){
    const _origStudioReply = window.MELSTUDIO.reply.bind(window.MELSTUDIO);
    window.MELSTUDIO.reply = function(text){
      const m = /^listing pack(?:et|age)\s*[\u2014-]\s*(.+)$/i.exec(String(text || '').trim());
      if(m){ const rec = PACKETS[m[1].trim()] || lastPacket; if(rec) return packetRecap(rec); }
      return _origStudioReply(text);
    };
  }
  /* recap quick-reply actions (delegated — the message lives in the chat thread) */
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-pkrec]'); if(!b) return;
    e.preventDefault();
    const a = b.dataset.pkrec;
    if(a === 'library'){ const n = document.getElementById('ms-navlib'); if(n) n.click(); }
    else if(a === 'new'){
      const n = document.getElementById('ms-navstudio'); if(n) n.click();
      setTimeout(() => { const c = document.querySelector('.mshcard[data-hub="packet"]'); if(c) c.click(); }, 180);
    }
    else if(a === 'review' && lastPacket){
      S.prop = lastPacket.prop;
      S.checked = new Set(lastPacket.items.map(i => i.key));
      page.classList.add('packeton');
      try { openEditor(); } catch(_){}
    }
  });
  /* the packet editor is a window INSIDE the Mel copilot box — same geometry as the
     post viewer, so the Mel chrome and side panel stay put */
  (function(){
    const w = document.querySelector('.melwrap'), e = document.getElementById('pk-edit');
    if(w && e && e.parentNode !== w) w.appendChild(e);
  })();
  /* editor DOM refs */
  const edit = $('pk-edit'), erail = $('pke-rail'), enav = $('pke-nav'),
        esh = $('pke-sh-title'), eshSub = $('pke-sh-sub'),
        esbody = $('pke-sbody'), estatus = $('pke-status'), esub = $('pke-sub');

  function renderScope(){
    list.innerHTML = PKG.map(x => (
      '<label class="mspksbox">' +
        '<input type="checkbox" data-pks="' + x.key + '"' + (S.checked.has(x.key) ? ' checked' : '') + '>' +
        '<span class="ico">' + sv(x.ico) + '</span>' +
        '<span class="nm">' + esc(x.nm) + '</span>' +
      '</label>'
    )).join('');
    $('pk-cnt').textContent = S.checked.size + ' of ' + PKG.length + ' selected';
    goBtn.disabled = S.checked.size === 0 || !S.prop;
  }

  function renderChip(){
    const wrap = $('pk-chipwrap');
    const scope = $('pk-scope');
    if(!S.prop){
      /* STEP 1 — ask for the address. Inline search at the top; the packet
         list and the generate button stay hidden until a property is picked. */
      wrap.innerHTML =
        '<div class="pkpick on" id="pk-pick">' +
          '<div class="pkpin">' +
            sv('<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>') +
            '<input id="pk-pin" type="text" placeholder="Search a property address, or pick one below" autocomplete="off" spellcheck="false">' +
            '<span class="kbd">Enter</span>' +
          '</div>' +
          '<div class="pkdrop" id="pk-pdrop"></div>' +
        '</div>';
      if(scope) scope.style.display = 'none';
      goBtn.style.display = 'none';
      wirePicker();
    } else {
      /* STEP 2 — property chosen, reveal the packet list + generate */
      wrap.innerHTML =
        '<div class="pkfor">' +
          '<span class="thm" style="' + thumb(S.prop) + '"></span>' +
          '<span class="txt"><b>For ' + esc(S.prop.a) + '</b><i>' + esc(S.prop.hood + ' · ' + S.prop.bd + ' bd · ' + S.prop.ba + ' ba · ' + money(S.prop.price)) + '</i></span>' +
          '<button class="pkchange" type="button" id="pk-change">Change property</button>' +
        '</div>';
      if(scope) scope.style.display = '';
      goBtn.style.display = '';
      goBtn.disabled = S.checked.size === 0;
      const chg = $('pk-change');
      if(chg) chg.addEventListener('click', () => { S.prop = null; renderChip(); renderScope(); });
    }
  }

  /* inline picker at the top of the packet panel — Mel's property-picker pattern */
  function wirePicker(){
    const pk = $('pk-pick'); if(!pk) return;
    const pin = $('pk-pin'), pdrop = $('pk-pdrop');
    const hoodShort = p => String(p.hood || '').split(' · ')[0];
    function paint(){
      const q = (pin.value || '').trim().toLowerCase();
      const raw = (pin.value || '').trim();
      const hits = LIST().filter(p => !q || p.a.toLowerCase().includes(q) || (p.hood || '').toLowerCase().includes(q) || String(p.mls || '').includes(q));
      const rows = hits.map(p => (
        '<button class="row" type="button" data-pkp="' + p.id + '">' +
          '<span class="thm" style="' + thumb(p) + '"></span>' +
          '<span style="min-width:0"><b>' + esc(p.a) + '</b><i>' + esc(hoodShort(p) + ' · ' + p.bd + ' bd · ' + p.ba + ' ba' + (p.mls ? ' · MLS ' + p.mls : '')) + '</i></span>' +
          '<span class="price">' + money(p.price) + '</span>' +
        '</button>'
      )).join('');
      const isMls = /^\d{6,}$/.test(raw);
      const mls = raw ?
        '<button class="pkmls" type="button" data-pkmls="' + esc(raw) + '">' +
          sv('<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>') +
          '<span>' + (isMls ? 'Look up MLS ' : 'Search the MLS for \u201c') + '<b>' + esc(raw) + '</b>' + (isMls ? '' : '\u201d') + '</span>' +
        '</button>' : '';
      pdrop.innerHTML =
        '<div class="grp">' + (q ? 'Matches in your CRM' : 'Recently added') + '</div>' +
        (rows ? '<div class="list">' + rows + '</div>' : (q ? '<div class="empty">No match in your CRM</div>' : '')) +
        mls;
    }
    paint();
    pin.addEventListener('input', paint);
    pin.addEventListener('keydown', e => {
      if(e.key === 'Enter'){ e.preventDefault(); const first = pdrop.querySelector('[data-pkp]') || pdrop.querySelector('[data-pkmls]'); if(first) first.click(); }
    });
    pdrop.addEventListener('click', e => {
      const r = e.target.closest('[data-pkp]');
      if(r){
        const p = LIST().find(x => x.id === r.dataset.pkp);
        if(p){ S.prop = p; renderChip(); renderScope(); }
        return;
      }
      const m = e.target.closest('[data-pkmls]');
      if(m){
        const q = m.dataset.pkmls || pin.value.trim();
        const num = (q.match(/\d{6,}/) || [])[0] || '424097902';
        const syn = { id:'mls-' + num, a:'1719 Judah St', hood:'Outer Sunset · San Francisco', bd:3, ba:2, sqft:'1,340', price:1149000, ph:'#d6cec4', img:'assets/prop/s3.jpg', mls:num };
        pdrop.innerHTML = '<div class="grp">Fetching from the board</div><div class="list"><div class="row" style="cursor:default"><span class="thm" style="' + thumb(syn) + '"></span><span style="min-width:0"><b>Looking up MLS ' + esc(num) + '\u2026</b><i>SFAR MLS \u00b7 Bridge</i></span></div></div>';
        setTimeout(() => { S.prop = syn; renderChip(); renderScope(); }, 600);
      }
    });
    setTimeout(() => { try { pin.focus(); } catch(_){} }, 60);
  }

  /* ---------- open / close packet ---------- */
  function openPacket(){
    page.classList.remove('canvason','library','paneled','pkediton');
    page.classList.add('packeton');
    renderChip(); renderScope();
    S.timers.forEach(t => clearTimeout(t)); S.timers = [];
  }
  function closePacket(){
    page.classList.remove('packeton','pkediton');
    S.timers.forEach(t => clearTimeout(t)); S.timers = [];
  }

  /* scope check toggle */
  list.addEventListener('change', e => {
    const cb = e.target.closest('[data-pks]'); if(!cb) return;
    if(cb.checked) S.checked.add(cb.dataset.pks); else S.checked.delete(cb.dataset.pks);
    $('pk-cnt').textContent = S.checked.size + ' of ' + PKG.length + ' selected';
    goBtn.disabled = S.checked.size === 0 || !S.prop;
  });

  /* (Change button removed — picked property is fixed until you leave the packet) */

  /* ============ Editor view ============ */
  const CAPTIONS = {
    igpost:  'Just listed. Sun-soaked home in {hood} with a redone kitchen and a private garden.\n\n{addr} · {price}\nOpen Sat 1–4 PM.\n#justlisted #forsale',
    igstory: 'New listing → tap to see the whole home. Open Saturday, 1–4 PM.',
    reels:   'Slide through the rooms. Kitchen. Garden. Primary. Every corner of {addr}.',
    tiktok:  'POV: you walked into your next place. {addr}, {price}. Open Sat 1–4.',
    x:       'Just listed — {addr}, {price}. Redone kitchen, private garden. Open Saturday 1–4 PM.',
    website: 'A quiet street, a garden, a kitchen you actually want to cook in. {addr} is on the market.',
    email:   'Subject: New in {hood} — {addr}\n\nI have a new one that fits what you told me you wanted. Open Saturday, 1–4 PM. Reply and I will hold a slot for you.',
    flyer:   'OPEN SATURDAY · 1–4 PM\n{addr}\n{price}\n\nMaya Kapoor · Radius Realty'
  };
  const EXTRA = {
    igpost:  [ { t:'Lead with the garden line', b:'Feature-first openers get 3\u00d7 your saves.', f:c => 'Private garden. Redone kitchen. Quiet street.\n\n' + c },
               { t:'Swap in neighborhood hashtags', b:'Trending near this listing the past 7 days.', f:c => c.replace(/#[\w]+/g,'').trimEnd() + '\n#justlisted #openhouse #bayarearealestate' } ],
    igstory: [ { t:'Add a countdown sticker line', b:'Story stickers lift your replies about 40%.', f:c => c + '\n\u23f1 Countdown: open house Saturday.' } ],
    reels:   [ { t:'Open on the garden shot', b:'Your reels that landed hold the first frame longer.', f:c => 'Start in the garden \u2192 ' + c } ],
    tiktok:  [ { t:'Put the number on screen', b:'Viewers scroll past when the price is caption-only.', f:c => c + '\nOn-screen text: {price}' } ],
    x:       [ { t:'Tighten to one sentence', b:'Your best tweets stay under 180 characters.', f:c => c.split(/[.\n]/)[0].trim() + '.' } ],
    website: [ { t:'Move the open-house block up', b:'Visitors during an open house look for it first.', f:c => 'Open Saturday, 1\u20134 PM.\n' + c } ],
    email:   [ { t:'Personalize the greeting', b:'\u201cHi {first_name}\u201d roughly doubles your opens.', f:c => c.replace(/I have a new one/, 'Hi {first_name} \u2014 I have a new one') } ],
    flyer:   [ { t:'Add a QR to the property page', b:'Two of your last five open houses converted a scan.', f:c => c + '\n\nScan for photos, floor plan and the disclosure packet.' } ]
  };
  function actsFor(key){
    const base = [
      { t:'Tighten the copy', b:'Cuts the filler, keeps the facts.', f:c => c.split('\n').filter(Boolean).slice(0,3).join('\n') },
      { t:'Add the open-house line', b:'Saturday 1\u20134 PM, in your usual phrasing.', f:c => /open sat/i.test(c) ? c : c + '\nOpen Saturday, 1\u20134 PM.' },
      { t:'Put the price first', b:'Readers stop at the first number.', f:c => '{price} \u00b7 {addr}\n' + c },
      { t:'Warmer, more personal tone', b:'Reads like you, not a listing sheet.', f:c => c.replace(/^Just listed\.?\s*/i, 'You have to see this one. ') },
      { t:'Add a soft CTA', b:'\u201cDM me for the private tour link\u201d fits your tone.', f:c => /DM|reply/i.test(c) ? c : c + '\nDM me for the private tour link.' }
    ];
    return (EXTRA[key] || []).concat(base);
  }
  const SUGGS = {
    igpost:  [ { t:'Lead with the garden line',       b:'Your last two posts that opened with a specific feature got 3× the saves.' },
               { t:'Add a soft CTA at the end',        b:'“DM for the private tour link” fits your recent tone.' },
               { t:'Swap in a hood-specific hashtag',  b:'Trending in this neighborhood the past 7 days.' } ],
    igstory: [ { t:'Add a countdown to the open house',b:'Story stickers lift replies about 40% for you.' },
               { t:'Try the swipe-up on the price',    b:'Higher tap-through than the address swipe last month.' } ],
    reels:   [ { t:'Open on the garden shot',          b:'Longer hold on the first frame in your reels that landed.' },
               { t:'Cut to 24 seconds',                b:'Your feed reels peak in reach at 22–26s.' } ],
    tiktok:  [ { t:'Add the price on-screen',          b:'TikTok viewers scroll past when the number is only in the caption.' },
               { t:'Use “run through it with me” hook',b:'Matches the walkthrough style that worked for Maple Ave.' } ],
    x:       [ { t:'Tighten to one sentence',          b:'Your best-performing tweets stay under 180 characters.' },
               { t:'Put price at the front',           b:'X readers stop at the first noun.' } ],
    website: [ { t:'Move the map above the gallery',   b:'Sellers you shared with last month asked for it upfront.' },
               { t:'Add the open house block',         b:'Website visits during the open house need it visible.' } ],
    email:   [ { t:'Personalize the greeting',         b:'“Hi {first_name}” beats “Hi there” by ~2× opens for you.' },
               { t:'Keep the subject under 50 chars',  b:'Mobile clients cut off after 48.' } ],
    flyer:   [ { t:'Bump the price to top-right',      b:'The eye lands there first on your flyer template.' },
               { t:'Add a QR to the property page',    b:'Two of your last five open houses converted a QR scan.' } ]
  };
  const TPLS = {
    igpost:  ['Wave','Feature sheet','Editorial','Collage','Minimal'],
    igstory: ['Bold','Photo split','Minimal'],
    reels:   ['Rooms cut','Address hero','B-roll only'],
    tiktok:  ['POV walk','Number reveal','Q&A'],
    x:       ['Price-first','Hook-first'],
    website: ['Editorial','Split hero','Price-led','Dark detail','Minimal'],
    email:   ['Just-listed','Open-house nudge','Price improvement'],
    flyer:   ['Bold','Editorial','Feature sheet']
  };
  const SWATCHES = ['#5A5FF2','#0E1633','#6F7346','#C89B3C','#B85CC9'];
  const PALS = [
    { c:'#5A5FF2', n:'Radius indigo', r:['#5A5FF2','#8A8DF7','#C7C9FC','#1E2148'] },
    { c:'#0E1633', n:'Midnight',      r:['#0E1633','#33406B','#7C89B8','#D6DCEF'] },
    { c:'#6F7346', n:'Olive',         r:['#6F7346','#9BA06B','#C9CDA4','#2F3320'] },
    { c:'#C89B3C', n:'Brass',         r:['#C89B3C','#E0BC72','#F2E0B8','#5A4415'] },
    { c:'#B4573A', n:'Terracotta',    r:['#B4573A','#D08768','#EDC7B4','#4A2116'] },
    { c:'#1F6F6B', n:'Coastal',       r:['#1F6F6B','#4E9C97','#A8CFCC','#0C3230'] },
    { c:'#6A3D6E', n:'Plum',          r:['#6A3D6E','#96699A','#CFB4D2','#2E1730'] },
    { c:'#2B2B2B', n:'Graphite',      r:['#2B2B2B','#5C5C5C','#B5B5B5','#0A0A0A'] }
  ];

  function fillPlaceholders(str){
    if(!S.prop) return str;
    return String(str).replace(/\{price\}/g, money(S.prop.price)).replace(/\{addr\}/g, S.prop.a).replace(/\{hood\}/g, (S.prop.hood || '').split(' · ')[0]);
  }
  function assetCaption(key){ return fillPlaceholders((S.captions && S.captions[key]) || CAPTIONS[key] || ''); }

  /* chip display names → renderer template keys */
  const NM2KEY = { 'Wave':'bold','Feature sheet':'photo','Editorial':'editorial','Collage':'split','Minimal':'minimal','Split hero':'photo','Price-led':'bold','Dark detail':'split' };
  function assetPreviewHTML(x){
    if(!S.prop || !window.MELSTUDIO) return '';
    const nm = (S.tpls && S.tpls[x.key]);
    const opts = { color: S.color, tpl: nm ? (NM2KEY[nm] || undefined) : undefined,
      img: (S.imgs && S.imgs[x.key]) || 0, font: (S.fonts && S.fonts[x.key]) || undefined };
    try {
      if(x.key === 'website') return window.MELSTUDIO.sitePreview(S.prop, opts);
      if(x.key === 'email')   return window.MELSTUDIO.emailPreview(S.prop, opts);
      if(x.key === 'flyer')   return window.MELSTUDIO.flyerPreview(S.prop, opts);
      return window.MELSTUDIO.postPreview(S.prop, x.key, opts);
    } catch(_){ return ''; }
  }

  function renderAsset(x){
    const cap = assetCaption(x.key);
    const label = x.key === 'email' ? 'Subject and body' : x.key === 'flyer' ? 'Print copy' : x.key === 'website' ? 'Hero copy' : 'Caption';
    return (
      '<article class="pkast pending" id="pkast-' + x.key + '" data-pk="' + x.key + '">' +
        '<div class="ah">' +
          '<span class="pi">' + sv(x.ico) + '</span>' +
          '<span><span class="an">' + esc(x.nm) + '</span> <span class="ac">· ' + esc(x.cat) + '</span></span>' +
          '<span class="as">Waiting</span>' +
        '</div>' +
        '<div class="pv ' + x.ratio + '" data-pv="' + x.key + '">' +
          '<span class="skel"></span>' +
          '<div class="real"></div>' +
        '</div>' +
        '<div class="pktr"><span class="pktrs"></span><span class="pktrt"></span></div>' +
        '<div class="caplab">' + label + ' · click to edit</div>' +
        '<div class="cap" data-cap="' + x.key + '" contenteditable="false" spellcheck="true">' + esc(cap) + '</div>' +
      '</article>'
    );
  }

  function fillAssetPreview(key){
    const cell = document.querySelector('.pkast[data-pk="' + key + '"]');
    if(!cell) return;
    const real = cell.querySelector('.real');
    const meta = PKG.find(p => p.key === key);
    if(real && meta){ real.innerHTML = assetPreviewHTML(meta); applyShots(key); }
  }

  /* the agent's own photos, laid into whatever image slots the preview has */
  function applyShots(key){
    const arr = (S.shots && S.shots[key]) || [];
    if(!arr.length) return;
    const real = document.querySelector('.pkast[data-pk="' + key + '"] .real');
    if(!real) return;
    real.querySelectorAll('[style*="background-image"]').forEach((el, i) => {
      const u = arr[i % arr.length]; if(u) el.style.backgroundImage = "url('" + u + "')";
    });
  }

  function renderNav(){
    if(!enav) return;
    const items = PKG.filter(x => S.checked.has(x.key));
    const open = enav.classList.contains('open');
    enav.innerHTML =
      '<button class="navhead" type="button" id="pke-navtoggle" aria-expanded="' + (open ? 'true' : 'false') + '">' +
        'Packet contents<span class="cnt">' + items.length + '</span>' +
        '<span class="cv">' + sv('<path d="m6 9 6 6 6-6"/>') + '</span>' +
      '</button>' +
      '<div class="navitems">' + items.map(x => (
        '<button type="button" data-jump="' + x.key + '"' +
          (S.active === x.key ? ' class="on"' : (S.done.has(x.key) ? ' class="done"' : '')) + '>' +
          '<span class="dt"></span><span class="nm">' + esc(x.nm) + '</span><span class="ct">' + esc(x.cat) + '</span>' +
        '</button>'
      )).join('') + '</div>';
    renderSwitch(items);
  }

  /* chevron switcher under the stage */
  function renderGen(){
    const lbl = $('pke-genlbl'), p = $('pke-genprev'), n = $('pke-gennext');
    if(!lbl) return;
    S.gn = S.gn || 1; S.gv = S.gv || 1;
    lbl.textContent = 'v' + S.gv + ' of ' + S.gn;
    if(p) p.disabled = S.gv <= 1;
    if(n) n.disabled = S.gv >= S.gn;
  }
  function pkItems(){ return PKG.filter(x => S.checked.has(x.key)); }
  function renderSwitch(items){
    items = items || pkItems();
    const sw = $('pke-switch');
    if(sw) sw.style.display = items.length > 1 ? '' : 'none';
    const lbl = $('pke-swlbl'), prev = $('pke-prev'), next = $('pke-next');
    if(!lbl) return;
    const i = Math.max(0, items.findIndex(x => x.key === S.active));
    const cur = items[i];
    lbl.innerHTML = cur ? '<b>' + esc(cur.nm) + '</b> \u00b7 ' + (i + 1) + ' of ' + items.length : '';
    prev.disabled = i <= 0;
    next.disabled = i >= items.length - 1;
  }
  function step(d){
    const items = pkItems();
    const i = items.findIndex(x => x.key === S.active);
    const n = items[i + d];
    if(n) setActive(n.key, true);
  }

  /* ---------- Mel row: template-aware upgrade advice ----------
     Every entry is an upgrade INSIDE the layout the agent picked. There is no
     "try another template" here by design — the Template row still owns that. */
  const MELICO = {
    up:    '<path d="M12 16V4m0 0L8 8m4-4 4 4"/><path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/>',
    cap:   '<path d="M4 6h16M4 11h16M4 16h9"/>',
    tag:   '<path d="M20.6 13.4 12 22l-9-9V4h9l8.6 8.6a1.4 1.4 0 0 1 0 2z"/><circle cx="7.5" cy="8.5" r="1.4"/>',
    brand: '<path d="M12 3l2.6 5.7 6.4.7-4.7 4.3 1.3 6.3-5.6-3.2-5.6 3.2 1.3-6.3L3 9.4l6.4-.7z"/>',
    photo: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>',
    font:  '<path d="M4 20h16"/><path d="m6 16 6-12 6 12"/><path d="M8 12h8"/>',
    accent:'<circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>',
    lock:  '<rect x="4" y="10" width="16" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
    spark: '<path d="M12 2c.6 5 4 8.4 9 9-5 .6-8.4 4-9 9-.6-5-4-8.4-9-9 5-.6 8.4-4 9-9z"/>'
  };
  const MELTPL = {
    'Wave': {
      shape:'the price band lands first',
      pick:/front|street|back yard|balcony/i,
      photoT:n => 'Put ' + n.toLowerCase() + ' behind the price band',
      photoR:'The price band sits low \u2014 a wide exterior keeps it readable.',
      col:'#0E1633', colT:'Take the band to Midnight',
      colR:'Midnight holds white numerals better than indigo over daylight.',
      fontR:'Keeps the price numerals even at feed size.',
      capRe:/tighten/i,
      capR:'The band already shows the price. Three lines is enough.',
      shots:1, tags:2,
      shootT:'Shoot the twilight front',
      shootR:'Dusk windows beat every daytime front you have run.',
      placeR:'One frame carries the post \u2014 yours reads better than MLS.',
      asks:['Make the price bigger','Warmer accent on the band','Tighten the caption']
    },
    'Feature sheet': {
      shape:'three photos and a fact strip carry it',
      pick:/kitchen|living|primary|dining/i,
      photoT:n => 'Move ' + n.toLowerCase() + ' into the hero slot',
      photoR:'The hero slot is twice the size. Give it the room buyers want.',
      col:'#6F7346', colT:'Warm the fact strip to Olive',
      colR:'Mostly type \u2014 olive warms the strip without fighting the photos.',
      fontR:'Fact labels sit at 11px. This face holds at that size.',
      capRe:/tighten/i,
      capR:'The facts are printed already. Sell the showing instead.',
      shots:3, tags:2,
      shootT:'Shoot two more rooms',
      shootR:'Three slots. One of yours beats three MLS shots.',
      placeR:'Three slots \u2014 yours are the ones buyers believe.',
      asks:['Bigger hero photo','Olive fact strip','Shorter caption']
    },
    'Editorial': {
      shape:'a slower read for a higher price point',
      pick:/living|primary|dining|entry|balcony/i,
      photoT:n => 'Give the top half to ' + n.toLowerCase(),
      photoR:'The photo owns the top half. Flat midday light kills it.',
      col:'#C89B3C', colT:'Brass on the eyebrow rule',
      colR:'Only the eyebrow takes accent. Brass reads as the price point.',
      fontR:'The serif eyebrow is what makes this layout editorial.',
      capRe:/warmer/i,
      capR:'A warmer opening line matches the pace this layout sets.',
      shots:1, tags:1,
      shootT:'Shoot one interior in evening light',
      shootR:'A photography layout \u2014 one good interior of yours carries it.',
      placeR:'One frame does all the work here.',
      asks:['Warmer opening line','Quieter accent','Serif headline']
    },
    'Collage': {
      shape:'four tiles show more of the house',
      pick:/kitchen|yard|primary|dining|office/i,
      photoT:n => 'Break up the tiles with ' + n.toLowerCase(),
      photoR:'Two exteriors side by side read as one photo.',
      col:'#5A5FF2', colT:'Hold the tiles together in indigo',
      colR:'Four photos carry the colour. The accent should repeat.',
      fontR:'Tile captions run small. This face survives the size.',
      capRe:/open-house|open house/i,
      capR:'The tiles show the house. The caption gives the date.',
      shots:4, tags:2,
      shootT:'Shoot four rooms, not one',
      shootR:'Collage wants four rooms, not one.',
      placeR:'Four tiles \u2014 fill them with your own frames.',
      asks:['Vary the tiles','Add the open-house line','Tighter grid gaps']
    },
    'Minimal': {
      shape:'the caption does the work',
      pick:/front|living|primary/i,
      photoT:n => 'Make the one frame ' + n.toLowerCase(),
      photoR:'No second photo to recover with. This frame is the post.',
      col:'#0E1633', colT:'Near-black instead of indigo',
      colR:'A type exercise \u2014 a strong accent becomes the loudest thing.',
      fontR:'One face at one size \u2014 here the face is the design.',
      capRe:/price first/i,
      capR:'Almost nothing is printed. The caption has to lead.',
      shots:1, tags:3,
      shootT:'Shoot the one hero frame',
      shootR:'One photo of yours is the difference from empty.',
      placeR:'One slot, and it is the whole post.',
      asks:['Lead with the price','Near-black accent','Bigger address']
    }
  };
  /* every other template name in the packet maps onto one of the five shapes */
  const MELALIAS = {
    'Bold':'Wave', 'Photo split':'Collage', 'Rooms cut':'Collage', 'Address hero':'Minimal',
    'B-roll only':'Editorial', 'POV walk':'Editorial', 'Number reveal':'Wave', 'Q&A':'Minimal',
    'Price-first':'Wave', 'Hook-first':'Minimal', 'Split hero':'Collage', 'Price-led':'Wave',
    'Dark detail':'Editorial', 'Just-listed':'Wave', 'Open-house nudge':'Feature sheet',
    'Price improvement':'Wave'
  };
  let MELUPS = {};

  /* the panel's chat box — routes an ask to a real upgrade, or keeps it as a note */
  function melSay(text){
    const key = S.active; if(!key) return;
    const t = String(text || '').trim(); if(!t) return;
    const low = t.toLowerCase();
    S.melChat = S.melChat || {};
    const log = S.melChat[key] = S.melChat[key] || [];
    const RULES = [
      [/hashtag|\btags?\b/, 'tags'],
      [/caption|copy|shorter|tighter|rewrite|punchier|wording|words/, 'cap'],
      [/font|typeface|serif|\btype\b/, 'font'],
      [/colou?r|accent|warmer|cooler|darker|quieter|indigo|midnight|olive|brass/, 'accent'],
      [/photo|image|picture|\bshot\b|dusk|twilight|kitchen|exterior|front/, 'photo'],
      [/logo|brand/, 'brand'],
      [/upload|my own/, 'up']
    ];
    let hit = null;
    for(let i = 0; i < RULES.length && !hit; i++){
      if(!RULES[i][0].test(low)) continue;
      const id = RULES[i][1];
      hit = id === 'up' ? (MELUPS.upN || MELUPS.up0) : (MELUPS[id] || (id === 'brand' ? MELUPS.brandapply : null));
    }
    let row = 'mel', reply;
    if(hit && hit.apply){
      try { hit.apply(); } catch(err){ console.warn('[melSay apply] ' + (err && err.message || err)); }
      S.melDone = S.melDone || {}; S.melDone[key + ':' + hit.id] = 1;
      reply = 'Done \u2014 ' + hit.t.charAt(0).toLowerCase() + hit.t.slice(1) + '. Same layout, nothing else moved.';
    } else if(hit){
      try { if(hit.act) hit.act(); } catch(err){ console.warn('[melSay act] ' + (err && err.message || err)); }
      row = hit.go || 'mel';
      reply = hit.t + ' \u2014 opening that for you.';
    } else {
      S.notes = S.notes || {};
      S.notes[key] = (S.notes[key] ? S.notes[key] + '\n' : '') + t;
      reply = 'Noted \u2014 I am holding that for the next regenerate of this post.';
    }
    log.push({ q:t, a:reply });
    S.row = row;
    renderSide();
  }

  function renderSide(){
    const key = S.active; if(!key){ esbody.innerHTML = ''; return; }
    const meta = PKG.find(p => p.key === key); if(!meta) return;
    if(esh) esh.textContent = meta.nm;
    if(eshSub) eshSub.textContent = meta.cat + ' · for ' + (S.prop ? S.prop.a : 'this listing');
    const isPost = ['igpost','igstory','reels','tiktok','x'].indexOf(key) >= 0;
    const K2NM = { bold:'Wave', photo:'Feature sheet', editorial:'Editorial', split:'Collage', minimal:'Minimal' };
    const activeTpl = (S.tpls && S.tpls[key]) || (TPLS[key] || [])[0];
    const activeCol = S.color || '#5A5FF2';
    const shots = (S.shots && S.shots[key]) || [];
    const PH = (window.MELSTUDIO && window.MELSTUDIO.PHOTOS) || [];
    const FT = (window.MELSTUDIO && window.MELSTUDIO.FONTS) || {};
    const curImg = (S.imgs && S.imgs[key]) || 0;
    const curFont = (S.fonts && S.fonts[key]) || 'inter';
    const copyLab = key === 'email' ? 'Subject and body' : key === 'flyer' ? 'Print copy' : key === 'website' ? 'Hero copy' : 'Caption';
    /* image / color tab */
    const imgsHtml = '<div class="msvimgs">' + PH.map((ph, i) =>
        '<button class="msvimg' + (!shots.length && (curImg % PH.length) === i ? ' on' : '') + '" type="button" data-pkimg="' + i + '" style="--ph:' + ph.c + '"><span' + (ph.img ? ' style="background-image:url(\'' + ph.img + '\');background-size:cover;background-position:50% 50%"' : '') + '></span><i>' + esc(ph.n) + '</i></button>').join('') +
      '<button class="msvimg up' + (shots.length ? ' on' : '') + '" type="button" data-pkupload><span>' + sv('<path d="M12 16V4m0 0L8 8m4-4 4 4"/><path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/>') + '</span><i>Upload</i></button></div>';
    const palPh = (PH[curImg % (PH.length || 1)] || {});
    const swHtml = '<div class="pals">' + PALS.map(p =>
        '<button type="button" class="pal' + (p.c === activeCol ? ' on' : '') + '" data-col="' + p.c + '" title="' + esc(p.n) + '">' +
          '<span class="pr">' + p.r.map(c => '<i style="background:' + c + '"></i>').join('') + '</span>' +
          '<span class="pn">' + esc(p.n) + '</span>' +
        '</button>').join('') + '</div>' +
      '<span class="msvfine">Applied across every asset in the package.</span>';
    /* template */
    let tplHtml;
    if(window.MELSTUDIO && window.MELSTUDIO.tplThumb){
      tplHtml = '<div class="msvtpls">' + Object.keys(K2NM).map(k => {
        const nm = K2NM[k];
        let th = ''; try { th = window.MELSTUDIO.tplThumb(k, .24, { prop:S.prop, color:activeCol, img:curImg, font:curFont }); } catch(_){}
        return '<button class="msvtpl' + (nm === activeTpl ? ' on' : '') + '" type="button" data-tpl="' + esc(nm) + '">' + th + '<i>' + esc(nm) + '</i></button>';
      }).join('') + '</div>';
    } else {
      tplHtml = '<div class="msactl">' + (TPLS[key] || []).map(t =>
        '<button class="msachip' + (t === activeTpl ? ' on' : '') + '" type="button" data-tpl="' + esc(t) + '">' + esc(t) + '</button>').join('') + '</div>';
    }
    /* per-section Mel suggestions for the copy */
    const chips = actsFor(key).map((s, i) =>
      '<button class="msachip melsugchip" type="button" data-act="' + i + '" title="' + esc(fillPlaceholders(s.b)) + '">' +
        '<svg class="msp" viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M12 2c.6 5 4 8.4 9 9-5 .6-8.4 4-9 9-.6-5-4-8.4-9-9 5-.6 8.4-4 9-9z" fill="currentColor"></path></svg>' +
        '<span class="mlab">' + esc(s.t) + '</span></button>').join('');
    const PHcur = PH[curImg % (PH.length || 1)] || {};
    const photoVal = shots.length ? (shots.length + ' of your photos') : (PHcur.n || 'Front elevation');
    const capTxt = assetCaption(key) || '';
    const noteTxt = (S.notes && S.notes[key]) || '';
    const nbh = (S.prop && S.prop.n) || 'Noe Valley';
    const tagSlug = s => '#' + String(s).toLowerCase().replace(/[^a-z0-9]+/g, '');
    S.tags = S.tags || {};
    S.brand = S.brand || { phase:'empty', on:true, src:'maya.radius.com', logo:null, guide:'', voice:'', color:'#5A5FF2', font:null, rules:null };
    const B = S.brand;
    if(!B.rules) B.rules = [
      { t:'Headlines in Hubot Sans, sentence case', on:true },
      { t:'Accent stays indigo #5A5FF2 \u2014 never a colour matched off the photo', on:true },
      { t:'Price never sits in the first line of a caption', on:true },
      { t:'No emoji, ever', on:true },
      { t:'Logo bottom-left with 24px of clear space', on:true },
      { t:'Close every listing post with \u201cdm to see it\u201d', on:false }
    ];
    if(!S.tags[key]) S.tags[key] = ['#justlisted', tagSlug(nbh), '#sfrealestate', '#openhouse'];
    const tagsArr = S.tags[key];
    const TAGPOOL = ['#newlisting', tagSlug(nbh + ' homes'), '#bayarearealestate', '#homesforsale', '#listingagent', '#comingsoon', '#openhousesf', '#dreamhome'];
    if(S.row === 'mel' || !S.row) S.row = 'photo';   /* Mel row hidden per biju */
    const sec = S.row;
    document.querySelectorAll('.pkedit .mrail .mri').forEach(b => b.classList.toggle('on', b.dataset.pkrow === sec));
    /* ---------------- Mel row: the proactive upgrade feed ---------------- */
    const melTpl = activeTpl || 'Wave';
    const MX = MELTPL[melTpl] || MELTPL[MELALIAS[melTpl]] || MELTPL.Wave;
    function melBuild(){
      const out = [], lib = (S.lib || []);
      const dk = id => key + ':' + id;
      const snap = (S.melSnap = S.melSnap || {});
      /* photo — a stronger frame for this layout, from the MLS set */
      const curIx = PH.length ? (curImg % PH.length) : -1;
      const cands = PH.map((p, i) => ({ p, i })).filter(x => x.i !== curIx);
      const better = cands.filter(x => MX.pick.test(x.p.n))[0] || cands[0];
      if(better) out.push({
        id:'photo', facet:'Photo', hue:'#2563EB', w:3, go:'photo',
        th:'<span class="mfth"' + (better.p.img ? ' style="background-image:url(\'' + better.p.img + '\')"' : ' style="background:' + (better.p.c || '#ddd') + '"') + '></span>',
        t:MX.photoT(better.p.n), r:MX.photoR,
        apply(){
          snap[dk('photo')] = { img:(S.imgs || {})[key], shots:((S.shots || {})[key] || null) };
          S.imgs = S.imgs || {}; S.imgs[key] = better.i;
          if(S.shots) delete S.shots[key];
          fillAssetPreview(key);
        },
        undo(){
          const s = snap[dk('photo')] || {};
          S.imgs = S.imgs || {};
          if(s.img == null) delete S.imgs[key]; else S.imgs[key] = s.img;
          if(s.shots && s.shots.length){ S.shots = S.shots || {}; S.shots[key] = s.shots; }
          fillAssetPreview(key);
          if(s.shots && s.shots.length) applyShots(key);
        }
      });
      /* uploads — the agent's own photos beat the MLS set */
      if(!lib.length) out.push({
        id:'up0', facet:'Uploads', hue:'#0891B2', w:2, go:'uploads', ico:MELICO.up, cta:'Upload files',
        t:MX.shootT, r:MX.shootR,
        act(){ S.upwant = MX.shootT; const fi = $('pke-imgin'); if(fi){ fi.value = ''; fi.click(); } }
      });
      else if(shots.length < MX.shots){
        const n = Math.min(MX.shots, lib.length);
        out.push({
          id:'upN', facet:'Uploads', hue:'#0891B2', w:3, go:'uploads', ico:MELICO.up,
          t:'Place ' + n + ' of your own photo' + (n === 1 ? '' : 's'), r:MX.placeR,
          apply(){
            snap[dk('upN')] = ((S.shots || {})[key] || null);
            S.shots = S.shots || {}; S.shots[key] = lib.slice(0, n).map(f => f.u);
            fillAssetPreview(key); applyShots(key);
          },
          undo(){
            const s = snap[dk('upN')];
            S.shots = S.shots || {};
            if(s && s.length){ S.shots[key] = s; fillAssetPreview(key); applyShots(key); }
            else { delete S.shots[key]; fillAssetPreview(key); }
          }
        });
      }
      /* accent — the palette this shape holds best */
      if(activeCol !== MX.col){
        const pal = PALS.find(p => p.c === MX.col) || PALS[0];
        out.push({
          id:'accent', facet:'Accent', hue:'#EA580C', w:2, go:'color',
          th:'<span class="mfth sw">' + pal.r.slice(0, 3).map(c => '<i style="background:' + c + '"></i>').join('') + '</span>',
          t:MX.colT, r:MX.colR,
          apply(){ snap[dk('accent')] = S.color; S.color = MX.col; fillAssetPreview(key); },
          undo(){ S.color = snap[dk('accent')] || '#5A5FF2'; fillAssetPreview(key); }
        });
      }
      /* font — brand face first, then the next best for this layout */
      const fk = Object.keys(FT);
      const fpick = fk.filter(k => FT[k].brand && k !== curFont)[0] || fk.filter(k => k !== curFont)[0];
      if(fpick) out.push({
        id:'font', facet:'Font', hue:'#7C3AED', w:1, go:'font',
        th:'<span class="mfth ty" style="font-family:' + FT[fpick].s + '">Aa</span>',
        t:'Set the type in ' + FT[fpick].n, r:MX.fontR,
        apply(){ snap[dk('font')] = (S.fonts || {})[key]; S.fonts = S.fonts || {}; S.fonts[key] = fpick; fillAssetPreview(key); },
        undo(){ const v = snap[dk('font')]; S.fonts = S.fonts || {}; if(v == null) delete S.fonts[key]; else S.fonts[key] = v; fillAssetPreview(key); }
      });
      /* caption — the rewrite this layout wants */
      const acts = actsFor(key);
      let ai = acts.findIndex(a => MX.capRe.test(a.t)); if(ai < 0) ai = 0;
      const act = acts[ai];
      if(act) out.push({
        id:'cap', facet:'Caption', hue:'#DB2777', w:3, go:'copy', ico:MELICO.cap,
        t:act.t, r:MX.capR,
        apply(){
          const c0 = assetCaption(key) || '';
          snap[dk('cap')] = c0;
          let next = c0;
          try { next = fillPlaceholders(act.f(c0)); }
          catch(err){ console.warn('[melup caption] ' + (err && err.message || err)); }
          S.captions[key] = next;
          const hid = document.querySelector('.pkast[data-pk="' + key + '"] .cap');
          if(hid) hid.textContent = next;
        },
        undo(){
          const v = snap[dk('cap')];
          if(v == null) return;
          S.captions[key] = v;
          const hid = document.querySelector('.pkast[data-pk="' + key + '"] .cap');
          if(hid) hid.textContent = v;
        }
      });
      /* tags — local searches this post is missing */
      const usedT = tagsArr.map(x => x.toLowerCase());
      const addT = TAGPOOL.filter(x => usedT.indexOf(x.toLowerCase()) < 0).slice(0, MX.tags);
      if(addT.length) out.push({
        id:'tags', facet:'Tags', hue:'#B45309', w:1, go:'tags', ico:MELICO.tag,
        t:'Add ' + addT.length + ' local tag' + (addT.length === 1 ? '' : 's'),
        r:addT.join(' ') + ' \u2014 what a ' + nbh + ' search actually hits.',
        apply(){ snap[dk('tags')] = addT.slice(); addT.forEach(x => { if(tagsArr.indexOf(x) < 0) tagsArr.push(x); }); },
        undo(){ (snap[dk('tags')] || []).forEach(x => { const i = tagsArr.indexOf(x); if(i >= 0) tagsArr.splice(i, 1); }); }
      });
      /* brand — teach it once, then hold the post to it */
      if(B.phase !== 'saved') out.push({
        id:'brand', facet:'Brand', hue:'#5A5FF2', w:2, go:'brand', ico:MELICO.brand, nav:true, cta:'Teach Mel',
        t:'Teach me your brand once',
        r:'I am guessing your colours and type. One link and I stop.'
      });
      else out.push({
        id:'brandapply', facet:'Brand', hue:'#5A5FF2', w:1, go:'brand', ico:MELICO.brand,
        t:'Re-check this post against your kit',
        r:B.rules.filter(r => r.on).length + ' brand rules on. I reapply colours and type only.',
        apply(){
          snap[dk('brandapply')] = { c:S.color, f:(S.fonts || {})[key] };
          S.color = B.color;
          if(B.font){ S.fonts = S.fonts || {}; S.fonts[key] = B.font; }
          fillAssetPreview(key);
        },
        undo(){
          const s = snap[dk('brandapply')] || {};
          if(s.c) S.color = s.c;
          S.fonts = S.fonts || {};
          if(s.f == null) delete S.fonts[key]; else S.fonts[key] = s.f;
          fillAssetPreview(key);
        }
      });
      return out;
    }
    const melAll = melBuild();
    MELUPS = {};
    melAll.forEach(u => { MELUPS[u.id] = u; });
    const melDone = (S.melDone = S.melDone || {}), melSkip = (S.melSkip = S.melSkip || {});
    const melVis = melAll.filter(u => !melSkip[key + ':' + u.id]);
    const melTodo = melVis.filter(u => !melDone[key + ':' + u.id]).sort((a, b) => b.w - a.w);
    const melHad = melVis.filter(u => melDone[key + ':' + u.id]);
    const melPill = document.querySelector('.pkedit .mrail .mri.mel .n');
    if(melPill){ melPill.textContent = melTodo.length ? String(melTodo.length) : ''; melPill.hidden = !melTodo.length; }
    if(sec === 'mel'){
      const RING = '<svg class="mfring" viewBox="0 0 24 24" aria-hidden="true"><defs><linearGradient id="mfring-g" x1="5" y1="2.5" x2="19" y2="21.5" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#7B7FF5"></stop><stop offset=".42" stop-color="#5A5FF2"></stop><stop offset=".78" stop-color="#F08068"></stop><stop offset="1" stop-color="#F0A468"></stop></linearGradient></defs><circle cx="12" cy="12" r="9.2" fill="none" stroke="url(#mfring-g)" stroke-width="2.3"></circle></svg>';
      /* v2 helpers */
      const shortP = p => p >= 1e6 ? '$' + (p/1e6).toFixed(p >= 1e7 ? 0 : 1).replace(/\.0$/,'') + 'M' : '$' + Math.round(p/1e3) + 'K';
      const priceBand = (S.prop && S.prop.price) ? shortP(S.prop.price) : '';
      const FICON = { Photo:MELICO.photo, Caption:MELICO.cap, Uploads:MELICO.up, Accent:MELICO.accent, Font:MELICO.font, Brand:MELICO.brand, Tags:MELICO.tag };
      const AIGD = '<svg width="14" height="14" viewBox="0 0 24 24" fill="url(#melAiGrad)" aria-hidden="true"><path d="M12 2 L15 9 L22 12 L15 15 L12 22 L9 15 L2 12 L9 9 Z"></path></svg>';
      const ARROW = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>';
      const chipPat = {
        Photo:   /price band|hero slot|top half|tiles|one frame/i,
        Caption: /price|open house|opening line|facts/i,
        Uploads: /dusk windows|three slots|one interior|four rooms|hero frame|dusk/i,
        Accent:  /Midnight|Olive|Brass|indigo|near-black/i,
        Font:    /price numerals|serif eyebrow|tile captions|one face/i,
        Brand:   /One link|brand rules/i,
        Tags:    /#[a-z0-9]+/i
      };
      const chipify = (r, facet, hue) => {
        const p = chipPat[facet]; if(!p) return esc(r);
        const m = r.match(p); if(!m) return esc(r);
        return esc(r.slice(0, m.index)) + '<span class="chip" style="--c:' + hue + '">' + esc(m[0]) + '</span>' + esc(r.slice(m.index + m[0].length));
      };
      const buildThumb = u => {
        const raw = u.th || '';
        if(raw.indexOf('mfth ty') >= 0){
          const ff = (raw.match(/font-family:([^"'>;]+)/) || [])[1] || '';
          return '<span class="mfth ty"' + (ff ? ' style="font-family:' + ff + '"' : '') + '>Aa</span>';
        }
        if(u.id === 'photo'){
          const bg = (raw.match(/style="([^"]*)"/) || [])[1] || '';
          return '<span class="mfth photo" style="' + bg + '">' +
            (priceBand ? '<span class="band"><span>' + priceBand + '</span></span>' : '') + '</span>';
        }
        if(u.id === 'accent'){
          const colors = Array.from(raw.matchAll(/background:([^"'>;]+)/g)).map(m => m[1]);
          const bg = colors.length >= 2
            ? 'linear-gradient(160deg,' + colors[0] + ' 0%,' + colors[colors.length-1] + ' 100%)'
            : (colors[0] || u.hue);
          return '<span class="mfth photo" style="background:' + bg + '">' +
            (priceBand ? '<span class="band"><span>' + priceBand + '</span></span>' : '') + '</span>';
        }
        return '<span class="mfth tile">' + sv(u.ico || FICON[u.facet] || MELICO.spark) + '</span>';
      };
      const evidFor = u => {
        switch(u.facet){
          case 'Photo':   return '<b>+32% saves</b> on wide-exterior fronts across your last 14 posts';
          case 'Caption': return '<b>+21% read-through</b> on 3-line captions vs your 6-line average';
          case 'Uploads': return '<b>+41% saves</b> on twilight exteriors in ' + esc(nbh) + ' feeds';
          case 'Accent':  return '<b>+18% price recall</b> on the new band vs your indigo';
          case 'Font':    return '<b>Legible at 320px</b> \u2014 this face holds weight at feed scale';
          case 'Brand':   return '<b>2.4\u00d7 fewer edits</b> on posts after brand lock';
          case 'Tags':    return '<b>3.1k monthly searches</b> on the tag Mel adds, near-zero listing posts';
          default: return '';
        }
      };
      const hintFor = u => {
        if(u.facet === 'Uploads') return 'Mel swaps it in on upload';
        if(u.facet === 'Brand' && u.nav) return 'One-time setup';
        return 'Updates preview instantly';
      };
      const mcard = (u, i, dn) => {
        if(dn){
          return '<div class="melup done" style="--i:' + i + ';--fh:' + u.hue + '">' +
            '<span class="mfok">' + CHK + '</span>' +
            '<span class="mftl">' + esc(u.t) + '</span>' +
            (u.undo ? '<button type="button" class="mfundo" data-melundo="' + u.id + '">Undo</button>' : '') +
            '</div>';
        }
        const match = Math.max(60, 92 - i * 4);
        const evid = evidFor(u);
        const hint = hintFor(u);
        const catIco = u.ico || FICON[u.facet] || MELICO.spark;
        return '<div class="melup" style="--i:' + i + ';--fh:' + u.hue + '">' +
          '<div class="mfhead">' +
            '<button type="button" class="mfcat" data-melgo="' + u.go + '">' + sv(catIco) + esc(String(u.facet).toUpperCase()) + '</button>' +
            '<span class="mfmatch">' + match + '% match</span>' +
          '</div>' +
          '<div class="mfbody">' +
            buildThumb(u) +
            '<div class="mftx">' +
              '<h3 class="mftl">' + esc(u.t) + '</h3>' +
              '<p class="mfwhy">' + chipify(u.r, u.facet, u.hue) + '</p>' +
            '</div>' +
          '</div>' +
          (evid ? '<div class="mfevid">' + AIGD + '<span>' + evid + '</span></div>' : '') +
          '<div class="mfrow">' +
            (u.nav
              ? '<button type="button" class="mfap" data-melgo="' + u.go + '">' + esc(u.cta || 'Open') + ARROW + '</button>'
              : '<button type="button" class="mfap" data-melup="' + u.id + '">' + esc(u.cta || 'Apply') + ARROW + '</button>') +
            '<button type="button" class="mfsk" data-melskip="' + u.id + '">Skip</button>' +
            '<span class="mfhint">' + esc(hint) + '</span>' +
          '</div>' +
          '</div>';
      };
      const log = ((S.melChat = S.melChat || {})[key] || []);
      const addr = (S.prop && S.prop.a) || 'this listing';
      const n = melTodo.length;
      const what = '<b>' + esc(melTpl) + '</b> ' + esc(String(meta.nm).toLowerCase());
      const lead = n
        ? 'Your ' + what + ' for ' + esc(addr) + '. ' + n + ' upgrade' + (n === 1 ? '' : 's') + ', none of them change the layout.'
        : 'Your ' + what + ' is where I would want it. Ask me for anything else \u2014 same layout.';
      const feed =
        '<div class="melfeed' + ((S.melSeen || {})[key] ? '' : ' first') + '">' +
          '<svg class="mfdefs" width="0" height="0" aria-hidden="true"><defs><linearGradient id="melAiGrad" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#5A5FF2"></stop><stop offset=".55" stop-color="#8b5cf6"></stop><stop offset="1" stop-color="#ea580c"></stop></linearGradient></defs></svg>' +
          '<div class="mfhd">' +
            '<span class="mfwho">Mel</span>' +
            '<span class="mftpl">' + sv(MELICO.lock) + esc(melTpl) + ' locked</span>' +
          '</div>' +
          '<p class="mflead">' + lead + '</p>' +
          (log.length
            ? '<div class="mfthread">' + log.slice(-3).map(m =>
                '<span class="mfq">' + esc(m.q) + '</span>' +
                '<span class="mfa">' + RING + '<span>' + esc(m.a) + '</span></span>').join('') + '</div>'
            : '') +
          /* Design suggestion cards hidden per biju — keep the intro line, the thread and the Or just ask chips. */
          '<span class="seclab">Or just ask</span>' +
          '<div class="aichips">' + MX.asks.map(a =>
            '<button class="msachip melsugchip" type="button" data-melask="' + esc(a) + '">' +
              '<svg class="msp" viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M12 2c.6 5 4 8.4 9 9-5 .6-8.4 4-9 9-.6-5-4-8.4-9-9 5-.6 8.4-4 9-9z" fill="currentColor"></path></svg>' +
              '<span class="mlab">' + esc(a) + '</span></button>').join('') + '</div>' +
        '</div>';
      try { esbody.style.setProperty('--ri', '#5A5FF2'); }
      catch(err){ console.warn('[melfeed hue] ' + (err && err.message || err)); }
      esbody.innerHTML = feed;
      S.melSeen = S.melSeen || {}; S.melSeen[key] = 1;
      return;
    }
    /* contextual, clickable Mel picks per section */
    const PHREASON = {
      'Front elevation':'Reads the price cleanest',
      'Living room':'Warmer light, better at night',
      'Kitchen':'Renovation is the selling point',
      'Back yard':'Sells the outdoor space',
      'Primary suite':'Best for a saves-driven post',
      'Primary bath':'Finishes photograph well',
      'Dining area':'Good for a lifestyle caption',
      'Balcony':'City-view angle',
      'Entry hall':'Shows the light',
      'Second bedroom':'Useful on a family post',
      'Home office':'Speaks to remote buyers',
      'Street view':'Sets the neighbourhood'
    };
    const curName = PHcur.n || 'Front elevation';
    let melLine = '', picks = '';
    if(sec === 'photo'){
      const PHOTOREC = {
        'Living room':    { chip:'Warmer light',  chipC:'#d97706', body:' reads better at night, when your feed peaks.',   ev:'<b>+24% saves</b> on warm interiors posted after 6pm' },
        'Kitchen':        { chip:'Renovation',    chipC:'#0d9488', body:' is the selling point for this listing.',          ev:'<b>2.1\u00d7 comments</b> on renovated-kitchen leads in your area' },
        'Back yard':      { chip:'Outdoor space', chipC:'#8b5cf6', body:' \u2014 rare for this block.',                     ev:'<b>+17% saves</b> when outdoor space leads the post' },
        'Primary suite':  { chip:'Natural light', chipC:'#0d9488', body:' gives the post an aspirational read.',             ev:'<b>+12% saves</b> on light-forward interiors' },
        'Primary bath':   { chip:'Fixtures',      chipC:'#d97706', body:' signal quality without saying price.',             ev:'<b>+9% saves</b> on posts led by bathroom detail' },
        'Dining area':    { chip:'Layout',        chipC:'#8b5cf6', body:' shows how the plan flows.',                       ev:'<b>+7% saves</b> on open-plan leads' },
        'Balcony':        { chip:'City view',     chipC:'#0d9488', body:' anchors the location fast.',                      ev:'<b>+14% saves</b> on view-led posts' },
        'Entry hall':     { chip:'First read',    chipC:'#d97706', body:' sets the light before the rooms.',                ev:'<b>+6% saves</b> on entry-led posts' },
        'Second bedroom': { chip:'Family angle',  chipC:'#8b5cf6', body:' reads for buyers with kids.',                     ev:'<b>+8% saves</b> on family-led posts' },
        'Home office':    { chip:'Remote buyers', chipC:'#0d9488', body:' speaks to the WFH search intent.',                ev:'<b>+11% saves</b> on office-led posts' },
        'Street view':    { chip:'Neighbourhood', chipC:'#d97706', body:' sells the block, not just the house.',            ev:'<b>+9% saves</b> on street-led posts' },
        'Front elevation':{ chip:'Curb appeal',   chipC:'#5A5FF2', body:' is the safe lead for a just-listed post.',         ev:'<b>+15% saves</b> when the front leads the post' }
      };
      const alts = PH.map((p, i) => ({ p, i })).filter(x => x.p.n !== curName).slice(0, 1);
      melLine = shots.length
        ? 'Your ' + shots.length + ' photos are in. This MLS shot still outperforms them for a just-listed post.'
        : esc(curName) + ' is in and it is my pick. If you want a different read, this is the next best.';
      const cardHtml = alts.map(x => {
        const rec = PHOTOREC[x.p.n] || { chip:'Alternate angle', chipC:'#5A5FF2', body:' \u2014 ' + esc(PHREASON[x.p.n] || 'Alternate angle').toLowerCase() + '.' };
        return '<div class="pv4-card pv4-clk" data-pkimg="' + x.i + '" role="button" tabindex="0">' +
          '<div class="pv4-text"><h3>' + esc(x.p.n) + '</h3>' +
            '<p><span class="pv4-chip" style="--pvc:' + rec.chipC + '">' + esc(rec.chip) + '</span>' + rec.body + '</p>' +
          '</div>' +
        '</div>';
      }).join('');
      picks = '<div class="pv4">' + cardHtml + '</div>';
    } else if(sec === 'color'){
      const cur = PALS.find(p => p.c === activeCol) || PALS[0];
      const alts = PALS.filter(p => p.c !== activeCol).slice(0, 1);
      const CREASON = { 'Radius indigo':'Holds against the blue glass', 'Midnight':'Reads as higher price point', 'Olive':'Warmer, good on garden shots', 'Brass':'Luxury cue, weak on small text',
        'Terracotta':'Warm and editorial on brick', 'Coastal':'Calm, reads well on water views', 'Plum':'Stands out in a crowded feed', 'Graphite':'Neutral \u2014 lets the photo lead' };
      melLine = esc(cur.n) + ' is on the post. It is the safe read for this photo \u2014 this changes the tone.';
      picks = '<div class="pv4">' + alts.map(p =>
        '<div class="pv4-card pv4-clk" data-col="' + p.c + '" role="button" tabindex="0">' +
          '<div class="pv4-text"><h3>' + esc(p.n) + '</h3>' +
            '<p><span class="pv4-chip" style="--pvc:' + (p.c || '#5A5FF2') + '">Palette</span> ' + esc(CREASON[p.n] || 'Alternate palette') + '.</p>' +
          '</div>' +
        '</div>').join('') + '</div>';
    } else if(sec === 'font'){
      const keys = Object.keys(FT).filter(k => k !== curFont).slice(0, 1);
      melLine = esc((FT[curFont] && FT[curFont].n) || 'The current face') + ' is set. It keeps the price legible at feed size.';
      picks = '<div class="pv4">' + keys.map(k =>
        '<div class="pv4-card pv4-clk" data-pkfont="' + k + '" role="button" tabindex="0">' +
          '<div class="pv4-text"><h3>' + esc(FT[k].n) + '</h3>' +
            '<p><span class="pv4-chip" style="--pvc:#0d9488">Type</span> ' + esc(FT[k].d || 'Alternate face') + '.</p>' +
          '</div>' +
        '</div>').join('') + '</div>';
    } else if(sec === 'tpl'){
      const TREASON = { Wave:'Price band lands first', 'Feature sheet':'Best with three photos', Editorial:'Slower read, higher price point', Collage:'Shows more of the house', Minimal:'Caption does the work' };
      const alts = Object.keys(K2NM).filter(k => K2NM[k] !== activeTpl).slice(0, 1);
      melLine = esc(activeTpl || 'Wave') + ' is applied \u2014 the strongest shape for a just-listed square.';
      picks = '<div class="pv4">' + alts.map(k => {
        const n = K2NM[k];
        return '<div class="pv4-card pv4-clk" data-tpl="' + esc(n) + '" role="button" tabindex="0">' +
          '<div class="pv4-text"><h3>' + esc(n) + '</h3>' +
            '<p><span class="pv4-chip" style="--pvc:#8b5cf6">Layout</span> ' + esc(TREASON[n] || 'Alternate layout') + '.</p>' +
          '</div>' +
        '</div>';
      }).join('') + '</div>';
    } else if(sec === 'copy'){
      const acts = actsFor(key).slice(0, 1);
      melLine = capTxt ? 'The caption leads with the neighbourhood and closes on the showing. One-click rewrites:' : 'No caption yet \u2014 pick a direction and I will write it.';
      picks = '<div class="pv4">' + acts.map((a, i) =>
        '<div class="pv4-card pv4-clk" data-act="' + i + '" role="button" tabindex="0">' +
          '<div class="pv4-text"><h3>' + esc(a.t) + '</h3>' +
            '<p><span class="pv4-chip" style="--pvc:#5A5FF2">Caption</span> ' + esc(fillPlaceholders(a.b).slice(0, 110)) + '</p>' +
          '</div>' +
        '</div>').join('') + '</div>';
    } else if(sec === 'tags'){
      const used = tagsArr.map(t => t.toLowerCase());
      const sugg = TAGPOOL.filter(t => used.indexOf(t.toLowerCase()) < 0).slice(0, 1);
      melLine = tagsArr.length
        ? tagsArr.length + ' tags are on the post. This one pulls in a local search you are missing.'
        : 'No tags yet \u2014 this is what a just-listed post in ' + esc(nbh) + ' gets found on.';
      picks = '<div class="aichips">' + sugg.map(t =>
        '<button class="msachip melsugchip" type="button" data-addtag="' + esc(t) + '">' +
          '<svg class="msp" viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M12 2c.6 5 4 8.4 9 9-5 .6-8.4 4-9 9-.6-5-4-8.4-9-9 5-.6 8.4-4 9-9z" fill="currentColor"></path></svg>' +
          '<span class="mlab">' + esc(t) + '</span></button>').join('') + '</div>';
    } else if(sec === 'brand'){
      const mel = (t, r, attr) => '<div class="pv4-card pv4-clk" ' + attr + ' role="button" tabindex="0">' +
        '<div class="pv4-text"><h3>' + esc(t) + '</h3>' +
          '<p><span class="pv4-chip" style="--pvc:#5A5FF2">Setup</span> ' + esc(r) + '.</p>' +
        '</div>' +
      '</div>';
      if(B.phase === 'empty'){
        melLine = 'Give me one thing \u2014 your site, your guidelines, or a post you were happy with \u2014 and I will learn your colours, type and voice from it.';
        picks = '<div class="pv4">' +
          mel('Learn from my website', 'Fastest route \u2014 I read the colours, type and tone off your pages', 'data-blearn="site"') +
          '</div>';
      } else if(B.phase === 'review'){
        melLine = 'Here is what I pulled off ' + esc(B.src) + '. Check it, then save it and I will hold to it on every asset.';
        picks = '';
      } else {
        const filled = [B.logo, B.color, B.font, B.voice, (S.lib || []).length, B.guide].filter(Boolean).length;
        melLine = filled >= 6
          ? 'Your kit is complete. Every asset I make starts from it \u2014 you only override when you want to.'
          : 'Your kit is ' + filled + ' of 6 parts filled. Fill the rest and I stop guessing on the parts that are missing.';
        picks = '<div class="pv4">' +
          mel('Show me this post on brand', 'I reapply the kit and the rules to the asset you are looking at', 'data-bapply') +
          '</div>';
      }
    } else if(sec === 'uploads'){
      const lib = (S.lib || []);
      const inuse = shots.length;
      if(!lib.length){
        melLine = 'Nothing of yours uploaded yet \u2014 I am running the MLS photos. Yours beat them every time. For this post I would shoot:';
        picks = '<div class="pv4">' + [
          ['Twilight front','Lit windows at dusk outperform a daytime front shot']
        ].map(w =>
          '<div class="pv4-card pv4-clk" data-uplup data-want="' + esc(w[0]) + '" role="button" tabindex="0">' +
            '<div class="pv4-text"><h3>' + esc(w[0]) + '</h3>' +
              '<p><span class="pv4-chip" style="--pvc:#0d9488">Shot</span> ' + esc(w[1]) + '.</p>' +
            '</div>' +
          '</div>').join('') + '</div>';
      } else {
        melLine = inuse
          ? inuse + ' of your ' + lib.length + ' files are on this asset. Tap a tile to add one or drop one.'
          : lib.length + ' of your files are in. None are on this asset yet \u2014 tap a tile to place it.';
        picks = '<div class="aichips">' +
          '<button class="msachip melsugchip" type="button" data-upmel="3">' +
            '<svg class="msp" viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M12 2c.6 5 4 8.4 9 9-5 .6-8.4 4-9 9-.6-5-4-8.4-9-9 5-.6 8.4-4 9-9z" fill="currentColor"></path></svg>' +
            '<span class="mlab">Use my best 3</span></button>' +
          '<button class="msachip melsugchip" type="button" data-upmel="1">' +
            '<svg class="msp" viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M12 2c.6 5 4 8.4 9 9-5 .6-8.4 4-9 9-.6-5-4-8.4-9-9 5-.6 8.4-4 9-9z" fill="currentColor"></path></svg>' +
            '<span class="mlab">Just the newest</span></button>' +
          '</div>';
      }
    } else {
      melLine = 'Anything you write here I keep word-for-word every time I regenerate this asset.';
    }
    const melcard =
      '<div class="melsug">' +
        '<span class="who"><img src="assets/mel-icon.svg" alt="">Mel suggests</span>' +
        '<p>' + melLine + '</p>' + picks +
      '</div>';
    let bodyHtml;
    if(sec === 'photo'){
      const selN = shots.length ? shots.length : 1;
      const gridTiles = PH.map((ph, i) => {
        const isSel = !shots.length && (curImg % PH.length) === i;
        const bg = ph.img ? 'background-image:url(\'' + ph.img + '\')' : '';
        return '<button class="pv4-tile' + (isSel ? ' sel' : '') + '" type="button" data-pkimg="' + i + '" style="--pvc:' + (ph.c || '#ddd') + '">' +
          '<span class="pv4-ph" style="' + bg + '">' +
            (isSel ? '<span class="pv4-check"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg></span><span class="pv4-pick">Mel\u2019s pick</span>' : '') +
          '</span>' +
          '<span class="pv4-cap">' + esc(ph.n) + '</span>' +
        '</button>';
      }).join('') +
        '<button class="pv4-up" type="button" data-pkupload>' +
          '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12"/><path d="m17 8-5-5-5 5"/><path d="M21 21H3"/></svg>' +
          'Upload' +
        '</button>';
      bodyHtml = '<div class="pv4-tier"><span class="pv4-tlab">PHOTO \u00b7 ' + esc(photoVal.toUpperCase()) + '</span><span class="pv4-tct">' + selN + ' of ' + PH.length + ' selected</span></div>' +
        '<div class="pv4-grid">' + gridTiles + '</div>';
    } else if(sec === 'color'){
      bodyHtml = '<span class="seclab">Accent</span>' + swHtml;
    } else if(sec === 'font'){
      const spec = S.prop ? ('Just listed in ' + (S.prop.n || 'Noe Valley')) : 'Just listed in Noe Valley';
      const frow = (k, badge) =>
        '<button class="frow' + (badge ? ' bf' : '') + (curFont === k ? ' on' : '') + '" type="button" data-pkfont="' + k + '" data-fname="' + esc(FT[k].n.toLowerCase()) + '">' +
          '<span class="fh"><b>' + esc(FT[k].n) + '</b><i>' + esc(FT[k].d || '') + '</i>' +
            (badge ? '<span class="fbadge">Brand</span>' : '') + '</span>' +
          '<span class="fspec" style="font-family:' + FT[k].s + '">' + esc(spec) + '</span>' +
        '</button>';
      const bfKeys = Object.keys(FT).filter(k => FT[k].brand);
      const plus = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>';
      bodyHtml = '<span class="seclab">Font</span>' +
        '<label class="fsearch"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>' +
        '<input type="text" id="pke-fontq" placeholder="Search fonts" autocomplete="off"></label>' +
        '<div class="flist" id="pke-flist">' +
          bfKeys.map(k => frow(k, true)).join('') +
          Object.keys(FT).filter(k => !FT[k].brand).map(k => frow(k, false)).join('') + '</div>' +
        '<span class="msvfine">Type a name to search the Google Fonts library.</span>' +
        '<button class="bfadd" type="button" data-bfontadd>' + plus +
          (bfKeys.length ? 'Add another brand font' : 'Add your brand fonts') + '</button>';
    } else if(sec === 'tpl'){
      let cells = Object.keys(K2NM).map(k => {
        const nm = K2NM[k];
        let th = '';
        try { th = window.MELSTUDIO.tplThumb(k, .34, { prop:S.prop, color:activeCol, img:curImg, font:curFont }); }
        catch(err){ console.warn('[tplThumb] ' + k + ': ' + (err && err.message || err)); }
        return '<button class="msvtpl' + (nm === activeTpl ? ' on' : '') + '" type="button" data-tpl="' + esc(nm) + '">' +
          '<span class="lth">' + th + '</span><i>' + esc(nm) + '</i></button>';
      }).join('');
      if(isPost){
        const base = {}; Object.keys(K2NM).forEach(k => base[K2NM[k]] = 1);
        const seen = {};
        Array.from(document.querySelectorAll('#msnf-tplgrid .msafcard--tpl'))
          .filter(c => (c.dataset.nfformats || '').split(/\s+/).indexOf('post') >= 0)
          .forEach(c => {
            const id = c.dataset.nftpl || '';
            const nm = ((c.querySelector('.msafcard-addr') || {}).textContent || id).trim();
            const prev = c.querySelector('.msafcard-photo--tpl .prev');
            if(!id || !prev || base[nm] || seen[nm]) return;
            seen[nm] = 1;
            const on = (S.libtpl && S.libtpl[key]) === id;
            cells += '<button class="msvtpl lib' + (on ? ' on' : '') + '" type="button" data-libtpl="' + esc(id) + '" data-libcat="' + esc(c.dataset.nfcat || '') + '">' +
              '<span class="lth">' + prev.outerHTML + '</span><i>' + esc(nm) + '</i></button>';
          });
      }
      bodyHtml = '<span class="seclab">Template</span><div class="msvtpls">' + cells + '</div>';
    } else if(sec === 'brand'){
      if(B.phase === 'empty'){
        bodyHtml = '<span class="seclab">Teach Mel your brand</span>' +
          '<label class="fsearch"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 2.5 15.4 0 18M12 3c-2.5 2.6-2.5 15.4 0 18"/></svg>' +
          '<input type="text" id="pke-burl" value="' + esc(B.src) + '" placeholder="yoursite.com" autocomplete="off"></label>' +
          '<div class="bkfoot"><button class="upbtn" type="button" style="flex:1" data-blearn="site">Learn my brand</button>' +
          '<button class="bkghost" type="button" data-bguide>Upload PDF</button></div>' +
          '<span class="msvfine">Nothing is saved until you review what I found. A website, a brand PDF or one past post all work.</span>';
      } else if(B.phase === 'review'){
        const rrow = (mark, t, v) => '<div class="bkrow"><button type="button" data-bopen="none">' + mark + '<b>' + esc(t) + '</b><em>' + esc(v) + '</em></button></div>';
        bodyHtml = '<span class="seclab">What Mel found \u00b7 review before saving</span>' +
          '<div class="bkrows">' +
            rrow('<span class="bkm sw"><i style="background:' + B.color + '"></i><i style="background:#0A0A0A"></i><i style="background:#E8E3DA"></i></span>', 'Colours', 'Keep') +
            rrow('<span class="bkm">Aa</span>', 'Headline face', (B.font && FT[B.font] ? FT[B.font].n : 'Hubot Sans')) +
            rrow('<span class="bkm">\u201c\u201d</span>', 'Voice', 'Plain, no hype') +
            rrow('<span class="bkm">IMG</span>', 'Logo', 'Dark + light') +
          '</div>' +
          '<div class="bkcard"><b>Sample caption in your voice</b>' +
            '<p>just listed in ' + esc((nbh || '').toLowerCase()) + '. three beds, a real kitchen, and a yard that gets sun until six.</p>' +
            '<div class="aichips" style="margin-top:0"><button class="msvchip on" type="button" data-bvoiceok>Sounds right</button>' +
            '<button class="msvchip" type="button" data-blearn="post">Not me \u2014 learn again</button></div></div>' +
          '<div class="bkfoot"><button class="upbtn" type="button" style="flex:1" data-bsave>Save as my brand</button>' +
          '<button class="bkghost" type="button" data-bstart>Start over</button></div>';
      } else {
        const btab = S.btab || 'kit';
        const libN = (S.lib || []).length;
        const open = S.bopen || '';
        const EXP = {
          logo: '<div class="bkexp"><button class="bkghost" type="button" data-blogo>' + (B.logo ? 'Replace logo' : 'Upload logo') + '</button>' +
            '<span class="msvfine" style="margin-top:0">PNG with transparency. I place it bottom-left with clear space.</span></div>',
          color: '<div class="bkexp"><div class="bksw">' + PALS.map(p =>
              '<button type="button"' + (p.c === B.color ? ' class="on"' : '') + ' data-bcol="' + p.c + '" style="background:' + p.c + '" title="' + esc(p.n) + '" aria-label="' + esc(p.n) + '"></button>').join('') +
            '</div><span class="msvfine" style="margin-top:0">Your accent on every asset \u00b7 ' + esc(((PALS.find(p => p.c === B.color) || {}).n) || 'Custom') + '</span></div>',
          font: '<div class="bkexp"><div class="aichips" style="margin-top:0">' + Object.keys(FT).map(k =>
              '<button class="msvchip' + (B.font === k ? ' on' : '') + '" type="button" data-bfont="' + k + '">' + esc(FT[k].n) + '</button>').join('') +
            '</div><span class="msvfine" style="margin-top:0">Headline face. Body copy stays Mona Sans.</span></div>',
          voice: '<div class="bkexp"><textarea class="msvtext" rows="4" id="pke-bvoice" placeholder="lowercase headlines, no hype, never lead with the price\u2026">' + esc(B.voice) + '</textarea>' +
            '<span class="msvfine" style="margin-top:0">Three lines is enough \u2014 I copy the rhythm, not the words.</span></div>',
          photos: '<div class="bkexp"><span class="msvfine" style="margin-top:0">' + (libN ? libN + ' files in your library. I prefer these over the MLS set.' : 'Nothing uploaded yet \u2014 I am running MLS photos.') + '</span>' +
            '<button class="bkghost" type="button" data-bgoto="uploads">Open uploads</button></div>',
          guide: '<div class="bkexp"><button class="bkghost" type="button" data-bguide>' + (B.guide ? 'Replace PDF' : 'Upload PDF') + '</button>' +
            '<span class="msvfine" style="margin-top:0">I read the rules out of it and add them to Rules.</span></div>'
        };
        const K = [
          ['logo','Logo', B.logo ? '1 file' : 'Not set', B.logo ? '<span class="bkm" style="background-image:url(\'' + B.logo + '\')"></span>' : '<span class="bkm">IMG</span>'],
          ['color','Colours', '3 set', '<span class="bkm sw"><i style="background:' + B.color + '"></i><i style="background:#0A0A0A"></i><i style="background:#E8E3DA"></i></span>'],
          ['font','Fonts', B.font && FT[B.font] ? FT[B.font].n : 'Not set', '<span class="bkm">Aa</span>'],
          ['voice','Brand voice', B.voice ? 'Set' : 'Not set', '<span class="bkm">\u201c\u201d</span>'],
          ['photos','Photos', libN ? libN + ' files' : 'Not set', '<span class="bkm">' + (libN || 0) + '</span>'],
          ['guide','Guidelines', B.guide || 'Not set', '<span class="bkm">PDF</span>']
        ];
        const onN = B.rules.filter(r => r.on).length;
        const kitHtml = '<div class="bkrows">' + K.map(r =>
          '<div class="bkrow"><button type="button" data-bopen="' + r[0] + '">' + r[3] + '<b>' + esc(r[1]) + '</b>' +
          '<em' + (r[2] === 'Not set' ? ' class="un"' : '') + '>' + esc(r[2]) + '</em></button>' +
          (open === r[0] ? EXP[r[0]] : '') + '</div>').join('') + '</div>';
        const rulesHtml = '<div class="bkrows">' + B.rules.map((r, i) =>
          '<button class="bkrule' + (r.on ? ' on' : ' off') + '" type="button" data-brule="' + i + '">' +
            '<i><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 13 4 4 10-10"/></svg></i>' +
            '<span>' + esc(r.t) + '</span></button>').join('') + '</div>' +
          '<label class="taginp"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>' +
          '<input type="text" id="pke-brule" placeholder="Add a rule I must follow" autocomplete="off"></label>' +
          '<span class="msvfine">' + onN + ' of ' + B.rules.length + ' rules on. I check every asset against them before it is ready.</span>';
        bodyHtml = '<button class="bktog' + (B.on ? ' on' : '') + '" type="button" data-btog><span>Use my brand on every asset</span><i></i></button>' +
          '<div class="bkseg"><button type="button" class="' + (btab === 'kit' ? 'on' : '') + '" data-btab="kit">Kit</button>' +
          '<button type="button" class="' + (btab === 'rules' ? 'on' : '') + '" data-btab="rules">Rules ' + onN + '</button></div>' +
          (btab === 'kit' ? kitHtml : rulesHtml);
      }
    } else if(sec === 'uploads'){
      const lib = (S.lib || []);
      const SRC = [
        ['Google Drive','<path fill="#FBBC04" d="M12 3 2.4 20.2 12 14.5Z"/><path fill="#34A853" d="M12 3l9.6 17.2L12 14.5Z"/><path fill="#4285F4" d="M2.4 20.2h19.2L12 14.5Z"/>'],
        ['Google Photos','<path fill="#EA4335" d="M12 12V4a4 4 0 0 1 0 8Z"/><path fill="#FBBC04" d="M12 12h8a4 4 0 0 1-8 0Z"/><path fill="#34A853" d="M12 12v8a4 4 0 0 1 0-8Z"/><path fill="#4285F4" d="M12 12H4a4 4 0 0 1 8 0Z"/>'],
        ['Dropbox','<path fill="#0061FF" d="M6.6 2.6 1.1 6.3l5.5 3.6 5.4-3.6zm10.8 0L12 6.3l5.4 3.6 5.5-3.6zM1.1 13.6l5.5 3.7 5.4-3.7-5.4-3.7zm16.3-3.7L12 13.6l5.4 3.7 5.5-3.7zM6.6 18.5l5.4 3.6 5.4-3.6-5.4-3.6z"/>'],
        ['Instagram','<defs><linearGradient id="upig" x1="2" y1="22" x2="22" y2="2" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#FEDA75"/><stop offset=".28" stop-color="#FA7E1E"/><stop offset=".55" stop-color="#D62976"/><stop offset=".78" stop-color="#962FBF"/><stop offset="1" stop-color="#4F5BD5"/></linearGradient></defs><rect x="2" y="2" width="20" height="20" rx="6" fill="url(#upig)"/><circle cx="12" cy="12" r="4.5" fill="none" stroke="#fff" stroke-width="1.9"/><circle cx="17.3" cy="6.7" r="1.2" fill="#fff"/>']
      ];
      if(!lib.length){
        bodyHtml = '<span class="seclab">Your uploads</span>' +
          '<div class="updrop">' +
            '<p>Drop photos or a walkthrough video here</p>' +
            '<button class="upbtn" type="button" data-uplup>Upload files</button>' +
          '</div>' +
          '<span class="seclab">Connectors</span>' +
          '<div class="upsrc">' + SRC.map(s =>
            '<button type="button" data-upsrc="' + esc(s[0]) + '"><svg viewBox="0 0 24 24" aria-hidden="true">' + s[1] + '</svg><span>' + esc(s[0]) + '</span></button>').join('') + '</div>' +
          '<span class="msvfine">JPG, PNG, HEIC, MP4 \u00b7 up to 8 at a time. Yours are used before the MLS set.</span>';
      } else {
        bodyHtml = '<span class="seclab">Your uploads \u00b7 ' + lib.length + (lib.length === 1 ? ' file' : ' files') + '</span>' +
          '<label class="fsearch"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>' +
          '<input type="text" id="pke-upq" placeholder="Search your uploads" autocomplete="off"></label>' +
          '<div class="upgrid" id="pke-upgrid">' + lib.map((f, i) => {
            const on = shots.indexOf(f.u) >= 0;
            return '<button class="upth' + (on ? ' on' : '') + '" type="button" data-upuse="' + i + '" data-upn="' + esc((f.n || '').toLowerCase()) + '" title="' + esc(f.n || 'Upload') + '">' +
              '<span style="background-image:url(\'' + f.u + '\')"></span>' +
              '<span class="k"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 13 4 4 10-10"/></svg></span>' +
              '<span class="x" role="button" data-updel="' + i + '" title="Remove from uploads"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></span>' +
              '<i>' + esc(f.n || 'Upload') + '</i></button>';
          }).join('') + '</div>' +
          '<div class="uprow"><button class="upbtn" type="button" data-uplup>Upload files</button>' +
          '<span class="msvfine">Tap a tile to place it. Tap again to drop it.</span></div>';
      }
    } else if(sec === 'copy'){
      bodyHtml = '<span class="seclab">' + esc(copyLab) + '</span>' +
        '<textarea class="msvtext" rows="7" id="pke-cap" data-cap="' + key + '">' + esc(capTxt) + '</textarea>' +
        '<div class="aichips">' + chips + '</div>' +
        '<span class="msvfine">Each chip is a one-click Mel rewrite.</span>';
    } else if(sec === 'tags'){
      bodyHtml = '<span class="seclab">Tags on this post</span>' +
        '<div class="mstags">' + tagsArr.map(t =>
          '<span class="mstag"><span>' + esc(t) + '</span>' +
            '<button type="button" data-rmtag="' + esc(t) + '" title="Remove ' + esc(t) + '" aria-label="Remove ' + esc(t) + '">' +
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button></span>').join('') + '</div>' +
        '<label class="taginp"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>' +
        '<input type="text" id="pke-tagin" placeholder="Add a tag or @handle" autocomplete="off"></label>' +
        '<span class="msvfine">Added to the caption when Mel publishes. Up to 12.</span>';
    } else {
      bodyHtml = '<span class="seclab">Ask Mel</span>' +
        '<textarea class="msvtext" rows="4" id="pke-note" placeholder="Make the price bigger, warmer accent, drop the hashtags\u2026">' + esc(noteTxt) + '</textarea>' +
        '<span class="msvfine">Mel applies this on the next regenerate.</span>';
    }
    try { esbody.style.setProperty('--ri', ({ photo:'#2563EB', brand:'#5A5FF2', uploads:'#0891B2', color:'#EA580C', font:'#7C3AED', tpl:'#15803D', copy:'#DB2777', tags:'#B45309' })[sec] || '#5A5FF2'); }
    catch(err){ console.warn('[renderSide hue] ' + (err && err.message || err)); }
    esbody.innerHTML = melcard + bodyHtml;
  }

  function setActive(key, scrollIntoView){
    S.active = key;
    document.querySelectorAll('.pkast').forEach(el => el.classList.toggle('active', el.dataset.pk === key));
    renderNav(); renderSide(); renderSwitch(); renderGen();
  }

  function openEditor(){
    page.classList.remove('packeton');
    page.classList.add('pkediton');
    edit.classList.add('open','gen');
    S.done.clear(); S.captions = S.captions || {}; S.notes = S.notes || {}; S.tpls = S.tpls || {}; S.color = S.color || '#5A5FF2';
    S.row = 'photo';   /* Mel row hidden per biju — open on Photo */
    const etitle = document.getElementById('pke-title');
    if(etitle && S.prop) etitle.textContent = S.prop.a;
    esub.textContent = '';
    const items = PKG.filter(x => S.checked.has(x.key));
    erail.innerHTML = items.map(x => { try { return renderAsset(x); } catch(_) { return ''; } }).join('');
    S.active = items[0] && items[0].key;
    if(S.active) setActive(S.active, false); else { renderNav(); renderSide(); }
    S.timers.forEach(t => clearTimeout(t)); S.timers = [];
    let i = 0;
    const start = () => {
      const meta = items[i]; if(!meta) return;
      const el = document.getElementById('pkast-' + meta.key);
      if(!el) return;
      el.classList.remove('pending'); el.classList.add('building');
      el.querySelector('.as').textContent = 'Generating';
      /* shimmer trace under the dotted placeholder — feed-post style */
      (function(){
        const tt = el.querySelector('.pktrt');
        const top = document.getElementById('pke-toptr');
        const setTr = s => { if(tt) tt.textContent = s; if(top) top.textContent = s; };
        const steps = ({
          igpost:['Pulling listing photos','Framing the square crop','Drafting the headline and caption'],
          igstory:['Framing the 9:16 story canvas','Laying out the story','Drafting the sticker line'],
          reels:['Picking the cover frame and hook','Laying out the Reel cover'],
          tiktok:['Picking the cover frame and hook','Laying out the TikTok cover'],
          x:['Trimming the copy to fit X','Laying out the 16:9 card'],
          website:['Blocking out the listing page sections','Writing the page copy'],
          email:['Writing the subject line','Drafting the body'],
          flyer:['Laying out the print sheet','Placing the price and QR']
        })[meta.key] || ['Generating the design'];
        let si = 0; setTr(steps[0] + '\u2026');
        const iv = setInterval(() => {
          si++;
          if(si >= steps.length){ clearInterval(iv); return; }
          setTr(steps[si] + '\u2026');
        }, 1500);
        S.timers.push(iv);
      })();
      estatus.innerHTML = 'Mel is generating <b>' + meta.nm.toLowerCase() + '</b>…';
      try { setActive(meta.key, false); } catch(_){}
      const t = setTimeout(() => {
        el.classList.remove('building');
        el.classList.add('done');
        try {
          el.querySelector('.as').textContent = 'Ready';
          el.querySelector('.cap').setAttribute('contenteditable', 'true');
          fillAssetPreview(meta.key);
        } catch(_){}
        S.done.add(meta.key);
        i++;
        if(i >= items.length){
          edit.classList.remove('gen');
          estatus.innerHTML = '<b>Package ready.</b> ' + items.length + ' assets · click any to edit inline.';
          renderNav();
          try { window.MEL.addTask && window.MEL.addTask('Listing package ready · ' + (S.prop && S.prop.a || ''), items.length + ' assets · review and publish', 'done'); } catch(_){}
          /* generation finished — now create the recap chat (the "done" screen) */
          try {
            if(S.prop){
              const rec = { prop:S.prop, items: items.map(x => ({ key:x.key, nm:x.nm, ico:x.ico })) };
              PACKETS[S.prop.a] = rec; lastPacket = rec;
              if(window.MEL.newChat) window.MEL.newChat();
              window.MEL.send && window.MEL.send('Listing package — ' + S.prop.a);
            }
          } catch(_){}
          return;
        }
        const t2 = setTimeout(start, 800);
        S.timers.push(t2);
      }, 2600 + Math.random() * 1400);
      S.timers.push(t);
    };
    const t0 = setTimeout(start, 900);
    S.timers.push(t0);
  }
  function closeEditor(){
    page.classList.remove('pkediton');
    edit.classList.remove('open','gen');
    S.timers.forEach(t => clearTimeout(t)); S.timers = [];
    /* New flow: land back on the screen that opened the editor (the template gallery, normally),
       never on a screen the agent did not come from. */
    if(document.body.classList.contains('msflow-new')){
      page.classList.remove('packeton','canvason','library','paneled');
      page.classList.add('studio');
      document.body.classList.remove('msfull');
      const back = S.fromNf || 'templates';
      document.querySelectorAll('#ms-newflow .msnfs').forEach(s => s.classList.toggle('on', s.dataset.nf === back));
      return;
    }
    page.classList.add('studio','packeton');
    /* rebuild the setup screen so Back never lands on a blank page */
    try { renderChip(); renderScope(); } catch(_){}
  }
  $('pke-back').addEventListener('click', closeEditor);

  /* Hook for the new flow: generation there has already run, so land in this
     same editor with every asset already rendered — no second gen sequence. */
  window.__msnfEditor = function(propId, keys){
    const arr = LIST();
    const p = arr.find(x => x.id === propId) ||
              arr.find(x => (x.a || '').toLowerCase().indexOf(String(propId).toLowerCase()) === 0) || arr[0];
    if(!p) return;
    S.prop = p;
    const from = document.querySelector('#ms-newflow .msnfs.on');
    S.fromNf = (from && from.dataset.nf) || 'templates';   /* where Close/Back should land */
    const ok = (keys || []).filter(k => PKG.some(x => x.key === k));
    S.checked = new Set(ok.length ? ok : PKG.map(x => x.key));
    page.classList.add('studio');
    S.timers.forEach(t => clearTimeout(t)); S.timers = [];
    page.classList.remove('packeton','canvason','library','paneled');
    page.classList.add('pkediton');
    edit.classList.add('open');
    edit.classList.remove('gen');
    S.done.clear(); S.captions = S.captions || {}; S.notes = S.notes || {}; S.tpls = S.tpls || {}; S.color = S.color || '#5A5FF2';
    const et = document.getElementById('pke-title');
    if(et) et.textContent = p.a;
    esub.textContent = '';
    const items = PKG.filter(x => S.checked.has(x.key));
    erail.innerHTML = items.map(x => { try { return renderAsset(x); } catch(_) { return ''; } }).join('');
    items.forEach(x => {
      const el = document.getElementById('pkast-' + x.key);
      if(!el) return;
      el.classList.remove('pending','building');
      el.classList.add('done');
      try {
        el.querySelector('.as').textContent = 'Ready';
        el.querySelector('.cap').setAttribute('contenteditable', 'true');
        fillAssetPreview(x.key);
      } catch(_){}
      S.done.add(x.key);
    });
    S.active = items[0] && items[0].key;
    if(S.active) setActive(S.active, false); else { renderNav(); renderSide(); }
    estatus.innerHTML = items.length === 1
      ? '<b>Ready.</b> Edit it here — nothing posts until you approve it.'
      : '<b>Ready.</b> ' + items.length + ' assets · click any to edit inline.';
    renderNav();
  };

  /* Self-heal: never leave a blank white surface. If the page says the editor
     is on but the editor is closed, fall back to the packet panel; if the
     editor is open with cards rendered but none active (all display:none),
     re-activate the first one. */
  setInterval(() => {
    try {
      if(page.classList.contains('pkediton') && !edit.classList.contains('open')){
        page.classList.remove('pkediton');
        page.classList.add('packeton');
        renderChip(); renderScope();
        return;
      }
      if(edit.classList.contains('open') && erail.children.length && !erail.querySelector('.pkast.active')){
        const first = erail.querySelector('.pkast');
        if(first) setActive(first.dataset.pk, false);
      }
    } catch(_){}
  }, 900);

  /* editor click delegation: jump, suggestion, template, color, regen */
  edit.addEventListener('click', e => {
    const j = e.target.closest('[data-jump]');
    if(j){ setActive(j.dataset.jump, true); return; }
    const sg = e.target.closest('[data-sugg]');
    if(sg){
      const key = sg.dataset.sugg, i = +sg.dataset.i, s = actsFor(key)[i];
      if(!s) return;
      const cap = document.querySelector('.pkast[data-pk="' + key + '"] .cap');
      if(cap){
        let next = cap.textContent;
        try { next = fillPlaceholders(s.f(next)); } catch(_){}
        cap.textContent = next;
        S.captions[key] = next;
        cap.animate([{ background:'rgba(90,95,242,.14)' }, { background:'var(--white)' }], { duration:520, easing:'ease-out' });
      }
      S.applied = S.applied || {};
      S.applied[key + ':' + i] = true;
      sg.classList.add('applied');
      return;
    }
    if(e.target.closest('#pke-prev')){ step(-1); return; }
    if(e.target.closest('#pke-next')){ step(1); return; }
    if(e.target.closest('#pke-navtoggle')){
      if(!enav) return;
      const on = enav.classList.toggle('open');
      const nh = $('pke-navtoggle'); if(nh) nh.setAttribute('aria-expanded', on ? 'true' : 'false');
      return;
    }
    if(e.target.closest('#pke-aistyle')){
      const key = S.active;
      const names = TPLS[key] || [];
      S.tpls = S.tpls || {};
      if(names.length) S.tpls[key] = names[Math.floor(Math.random() * names.length)];      S.color = SWATCHES[Math.floor(Math.random() * SWATCHES.length)];
      const PH = (window.MELSTUDIO && window.MELSTUDIO.PHOTOS) || [];
      if(PH.length){ S.imgs = S.imgs || {}; S.imgs[key] = Math.floor(Math.random() * PH.length); }
      const acts = actsFor(key);
      const cap = document.querySelector('.pkast[data-pk="' + key + '"] .cap');
      if(cap && acts.length){
        const s = acts[Math.floor(Math.random() * acts.length)];
        try { const next = fillPlaceholders(s.f(cap.textContent)); cap.textContent = next; S.captions[key] = next; } catch(_){}
      }
      fillAssetPreview(key); renderSide();
      if(window.sonner) sonner('Mel styled it', 'New image, accent, template and copy — click again for another take');
      return;
    }
    const car = e.target.closest('[data-pkcar]');
    if(car){
      const v = car.dataset.pkcar;
      const track = document.getElementById('pv4-track');
      if(!track) return;
      const n = track.children.length; if(!n) return;
      let cur = +(S.pcar || 0);
      if(v === 'prev') cur = Math.max(0, cur - 1);
      else if(v === 'next') cur = Math.min(n - 1, cur + 1);
      else { const ix = parseInt(v, 10); if(isNaN(ix)) return; cur = Math.max(0, Math.min(n - 1, ix)); }
      S.pcar = cur;
      track.style.transform = 'translateX(' + (-cur * 100) + '%)';
      document.querySelectorAll('.pkedit .pv4-dot').forEach((el, i) => el.classList.toggle('on', i === cur));
      const nbtns = document.querySelectorAll('.pkedit .pv4-nbtn');
      if(nbtns[0]) nbtns[0].disabled = (cur === 0);
      if(nbtns[1]) nbtns[1].disabled = (cur >= n - 1);
      return;
    }
    const pi = e.target.closest('[data-pkimg]');
    if(pi){ S.imgs = S.imgs || {}; S.imgs[S.active] = +pi.dataset.pkimg; if(S.shots) delete S.shots[S.active]; S.pcar = 0; fillAssetPreview(S.active); renderSide(); return; }
    if(e.target.closest('[data-pkupload]')){ const fi = $('pke-imgin'); if(fi){ fi.value = ''; fi.click(); } return; }
    const upl = e.target.closest('[data-uplup]');
    if(upl){
      S.upwant = upl.dataset.want || '';
      const fi = $('pke-imgin'); if(fi){ fi.value = ''; fi.click(); }
      return;
    }
    const usrc = e.target.closest('[data-upsrc]');
    if(usrc){ if(window.sonner) sonner('Connect ' + usrc.dataset.upsrc, 'Mel will import the album once it is linked'); return; }
    const udel = e.target.closest('[data-updel]');
    if(udel){
      const i = +udel.dataset.updel, f = (S.lib || [])[i];
      if(f){
        S.lib.splice(i, 1);
        Object.keys(S.shots || {}).forEach(k => {
          const a = S.shots[k], ix = a.indexOf(f.u);
          if(ix >= 0){ a.splice(ix, 1); if(!a.length) delete S.shots[k]; }
        });
        fillAssetPreview(S.active);
      }
      renderSide(); return;
    }
    const uuse = e.target.closest('[data-upuse]');
    if(uuse){
      const f = (S.lib || [])[+uuse.dataset.upuse];
      if(f){
        S.shots = S.shots || {};
        const a = S.shots[S.active] = S.shots[S.active] || [];
        const ix = a.indexOf(f.u);
        if(ix >= 0) a.splice(ix, 1); else a.push(f.u);
        if(!a.length){ delete S.shots[S.active]; fillAssetPreview(S.active); }
        else { fillAssetPreview(S.active); applyShots(S.active); }
      }
      renderSide(); return;
    }
    const umel = e.target.closest('[data-upmel]');
    if(umel){
      const n = +umel.dataset.upmel, lib = (S.lib || []);
      const pickd = n === 1 ? lib.slice(-1) : lib.slice(0, n);
      if(pickd.length){
        S.shots = S.shots || {};
        S.shots[S.active] = pickd.map(f => f.u);
        fillAssetPreview(S.active); applyShots(S.active);
        if(window.sonner) sonner('Mel placed ' + pickd.length + (pickd.length === 1 ? ' photo' : ' photos'), 'Tap any tile to swap one out');
      }
      renderSide(); return;
    }
    const pf = e.target.closest('[data-pkfont]');
    if(pf){ S.fonts = S.fonts || {}; S.fonts[S.active] = pf.dataset.pkfont; fillAssetPreview(S.active); renderSide(); return; }
    const lt = e.target.closest('[data-libtpl]');
    if(lt){
      S.libtpl = S.libtpl || {};
      S.libtpl[S.active] = lt.dataset.libtpl;
      const CAT2 = { Bold:'Wave', Editorial:'Editorial', Minimal:'Minimal' };
      S.tpls = S.tpls || {};
      S.tpls[S.active] = CAT2[lt.dataset.libcat] || 'Wave';
      fillAssetPreview(S.active);
      renderSide();
      return;
    }
    const atg = e.target.closest('[data-addtag]');
    if(atg){ addTag(atg.dataset.addtag); return; }
    const rtg = e.target.closest('[data-rmtag]');
    if(rtg){
      const a = (S.tags && S.tags[S.active]) || [];
      const ix = a.indexOf(rtg.dataset.rmtag);
      if(ix >= 0) a.splice(ix, 1);
      renderSide(); return;
    }
    const bl = e.target.closest('[data-blearn]');
    if(bl){
      const B2 = S.brand;
      const u = $('pke-burl');
      if(u && u.value.trim()) B2.src = u.value.trim();
      B2.color = B2.color || '#5A5FF2';
      B2.font = B2.font || Object.keys((window.MELSTUDIO && window.MELSTUDIO.FONTS) || { inter:1 })[0];
      B2.voice = B2.voice || 'lowercase headlines, no hype, never lead with the price';
      B2.phase = 'review';
      if(window.sonner) sonner('Mel read ' + B2.src, 'Colours, headline face and voice \u2014 review before saving');
      renderSide(); return;
    }
    if(e.target.closest('[data-bfontadd]')){ const fi = $('pke-bfont'); if(fi){ fi.value = ''; fi.click(); } return; }
    if(e.target.closest('[data-bguide]')){ const fi = $('pke-bpdf'); if(fi){ fi.value = ''; fi.click(); } return; }
    if(e.target.closest('[data-blogo]')){ const fi = $('pke-blogo'); if(fi){ fi.value = ''; fi.click(); } return; }
    if(e.target.closest('[data-bvoiceok]')){ if(window.sonner) sonner('Noted', 'I will keep writing in that voice'); return; }
    if(e.target.closest('[data-bsave]')){
      S.brand.phase = 'saved'; S.brand.on = true; S.btab = 'kit';
      S.color = S.brand.color;
      fillAssetPreview(S.active);
      if(window.sonner) sonner('Brand saved', 'Every new asset starts from your kit');
      renderSide(); return;
    }
    if(e.target.closest('[data-bstart]')){ S.brand.phase = 'empty'; renderSide(); return; }
    if(e.target.closest('[data-btog]')){
      S.brand.on = !S.brand.on;
      if(window.sonner) sonner(S.brand.on ? 'Brand on' : 'Brand off', S.brand.on ? 'Applied to every asset' : 'Assets keep their own colours and type');
      renderSide(); return;
    }
    const btb = e.target.closest('[data-btab]');
    if(btb){ S.btab = btb.dataset.btab; renderSide(); return; }
    const bop = e.target.closest('[data-bopen]');
    if(bop){
      const id = bop.dataset.bopen;
      S.bopen = (id === 'none' || S.bopen === id) ? '' : id;
      renderSide(); return;
    }
    const bcl = e.target.closest('[data-bcol]');
    if(bcl){
      S.brand.color = bcl.dataset.bcol; S.color = bcl.dataset.bcol;
      fillAssetPreview(S.active); renderSide(); return;
    }
    const bft = e.target.closest('[data-bfont]');
    if(bft){
      S.brand.font = bft.dataset.bfont;
      S.fonts = S.fonts || {}; S.fonts[S.active] = bft.dataset.bfont;
      fillAssetPreview(S.active); renderSide(); return;
    }
    const brl = e.target.closest('[data-brule]');
    if(brl){
      const r = S.brand.rules[+brl.dataset.brule];
      if(r) r.on = !r.on;
      renderSide(); return;
    }
    const bgo = e.target.closest('[data-bgoto]');
    if(bgo){
      S.row = bgo.dataset.bgoto;
      if(bgo.dataset.bopenrow){ S.btab = 'kit'; S.bopen = bgo.dataset.bopenrow; }
      renderSide(); return;
    }
    if(e.target.closest('[data-bapply]')){
      S.color = S.brand.color;
      if(S.brand.font){ S.fonts = S.fonts || {}; S.fonts[S.active] = S.brand.font; }
      fillAssetPreview(S.active);
      if(window.sonner) sonner('Brand applied', S.brand.rules.filter(r => r.on).length + ' rules checked \u00b7 colours and type from your kit');
      renderSide(); return;
    }
    /* ---- Mel feed: apply / undo / skip / jump to a section / ask ---- */
    const mup = e.target.closest('[data-melup]');
    if(mup){
      const cardEl = mup.closest('.melup');
      if(cardEl && !cardEl.classList.contains('loading')){
        cardEl.classList.add('loading');
        const b = cardEl.querySelector('.mfap');
        if(b){ b.setAttribute('disabled', ''); b.innerHTML = '<span class="spin"></span>Applying'; }
        const s = cardEl.querySelector('.mfsk'); if(s) s.setAttribute('disabled', '');
      }
      setTimeout(() => {
        const u = MELUPS[mup.dataset.melup];
        if(u){
          try { (u.apply || u.act || function(){})(); }
          catch(err){ console.warn('[melup apply] ' + (err && err.message || err)); }
          if(u.apply){
            S.melDone = S.melDone || {}; S.melDone[S.active + ':' + u.id] = 1;
            if(window.sonner) sonner('Mel applied it', u.t + ' \u00b7 ' + ((S.tpls && S.tpls[S.active]) || 'your') + ' layout untouched');
          }
        }
        renderSide();
      }, 300);
      return;
    }
    const mun = e.target.closest('[data-melundo]');
    if(mun){
      const u = MELUPS[mun.dataset.melundo];
      if(u && u.undo){
        try { u.undo(); } catch(err){ console.warn('[melup undo] ' + (err && err.message || err)); }
        if(S.melDone) delete S.melDone[S.active + ':' + u.id];
      }
      renderSide(); return;
    }
    const msk = e.target.closest('[data-melskip]');
    if(msk){
      const cardEl = msk.closest('.melup');
      if(cardEl) cardEl.classList.add('skipping');
      setTimeout(() => {
        S.melSkip = S.melSkip || {}; S.melSkip[S.active + ':' + msk.dataset.melskip] = 1;
        renderSide();
      }, 220);
      return;
    }
    const mgo = e.target.closest('[data-melgo]');
    if(mgo){ const t = mgo.dataset.melgo; S.row = (t === 'mel' ? 'photo' : t); renderSide(); return; }
    const mask = e.target.closest('[data-melask]');
    if(mask){ melSay(mask.dataset.melask); return; }
    const rw = e.target.closest('[data-pkrow]');
    if(rw){ const t = rw.dataset.pkrow; S.row = (t === 'mel' ? 'photo' : t); renderSide(); return; }
    const et = e.target.closest('[data-edtab]');
    if(et){ S.edtab = et.dataset.edtab; renderSide(); return; }
    if(e.target.closest('[data-pksugg]')){
      const key = S.active;
      /* the agent's own picks for this asset come first; TPLS is the fallback library */
      const mine = (S.tplsAll && S.tplsAll[key]) || [];
      const names = mine.length > 1 ? mine : (TPLS[key] || []);
      if(names.length){ S.tpls = S.tpls || {}; S.tpls[key] = names[Math.floor(Math.random() * names.length)]; }
      fillAssetPreview(key); renderSide();
      if(window.sonner) sonner('Mel picked a template', (S.tpls[key] || '') + ' — click again for another');
      return;
    }
    const ac = e.target.closest('[data-act]');
    if(ac){
      const i = +ac.dataset.act, s = actsFor(S.active)[i];
      const ta = document.getElementById('pke-cap');
      if(s && ta){
        try { ta.value = fillPlaceholders(s.f(ta.value)); } catch(_){}
        S.captions[S.active] = ta.value;
        const hid = document.querySelector('.pkast[data-pk="' + S.active + '"] .cap');
        if(hid) hid.textContent = ta.value;
        ta.animate([{ background:'rgba(90,95,242,.12)' }, { background:'var(--white)' }], { duration:520, easing:'ease-out' });
      }
      return;
    }
    if(e.target.closest('[data-manual]')){
      const on = edit.classList.toggle('manual');
      document.querySelectorAll('.pkedit [data-manual]').forEach(b => { b.textContent = on ? 'Hide manual editing' : 'Switch to manual editing'; });
      return;
    }
    if(e.target.closest('#pke-up')){ const fi = $('pke-imgin'); if(fi){ fi.value = ''; fi.click(); } return; }
    if(e.target.closest('#pke-editcap')){
      edit.classList.add('manual');
      document.querySelectorAll('.pkedit [data-manual]').forEach(b => { b.textContent = 'Hide manual editing'; });
      const cp = document.querySelector('.pkast[data-pk="' + S.active + '"] .cap');
      if(cp && cp.getAttribute('contenteditable') === 'true'){
        cp.focus();
        try {
          const r = document.createRange(); r.selectNodeContents(cp); r.collapse(false);
          const sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(r);
        } catch(_){}
      }
      return;
    }
    const t = e.target.closest('[data-tpl]');
    if(t){
      S.tpls[S.active] = t.dataset.tpl;
      t.parentNode.querySelectorAll('[data-tpl]').forEach(b => b.classList.toggle('on', b === t));
      fillAssetPreview(S.active);
      return;
    }
    const c = e.target.closest('[data-col]');
    if(c){
      S.color = c.dataset.col;
      c.parentNode.querySelectorAll('[data-col]').forEach(b => b.classList.toggle('on', b === c));
      /* re-render every finished asset with the new accent */
      Array.from(S.done).forEach(k => fillAssetPreview(k));
      return;
    }
    if(e.target.closest('#pke-save')){
      const btn = e.target.closest('#pke-save');
      if(btn.classList.contains('busy')) return;
      const _meta = (typeof PKG !== 'undefined' && PKG.find) ? PKG.find(p => p.key === S.active) : null;
      const label = (_meta && _meta.nm) || 'Asset';
      const addr = (S.prop && S.prop.a) ? S.prop.a : '';
      btn.classList.add('busy');
      const wrap = (function(){
        let w = document.querySelector('.sonner');
        if(!w){ w = document.createElement('div'); w.className = 'sonner'; document.body.appendChild(w); }
        return w;
      })();
      const t = document.createElement('div');
      t.className = 'snr pkesnr';
      t.innerHTML = '<svg class="snri" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="40 20"/></svg>' +
        '<div><div class="snrt">Saving to library\u2026</div><div class="snrd"></div></div>' +
        '<span class="snrx">\u2715</span>';
      t.querySelector('.snri').style.animation = 'pkspin .8s linear infinite';
      const dEl = t.querySelector('.snrd');
      dEl.textContent = label + (addr ? ' \u00b7 ' + addr : '');
      let killed = false;
      const kill = () => { if(killed) return; killed = true; t.classList.remove('in'); setTimeout(() => t.remove(), 180); };
      t.querySelector('.snrx').onclick = kill;
      wrap.appendChild(t);
      requestAnimationFrame(() => t.classList.add('in'));
      setTimeout(() => {
        if(window.MSLIB && window.MSLIB.save && S.prop) window.MSLIB.save(S.prop, label);
        btn.classList.remove('busy');
        if(killed) return;
        const ico = t.querySelector('.snri');
        ico.style.animation = '';
        ico.outerHTML = '<svg class="snri done" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
        t.querySelector('.snrt').textContent = 'Saved to library';
        const body = t.querySelector('.snrd');
        body.innerHTML = '';
        const meta = document.createElement('span'); meta.textContent = label + (addr ? ' \u00b7 ' + addr : ''); meta.style.marginRight = '10px';
        const view = document.createElement('a');
        view.href = '#'; view.className = 'snrlink'; view.textContent = 'View';
        view.onclick = ev => { ev.preventDefault(); kill(); const nav = document.getElementById('ms-navlib'); if(nav) nav.click(); };
        body.appendChild(meta); body.appendChild(view);
        setTimeout(kill, 4200);
      }, 720);
      return;
    }
    if(e.target.closest('#pke-share')){ e.stopPropagation(); if(window.__pkeShare) window.__pkeShare.toggle(); return; }
    if(e.target.closest('#pke-genprev') || e.target.closest('#pke-gennext')){
      const back = !!e.target.closest('#pke-genprev');
      S.gn = S.gn || 1; S.gv = S.gv || 1;
      S.gv = Math.min(S.gn, Math.max(1, S.gv + (back ? -1 : 1)));
      renderGen(); return;
    }
    if(e.target.closest('#pke-regen')){
      S.gn = (S.gn || 1) + 1; S.gv = S.gn; renderGen();
      const key = S.active, el = document.getElementById('pkast-' + key); if(!el) return;
      el.classList.remove('done'); el.classList.add('building');
      el.querySelector('.as').textContent = 'Regenerating';
      const rtt = el.querySelector('.pktrt'); if(rtt) rtt.textContent = 'Regenerating the design\u2026';
      const rtop = document.getElementById('pke-toptr'); if(rtop) rtop.textContent = 'Regenerating the design\u2026';
      edit.classList.add('gen');
      const t2 = setTimeout(() => {
        el.classList.remove('building'); el.classList.add('done');
        edit.classList.remove('gen');
        el.querySelector('.as').textContent = 'Ready';
        fillAssetPreview(key);
      }, 900 + Math.random() * 400);
      S.timers.push(t2);
      return;
    }
    if(e.target.closest('#pke-open')){
      const key = S.active;
      const hub = document.getElementById('ms-hub');
      const card = hub && hub.querySelector('.mshcard[data-hub="' + key + '"]');
      if(card){ closeEditor(); page.classList.remove('packeton'); setTimeout(() => card.click(), 160); }
      return;
    }
  });

  const bLogo = $('pke-blogo');
  if(bLogo) bLogo.addEventListener('change', () => {
    const f = (bLogo.files || [])[0];
    if(!f) return;
    const rd = new FileReader();
    rd.onload = () => {
      S.brand = S.brand || {}; S.brand.logo = rd.result;
      if(window.sonner) sonner('Logo saved', 'Placed bottom-left on every asset');
      renderSide();
    };
    rd.readAsDataURL(f);
  });
  /* brand fonts: register the real face, drop it in the shared FONTS map so every
     preview and asset can use it, and put it on this asset straight away */
  const bFontIn = $('pke-bfont');
  if(bFontIn) bFontIn.addEventListener('change', () => {
    const files = Array.from(bFontIn.files || []).slice(0, 4);
    if(!files.length) return;
    const FTo = (window.MELSTUDIO && window.MELSTUDIO.FONTS) || null;
    if(!FTo){ console.warn('[bfont] MELSTUDIO.FONTS unavailable'); return; }
    let left = files.length, lastKey = null, lastName = '';
    files.forEach((f, i) => {
      const rd = new FileReader();
      const finish = () => { if(--left === 0 && lastKey){
        S.brand = S.brand || {}; S.brand.font = lastKey;
        S.fonts = S.fonts || {}; S.fonts[S.active] = lastKey;
        fillAssetPreview(S.active); renderSide();
        if(window.sonner) sonner(files.length > 1 ? files.length + ' brand fonts added' : 'Brand font added',
          lastName + ' is on this asset and saved to your kit');
      } };
      rd.onerror = () => { console.warn('[bfont] could not read ' + (f.name || 'file')); finish(); };
      rd.onload = () => {
        const nm = String(f.name || 'Brand font').replace(/\.(ttf|otf|woff2?)$/i, '')
          .replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim() || 'Brand font';
        const key = 'bf' + Date.now().toString(36) + i;
        const fam = 'RadiusBrand' + key;
        const add = () => {
          FTo[key] = { n: nm, d: 'From your brand kit', s: "'" + fam + "',var(--font)", brand: true };
          lastKey = key; lastName = nm; finish();
        };
        try {
          const face = new FontFace(fam, 'url(' + rd.result + ')');
          face.load().then(loaded => { document.fonts.add(loaded); add(); })
            .catch(err => { console.warn('[bfont] ' + nm + ' failed to load: ' + (err && err.message || err)); add(); });
        } catch(err){ console.warn('[bfont] FontFace unavailable: ' + (err && err.message || err)); add(); }
      };
      rd.readAsDataURL(f);
    });
  });
  const bPdf = $('pke-bpdf');
  if(bPdf) bPdf.addEventListener('change', () => {
    const f = (bPdf.files || [])[0];
    if(!f) return;
    S.brand = S.brand || {};
    S.brand.guide = String(f.name || 'guidelines.pdf');
    if(S.brand.phase === 'empty'){ S.brand.phase = 'review'; S.brand.src = S.brand.guide; }
    if(window.sonner) sonner('Reading ' + S.brand.guide, 'Mel is pulling the rules out of it');
    renderSide();
  });

  /* own photos: read as data URLs, stash per asset, lay in immediately */
  const imgIn = $('pke-imgin');
  if(imgIn) imgIn.addEventListener('change', () => {
    const files = Array.from(imgIn.files || []).slice(0, 8);
    if(!files.length) return;
    const key = S.active;
    S.shots = S.shots || {}; S.shots[key] = S.shots[key] || [];
    let left = files.length;
    files.forEach(f => {
      const rd = new FileReader();
      rd.onload = () => {
        S.lib = S.lib || [];
        const nm = (S.upwant && files.length === 1 ? S.upwant : String(f.name || 'Upload').replace(/\.[a-z0-9]+$/i, ''));
        if(!S.lib.some(x => x.u === rd.result)) S.lib.push({ u: rd.result, n: nm });
        S.shots[key].push(rd.result);
        if(--left === 0){ S.upwant = ''; applyShots(key); renderSide(); }
      };
      rd.readAsDataURL(f);
    });
  });

  /* arrow keys walk the packet while the editor is open */
  document.addEventListener('keydown', e => {
    if(!edit.classList.contains('open')) return;
    const t = e.target;
    if(t && t.closest && t.closest('[contenteditable="true"], input, textarea')) return;
    if(e.key === 'ArrowRight'){ e.preventDefault(); step(1); }
    else if(e.key === 'ArrowLeft'){ e.preventDefault(); step(-1); }
    else if(e.key === 'Escape'){ closeEditor(); }
  });

  /* editor caption inline edit → stash */
  edit.addEventListener('input', e => {
    if(e.target.id === 'pke-fontq'){
      const q = e.target.value.trim().toLowerCase();
      document.querySelectorAll('#pke-flist .frow').forEach(r => {
        r.hidden = !!q && (r.dataset.fname || '').indexOf(q) < 0;
      });
      return;
    }
    const cap = e.target.closest('[data-cap]');
    if(cap){
      const v = cap.tagName === 'TEXTAREA' ? cap.value : cap.textContent;
      S.captions[cap.dataset.cap] = v;
      if(cap.tagName === 'TEXTAREA'){
        const hid = document.querySelector('.pkast[data-pk="' + cap.dataset.cap + '"] .cap');
        if(hid) hid.textContent = v;
      }
      return;
    }
    if(e.target.id === 'pke-upq'){
      const q = e.target.value.trim().toLowerCase();
      document.querySelectorAll('#pke-upgrid .upth').forEach(t => {
        t.style.display = !q || (t.dataset.upn || '').indexOf(q) >= 0 ? '' : 'none';
      });
      return;
    }
    if(e.target.id === 'pke-burl'){ S.brand.src = e.target.value; return; }
    if(e.target.id === 'pke-bvoice'){ S.brand.voice = e.target.value; return; }
    if(e.target.id === 'pke-note'){ S.notes[S.active] = e.target.value; return; }
  });

  /* the Mel panel's chat box: Enter sends the ask to Mel */
  (function(){
    const ci = document.querySelector('#pke-chat .melchat-in');
    if(!ci){ console.warn('[pke chat] input not found \u2014 Mel panel asks are keyboard-only'); return; }
    ci.addEventListener('keydown', e => {
      if(e.key !== 'Enter') return;
      e.preventDefault();
      const v = ci.value; ci.value = '';
      melSay(v);
    });
  })();

  function addTag(raw, refocus){
    const key = S.active; if(!key) return;
    let t = String(raw || '').trim().replace(/\s+/g, '');
    if(!t) return;
    if(!/^[#@]/.test(t)) t = '#' + t;
    S.tags = S.tags || {}; S.tags[key] = S.tags[key] || [];
    if(S.tags[key].length >= 12){ if(window.sonner) sonner('That is 12 tags', 'Remove one before adding another'); return; }
    if(S.tags[key].some(x => x.toLowerCase() === t.toLowerCase())) return;
    S.tags[key].push(t); renderSide();
    if(refocus){ const i = document.getElementById('pke-tagin'); if(i) i.focus(); }
  }

  edit.addEventListener('keydown', e => {
    if(e.target.id === 'pke-brule'){
      if(e.key !== 'Enter') return;
      e.preventDefault();
      const v = e.target.value.trim();
      if(!v) return;
      S.brand.rules.push({ t:v, on:true });
      e.target.value = '';
      renderSide();
      const i = document.getElementById('pke-brule'); if(i) i.focus();
      return;
    }
    if(e.target.id !== 'pke-tagin') return;
    if(e.key === 'Enter'){ e.preventDefault(); const v = e.target.value; e.target.value = ''; addTag(v, true); }
    else if(e.key === 'Backspace' && !e.target.value){
      const a = (S.tags && S.tags[S.active]) || [];
      if(a.length){ a.pop(); renderSide(); const i = document.getElementById('pke-tagin'); if(i) i.focus(); }
    }
  });

  /* scroll spy — activate whichever asset is centered in the viewport */
  const stackEl = document.getElementById('pke-stack');
  if(stackEl){
    let scrollT = null;
    stackEl.addEventListener('scroll', () => {
      if(scrollT) return;
      scrollT = setTimeout(() => {
        scrollT = null;
        const scRect = stackEl.getBoundingClientRect();
        const anchor = scRect.top + scRect.height * 0.28;
        let bestKey = null, bestDist = Infinity;
        document.querySelectorAll('.pkast').forEach(el => {
          if(!el.offsetParent) return;
          const r = el.getBoundingClientRect();
          const dist = Math.abs(r.top - anchor);
          if(dist < bestDist){ bestDist = dist; bestKey = el.dataset.pk; }
        });
        if(bestKey && bestKey !== S.active) setActive(bestKey, false);
      }, 90);
    });
  }

  /* Generate → open the editor. Also spins up a dedicated chat + activity task so
     the run is tracked in Mel activity (Today) alongside the other pieces. */
  goBtn.addEventListener('click', () => {
    if(!S.prop || S.checked.size === 0) return;
    /* Generate just opens the editor. The setup screen stays intact behind it,
       so Back returns to it (not a blank page). The recap chat is created only
       when generation FINISHES (see openEditor's completion). */
    try {
      window.MEL.addTask && window.MEL.addTask(
        'Listing package · ' + S.prop.a,
        'Generating ' + S.checked.size + ' assets · by Mel',
        'run'
      );
    } catch(_) {}
    openEditor();
  });

  /* ---------- Property search bar (studio-hub composer replacement) ---------- */
  const bar = $('ms-propbar'), inp = $('pb-in'), drop = $('pb-drop');
  /* mount the bar into .melfoot so CSS scoping works */
  const foot = document.getElementById('mel-foot');
  if(foot && bar && bar.parentNode !== foot) foot.insertBefore(bar, foot.firstChild);

  function propRows(q){
    q = (q || '').trim().toLowerCase();
    const hits = LIST().filter(p => !q || p.a.toLowerCase().includes(q) || (p.hood || '').toLowerCase().includes(q));
    const rows = hits.map(p => (
      '<button class="row" type="button" data-pbp="' + p.id + '">' +
        '<span class="thm" style="' + thumb(p) + '"></span>' +
        '<span style="min-width:0"><b>' + esc(p.a) + '</b><i>' + esc(p.hood + ' · ' + p.bd + ' bd · ' + p.ba + ' ba') + '</i></span>' +
        '<span class="price">' + money(p.price) + '</span>' +
      '</button>'
    )).join('');
    const isMls = /^\d{6,}$/.test(q);
    const mlsRow = q ?
      '<button class="pbmls" type="button" data-pbmls="' + esc(q) + '">' +
        sv('<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>') +
        (isMls ? '<span>Look up MLS <b>' + esc(q) + '</b></span>' : '<span>Search MLS for <b>' + esc(q) + '</b></span>') +
        '<span class="kbd">↵</span>' +
      '</button>' :
      '<button class="pbmls" type="button" data-pbmls="">' +
        sv('<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>') +
        '<span>Or search MLS by address or number</span>' +
      '</button>';
    return '<div class="grp">' + (q ? 'Matches in your CRM' : 'Recent listings') + '</div>' +
      '<div class="list">' + (rows || '<div class="empty">No match in your CRM. Try MLS below.</div>') + '</div>' +
      mlsRow;
  }
  function openDrop(){ drop.innerHTML = propRows(inp.value); bar.classList.add('open'); }
  function closeDrop(){ bar.classList.remove('open'); }
  inp.addEventListener('focus', openDrop);
  inp.addEventListener('input', () => {
    bar.classList.toggle('hasval', inp.value.length > 0);
    drop.innerHTML = propRows(inp.value);
    bar.classList.add('open');
  });
  $('pb-clear').addEventListener('click', () => { inp.value = ''; bar.classList.remove('hasval'); drop.innerHTML = propRows(''); inp.focus(); });
  document.addEventListener('click', e => {
    if(!bar.contains(e.target)) closeDrop();
  });
  drop.addEventListener('click', e => {
    const r = e.target.closest('[data-pbp]');
    if(r){
      const p = LIST().find(x => x.id === r.dataset.pbp);
      if(p){ S.prop = p; inp.value = p.a; bar.classList.add('hasval'); closeDrop();
        /* if user is on packet page, refresh the chip; otherwise just remember */
        if(page.classList.contains('packeton')) renderChip();
        else openPacket(); /* picking here jumps into the packet flow */
      }
      return;
    }
    const m = e.target.closest('[data-pbmls]');
    if(m){
      /* MLS look-up: prototype resolves to a synthetic listing */
      const q = m.dataset.pbmls || inp.value.trim();
      const num = (q.match(/\d{6,}/) || [])[0] || '424097902';
      const syn = { id:'mls-' + num, a:'1719 Judah St', hood:'Outer Sunset · San Francisco', bd:3, ba:2, sqft:'1,340', price:1149000, ph:'#d6cec4', img:'assets/prop/s3.jpg' };
      /* small skeleton flash before resolving */
      drop.innerHTML = '<div class="grp">Fetching from the board</div><div class="list"><div class="row" style="cursor:default"><span class="thm" style="' + thumb(syn) + '"></span><span style="min-width:0"><b>Looking up MLS ' + esc(num) + '…</b><i>SFAR MLS · Bridge</i></span></div></div>';
      setTimeout(() => {
        S.prop = syn; inp.value = syn.a; bar.classList.add('hasval'); closeDrop();
        if(page.classList.contains('packeton')) renderChip();
        else openPacket();
      }, 640);
      return;
    }
  });
  inp.addEventListener('keydown', e => {
    if(e.key === 'Enter'){
      e.preventDefault();
      const first = drop.querySelector('[data-pbp]') || drop.querySelector('[data-pbmls]');
      if(first) first.click();
    } else if(e.key === 'Escape') closeDrop();
  });

  /* chat toggle: leave the studio hub and land on the fresh New-chat surface */
  $('pb-chat').addEventListener('click', () => {
    closeDrop();
    /* newChat() clears the thread and resets state; then drop studio class so the
       zero-state (prompts grid) shows through — same view as clicking New chat */
    if(window.MEL.newChat) window.MEL.newChat();
    page.classList.remove('studio','packeton','canvason','library','paneled');
    const ta = document.getElementById('mel-input'); if(ta) setTimeout(() => ta.focus(), 80);
  });

  /* Reverse toggle: a small circular "Switch to studio" pill inside the composer
     that jumps back to the studio hub search bar. Injected once, styled to mirror
     the propbar's circular chat icon. */
  if(!document.getElementById('pb-back-style')){
    const st = document.createElement('style'); st.id = 'pb-back-style';
    st.textContent =
      '.mcomposer #pb-back{display:inline-flex;align-items:center;justify-content:center;gap:0;width:32px;height:32px;padding:0;border-radius:999px;background:var(--neutral-100);border:1px solid var(--neutral-200);color:var(--neutral-700);cursor:pointer;transition:background .15s,color .15s,width .18s cubic-bezier(.23,1,.32,1),padding .18s cubic-bezier(.23,1,.32,1);overflow:hidden;flex:none}' +
      '.mcomposer #pb-back svg{width:15px;height:15px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;flex:none}' +
      '.mcomposer #pb-back .pblbl{display:none;font:600 12.5px var(--font);white-space:nowrap;color:inherit}' +
      '.mcomposer #pb-back:hover{background:var(--neutral-200);color:var(--neutral-900);width:auto;padding:0 12px;gap:6px}' +
      '.mcomposer #pb-back:hover .pblbl{display:inline}' +
      '.mcomposer #pb-back:active{transform:scale(.94)}';
    document.head.appendChild(st);
  }
  const composerRow = document.querySelector('#mel-composer .mcrow');
  if(composerRow && !document.getElementById('pb-back')){
    const back = document.createElement('button');
    back.type = 'button'; back.id = 'pb-back';
    back.title = 'Switch to studio'; back.setAttribute('aria-label','Switch to studio');
    back.innerHTML = sv('<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>') + '<span class="pblbl">Switch to studio</span>';
    composerRow.insertBefore(back, composerRow.firstChild);
    back.addEventListener('click', () => {
      const nav = document.getElementById('ms-navstudio');
      if(nav) nav.click();
      setTimeout(() => { const el = $('pb-in'); if(el){ el.focus(); openDrop(); } }, 140);
    });
  }

  /* ---------- Hub click: intercept the packet card ---------- */
  const hub = document.getElementById('ms-hub');
  if(hub){
    hub.addEventListener('click', e => {
      const c = e.target.closest('.mshcard[data-hub="packet"]');
      if(!c || hub.dataset.dragged) return;
      /* the existing CHANNELS handler bails on this key because packet is
         not in the map — we take over and open the packet panel instead */
      e.stopPropagation();
      openPacket();
    }, true); /* capture-phase so we run before the studio's own handler */
  }

  /* Sidebar "Marketing Studio" or "New chat" click → always reset packet state
     so the hub is not blocked by a stuck packet/editor overlay */
  ['ms-navstudio','mel-new','ms-navlib'].forEach(id => {
    const el = document.getElementById(id);
    if(el) el.addEventListener('click', () => {
      page.classList.remove('packeton','pkediton');
      edit && edit.classList.remove('open','gen');
    }, true);
  });

  /* ---------- Match a design: inject a section into the channel editor viewer ---------- */
  const upBox = $('ms-upload');
  function openUpload(){ upBox.classList.add('open'); upBox.classList.remove('analyzing'); refreshUpBtn(); }
  function closeUpload(){ upBox.classList.remove('open'); }
  $('ms-upcancel').addEventListener('click', closeUpload);
  upBox.addEventListener('click', e => { if(e.target === upBox) closeUpload(); });
  const upFile = $('ms-upfile'), upUrl = $('ms-upurl'), upGo = $('ms-upgo'), dz = document.querySelector('#ms-upload .dz');
  function refreshUpBtn(){ upGo.disabled = !(upFile.files && upFile.files.length) && !upUrl.value.trim(); }
  upFile.addEventListener('change', () => {
    if(upFile.files && upFile.files.length){
      dz.querySelector('b').textContent = upFile.files[0].name;
      dz.querySelector('i').textContent = 'Ready to analyze';
    }
    refreshUpBtn();
  });
  upUrl.addEventListener('input', refreshUpBtn);
  ['dragenter','dragover'].forEach(ev => dz.addEventListener(ev, e => { e.preventDefault(); dz.classList.add('hover'); }));
  ['dragleave','drop'].forEach(ev => dz.addEventListener(ev, e => { e.preventDefault(); dz.classList.remove('hover'); }));
  dz.addEventListener('drop', e => {
    if(e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length){
      upFile.files = e.dataTransfer.files;
      dz.querySelector('b').textContent = e.dataTransfer.files[0].name;
      dz.querySelector('i').textContent = 'Ready to analyze';
      refreshUpBtn();
    }
  });
  upGo.addEventListener('click', () => {
    upBox.classList.add('analyzing');
    const steps = upBox.querySelectorAll('.msuanalyze .steps .s');
    steps.forEach(s => s.classList.remove('on'));
    const labels = ['Reading layout and grid', 'Extracting color palette', 'Detecting typography', 'Composing your template'];
    let i = 0;
    const nextStep = () => {
      if(i >= steps.length){
        /* finished — inject a derived template into the viewer */
        injectMelTemplate();
        closeUpload();
        return;
      }
      steps[i].classList.add('on');
      $('ms-upsttext').textContent = 'Mel is ' + labels[i].toLowerCase() + '…';
      i++;
      setTimeout(nextStep, 700 + Math.random() * 400);
    };
    setTimeout(nextStep, 300);
  });

  /* injects a new .msvtpl tile into the viewer's Template section */
  function injectMelTemplate(){
    const tpls = document.querySelector('#ms-viewer .msvtpls'); if(!tpls) return;
    /* re-use the first existing tile's inner frame as a stand-in preview */
    const first = tpls.querySelector('.msvtpl'); if(!first) return;
    /* dedupe */
    let mel = tpls.querySelector('.msvtpl.mel');
    if(!mel){
      mel = document.createElement('button');
      mel.type = 'button';
      mel.className = 'msvtpl mel on';
      mel.dataset.mv = 'tpl'; mel.dataset.k = '__mel_' + Date.now();
      const frame = first.querySelector('.mspost, .mssite, div, span, svg');
      /* clone the first tile's visual body */
      mel.innerHTML = first.innerHTML.replace(/<i[^>]*>[^<]*<\/i>/, '');
      mel.insertAdjacentHTML('beforeend', '<i>Your design</i>');
      mel.insertAdjacentHTML('afterbegin', '<span class="sparkbadge">' + SPARK + '</span>');
      tpls.querySelectorAll('.msvtpl').forEach(t => t.classList.remove('on'));
      tpls.insertBefore(mel, tpls.firstChild);
      /* let a small confirmation live at the top of the sidebar */
      const side = document.querySelector('#ms-viewer .msvside');
      if(side){
        const note = document.createElement('div');
        note.className = 'msvmatch';
        note.innerHTML =
          '<span class="lab"><span class="sp">' + SPARK + '</span>Template ready</span>' +
          '<p>Mel built <b style="color:var(--neutral-900);font-weight:600">Your design</b> from your reference. It is applied to this preview and saved to your Library.</p>';
        /* remove any earlier match section on top */
        const existing = side.querySelector('.msvmatch'); if(existing) existing.remove();
        side.insertBefore(note, side.firstChild);
        setTimeout(() => { note.style.transition = 'opacity .4s ease'; note.style.opacity = '.85'; }, 4000);
      }
    }
  }

  /* Watch the viewer for open events and mount the Match a design section */
  const viewer = document.getElementById('ms-viewer');
  if(viewer){
    const mountMatch = () => {
      const side = viewer.querySelector('.msvside'); if(!side) return;
      if(side.querySelector('.msvmatch')) return;
      const box = document.createElement('div');
      box.className = 'msvmatch';
      box.innerHTML =
        '<span class="lab"><span class="sp">' + SPARK + '</span>Match a design</span>' +
        '<p>Upload a reference or paste a link. Mel derives a template you can reuse on any listing.</p>' +
        '<button class="btn" type="button" data-msvmatch>' + sv('<path d="M12 15V3M7 8l5-5 5 5"/><path d="M5 15v4a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-4"/>') + 'Upload reference…</button>';
      side.insertBefore(box, side.firstChild);
    };
    const obs = new MutationObserver(() => { if(viewer.classList.contains('open')) mountMatch(); });
    obs.observe(viewer, { attributes:true, attributeFilter:['class'], childList:true, subtree:true });
    document.addEventListener('click', e => { if(e.target.closest('[data-msvmatch]')) openUpload(); });
  }

  /* expose for debugging */
  window.MSPACKET = { open:openPacket, close:closePacket, state:S,
    /* one-shot: skip template-picking, land in editor with the gen trace running.
       Keys default to the 4 core collaterals — post, story, reel, listing website. */
    buildPackage(propId, keys, picks){
      const arr = LIST();
      const p = arr.find(x => x.id === propId) ||
                arr.find(x => (x.a || '').toLowerCase().indexOf(String(propId || '').toLowerCase()) === 0) || arr[0];
      if(!p) return;
      S.prop = p;
      const want = (keys && keys.length) ? keys : ['igpost','igstory','reels','website'];
      const ok = want.filter(k => PKG.some(x => x.key === k));
      S.checked = new Set(ok.length ? ok : ['igpost','igstory','reels','website']);
      /* seed the per-collateral templates the user picked — openEditor preserves any set.
         A value may be an ARRAY (the picker allows any number of templates per asset tab):
         the editor renders one template per collateral, so the first pick drives it and the
         whole list is kept on S.tplsAll, which the per-asset "try another" cycles first. */
      if(picks && typeof picks === 'object'){
        const one = {}, all = {};
        Object.keys(picks).forEach(k => {
          const v = picks[k];
          all[k] = Array.isArray(v) ? v.slice() : [v];
          one[k] = Array.isArray(v) ? v[0] : v;
        });
        S.tpls = Object.assign(S.tpls || {}, one);
        S.tplsAll = Object.assign(S.tplsAll || {}, all);
      }
      page.classList.remove('canvason','library','paneled','pkediton');
      page.classList.add('studio','packeton');
      openEditor();
    }
  };
})();

