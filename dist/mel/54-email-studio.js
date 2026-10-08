/* Email Studio — Radius Emailer: block-based email editor (Mel panel · contextual toolbar · test-send panel). Same shell as Flyer Studio. */
(function(){
  if(document.getElementById('em-app')) return;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const money = n => '$' + Number(n).toLocaleString('en-US');
  const host = document.querySelector('.melwrap') || document.body;
  const IMG = ['assets/prop/s1.jpg','assets/prop/s2.jpg','assets/prop/s3.jpg','assets/prop/s4.jpg'];
  const PHN = ['Front elevation','Living room','Kitchen','Back yard'];
  const toast = (a, b) => { if(window.sonner) sonner(a, b); };
  const LIST = (window.WEBSITE && window.WEBSITE.LIST) || [{ id:'grove', a:'1420 Grove St', unit:'', city:'San Francisco, CA 94117', hood:'Noe Valley', bd:3, ba:2, sqft:'1,510', price:1285000, oh:'Open Saturday, 1–4 PM' }];
  const lst = id => LIST.find(x => x.id === id) || LIST[0];
  const addrOf = L => L.a + (L.unit ? ', ' + L.unit : '');
  const TYPES = [{ k:'open', n:'Open house' }, { k:'listed', n:'Just listed' }, { k:'reduced', n:'Price reduced' }, { k:'sold', n:'Just sold' }];
  const LAYOUTS = { campaign:'Campaign', invite:'Invite', photo:'Photo first' };
  const ORDERS = { campaign:['header','hero','photo','intro','tiles','agent','foot'], invite:['header','hero','photo','intro','feats','agent','foot'], photo:['header','photo','hero','intro','feats','agent','foot'] };
  const BLK = { header:'Header', hero:'Hero', photo:'Photo', intro:'Message', feats:'Highlights', tiles:'Info cards', agent:'Agent', foot:'Footer' };
  const PV = { header:28, hero:72, photo:32, intro:56, feats:48, tiles:24, agent:40, foot:28 };
  const CAMP = { open:['Join us for our','open house'], listed:['Introducing our','new listing'], reduced:['Presenting a','new price'], sold:['Celebrating our','just sold'] };
  const DBG = { hero:'#EEEFFE', foot:'#F5F5F5' };
  const ACC = ['#5A5FF2','#2563EB','#0F766E','#B45309','#BE123C','#1F2937'];
  const BGS = ['#FFFFFF','#F5F5F5','#EEEFFE','#FBFAF6'];
  const TXC = ['#0A0A0A','#404040','#737373','#5A5FF2','#DC2626','#FFFFFF'];
  const FONTS = { sans:['Mona Sans',"'Mona Sans', sans-serif"], serif:['Playfair',"'Playfair Display', Georgia, serif"], mont:['Montserrat','Montserrat, sans-serif'] };
  const FIELDS = [['brand','Brand'],['web','Website'],['eyebrow','Label'],['headline','Headline'],['sub','Subhead'],['price','Price chip'],['heading','Section heading'],['body','Message'],['cta','Button text'],['fhead','Highlights heading'],['f1','Highlight 1'],['f2','Highlight 2'],['f3','Highlight 3'],['t1','Card 1 title'],['d1','Card 1 text'],['t2','Card 2 title'],['d2','Card 2 text'],['t3','Card 3 title'],['d3','Card 3 text'],['t4','Card 4 title'],['d4','Card 4 text'],['name','Agent name'],['firm','Brokerage'],['phone','Phone'],['email','Email'],['foot','Footer note']];
  const LONG = { body:1, foot:1, sub:1, d1:1, d2:1, d3:1, d4:1 };
  const fieldsOf = P => FIELDS.filter(a => /^[td]\d$/.test(a[0]) ? P.layout === 'campaign' : (/^(fhead|f\d)$/.test(a[0]) ? P.layout !== 'campaign' : true));
  const ALT = {
    open:[['Come see it this weekend',null],['Your weekend starts here','Doors open, coffee is on'],['Walk in, look around, ask me anything',null]],
    listed:[['New in the neighborhood',null],['It just hit the market','Be one of the first to see it'],['Meet your next home',null]],
    reduced:[['A new price, same great home',null],['Now easier to say yes','Priced to move this week'],['Take another look',null]],
    sold:[['Sold. Another happy move',null],['Closed, keys handed over','Another family is home'],['Thank you to everyone involved',null]]
  };

  const defaults = (type, L) => {
    const a = addrOf(L), hood = L.hood, oh = L.oh || 'Open Saturday, 1–4 PM';
    const T = { open:{ eyebrow:'Open house', headline:'Come see it this weekend', sub:oh, heading:'Open house at ' + a, cta:'RSVP for a tour',
        body:'Tour a bright ' + L.bd + ' bed, ' + L.ba + ' bath home a short walk from the best of ' + hood + '. Walk-ins are welcome, and I will be there to answer every question.' },
      listed:{ eyebrow:'Just listed', headline:'New in the neighborhood', sub:a + ' · ' + money(L.price), heading:'Just listed at ' + a, cta:'See the listing',
        body:'Bright, well kept and a short walk to everything that makes ' + hood + ' worth living in. Photos, floor plan and a private tour are one tap away.' },
      reduced:{ eyebrow:'Price reduced', headline:'A new price, same great home', sub:'Now ' + money(L.price) + ' · ' + a, heading:'Price improvement at ' + a, cta:'Book a showing',
        body:'We have adjusted the price to meet the market. Same ' + L.bd + ' bedrooms, same light, same ' + hood + ' address, at a better number.' },
      sold:{ eyebrow:'Just sold', headline:'Sold. Another happy move', sub:a + ' · closed this month', heading:'Thinking about selling in ' + hood + '?', cta:'Get your home value',
        body:'Homes in ' + hood + ' are moving fast. I can tell you what yours would sell for today, with no obligation.' } }[type];
    return Object.assign({ brand:'Kapoor Group', web:'kapoorgroup.com', price:money(L.price) + ' · ' + L.bd + ' bd · ' + L.ba + ' ba',
      fhead:'Home highlights', f1:L.bd + ' bedrooms', f2:L.ba + ' bathrooms', f3:L.sqft + ' sq ft',
      t1:'The home', d1:'A bright ' + L.bd + ' bed, ' + L.ba + ' bath with room to settle in and light in every room.', t2:'The neighborhood', d2:'A short walk to the cafés, parks and transit that make ' + hood + ' easy to love.',
      t3:'The numbers', d3:L.bd + ' bd · ' + L.ba + ' ba · ' + L.sqft + ' sq ft, listed at ' + money(L.price) + '.', t4:'Next step', d4:'Book a private tour or stop by. I will have the floor plan and disclosures ready.',
      name:'Maya Kapoor', firm:'Kapoor Group · Radius Agent Realty', phone:'(415) 555-0142', email:'maya@kapoorgroup.com',
      foot:'You are receiving this because you asked about homes in ' + hood + '. Unsubscribe' }, T);
  };
  const SUBJ = { open:L => 'Open house this weekend · ' + addrOf(L), listed:L => 'Just listed · ' + addrOf(L), reduced:L => 'Price reduced · ' + addrOf(L), sold:L => 'Just sold in ' + L.hood };
  const mkPage = (type, layout, listing) => {
    const L = lst(listing), camp = layout === 'campaign', f = defaults(type, L);
    if(camp){ f.eyebrow = CAMP[type][0]; f.headline = CAMP[type][1]; }
    return { type, layout, listing:L.id, f, fx:camp ? { heading:{ hide:true }, web:{ hide:true } } : {}, bs:{}, order:ORDERS[layout].slice(), acc:'#5A5FF2', bg:camp ? '#EEEFFE' : '#FFFFFF', font:'sans', ph:0, links:{ cta:'' },
      subj:SUBJ[type](L), nm:TYPES.find(x => x.k === type).n + ' email · ' + L.a };
  };

  const S = { P:mkPage('open', 'invite', null), tool:'templates', ttype:'open', sel:null, pop:null, hist:[], fut:[], test:null, sideOff:false, alt:0, editing:false };
  const snap = () => JSON.stringify(S.P);
  const commit = () => { S.hist.push(snap()); if(S.hist.length > 80) S.hist.shift(); S.fut = []; };
  const restore = j => { S.P = JSON.parse(j); S.sel = null; S.pop = null; refresh(); renderPanel(); renderTest(); };

  /* ---------- email renderer (px; mob = 375px stacked) ---------- */
  function mailHTML(P, o){
    o = o || {}; const mob = !!o.mob, f = P.f, X = P.fx, A = P.acc, FF = FONTS[P.font][1], camp = P.layout === 'campaign';
    const z = n => mob ? Math.max(11, Math.round(n * .7)) : n, hx = mob ? 20 : 40;
    const isS = (t, id) => o.edit && S.sel && S.sel.t === t && S.sel.id === id;
    const T = (k, sz, w, col, css) => { const x = X[k] || {}; if(x.hide) return '';
      return '<div data-el="' + k + '" data-k="' + k + '" class="' + (isS('el', k) ? 'sel' : '') + '" style="font-size:' + (z(sz) + (x.dz || 0)) + 'px;font-weight:' + (x.b == null ? w : (x.b ? 700 : 400)) + ';color:' + (x.c || col) + (x.al ? ';text-align:' + x.al : '') + ';' + (css || '') + '">' + esc(f[k]) + '</div>'; };
    const blk = (id, inner, al, hxo) => { const b = P.bs[id] || {}; if(b.hide) return '';
      const pv = b.pad != null ? b.pad : PV[id], px = hxo != null ? hxo : hx;
      return '<div class="em-blk' + (isS('blk', id) ? ' sel' : '') + '" data-blk="' + id + '" data-lab="' + BLK[id] + '" style="background:' + (b.bg || DBG[id] || 'transparent') + ';padding:' + z(pv) + 'px ' + px + 'px;text-align:' + (b.al || al || 'left') + (b.rad ? ';border-radius:' + b.rad + 'px' : '') + '">' + inner + '</div>'; };
    const rule = '<div class="em-rule" style="margin:0 ' + z(hx) + 'px"></div>';
    const B = {
      header:() => blk('header', '<div style="display:flex;justify-content:' + (camp ? 'center' : 'space-between') + ';align-items:center;gap:12px">' + T('brand', 22, 700, '#0A0A0A') + T('web', 15, 400, '#404040', 'text-align:right') + '</div>'),
      hero:() => blk('hero', camp ? T('eyebrow', 24, 300, '#0A0A0A', 'margin-bottom:' + z(4) + 'px') + T('headline', 88, 400, '#0A0A0A', 'line-height:1;letter-spacing:-.035em') + T('sub', 18, 400, '#404040', 'line-height:1.4;margin-top:' + z(16) + 'px')
        : T('eyebrow', 14, 600, A, 'text-transform:uppercase;letter-spacing:.07em;margin-bottom:' + z(12) + 'px') + T('headline', 52, 700, '#0A0A0A', 'line-height:1.06;letter-spacing:-.02em') + T('sub', 20, 400, '#404040', 'line-height:1.4;margin-top:' + z(16) + 'px'), 'center'),
      photo:() => { const x = X.photo || {}; if(x.hide) return ''; const edge = P.layout === 'photo', r = x.r != null ? x.r : (edge ? 0 : 12);
        const chip = (X.price || {}).hide ? '' : '<div data-el="price" data-k="price" class="' + (isS('el', 'price') ? 'sel' : '') + '" style="position:absolute;left:16px;bottom:16px;max-width:calc(100% - 32px);padding:8px 14px;border-radius:8px;background:#fff;color:' + ((X.price || {}).c || '#0A0A0A') + ';font-size:' + (z(17) + ((X.price || {}).dz || 0)) + 'px;font-weight:' + ((X.price || {}).b === 0 ? 400 : 600) + '">' + esc(f.price) + '</div>';
        return blk('photo', '<div data-el="photo" class="' + (isS('el', 'photo') ? 'sel' : '') + '" style="position:relative;height:' + (mob ? 200 : (edge ? 360 : 300)) + 'px;border-radius:' + r + 'px;background:#D9D9DE url(' + IMG[P.ph % IMG.length] + ') center/cover">' + chip + '</div>', 'left', edge ? 0 : hx); },
      intro:() => { const x = X.cta || {}; if(x.hide) return blk('intro', rule + '<div style="height:1px"></div>', 'center', 0);
        return blk('intro', T('heading', 32, 700, '#0A0A0A', 'line-height:1.15') + T('body', 16, 400, '#404040', 'line-height:1.6;margin:' + z(16) + 'px auto 0;max-width:520px') +
          '<div style="margin-top:' + z(28) + 'px"><div data-el="cta" data-k="cta" class="' + (isS('el', 'cta') ? 'sel' : '') + '" style="display:inline-block;max-width:100%;padding:' + z(16) + 'px ' + z(40) + 'px;border-radius:' + (x.r != null ? x.r : 999) + 'px;background:' + A + ';color:' + (x.c || '#FFFFFF') + ';font-size:' + (z(18) + (x.dz || 0)) + 'px;font-weight:600">' + esc(f.cta) + '</div></div>', 'center'); },
      feats:() => blk('feats', T('fhead', 28, 700, '#0A0A0A', 'margin-bottom:' + z(28) + 'px') +
        '<div class="em-feats" style="' + (mob ? 'grid-template-columns:minmax(0,1fr)' : '') + '">' + [['f1', 'bed'], ['f2', 'bathtub'], ['f3', 'ruler']].map(a => '<div class="em-feat"><i class="ph ph-' + a[1] + '" style="color:' + A + '"></i>' + T(a[0], 16, 500, '#0A0A0A') + '</div>').join('') + '</div>', 'center'),
      tiles:() => blk('tiles', '<div class="em-feats" style="gap:16px;' + (mob ? 'grid-template-columns:minmax(0,1fr)' : 'grid-template-columns:repeat(2,minmax(0,1fr))') + '">' + [['1', 'house-line'], ['2', 'map-pin'], ['3', 'chart-line-up'], ['4', 'calendar-check']].map(a => '<div class="em-feat" style="background:#fff;align-items:flex-start;text-align:left;padding:' + z(24) + 'px;gap:' + z(10) + 'px"><i class="ph ph-' + a[1] + '" style="color:' + A + ';font-size:' + z(36) + 'px"></i>' + T('t' + a[0], 20, 700, '#0A0A0A') + T('d' + a[0], 15, 400, '#404040', 'line-height:1.55') + '</div>').join('') + '</div>'),
      agent:() => { const ini = (f.name || 'A').split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
        return blk('agent', '<div style="display:flex;align-items:center;gap:16px"><div style="flex:none;width:56px;height:56px;border-radius:50%;background:#EEEFFE;color:' + A + ';display:grid;place-items:center;font-size:18px;font-weight:600">' + esc(ini) + '</div><div style="min-width:0;flex:1">' +
          T('name', 18, 600, '#0A0A0A') + T('firm', 14, 400, '#737373') + T('phone', 15, 400, '#404040', 'margin-top:6px') + T('email', 15, 400, A) + '</div></div>'); },
      foot:() => blk('foot', T('foot', 12.5, 400, '#737373', 'line-height:1.5'), 'center')
    };
    return '<div class="em-mail' + (o.edit ? ' edit' : '') + '" style="width:' + (mob ? 375 : 640) + 'px;background:' + P.bg + ';font-family:' + FF + ';color:#0A0A0A">' + P.order.map(id => B[id]()).join('') + '</div>';
  }
  const fit = () => app.querySelectorAll('.em-fit').forEach(w => { const i = w.firstElementChild, bw = +w.dataset.bw; if(!i || !w.clientWidth) return; const k = w.clientWidth / bw;
    i.style.width = bw + 'px'; i.style.transform = 'scale(' + k + ')'; w.style.height = Math.min(i.offsetHeight * k, +w.dataset.mh || 9999) + 'px'; });
  const fitWrap = (html, bw, mh, cls) => '<div class="em-fit' + (cls ? ' ' + cls : '') + '" data-bw="' + bw + '" data-mh="' + (mh || '') + '"><div class="em-fitin">' + html + '</div></div>';

  /* ---------- shell ---------- */
  const app = document.createElement('div'); app.className = 'fl-app em-app fl-editing'; app.id = 'em-app'; host.appendChild(app);
  app.innerHTML = '<div class="fl-top" id="em-top"></div><div class="fl-body" id="em-body"></div>';
  const $ = id => app.querySelector('#' + id);
  const ic = n => '<i class="ph ph-' + n + '"></i>';
  const elOf = id => app.querySelector('#em-canvas [data-el="' + id + '"]');
  const kindOf = id => id === 'photo' ? 'img' : id === 'cta' ? 'btn' : 'text';
  const melsug = t => '<div class="melsug"><span class="who"><img src="assets/mel-icon.svg" alt="">Mel suggests</span><p>' + t + '</p></div>';

  function renderTop(){
    const P = S.P;
    $('em-top').innerHTML = '<button class="fl-tpanel" data-em="sidetg" title="' + (S.sideOff ? 'Show' : 'Hide') + ' Mel panel" aria-label="Toggle Mel panel"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16"/></svg></button>' +
      '<div class="fl-crumb"><button class="fl-back" data-em="exit" title="Back" aria-label="Back">' + ic('arrow-left') + '</button><b>' + esc(addrOf(lst(P.listing))) + '</b><i>·</i><span>Emailer</span><i>·</i><span>' + esc(LAYOUTS[P.layout]) + '</span></div>' +
      '<div class="fl-sp"></div><button class="fl-tico" data-em="close" title="Close" aria-label="Close">' + ic('x') + '</button>';
  }
  const RAIL = [['templates','Template','#5A5FF2','<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M3 9h18M9 21V9"/>'],
    ['sections','Sections','#5A5FF2','<rect x="3" y="3" width="18" height="6" rx="2"/><rect x="3" y="12" width="18" height="9" rx="2"/>'],
    ['photos','Photo','#2563EB','<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="9" cy="9" r="1.6"/><path d="m21 15-5-5L5 21"/>'],
    ['text','Text','#7C3AED','<path d="M5 6V4h14v2M12 4v16M9 20h6"/>'],
    ['brand','Brand','#EA580C','<circle cx="12" cy="12" r="9"/><circle cx="8.5" cy="10" r="1"/><circle cx="12" cy="7.5" r="1"/><circle cx="15.5" cy="10" r="1"/>']];
  function renderBody(){
    $('em-body').innerHTML = '<div class="pkedit open fl-pks"><aside class="side"><nav class="mrail" aria-label="Sections">' + RAIL.map(r => '<button type="button" class="mri' + (S.tool === r[0] ? ' on' : '') + '" data-em="tool" data-v="' + r[0] + '" style="--ri:' + r[2] + '"><span class="i"><svg viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="fill:none;stroke:currentColor">' + r[3] + '</svg></span>' + r[1] + '</button>').join('') + '</nav>' +
      '<div class="mcol"><div class="sbody" id="em-panel"></div><div class="melchat"><div class="melchat-box"><input class="melchat-in" id="em-melq" type="text" placeholder="Tell Mel what to change" aria-label="Tell Mel what to change" autocomplete="off"><button class="melchat-ic melchat-mic" type="button" data-em="melgo" title="Send to Mel" aria-label="Send to Mel"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="2.5" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M8.5 21h7"/></svg></button></div></div></div></aside></div>' +
      '<div class="fl-stage" id="em-stage"><div class="fl-ctx on" id="em-ctx"></div><div class="fl-canvas" id="em-canvas"></div>' +
      '<div class="fl-acts"><button type="button" class="ico" data-em="undo" title="Undo" aria-label="Undo">' + ic('arrow-counter-clockwise') + '</button><button type="button" class="ico" data-em="redo" title="Redo" aria-label="Redo">' + ic('arrow-clockwise') + '</button><span class="sep" aria-hidden="true"></span><button type="button" data-em="regen">' + ic('arrows-clockwise') + '<span class="mlab">Regenerate</span></button><span class="sep" aria-hidden="true"></span><button type="button" data-em="test">' + ic('paper-plane-tilt') + 'Send test</button><button type="button" data-em="save">' + ic('books') + 'Save</button><span class="sep" aria-hidden="true"></span><button type="button" class="pri" data-em="clients">' + ic('paper-plane-tilt') + 'Send to clients</button></div></div>' +
      '<aside class="fl-right em-right" id="em-right" hidden></aside>';
    app.classList.toggle('fl-sideoff', S.sideOff);
    renderPanel(); renderCtx(); renderCanvas(); renderTest();
  }

  /* ---------- Mel panel ---------- */
  function renderPanel(){
    const P = S.P, h2 = $('em-panel'); if(!h2) return; let h = '';
    if(S.tool === 'templates'){
      h = melsug(P.layout === 'photo' ? 'Photo first sells the house before a word is read. Invite leads with the headline if the message matters more.' : 'Invite puts the headline first and the photo right under it. Photo first is the stronger pick when the house is the story.') +
        '<span class="seclab">Email type</span><div class="aichips" style="margin-top:0">' + TYPES.map(t => '<button class="msvchip' + (S.ttype === t.k ? ' on' : '') + '" type="button" data-em="ttype" data-v="' + t.k + '">' + t.n + '</button>').join('') + '</div>' +
        '<span class="seclab" style="margin-top:8px">Template</span><div class="msvtpls">' + Object.keys(LAYOUTS).map(l => { const q = mkPage(S.ttype, l, P.listing); q.acc = P.acc; q.font = P.font; if(S.ttype === P.type && l === P.layout) q.f = P.f;
        return '<button class="msvtpl' + (P.layout === l && P.type === S.ttype ? ' on' : '') + '" type="button" data-em="applytpl" data-v="' + l + '"><span class="lth">' + fitWrap(mailHTML(q), 640, 250) + '</span><i>' + LAYOUTS[l] + '</i></button>'; }).join('') + '</div>';
    } else if(S.tool === 'sections'){
      h = melsug('Reorder or hide any section. Hidden sections stay here so you can bring them back.') + '<span class="seclab">Sections</span>' +
        P.order.map((id, i) => { const off = (P.bs[id] || {}).hide; return '<div class="fl-hrow' + (off ? ' off' : '') + '"><span>' + BLK[id] + '</span><div class="em-ra">' +
          '<button class="fl-lyb" type="button" data-em="mv" data-v="' + id + ':-1" title="Move up" aria-label="Move up"' + (i === 0 ? ' disabled' : '') + '>' + ic('arrow-up') + '</button>' +
          '<button class="fl-lyb" type="button" data-em="mv" data-v="' + id + ':1" title="Move down" aria-label="Move down"' + (i === P.order.length - 1 ? ' disabled' : '') + '>' + ic('arrow-down') + '</button>' +
          '<button class="fl-lyb" type="button" data-em="vis" data-v="' + id + '" title="' + (off ? 'Show' : 'Hide') + '" aria-label="' + (off ? 'Show' : 'Hide') + '">' + ic(off ? 'eye-slash' : 'eye') + '</button></div></div>'; }).join('');
    } else if(S.tool === 'photos'){
      h = melsug('Photo ' + (P.ph + 1) + ' is the ' + esc(PHN[P.ph].toLowerCase()) + '. Pick another to swap it in the email.') +
        '<div class="pv4-tier"><span class="pv4-tlab">HERO PHOTO · ' + esc(PHN[P.ph].toUpperCase()) + '</span><span class="pv4-tct">1 of ' + IMG.length + ' selected</span></div><div class="pv4-grid">' +
        IMG.map((src, i) => '<button class="pv4-tile' + (P.ph === i ? ' sel' : '') + '" type="button" data-em="photo" data-v="' + i + '"><span class="pv4-ph" style="background-image:url(\'' + src + '\')">' + (P.ph === i ? '<span class="pv4-check"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg></span>' : '') + '</span><span class="pv4-cap">' + esc(PHN[i]) + '</span></button>').join('') + '</div>';
    } else if(S.tool === 'text'){
      h = melsug('Edit any line here, or click it in the email. Switching templates keeps your wording.') +
        '<span class="seclab" style="margin-top:6px">Listing</span><select class="fl-in" data-eml="listing">' + LIST.map(l => '<option value="' + l.id + '"' + (l.id === P.listing ? ' selected' : '') + '>' + esc(addrOf(l)) + '</option>').join('') + '</select>' +
        fieldsOf(P).map(a => '<span class="seclab" style="margin-top:6px">' + a[1] + '</span>' + (LONG[a[0]] ? '<textarea class="fl-in fl-ta" data-emf="' + a[0] + '">' + esc(P.f[a[0]]) + '</textarea>' : '<input class="fl-in" data-emf="' + a[0] + '" value="' + esc(P.f[a[0]]) + '">')).join('');
    } else {
      h = melsug('Your accent and font apply to the whole email.') +
        '<span class="seclab">Accent</span><div class="fl-sw">' + ACC.map(c => '<button class="' + (P.acc === c ? 'on' : '') + '" type="button" data-em="setc" data-g="bc" data-v="' + c + '" style="background:' + c + '" aria-label="Accent ' + c + '"></button>').join('') + '</div>' +
        '<span class="seclab" style="margin-top:8px">Page color</span><div class="fl-sw">' + BGS.map(c => '<button class="' + (P.bg === c ? 'on' : '') + '" type="button" data-em="setc" data-g="pgc" data-v="' + c + '" style="background:' + c + '" aria-label="Page ' + c + '"></button>').join('') + '</div>' +
        '<span class="seclab" style="margin-top:8px">Font</span><div class="aichips" style="margin-top:0">' + Object.keys(FONTS).map(k => '<button class="msvchip' + (P.font === k ? ' on' : '') + '" type="button" data-em="font" data-v="' + k + '">' + FONTS[k][0] + '</button>').join('') + '</div>';
    }
    h2.innerHTML = h; fit();
  }

  /* ---------- contextual toolbar ---------- */
  const pw = (k, btn, body) => '<div class="fl-popw">' + btn + (S.pop === k ? '<div class="fl-pop">' + body + '</div>' : '') + '</div>';
  const cd = '<i class="fl-cd"></i>';
  const cb = (a, i, t, on, ti, v) => '<button class="fl-cb' + (on ? ' on' : '') + '" data-em="' + a + '"' + (v ? ' data-v="' + v + '"' : '') + ' title="' + (ti || t || '') + '" aria-label="' + (ti || t || a) + '">' + (i ? ic(i) : '') + (t ? '<span>' + t + '</span>' : '') + '</button>';
  const swb = (k, col, t) => '<button class="fl-cb" data-em="pop" data-v="' + k + '" title="' + t + '" aria-label="' + t + '"><i class="fl-csw" style="background:' + col + '"></i><span>' + t + '</span></button>';
  const swatches = (list, cur, g) => '<div class="fl-sw">' + list.map(c => '<button class="' + (cur === c ? 'on' : '') + '" data-em="setc" data-g="' + g + '" data-v="' + c + '" style="background:' + c + '" aria-label="' + c + '"></button>').join('') + '</div>' +
    '<label class="fl-cust"><input type="color" data-emc="' + g + '" value="' + (cur && cur[0] === '#' && cur.length === 7 ? cur : '#5A5FF2') + '">Custom color</label>';
  const rng = (k, t, v, max) => '<div class="fl-pl">' + t + '<span id="em-rv">' + v + '</span></div><input type="range" data-emr="' + k + '" min="0" max="' + max + '" value="' + v + '">';
  const blkOf = id => (S.P.bs[id] || (S.P.bs[id] = {}));
  const fxOf = id => (S.P.fx[id] || (S.P.fx[id] = {}));
  function renderCtx(){
    const c = $('em-ctx'); if(!c) return; const P = S.P, s = S.sel; let h = '';
    if(!s){
      h = '<span class="fl-cl">Email</span>' + cd + pw('pgc', swb('pgc', P.bg, 'Page color'), swatches(BGS, P.bg, 'pgc')) + cb('tool', 'layout', 'Templates', false, 'Change template', 'templates') + cb('tool', 'stack', 'Sections', false, 'Reorder sections', 'sections');
    } else if(s.t === 'blk'){
      const b = P.bs[s.id] || {}, bg = b.bg || DBG[s.id] || '#FFFFFF', pad = b.pad != null ? b.pad : PV[s.id], i = P.order.indexOf(s.id);
      h = '<span class="fl-cl">' + BLK[s.id] + '</span>' + cd + pw('bgc', swb('bgc', bg, 'Background'), swatches(BGS.concat(['#FFFFFF']).filter((v, j, a) => a.indexOf(v) === j), bg, 'bgc')) +
        pw('pad', cb('pop', 'arrows-out-line-vertical', 'Spacing', false, 'Spacing', 'pad'), rng('pad', 'Vertical spacing', pad, 120)) +
        pw('rad', cb('pop', 'selection', 'Corners', false, 'Corner radius', 'rad'), rng('rad', 'Corner radius', b.rad || 0, 40)) +
        (s.id === 'photo' ? '' : cb('bal', 'text-align-' + (b.al === 'center' ? 'center' : b.al === 'right' ? 'right' : 'left'), '', false, 'Alignment')) + cd +
        cb('mvsel', 'arrow-up', '', false, 'Move up', '-1') + cb('mvsel', 'arrow-down', '', false, 'Move down', '1') + cb('del', 'trash', '', false, 'Hide section');
      if(i === 0) h = h.replace('data-v="-1"', 'data-v="-1" disabled'); if(i === P.order.length - 1) h = h.replace('data-v="1"', 'data-v="1" disabled');
    } else {
      const k = kindOf(s.id), x = P.fx[s.id] || {}, el = elOf(s.id);
      if(k === 'img'){
        h = '<span class="fl-cl">Photo</span>' + cd + pw('rep', cb('pop', 'swap', 'Replace', false, 'Replace photo', 'rep'), '<div class="fl-grid" style="width:200px">' + IMG.map((src, j) => '<button class="fl-ph-photo' + (P.ph === j ? ' on' : '') + '" data-em="photo" data-v="' + j + '" style="background-image:url(\'' + src + '\')" aria-label="' + esc(PHN[j]) + '"></button>').join('') + '</div>') +
          pw('rad', cb('pop', 'selection', 'Corners', false, 'Corner radius', 'rad'), rng('rad', 'Corner radius', x.r != null ? x.r : (P.layout === 'photo' ? 0 : 12), 40)) + cb('del', 'trash', '', false, 'Hide photo');
      } else if(k === 'btn'){
        h = '<span class="fl-cl">Button</span>' + cd + pw('link', cb('pop', 'link-simple', 'Edit link', false, 'Edit link', 'link'),
          '<span class="fl-pl" style="margin-bottom:6px">Text</span><input class="fl-in" data-emi="ctatext" value="' + esc(P.f.cta) + '"><span class="fl-pl" style="margin:10px 0 6px">Enter a link</span><input class="fl-in" data-emi="link" placeholder="https://" value="' + esc(P.links.cta) + '">' +
          '<button class="fl-btn pri" data-em="pop" data-v="link" style="width:100%;justify-content:center;margin-top:12px;height:36px">Done</button>') +
          pw('bc', swb('bc', P.acc, 'Color'), swatches(ACC, P.acc, 'bc')) + pw('rad', cb('pop', 'selection', 'Corners', false, 'Corner radius', 'rad'), rng('rad', 'Corner radius', Math.min(x.r != null ? x.r : 999, 40), 40)) + cb('del', 'trash', '', false, 'Hide button');
      } else {
        const sz = el ? Math.round(parseFloat(getComputedStyle(el).fontSize)) : '', bold = el ? +getComputedStyle(el).fontWeight >= 600 : false, al = x.al || (el ? getComputedStyle(el).textAlign : 'left');
        h = '<span class="fl-cl">' + esc((FIELDS.find(a => a[0] === s.id) || [0, 'Text'])[1]) + '</span>' + cd + '<div class="fl-szbox"><button data-em="szd" title="Decrease font size" aria-label="Decrease font size">' + ic('minus') + '</button><input data-emz value="' + sz + '" aria-label="Font size"><button data-em="szu" title="Increase font size" aria-label="Increase font size">' + ic('plus') + '</button></div>' +
          pw('tc', swb('tc', x.c || (el ? getComputedStyle(el).color : '#0A0A0A'), 'Color'), swatches(TXC, x.c, 'tc')) + cb('eb', 'text-b', '', bold, 'Bold') +
          cb('eal', 'text-align-' + (al === 'center' ? 'center' : al === 'right' || al === 'end' ? 'right' : 'left'), '', false, 'Alignment') + cb('edit', 'pencil-simple', '', false, 'Edit text') + cb('del', 'trash', '', false, 'Hide text');
      }
    }
    c.innerHTML = h;
  }

  /* ---------- canvas ---------- */
  function renderCanvas(){
    const cv = $('em-canvas'); if(!cv) return;
    cv.innerHTML = '<div class="em-zoom" id="em-zoom">' + mailHTML(S.P, { edit:true }) + '</div>'; fitZoom();
  }
  function fitZoom(){ const cv = $('em-canvas'), w = $('em-zoom'); if(!cv || !w) return; const cs = getComputedStyle(cv), avail = cv.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight); if(avail > 0) w.style.zoom = Math.min(.75, Math.max(.3, avail / 640)); }
  new ResizeObserver(() => { if(app.classList.contains('open')) fitZoom(); }).observe(app);
  const refresh = () => { renderCanvas(); renderCtx(); };

  /* ---------- test-send panel ---------- */
  function renderTest(){
    const r = $('em-right'); if(!r) return; const t = S.test, P = S.P; r.hidden = !t; app.classList.toggle('em-testing', !!t); if(!t){ fitZoom(); return; }
    const mob = t.dev === 'mob', cl = t.mode === 'clients', SEG = [['buyers','Active buyers'],['sellers','Sellers'],['past','Past clients'],['sphere','Sphere of influence']], sg = t.seg || {}, nsel = SEG.filter(x => sg[x[0]]).length;
    r.innerHTML = '<div class="fl-rh"><button class="fl-back" data-em="closetest" title="Back" aria-label="Back">' + ic('arrow-left') + '</button><b>' + (cl ? 'Send to clients' : 'Send test email') + '</b><button class="fl-tico" data-em="closetest" title="Close" aria-label="Close" style="width:32px;height:32px;border:0">' + ic('x') + '</button></div>' +
      '<div class="fl-rs"><div class="rds-tabs"><div class="rds-tabs__list" role="tablist" aria-label="Preview device">' +
      '<button type="button" class="rds-tab" role="tab" data-em="dev" data-v="desk" aria-selected="' + !mob + '">' + ic('desktop') + 'Desktop</button><button type="button" class="rds-tab" role="tab" data-em="dev" data-v="mob" aria-selected="' + mob + '">' + ic('device-mobile') + 'Mobile</button></div></div>' +
      '<div class="em-pvbox">' + fitWrap(mailHTML(P, { mob }), mob ? 375 : 640, 236, mob ? 'ph-frame' : '') + '</div>' +
      '<span class="em-lbl">Subject line</span><input class="fl-in" data-ems value="' + esc(P.subj) + '">' +
      (cl ? '<span class="em-lbl">Send to</span><div class="em-segs">' + SEG.map(x => '<button type="button" class="em-seg' + (sg[x[0]] ? ' on' : '') + '" data-em="seg" data-v="' + x[0] + '" aria-pressed="' + !!sg[x[0]] + '">' + ic(sg[x[0]] ? 'check-circle' : 'circle') + x[1] + '</button>').join('') + '</div>'
        : '<span class="em-lbl">To</span><input class="fl-in" value="' + esc(P.f.email) + '" disabled>') + '</div>' +
      '<div class="em-rfoot"><button class="fl-btn pri" data-em="' + (cl ? 'sendclients' : 'sendtest') + '"' + (cl && !nsel ? ' disabled' : '') + ' style="width:100%;height:40px;justify-content:center">' + (cl ? 'Send to clients' : 'Send test email') + '</button></div>';
    const pb = r.querySelector('.em-pvbox'), fw = r.querySelector('.em-fit'); fw.style.width = (mob ? 150 : Math.max(200, pb.clientWidth - 28 || 300)) + 'px';
    fit(); fitZoom();
  }

  /* ---------- actions ---------- */
  const selBlk = el => { const b = el.closest('[data-blk]'); return b ? b.dataset.blk : null; };
  function setSel(s){ S.sel = s; S.pop = null; refresh(); }
  function setColor(g, v){
    const P = S.P; commit();
    if(g === 'pgc') P.bg = v; else if(g === 'bc') P.acc = v; else if(g === 'bgc' && S.sel) blkOf(S.sel.id).bg = v; else if(g === 'tc' && S.sel) fxOf(S.sel.id).c = v;
    refresh(); if(S.tool === 'brand') renderPanel(); renderTest();
  }
  function startEdit(id){
    const el = elOf(id); if(!el || S.editing) return; commit(); S.editing = true; el.contentEditable = 'true'; el.focus();
    const r = document.createRange(); r.selectNodeContents(el); const sl = getSelection(); sl.removeAllRanges(); sl.addRange(r);
    el.addEventListener('keydown', ev => { if((ev.key === 'Enter' && !ev.shiftKey) || ev.key === 'Escape'){ ev.preventDefault(); el.blur(); } });
    el.addEventListener('blur', () => { S.editing = false; el.contentEditable = 'false'; S.P.f[id] = el.innerText.replace(/\s*\n+\s*/g, ' ').trim(); refresh(); if(S.tool === 'text') renderPanel(); renderTest(); }, { once:true });
  }
  const melAsk = () => { const q = $('em-melq'), v = (q.value || '').trim(); if(!v) return; q.value = ''; regen(true, v); };
  function regen(fromMel, said){
    commit(); const P = S.P, a = ALT[P.type], pick = a[S.alt++ % a.length], d = defaults(P.type, lst(P.listing));
    P.f.headline = pick[0]; P.f.sub = pick[1] || d.sub; P.ph = (P.ph + 1) % IMG.length; S.sel = null; refresh(); renderPanel(); renderTest();
    toast(fromMel ? 'Mel rewrote the headline' : 'Regenerated', fromMel ? '“' + said + '” — new headline, subhead and photo. Undo to go back.' : 'Fresh headline, subhead and photo. Undo to go back.');
  }
  const moveBlk = (id, d) => { const o = S.P.order, i = o.indexOf(id), j = i + d; if(j < 0 || j >= o.length) return; commit(); o.splice(j, 0, o.splice(i, 1)[0]); refresh(); renderPanel(); renderTest(); };
  function delSel(){ if(!S.sel) return; commit(); (S.sel.t === 'blk' ? blkOf(S.sel.id) : fxOf(S.sel.id)).hide = true; S.sel = null; S.pop = null; refresh(); renderPanel(); renderTest(); toast('Hidden', 'Undo, or bring it back from Sections.'); }
  function closeAll(){ app.classList.remove('open'); S.test = null; S.pop = null; S.sel = null; renderTest(); }

  app.addEventListener('click', e => {
    const P = S.P, t = e.target;
    if(S.pop && !t.closest('.fl-popw')){ S.pop = null; renderCtx(); }
    const cv = t.closest('#em-canvas');
    if(cv){
      if(S.editing) return;
      const el = t.closest('[data-el]');
      if(el){ const id = el.dataset.el; if(S.sel && S.sel.t === 'el' && S.sel.id === id && kindOf(id) === 'text') return startEdit(id); return setSel({ t:'el', id }); }
      const b = t.closest('[data-blk]'); return setSel(b ? { t:'blk', id:b.dataset.blk } : null);
    }
    const b = t.closest('[data-em]'); if(!b) return; const a = b.dataset.em, v = b.dataset.v;
    switch(a){
      case 'exit': case 'close': closeAll(); return;
      case 'sidetg': S.sideOff = !S.sideOff; app.classList.toggle('fl-sideoff', S.sideOff); renderTop(); fitZoom(); return;
      case 'tool': S.tool = v; app.querySelectorAll('.fl-pks .mri').forEach(x => x.classList.toggle('on', x.dataset.v === v)); renderPanel(); return;
      case 'ttype': S.ttype = v; renderPanel(); return;
      case 'applytpl': { commit(); const keep = {}; ['brand','web','name','firm','phone','email'].forEach(k => { keep[k] = P.f[k]; }); const n = mkPage(S.ttype, v, P.listing); Object.assign(n.f, keep); n.acc = P.acc; n.bg = P.bg; n.font = P.font; n.ph = P.ph; S.P = n; S.sel = null; renderTop(); refresh(); renderPanel(); renderTest(); return; }
      case 'font': commit(); P.font = v; refresh(); renderPanel(); renderTest(); return;
      case 'photo': commit(); P.ph = +v; S.pop = null; refresh(); if(S.tool === 'photos') renderPanel(); renderTest(); return;
      case 'setc': setColor(b.dataset.g, v); return;
      case 'pop': S.pop = S.pop === v ? null : v; renderCtx(); return;
      case 'mv': { const q = v.split(':'); moveBlk(q[0], +q[1]); return; }
      case 'mvsel': if(S.sel) moveBlk(S.sel.id, +v); return;
      case 'vis': { commit(); const x = blkOf(v); x.hide = !x.hide; refresh(); renderPanel(); renderTest(); return; }
      case 'del': delSel(); return;
      case 'bal': { if(!S.sel) return; commit(); const x = blkOf(S.sel.id); x.al = x.al === 'center' ? 'right' : x.al === 'right' ? 'left' : 'center'; refresh(); renderTest(); return; }
      case 'eal': { if(!S.sel) return; commit(); const x = fxOf(S.sel.id), el = elOf(S.sel.id), cur = x.al || (el ? getComputedStyle(el).textAlign : 'left'); x.al = cur === 'center' ? 'right' : cur === 'right' || cur === 'end' ? 'left' : 'center'; refresh(); renderTest(); return; }
      case 'eb': { if(!S.sel) return; commit(); const x = fxOf(S.sel.id), el = elOf(S.sel.id); x.b = el && +getComputedStyle(el).fontWeight >= 600 ? 0 : 1; refresh(); renderTest(); return; }
      case 'szd': case 'szu': { if(!S.sel) return; commit(); const x = fxOf(S.sel.id); x.dz = (x.dz || 0) + (a === 'szu' ? 2 : -2); refresh(); renderTest(); return; }
      case 'edit': if(S.sel) startEdit(S.sel.id); return;
      case 'undo': if(S.hist.length){ S.fut.push(snap()); restore(S.hist.pop()); renderTop(); } return;
      case 'redo': if(S.fut.length){ S.hist.push(snap()); restore(S.fut.pop()); renderTop(); } return;
      case 'regen': regen(); return;
      case 'melgo': melAsk(); return;
      case 'save': toast('Saved to library', P.nm); return;
      case 'test': S.test = S.test || { dev:'desk' }; S.pop = null; renderCtx(); renderTest(); return;
      case 'clients': S.pop = null; renderCtx(); shareOpen(); return;
      case 'seg': S.test.seg[v] = !S.test.seg[v]; renderTest(); return;
      case 'sendclients': { const n = Object.keys(S.test.seg).filter(k => S.test.seg[k]).length; if(!n) return; toast('Email sent to clients', P.subj); S.test = null; renderTest(); return; }
      case 'closetest': S.test = null; renderTest(); return;
      case 'dev': S.test.dev = v; renderTest(); return;
      case 'sendtest': toast('Test email sent', 'To ' + P.f.email + ' · ' + P.subj); S.test = null; renderTest(); return;
    }
  });
  app.addEventListener('focusin', e => { const t = e.target; if(t.matches && t.matches('[data-emf],[data-emi],[data-ems],[data-emz]') && !t.dataset.cm){ t.dataset.cm = '1'; commit(); } });
  app.addEventListener('focusout', e => { const t = e.target; if(t.dataset && t.dataset.cm) delete t.dataset.cm; });
  app.addEventListener('pointerdown', e => { const t = e.target; if(t.matches && t.matches('[data-emr]') && !t.dataset.cm){ t.dataset.cm = '1'; commit(); } });
  app.addEventListener('pointerup', e => { const t = e.target; if(t.dataset && t.dataset.cm) delete t.dataset.cm; });
  app.addEventListener('input', e => {
    const t = e.target, P = S.P;
    if(t.dataset.emf){ P.f[t.dataset.emf] = t.value; const el = elOf(t.dataset.emf); if(el) el.textContent = t.value; else renderCanvas(); renderTest(); return; }
    if(t.dataset.ems !== undefined){ P.subj = t.value; return; }
    if(t.dataset.emi){ if(t.dataset.emi === 'link') P.links.cta = t.value; else { P.f.cta = t.value; const el = elOf('cta'); if(el) el.textContent = t.value; } renderTest(); return; }
    if(t.dataset.emr && S.sel){ const v = +t.value, k = t.dataset.emr, rv = $('em-rv'); if(rv) rv.textContent = v;
      if(k === 'pad') blkOf(S.sel.id).pad = v;
      else if(S.sel.t === 'blk') blkOf(S.sel.id).rad = v;
      else fxOf(S.sel.id).r = (S.sel.id === 'cta' && v >= 40) ? 999 : v;
      renderCanvas(); renderTest(); return; }
  });
  app.addEventListener('change', e => {
    const t = e.target;
    if(t.dataset.emc){ setColor(t.dataset.emc, t.value); return; }
    if(t.dataset.emz !== undefined && S.sel){ const el = elOf(S.sel.id), x = fxOf(S.sel.id), cur = el ? parseFloat(getComputedStyle(el).fontSize) : 16, v = Math.max(8, Math.min(120, +t.value || cur)); x.dz = (x.dz || 0) + (v - cur); refresh(); renderTest(); return; }
    if(t.dataset.eml){ commit(); const n = mkPage(S.P.type, S.P.layout, t.value); const keep = {}; ['brand','web','name','firm','phone','email'].forEach(k => { keep[k] = S.P.f[k]; }); Object.assign(n.f, keep); n.acc = S.P.acc; n.bg = S.P.bg; n.font = S.P.font; S.P = n; S.sel = null; renderTop(); refresh(); renderPanel(); renderTest(); }
  });

  /* Share / Send-to-clients v2 — two-panel, unified grouped dropdown */
  const RECIP=[
    {id:'sd',nm:'San Diego clients',ct:48,g:'list'},{id:'ba',nm:'Bay Area buyers',ct:124,g:'list'},{id:'nv',nm:'Noe Valley sphere',ct:31,g:'list'},{id:'nl',nm:'Newsletter subscribers',ct:892,g:'list'},{id:'pc2',nm:'Past clients',ct:67,g:'list'},
    {id:'c1',nm:'Spring open house blast',ct:210,g:'camp'},{id:'c2',nm:'Q4 market update',ct:340,g:'camp'},{id:'c3',nm:'Holiday greeting',ct:560,g:'camp'},{id:'c4',nm:'New listing alerts',ct:180,g:'camp'},
    {id:'fb',nm:'Buyers',g:'filt'},{id:'fs',nm:'Sellers',g:'filt'},{id:'fa',nm:'Active leads',g:'filt'},{id:'fp',nm:'Past clients',g:'filt'},{id:'fi',nm:'Sphere of influence',g:'filt'},
    {id:'p1',nm:'Sarah Chen',em:'sarah.chen@email.com',g:'ppl'},{id:'p2',nm:'Michael Ross',em:'m.ross@email.com',g:'ppl'},{id:'p3',nm:'Priya Shah',em:'priya@email.com',g:'ppl'},{id:'p4',nm:'Daniel Lee',em:'daniel.lee@email.com',g:'ppl'},{id:'p5',nm:'Amanda Brooks',em:'amanda.b@email.com',g:'ppl'},{id:'p6',nm:'Olivia Martin',em:'olivia.m@email.com',g:'ppl'},{id:'p7',nm:'James Wilson',em:'j.wilson@email.com',g:'ppl'},{id:'p8',nm:'Lisa Torres',em:'l.torres@email.com',g:'ppl'}
  ];
  const RGLBL={list:'Smart lists',camp:'Campaigns',filt:'Filters',ppl:'Clients'};
  const RGICO={list:'i-list',camp:'i-camp',filt:'i-filt',ppl:'i-ppl'};
  const RGTAG={list:'',camp:'t-camp',filt:'t-filt',ppl:'t-ppl'};
  const rinit=n=>n.split(/\s+/).map(w=>w[0]).join('').slice(0,2).toUpperCase();
  const RSVG={x:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',chev:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="m6 9 6 6 6-6"/></svg>',search:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>',send:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4z"/></svg>'};
  function shareOpen(){
    document.querySelectorAll('#shm').forEach(function(e){e.remove();});
    var rs={sel:[],emails:[],open:false,q:''};
    var w=document.createElement('div');w.id='shm';w.className='shm';w.setAttribute('role','dialog');w.setAttribute('aria-modal','true');document.body.appendChild(w);
    var rclose=function(){w.remove();document.removeEventListener('keydown',rkey,true);};
    var rkey=function(e){if(e.key==='Escape'){e.stopPropagation();if(rs.open){rs.open=false;rdraw();}else rclose();}};
    document.addEventListener('keydown',rkey,true);
    var rhas=function(){return rs.sel.length||rs.emails.length;};
    var rsubj=S.P.subj||S.P.nm||'Email';
    var rtotal=function(){var n=0;rs.sel.forEach(function(id){var it=RECIP.find(function(x){return x.id===id;});if(it&&it.ct)n+=it.ct;else if(it)n+=1;});n+=rs.emails.length;return n;};
    function rdraw(focusId){
      var q=rs.q.toLowerCase();
      var pills=rs.sel.map(function(id){var it=RECIP.find(function(x){return x.id===id;});if(!it)return '';return '<span class="shm-tag '+RGTAG[it.g]+'">'+esc(it.nm)+'<button data-a="rm" data-v="'+id+'">'+RSVG.x+'</button></span>';}).join('')+rs.emails.map(function(e,i){return '<span class="shm-tag t-ppl">'+esc(e)+'<button data-a="rmem" data-v="'+i+'">'+RSVG.x+'</button></span>';}).join('');
      var dd='';
      if(rs.open){
        dd='<div class="shm-dd"><div class="shm-dd-search"><span class="shm-si">'+RSVG.search+'</span><input id="shm-q" type="text" placeholder="Search lists, campaigns, filters or clients" autocomplete="off" value="'+esc(rs.q)+'"></div>';
        var any=false;
        ['list','camp','filt','ppl'].forEach(function(g){
          var items=RECIP.filter(function(it){return it.g===g&&rs.sel.indexOf(it.id)<0&&(!q||it.nm.toLowerCase().indexOf(q)>=0||(it.em&&it.em.toLowerCase().indexOf(q)>=0));});
          if(!items.length)return;any=true;
          dd+='<div class="shm-dd-sec">'+RGLBL[g]+'</div>';
          items.forEach(function(it){
            var ico=g==='ppl'?'<span class="ico i-ppl" style="border-radius:99px;font-size:10px;font-weight:600">'+rinit(it.nm)+'</span>':'<span class="ico '+RGICO[g]+'"><i class="ph ph-'+(g==='list'?'list-checks':g==='camp'?'megaphone':'funnel')+'"></i></span>';
            dd+='<div class="shm-dd-row" data-a="add" data-v="'+it.id+'">'+ico+esc(it.nm)+(it.ct?'<span class="shm-meta">'+it.ct+' contacts</span>':'')+(it.em?'<span class="shm-meta">'+esc(it.em)+'</span>':'')+'</div>';
          });
        });
        if(!any)dd+='<div class="shm-dd-empty">No results</div>';
        dd+='</div>';
      }
      var left='<div class="shm-field"><span class="shm-lbl">Send to</span><span class="shm-hint">Pick smart lists, campaigns, filters, or individual clients</span><div class="shm-msel"><div class="shm-trigger'+(rs.open?' open':'')+'" data-a="toggle"><span class="shm-ph">Search or select recipients</span><span class="shm-chev">'+RSVG.chev+'</span></div>'+dd+'</div><div class="shm-pills">'+pills+'</div></div><div class="shm-field"><span class="shm-lbl">Add by email</span><div class="shm-em"><input id="shm-e" type="email" placeholder="Enter email address" autocomplete="off"><button class="shm-add" data-a="addem">Add</button></div>'+(rs.emails.length?'<div class="shm-ems">'+rs.emails.map(function(e,i){return '<span class="shm-ep">'+esc(e)+'<button data-a="rmem" data-v="'+i+'">'+RSVG.x+'</button></span>';}).join('')+'</div>':'')+'</div>';
      var n=rtotal();
      var rvItems='';
      rs.sel.forEach(function(id){var it=RECIP.find(function(x){return x.id===id;});if(!it)return;rvItems+='<div class="shm-rv-item"><span class="dot d-'+it.g+'"></span>'+esc(it.nm)+(it.ct?'<span class="ct">'+it.ct+'</span>':'')+'</div>';});
      rs.emails.forEach(function(e){rvItems+='<div class="shm-rv-item"><span class="dot d-ppl"></span>'+esc(e)+'</div>';});
      var mh=mailHTML(S.P);
      var right='<div class="shm-rv-card"><div class="shm-rv-preview"><div style="transform:scale(.42);transform-origin:0 0;width:600px">'+mh+'</div></div><div class="shm-rv-info"><div class="rv-lbl">Subject line</div><div class="rv-val">'+esc(rsubj)+'</div><div class="rv-lbl">From</div><div class="rv-val">'+esc(S.P.f.name)+'</div></div></div><div class="shm-rv-count"><div class="big"><span>Recipients</span><span style="color:#5A5FF2">'+(n||0)+'</span></div>'+(rvItems?'<div class="shm-rv-items">'+rvItems+'</div>':'<div style="margin-top:6px;font:400 13px/18px var(--font);color:#A3A3A3">No recipients selected</div>')+'</div>';
      w.innerHTML='<div class="shm-card"><div class="shm-hd"><h2>Send email to clients</h2><button class="shm-x" data-a="close">'+RSVG.x+'</button></div><div class="shm-sub">'+esc(rsubj)+'</div><div class="shm-panels"><div class="shm-left">'+left+'</div><div class="shm-right">'+right+'</div></div><div class="shm-ft"><button class="shm-cx" data-a="close">Cancel</button><button class="shm-go" data-a="send"'+(rhas()?'':' disabled')+'>'+RSVG.send+' Send email</button></div></div>';
      if(focusId){var el=w.querySelector('#'+focusId);if(el){el.focus();try{el.setSelectionRange(el.value.length,el.value.length)}catch(e){}}}
    }
    function raddEm(){var i=w.querySelector('#shm-e');if(!i)return;var v=i.value.trim();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)){i.focus();return;}if(rs.emails.indexOf(v)<0)rs.emails.push(v);rdraw('shm-e');}
    w.addEventListener('mousedown',function(e){if(e.target===w)rclose();});
    w.addEventListener('click',function(e){var b=e.target.closest('[data-a]');if(!b)return;var a=b.dataset.a,v=b.dataset.v;if(a==='close')rclose();else if(a==='toggle'){rs.open=!rs.open;rs.q='';rdraw(rs.open?'shm-q':null);}else if(a==='add'){if(rs.sel.indexOf(v)<0)rs.sel.push(v);rs.q='';rdraw('shm-q');}else if(a==='rm'){rs.sel=rs.sel.filter(function(x){return x!==v;});rdraw();}else if(a==='addem')raddEm();else if(a==='rmem'){rs.emails.splice(+v,1);rdraw();}else if(a==='send'){if(!rhas())return;rclose();toast('Email sent to clients',rsubj+' \u00b7 '+rtotal()+' recipients');}});
    w.addEventListener('mousedown',function(e){if(rs.open&&!e.target.closest('.shm-msel')&&!e.target.closest('.shm-x')){rs.open=false;rdraw();}},true);
    w.addEventListener('input',function(e){if(e.target.id==='shm-q'){rs.q=e.target.value;rdraw('shm-q');}});
    w.addEventListener('keydown',function(e){if(e.key==='Enter'&&e.target.id==='shm-e'){e.preventDefault();raddEm();}});
    rdraw();
  }
  app.addEventListener('keydown', e => {
    if(!app.classList.contains('open')) return;
    if(e.target.matches && e.target.matches('#em-melq') && e.key === 'Enter'){ e.preventDefault(); melAsk(); return; }
    if(S.editing || (e.target.matches && e.target.matches('input,textarea,select,[contenteditable="true"]'))) return;
    if((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z'){ e.preventDefault(); const r = e.shiftKey ? S.fut : S.hist; if(r.length){ (e.shiftKey ? S.hist : S.fut).push(snap()); restore(r.pop()); renderTop(); } return; }
    if(e.key === 'Escape'){ if(S.pop){ S.pop = null; renderCtx(); } else if(S.sel) setSel(null); return; }
    if((e.key === 'Delete' || e.key === 'Backspace') && S.sel){ e.preventDefault(); delSel(); }
  });
  addEventListener('resize', () => { if(app.classList.contains('open')){ fitZoom(); fit(); } });

  /* ---------- entry ---------- */
  function open(o){
    o = o || {}; const L = LIST.find(x => x.id === o.listing) || LIST[0];
    S.P = mkPage(o.type || 'open', o.layout || 'campaign', L.id); S.ttype = S.P.type; S.tool = 'templates'; S.sel = null; S.pop = null; S.hist = []; S.fut = []; S.test = null; S.alt = 0; S.editing = false;
    app.classList.add('open'); app.tabIndex = -1; renderTop(); renderBody(); fitZoom(); fit();
  }
  window.EMAIL = { open };

  /* Hub card + template-gallery Email tab + email-only packages open the Emailer directly. */
  const EMLAY = { 'em-campaign':'campaign', 'em-invite':'invite', 'em-photo':'photo' };
  const curProp = () => { const m = window.MSPACKET && window.MSPACKET.state && window.MSPACKET.state.prop; return m && m.id; };
  const emailTab = () => window.__flFmt === 'email' || !!document.querySelector('.msaf-tab.on[data-nfformat="email"], .msaf-moreitem.on[data-nfformat="email"], .msaf-tab[aria-selected="true"][data-nfformat="email"]');
  window.addEventListener('click', e => {
    const hub = e.target.closest && e.target.closest('.mshcard[data-hub="email"]');
    if(hub){ e.preventDefault(); e.stopImmediatePropagation(); open(); return; }
    const card = e.target.closest && e.target.closest('.msafcard--tpl[data-nftpl]');
    const go = e.target.closest && e.target.closest('[data-tplact="edit"], [data-nfusetpl]');
    if(!go || !card || card.dataset.nftpl === 'uploaded') return;
    const fmts = (card.dataset.nfformats || '').split(/\s+/).filter(Boolean);
    if(fmts.includes('email') && (fmts.length === 1 || emailTab())){ e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation(); open({ layout:EMLAY[card.dataset.nftpl], listing:curProp() }); }
  }, true);
  const wrap = (obj, fn, keysAt, propAt) => { const orig = obj && obj[fn]; if(typeof orig !== 'function') return false;
    obj[fn] = function(){ const keys = arguments[keysAt] || [], p = arguments[propAt];
      if(keys.length && keys.every(k => k === 'email')){ open({ layout:EMLAY[window.__flLastTpl], listing:(p && p.id) || p }); return; }
      return orig.apply(this, arguments); }; return true; };
  if(!wrap(window, '__msnfEditor', 1, 0)) console.warn('[email] __msnfEditor not found — email-only edit falls back to the package editor');
  if(window.MSPACKET) wrap(window.MSPACKET, 'buildPackage', 1, 0);
})();
