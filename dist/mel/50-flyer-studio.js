/* Flyer Studio — start screen (template gallery by type + print size) → template preview → canvas editor (select, style, pages) → print PDF. */
(function(){
  if(document.getElementById('fl-app')) return;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const money = n => '$' + Number(n).toLocaleString('en-US');
  const host = document.querySelector('.melwrap') || document.body;
  const IMG = ['assets/prop/s1.jpg','assets/prop/s2.jpg','assets/prop/s3.jpg','assets/prop/s4.jpg','assets/tpl/seminar-photo-1.png','assets/tpl/seminar-photo-2.png'];
  /* Editorial = the user's reference flyer, rebuilt element by element, copy and photos as supplied. */
  const SEMINAR = { brand:'Paucek and Lage', kicker:'Seminar event', t1:'Copy', t2:'Writing', t3:'Seminar',
    lede:'Join us for an insightful copywriting seminar designed to help you master the craft of persuasive writing',
    detlab:'Event details', big:'21-22 Oct', small:'Start from 09.00-16.00', full:'123 Anywhere St., Any City, ST 12345',
    f1:'Engaging  workshop', f2:'Real-world case', f3:'Network opportunities', cname:'Avery Davis', crole:'Senior Copywriter of Borcelle',
    more:'More information only at', web:'www.reallygreatsite.com' };
  const toast = (a,b) => { if(window.sonner) sonner(a,b); };
  const LIST = (window.WEBSITE && window.WEBSITE.LIST) || [{ id:'grove', a:'1420 Grove St', unit:'', city:'San Francisco, CA 94117', hood:'Noe Valley', bd:3, ba:2, sqft:'1,510', price:1285000, oh:'Open Saturday, 1–4 PM' }];
  const SIZES = [
    { k:'letter', n:'Letter', c:'Flyer (Portrait US)', d:'8.5 × 11 in', w:8.5, h:11, u:'in' },
    { k:'a4', n:'A4', c:'Flyer (A4 portrait)', d:'210 × 297 mm', w:210, h:297, u:'mm' },
    { k:'half', n:'Half page', c:'Flyer (Half letter)', d:'5.5 × 8.5 in', w:5.5, h:8.5, u:'in' },
    { k:'post', n:'Postcard', c:'Postcard (Landscape)', d:'6 × 4 in', w:6, h:4, u:'in' }
  ];
  const TYPES = [
    { k:'open', n:'Open house' }, { k:'listed', n:'Just listed' }, { k:'sold', n:'Just sold' },
    { k:'reduced', n:'Price reduced' }, { k:'soon', n:'Coming soon' }, { k:'multi', n:'Multi-listing' }
  ];
  const LAYOUTS = { editorial:'Editorial', hero:'Classic', bold:'Full photo', gallery:'Gallery', wide:'Wide', mgrid:'Three up', mlist:'Stacked' };
  const layoutsFor = (t, s) => s === 'post' ? ['wide'] : t === 'multi' ? ['mgrid','mlist'] : ['editorial','hero','bold','gallery'];
  const TPLDEF = { editorial:{ acc:'#E8622F', bg:'#FBFAF6' }, x:{ acc:'#5A5FF2', bg:'#FFFFFF' } };
  const ACC = ['#E8622F','#5A5FF2','#0F766E','#B45309','#BE123C','#1F2937'];
  const BGS = ['#FFFFFF','#FBFAF6','#F5F5F5','#EEEFFE','#0A0A0A'];
  const FONTS = { sans:["Mona Sans","'Mona Sans', sans-serif"], serif:['Playfair','\'Playfair Display\', Georgia, serif'], mont:['Montserrat','Montserrat, sans-serif'] };
  const PAPER = [['standard','Standard paper','A quality everyday option for most printing. 118–148 gsm'],['premium','Premium paper','Thick and durable, for a lasting impression. 148–216 gsm'],['deluxe','Deluxe paper','Our heaviest stock, for quality and strength. 216–270 gsm']];
  const FINISH = [['matte','Matte finish','Soft, no glare. You can write on it.'],['gloss','Gloss finish','Rich color with a light sheen.']];
  const zOf = k => SIZES.find(x => x.k === k);
  const ratio = s => { const z = zOf(s); return z.w / z.h; };
  const pagePt = s => { const z = zOf(s); return (z.u === 'mm' ? z.w / 25.4 : z.w) * 72; };

  const lst = id => LIST.find(x => x.id === id) || LIST[0];
  const addrOf = L => L.a + (L.unit ? ', ' + L.unit : '');
  const HEAD = { open:['Open','house','weekend'], listed:['New','listing','today'], sold:['Just','sold','again'], reduced:['New','price','today'], soon:['Coming','soon','preview'], multi:['Featured','homes','now'] };
  const defaults = (type, L) => {
    const b = { open:['Open house', 'Come see it this weekend', (L.oh || 'Saturday, 1–4 PM').replace(/^Open /, '')],
      listed:['Just listed', 'Just listed in ' + L.hood, 'On the market now'],
      sold:['Just sold', 'Sold. Another happy move', 'Closed this month'],
      reduced:['Price reduced', 'New price, same great home', 'Reduced this week'],
      soon:['Coming soon', 'Coming soon to ' + L.hood, 'Private previews this week'],
      multi:['Featured homes', 'Homes I am bringing to market', 'Call for private tours'] }[type];
    const oh = (L.oh || 'Open Saturday, 1–4 PM').replace(/^Open /, '').split(/,\s*/), h = HEAD[type];
    return { badge:b[0], headline:b[1], date:b[2], addr:addrOf(L), city:L.city, price:money(L.price),
      old: type === 'reduced' ? money(Math.round(L.price * 1.06 / 1000) * 1000) : '',
      specs:L.bd + ' bd  ·  ' + L.ba + ' ba  ·  ' + L.sqft + ' sqft',
      blurb:'Bright, well kept and a short walk to everything that makes ' + L.hood + ' worth living in.',
      name:'Maya Kapoor', phone:'(415) 555-0142', email:'maya@kapoorgroup.com', firm:'Kapoor Group · Radius Agent Realty',
      brand:'Kapoor Group', kicker:b[0], t1:h[0], t2:h[1], t3:h[2],
      lede:'Tour a bright ' + L.bd + ' bed, ' + L.ba + ' bath home a short walk from the best of ' + L.hood,
      detlab: type === 'open' ? 'Open house details' : 'Listing details',
      big: type === 'open' ? oh[0] : money(L.price), small: type === 'open' ? (oh[1] || '1–4 PM') + ' · Walk-ins welcome' : 'Offers reviewed as received',
      full: addrOf(L) + ', ' + L.city, f1:L.bd + ' bedrooms', f2:L.ba + ' bathrooms', f3:L.sqft + ' sq ft',
      cname:'Maya Kapoor', crole:'Your listing agent', more:'Book a private tour at', web:'kapoorgroup.com' };
  };
  const mkPage = (type, layout, size, listing) => {
    const L = lst(listing), d = TPLDEF[layout] || TPLDEF.x, ed = layout === 'editorial';
    return { type, layout, size, listing, f:Object.assign(defaults(type, L), ed ? SEMINAR : {}), fx:{}, acc:d.acc, bg:d.bg, font:'sans', lock:false,
      ph: ed ? [4,5,0,1] : [0,1,2,3], slot:0, nm: ed ? 'Orange White Bold Seminar Event Flyer' : TYPES.find(x => x.k === type).n + ' · ' + L.a };
  };
  const FIELDS = {
    editorial:[['brand','Brand'],['kicker','Top right label'],['t1','Headline line 1'],['t2','Headline line 2'],['t3','Headline line 3'],['lede','Intro'],['detlab','Details label'],['big','Date or price'],['small','Time or note'],['full','Address'],['f1','Feature 1'],['f2','Feature 2'],['f3','Feature 3'],['cname','Caption name'],['crole','Caption role'],['more','Footer line'],['web','Website']],
    x:[['badge','Banner label'],['headline','Headline'],['date','Date and time'],['price','Price'],['old','Previous price'],['addr','Address'],['city','City'],['specs','Beds, baths, sqft'],['blurb','Description']]
  };
  const fieldsOf = P => FIELDS[P.layout] || FIELDS.x;
  const labelOf = (P, id) => { if(id.startsWith('img')) return 'Photo ' + (+id.slice(3) + 1); if(id === 'shp') return 'Color block'; if(id === 'arrow') return 'Arrow'; const a = fieldsOf(P).concat([['name','Agent name'],['firm','Brokerage'],['phone','Phone'],['email','Email']]).find(x => x[0] === id); return a ? a[1] : id; };

  /* ---------- page renderer (fonts in cqw, positions in %, so it scales to any box) ---------- */
  function pageHTML(P){
    const f = P.f, A = P.acc, FF = FONTS[P.font][1], INK = '#0A0A0A', X = P.fx || {};
    const T = (k, base, d) => {
      d = d || {}; const x = X[k] || {}; if(x.hide) return '';
      const w = x.b == null ? (d.w || 400) : (x.b ? Math.max(700, d.w || 0) : 400);
      const up = x.up == null ? !!d.up : x.up, it = x.i == null ? !!d.it : x.i;
      const dec = [x.u && 'underline', x.s && 'line-through'].filter(Boolean).join(' ');
      return '<div data-el="' + k + '" data-k="' + k + '" style="' + (d.s || '') + ';font-size:' + (base * (x.sz || 1)).toFixed(3) + 'cqw;font-weight:' + w + ';text-align:' + (x.al || d.al || 'left') + ';color:' + (x.c || d.c || INK) +
        (it ? ';font-style:italic' : '') + (dec ? ';text-decoration:' + dec : '') + (up ? ';text-transform:uppercase' : '') + (x.op != null ? ';opacity:' + x.op : '') + (x.ls != null ? ';letter-spacing:' + x.ls + 'em' : '') + (x.ff ? ';font-family:' + FONTS[x.ff][1] : '') + (x.z != null ? ';z-index:' + x.z : '') + '">' + esc(f[k]) + '</div>';
    };
    const ph = (i, st) => { const x = X['img' + i] || {}; return '<div data-el="img' + i + '" data-photo="' + i + '" style="background:#D9D9DE url(' + IMG[P.ph[i] % IMG.length] + ') center/cover;' + st + (x.fl ? ';transform:scaleX(-1)' : '') + (x.op != null ? ';opacity:' + x.op : '') + (x.hide ? ';visibility:hidden' : '') + (x.z != null ? ';z-index:' + x.z : '') + '"></div>'; };
    const badge = st => T('badge', 2.7, { w:700, up:1, c:'#fff', s:'position:absolute;' + st + ';background:' + A + ';padding:1cqw 2.6cqw;border-radius:99cqw;letter-spacing:.04em' });
    const priceBlock = (c, base) => (f.old ? T('old', base * .5, { w:500, c:'#737373', s:'text-decoration:line-through' }) : '') + T('price', base, { w:700, c:c || A, al:'right', s:'letter-spacing:-.02em;line-height:1.05' });
    const agent = (c, bg) => '<div style="display:flex;justify-content:space-between;align-items:center;gap:3cqw;padding:2.6cqw 5cqw;background:' + bg + '"><div>' +
      T('name', 3.2, { w:700, c }) + T('firm', 2.1, { c, s:'opacity:.85' }) + '</div><div>' + T('phone', 2.9, { w:600, c, al:'right' }) + T('email', 2.1, { c, al:'right', s:'opacity:.85' }) + '</div></div>';
    const wrap = inner => '<div style="position:absolute;inset:0;display:flex;flex-direction:column;font-family:' + FF + ';color:' + INK + '">' + inner + '</div>';
    const L = P.layout;
    if(L === 'editorial'){
      const sx = X.shp || {}, ax = X.arrow || {};
      const rule = k => (X[k] || {}).hide ? '' : '<div style="border-bottom:.22cqw solid ' + INK + ';padding-bottom:1.3cqw">' + T(k, 2.65, { up:1 }) + '</div>';
      return '<div style="position:absolute;inset:0;font-family:' + FF + ';color:' + INK + '">' +
        (sx.hide ? '' : '<div data-el="shp" style="position:absolute;left:49.4%;right:3.9%;top:11.25%;height:44.6%;background:' + (sx.c || A) + (sx.op != null ? ';opacity:' + sx.op : '') + (sx.z != null ? ';z-index:' + sx.z : '') + '"></div>') +
        ph(0, 'position:absolute;left:49.4%;right:3.9%;top:55.85%;height:19.5%') +
        ph(1, 'position:absolute;left:49.4%;right:3.9%;top:75.35%;height:19.7%;box-shadow:inset 0 -.35cqw 0 ' + A) +
        T('brand', 1.75, { w:500, up:1, s:'position:absolute;left:4.1%;top:5.4%;max-width:44%' }) +
        T('kicker', 1.75, { w:500, up:1, al:'right', s:'position:absolute;right:4.1%;top:5.4%;max-width:44%' }) +
        (ax.hide ? '' : '<svg data-el="arrow" viewBox="0 0 24 24" fill="none" stroke="' + (ax.c || INK) + '" stroke-width="1" style="position:absolute;right:7.6%;top:18.4%;width:5.8cqw;height:5.8cqw;overflow:visible' + (ax.op != null ? ';opacity:' + ax.op : '') + (ax.z != null ? ';z-index:' + ax.z : '') + '"><path d="M23 1 1 23M1 9v14h14"/></svg>') +
        '<div style="position:absolute;left:4.1%;right:7%;top:10%">' +
          T('t1', 14.6, { w:800, up:1, s:'line-height:.87;letter-spacing:-.045em' }) + T('t2', 14.6, { w:800, up:1, s:'line-height:.87;letter-spacing:-.045em' }) + T('t3', 14.6, { w:800, up:1, al:'right', s:'line-height:.87;letter-spacing:-.045em' }) + '</div>' +
        T('lede', 2.65, { al:'right', s:'position:absolute;right:7.4%;top:41.4%;width:39%;line-height:1.2' }) +
        T('detlab', 2.1, { w:700, up:1, s:'position:absolute;left:4.1%;top:41.6%;max-width:44%' }) +
        T('big', 7.6, { up:1, s:'position:absolute;left:4.1%;top:45.4%;max-width:44%;line-height:1;letter-spacing:-.02em;white-space:nowrap' }) +
        T('small', 2.6, { up:1, s:'position:absolute;left:4.1%;top:53.6%;max-width:44%' }) +
        T('full', 2.6, { w:700, up:1, s:'position:absolute;left:4.1%;top:57.6%;width:38%;line-height:1.2' }) +
        '<div style="position:absolute;left:4.1%;width:40.5%;top:67.6%;display:flex;flex-direction:column;gap:3.4cqw">' + rule('f1') + rule('f2') + rule('f3') + '</div>' +
        T('more', 1.85, { w:500, up:1, s:'position:absolute;left:4.1%;top:91.4%;max-width:44%;line-height:1.15' }) +
        T('web', 1.85, { w:500, up:1, s:'position:absolute;left:4.1%;top:93.1%;max-width:44%;line-height:1.15' }) +
        ((X.cname || {}).hide ? '' : '<div style="position:absolute;left:76.4%;right:6.2%;top:86.7%;background:#fff;padding:.2cqw .9cqw">' + T('cname', 2.65, { al:'right', s:'line-height:1.3' }) + '</div>') +
        ((X.crole || {}).hide ? '' : '<div style="position:absolute;left:62.2%;right:6.2%;top:89.4%;background:#fff;padding:.3cqw .9cqw">' + T('crole', 2.05, { al:'right', it:1, s:'line-height:1.45;white-space:nowrap' }) + '</div>') + '</div>';
    }
    if(L === 'hero') return wrap(
      '<div style="position:relative;flex:0 0 52%">' + ph(0, 'position:absolute;inset:0') + badge('top:4.5cqw;left:5cqw') + '</div>' +
      '<div style="flex:1;min-height:0;padding:4.5cqw 5cqw 2cqw;display:flex;flex-direction:column;gap:1.2cqw">' +
        T('headline', 6.4, { w:700, s:'letter-spacing:-.02em;line-height:1.08' }) + T('date', 3, { w:600, c:A }) +
        '<div style="display:flex;justify-content:space-between;align-items:flex-end;gap:3cqw;margin-top:1.4cqw"><div style="min-width:0">' + T('addr', 4.4, { w:600 }) + T('city', 2.8, { c:'#525252' }) + '</div><div style="flex:none">' + priceBlock(A, 6.4) + '</div></div>' +
        T('specs', 2.9, { w:500, c:'#404040', s:'margin-top:.6cqw' }) + T('blurb', 2.6, { c:'#525252', s:'line-height:1.4' }) + '</div>' + agent('#fff', INK));
    if(L === 'bold') return wrap(
      '<div style="position:relative;flex:1;min-height:0">' + ph(0, 'position:absolute;inset:0') + badge('top:5cqw;left:5cqw') +
        '<div style="position:absolute;left:5cqw;right:5cqw;top:16cqw;text-shadow:0 .3cqw 2cqw rgba(0,0,0,.45)">' + T('headline', 9, { w:800, c:'#fff', s:'letter-spacing:-.025em;line-height:1.04' }) + T('date', 3.4, { w:600, c:'#fff', s:'margin-top:1.5cqw' }) + '</div></div>' +
      '<div style="background:' + A + ';padding:4.5cqw 5cqw;display:flex;justify-content:space-between;align-items:flex-end;gap:3cqw"><div style="min-width:0">' + T('addr', 4.6, { w:700, c:'#fff' }) + T('city', 2.7, { c:'#fff', s:'opacity:.9' }) + T('specs', 2.7, { w:500, c:'#fff', s:'margin-top:1.2cqw' }) + '</div><div style="flex:none">' + priceBlock('#fff', 7) + '</div></div>' + agent('#fff', INK));
    if(L === 'gallery') return wrap(
      '<div style="padding:5cqw 5cqw 3cqw;display:flex;flex-direction:column;gap:1.4cqw;align-items:flex-start;position:relative">' + badge('position:static;display:inline-block') +
        T('headline', 6.8, { w:700, s:'letter-spacing:-.02em;line-height:1.06;margin-top:1.4cqw' }) + '</div>' +
      '<div style="padding:0 5cqw;display:grid;grid-template-columns:1fr 1fr;grid-template-rows:repeat(2,1fr);gap:1.6cqw;flex:1;min-height:0">' +
        ph(0, 'grid-row:1/3;border-radius:1.2cqw') + ph(1, 'border-radius:1.2cqw') + ph(2, 'border-radius:1.2cqw') + '</div>' +
      '<div style="padding:3.4cqw 5cqw 3cqw;display:flex;justify-content:space-between;align-items:flex-end;gap:3cqw"><div style="min-width:0">' + T('addr', 4.2, { w:600 }) + T('city', 2.7, { c:'#525252' }) + T('specs', 2.8, { w:500, c:'#404040', s:'margin-top:1cqw' }) + T('date', 2.8, { w:600, c:A, s:'margin-top:.6cqw' }) + '</div><div style="flex:none">' + priceBlock(A, 6.4) + '</div></div>' + agent('#fff', A));
    if(L === 'wide') return '<div style="position:absolute;inset:0;display:flex;font-family:' + FF + ';color:' + INK + '"><div style="position:relative;flex:0 0 46%">' + ph(0, 'position:absolute;inset:0') + badge('top:3.5cqw;left:3.5cqw') + '</div>' +
      '<div style="flex:1;min-width:0;padding:4cqw 4cqw 3cqw;display:flex;flex-direction:column;gap:1cqw">' + T('headline', 4.1, { w:700, s:'letter-spacing:-.02em;line-height:1.08' }) + T('date', 2.2, { w:600, c:A }) +
      '<div style="margin-top:auto">' + T('addr', 2.8, { w:600 }) + T('city', 1.9, { c:'#525252' }) + T('specs', 1.9, { c:'#404040', s:'margin:.6cqw 0' }) + T('price', 4.4, { w:700, c:A }) + '</div>' +
      '<div style="border-top:1px solid #E5E5E5;padding-top:1.4cqw;display:flex;justify-content:space-between">' + T('name', 1.9, { w:700 }) + T('phone', 1.9, {}) + '</div></div></div>';
    const rows = LIST.slice(0, 3);
    const head = '<div style="padding:5cqw 5cqw 3cqw;position:relative;display:flex;flex-direction:column;gap:1.4cqw;align-items:flex-start">' + badge('position:static;display:inline-block') + T('headline', 6.6, { w:700, s:'letter-spacing:-.02em;line-height:1.06;margin-top:1.4cqw' }) + '</div>';
    if(L === 'mgrid') return wrap(head + '<div style="flex:1;min-height:0;padding:0 5cqw;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:2cqw">' +
      rows.map((r, i) => '<div style="display:flex;flex-direction:column;gap:1.2cqw;min-width:0"><div style="flex:1;min-height:0;background:#D9D9DE url(' + IMG[i % 4] + ') center/cover;border-radius:1.2cqw"></div><div style="font-size:2.9cqw;font-weight:700;color:' + A + '">' + money(r.price) + '</div><div style="font-size:2.4cqw;font-weight:600">' + esc(r.a) + '</div><div style="font-size:1.9cqw;color:#525252;padding-bottom:2cqw">' + r.bd + ' bd · ' + r.ba + ' ba · ' + r.sqft + ' sqft</div></div>').join('') + '</div>' + agent('#fff', A));
    return wrap(head + '<div style="flex:1;min-height:0;padding:0 5cqw;display:flex;flex-direction:column;gap:2cqw">' +
      rows.map((r, i) => '<div style="flex:1;min-height:0;display:flex;gap:3cqw;align-items:center"><div style="flex:0 0 40%;align-self:stretch;background:#D9D9DE url(' + IMG[i % 4] + ') center/cover;border-radius:1.2cqw"></div><div style="min-width:0"><div style="font-size:4cqw;font-weight:700;color:' + A + '">' + money(r.price) + '</div><div style="font-size:3.2cqw;font-weight:600">' + esc(r.a) + '</div><div style="font-size:2.3cqw;color:#525252">' + esc(r.hood) + ' · ' + r.bd + ' bd · ' + r.ba + ' ba</div></div></div>').join('') + '</div>' + agent('#fff', INK));
  }
  const pageEl = (P, o) => { o = o || {}; return '<div class="fl-page' + (o.edit ? ' edit' : '') + (o.bleed ? ' bleed' : '') + '" style="' + (o.w ? 'width:' + o.w + 'px;' : 'width:100%;') + 'aspect-ratio:' + ratio(P.size) + ';background:' + P.bg + '">' + pageHTML(P) + '</div>'; };

  function layersOf(P){
    const fx = {}; Object.keys(P.fx).forEach(k => { fx[k] = Object.assign({}, P.fx[k], { hide:false }); });
    const tmp = document.createElement('div'); tmp.innerHTML = pageHTML(Object.assign({}, P, { fx }));
    const L = [...tmp.querySelectorAll('[data-el]')].map((e, i) => { const id = e.dataset.el, k = kindOf(id), st = e.style;
      return { id, kind:k, i, z:(P.fx[id] || {}).z ?? i + 1, t:e.textContent, w:st.fontWeight || 400, it:st.fontStyle === 'italic', up:st.textTransform === 'uppercase',
        src: k === 'img' ? IMG[P.ph[+id.slice(3)] % IMG.length] : '', c: id === 'shp' ? ((P.fx.shp || {}).c || P.acc) : '' }; });
    return L.sort((a, b) => b.z - a.z || b.i - a.i);
  }
  /* ---------- state ---------- */
  const S = { view:'start', pages:[], cur:0, zoom:90, tool:'templates', sel:[], grid:false, bleed:false, pop:null, clip:null,
    stype:'all', ssize:'letter', slist:LIST[0].id, hist:[], fut:[], ttype:'open', td:null, fav:{} };
  const cp = () => S.pages[S.cur];
  const snap = () => JSON.stringify({ p:S.pages, c:S.cur });
  const commit = () => { S.hist.push(snap()); if(S.hist.length > 80) S.hist.shift(); S.fut = []; };
  const restore = j => { const o = JSON.parse(j); S.pages = o.p; S.cur = Math.min(o.c, o.p.length - 1); };
  const kindOf = id => id.startsWith('img') ? 'img' : (id === 'shp' || id === 'arrow') ? 'shape' : 'text';
  const locked = id => cp().lock || !!((cp().fx[id] || {}).lock);
  const elOf = id => app.querySelector('#fl-canvas .fl-pwrap[data-pi="' + S.cur + '"] [data-el="' + id + '"]');

  const app = document.createElement('div'); app.className = 'fl-app'; app.id = 'fl-app'; host.appendChild(app);
  app.innerHTML = '<div class="fl-top" id="fl-top"></div><div class="fl-body" id="fl-body"></div><div class="fl-dlgw" id="fl-dlgw"></div>';
  const $ = id => app.querySelector('#' + id);
  const ic = n => '<i class="ph ph-' + n + '"></i>';
  const mi = (a, i, t, d, on, v) => '<button class="fl-mi' + (on ? ' on' : '') + '" data-fl="' + a + '"' + (v ? ' data-v="' + v + '"' : '') + '>' + (i ? ic(i) : '') + '<span>' + t + (d ? '<small>' + d + '</small>' : '') + '</span></button>';

  function renderTop(){
    const e = S.view === 'edit', P = cp();
    $('fl-top').innerHTML = (e ? '<button class="fl-tpanel" data-fl="sidetg" title="' + (S.sideOff ? 'Show' : 'Hide') + ' Mel panel" aria-label="Toggle Mel panel"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16"/></svg></button>' : '') +
      '<div class="fl-crumb"><button class="fl-back" data-fl="exit" title="Back" aria-label="Back">' + ic('arrow-left') + '</button>' +
      (e ? '<b>' + esc(addrOf(lst(P.listing))) + '</b><i>·</i><span>Flyer</span><i>·</i><span>' + esc(LAYOUTS[P.layout]) + '</span>' : '<b>Flyers</b><i>·</i><span>Design studio</span>') + '</div>' +
      '<div class="fl-sp"></div><button class="fl-tico" data-fl="close" title="Close" aria-label="Close">' + ic('x') + '</button>';
  }

  const RAIL = [['templates','layout','Templates'],['layers','stack','Layers'],['photos','image','Photos'],['text','text-t','Text'],['brand','palette','Brand']];
  const RSVG = {
    templates:['#15803D','Template','<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="fill:none;stroke:currentColor"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M3 9h18M9 21V9"/></svg>'],
    layers:['#5A5FF2','Layers','<svg viewBox="0 0 256 256"><path d="M230.91,172A8,8,0,0,1,228,182.91l-96,56a8,8,0,0,1-8.06,0l-96-56A8,8,0,0,1,36,169.09l92,53.65,92-53.65A8,8,0,0,1,230.91,172ZM220,121.09l-92,53.65L36,121.09A8,8,0,0,0,28,134.91l96,56a8,8,0,0,0,8.06,0l96-56A8,8,0,1,0,220,121.09ZM24,80a8,8,0,0,1,4-6.91l96-56a8,8,0,0,1,8.06,0l96,56a8,8,0,0,1,0,13.82l-96,56a8,8,0,0,1-8.06,0l-96-56A8,8,0,0,1,24,80Zm23.88,0L128,126.74,208.12,80,128,33.26Z"/></svg>'],
    photos:['#2563EB','Photo','<svg viewBox="0 0 256 256"><path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40Zm0,16V158.75l-26.07-26.06a16,16,0,0,0-22.63,0l-20,20-44-44a16,16,0,0,0-22.62,0L40,149.37V56ZM40,172l52-52,80,80H40Zm176,28H194.63l-36-36,20-20L216,181.38V200ZM144,100a12,12,0,1,1,12,12A12,12,0,0,1,144,100Z"/></svg>'],
    text:['#7C3AED','Text','<svg viewBox="0 0 256 256"><path d="M208,56V88a8,8,0,0,1-16,0V64H136V200h24a8,8,0,0,1,0,16H96a8,8,0,0,1,0-16h24V64H64V88a8,8,0,0,1-16,0V56a8,8,0,0,1,8-8H200A8,8,0,0,1,208,56Z"/></svg>'],
    brand:['#EA580C','Accent','<svg viewBox="0 0 256 256"><path d="M200.77,53.89A103.27,103.27,0,0,0,128,24h-1.07A104,104,0,0,0,24,128c0,43,26.58,79.06,69.36,94.17A32,32,0,0,0,136,192a16,16,0,0,1,16-16h46.21a31.81,31.81,0,0,0,31.2-24.88,104.4,104.4,0,0,0,2.59-24A103.28,103.28,0,0,0,200.77,53.89Zm12.65,93.71A15.91,15.91,0,0,1,198.21,160H152a32,32,0,0,0-32,32,16,16,0,0,1-21.31,15.07C62.49,194.3,40,164,40,128a88,88,0,0,1,87.09-88H128a87.5,87.5,0,0,1,61.71,25.37A87.51,87.51,0,0,1,216,127.28,88.4,88.4,0,0,1,213.42,147.6ZM140,76a12,12,0,1,1-12-12A12,12,0,0,1,140,76ZM96,100a12,12,0,1,1-12-12A12,12,0,0,1,96,100Zm0,56a12,12,0,1,1-12-12A12,12,0,0,1,96,156Zm88-56a12,12,0,1,1-12-12A12,12,0,0,1,184,100Z"/></svg>'] };
  const PHN = ['Front elevation','Living room','Kitchen','Back yard','Seminar room','Speaker'];
  const melsug = t => '<div class="melsug"><span class="who"><img src="assets/mel-icon.svg" alt="">Mel suggests</span><p>' + t + '</p></div>';
  function renderPanel(){
    const P = cp(), h2 = $('fl-panel'); if(!h2) return;
    let h = '';
    if(S.tool === 'templates'){
      h = melsug(P.layout === 'editorial' ? 'Editorial is my pick here. The big type reads from across a room, and every line on it stays editable.' : esc(LAYOUTS[P.layout]) + ' is on. Editorial is the boldest read for a printed flyer if you want to try it.') +
        '<span class="seclab">Flyer type</span><div class="aichips" style="margin-top:0">' + TYPES.map(t => '<button class="msvchip' + (S.ttype === t.k ? ' on' : '') + '" type="button" data-fl="ttype" data-v="' + t.k + '">' + t.n + '</button>').join('') + '</div>' +
        '<span class="seclab" style="margin-top:8px">Template</span><div class="msvtpls">' +
        layoutsFor(S.ttype, P.size).map(l => { const q = mkPage(S.ttype, l, P.size, P.listing); if(S.ttype === P.type && l === P.layout) q.f = P.f;
          return '<button class="msvtpl' + (P.layout === l && P.type === S.ttype ? ' on' : '') + '" type="button" data-fl="applytpl" data-v="' + l + '"><span class="lth">' + pageEl(q) + '</span><i>' + LAYOUTS[l] + '</i></button>'; }).join('') + '</div>';
    } else if(S.tool === 'layers'){
      h = melsug('Top of the list sits on top. Drag a row to restack it, tap the eye to hide a layer, or the lock to keep it from moving.') +
        '<span class="seclab">Layers · ' + (S.cur ? 'Back' : 'Front') + '</span><div class="fl-lyl" id="fl-lyl">' + layersOf(P).map(l => { const x = P.fx[l.id] || {}, lk = P.lock || x.lock;
        const pv = l.kind === 'img' ? '<span class="fl-lyimg" style="background-image:url(' + l.src + ')"></span>' : l.kind === 'shape' ? (l.id === 'arrow' ? '<span class="fl-lyico">' + ic('arrow-down-left') + '</span>' : '<span class="fl-lysw" style="background:' + l.c + '"></span>') : '<span class="fl-lytx" style="font-weight:' + l.w + (l.it ? ';font-style:italic' : '') + (l.up ? ';text-transform:uppercase' : '') + '">' + esc(l.t) + '</span>';
        return '<div class="fl-lyr' + (S.sel.includes(l.id) ? ' on' : '') + (x.hide ? ' off' : '') + '" draggable="true" data-ly="' + l.id + '"><span class="fl-lyh" aria-hidden="true">' + ic('dots-six-vertical') + '</span><button class="fl-lyp" type="button" data-fl="lysel" data-v="' + l.id + '" title="' + esc(labelOf(P, l.id)) + '">' + pv + '<small>' + esc(labelOf(P, l.id)) + '</small></button>' +
          '<button class="fl-lyb" type="button" data-fl="lyhide" data-v="' + l.id + '" title="' + (x.hide ? 'Show' : 'Hide') + '" aria-label="' + (x.hide ? 'Show' : 'Hide') + '">' + ic(x.hide ? 'eye-slash' : 'eye') + '</button><button class="fl-lyb" type="button" data-fl="lylock" data-v="' + l.id + '" title="' + (lk ? 'Unlock' : 'Lock') + '" aria-label="' + (lk ? 'Unlock' : 'Lock') + '">' + ic(lk ? 'lock-simple' : 'lock-simple-open') + '</button></div>'; }).join('') + '</div>';
    } else if(S.tool === 'photos'){
      const cur = P.ph[P.slot] % IMG.length;
      h = melsug('Photo ' + (P.slot + 1) + ' on the flyer is ' + esc(PHN[cur].toLowerCase()) + '. Pick another to swap it in, or tap a different photo on the flyer first.') +
        '<div class="pv4-tier"><span class="pv4-tlab">PHOTO ' + (P.slot + 1) + ' · ' + esc(PHN[cur].toUpperCase()) + '</span><span class="pv4-tct">1 of ' + IMG.length + ' selected</span></div><div class="pv4-grid">' +
        IMG.map((src, i) => '<button class="pv4-tile' + (cur === i ? ' sel' : '') + '" type="button" data-fl="photo" data-v="' + i + '"><span class="pv4-ph" style="background-image:url(\'' + src + '\')">' + (cur === i ? '<span class="pv4-check"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg></span>' : '') + '</span><span class="pv4-cap">' + esc(PHN[i]) + '</span></button>').join('') + '</div>';
    } else if(S.tool === 'text'){
      h = melsug('Edit any line here, or double-click it on the flyer. I keep your wording when you switch templates.') +
        fieldsOf(P).map(a => '<span class="seclab" style="margin-top:6px">' + a[1] + '</span>' + (a[0] === 'blurb' || a[0] === 'lede' ? '<textarea class="fl-in fl-ta" data-fi="' + a[0] + '">' + esc(P.f[a[0]]) + '</textarea>' : '<input class="fl-in" data-fi="' + a[0] + '" value="' + esc(P.f[a[0]]) + '">')).join('');
    } else {
      h = melsug('Your accent and font carry across the front and back.') +
        '<span class="seclab">Accent</span><div class="fl-sw">' + ACC.map(c => '<button class="' + (P.acc === c ? 'on' : '') + '" type="button" data-fl="acc" data-v="' + c + '" style="background:' + c + '" aria-label="' + c + '"></button>').join('') + '</div>' +
        '<span class="seclab" style="margin-top:8px">Page color</span><div class="fl-sw">' + BGS.map(c => '<button class="' + (P.bg === c ? 'on' : '') + '" type="button" data-fl="bgc" data-v="' + c + '" style="background:' + c + '" aria-label="' + c + '"></button>').join('') + '</div>' +
        '<span class="seclab" style="margin-top:8px">Font</span><div class="aichips" style="margin-top:0">' + Object.keys(FONTS).map(k => '<button class="msvchip' + (P.font === k ? ' on' : '') + '" type="button" data-fl="font" data-v="' + k + '" style="font-family:' + FONTS[k][1] + '">' + FONTS[k][0] + '</button>').join('') + '</div>';
    }
    h2.innerHTML = h;
  }

  /* ---------- contextual toolbar ---------- */
  const pw = (k, btn, body) => '<div class="fl-popw">' + btn + (S.pop === k ? '<div class="fl-pop">' + body + '</div>' : '') + '</div>';
  const swatches = (list, cur, act) => '<div class="fl-sw">' + list.map(c => '<button class="' + (cur === c ? 'on' : '') + '" data-fl="' + act + '" data-v="' + c + '" style="background:' + c + '" aria-label="' + c + '"></button>').join('') + '</div>' +
    '<label class="fl-cust"><input type="color" data-fc="' + act + '" value="' + (cur && cur[0] === '#' && cur.length === 7 ? cur : '#5A5FF2') + '">Custom color</label>';
  const cb = (a, i, t, on, ti, v) => '<button class="fl-cb' + (on ? ' on' : '') + '" data-fl="' + a + '"' + (v ? ' data-v="' + v + '"' : '') + ' title="' + (ti || t || '') + '">' + (i ? ic(i) : '') + (t ? '<span>' + t + '</span>' : '') + '</button>';
  const cd = '<i class="fl-cd"></i>';
  function common(fn){ const v = S.sel.map(fn); return v.every(x => x === v[0]) ? v[0] : null; }
  const isOn = (id, p) => { const el = elOf(id); if(!el) return false; const s = el.style;
    return p === 'b' ? +s.fontWeight >= 600 : p === 'i' ? s.fontStyle === 'italic' : p === 'u' ? /underline/.test(s.textDecoration) : p === 's' ? /line-through/.test(s.textDecoration) : s.textTransform === 'uppercase'; };
  const ptOf = id => { const el = elOf(id); return el ? parseFloat(el.style.fontSize) * pagePt(cp().size) / 100 : 0; };
  function renderCtx(){
    const c = $('fl-ctx'); if(!c) return;
    const P = cp(), sel = S.sel;
    const opBody = v => '<div class="fl-pl">Transparency<span>' + v + '%</span></div><input type="range" min="10" max="100" value="' + v + '" data-fx="op">';
    const opV = Math.round((common(id => (P.fx[id] || {}).op ?? 1) ?? 1) * 100);
    let h = '';
    c.classList.toggle('on', !!sel.length);
    if(!sel.length){
      h = '<span class="fl-cl">' + (S.cur ? 'Back' : 'Front') + '</span>' + cd +
        pw('bgp', '<button class="fl-cb" data-fl="pop" data-v="bgp" title="Page color"><i class="fl-csw" style="background:' + P.bg + '"></i><span>Page color</span></button>', '<div class="fl-pl">Page color</div>' + swatches(BGS, P.bg, 'bgc')) +
        cb('tool', 'layout', 'Templates', false, 'Change template', 'templates') + cb('pop', 'arrows-out-simple', 'Resize', false, 'Change flyer size', 'resize') + cd +
        cb('pglock', P.lock ? 'lock-simple' : 'lock-simple-open', P.lock ? 'Unlock page' : 'Lock page');
    } else if(sel.some(locked)){
      h = '<span class="fl-cl">' + ic('lock-simple') + (sel.length > 1 ? sel.length + ' elements locked' : esc(labelOf(P, sel[0])) + ' is locked') + '</span>' + cd + cb(P.lock ? 'pglock' : 'lock', 'lock-simple-open', 'Unlock');
    } else {
      const kinds = [...new Set(sel.map(kindOf))];
      if(kinds.length === 1 && kinds[0] === 'text'){
        const ff = common(id => (P.fx[id] || {}).ff || P.font), pt = common(id => Math.round(ptOf(id) * 10) / 10);
        const col = common(id => { const el = elOf(id); return el ? el.style.color : ''; });
        const al = common(id => { const el = elOf(id); return el ? el.style.textAlign : 'left'; }) || 'left';
        const all = p => sel.every(id => isOn(id, p));
        h = pw('font', '<button class="fl-fsel" data-fl="pop" data-v="font"><span>' + (ff ? FONTS[ff][0] : 'Multiple fonts') + '</span>' + ic('caret-down') + '</button>', Object.keys(FONTS).map(k => '<button class="fl-mi' + (ff === k ? ' on' : '') + '" data-fl="ffont" data-v="' + k + '" style="font-family:' + FONTS[k][1] + '"><span>' + FONTS[k][0] + '</span></button>').join('')) +
          '<div class="fl-szbox"><button data-fl="szd" title="Decrease font size">' + ic('minus') + '</button><input data-fl="szin" value="' + (pt == null ? '--' : pt) + '" aria-label="Font size in points"><button data-fl="szu" title="Increase font size">' + ic('plus') + '</button></div>' +
          pw('col', '<button class="fl-cb" data-fl="pop" data-v="col" title="Text color"><span class="fl-ab">A<i style="background:' + (col || 'linear-gradient(90deg,#0A0A0A,' + P.acc + ')') + '"></i></span></button>', '<div class="fl-pl">Text color</div>' + swatches(['#0A0A0A','#FFFFFF','#525252'].concat(ACC), null, 'col')) +
          cb('tg', 'text-b', '', all('b'), 'Bold', 'b') + cb('tg', 'text-italic', '', all('i'), 'Italic', 'i') + cb('tg', 'text-underline', '', all('u'), 'Underline', 'u') + cb('tg', 'text-strikethrough', '', all('s'), 'Strikethrough', 's') + cb('tg', 'text-aa', '', all('up'), 'Uppercase', 'up') +
          cb('al', 'text-align-' + al, '', false, 'Alignment · ' + al) +
          pw('ls', cb('pop', 'arrows-horizontal', '', false, 'Letter spacing', 'ls'), '<div class="fl-pl">Letter spacing<span>' + Math.round((common(id => (P.fx[id] || {}).ls ?? 0) ?? 0) * 100) + '</span></div><input type="range" min="-10" max="40" value="' + Math.round((common(id => (P.fx[id] || {}).ls ?? 0) ?? 0) * 100) + '" data-fx="ls">') +
          pw('op', cb('pop', 'checkerboard', '', false, 'Transparency', 'op'), opBody(opV)) + cd + cb('tool', 'stack', '', S.tool === 'layers', 'Layers', 'layers') + cb('resetst', 'arrow-counter-clockwise', '', false, 'Reset style');
      } else if(kinds.length === 1 && kinds[0] === 'img'){
        h = (sel.length === 1 ? cb('replace', 'swap', 'Replace', false, 'Replace photo') : '') + cb('flip', 'flip-horizontal', 'Flip', !!(P.fx[sel[0]] || {}).fl) +
          pw('op', cb('pop', 'checkerboard', '', false, 'Transparency', 'op'), opBody(opV)) + cd + cb('tool', 'stack', '', S.tool === 'layers', 'Layers', 'layers') + cb('resetst', 'arrow-counter-clockwise', '', false, 'Reset style');
      } else if(kinds.length === 1 && kinds[0] === 'shape'){
        const cur = common(id => (P.fx[id] || {}).c || (id === 'shp' ? P.acc : '#0A0A0A'));
        h = pw('col', '<button class="fl-cb" data-fl="pop" data-v="col" title="Color"><i class="fl-csw" style="background:' + (cur || P.acc) + '"></i><span>Color</span></button>', '<div class="fl-pl">Color</div>' + swatches(ACC.concat(['#0A0A0A','#FFFFFF']), cur, 'col')) +
          pw('op', cb('pop', 'checkerboard', '', false, 'Transparency', 'op'), opBody(opV)) + cd + cb('tool', 'stack', '', S.tool === 'layers', 'Layers', 'layers') + cb('resetst', 'arrow-counter-clockwise', '', false, 'Reset style');
      } else {
        h = '<span class="fl-cl">' + sel.length + ' elements</span>' + cd + pw('op', cb('pop', 'checkerboard', 'Transparency', false, 'Transparency', 'op'), opBody(opV)) + cb('resetst', 'arrow-counter-clockwise', 'Reset', false, 'Reset style');
      }
    }
    c.innerHTML = sel.length ? h : '';
    const cv = $('fl-canvas'); if(cv) cv.style.paddingTop = '136px';
  }

  /* ---------- canvas, pages, footer ---------- */
  const pageW = P => (ratio(P.size) > 1 ? 720 : 540) * S.zoom / 100 * (S.grid ? .45 : 1);
  function fitZoom(P){
    const c = $('fl-canvas'); if(!c) return; const base = ratio(P.size) > 1 ? 720 : 540;
    const top = parseFloat(c.style.paddingTop) || 84, h = c.clientHeight - top - 104, w = c.clientWidth - 80;
    if(h > 120 && w > 120) S.zoom = Math.max(30, Math.min(160, Math.floor(Math.min(h * ratio(P.size) / base, w / base) * 100)));
  }
  function renderCanvas(){
    const c = $('fl-canvas'); if(!c) return;
    S.grid = false; c.className = 'fl-canvas';
    const p = cp(); fitZoom(p); const w = pageW(p);
    c.innerHTML = '<div class="fl-pwrap cur" data-pi="' + S.cur + '" style="width:' + w + 'px">' + pageEl(p, { edit:true, bleed:S.bleed, w }) + '</div>';
    paintSel();
  }
  function renderFoot(){
    const f = $('fl-psz'); if(!f) return; const P = cp(), two = S.pages.length > 1;
    const tab = (v, i, t) => '<button type="button" role="tab" class="rds-tab" data-fl="side" data-v="' + v + '" aria-selected="' + (S.cur === v) + '">' + ic(i) + t + '</button>';
    f.innerHTML = '<label class="fl-szsel"><span>Print size</span><select class="rds-select" data-fl="sizesel" aria-label="Print size">' + SIZES.map(x => '<option value="' + x.k + '"' + (x.k === P.size ? ' selected' : '') + '>' + x.n + ' · ' + x.d + '</option>').join('') + '</select></label>' +
      '<div class="rds-tabs"><div class="rds-tabs__list" role="tablist" aria-label="Flyer side">' + tab(0, 'file', 'Front') +
        (two ? tab(1, 'file-text', 'Back') : '<button type="button" class="rds-tab" data-fl="addback" title="Add a back side">' + ic('plus') + 'Back side</button>') + '</div></div>' +
      (two && S.cur === 1 ? '<button type="button" class="rds-btn rds-btn--ghost rds-btn--icon fl-segx" data-fl="delback" title="Remove back side" aria-label="Remove back side">' + ic('trash') + '</button>' : '');
  }
  function renderEdit(){
    $('fl-body').innerHTML = '<div class="pkedit open fl-pks"><aside class="side"><nav class="mrail" aria-label="Sections">' + RAIL.map(r => '<button type="button" class="mri' + (S.tool === r[0] ? ' on' : '') + '" data-fl="tool" data-v="' + r[0] + '" style="--ri:' + RSVG[r[0]][0] + '"><span class="i">' + RSVG[r[0]][2] + '</span>' + RSVG[r[0]][1] + '</button>').join('') + '</nav>' +
      '<div class="mcol"><div class="sbody" id="fl-panel"></div><div class="melchat"><div class="melchat-box"><input class="melchat-in" id="fl-melq" type="text" placeholder="Tell Mel what to change" aria-label="Tell Mel what to change" autocomplete="off"><button class="melchat-ic melchat-mic" type="button" data-fl="melgo" title="Send to Mel" aria-label="Send to Mel"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="2.5" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M8.5 21h7"/></svg></button></div></div></div></aside></div>' +
      '<div class="fl-stage" id="fl-stage"><div class="fl-psz" id="fl-psz"></div><div class="fl-ctx" id="fl-ctx"></div><div class="fl-canvas" id="fl-canvas"></div><div class="fl-ovl" id="fl-ovl"></div>' +
      '<div class="fl-acts"><button type="button" class="ico" data-fl="undo" title="Undo" aria-label="Undo">' + ic('arrow-counter-clockwise') + '</button><button type="button" class="ico" data-fl="redo" title="Redo" aria-label="Redo">' + ic('arrow-clockwise') + '</button><span class="sep" aria-hidden="true"></span><button type="button" data-fl="regen">' + ic('arrows-clockwise') + '<span class="mlab">Regenerate</span></button><span class="sep" aria-hidden="true"></span><button type="button" data-fl="save">' + ic('books') + 'Save</button><button type="button" data-fl="dlpdf">' + ic('download-simple') + 'Download PDF</button><button type="button" class="cta" data-fl="print">' + ic('paper-plane-tilt') + 'Send</button></div></div>';
    renderPanel(); renderCtx(); renderCanvas(); renderFoot();
    const cv = $('fl-canvas'); cv.addEventListener('scroll', paintSel, { passive:true });
  }
  function renderStart(){
    const types = S.stype === 'all' ? TYPES : TYPES.filter(t => t.k === S.stype);
    $('fl-body').innerHTML = '<div class="fl-start" id="fl-start"><div class="fl-hero"><div class="l"><h2>Design a flyer</h2><p>Pick a print size, then a template. Mel fills in the photos, price and your details from the listing.</p></div><div class="fl-sz">' +
      SIZES.map(z => { const r = z.w / z.h, h = 34; return '<button class="fl-szc' + (S.ssize === z.k ? ' on' : '') + '" data-fl="ssize" data-v="' + z.k + '"><i style="width:' + Math.round(h * r) + 'px;height:' + h + 'px"></i>' + z.n + '<small>' + z.d + '</small></button>'; }).join('') + '</div></div>' +
      '<div class="fl-sec"><div class="fl-sech"><div class="fl-listing"><span style="font:500 13px var(--font);color:var(--neutral-500)">Listing</span><select class="fl-in" style="width:240px" data-fl="slist">' + LIST.map(l => '<option value="' + l.id + '"' + (l.id === S.slist ? ' selected' : '') + '>' + esc(addrOf(l)) + '</option>').join('') + '</select></div><div class="fl-sp"></div><div class="fl-chips"><button class="fl-chip' + (S.stype === 'all' ? ' on' : '') + '" data-fl="stype" data-v="all">All</button>' + TYPES.map(t => '<button class="fl-chip' + (S.stype === t.k ? ' on' : '') + '" data-fl="stype" data-v="' + t.k + '">' + t.n + '</button>').join('') + '</div></div></div>' +
      types.map(t => '<div class="fl-sec"><div class="fl-sech"><h3>' + t.n + '</h3></div><div class="fl-sgrid">' + layoutsFor(t.k, S.ssize).map(l => '<button class="fl-card" data-fl="newtpl" data-t="' + t.k + '" data-l="' + l + '"><span class="fl-tpl">' + pageEl(mkPage(t.k, l, S.ssize, S.slist)) + '</span><span class="fl-tn">' + LAYOUTS[l] + (l === 'editorial' ? '<span class="fl-new">New</span>' : '') + '</span></button>').join('') + '</div></div>').join('') + '</div>';
  }
  function render(){ app.classList.toggle('fl-editing', S.view === 'edit'); renderTop(); S.view === 'edit' ? renderEdit() : renderStart(); }

  /* ---------- selection overlay ---------- */
  function paintSel(){
    const o = $('fl-ovl'), st = $('fl-stage'); if(!o || !st) return;
    app.querySelectorAll('.fl-lyr').forEach(r => r.classList.toggle('on', S.sel.includes(r.dataset.ly)));
    app.querySelectorAll('.fl-pwrap.pgsel').forEach(x => x.classList.remove('pgsel'));
    const els = S.sel.map(id => [id, elOf(id)]).filter(a => a[1]);
    if(S.sel.length && !els.length) S.sel = [];
    if(!els.length){ const w = app.querySelector('.fl-pwrap[data-pi="' + S.cur + '"]'); if(w && !S.grid) w.classList.add('pgsel'); o.innerHTML = ''; return; }
    const sr = st.getBoundingClientRect(), multi = els.length > 1, P = cp();
    let L = 1e9, T = 1e9, R = -1e9, B = -1e9;
    const boxes = els.map(a => { const r = a[1].getBoundingClientRect(), x = r.left - sr.left, y = r.top - sr.top;
      L = Math.min(L, x); T = Math.min(T, y); R = Math.max(R, x + r.width); B = Math.max(B, y + r.height);
      const lk = locked(a[0]), hd = !multi && !lk && kindOf(a[0]) === 'text';
      return '<div class="fl-sbox' + (multi ? ' m' : '') + (lk ? ' lk' : '') + '" style="left:' + (x - 2) + 'px;top:' + (y - 2) + 'px;width:' + (r.width + 4) + 'px;height:' + (r.height + 4) + 'px">' +
        (hd ? ['nw','ne','sw','se'].map(h => '<span class="fl-h ' + h + '" data-h="' + h + '"></span>').join('') : '') + (multi || lk ? '' : '<span class="fl-tag">' + esc(labelOf(P, a[0])) + '</span>') + '</div>'; }).join('');
    const lk = S.sel.some(locked), mb = (a, i, t) => '<button data-fl="' + a + '" title="' + t + '" aria-label="' + t + '">' + ic(i) + '</button>';
    const mini = '<div class="fl-mini" style="left:' + Math.max(110, Math.min(sr.width - 110, (L + R) / 2)) + 'px;top:' + Math.max(68, T - 54) + 'px">' +
      (multi ? '<span class="fl-mt">' + els.length + ' selected</span><i class="fl-cd"></i>' : '') +
      (P.lock ? '' : mb('lock', lk ? 'lock-simple' : 'lock-simple-open', lk ? 'Unlock' : 'Lock')) + (lk ? '' : mb('del', 'trash', 'Delete')) +
      '<div class="fl-popw">' + mb('pop" data-v="more', 'dots-three', 'More') + (S.pop === 'more' ? '<div class="fl-menu r" style="display:block">' +
        (!multi && kindOf(S.sel[0]) === 'text' && !lk ? mi('edittext', 'pencil-simple', 'Edit text') : '') + (!multi && kindOf(S.sel[0]) === 'img' && !lk ? mi('replace', 'swap', 'Replace photo') : '') +
        mi('copyst', 'paint-brush', 'Copy style') + (S.clip && !lk ? mi('pastest', 'paint-bucket', 'Paste style') : '') + (!lk ? mi('resetst', 'arrow-counter-clockwise', 'Reset style') : '') + '</div>' : '') + '</div></div>';
    o.innerHTML = (multi ? '<div class="fl-gbox" style="left:' + (L - 6) + 'px;top:' + (T - 6) + 'px;width:' + (R - L + 12) + 'px;height:' + (B - T + 12) + 'px"></div>' : '') + boxes + mini;
  }
  const refresh = () => { renderCanvas(); renderCtx(); };

  /* ---------- dialogs: template preview · print PDF · download ---------- */
  const X = { fmt:'pdf', scope:'all' };
  const PR = { scope:'all', bleed:true, marks:true, paper:'standard', finish:'matte' };
  function dlg(html, wide){ const w = $('fl-dlgw'); w.innerHTML = '<div class="fl-dlg' + (wide ? ' wide' : '') + '">' + html + '</div>'; w.classList.add('open'); }
  const closeDlg = () => { $('fl-dlgw').classList.remove('open'); S.td = null; };
  const opt = (a, g, v, cur, t, d, thumb) => '<button class="fl-opt' + (cur === v ? ' on' : '') + '" data-fl="' + a + '" data-g="' + g + '" data-v="' + v + '"><span class="r"></span><span style="flex:1;min-width:0">' + t + '<small>' + d + '</small></span>' + (thumb || '') + '</button>';
  const tg = (a, g, on, t, d) => '<div class="fl-row"><span style="flex:1">' + t + '<small>' + d + '</small></span><button class="fl-tg' + (on ? ' on' : '') + '" data-fl="' + a + '" data-g="' + g + '" aria-label="' + t + '"></button></div>';
  const sizeRows = (cur, act) => '<div class="fl-szl">' + SIZES.map(z => { const r = z.w / z.h, h = 28; return '<button class="fl-szr' + (z.k === cur ? ' on' : '') + '" data-fl="' + act + '" data-v="' + z.k + '"><i style="width:' + Math.round(h * r) + 'px;height:' + h + 'px"></i><span>' + z.c + '<small>' + z.d + '</small></span></button>'; }).join('') + '</div>';
  function tplDlg(){
    const t = S.td.t, l = S.td.l, z = zOf(S.ssize), P = mkPage(t, l, S.ssize, S.slist), key = t + l;
    const pw2 = ratio(S.ssize) > 1 ? 560 : 400;
    dlg('<div class="fl-tdl"><div class="fl-tdstage">' + pageEl(P, { w:pw2 }) + '</div><div class="fl-tdthumbs">' + layoutsFor(t, S.ssize).map(x => '<button class="fl-tpl' + (x === l ? ' on' : '') + '" data-fl="tdl" data-v="' + x + '" title="' + LAYOUTS[x] + '">' + pageEl(mkPage(t, x, S.ssize, S.slist)) + '</button>').join('') + '</div></div>' +
      '<div class="fl-tdr"><div class="fl-dh" style="padding:0"><h3>' + LAYOUTS[l] + ' ' + TYPES.find(x => x.k === t).n.toLowerCase() + ' flyer</h3><button class="fl-btn ico" data-fl="closedlg" aria-label="Close">' + ic('x') + '</button></div>' +
      '<p class="fl-tdsub">' + z.c + ' · ' + z.d + '</p><p class="fl-note" style="margin-top:8px">Filled from ' + esc(addrOf(lst(S.slist))) + '. Every text, photo and color stays editable.</p>' +
      '<div class="fl-lab">Flyer type</div><div class="fl-chips">' + TYPES.filter(x => x.k !== 'multi').map(x => '<button class="fl-chip' + (x.k === t ? ' on' : '') + '" data-fl="tdt" data-v="' + x.k + '">' + x.n + '</button>').join('') + '</div>' +
      '<div class="fl-lab">Size</div>' + sizeRows(S.ssize, 'tds') +
      '<div class="fl-tdf"><button class="fl-btn pri" data-fl="customize">Customize this template</button><button class="fl-btn ico' + (S.fav[key] ? ' on' : '') + '" data-fl="fav" title="' + (S.fav[key] ? 'Remove from favorites' : 'Add to favorites') + '" aria-label="Favorite">' + ic('star') + '</button></div></div>', true);
  }
  const D = { mode:'email', contact:'bay', name:'Bay Print Co.', email:'orders@bayprint.co', err:'', sent:null };
  const PRINTERS = [{ k:'bay', n:'Bay Print Co.', e:'orders@bayprint.co' }];
  const dvDest = () => ({ n:D.name.trim(), e:D.email.trim() });

  /* ---------- send states: RDS toast (Radius UI Design System feedback/Toast) ---------- */
  const SENDX = window.__sendX = { google:true, failNext:null };  /* demo toggles: google=false or failNext='network' */
  const RDS_ICON = {
    check: '<svg class="tic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
    err:   '<svg class="tic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
    google:'<svg class="tic" viewBox="0 0 24 24"><path d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10 5.35 0 9.25-3.67 9.25-9.09 0-.17-.02-.66-.15-1.81z" fill="#5A5FF2"/></svg>'
  };
  function rdsToast(o){
    if(!document.getElementById('rds-toast-css')){
      const s = document.createElement('style'); s.id = 'rds-toast-css';
      s.textContent = '.rds-sonner{position:fixed;bottom:20px;right:20px;display:flex;flex-direction:column;gap:10px;z-index:10001}' +
        '.rds-toast{display:flex;align-items:flex-start;gap:12px;width:340px;max-width:88vw;padding:12px 16px;background:var(--popover,#fff);color:var(--popover-foreground,#0A0A0A);border:1px solid var(--border,#E5E5E5);border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,.12);font-family:\'Mona Sans\',sans-serif;opacity:0;transform:translateY(8px);transition:opacity .18s ease,transform .18s ease}' +
        '.rds-toast.in{opacity:1;transform:none}' +
        '.rds-toast svg.tic{width:18px;height:18px;flex-shrink:0;margin-top:1px}' +
        '.rds-toast__title{font-size:14px;font-weight:500;margin:0;line-height:20px}' +
        '.rds-toast__desc{font-size:13px;color:var(--muted-foreground,#525252);margin:2px 0 0;line-height:18px}' +
        '.rds-toast--success svg.tic{color:#6da544}.rds-toast--error svg.tic{color:#dc2626}' +
        '.rds-toast__act{flex:none;align-self:center;border:1px solid var(--border,#E5E5E5);background:#fff;color:#5A5FF2;font:600 12.5px \'Mona Sans\',sans-serif;padding:6px 10px;border-radius:6px;cursor:pointer}' +
        '.rds-toast__act:hover{background:#F5F5F5}' +
        '.rds-toast__x{flex:none;border:0;background:none;color:#8a8a8a;cursor:pointer;font-size:13px;padding:2px}' +
        '.rds-spin{width:14px;height:14px;border:2px solid rgba(90,95,242,.25);border-top-color:#5A5FF2;border-radius:50%;display:inline-block;animation:rdsspin .7s linear infinite;flex-shrink:0;margin-top:2px}' +
        '@keyframes rdsspin{to{transform:rotate(360deg)}}';
      document.head.appendChild(s);
    }
    let w = document.querySelector('.rds-sonner');
    if(!w){ w = document.createElement('div'); w.className = 'rds-sonner'; document.body.appendChild(w); }
    const t = document.createElement('div');
    t.className = 'rds-toast' + (o.variant ? ' rds-toast--' + o.variant : '');
    t.setAttribute('role', 'status');
    t.innerHTML = (o.spin ? '<span class="rds-spin"></span>' : (o.icon || '')) +
      '<div style="flex:1;min-width:0">' + (o.title ? '<p class="rds-toast__title"></p>' : '') + (o.desc ? '<p class="rds-toast__desc"></p>' : '') + '</div>';
    if(o.title) t.querySelector('.rds-toast__title').textContent = o.title;
    if(o.desc) t.querySelector('.rds-toast__desc').textContent = o.desc;
    const kill = () => { t.classList.remove('in'); setTimeout(() => t.remove(), 180); };
    if(o.action){
      const a = document.createElement('button'); a.className = 'rds-toast__act'; a.textContent = o.action.label;
      a.onclick = () => { kill(); o.action.run(); };
      t.appendChild(a);
    }
    const x = document.createElement('button'); x.className = 'rds-toast__x'; x.textContent = '\u00d7'; x.setAttribute('aria-label', 'Dismiss');
    x.onclick = kill; t.appendChild(x);
    w.appendChild(t);
    requestAnimationFrame(() => t.classList.add('in'));
    if(o.sticky !== true) setTimeout(kill, o.ms || 4200);
    return { el:t, kill };
  }
  function rdsSend(d){
    const t = rdsToast({ spin:true, title:'Sending flyer\u2026', desc:'To ' + d.n + ' \u00b7 ' + d.e, sticky:true });
    setTimeout(() => {
      t.kill();
      if(!SENDX.google){
        rdsToast({ variant:'error', icon:RDS_ICON.google, title:'Google account not connected', desc:'Connect Google to send the print-ready PDF from your own Gmail.', sticky:true,
          action:{ label:'Connect', run(){ rdsConnect(d); } } });
        return;
      }
      if(SENDX.failNext === 'network'){
        SENDX.failNext = null;
        rdsToast({ variant:'error', icon:RDS_ICON.err, title:'Couldn\u2019t send the flyer', desc:'Network error talking to Gmail. Nothing was sent.', sticky:true,
          action:{ label:'Retry', run(){ rdsSend(d); } } });
        return;
      }
      rdsToast({ variant:'success', icon:RDS_ICON.check, title:'Flyer sent', desc:d.n + ' \u00b7 ' + d.e + ' \u2014 from krish@radiusagent.com' });
    }, 1500);
  }
  function rdsConnect(d){
    const t = rdsToast({ spin:true, title:'Connecting Google\u2026', desc:'Authorising krish@radiusagent.com', sticky:true });
    setTimeout(() => {
      t.kill(); SENDX.google = true;
      rdsToast({ variant:'success', icon:RDS_ICON.check, title:'Google account connected', desc:'krish@radiusagent.com' });
      setTimeout(() => rdsSend(d), 700);
    }, 1300);
  }
  function printDlg(){
    const P = cp(), z = zOf(P.size), pw2 = ratio(P.size) > 1 ? 420 : 300, two = S.pages.length > 1;
    const sum = z.c + ' · ' + z.d + ' · ' + (ratio(P.size) > 1 ? 'Landscape' : 'Portrait') + ' · ' + (two ? 'Front and back' : 'Front only');
    const dest = dvDest();
    let body;
    if(D.sent){
      body = '<div class="fl-tdscroll"><div class="fl-done">' + ic('check-circle') + '<span>Sent to ' + esc(D.sent.n) + '<small style="display:block;font-weight:400;color:var(--neutral-600)">' + esc(D.sent.e) + ' · print-ready PDF attached</small></span></div><p class="fl-note">' + esc(sum) + '. A copy is in your inbox.</p></div>' +
        '<div class="fl-tdf"><button class="fl-btn" data-fl="dvagain">Send to another printer</button><button class="fl-btn pri" data-fl="closedlg">Done</button></div>';
    } else if(D.mode === 'email'){
      const cur = PRINTERS.find(x => x.k === D.contact);
      body = '<div class="fl-tdscroll"><div class="fl-lab" style="margin-top:0">Saved printers</div><button type="button" class="fl-dd' + (D.open ? ' open' : '') + '" data-fl="dvdd" aria-haspopup="listbox" aria-expanded="' + !!D.open + '"><span' + (cur ? '' : ' class="ph"') + '>' + esc(cur ? cur.n : 'Select a saved printer') + '</span>' + ic('caret-down') + '</button>' +
        (D.open ? '<div class="fl-ddm" role="listbox">' + PRINTERS.map(p => '<button type="button" role="option" class="fl-ddi' + (D.contact === p.k ? ' on' : '') + '" data-fl="dvpick" data-v="' + p.k + '"><b>' + esc(p.n) + '</b><small>' + esc(p.e) + '</small></button>').join('') + '</div>' : '') +
        '<div class="fl-lab">Contact name</div><input class="fl-in" data-dv="name" type="text" placeholder="Print shop name" value="' + esc(D.name) + '"><div class="fl-lab">Destination email</div><input class="fl-in" data-dv="email" type="email" placeholder="orders@printshop.com" value="' + esc(D.email) + '">' +
        '<div class="fl-note" id="fl-dverr" style="color:var(--destructive)">' + esc(D.err) + '</div></div>' +
        '<div class="fl-tdf"><button class="fl-btn" data-fl="closedlg">Cancel</button><button class="fl-btn pri" data-fl="dvsend">' + ic('envelope-simple') + 'Send flyer</button></div>';
    } else {
      body = '<div class="fl-tdscroll"><div class="fl-lab">Print marks</div>' + tg('prtg', 'bleed', PR.bleed, 'Add bleed', (z.u === 'mm' ? '3 mm' : '0.125 in') + ' on every edge so color runs past the trim') + (PR.bleed ? tg('prtg', 'marks', PR.marks, 'Crop marks', 'Trim lines for your print shop') : '') +
        '<div class="fl-note">Opens your print window. Choose Save as PDF to download the file.</div></div>' +
        '<div class="fl-tdf"><button class="fl-btn" data-fl="closedlg">Cancel</button><button class="fl-btn pri" data-fl="doprint">' + ic('download-simple') + 'Download PDF</button></div>';
    }
    dlg('<div class="fl-tdl"><div class="fl-tdstage">' + pageEl(P, { w:pw2, bleed:PR.bleed && D.mode === 'pdf' }) + '</div></div>' +
      '<div class="fl-tdr"><div class="fl-dh" style="padding:0"><h3>' + (D.mode === 'pdf' ? 'Download PDF' : 'Send to printer') + '</h3><button class="fl-btn ico" data-fl="closedlg" aria-label="Close">' + ic('x') + '</button></div><p class="fl-tdsub">' + (D.sent ? 'Delivered.' : (D.mode === 'pdf' ? 'Your print-ready PDF. Attach it yourself or upload it to an online printer.' : 'Choose a saved printer or enter one below.')) + '</p>' +
      body + '</div>', true);
  }
  function sendFlyer(){
    const d = dvDest();
    if(!d.n){ D.err = 'Add the printer\u2019s name.'; return printDlg(); }
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.e)){ D.err = 'Enter a valid destination email.'; return printDlg(); }
    const hit = PRINTERS.find(x => x.e.toLowerCase() === d.e.toLowerCase());
    if(hit){ hit.n = d.n; D.contact = hit.k; } else { const k = 'c' + Date.now(); PRINTERS.push({ k, n:d.n, e:d.e }); D.contact = k; }
    D.err = '';
    closeDlg();            /* success/failure report via RDS toast only — no popup result view */
    rdsSend(d);
  }
  function printPDF(){
    const P = cp(), z = zOf(P.size), pages = PR.scope === 'all' ? S.pages : [P];
    const b = PR.bleed ? (z.u === 'mm' ? 3 : .125) : 0, u = z.u, W = z.w + 2 * b, H = z.h + 2 * b;
    const pap = PAPER.find(p => p[0] === PR.paper), fin = FINISH.find(p => p[0] === PR.finish);
    const mk = (b && PR.marks) ? (() => { const m = 'position:absolute;background:#000;z-index:9;'; const L = b * .75 + u;
      return ['left:0;top:' + b + u + ';width:' + L + ';height:.25pt', 'left:' + b + u + ';top:0;width:.25pt;height:' + L, 'right:0;top:' + b + u + ';width:' + L + ';height:.25pt', 'right:' + b + u + ';top:0;width:.25pt;height:' + L,
        'left:0;bottom:' + b + u + ';width:' + L + ';height:.25pt', 'left:' + b + u + ';bottom:0;width:.25pt;height:' + L, 'right:0;bottom:' + b + u + ';width:' + L + ';height:.25pt', 'right:' + b + u + ';bottom:0;width:.25pt;height:' + L].map(s => '<i style="' + m + s + '"></i>').join('') +
        ''; })() : '';
    const fonts = new URL('_ds/radius-ui-design-system-c7220bb1-3534-4549-94e9-dd1c4d80b981/tokens/fonts.css', location.href).href;
    const html = '<!doctype html><html><head><base href="' + esc(location.href) + '"><link rel="stylesheet" href="' + fonts + '"><style>@page{size:' + W + u + ' ' + H + u + ';margin:0}html,body{margin:0;padding:0}*{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}' +
      '.sh{position:relative;width:' + W + u + ';height:' + H + u + ';overflow:hidden;break-after:page}.sh:last-child{break-after:auto}.fl-page{position:absolute!important;inset:0;width:100%!important;height:100%!important;aspect-ratio:auto!important;container-type:inline-size;overflow:hidden}</style></head><body>' +
      pages.map(p => '<div class="sh">' + pageEl(Object.assign({}, p, { size:P.size })) + mk + '</div>').join('') + '</body></html>';
    const fr = document.createElement('iframe'); fr.setAttribute('aria-hidden', 'true'); fr.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden';
    document.body.appendChild(fr);
    const d = fr.contentWindow.document; d.open(); d.write(html); d.close();
    const go = () => { try { fr.contentWindow.focus(); fr.contentWindow.print(); } catch(err){ console.warn('[flyer print] ' + err.message); toast('Print was blocked', 'Open the page in its own tab and try again'); } setTimeout(() => fr.remove(), 60000); };
    fr.onload = () => { const f = fr.contentWindow.document.fonts; (f && f.ready ? f.ready : Promise.resolve()).then(() => setTimeout(go, 200)); };
    closeDlg(); toast('PDF downloaded', z.n + (b ? ' · with bleed' : '') + (b && PR.marks ? ' and crop marks' : ''));
  }
  function exportDlg(){
    const P = cp(), z = zOf(P.size);
    dlg('<div class="fl-dh"><h3>Download</h3><button class="fl-btn ico" data-fl="closedlg" aria-label="Close">' + ic('x') + '</button></div><div class="fl-db">' +
      '<div class="fl-lab" style="margin-top:6px">File type</div>' + opt('x', 'fmt', 'pdf', X.fmt, 'PDF to share', 'Smaller file for email and text') + opt('x', 'fmt', 'png', X.fmt, 'PNG', 'Image for social and listing portals') +
      '<button class="fl-opt" data-fl="print"><span class="r" style="border:0">' + ic('printer') + '</span><span style="flex:1">PDF for print<small>Bleed, crop marks and paper options</small></span>' + ic('caret-right') + '</button>' +
      (S.pages.length > 1 ? '<div class="fl-lab">Pages</div>' + opt('x', 'scope', 'all', X.scope, 'Front and back', 'One file') + opt('x', 'scope', 'cur', X.scope, (S.cur ? 'Back' : 'Front') + ' only', 'One page') : '') +
      '</div><div class="fl-df"><span style="flex:1;font:400 12px var(--font);color:var(--neutral-500)">' + z.n + ' · ' + z.d + '</span><button class="fl-btn" data-fl="closedlg">Cancel</button><button class="fl-btn pri" data-fl="dodl">' + ic('download-simple') + 'Download</button></div>');
  }
  function runDl(){
    const n = X.scope === 'all' ? S.pages.length : 1, nm = cp().nm.replace(/[^\w ·-]/g, '');
    dlg('<div class="fl-dh"><h3>Preparing your file</h3></div><div class="fl-db"><div class="fl-prog"><i id="fl-pr"></i></div><div style="font:400 13px var(--font);color:var(--neutral-600)">Rendering ' + n + (n === 1 ? ' page' : ' pages') + '…</div></div><div class="fl-df"></div>');
    let p = 0; const iv = setInterval(() => { p += 17 + Math.random() * 14; const bar = $('fl-pr'); if(bar) bar.style.width = Math.min(p, 100) + '%';
      if(p >= 100){ clearInterval(iv); dlg('<div class="fl-dh"><h3>Ready</h3></div><div class="fl-db"><div class="fl-done">' + ic('check-circle') + '<span>' + esc(nm) + (X.fmt === 'png' ? '.png' : '.pdf') + '<small style="display:block;font-weight:400;color:var(--neutral-600)">Optimised for sharing</small></span></div></div><div class="fl-df"><span class="fl-sp"></span><button class="fl-btn pri" data-fl="closedlg">Done</button></div>'); toast('Flyer downloaded', nm); } }, 260);
  }

  function melAsk(){
    const q = $('fl-melq'), t = (q && q.value || '').toLowerCase().trim(); if(!t) return;
    const cols = { orange:'#E8622F', indigo:'#5A5FF2', blue:'#5A5FF2', teal:'#0F766E', green:'#0F766E', red:'#BE123C', black:'#0A0A0A', white:'#FFFFFF' };
    const c = Object.keys(cols).find(k => t.includes(k)), texts = S.sel.filter(id => kindOf(id) === 'text');
    if(/bigger|larger|increase/.test(t) && texts.length){ S.sel = texts; setFx((x, id) => setPt(id, x, Math.round(ptOf(id) * 1.15))); }
    else if(/smaller|decrease/.test(t) && texts.length){ S.sel = texts; setFx((x, id) => setPt(id, x, Math.round(ptOf(id) * .87))); }
    else if(/bold/.test(t) && texts.length) setFx(x => { x.b = true; });
    else if(/italic/.test(t) && texts.length) setFx(x => { x.i = true; });
    else if(c && S.sel.length) setFx(x => { x.c = cols[c]; });
    else if(c){ commit(); cp().acc = cols[c]; refresh(); renderPanel(); }
    else { toast('Select a layer first', 'Then try “make it bigger”, “bold” or “orange”'); return; }
    q.value = ''; toast('Done', 'Undo if it is not right');
  }
  /* ---------- actions ---------- */
  const setFx = fn => { commit(); const P = cp(); S.sel.forEach(id => { if(locked(id)) return; fn(P.fx[id] || (P.fx[id] = {}), id); }); refresh(); };
  function setPt(id, x, pt){ const el = elOf(id); if(!el) return; const cqw = parseFloat(el.style.fontSize), base = cqw / (x.sz || 1); x.sz = Math.max(.15, Math.min(5, pt * 100 / pagePt(cp().size) / base)); }
  function relayoutSize(P, size){ P.size = size; if(size === 'post') P.layout = 'wide'; else if(P.layout === 'wide') P.layout = P.type === 'multi' ? 'mgrid' : 'editorial'; }
  function editText(id){ const el = elOf(id); if(!el || locked(id)) return; S.sel = [id]; paintSel(); el.contentEditable = 'true'; el.focus(); const r = document.createRange(); r.selectNodeContents(el); const s = getSelection(); s.removeAllRanges(); s.addRange(r); }
  function del(){ const ids = S.sel.filter(id => !locked(id)); if(!ids.length) return; commit(); ids.forEach(id => { (cp().fx[id] || (cp().fx[id] = {})).hide = true; }); S.sel = []; S.pop = null; refresh(); renderPanel(); toast(ids.length > 1 ? ids.length + ' elements deleted' : labelOf(cp(), ids[0]) + ' deleted', 'Press Undo to bring it back'); }
  function newPage(dup){ commit(); const P = cp(); const n = dup ? JSON.parse(JSON.stringify(P)) : mkPage(P.type, P.layout, P.size, P.listing); if(!dup){ n.acc = P.acc; n.bg = P.bg; n.font = P.font; } n.lock = false; S.pages.splice(S.cur + 1, 0, n); S.cur++; S.sel = []; render(); toast(dup ? 'Page duplicated' : 'Page added', 'Page ' + (S.cur + 1) + ' of ' + S.pages.length); }

  app.addEventListener('click', e => {
    if(S.pop && !e.target.closest('.fl-popw, .fl-sel, [data-fl="pop"]')){ S.pop = null; renderTop(); renderCtx(); renderFoot(); paintSel(); }
    const ce = e.target.closest('[contenteditable="true"]'); if(ce) return;
    if(S.view === 'edit'){
      const el = e.target.closest('#fl-canvas [data-el]');
      if(el && !S.grid){ const pi = +el.closest('.fl-pwrap').dataset.pi, id = el.dataset.el;
        if(pi !== S.cur){ S.cur = pi; S.sel = []; renderCanvas(); renderFoot(); renderPanel(); }
        if(e.shiftKey || e.metaKey) S.sel = S.sel.includes(id) ? S.sel.filter(x => x !== id) : S.sel.concat(id); else S.sel = [id];
        if(id.startsWith('img')) cp().slot = +id.slice(3);
        S.pop = null; renderCtx(); paintSel(); if(S.tool === 'photos') renderPanel(); return; }
      const pg = e.target.closest('#fl-canvas .fl-page');
      if(pg){ const pi = +pg.closest('.fl-pwrap').dataset.pi; if(S.grid){ S.grid = false; S.cur = pi; S.sel = []; renderEdit(); return; } if(pi !== S.cur){ S.cur = pi; renderCanvas(); renderFoot(); renderPanel(); } S.sel = []; renderCtx(); paintSel(); return; }
      if(e.target.closest('#fl-canvas') && !e.target.closest('[data-fl]')){ S.sel = []; renderCtx(); paintSel(); return; }
    }
    if(e.target === $('fl-dlgw')){ closeDlg(); return; }
    const b = e.target.closest('[data-fl]'); if(!b) return;
    const a = b.dataset.fl, v = b.dataset.v, pwrap = b.closest('.fl-pwrap');
    if(pwrap && +pwrap.dataset.pi !== S.cur){ S.cur = +pwrap.dataset.pi; S.sel = []; }
    if(a === 'listing' || a === 'slist' || a === 'zoom' || a === 'szin' || a === 'sizesel' || a === 'dvcontact') return;
    const P = cp();
    switch(a){
      case 'exit': S.sel = []; S.pop = null; app.classList.remove('open'); return;
      case 'sidetg': S.sideOff = !S.sideOff; app.classList.toggle('fl-sideoff', S.sideOff); renderTop(); renderCanvas(); return;
      case 'close': S.sel = []; S.pop = null; app.classList.remove('open'); return;
      case 'regen': { commit(); const d = mkPage(P.type, P.layout, P.size, P.listing); P.f = d.f; P.ph = d.ph; P.fx = {}; S.sel = []; refresh(); renderPanel(); toast('Regenerated', 'Fresh copy and photos from the template. Undo to go back.'); return; }
      case 'melgo': melAsk(); return;
      case 'pop': S.pop = S.pop === v ? null : v; renderTop(); renderCtx(); renderFoot(); paintSel(); return;
      case 'ssize': S.ssize = v; renderStart(); return;
      case 'stype': S.stype = v; renderStart(); return;
      case 'newtpl': S.td = { t:b.dataset.t, l:b.dataset.l }; tplDlg(); return;
      case 'tdl': S.td.l = v; tplDlg(); return;
      case 'tdt': S.td.t = v; if(!layoutsFor(v, S.ssize).includes(S.td.l)) S.td.l = layoutsFor(v, S.ssize)[0]; tplDlg(); return;
      case 'tds': S.ssize = v; if(!layoutsFor(S.td.t, v).includes(S.td.l)) S.td.l = layoutsFor(S.td.t, v)[0]; tplDlg(); renderStart(); return;
      case 'fav': { const k = S.td.t + S.td.l; S.fav[k] = !S.fav[k]; tplDlg(); toast(S.fav[k] ? 'Added to favorites' : 'Removed from favorites', LAYOUTS[S.td.l]); return; }
      case 'customize': { const t = S.td; closeDlg(); S.pages = [mkPage(t.t, t.l, S.ssize, S.slist)]; S.cur = 0; S.hist = []; S.fut = []; S.view = 'edit'; S.tool = 'templates'; S.ttype = t.t; S.sel = []; S.grid = false; render(); return; }
      case 'size': commit(); S.pages.forEach(pg => relayoutSize(pg, v)); S.sel = []; S.pop = null; render(); if($('fl-dlgw').classList.contains('open')) printDlg(); return;
      case 'tool': S.tool = v; app.querySelectorAll('.fl-pks .mri').forEach(x => x.classList.toggle('on', x.dataset.v === v)); renderPanel(); return;
      case 'ttype': S.ttype = v; renderPanel(); return;
      case 'applytpl': { commit(); const keep = { name:P.f.name, phone:P.f.phone, email:P.f.email, firm:P.f.firm }; const d = TPLDEF[v] || TPLDEF.x;
        if(P.type !== S.ttype){ P.type = S.ttype; P.f = Object.assign(defaults(S.ttype, lst(P.listing)), keep); P.nm = TYPES.find(x => x.k === S.ttype).n + ' · ' + lst(P.listing).a; }
        if(v === 'editorial'){ Object.assign(P.f, SEMINAR); P.ph = [4,5,0,1]; } else if(P.layout === 'editorial'){ P.f = Object.assign(defaults(P.type, lst(P.listing)), keep); P.ph = [0,1,2,3]; }
        P.layout = v; P.acc = d.acc; P.bg = d.bg; P.fx = {}; S.sel = []; renderTop(); renderPanel(); refresh(); return; }
      case 'photo': commit(); P.ph[P.slot] = +v; renderPanel(); refresh(); return;
      case 'acc': commit(); P.acc = v; renderPanel(); refresh(); return;
      case 'bgc': commit(); P.bg = v; renderPanel(); refresh(); return;
      case 'font': commit(); P.font = v; renderPanel(); refresh(); return;
      case 'ffont': setFx(x => { x.ff = v === P.font ? undefined : v; }); return;
      case 'col': setFx(x => { x.c = v; }); return;
      case 'tg': { const on = S.sel.every(id => isOn(id, v)); setFx(x => { x[v] = !on; }); return; }
      case 'al': { const el = elOf(S.sel[0]), cur = el ? el.style.textAlign : 'left', nx = { left:'center', center:'right', right:'left' }[cur] || 'left'; setFx(x => { x.al = nx; }); return; }
      case 'szu': case 'szd': setFx((x, id) => { setPt(id, x, Math.round(ptOf(id)) + (a === 'szu' ? 1 : -1)); }); return;
      case 'flip': setFx(x => { x.fl = !x.fl; }); return;
      case 'replace': S.tool = 'photos'; P.slot = +S.sel[0].slice(3); S.pop = null; renderEdit(); return;
      case 'lock': { const lk = S.sel.some(locked); commit(); S.sel.forEach(id => { (P.fx[id] || (P.fx[id] = {})).lock = !lk; }); S.pop = null; refresh(); toast(lk ? 'Unlocked' : 'Locked', lk ? 'You can edit it again' : 'It can’t be moved or edited until you unlock it'); return; }
      case 'del': del(); return;
      case 'lysel': if(e.shiftKey || e.metaKey) S.sel = S.sel.includes(v) ? S.sel.filter(x => x !== v) : S.sel.concat(v); else S.sel = [v]; if(v.startsWith('img')) P.slot = +v.slice(3); S.pop = null; renderCtx(); paintSel(); return;
      case 'lyhide': { commit(); const x = P.fx[v] || (P.fx[v] = {}); x.hide = !x.hide; if(x.hide) S.sel = S.sel.filter(i => i !== v); renderPanel(); refresh(); return; }
      case 'lylock': { commit(); if(P.lock){ P.lock = false; } else { const x = P.fx[v] || (P.fx[v] = {}); x.lock = !x.lock; } renderPanel(); refresh(); return; }
      case 'edittext': S.pop = null; editText(S.sel[0]); return;
      case 'copyst': { const x = Object.assign({}, P.fx[S.sel[0]] || {}); delete x.hide; delete x.lock; S.clip = x; S.pop = null; paintSel(); toast('Style copied', 'Select another element, then Paste style'); return; }
      case 'pastest': S.pop = null; setFx(x => { Object.assign(x, S.clip); }); return;
      case 'resetst': S.pop = null; setFx((x, id) => { P.fx[id] = x.lock ? { lock:true } : {}; }); return;
      case 'focuskey': S.sel = [v]; renderCtx(); editText(v); return;
      case 'unhide': commit(); delete P.fx[v].hide; renderPanel(); refresh(); return;
      case 'resetall': commit(); P.fx = {}; S.sel = []; renderPanel(); refresh(); return;
      case 'oldprice': commit(); P.f.old = P.f.old ? '' : money(Math.round(lst(P.listing).price * 1.06 / 1000) * 1000); renderPanel(); refresh(); return;
      case 'undo': if(S.hist.length){ S.fut.push(snap()); restore(S.hist.pop()); S.sel = []; render(); } return;
      case 'redo': if(S.fut.length){ S.hist.push(snap()); restore(S.fut.pop()); S.sel = []; render(); } return;
      case 'pglock': commit(); P.lock = !P.lock; S.pop = null; refresh(); toast(P.lock ? 'Page locked' : 'Page unlocked', 'Page ' + (S.cur + 1)); return;
      case 'side': S.cur = +v; S.sel = []; S.pop = null; renderTop(); renderPanel(); refresh(); renderFoot(); return;
      case 'pglock2': return;
      case 'addback': { commit(); const n = mkPage(P.type, P.layout, P.size, P.listing); n.acc = P.acc; n.bg = P.bg; n.font = P.font; n.nm = P.nm + ' (back)'; S.pages = [S.pages[0], n]; S.cur = 1; S.sel = []; S.tool = 'templates'; render(); toast('Back side added', 'Pick a template for it, or edit it like the front'); return; }
      case 'delback': if(S.pages.length > 1){ commit(); S.pages = [S.pages[0]]; S.cur = 0; S.sel = []; render(); toast('Back side removed', 'Undo to bring it back'); } return;
      case 'pgdup': newPage(true); return;
      case 'pgadd': newPage(false); return;
      case 'pgdel': if(S.pages.length > 1){ commit(); S.pages.splice(S.cur, 1); S.cur = Math.max(0, S.cur - 1); S.sel = []; render(); toast('Page deleted', 'Undo to bring it back'); } return;
      case 'grid': S.grid = !S.grid; S.sel = []; renderCanvas(); renderFoot(); renderCtx(); return;
      case 'fit': { const c = $('fl-canvas'), h = c.clientHeight - 260, base = ratio(P.size) > 1 ? 720 : 540; S.zoom = Math.max(40, Math.min(160, Math.round(h / (base / ratio(P.size)) * 20) * 5)); S.grid = false; renderCanvas(); renderFoot(); return; }
      case 'bleedtg': S.bleed = !S.bleed; S.pop = null; renderTop(); renderCanvas(); renderFoot(); return;
      case 'zin': case 'zout': S.zoom = Math.max(40, Math.min(160, S.zoom + (a === 'zin' ? 10 : -10))); renderCanvas(); renderFoot(); return;
      case 'save': S.pop = null; renderTop(); toast('Saved to library', P.nm); return;
      case 'dlpdf': S.pop = null; renderTop(); D.mode = 'pdf'; D.sent = null; D.err = ''; printDlg(); return;
      case 'print': S.pop = null; renderTop(); D.mode = 'email'; D.open = false; D.sent = null; D.err = ''; printDlg(); return;
      case 'export': S.pop = null; renderTop(); exportDlg(); return;
      case 'closedlg': closeDlg(); return;
      case 'x': X[b.dataset.g] = v; exportDlg(); return;
      case 'dodl': runDl(); return;
      case 'pr': PR[b.dataset.g] = v; printDlg(); return;
      case 'prtg': PR[b.dataset.g] = !PR[b.dataset.g]; printDlg(); return;
      case 'doprint': printPDF(); return;
      case 'dvmode': D.mode = v; D.err = ''; printDlg(); return;
      case 'dvpick': { const p = PRINTERS.find(x => x.k === v); D.contact = v; D.open = false; D.name = p ? p.n : ''; D.email = p ? p.e : ''; D.err = ''; printDlg(); return; }
      case 'dvdd': D.open = !D.open; printDlg(); return;
      case 'dvsend': sendFlyer(); return;
      case 'dvagain': D.sent = null; D.contact = 'new'; D.name = D.email = ''; printDlg(); return;
    }
  });
  let dragId = null;
  app.addEventListener('dragstart', e => { const r = e.target.closest && e.target.closest('.fl-lyr'); if(!r) return; dragId = r.dataset.ly; r.classList.add('drag'); e.dataTransfer.effectAllowed = 'move'; try { e.dataTransfer.setData('text/plain', dragId); } catch(_){ } });
  app.addEventListener('dragover', e => { const r = e.target.closest && e.target.closest('.fl-lyr'); if(!r || !dragId) return; e.preventDefault();
    const b = r.getBoundingClientRect(), after = e.clientY > b.top + b.height / 2;
    app.querySelectorAll('.fl-lyr.dropa,.fl-lyr.dropb').forEach(x => x.classList.remove('dropa','dropb')); if(r.dataset.ly !== dragId) r.classList.add(after ? 'dropb' : 'dropa'); });
  app.addEventListener('drop', e => { const r = e.target.closest && e.target.closest('.fl-lyr'); if(!r || !dragId) return; e.preventDefault();
    const P = cp(), order = layersOf(P).map(l => l.id).filter(id => id !== dragId), b = r.getBoundingClientRect(), after = e.clientY > b.top + b.height / 2;
    let at = order.indexOf(r.dataset.ly); if(at < 0) at = order.length; else if(after) at++;
    order.splice(at, 0, dragId); commit(); order.forEach((id, i) => { (P.fx[id] || (P.fx[id] = {})).z = order.length - i; });
    dragId = null; renderPanel(); refresh(); });
  app.addEventListener('dragend', () => { dragId = null; app.querySelectorAll('.fl-lyr.drag,.fl-lyr.dropa,.fl-lyr.dropb').forEach(x => x.classList.remove('drag','dropa','dropb')); });
  app.addEventListener('pointerdown', e => {
    if(e.target.matches && e.target.matches('input[type="range"][data-fx]')){ commit(); return; }
    const h = e.target.closest('[data-h]'); if(!h) return;
    e.preventDefault(); commit();
    const id = S.sel[0], el = elOf(id), x = cp().fx[id] || (cp().fx[id] = {}), s0 = x.sz || 1, w0 = el.getBoundingClientRect().width, x0 = e.clientX, sg = /e/.test(h.dataset.h) ? 1 : -1;
    const mv = ev => { x.sz = Math.max(.15, Math.min(5, s0 * (1 + sg * (ev.clientX - x0) / w0))); renderCanvas(); };
    const up = () => { removeEventListener('pointermove', mv); removeEventListener('pointerup', up); renderCtx(); };
    addEventListener('pointermove', mv); addEventListener('pointerup', up);
  });
  app.addEventListener('input', e => {
    const t = e.target;
    if(t.id === 'fl-name'){ cp().nm = t.value; return; }
    if(t.dataset.dv){ D[t.dataset.dv] = t.value; D.err = ''; const r = $('fl-dvrev'), er = $('fl-dverr'); if(r) r.innerHTML = 'Review destination: <b>' + esc(dvDest().e || '—') + '</b>'; if(er) er.textContent = ''; return; }
    if(t.dataset.fi){ cp().f[t.dataset.fi] = t.value; renderCanvas(); return; }
    if(t.dataset.fx){ const P = cp(), v = +t.value; S.sel.forEach(id => { if(locked(id)) return; const x = P.fx[id] || (P.fx[id] = {}); if(t.dataset.fx === 'op') x.op = v / 100; else x.ls = v / 100; });
      const s = t.parentNode.querySelector('.fl-pl span'); if(s) s.textContent = t.dataset.fx === 'op' ? v + '%' : v; renderCanvas(); return; }
    if(t.dataset.fl === 'zoom'){ S.zoom = +t.value; renderCanvas(); const z = app.querySelector('.fl-foot .fl-fz'); if(z) z.textContent = S.zoom + '%'; }
  });
  app.addEventListener('change', e => {
    const t = e.target;
    if(t.dataset.fl === 'dvcontact'){ D.contact = t.value; D.err = ''; printDlg(); return; }
    if(t.dataset.fl === 'slist'){ S.slist = t.value; renderStart(); }
    if(t.dataset.fl === 'sizesel'){ commit(); S.pages.forEach(pg => relayoutSize(pg, t.value)); S.sel = []; render(); }
    if(t.dataset.fl === 'listing'){ commit(); const P = cp(), L = lst(t.value), keep = { name:P.f.name, phone:P.f.phone, email:P.f.email, firm:P.f.firm }; P.listing = t.value; P.f = Object.assign(defaults(P.type, L), keep); P.nm = TYPES.find(x => x.k === P.type).n + ' · ' + L.a; render(); }
    if(t.dataset.fl === 'szin'){ const pt = parseFloat(t.value); if(pt > 0) setFx((x, id) => setPt(id, x, pt)); else renderCtx(); }
    if(t.dataset.fc){ const v = t.value, a = t.dataset.fc; if(a === 'bgc'){ commit(); cp().bg = v; refresh(); } else setFx(x => { x.c = v; }); }
    if(t.dataset.fx) renderCtx();
  });
  app.addEventListener('focusin', e => {
    const t = e.target;
    if(t.matches && t.matches('[data-k][contenteditable="true"]')) commit();
    if(t.dataset && t.dataset.fi && S.view === 'edit' && elOf(t.dataset.fi)){ S.sel = [t.dataset.fi]; renderCtx(); paintSel(); }
  });
  app.addEventListener('dblclick', e => { const k = e.target.closest('#fl-canvas .fl-pwrap[data-pi="' + S.cur + '"] [data-k]'); if(k) editText(k.dataset.el); });
  app.addEventListener('focusout', e => {
    const k = e.target; if(!k.matches || !k.matches('[data-k][contenteditable="true"]')) return;
    k.contentEditable = 'false'; cp().f[k.dataset.k] = k.innerText.replace(/\n+/g, ' ').trim(); renderPanel(); refresh();
  });
  app.addEventListener('keydown', e => {
    const t = e.target, typing = t.matches && (t.matches('input, textarea, select') || t.isContentEditable);
    if(t.matches && t.matches('[data-k][contenteditable="true"]') && e.key === 'Enter'){ e.preventDefault(); t.blur(); return; }
    if(t.dataset && t.dataset.fl === 'szin' && e.key === 'Enter'){ t.blur(); return; }
    if(t.id === 'fl-melq' && e.key === 'Enter'){ e.preventDefault(); melAsk(); return; }
    if(e.key === 'Escape'){ if($('fl-dlgw').classList.contains('open')) closeDlg(); else if(S.pop){ S.pop = null; renderTop(); renderCtx(); paintSel(); } else if(S.sel.length){ S.sel = []; renderCtx(); paintSel(); } return; }
    if(typing || S.view !== 'edit') return;
    if((e.key === 'Delete' || e.key === 'Backspace') && S.sel.length){ e.preventDefault(); del(); return; }
    if((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z'){ e.preventDefault(); const r = e.shiftKey ? S.fut : S.hist; if(r.length){ (e.shiftKey ? S.hist : S.fut).push(snap()); restore(r.pop()); S.sel = []; render(); } }
  });
  addEventListener('resize', () => { if(S.view === 'edit' && app.classList.contains('open')) renderCanvas(); });

  /* ---------- entry ---------- */
  function open(){ S.view = 'start'; app.classList.add('open'); app.tabIndex = -1; render(); }
  /* Straight into the editor with one flyer — no package, no other assets. */
  function edit(o){
    o = o || {}; const L = LIST.find(x => x.id === o.listing) || LIST[0], layout = o.layout || 'editorial';
    S.slist = L.id; S.ssize = o.size || (layout === 'editorial' ? 'a4' : 'letter');
    S.pages = [mkPage(o.type || 'open', layout, S.ssize, L.id)]; S.cur = 0; S.hist = []; S.fut = []; S.sel = []; S.pop = null; S.grid = false;
    S.view = 'edit'; S.tool = 'templates'; S.ttype = o.type || 'open'; closeDlg(); app.classList.add('open'); render();
  }
  window.FLYER = { open, edit };

  /* Template gallery → Flyers tab: Edit / Use opens Flyer Studio with just this flyer. */
  const TPL2LAYOUT = { seminar:'editorial', editorial:'editorial', wave:'bold', feature:'hero', collage:'gallery', split:'hero' };
  const flierTab = () => window.__flFmt === 'flier' || document.body.classList.contains('msaf-fmt-flier') || !!document.querySelector('.msaf-tab.on[data-nfformat="flier"], .msaf-moreitem.on[data-nfformat="flier"], .msaf-tab[aria-selected="true"][data-nfformat="flier"]');
  const curProp = () => { const m = window.MSPACKET && window.MSPACKET.state && window.MSPACKET.state.prop; return m && m.id; };
  if(!window.__flHooked){ window.__flHooked = true; window.__flLastTpl = 'seminar';
  window.addEventListener('click', e => {
    const fm = e.target.closest && e.target.closest('[data-nfformat]');
    if(fm) window.__flFmt = fm.dataset.nfformat;
    const card = e.target.closest && e.target.closest('.msafcard--tpl[data-nftpl]');
    if(card){ window.__flLastTpl = card.dataset.nftpl; window.__flLastFmts = (card.dataset.nfformats || '').split(/\s+/); }
    const go = e.target.closest && e.target.closest('[data-tplact="edit"], [data-nfusetpl]');
    const fmts = card ? (card.dataset.nfformats || '').split(/\s+/) : [];
    const isFlyer = card && fmts.includes('flier') && (flierTab() || (fmts.length === 1));
    if(!go || !isFlyer || card.dataset.nftpl === 'uploaded') return;
    e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
    window.FLYER.edit({ layout:TPL2LAYOUT[card.dataset.nftpl] || 'editorial', listing:curProp() });
  }, true);
  const wrap = (obj, fn, keysAt, propAt) => { const orig = obj && obj[fn]; if(typeof orig !== 'function') return false;
    obj[fn] = function(){ const keys = arguments[keysAt] || [], p = arguments[propAt];
      const fk = k => k === 'flyer' || k === 'flier';
      const lf = window.__flLastFmts || [];
      if(keys.length && (keys.every(fk) || flierTab() || (lf.includes('flier') && !lf.includes('post')))){ window.FLYER.edit({ layout:TPL2LAYOUT[window.__flLastTpl] || 'editorial', listing:(p && p.id) || p }); return; }
      return orig.apply(this, arguments); }; return true; };
  if(!wrap(window, '__msnfEditor', 1, 0)) console.warn('[flyer] __msnfEditor not found — flyer-only edit falls back to the package editor');
  if(window.MSPACKET) wrap(window.MSPACKET, 'buildPackage', 1, 0);
  }
  document.addEventListener('click', e => {
    const c = e.target.closest('.mshcard[data-hub="flyer"]'); if(!c) return;
    window.__flFmt = 'flier'; e.preventDefault(); e.stopImmediatePropagation(); window.FLYER.open();
  }, true);
})();
