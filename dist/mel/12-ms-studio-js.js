/* ================= Marketing Studio =================
   Lives inside Mel: rail entry -> hub -> guided social-post flow.
   Chat drives it, the canvas on the right is the artifact, nothing
   publishes without an explicit confirm. */
(function(){
  const $ = id => document.getElementById(id);
  const hub = $('ms-hub'), canvas = $('ms-canvas'), studioRow = $('ms-navstudio');
  if(!hub || !canvas || !window.MEL) return;
  const esc = window.MEL.esc, money = n => '$' + n.toLocaleString('en-US');

  const PHOTOS = [
    { c:'#cfc9c0', n:'Front elevation', img:'assets/prop/s1.jpg' },
    { c:'#c7d0d2', n:'Living room', img:'assets/prop/s2.jpg' },
    { c:'#d6cec4', n:'Kitchen', img:'assets/prop/s3.jpg' },
    { c:'#c3ccc5', n:'Back yard', img:'assets/prop/s4.jpg' },
    { c:'#ccc6cf', n:'Primary suite', img:'assets/prop/s1.jpg' },
    { c:'#cdd3d6', n:'Primary bath', img:'assets/prop/s2.jpg' },
    { c:'#d2ccc2', n:'Dining area', img:'assets/prop/s3.jpg' },
    { c:'#c6cfc8', n:'Balcony', img:'assets/prop/s4.jpg' },
    { c:'#cbc6c0', n:'Entry hall', img:'assets/prop/s1.jpg' },
    { c:'#c9d1d4', n:'Second bedroom', img:'assets/prop/s2.jpg' },
    { c:'#d4cdc6', n:'Home office', img:'assets/prop/s3.jpg' },
    { c:'#c5cdc7', n:'Street view', img:'assets/prop/s4.jpg' }
  ];
  const UPLOAD = { c:'#bfb6ab', n:'IMG_2841.jpg · yours' };
  /* real photo when the file exists; the flat tone stays as the fallback */
  const thumbBg = ph => '--ph:' + ph.c + (ph.img ? ";background-image:url('" + ph.img + "');background-size:cover;background-position:50% 50%" : '');
  const FONTS = {
    inter:  { n:'Inter',      d:'Product default', s:"'Inter',-apple-system,sans-serif" },
    serif:  { n:'Newsreader', d:'Editorial serif', s:"'Newsreader',Georgia,serif" },
    mona:   { n:'Mona Sans',  d:'Humanist sans',   s:"'Mona Sans','Inter',sans-serif" },
    hubot:  { n:'Hubot Sans', d:'Display sans',    s:"'Hubot Sans','Inter',sans-serif" },
    georgia:{ n:'Georgia',    d:'Classic serif',   s:"Georgia,'Times New Roman',serif" },
    mono:   { n:'Mono',       d:'Numbers lead',    s:"ui-monospace,'SFMono-Regular',Menlo,monospace" }
  };

  const LISTINGS = [
    { id:'grove', a:'1420 Grove St', city:'San Francisco, CA', hood:'Noe Valley', bd:3, ba:2, sqft:'1,510', price:1285000, was:1325000, photos:24, meta:'Active · listed 2 days ago', oh:'Saturday, 1–4 PM', days:9, mls:'424118902', added:'Added 2 days ago' },
    { id:'pine', a:'88 Pine St, Unit 12B', city:'San Francisco, CA', hood:'Financial District', bd:2, ba:2, sqft:'1,120', price:842000, was:869000, photos:18, meta:'Active · 11 days on market', oh:'Saturday, 11 AM–1 PM', days:11, mls:'424106744', added:'Added 11 days ago' },
    { id:'maple', a:'412 Maple Ave', city:'Oakland, CA', hood:'Rockridge', bd:4, ba:3, sqft:'2,240', price:975000, was:1015000, photos:31, meta:'Active · 21 days on market', oh:'Sunday, 12–3 PM', days:21, mls:'41069318', added:'Added 21 days ago' }
  ];

  const AREAS = ['Noe Valley', 'Rockridge', 'Bernal Heights'];
  const MKT = area => ({ id:'mkt-' + area.toLowerCase().replace(/[^a-z]/g,''), kind:'market',
    a:area + ' market update', city:'San Francisco, CA', hood:area, month:'July',
    price:1285000, was:1285000, sold:14, dom:9, spl:102, bd:3, ba:2, sqft:'1,510', photos:0,
    meta:'Last 30 days \u00b7 SFAR MLS', oh:'', days:9 });
  const EVT = (name, when, where, hood) => ({ id:'evt', kind:'event', a:name, city:'San Francisco, CA',
    hood:hood || AREAS[0], ename:name, ewhen:when, ewhere:where,
    price:0, was:0, bd:3, ba:2, sqft:'1,510', photos:0, meta:when, oh:when, days:0 });
  const MLSPULL = txt => {
    const raw = txt.replace(/^pull in\s*/i, '').trim();
    const num = /^(mls\s*)?[0-9-]+$/i.test(raw) ? raw.replace(/^mls\s*/i, '') : null;
    return { id:'mls', kind:'mls', a: num ? '1719 Judah St' : raw, mls: num || '424097902',
      city:'San Francisco, CA', hood:'Outer Sunset', bd:3, ba:2, sqft:'1,340',
      price:1149000, was:1195000, photos:22, meta:'Active \u00b7 6 days on market',
      oh:'Sunday, 1\u20134 PM', days:6 };
  };
  const SYN = {
    justlisted:/just listed|new listing|hit the market|new to market|listing that just/,
    openhouse:/open house|weekend traffic/,
    justsold:/just sold|sold it|brag|we closed/,
    pricedrop:/price drop|price improve|lower the price|reduced the price/,
    market:/market update|neighbou?rhood (numbers|stats)|market report|the numbers/,
    event:/event|farmers market|booth|community night|sponsor/
  };

  const TYPES = {
    justlisted: { label:'Just listed', eyebrow:'Just listed', ico:'<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/>',
      d:'New to market — the first 72 hours do most of the work',
      heads: p => ['Just listed in ' + p.hood, 'New to market on ' + p.a.split(',')[0].replace(/^\d+\s/,''), p.hood + ', newly listed'],
      caps: p => [
        'Just listed in ' + p.hood + ' — ' + p.bd + ' bed, ' + p.ba + ' bath with the light everyone asks for. ' + p.sqft + ' sqft, updated kitchen, walkable to everything. Showings start Thursday, send me a DM for a private tour.',
        'Just listed in ' + p.hood + '. ' + p.bd + ' bed, ' + p.ba + ' bath, ' + p.sqft + ' sqft. Showings start Thursday — DM me.'
      ], tags:'#justlisted #' + '' },
    openhouse: { label:'Open house', eyebrow:'Open house', ico:'<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M9 21v-6h6v6"/>',
      d:'Drive weekend traffic to a specific time window',
      heads: p => ['Open ' + p.oh, 'This weekend in ' + p.hood, 'Come see it ' + p.oh.split(',')[0]],
      caps: p => [
        'Open house this weekend — ' + p.oh + ' at ' + p.a + '. ' + p.bd + ' bed, ' + p.ba + ' bath in ' + p.hood + ', and yes, the kitchen is as good in person. Bring your buyers, coffee is on me.',
        'Open ' + p.oh + ' — ' + p.a + '. ' + p.bd + ' bed, ' + p.ba + ' bath in ' + p.hood + '. Stop by.'
      ], tags:'#openhouse' },
    justsold: { label:'Just sold', eyebrow:'Just sold', ico:'<path d="M20 6 9 17l-5-5"/>',
      d:'Proof of results — your strongest listing-appointment ad',
      heads: p => ['Sold in ' + p.days + ' days', 'Another one closed in ' + p.hood, 'Sold, over asking'],
      caps: p => [
        'Sold in ' + p.days + ' days in ' + p.hood + '. We priced it to bring the right buyers in the first weekend, and it worked. Thinking about your own timing this fall? Let us talk before you list.',
        'Sold in ' + p.days + ' days in ' + p.hood + '. Thinking about listing? Let us talk.'
      ], tags:'#justsold' },
    pricedrop: { label:'Price drop', eyebrow:'Price improvement', ico:'<path d="M12 5v14"/><path d="m19 12-7 7-7-7"/>',
      d:'Re-surface a listing to buyers who passed on the old number',
      heads: p => ['Now ' + money(p.price), 'Price improved in ' + p.hood, 'New number, same house'],
      caps: p => [
        'Price improvement at ' + p.a + ' — now ' + money(p.price) + ', down from ' + money(p.was) + '. ' + p.bd + ' bed, ' + p.ba + ' bath, ' + p.sqft + ' sqft in ' + p.hood + '. If it was close before, it is worth a second look.',
        'Now ' + money(p.price) + ', down from ' + money(p.was) + '. ' + p.a + ' in ' + p.hood + ' — worth a second look.'
      ], tags:'#pricedrop' },
    market: { label:'Market update', eyebrow:'Market update', ico:'<path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/>',
      d:'Neighborhood numbers \u2014 the post that earns listing appointments',
      heads: p => [p.hood + ' in ' + p.month, 'What ' + p.hood + ' actually sold for', p.hood + ' market update'],
      caps: p => [
        p.hood + ' last month: ' + p.sold + ' homes sold, a median of ' + money(p.price) + ', ' + p.dom + ' days on market. Sellers got ' + p.spl + '% of list on average, so pricing right still does more than anything else. Curious what yours would do? Ask me for a number.',
        p.hood + ' last month: ' + p.sold + ' sold, median ' + money(p.price) + ', ' + p.dom + ' days on market, ' + p.spl + '% of list. Want a number on yours? DM me.'
      ], tags:'#marketupdate' },
    event: { label:'Event', eyebrow:'Event', ico:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 11h18"/>',
      d:'Get people to show up \u2014 open house, booth or community night',
      heads: p => [p.ename, 'Come find me \u2014 ' + p.ewhen.split(',')[0], p.hood + ', this weekend'],
      caps: p => [
        p.ename + ' \u2014 ' + p.ewhen + ' at ' + p.ewhere + '. Come say hi, bring questions about the ' + p.hood + ' market, and I will have coffee. No pitch, just neighbours.',
        p.ename + ' \u00b7 ' + p.ewhen + ' \u00b7 ' + p.ewhere + '. Come say hi.'
      ], tags:'#community' }
  };
  const TPL = {
    bold:      { n:'Wave', d:'Sage sign' },
    photo:     { n:'Feature sheet', d:'Navy + gold' },
    editorial: { n:'Editorial', d:'Paper stock' },
    split:     { n:'Collage', d:'Five photos' },
    minimal:   { n:'Minimal', d:'Thin frame' }
  };
  const HASHTAGS = p => S.tags != null ? S.tags : ('#' + p.hood.toLowerCase().replace(/[^a-z]/g,'') + ' #' + p.city.split(',')[0].toLowerCase().replace(/[^a-z]/g,'') + 'realestate #radiusagent');

  const S = {
    step:'idle', type:null, prop:null, tpl:null, img:0, hl:0, short:false, upload:false,
    crop:'50%', chans:{ ig:true, story:false, fb:false }, when:'now',
    font:'inter', uploadSrc:null, tags:null, pconf:false, pconn:false,
    conn:{ ig:false, fb:true }, posted:false, confirming:false, connecting:false, approved:false, cap:null,
    color:null, hlText:null, channel:{ key:'igpost', label:'Instagram feed', ratio:'1:1', send:'Create a social post for Instagram' },
    also:{ email:false, flyer:false, site:false }
  };
  const HANDLE = '@maya.kapoor.realty';
  const sv = d => '<svg viewBox="0 0 24 24">' + d + '</svg>';
  const CHK = '<svg viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg>';
  const COLORS = [
    { c:'#cfc9c0', n:'Sand' }, { c:'#c7d0d2', n:'Mist' }, { c:'#d6cec4', n:'Clay' },
    { c:'#c3ccc5', n:'Sage' }, { c:'#ccc6cf', n:'Lilac' }, { c:'#b8a894', n:'Camel' },
    { c:'#2b3440', n:'Ink' }, { c:'#5a5ff2', n:'Indigo' }, { c:'#f08068', n:'Coral' }
  ];
  const tone = () => {
    const base = S.upload ? UPLOAD : PHOTOS[S.img % PHOTOS.length];
    return S.color ? { c:S.color, n:base.n, img:base.img } : base;
  };
  const headline = () => S.hlText != null ? S.hlText : TYPES[S.type].heads(S.prop)[S.hl % 3];
  const caption = () => S.cap != null ? S.cap : TYPES[S.type].caps(S.prop)[S.short ? 1 : 0];

  const AILINES = [
    'Message me and I will send the full package today.',
    'Save this one \u2014 I will send the disclosures to anyone who asks.',
    'DM me \u201ctour\u201d and I will hold a slot for you.'
  ];
  const REWRITE = {
    ai: () => {
      S.aiN = (S.aiN || 0) + 1;
      const base = TYPES[S.type].caps(S.prop)[S.short ? 1 : 0];
      return base.replace(/\s*(DM me\.?|Let us talk\.?|Stop by\.?)\s*$/i, '').trim() + ' ' + AILINES[S.aiN % AILINES.length];
    },
    punchier: c => c.split('. ').slice(0, 2).join('. ') + '. DM me.',
    warmer: c => 'Genuinely proud of this one. ' + c,
    professional: c => c.replace(/DM me\.?/i, 'Contact me for details.').replace(/Ask me for a number\.?/i, 'Reach out for a valuation.')
  };

  /* what each post type actually puts on the image */
  function fields(){
    const p = S.prop, t = TYPES[S.type];
    if(p.kind === 'market') return { eyebrow:t.eyebrow, big:money(p.price), small:money(p.price), strike:'',
      title:p.hood, meta:p.sold + ' sold \u00b7 ' + p.dom + ' days median \u00b7 ' + p.spl + '% of list',
      sub:p.month + ' \u00b7 median sale price', sub2:p.hood + ' \u00b7 ' + p.month };
    if(p.kind === 'event'){
      const parts = p.ewhen.split(','), day = parts[0], time = (parts[1] || '').trim();
      return { eyebrow:t.eyebrow, big:day, small:time || day, strike:'', title:p.ename,
        meta:(time ? time + ' \u00b7 ' : '') + p.ewhere, sub:day + ' \u00b7 ' + p.ewhere, sub2:p.ename + ' \u00b7 ' + day };
    }
    return { eyebrow:t.eyebrow, big:money(p.price), small:money(p.price),
      strike:S.type === 'pricedrop' ? '<span class="msoldprice" style="font-size:.5em">' + money(p.was) + '</span>' : '',
      title:p.a, meta:p.hood + ' \u00b7 ' + p.bd + ' bd \u00b7 ' + p.ba + ' ba \u00b7 ' + p.sqft + ' sqft',
      sub:p.hood + ' \u00b7 ' + p.bd + ' bd \u00b7 ' + p.ba + ' ba', sub2:p.a + ' \u00b7 ' + p.bd + ' bd \u00b7 ' + p.ba + ' ba' };
  }

  /* ---------- the post frame: one renderer, scaled by --s ---------- */
  function frame(tpl, o){
    o = o || {};
    if(isWeb() && S.prop){
      const page = sitePage(tpl);
      return (o.s && o.s < 1) ? '<div class="msthumbclip">' + page + '</div>' : page;
    }
    const s = o.s || 1, p = S.prop, t = TYPES[S.type], ph = tone();
    const f = fields();
    const label = p.kind === 'market' ? 'Neighborhood photo \u00b7 ' + ph.n
      : p.kind === 'event' ? 'Event photo \u00b7 ' + ph.n
      : S.upload ? UPLOAD.n
      : 'MLS photo ' + String((S.img % PHOTOS.length) + 1).padStart(2,'0') + ' \u00b7 ' + ph.n;
    const sky = 'color-mix(in srgb,' + ph.c + ' 62%, #ffffff)';
    const hz = S.crop === '18%' ? '31%' : S.crop === '82%' ? '63%' : '47%';
    const real = S.upload && S.uploadSrc;
    const grad = 'linear-gradient(to bottom,' + sky + ' 0 ' + hz + ',' + ph.c + ' ' + hz + ' 100%)';
    const bg = real
      ? 'url(\'' + S.uploadSrc + '\') 50% ' + S.crop + '/cover no-repeat'
      : ph.img ? 'url(\'' + ph.img + '\') 50% ' + S.crop + '/cover no-repeat, ' + grad
      : grad;
    /* every measure scales with the frame so thumbs, preview and canvas match */
    const P = n => 'calc(var(--u) * ' + n + ')';
    const pic = i => { const q = PHOTOS[(S.img + i) % PHOTOS.length];
      return q.img ? 'url(\'' + q.img + '\') 50% 45%/cover no-repeat' : q.c; };
    const acc = S.color;
    const HOUSE = '<svg viewBox="0 0 24 24" style="width:' + P(26) + ';height:' + P(26) + ';fill:none;stroke:currentColor;stroke-width:1.6"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/></svg>';
    let inner = '', base = bg, chip = true;

    if(tpl === 'bold'){
      /* Wave — photo over a white sign panel, sage keyline */
      const a = acc || '#6F7346', ink = 'color-mix(in srgb,' + a + ' 55%,#1c1917)';
      inner = '<div style="position:absolute;left:-6%;right:-6%;top:46.5%;height:' + P(74) + ';background:' + a +
          ';border-radius:100% 100% 0 0/' + P(74) + ' ' + P(74) + ' 0 0"></div>' +
        '<div style="position:absolute;left:-6%;right:-6%;top:48.9%;height:' + P(90) + ';background:#fff;border-radius:100% 100% 0 0/' + P(74) + ' ' + P(74) + ' 0 0"></div>' +
        '<div style="position:absolute;left:0;right:0;top:54%;bottom:0;background:#fff"></div>' +
        '<div style="position:absolute;left:0;right:0;bottom:0;padding:0 ' + P(34) + ' ' + P(30) + ';display:flex;flex-direction:column;gap:' + P(22) + '">' +
          '<div style="display:flex;gap:' + P(20) + ';align-items:flex-start">' +
            '<div style="flex:1;min-width:0">' +
              '<div style="font-size:' + P(36) + ';font-weight:800;line-height:.98;letter-spacing:-.03em;color:' + ink + ';display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden">' + esc(headline()) + '</div>' +
              '<div style="margin-top:' + P(10) + ';font-size:' + P(13) + ';font-weight:500;letter-spacing:.16em;text-transform:uppercase;color:' + a + '">' + esc(f.eyebrow) + ' \u00b7 ' + esc(f.small) + '</div>' +
            '</div>' +
            '<p style="flex:0 0 30%;margin:' + P(6) + ' 0 0;font-size:' + P(13) + ';line-height:1.5;color:#4a4a45;text-wrap:pretty">' + esc(f.meta) + '</p>' +
          '</div>' +
          '<div style="display:flex;align-items:flex-end;justify-content:space-between;gap:' + P(16) + '">' +
            '<span style="display:flex;align-items:center;gap:' + P(9) + ';color:' + a + '">' + HOUSE +
              '<span style="font-size:' + P(10) + ';line-height:1.45;font-weight:500;letter-spacing:.14em;text-transform:uppercase">Maya Kapoor<br><span style="letter-spacing:.06em;opacity:.7">Radius Agent Realty</span></span></span>' +
            '<span style="text-align:right;font-size:' + P(12) + ';line-height:1.5;color:#4a4a45;font-variant-numeric:tabular-nums">(415) 555-0142<br>' + HANDLE + '</span>' +
          '</div>' +
        '</div>';
      base = bg;
    } else if(tpl === 'photo'){
      /* Feature sheet — navy panel, gold wedges, the whole spec list */
      const a = '#C89B3C', navy = acc ? 'color-mix(in srgb,' + acc + ' 55%,#0b1020)' : '#0E1633';
      const feats = [p.bd + ' bedrooms', p.ba + ' bathrooms', p.sqft + ' sqft', 'Updated kitchen', 'Garage parking', p.hood];
      inner = '<div style="position:absolute;inset:0 0 auto 0;height:46%;background:' + bg + ';clip-path:polygon(0 0,100% 0,100% 74%,52% 100%,0 62%)"></div>' +
        '<div style="position:absolute;top:0;left:0;width:29%;height:25%;background:' + a + ';clip-path:polygon(0 0,100% 0,0 100%)"></div>' +
        '<div style="position:absolute;top:26%;right:0;width:24%;height:22%;background:color-mix(in srgb,' + a + ' 82%,#000);clip-path:polygon(100% 0,100% 100%,0 100%)"></div>' +
        '<div style="position:absolute;left:' + P(30) + ';top:34%;display:flex;align-items:center;gap:' + P(10) + ';color:' + a + '">' + HOUSE +
          '<span style="display:flex;flex-direction:column"><b style="font-size:' + P(15) + ';line-height:1.15;font-weight:600;color:#fff">Maya Kapoor</b>' +
          '<i style="font-style:normal;font-size:' + P(11) + ';line-height:1.3;color:#B9BDD0">Radius Agent Realty</i></span></div>' +
        '<div style="position:absolute;left:' + P(30) + ';right:' + P(30) + ';top:43%;font-size:' + P(38) + ';font-weight:800;line-height:.96;letter-spacing:-.03em;color:#fff">' + esc(headline()) + '</div>' +
        '<div style="position:absolute;left:' + P(30) + ';right:' + P(30) + ';bottom:' + P(28) + ';display:flex;gap:' + P(20) + '">' +
          '<div style="flex:0 0 28%;display:flex;flex-direction:column;gap:' + P(7) + '">' +
            '<span style="height:' + P(50) + ';border-radius:' + P(4) + ';background:' + pic(1) + '"></span>' +
            '<span style="height:' + P(50) + ';border-radius:' + P(4) + ';background:' + pic(2) + '"></span>' +
            '<span style="height:' + P(50) + ';border-radius:' + P(4) + ';background:' + pic(3) + '"></span></div>' +
          '<div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:' + P(13) + '">' +
            '<div><div style="display:flex;align-items:baseline;justify-content:space-between;gap:' + P(8) + ';margin-bottom:' + P(6) + '">' +
              '<span style="font-size:' + P(14) + ';font-weight:600;color:' + a + '">Property features</span>' +
              '<b style="font-size:' + P(17) + ';font-weight:600;color:#fff;font-variant-numeric:tabular-nums">' + esc(f.small) + '</b></div>' +
              '<div style="display:grid;grid-template-columns:1fr 1fr;gap:0 ' + P(10) + ';font-size:' + P(11.5) + ';line-height:1.75;color:#DDE0EA">' +
              feats.map(x => '<span>' + esc(x) + '</span>').join('') + '</div></div>' +
            '<div><div style="font-size:' + P(14) + ';font-weight:600;color:' + a + ';margin-bottom:' + P(4) + '">Get in touch</div>' +
              '<div style="font-size:' + P(11) + ';line-height:1.6;color:#B9BDD0;font-variant-numeric:tabular-nums">(415) 555-0142 \u00b7 maya@radiusagent.com</div></div>' +
          '</div></div>';
      base = navy;
    } else if(tpl === 'split'){
      /* Warm collage — five photos, a claim and a contact bar */
      const brown = acc ? 'color-mix(in srgb,' + acc + ' 72%,#3b2418)' : '#6B4A34';
      const claim = caption().split('. ')[0] + '.';
      inner = '<div style="position:absolute;inset:0;padding:' + P(20) + ';display:flex;flex-direction:column;gap:' + P(11) + '">' +
          '<div style="flex:0 0 25%;border-radius:' + P(5) + ';background:' + bg + '"></div>' +
          '<div style="flex:0 0 23%;display:flex;gap:' + P(11) + '">' +
            '<span style="flex:0 0 42%;border-radius:' + P(5) + ';background:' + pic(1) + '"></span>' +
            '<div style="flex:1;min-width:0;display:flex;flex-direction:column;justify-content:center;text-align:center">' +
              '<div style="font-size:' + P(30) + ';font-weight:800;line-height:.98;letter-spacing:-.02em;color:#fff">' + esc(f.eyebrow) + '</div>' +
              '<div style="margin-top:' + P(8) + ';font-size:' + P(12) + ';line-height:1.35;font-weight:600;color:#E8C9A8">' + esc(f.title) + '</div></div></div>' +
          '<div style="flex:0 0 21%;display:flex;gap:' + P(11) + '">' +
            '<span style="flex:0 0 42%;border-radius:' + P(5) + ';background:' + pic(2) + '"></span>' +
            '<p style="flex:1;min-width:0;margin:0;font-size:' + P(11) + ';line-height:1.55;color:#F3E6DA;text-align:justify;text-wrap:pretty">' + esc(claim) + '</p></div>' +
          '<div style="flex:1;min-height:0;display:flex;gap:' + P(11) + '">' +
            '<span style="flex:1;border-radius:' + P(5) + ';background:' + pic(3) + '"></span>' +
            '<span style="flex:1;border-radius:' + P(5) + ';background:' + pic(4) + '"></span></div>' +
          '<div style="flex:0 0 auto;display:flex;align-items:center;justify-content:space-between;gap:' + P(8) + ';background:#FBF4EC;border-radius:999px;padding:' + P(8) + ' ' + P(16) + ';font-size:' + P(10.5) + ';color:#5C3F2C;font-variant-numeric:tabular-nums">' +
            '<span>(415) 555-0142</span><span>maya.radius.com</span><span>' + HANDLE + '</span></div>' +
        '</div>';
      base = brown; chip = false;
    } else if(tpl === 'minimal'){
      inner = '<div class="msscrim"></div><div class="msmin"><span class="msmineb">' + f.eyebrow + '</span>' +
        '<div class="msminp">' + f.strike + esc(f.big) + '</div>' +
        '<div class="msminm">' + esc(f.title) + '</div></div>';
    } else {
      /* Editorial — paper stock, mixed type, agent card */
      const a = acc || '#8A8377';
      const hw = headline().split(' '), hLast = hw.length > 1 ? hw.pop() : '', hRest = hw.join(' ');
      const stats = [p.bd + ' bedrooms', p.ba + ' bathrooms', 'Garage parking', p.sqft + ' sq ft'];
      inner = '<div style="position:absolute;inset:0;padding:' + P(26) + ';display:flex;flex-direction:column;gap:' + P(14) + '">' +
          '<div style="display:flex;justify-content:space-between;align-items:flex-start;font-size:' + P(9.5) + ';line-height:1.6;font-weight:500;letter-spacing:.14em;text-transform:uppercase;color:#57534E">' +
            '<span>maya.radius.com<br>(415) 555-0142</span>' +
            '<span style="text-align:right">' + esc(f.eyebrow) + '<br><b style="font-size:' + P(14) + ';letter-spacing:0;color:#1c1917;font-variant-numeric:tabular-nums">' + esc(f.small) + '</b></span></div>' +
          '<div style="text-align:center;font-size:' + P(32) + ';line-height:1.05;letter-spacing:.01em;color:#1c1917">' + esc(hRest) +
            (hLast ? ' <span style="font-family:Georgia,serif;font-style:italic;font-size:' + P(38) + '">' + esc(hLast) + '</span>' : '') + '</div>' +
          '<div style="flex:0 0 32%;background:' + bg + ';border-radius:' + P(2) + '"></div>' +
          '<div style="display:flex;gap:' + P(14) + ';align-items:stretch">' +
            '<div style="flex:0 0 24%;display:flex;flex-direction:column;gap:' + P(7) + ';font-size:' + P(10.5) + ';line-height:1.2;letter-spacing:.06em;text-transform:uppercase;color:#3F3F46">' +
              stats.map(x => '<span>' + esc(x) + '</span>').join('') + '</div>' +
            '<div style="width:1px;background:' + a + ';opacity:.35"></div>' +
            '<div style="flex:1;min-width:0;text-align:center">' +
              '<div style="font-size:' + P(11) + ';line-height:1.4;letter-spacing:.14em;text-transform:uppercase;color:#1c1917">Invest with<br>confidence</div>' +
              '<p style="margin:' + P(7) + ' 0 0;font-size:' + P(10.5) + ';line-height:1.6;color:#57534E;text-wrap:pretty">' + esc(f.meta) + '</p></div>' +
            '<div style="width:1px;background:' + a + ';opacity:.35"></div>' +
            '<div style="flex:0 0 22%;display:flex;flex-direction:column;align-items:center;gap:' + P(6) + ';text-align:center">' +
              '<span style="width:' + P(48) + ';height:' + P(48) + ';border-radius:999px;background:#EDEBE6 url(\'assets/avatars/a2.svg\') 50%/cover"></span>' +
              '<span style="font-size:' + P(10.5) + ';line-height:1.3;font-weight:500;letter-spacing:.1em;text-transform:uppercase;color:#1c1917">Maya Kapoor<br>' +
              '<span style="letter-spacing:.02em;text-transform:none;font-weight:400;color:#78716C">' + esc(f.title) + '</span></span></div></div>' +
          '<div style="display:flex;gap:' + P(10) + ';flex:1;min-height:0">' +
            '<span style="flex:1;border-radius:' + P(2) + ';background:' + pic(1) + '"></span>' +
            '<span style="flex:1;border-radius:' + P(2) + ';background:' + pic(2) + '"></span></div>' +
        '</div>';
      base = '#FBFAF8'; chip = false;
    }
    const ff = (FONTS[S.font] || FONTS.inter).s;
    const shape = o.story ? ' story' : (S.channel && S.channel.ratio === '9:16') ? ' story' : (S.channel && S.channel.ratio === '16:9') ? ' wide' : '';
    return '<div class="msframe' + shape + '" style="--ph:' + ph.c + ';--s:' + s +
      ';--font:' + ff + ';font-family:' + ff + ';background:' + base + '">' +
      (chip ? '<span class="msphl">' + esc(label) + '</span>' : '') + inner + '</div>';
  }

  function emailPreview(){
    const p = S.prop, t = TYPES[S.type], ph = tone();
    return '<div class="msemail" style="--ph:' + ph.c + '"><div class="msesub">To · Buyers watching ' + esc(p.hood) + ' (312)<b>' +
      esc(t.eyebrow + ': ' + p.a.split(',')[0]) + '</b></div><div class="msehero" style="background:' + heroBg(ph) + '"></div><div class="msebody">' +
      '<h4>' + esc(headline()) + '</h4><p>' + esc(caption().split('. ').slice(0,2).join('. ')) + '.</p>' +
      '<span class="msecta">See the full listing</span></div></div>';
  }
  const heroBg = ph => S.upload && S.uploadSrc
    ? "url('" + S.uploadSrc + "') 50% 50%/cover no-repeat, " + ph.c
    : ph.img ? "url('" + ph.img + "') 50% 50%/cover no-repeat, " + ph.c : ph.c;
  function flyerPreview(){
    const p = S.prop, t = TYPES[S.type], ph = tone();
    return '<div class="msflyer" style="--ph:' + ph.c + '"><div class="msfimg" style="background:' + heroBg(ph) + '"></div><div class="msfb">' +
      '<div class="msaddr" style="--s:1;font-size:14px;color:var(--neutral-900)">' + esc(p.a) + '</div>' +
      '<div class="msfp">' + money(p.price) + '</div>' +
      '<div class="msmeta" style="--s:1;font-size:12px;color:var(--neutral-500);opacity:1">' + p.bd + ' bd · ' + p.ba + ' ba · ' + p.sqft + ' sqft · ' + esc(p.hood) + '</div>' +
      '<div class="msfagent"><span class="mspav" style="width:22px;height:22px;font-size:9px">MK</span>Maya Kapoor · Radius Agent Realty · DRE 02114488</div></div></div>';
  }

  /* ---------- the property website: one page renderer for thumb, preview and editor ---------- */
  const WEBTPL = {
    editorial:{ n:'Editorial', d:'Full-bleed hero' },
    photo:    { n:'Split hero', d:'Photo beside a card' },
    bold:     { n:'Price-led', d:'Price over the photo' },
    split:    { n:'Dark detail', d:'Dark header panel' },
    minimal:  { n:'Minimal', d:'Quiet, centred' }
  };
  const isWeb = () => !!(S.channel && S.channel.key === 'website');
  const tplName = k => isWeb() ? WEBTPL[k].n : TPL[k].n;
  const tplDesc = k => isWeb() ? WEBTPL[k].d : TPL[k].d;
  const FEATS = {
    grove:['Chef kitchen, gas range','Primary suite with walk-in','Original 1912 millwork','North-facing garden','Two-car garage','Blocks from 24th St'],
    pine:['12th-floor bay views','Floor-to-ceiling glass','Deeded parking','Doorman building','Roof deck and gym','Walk score 99'],
    maple:['Level lawn and patio','Bonus room over the garage','Remodelled in 2021','Primary on the main level','Central heat and A/C','Walk to College Ave']
  };
  const SITE = { cta:null, published:false };
  const siteCta = () => SITE.cta != null ? SITE.cta : 'Request a private tour';
  const siteUrl = () => 'maya.radius.com/' + (S.prop ? S.prop.id : 'listing');
  const webCopy = () => {
    if(S.cap != null) return S.cap;
    let c = caption()
      .replace(/[^.!?]*\b(DM me|send me a DM|Message me|Ask me for a number|Save this one)\b[^.!?]*[.!?]?/gi, '')
      .replace(/\s+([,.])/g, '$1').replace(/\s+/g, ' ').trim();
    if(c && !/[.!?]$/.test(c)) c += '.';
    if(!/tour|showing|disclosure/i.test(c)) c += ' Request a private tour below and I will send the full disclosure package the same day.';
    return c;
  };
  function sitePage(tpl){
    const p = S.prop, acc = S.color || '#5A5FF2', ff = (FONTS[S.font] || FONTS.inter).s;
    const pic = i => {
      const q = PHOTOS[(S.img + i) % PHOTOS.length];
      if(S.upload && S.uploadSrc && i === 0) return "url('" + S.uploadSrc + "') 50% 45%/cover no-repeat";
      return q.img ? "url('" + q.img + "') 50% 45%/cover no-repeat, " + q.c : q.c;
    };
    const addr = p.a.split(',')[0];
    const price = p.price ? money(p.price) : '';
    const meta = p.hood + ' \u00b7 ' + p.bd + ' bd \u00b7 ' + p.ba + ' ba \u00b7 ' + p.sqft + ' sqft';
    const eb = TYPES[S.type] ? TYPES[S.type].eyebrow : 'For sale';
    const feats = FEATS[p.id] || ['Move-in ready','Updated kitchen','Private outdoor space','Garage parking','Walk to shops and transit','Quiet, tree-lined street'];
    let hero;
    if(tpl === 'photo'){
      hero = '<div class="st-split"><div class="st-sp" style="background:' + pic(0) + '"></div>' +
        '<div class="st-sc"><span class="st-ebd">' + esc(eb) + '</span><h1 class="st-h1 dk">' + esc(addr) + '</h1>' +
        '<div class="st-hmd">' + esc(meta) + '</div><div class="st-hpd">' + price + '</div>' +
        '<span class="st-cta st-inline">' + esc(siteCta()) + '</span></div></div>';
    } else if(tpl === 'split'){
      hero = '<div class="st-dark"><div><span class="st-eb">' + esc(eb) + '</span><h1 class="st-h1">' + esc(addr) + '</h1>' +
        '<div class="st-hm">' + esc(meta) + '</div><div class="st-hp">' + price + '</div></div>' +
        '<div class="st-dph" style="background:' + pic(0) + '"></div></div>';
    } else if(tpl === 'minimal'){
      hero = '<div class="st-mtop"><span class="st-ebd">' + esc(eb) + '</span><h1 class="st-h1 dk">' + esc(addr) + '</h1>' +
        '<div class="st-hmd">' + esc(meta) + (price ? ' \u00b7 ' + price : '') + '</div></div>' +
        '<div class="st-mph" style="background:' + pic(0) + '"></div>';
    } else if(tpl === 'bold'){
      hero = '<div class="st-hero ctr" style="background:' + pic(0) + '"><div class="st-scrim"></div>' +
        '<div class="st-hc"><div class="st-hp big">' + price + '</div><h1 class="st-h1">' + esc(addr) + '</h1>' +
        '<div class="st-hm">' + esc(meta) + '</div></div></div>';
    } else {
      hero = '<div class="st-hero" style="background:' + pic(0) + '"><div class="st-scrim"></div>' +
        '<div class="st-hc"><span class="st-eb">' + esc(eb) + '</span><h1 class="st-h1">' + esc(addr) + '</h1>' +
        '<div class="st-hm">' + esc(meta) + '</div><div class="st-hp">' + price + '</div></div></div>';
    }
    const stat = (b, l) => '<div class="st-stat"><b>' + esc(b) + '</b><i>' + esc(l) + '</i></div>';
    return '<div class="mssite v-' + tpl + '" style="--acc:' + acc + ';--sfont:' + ff + '">' +
      '<div class="st-nav"><span class="st-brand">Maya Kapoor</span>' +
        '<span class="st-links"><span>Gallery</span><span>Details</span><span>Neighborhood</span><span>Contact</span></span>' +
        '<span class="st-ncta">' + esc(siteCta()) + '</span></div>' +
      hero +
      '<div class="st-stats">' + stat(p.bd, 'Bedrooms') + stat(p.ba, 'Bathrooms') + stat(p.sqft, 'Sq ft') +
        stat(p.hood, 'Neighborhood') + stat(String(p.photos || PHOTOS.length) + ' photos', 'Gallery') + '</div>' +
      '<div class="st-about"><h2>' + esc(headline()) + '</h2><p>' + esc(webCopy()) + '</p></div>' +
      '<div class="st-gal"><span style="background:' + pic(1) + '"></span><span style="background:' + pic(2) + '"></span>' +
        '<span style="background:' + pic(3) + '"></span></div>' +
      '<div class="st-sec"><span class="st-lab">The details</span><div class="st-fgrid">' +
        feats.map(x => '<span class="st-f"><em></em>' + esc(x) + '</span>').join('') + '</div></div>' +
      '<div class="st-visit"><span><b>' + esc(p.oh || 'Private showings by appointment') + '</b>' +
        '<i>' + esc(p.a) + '</i></span><span class="st-cta">' + esc(siteCta()) + '</span></div>' +
      '<div class="st-agent"><span class="st-av">MK</span><span><b>Maya Kapoor</b>' +
        '<i>Radius Agent Realty \u00b7 DRE 02114488 \u00b7 (415) 555-0142</i></span>' +
        '<span class="st-cta">Message Maya</span></div>' +
      '<div class="st-foot"><span>\u00a9 2026 Maya Kapoor</span><span>Radius Agent Realty</span>' +
        '<span>Equal Housing Opportunity</span><span style="margin-left:auto">' + esc(siteUrl()) + '</span></div></div>';
  }
  const siteChrome = inner => '<div class="msweb"><span class="msdot"></span><span class="msdot"></span><span class="msdot"></span>' +
    '<span class="msurl">' + esc(siteUrl()) + '</span></div><div class="mssitescroll">' + inner + '</div>';

  /* ---------- canvas ---------- */
  function renderCanvas(flash, open){
    if(!S.tpl){ canvas.innerHTML = ''; return; }
    const p = S.prop, t = TYPES[S.type];
    const head = '<div class="msch"><span><h3>' + (isWeb() ? t.label + ' · property website' : t.label + ' post · ' + S.channel.label) + '</h3>' +
      '<div class="mssub">' + esc(p.a) + ' · ' + tplName(S.tpl) + ' template · ' + (S.posted ? 'done' : S.confirming || S.connecting ? 'step 4 of 4 · confirm' : 'step 3 of 4 · review') + '</div></span>' +
      '<span class="msbadge' + (S.posted ? ' ok' : '') + '">' + (S.posted ? 'Posted' : 'Draft') + '</span>' +
      '<button class="msx" type="button" data-ms="close" aria-label="Close preview">' + sv('<path d="M18 6 6 18M6 6l12 12"/>') + '</button></div>';

    const post = isWeb()
      ? '<div class="mspost web' + (flash ? ' flash' : '') + '">' + siteChrome(sitePage(S.tpl)) + '</div>'
      : '<div class="mspost' + (flash ? ' flash' : '') + '">' +
      '<div class="mspostbar"><span class="mspav">MK</span><span><b>' + HANDLE + '</b><i>' + esc(p.city) + '</i></span><span class="msdots">···</span></div>' +
      frame(S.tpl, { s:1.1 }) +
      '<div class="mspcap" contenteditable="true" spellcheck="false" data-ms="cap">' + esc(caption()) +
        '<span class="mstags">' + HASHTAGS(p) + '</span></div></div>';

    const story = S.chans.story ? '<div class="msnote">' + sv('<path d="M12 9v4M12 17h.01"/><circle cx="12" cy="12" r="9"/>') +
      '<span>Story cut is 9:16. Mel reframed the same photo — the left edge is cropped.</span>' +
      '<button type="button" data-ms="crop">Adjust framing</button></div>' : '';
    const srcTxt = p.kind === 'market' ? 'SFAR MLS \u00b7 last 30 days of closed sales in ' + p.hood + ' \u00b7 pulled 12 minutes ago. Edit any number in the editor.'
      : p.kind === 'event' ? 'Details as you gave them \u2014 nothing synced. Check the day, time and place before this goes out.'
      : S.upload ? 'Your upload, reframed to 1:1 from 4:3.'
      : 'SFAR MLS \u00b7 price and details synced 12 minutes ago.';
    const src = '<div class="msnote">' + sv('<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.7 4 3 9 3s9-1.3 9-3V5"/>') +
      '<span>' + esc(srcTxt) + '</span></div>';

    const bchip = (k, label) => '<button class="msbchip' + (S.also[k] ? ' on' : '') + '" type="button" data-ms="also" data-k="' + k + '">' + label + '</button>';
    const bundle = (S.posted || S.prop.kind) ? '' : '<div class="msbundle"><span class="msblab">Also make from this</span>' +
      bchip('email', 'Email') + bchip('flyer', 'Flyer') + bchip('site', 'Listing page') + '</div>';
    const alsoPreviews = (S.also.email ? emailPreview() : '') + (S.also.flyer ? flyerPreview() : '') +
      (S.also.site ? '<div class="msnote">' + sv('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 3 2.5 15 0 18M12 3c-2.5 3-2.5 15 0 18"/>') +
        '<span>Listing page queued at maya.radius.com/' + p.id + ' — same photo set and copy, live once you publish.</span></div>' : '');

    const chan = (k, label, note, on) =>
      '<button class="mschan' + (on ? ' on' : '') + '" type="button" data-ms="chan" data-k="' + k + '">' +
        '<span class="msbox">' + CHK + '</span><b>' + label + '</b><i>' + note + '</i>' +
        (k === 'fb'
          ? '<span class="msacct">Maya Kapoor Realty</span>'
          : (S.conn.ig ? '<span class="msacct">' + HANDLE + '</span>' : '<span class="msconn" role="link" tabindex="0" data-ms="connect">Connect</span>')) +
      '</button>';

    let foot;
    if(isWeb()){
      foot = '<div class="mslab">Where it goes</div>' +
        '<div class="msnote" style="margin:0 0 10px"><span>' + esc(siteUrl()) + (SITE.published ? ' · live' : ' · not live yet') + '</span></div>' +
        '<div class="msseg"><button type="button" data-ms="when" data-v="now" class="' + (S.when === 'now' ? 'on' : '') + '">Publish now</button>' +
        '<button type="button" data-ms="when" data-v="later" class="' + (S.when === 'later' ? 'on' : '') + '">Publish Saturday</button></div>' +
        (S.confirming
          ? '<div class="msconfirm">This puts the page live at <b style="color:var(--neutral-900)">' + esc(siteUrl()) + '</b>' +
            (S.when === 'now' ? ' right away' : ' on Saturday at 9:00 AM') + '. You can unpublish any time — the draft stays in your Library.' +
            '<div class="msrowbtns"><button type="button" data-ms="cancel">Cancel</button>' +
            '<button type="button" class="pri" data-ms="post">' + (S.when === 'now' ? 'Publish the page' : 'Schedule it') + '</button></div></div>'
          : '<button class="msgo" type="button" data-ms="go">' + sv('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 3 2.5 15 0 18M12 3c-2.5 3-2.5 15 0 18"/>') +
            (S.posted ? 'Publish the changes' : S.when === 'now' ? 'Review and publish' : 'Review and schedule') + '</button>') +
        '<button class="msghost" type="button" data-ms="savedraft" style="margin-top:8px">Save the draft</button>' +
        '<div class="mssettings">' + (S.posted ? 'Live since 12:04 PM · unpublish any time in your Library.' : 'Nothing is public until you publish on the next step.') + '</div>';
    } else if(S.posted){
      foot = '<div class="msdone"><span class="msok">' + CHK + '</span>Posted to Instagram feed at 12:04 PM<a href="#" data-ms="noop">View post</a></div>' +
        '<div class="msrowbtns" style="display:flex;gap:7px">' +
        '<button class="msghost" type="button" style="flex:1" data-ms="undo">Undo — take it down</button>' +
        '<button class="msghost" type="button" style="flex:1" data-ms="dup">Make a story cut</button></div>';
    } else if(S.connecting){
      foot = '<div class="msconfirm"><b style="color:var(--neutral-900)">Connect Instagram</b>' +
        (S.approved ? 'Approved. One step left \u2014 connect the account and this goes out right after. ' : '') +
        'Radius will post to your professional account and read basic profile info. You can disconnect any time in Settings.' +
        '<div class="msrowbtns"><button type="button" data-ms="cancelconn">Cancel</button>' +
        '<button type="button" class="pri" data-ms="doconnect">Continue to Instagram</button></div></div>' +
        '<div class="mssettings">All connectors live in <a href="#" data-ms="noop">Settings → Connectors</a></div>';
    } else if(S.confirming){
      const where = [S.chans.ig && 'Instagram feed', S.chans.story && 'Instagram story', S.chans.fb && 'Facebook page'].filter(Boolean).join(' and ');
      foot = '<div class="msconfirm">This posts to <b style="color:var(--neutral-900)">' + where + '</b> ' +
        (S.when === 'now' ? 'right now' : 'Saturday at 9:00 AM') + ', as ' + HANDLE + '. The image and caption go out exactly as shown.' +
        '<div class="msrowbtns"><button type="button" data-ms="cancel">Cancel</button>' +
        '<button type="button" class="pri" data-ms="post">' + (S.chans.ig && !S.conn.ig ? 'Approve and connect Instagram' : S.when === 'now' ? 'Post now' : 'Schedule it') + '</button></div></div>';
    } else {
      const need = S.chans.ig && !S.conn.ig;
      foot = '<div class="mslab">Post to</div><div class="mschans">' +
          chan('ig', 'Instagram feed', '1:1', S.chans.ig) +
          chan('story', 'Instagram story', '9:16', S.chans.story) +
          chan('fb', 'Facebook page', '1:1', S.chans.fb) +
        '</div>' +
        '<div class="msseg"><button type="button" data-ms="when" data-v="now" class="' + (S.when === 'now' ? 'on' : '') + '">Post now</button>' +
        '<button type="button" data-ms="when" data-v="later" class="' + (S.when === 'later' ? 'on' : '') + '">Schedule</button></div>' +
        '<button class="msgo" type="button" data-ms="go">' +
          sv('<path d="m22 2-7 20-4-9-9-4z"/>') + (S.when === 'now' ? 'Review and post' : 'Review and schedule') + '</button>' +
        '<div class="mssettings">' + (need ? 'You approve first, then connect Instagram \u2014 nothing posts before both.' : 'Nothing posts until you approve on the next step.') + '</div>';
    }

    canvas.innerHTML = '<div class="mswin">' + head + '<div class="mscroll">' + post + story + src + bundle + alsoPreviews + '</div><div class="mspub">' + foot + '</div></div>';
    /* the preview is opt-in: chat stays the surface until you ask for the big view */
    if(open || window.MEL.page.classList.contains('canvason')) window.MEL.page.classList.add('canvason');
    if(viewer.classList.contains('open')) renderViewer();
  }

  function doPublish(){
    S.secs = S.t0 ? Math.max(11, Math.round((Date.now() - S.t0) / 1000)) : 38;
    S.confirming = false; S.connecting = false; S.approved = false; S.posted = true; renderCanvas();
    const where = [S.chans.ig && 'feed', S.chans.story && 'story', S.chans.fb && 'Facebook'].filter(Boolean).join(' + ');
    window.MSLIB && window.MSLIB.publish(S.prop, TYPES[S.type].label, S.when, S.also);
    window.MEL.addTask(TYPES[S.type].label + ' post published \u00b7 ' + S.prop.a,
      (S.when === 'now' ? 'Just now' : 'Scheduled Saturday 9:00 AM') + ' \u00b7 Instagram ' + where + ' \u00b7 by Mel');
    if(window.sonner) sonner(S.when === 'now' ? 'Posted to Instagram' : 'Post scheduled', S.prop.a + ' \u00b7 ' + TYPES[S.type].label);
  }

  canvas.addEventListener('click', e => {
    if(e.target === canvas){ window.MEL.page.classList.remove('canvason'); return; }
    const b = e.target.closest('[data-ms]'); if(!b) return;
    const k = b.dataset.ms;
    if(k === 'close'){ window.MEL.page.classList.remove('canvason'); return; }
    if(k === 'chan'){
      const key = b.dataset.k;
      S.chans[key] = !S.chans[key];
      if(!S.chans.ig && !S.chans.story && !S.chans.fb) S.chans[key] = true;
      renderCanvas(); return;
    }
    if(k === 'connect'){ e.stopPropagation(); S.connecting = true; renderCanvas(); return; }
    if(k === 'cancelconn'){ S.connecting = false; renderCanvas(); return; }
    if(k === 'doconnect'){
      b.innerHTML = '<span class="msspin"></span>';
      setTimeout(() => {
        S.conn.ig = true; S.connecting = false;
        if(window.sonner) sonner('Instagram connected', HANDLE + ' \u00b7 manage in Settings \u2192 Connectors');
        if(S.approved){ doPublish(); return; }
        renderCanvas();
      }, 900);
      return;
    }
    if(k === 'also'){ S.also[b.dataset.k] = !S.also[b.dataset.k]; renderCanvas(true); return; }
    if(k === 'undo'){
      S.posted = false; renderCanvas();
      window.MSLIB && window.MSLIB.undo();
      if(window.sonner) sonner('Post taken down', 'Back to a draft in your Library — nothing lost');
      return;
    }
    if(k === 'when'){ S.when = b.dataset.v; renderCanvas(); return; }
    if(k === 'crop'){
      S.crop = S.crop === '50%' ? '18%' : S.crop === '18%' ? '82%' : '50%';
      renderCanvas(true); return;
    }
    if(k === 'go'){ S.confirming = true; renderCanvas(); return; }
    if(k === 'cancel'){ S.confirming = false; renderCanvas(); return; }
    if(k === 'post'){
      if(isWeb()){
        S.confirming = false; S.posted = true; SITE.published = true; renderCanvas();
        window.MEL.addTask && window.MEL.addTask('Property website ' + (S.when === 'now' ? 'published' : 'scheduled') + ' · ' + S.prop.a,
          siteUrl() + ' · ' + tplName(S.tpl) + ' template · by Mel');
        if(window.sonner) sonner(S.when === 'now' ? 'Page is live' : 'Page scheduled', siteUrl());
        return;
      }
      if(S.chans.ig && !S.conn.ig){ S.approved = true; S.confirming = false; S.connecting = true; renderCanvas(); return; }
      doPublish(); return;
    }
    if(k === 'savedraft'){
      window.MSLIB && window.MSLIB.save && window.MSLIB.save(S.prop, 'Property website');
      if(window.sonner) sonner('Draft saved to Library', siteUrl() + ' · not public');
      return;
    }
    if(k === 'dup'){ if(window.sonner) sonner('Story cut queued', 'Same photo, reframed to 9:16 for review'); return; }
    if(k === 'noop'){ e.preventDefault(); return; }
  });
  /* the pill on each option card opens the full editor page over a blurred Mel */
  document.addEventListener('click', e => {
    const p = e.target.closest('.msoedit'); if(!p) return;
    const c = p.closest('.msopt[data-mstpl]'); if(!c) return;
    e.preventDefault(); e.stopPropagation();
    S.tpl = c.dataset.mstpl; S.confirming = false; S.connecting = false; S.posted = false;
    document.querySelectorAll('.msopt[data-mstpl]').forEach(b => b.classList.toggle('on', b.dataset.mstpl === S.tpl));
    openViewer();
  }, true);
  canvas.addEventListener('blur', e => {
    const cap = e.target.closest('[data-ms="cap"]');
    if(cap) S.cap = cap.textContent.replace(HASHTAGS(S.prop), '').trim();
  }, true);

  /* ---------- thread pieces ---------- */
  const qr = list => '<div class="msqr">' + list.map(x => '<button type="button" data-msq="' + esc(x) + '">' + esc(x) + '</button>').join('') + '</div>';

  /* what-for picker: real buttons, tinted, with a visible chosen state */
  const typeChips = () => '<div class="mstypes">' + Object.keys(TYPES).map(k =>
    '<button class="mstype" type="button" data-mstype="' + k + '" data-mssend="' + esc(TYPES[k].label) + '">' +
      '<span class="mstypei">' + sv(TYPES[k].ico) + '</span>' +
      '<span style="min-width:0"><b>' + esc(TYPES[k].label) + '</b><i>' + esc(TYPES[k].d) + '</i></span>' +
      '<span class="mstypetick">' + CHK + '</span></button>').join('') + '</div>';

  const typeCards = () => '<div class="mspick cols">' + Object.keys(TYPES).map(k =>
    '<button class="mstile" type="button" data-mssend="' + TYPES[k].label + '">' + sv(TYPES[k].ico) +
    '<span><b>' + TYPES[k].label + '</b><i>' + TYPES[k].d + '</i></span></button>').join('') + '</div>';

  const mlsField = (ph, act) => '<div class="msfield"><input type="text" data-msf="' + esc(act) + '" placeholder="' + esc(ph) + '" aria-label="' + esc(ph) + '" autocomplete="off" spellcheck="false">' +
    '<button type="button" data-msfgo="' + esc(act) + '">Add it</button></div>';

  const areaCards = () => '<div class="mschips">' + AREAS.map(a =>
    '<button type="button" data-msq="Run the numbers for ' + esc(a) + '">' + esc(a) + '</button>').join('') + '</div>' +
    mlsField('Another area', 'Run the numbers for');

  const eventCards = () => '<div class="mspick">' + LISTINGS.map(p =>
    '<button class="mstile" type="button" data-mssend="Event: my open house at ' + esc(p.a) + '">' +
      '<span class="msthumb" style="' + thumbBg(PHOTOS[0]) + '"></span>' +
      '<span><b>Open house \u00b7 ' + esc(p.a.split(',')[0]) + '</b><i>' + esc(p.oh + ' \u00b7 ' + p.hood) + '</i></span></button>').join('') +
    '</div>' + mlsField('Event name, day, place', 'Event:');

  /* property picker: newest first, one field for address or MLS number */
  const SEARCHI = '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>';
  const propRow = (p, badge) => '<button class="mspr" type="button" data-msprow="' + p.id + '" data-mssend="' + esc(p.a) + '">' +
    '<span class="msthumb" style="' + thumbBg(PHOTOS[0]) + '"></span>' +
    '<span style="min-width:0"><b>' + esc(p.a) + '</b><i>' + esc(p.hood + ' \u00b7 ' + p.bd + ' bd \u00b7 ' + p.ba + ' ba \u00b7 MLS ' + p.mls) + '</i></span>' +
    (badge ? '<span class="msnew">Newest</span>' : '<span class="msprice">' + money(p.price) + '</span>') + '</button>';
  const propRows = q => {
    const raw = (q || '').trim();
    q = raw.toLowerCase();
    const sorted = LISTINGS.slice().sort((a, b) => a.days - b.days);
    const hit = sorted.filter(p => !q || p.a.toLowerCase().includes(q) || p.hood.toLowerCase().includes(q) || p.mls.indexOf(q) === 0);
    let out = hit.map((p, i) => propRow(p, !q && i === 0)).join('');
    const num = q.replace(/[^0-9]/g, '');
    if(!hit.length && raw && /^[\d\s-]+$/.test(raw)){
      /* pure number = MLS id — always resolves in this prototype */
      out += '<button class="mspr pull" type="button" data-mspmls="' + esc(num) + '">' +
        '<span class="msthumb">' + sv(SEARCHI) + '</span>' +
        '<span style="min-width:0"><b>MLS ' + esc(num) + '</b><i>Not in your CRM \u2014 I will fetch it and add the card</i></span></button>';
    } else if(!hit.length && raw){
      /* anything else = an address — offer to pull it */
      out += '<button class="mspr pull" type="button" data-mssend="Pull in ' + esc(raw) + '">' +
        '<span class="msthumb">' + sv(SEARCHI) + '</span>' +
        '<span style="min-width:0"><b>' + esc(raw) + '</b><i>Not in your CRM \u2014 I will pull it from the MLS</i></span></button>';
    }
    if(!out) out = '<div class="mspzero">Nothing in your CRM matches that. Type the full MLS number and I will pull it from the board.</div>';
    return out;
  };
  const propCards = () => '<div class="msprop" data-mspwrap>' +
    '<div class="mspsearch">' + sv(SEARCHI) +
      '<input type="text" data-mspq placeholder="Search address or MLS number" aria-label="Search address or MLS number" autocomplete="off" spellcheck="false">' +
      '<span class="mspkbd">Enter</span></div>' +
    '<div class="mspgroup" data-mspgroup>Recently added</div>' +
    '<div class="msplist" data-msplist>' + propRows('') + '</div></div>';
  window.MSPROP = propCards;

  /* five templates, three on screen, chevrons for the rest */
  const TPLKEYS = Object.keys(TPL);
  const tplCard = k => '<button class="msopt' + (S.tpl === k ? ' on' : '') + '" type="button" data-mstpl="' + k + '">' +
      frame(k, { s:0.42 }) +
      '<span class="msotick">' + CHK + '</span>' +
      '<span class="msoedit">' + sv('<circle cx="12" cy="12" r="3"/><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/>') + 'Preview</span></button>';
  const optCards = () => '<div class="mscar" data-mscar data-i="0">' +
    '<button class="mscarb prev" type="button" data-mscarb="-1" aria-label="Previous templates" disabled>' + sv('<path d="M15 18l-6-6 6-6"/>') + '</button>' +
    '<div class="mscarv"><div class="mscart">' + TPLKEYS.map(tplCard).join('') + '</div></div>' +
    '<button class="mscarb next" type="button" data-mscarb="1" aria-label="More templates">' + sv('<path d="M9 18l6-6-6-6"/>') + '</button>' +
    '<div class="mscarf"><div class="mscardots">' + TPLKEYS.slice(0, TPLKEYS.length - 1).map((_, n) => '<i' + (n === 0 ? ' class="on"' : '') + '></i>').join('') + '</div>' +
      '<span class="mscarn">' + TPLKEYS.length + ' templates</span></div></div>';

  const EDITS = ['Change the photo', 'Change the colour', 'Rewrite the caption', 'Post it'];
  const MEDITS = ['Change the photo', 'Change the colour', 'Rewrite the caption', 'Post it'];
  const chatPrevInner = () => frame(S.tpl, { s:0.8 }) +
    '<div class="mscprevcap">' + esc(caption()) + ' <span class="mscprevtags">' + esc(HASHTAGS(S.prop)) + '</span></div>' +
    '<button class="mscprevfs" type="button" data-msa="editor">' + sv('<path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>') + 'View full screen</button>';
  const chatCard = () => (S.tpl && S.prop) ? '<div class="mscprev" data-mscprev>' + chatPrevInner() + '</div>' : '';
  const artCard = () => window.melArtifact(
    { ph:tone().c, kind:'Post', title:TYPES[S.type].label + ' · ' + S.prop.a, meta:S.channel.label + ' ' + S.channel.ratio + ' · ' + tplName(S.tpl) + ' · draft saved to Library' },
    () => renderCanvas(true, true));

  const viewCards = () => optCards();

  /* ---------- in-chat action panel ----------
     Everything the editor can do, as one-tap rows inside the thread. The editor
     is the secondary path, for hand-tuning. */
  const FILEIN = document.createElement('input');
  FILEIN.type = 'file'; FILEIN.accept = 'image/*';
  FILEIN.style.cssText = 'position:fixed;left:-9999px;width:1px;height:1px';
  document.body.appendChild(FILEIN);
  function takeFile(f){
    if(!f || !/^image\//.test(f.type)) return;
    const r = new FileReader();
    r.onload = () => {
      S.uploadSrc = r.result; S.upload = true; UPLOAD.n = f.name;
      syncPanels(); renderLive();
      if(window.sonner) sonner('Photo placed', f.name + ' \u00b7 reframed to ' + S.channel.ratio);
      window.MEL.say('<p>' + esc(f.name) + ' is on the post now, reframed to ' + esc(S.channel.ratio) +
        ' from the centre. Nudge the framing if it clips the roofline.</p>',
        b => b.insertAdjacentHTML('beforeend', group('photo') + suggest()));
    };
    r.readAsDataURL(f);
  }
  FILEIN.addEventListener('change', () => { takeFile(FILEIN.files && FILEIN.files[0]); FILEIN.value = ''; });

  const achip = (act, v, label, on, extra) => '<button class="msachip' + (on ? ' on' : '') + '" type="button" data-msa="' + act + '"' +
    (v != null ? ' data-v="' + esc(String(v)) + '"' : '') + (extra || '') + '>' + label + '</button>';

  /* one small control group per topic — Mel offers a pill, the pill brings its control */
  const CTL = {
    photo: () => {
      const p = S.prop;
      const thumbs = PHOTOS.map((ph, i) =>
        '<button class="msathumb' + (!S.upload && (S.img % PHOTOS.length) === i ? ' on' : '') + '" type="button" data-msa="photo" data-v="' + i + '" style="' + thumbBg(ph) + '" title="' + esc(ph.n) + '"><i>' + esc(ph.n) + '</i></button>').join('') +
        '<button class="msathumb up' + (S.upload ? ' on' : '') + '" type="button" data-msa="upload"' +
          (S.upload && S.uploadSrc ? ' style="background-image:url(\'' + S.uploadSrc + '\');background-size:cover;background-position:center"' : '') + '>' +
          (S.upload && S.uploadSrc ? '<i>' + esc(UPLOAD.n) + '</i>' : sv('<path d="M12 5v14M5 12h14"/>') + '<i>Upload mine</i>') + '</button>';
      return '<div class="msathumbs">' + thumbs + '</div>' +
        '<div class="msaseg sm">' + achip('crop', 'up', 'Frame higher', S.crop === '18%') +
          achip('crop', 'mid', 'Centre', S.crop === '50%') + achip('crop', 'down', 'Frame lower', S.crop === '82%') + '</div>';
    },
    color: () => '<div class="msasws">' +
      '<button class="msasw auto' + (!S.color ? ' on' : '') + '" type="button" data-msa="color" data-v="" title="From the photo"></button>' +
      COLORS.map(c => '<button class="msasw' + (S.color === c.c ? ' on' : '') + '" type="button" data-msa="color" data-v="' + c.c + '" title="' + c.n + '" style="--ph:' + c.c + '"></button>').join('') +
      '</div><span class="msafine">First swatch keeps the colour sampled from the photo.</span>',
    font: () => Object.keys(FONTS).map(k => achip('font', k, FONTS[k].n, S.font === k,
      ' style="font-family:' + FONTS[k].s + '"')).join('') +
      '<span class="msafine">' + esc(FONTS[S.font].d) + '.</span>',
    layout: () => Object.keys(TPL).map(k => achip('tpl', k, tplName(k), S.tpl === k)).join(''),
    headline: () => '<div class="msatones">' + TYPES[S.type].heads(S.prop).map((h, i) =>
        achip('hlpick', i, h, S.hlText == null && headline() === h)).join('') +
      achip('hlpick', 'orig', 'Original', S.hlText == null && S.hl % 3 === 0) + '</div>' +
      '<span class="msafine">AI takes on the same facts — tap one and it lands on the post. Your own words live in the open editor.</span>',
    caption: () => '<div class="msaseg sm">' + achip('len', 'full', 'Full', !S.short) + achip('len', 'short', 'Short', S.short) + '</div>' +
      '<textarea class="msatext" rows="4" data-msa="captext" aria-label="Caption">' + esc(caption()) + '</textarea>' +
      '<div class="msatones">' + achip('tone', 'ai', 'AI rewrite') + achip('tone', 'punchier', 'Punchier') + achip('tone', 'warmer', 'Warmer') +
        achip('tone', 'professional', 'Formal') + achip('tone', 'reset', 'Mel\u2019s original') + '</div>',
    tags: () => '<input class="msatext" type="text" data-msa="tagtext" value="' + esc(HASHTAGS(S.prop)) + '" aria-label="Hashtags">' +
      '<div class="mstagpre">' + TAGSUG().map(t => '<button type="button" data-msa="addtag" data-v="' + esc(t) + '">+ ' + esc(t) + '</button>').join('') + '</div>',
    publish: () => {
      if(S.posted){
        return '<div class="msadone"><span class="msaok">' + CHK + '</span><b>' +
          (S.when === 'now' ? 'Posted to Instagram feed at 12:04 PM' : 'Scheduled for Saturday, 9:00 AM') +
          '</b><button type="button" data-msa="viewpost">View post</button></div>' +
          '<div class="msaspeed">' + sv('<path d="M13 2 4 14h6l-1 8 9-12h-6z"/>') + 'Made and ' + (S.when === 'now' ? 'posted' : 'scheduled') + ' in ' + (S.secs || 38) + 's \u00b7 ' + ((S.taps || 6)) + ' taps, no typing</div>' +
          '<div class="msabtns"><button class="msaghost" type="button" data-msa="undo">Undo \u2014 take it down</button>' +
          '<button class="msaghost" type="button" data-msa="storycut">Make a story cut</button></div>';
      }
      if(S.pconn){
        return '<div class="msaconfirm"><b>Connect Instagram to post</b>' +
          '<span>Post approved. Sign in as ' + HANDLE + ' and allow posting — Radius reads basic profile info only, and you can disconnect in Settings → Connectors.</span>' +
          '<div class="msabtns"><button class="msaghost" type="button" data-msa="cancelconn">Cancel</button>' +
          '<button class="msapri" type="button" data-msa="doconnect">Continue to Instagram</button></div></div>';
      }
      if(S.pconf){
        const where = [S.chans.ig && 'Instagram feed', S.chans.story && 'Instagram story', S.chans.fb && 'Facebook page'].filter(Boolean).join(' and ');
        return '<div class="msaconfirm"><b>' + (S.when === 'now' ? 'Post now?' : 'Schedule it?') + '</b>' +
          '<span>Goes to ' + esc(where) + ' ' + (S.when === 'now' ? 'right now' : 'Saturday at 9:00 AM') + ' as ' + HANDLE + '.</span>' +
          '<div class="msabtns"><button class="msaghost" type="button" data-msa="cancelconf">Cancel</button>' +
          '<button class="msapri" type="button" data-msa="confirmpost">' + (S.when === 'now' ? 'Post now' : 'Schedule it') + '</button></div></div>';
      }
      return '<div class="msaseg sm">' + achip('when', 'now', 'Post now', S.when === 'now') + achip('when', 'later', 'Schedule', S.when === 'later') + '</div>' +
        '<div class="msabtns"><button class="msapri" type="button" data-msa="publish">' +
          sv('<path d="m22 2-7 20-4-9-9-4z"/>') + (S.conn.ig || !S.chans.ig ? (S.when === 'now' ? 'Post to Instagram' : 'Schedule it') : 'Connect Instagram and post') + '</button>' +
        '<button class="msaghost" type="button" data-msa="save">Save to Library</button></div>';
    }
  };
  const group = k => (S.tpl && S.prop) ? '<div class="msg1" data-msakind="' + k + '">' + CTL[k]() + '</div>' : '';
  /* the conversational menu Mel offers after every change */
  /* ---------- action items: everything the editor does, as one tap ---------- */
  const ICO = {
    photo:'<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.4"/><path d="m21 15-5-5L5 21"/>',
    color:'<circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 0 0 18"/>',
    tag:'<path d="M20.6 13.4 12 22l-9-9 8.6-8.6a2 2 0 0 1 1.4-.6H20a2 2 0 0 1 2 2v6.2a2 2 0 0 1-.6 1.4z"/><circle cx="16.6" cy="7.4" r="1.1"/>',
    ai:'<path d="M12 3l1.7 4.8L18.5 9.5l-4.8 1.7L12 16l-1.7-4.8L5.5 9.5l4.8-1.7z"/><path d="M18 16.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z"/>',
    type:'<path d="M4 7h16"/><path d="M9 7v13"/><path d="M15 12h5"/>',
    layout:'<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 14h18"/>',
    send:'<path d="m22 2-7 20-4-9-9-4z"/>'
  };
  const TAGSUG = () => {
    const p = S.prop, hood = '#' + p.hood.toLowerCase().replace(/[^a-z]/g, '');
    return [hood, '#' + (TYPES[S.type].label.toLowerCase().replace(/[^a-z]/g, '')), '#openhouse',
      '#' + p.city.split(',')[0].toLowerCase().replace(/[^a-z]/g, '') + 'homes', '#realtorlife', '#firsttimebuyer']
      .filter(t => (S.tags != null ? S.tags : HASHTAGS(p)).indexOf(t) < 0).slice(0, 5);
  };
  /* label = what Mel asks; q = the intent the router matches */
  const ACTS = [
    ['Want me to rewrite the caption?',  'AI rewrite caption', 'ai',    1],
    ['Try a different headline?',        'AI headline',        'type',  1],
    ['Suggest more tags',                'Add tags',           'tag',   0],
    ['Show me other photos',             'Change the photo',   'photo', 0],
    ['Try another colour',               'Change the colour',  'color', 0],
    ['Try another layout',               'Change the layout',  'layout',0]
  ];
  const actions = () => {
    const chat = window.__melActions === 'chat';
    if(chat){
      const rows = ACTS.map(([l, q, i, ai]) =>
        '<button class="msactL' + (ai ? ' ai' : '') + '" type="button" data-msq="' + esc(q) + '">' +
          '<svg class="msaLa" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17 8v6a3 3 0 0 1-3 3H4"/><path d="m8 13-4 4 4 4"/></svg>' +
          '<span class="msaLt' + (ai ? ' msaLai' : '') + '">' + esc(l) + '</span>' +
          (ai ? '<span class="msaLbadge">AI</span>' : '') +
        '</button>').join('');
      return '<div class="msacts msacts-chat">' + rows +
        '<button class="msactL pri" type="button" data-msq="Post it">' +
          '<svg class="msaLa" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17 8v6a3 3 0 0 1-3 3H4"/><path d="m8 13-4 4 4 4"/></svg>' +
          '<span class="msaLt">Looks good — post it</span>' +
        '</button></div>';
    }
    return '<div class="msacts">' +
      ACTS.map(([l, q, i, ai]) => '<button class="msact' + (ai ? ' ai' : '') + '" type="button" data-msq="' + esc(q) + '">' +
        sv(ICO[i]) + (ai ? '<span class="mstai">' + esc(l) + '</span>' : esc(l)) + '</button>').join('') +
      '<button class="msact pri" type="button" data-msq="Post it">' + sv(ICO.send) + 'Looks good — post it</button></div>';
  };
  const suggest = () => actions();

  /* ---------- process trace: one unboxed line, context-aware, gone when the work lands ---------- */
  function trace(host, steps, opts){
    if(!host) return null;
    opts = opts || {};
    const el = document.createElement('div');
    el.className = 'mstr3';
    el.innerHTML = '<div class="mstrr run seen"><span class="mstri"><span class="mstrp"></span><img class="mstrm" src="assets/mel-icon.svg" alt=""></span><span class="mstrt3"></span></div>';
    host.appendChild(el);
    const row = el.querySelector('.mstrr'), ico = el.querySelector('.mstri'), lbl = el.querySelector('.mstrt3');
    let i = 0;
    const run = () => {
      if(i >= steps.length){
        el.remove();
        if(opts.done) opts.done();
        return;
      }
      const s = steps[i];
      lbl.textContent = s[0] + '\u2026';
      i++;
      setTimeout(() => {
        if(s[2] === 'err'){
          /* a failed step is the one thing that stays on screen */
          row.classList.remove('run');
          row.classList.add('err');
          ico.innerHTML = sv('<path d="M18 6 6 18M6 6l12 12"/>');
          lbl.textContent = opts.errLabel || s[0];
          el.classList.add('failed');
          if(opts.err) opts.err();
          return;
        }
        run();
      }, s[1] || 460);
    };
    setTimeout(run, 0);
    return el;
  }
  window.MSTRACE = trace;
  window.MSTRACE2 = trace;

  /* per-surface step wording — feed, story, reel, TikTok, X, website */
  function ctxSteps(){
    const n = TPLKEYS.length;
    const ch = (S.channel && S.channel.key) || 'igpost';
    const kind = (TYPES[S.type] && TYPES[S.type].label.toLowerCase()) || 'post';
    const MID = {
      igpost:  ['Framing the square crop', 'Laying out ' + n + ' feed templates'],
      igstory: ['Framing the 9:16 story canvas', 'Laying out ' + n + ' story templates'],
      reels:   ['Picking the cover frame and hook', 'Laying out ' + n + ' Reel covers'],
      tiktok:  ['Picking the cover frame and hook', 'Laying out ' + n + ' TikTok covers'],
      x:       ['Trimming the copy to fit X', 'Laying out ' + n + ' 16:9 cards'],
      website: ['Blocking out the listing page sections', 'Laying out ' + n + ' page templates']
    }[ch] || ['Mapping out the layout', 'Laying out ' + n + ' templates'];
    const copy = ch === 'website' ? 'Writing the ' + kind + ' page copy'
      : ch === 'x' ? 'Drafting the ' + kind + ' post'
      : 'Drafting the ' + kind + ' headline and caption';
    return [
      ['Pulling listing data and photos', 1700],
      [MID[0], 1500],
      [copy, 1700],
      [MID[1], 1500],
      ['Finalizing your designs', 1300]
    ];
  }

  function drafted(b){
    /* the templates lay themselves out live: dotted placeholders first, the trace running below them */
    const act = b.querySelector(':scope > .mmact');
    const ps = Array.prototype.slice.call(b.children).filter(el => !el.classList || (!el.classList.contains('mstr3') && !el.classList.contains('mmact')));
    ps.forEach(p => { p.style.display = 'none'; });
    if(act) act.style.display = 'none';
    b.insertAdjacentHTML('beforeend', '<div class="msskelcar"><span></span><span></span><span></span></div>');
    const skel = b.querySelector('.msskelcar');
    trace(b, ctxSteps(), { done(){
        if(skel) skel.remove();
        b.insertAdjacentHTML('beforeend', optCards());
        ps.forEach(p => { p.style.display = ''; b.appendChild(p); });
        b.insertAdjacentHTML('beforeend', suggest());
        const a2 = b.querySelector(':scope > .mmact');
        if(a2){ a2.style.display = ''; b.appendChild(a2); }
      } });
  }

  function syncPanels(){
    document.querySelectorAll('[data-msakind]').forEach(el => { el.innerHTML = CTL[el.dataset.msakind](); });
    refreshChatPrevs();
  }
  function refreshChatPrevs(){
    if(!S.tpl || !S.prop) return;
    document.querySelectorAll('[data-mscprev]').forEach(el => { el.innerHTML = chatPrevInner(); });
    document.querySelectorAll('.msopt[data-mstpl]').forEach(x => x.classList.toggle('on', x.dataset.mstpl === S.tpl));
  }
  function renderLive(){
    if(window.MEL.page.classList.contains('canvason')) renderCanvas(true);
    if(viewer.classList.contains('open')) renderViewer();
  }
  function refreshPanelPreviews(){ refreshChatPrevs(); renderLive(); }

  document.addEventListener('click', e => {
    const b = e.target.closest('[data-msa]'); if(!b || b.tagName === 'INPUT' || b.tagName === 'TEXTAREA') return;
    const k = b.dataset.msa, v = b.dataset.v;
    if(k === 'editor'){ openViewer(); return; }
    if(k === 'tpl'){ S.tpl = v; syncPanels(); renderLive(); return; }
    if(k === 'photo'){ S.upload = false; S.img = +v; syncPanels(); renderLive(); return; }
    if(k === 'upload'){ FILEIN.click(); return; }
    if(k === 'crop'){ S.crop = v === 'up' ? '18%' : v === 'down' ? '82%' : '50%'; syncPanels(); renderLive(); return; }
    if(k === 'color'){ S.color = v || null; syncPanels(); renderLive(); return; }
    if(k === 'font'){ S.font = v; syncPanels(); renderLive(); return; }
    if(k === 'hl'){ S.hl++; S.hlText = null; syncPanels(); renderLive(); return; }
    if(k === 'hlpick'){ S.hlText = null; S.hl = v === 'orig' ? 0 : +v; syncPanels(); renderLive(); return; }
    if(k === 'len'){ S.short = v === 'short'; S.cap = null; syncPanels(); renderLive(); return; }
    if(k === 'tone'){
      S.cap = v === 'reset' ? null : REWRITE[v](caption());
      syncPanels(); renderLive(); return;
    }
    if(k === 'addtag'){
      const cur = (S.tags != null ? S.tags : HASHTAGS(S.prop)).trim();
      if(cur.split(/\s+/).indexOf(v) < 0) S.tags = cur + ' ' + v;
      syncPanels(); renderLive(); return;
    }
    if(k === 'chan'){
      S.chans[v] = !S.chans[v];
      if(!S.chans.ig && !S.chans.story && !S.chans.fb) S.chans[v] = true;
      syncPanels(); renderLive(); return;
    }
    if(k === 'when'){ S.when = v; syncPanels(); return; }
    if(k === 'publish'){
      /* everything stays in the chat — approve and connect inline */
      if(S.chans.ig && !S.conn.ig){ S.pconn = true; } else { S.pconf = true; }
      syncPanels(); return;
    }
    if(k === 'cancelconn'){ S.pconn = false; syncPanels(); return; }
    if(k === 'cancelconf'){ S.pconf = false; syncPanels(); return; }
    if(k === 'doconnect'){
      /* swap this card in place — no new card below */
      const card = b.closest('.msaconfirm');
      const LINES = ['Opening Instagram in a secure window', 'Signing in as ' + HANDLE, 'Granting permission to post'];
      if(card){
        card.innerHTML = '<b>Connecting Instagram</b><div class="msadone" style="gap:9px"><span class="msspin"></span>' +
          '<span id="ms-connline">' + LINES[0] + '</span></div>';
        let n = 1;
        const tick = setInterval(() => {
          const l = document.getElementById('ms-connline');
          if(!l || n >= LINES.length){ clearInterval(tick); return; }
          l.textContent = LINES[n++];
        }, 600);
      } else b.innerHTML = '<span class="msspin"></span>';
      setTimeout(() => {
        S.conn.ig = true; S.pconn = false; S.pconf = true;
        if(window.sonner) sonner('Instagram connected', HANDLE + ' \u00b7 manage in Settings \u2192 Connectors');
        syncPanels();
      }, 2000);
      return;
    }
    if(k === 'confirmpost'){
      S.pconf = false; doPublish(); syncPanels();
      window.MEL.say('<p>' + (S.when === 'now' ? 'It is live on ' : 'Scheduled on ') + HANDLE +
        '. I logged it in your activity and the Library copy is marked ' + (S.when === 'now' ? 'posted' : 'scheduled') +
        '. Want the story cut from the same photo?</p>', bd => bd.insertAdjacentHTML('beforeend', qr(['Make a story cut', 'Market update post', 'Open house post'])));
      return;
    }
    if(k === 'undo'){
      S.posted = false; window.MSLIB && window.MSLIB.undo();
      if(window.sonner) sonner('Post taken down', 'Back to a draft in your Library \u2014 nothing lost');
      syncPanels(); renderLive(); return;
    }
    if(k === 'storycut'){ S.chans.story = true; if(window.sonner) sonner('Story cut queued', 'Same photo, reframed to 9:16 for review'); syncPanels(); renderLive(); return; }
    if(k === 'save'){
      window.MSLIB && window.MSLIB.save && window.MSLIB.save(S.prop, TYPES[S.type].label);
      if(window.sonner) sonner('Saved to Library', TYPES[S.type].label + ' \u00b7 ' + S.prop.a);
      return;
    }
    if(k === 'viewpost'){ if(window.sonner) sonner('Opening Instagram', HANDLE + ' \u00b7 newest post'); return; }
  });
  document.addEventListener('input', e => {
    const f = e.target.closest('[data-msakind] [data-msa]'); if(!f) return;
    const k = f.dataset.msa;
    if(k === 'hltext'){ S.hlText = f.value; refreshPanelPreviews(); }
    if(k === 'captext'){ S.cap = f.value; refreshPanelPreviews(); }
    if(k === 'tagtext'){ S.tags = f.value; renderLive(); }
  });
  /* drop an image straight onto the photo control */
  document.addEventListener('dragover', e => { if(e.target.closest('[data-msakind]')) e.preventDefault(); });
  document.addEventListener('drop', e => {
    const p = e.target.closest('[data-msakind]'); if(!p) return;
    e.preventDefault();
    takeFile(e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]);
  });

  /* ---------- full-screen post viewer ---------- */
  const viewer = document.createElement('div');
  viewer.className = 'msv'; viewer.id = 'ms-viewer';
  (document.querySelector('.melwrap') || document.body).appendChild(viewer);
  function openViewer(){ renderViewer(); viewer.classList.add('open'); }
  function closeViewer(){ viewer.classList.remove('open'); }
  const postInner = () => {
    const p = S.prop;
    if(isWeb()) return siteChrome(sitePage(S.tpl));
    return '<div class="mspostbar"><span class="mspav">MK</span><span><b>' + HANDLE + '</b><i>' + esc(p.city) + '</i></span><span class="msdots">···</span></div>' +
      frame(S.tpl, { s:1.35 }) +
      '<div class="mspcap" contenteditable="true" spellcheck="false" data-mv="cap">' + esc(caption()) +
        '<span class="mstags">' + HASHTAGS(p) + '</span></div>';
  };
  function refreshPost(){
    const el = viewer.querySelector('.msvstage .mspost');
    if(el) el.innerHTML = postInner();
  }
  function renderViewer(){
    const p = S.prop, t = TYPES[S.type];
    viewer.classList.toggle('rweb', isWeb());
    viewer.classList.toggle('r916', !isWeb() && S.channel.ratio === '9:16');
    viewer.classList.toggle('r169', !isWeb() && S.channel.ratio === '16:9');
    const imgs = PHOTOS.map((ph, i) =>
      '<button class="msvimg' + (!S.upload && (S.img % PHOTOS.length) === i ? ' on' : '') + '" type="button" data-mv="photo" data-i="' + i + '" style="--ph:' + ph.c + '"><span' + (ph.img ? ' style="background-image:url(\'' + ph.img + '\');background-size:cover;background-position:50% 50%"' : '') + '></span><i>' + esc(ph.n) + '</i></button>').join('') +
      '<button class="msvimg up' + (S.upload ? ' on' : '') + '" type="button" data-mv="upload"><span>' + sv('<path d="M12 5v14M5 12h14"/>') + '</span><i>Your photo</i></button>';
    const swatches = '<button class="msvswatch auto' + (!S.color ? ' on' : '') + '" type="button" data-mv="color" data-c="" title="From the photo"></button>' +
      COLORS.map(c => '<button class="msvswatch' + (S.color === c.c ? ' on' : '') + '" type="button" data-mv="color" data-c="' + c.c + '" title="' + c.n + '" style="--ph:' + c.c + '"></button>').join('');
    const post = '<div class="mspost msvbig">' + postInner() + '</div>';
    const tpls = Object.keys(TPL).map(k =>
      '<button class="msvtpl' + (S.tpl === k ? ' on' : '') + '" type="button" data-mv="tpl" data-k="' + k + '">' + frame(k, { s:0.3 }) + '<i>' + tplName(k) + '</i></button>').join('');
    viewer.innerHTML =
      '<div class="msvstage"><button class="msvback" type="button" data-mv="back" aria-label="Back to chat">' + sv('<path d="M19 12H5M11 18l-6-6 6-6"/>') + '</button>' +
        '<button class="msvshare" type="button" data-mv="share">' + sv('<path d="M12 16V4M7 8l5-4 5 4"/><path d="M5 14v5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-5"/>') + 'Share</button>' + post + '</div>' +
      '<aside class="msvside">' +
        '<div><h3 class="msvh">' + t.label + ' \u00b7 ' + S.channel.label + '</h3><p class="msvd">' + esc(p.kind === 'market' ? p.hood + ' \u00b7 median ' + money(p.price) + ' \u00b7 ' + p.sold + ' sold \u00b7 ' + p.dom + ' days' : p.kind === 'event' ? p.ename + ' \u00b7 ' + p.ewhen + ' \u00b7 ' + p.ewhere : p.a + ' \u00b7 ' + money(p.price) + ' \u00b7 ' + p.bd + ' bd \u00b7 ' + p.ba + ' ba') + '. Edit the photos, accent and text here — nothing publishes from this editor.</p></div>' +
        '<div class="msvsec"><button class="msvchip" type="button" data-mv="aistyle" style="display:inline-flex;align-items:center;gap:6px"><img src="assets/mel-icon.svg" alt="" style="width:13px;height:13px">Let Mel style it</button><span class="msvfine">One click — Mel picks the image, color, font and template, and rewrites the headline and ' + (isWeb() ? 'description' : 'caption') + '.</span></div>' +
        '<div class="msvsec"><div class="msvseg" style="margin-bottom:8px"><button type="button" data-mv="edtab" data-v="image" class="' + (S.edtab !== 'color' ? 'on' : '') + '">' + (isWeb() ? 'Hero photo' : 'Image') + '</button><button type="button" data-mv="edtab" data-v="color" class="' + (S.edtab === 'color' ? 'on' : '') + '">' + (isWeb() ? 'Accent' : 'Color') + '</button></div>' +
          (S.edtab === 'color'
            ? '<div class="msvsw">' + swatches + '</div>'
            : '<div class="msvimgs">' + imgs + '</div><span class="msvfine">' + (p.kind ? 'Pick any photo — or upload one of your own.' : S.upload ? 'Your upload, reframed to 1:1.' : 'Suggested from the MLS — or upload your own.') + '</span>') + '</div>' +
        '<div class="msvsec"><span class="msvlab">Font</span><div class="msactl">' + Object.keys(FONTS).map(k =>
          '<button class="msachip' + (S.font === k ? ' on' : '') + '" type="button" data-mv="font" data-k="' + k + '" style="font-family:' + FONTS[k].s + '">' + FONTS[k].n + '</button>').join('') + '</div></div>' +
        '<div class="msvsec"><span class="msvlab">Template</span><div class="msvtpls">' + tpls + '</div></div>' +
        '<div class="msvsec"><span class="msvlab">Headline</span><div class="msvinline"><input class="msvtext" type="text" data-mv="hltext" value="' + esc(headline()) + '"><button type="button" class="msvchip" data-mv="hl">Shuffle</button></div>' + (isWeb() ? '<span class="msvfine">Opens the about section, under the hero.</span>' : S.tpl === 'editorial' ? '' : '<span class="msvfine">Shows on the image with the Editorial template.</span>') + '</div>' +
        (isWeb() ? '<div class="msvsec"><span class="msvlab">Button label</span><input class="msvtext" type="text" data-mv="ctatext" value="' + esc(siteCta()) + '"><span class="msvfine">Used in the nav, the hero and the viewing band \u2014 it is the only thing on the page a buyer can click.</span></div>' : '') +
        '<div class="msvsec"><span class="msvlab">' + (isWeb() ? 'Description' : 'Caption') + '</span><div class="msvseg" style="margin-bottom:8px"><button type="button" data-mv="len" data-v="full" class="' + (!S.short ? 'on' : '') + '">Full</button><button type="button" data-mv="len" data-v="short" class="' + (S.short ? 'on' : '') + '">Short</button></div>' +
          '<textarea class="msvtext" rows="5" data-mv="captext">' + esc(isWeb() ? webCopy() : caption()) + '</textarea><span class="msvfine">' + (isWeb() ? 'Sits beside the headline on the page.' : 'Or type straight on the post.') + '</span></div>' +
        '<div class="msvfoot"><button class="msvsubmit" type="button" data-mv="save">Save to Library</button>' +
          '<button class="msvghost" type="button" data-mv="reset">Reset my edits</button></div></aside>';
  }
  viewer.addEventListener('click', e => {
    const b = e.target.closest('[data-mv]'); if(!b) return;
    const k = b.dataset.mv;
    if(k === 'back'){ closeViewer(); return; }
    if(k === 'share'){ if(window.sonner) sonner('Share link copied', 'Anyone on your team can review this draft'); return; }
    if(k === 'edtab'){ S.edtab = b.dataset.v; renderViewer(); return; }
    if(k === 'aistyle'){
      const pool = PHOTOS.length;
      S.upload = false;
      S.img = (S.img + 1 + Math.floor(Math.random() * (pool - 1))) % pool;
      S.color = Math.random() < .3 ? null : COLORS[Math.floor(Math.random() * COLORS.length)].c;
      const fk = Object.keys(FONTS); S.font = fk[Math.floor(Math.random() * fk.length)];
      const tk = Object.keys(TPL); S.tpl = tk[Math.floor(Math.random() * tk.length)];
      S.hl = (S.hl + 1) % 3; S.hlText = null; S.cap = null; S.aiN = (S.aiN || 0) + 1;
      renderViewer();
      if(window.sonner) sonner('Mel styled it', 'New image, color, font, template and copy — click again for another take');
      return;
    }
    if(k === 'photo'){ S.upload = false; S.img = +b.dataset.i; renderViewer(); return; }
    if(k === 'upload'){ FILEIN.click(); return; }
    if(k === 'color'){ S.color = b.dataset.c || null; renderViewer(); return; }
    if(k === 'tpl'){ S.tpl = b.dataset.k; renderViewer(); return; }
    if(k === 'font'){ S.font = b.dataset.k; renderViewer(); return; }
    if(k === 'hl'){ S.hl++; S.hlText = null; renderViewer(); return; }
    if(k === 'len'){ S.short = b.dataset.v === 'short'; S.cap = null; renderViewer(); return; }
    if(k === 'save'){
      window.MSLIB && window.MSLIB.save && window.MSLIB.save(S.prop, TYPES[S.type].label);
      if(window.sonner) sonner('Saved to Library', TYPES[S.type].label + ' · ' + S.prop.a);
      return;
    }
    if(k === 'reset'){
      S.color = null; S.hlText = null; S.cap = null; S.upload = false; S.img = 0;
      renderViewer();
      if(window.sonner) sonner('Edits reset', 'Back to the version Mel drafted');
      return;
    }
  });
  viewer.addEventListener('input', e => {
    const f = e.target.closest('[data-mv]'); if(!f) return;
    if(f.dataset.mv === 'hltext'){ S.hlText = f.value; refreshPost(); }
    if(f.dataset.mv === 'captext'){ S.cap = f.value; refreshPost(); }
    if(f.dataset.mv === 'ctatext'){ SITE.cta = f.value; refreshPost(); }
  });
  viewer.addEventListener('blur', e => {
    const cap = e.target.closest('[data-mv="cap"]');
    if(cap) S.cap = cap.textContent.replace(HASHTAGS(S.prop), '').trim();
  }, true);
  viewer.addEventListener('click', () => setTimeout(syncPanels, 0));
  viewer.addEventListener('input', () => setTimeout(syncPanels, 0));
  document.addEventListener('keydown', e => {
    if(e.key === 'Escape' && viewer.classList.contains('open')){ e.stopPropagation(); closeViewer(); }
  }, true);
  document.addEventListener('click', e => {
    const o = e.target.closest('[data-msopen]');
    if(o){ S.tpl = o.dataset.msopen; S.confirming = false; S.posted = false; S.connecting = false; openViewer(); }
  });

  /* ---------- the flow ---------- */
  function reply(text){
    const t = text.toLowerCase();
    if(window.MSEXT){ const x = window.MSEXT.reply(text, t); if(x){ if(x.takeover) S.tpl = null; return x; } }

    /* ---------- step 1 → 2: format picked, ask what it is for (prose only) ---------- */
    if(/social post|social media post|listing page for my website/.test(t) && !S.tpl){
      S.step = 'purpose'; S.type = null; S.prop = null; S.cap = null; S.tpl = null;
      return { body:'<p>' + esc(S.channel.label) + ', got it. What is this one for? Tap one \u2014 I will pull the listing and draft the copy.</p>',
        after: b => b.insertAdjacentHTML('beforeend', typeChips()) };
    }

    const hit = Object.keys(TYPES).find(k => t.includes(TYPES[k].label.toLowerCase()) || SYN[k].test(t));
    const propHit = LISTINGS.find(x => t.includes(x.a.toLowerCase().split(',')[0]));

    /* ---------- market update: which area ---------- */
    if(hit === 'market' && !/^run the numbers for/i.test(text) && !S.tpl){
      S.type = 'market'; S.step = 'area';
      return { body:'<p>Market update. Which area?</p>',
        after: b => b.insertAdjacentHTML('beforeend', areaCards()) };
    }
    if(!S.tpl && (/^run the numbers for/i.test(text) || (S.step === 'area' && !hit))){
      const named = AREAS.find(a => t.includes(a.toLowerCase()));
      const area = named || text.replace(/^run the numbers for\s*/i, '').trim() || AREAS[0];
      S.type = 'market'; S.prop = MKT(area); S.step = 'options'; S.tpl = 'bold'; S.cap = null;
      window.MSLIB && window.MSLIB.draft(S.prop, 'market');
      const mp = S.prop;
      return { body:'<p>Ran ' + esc(area) + ' for the last 30 days \u2014 ' + mp.sold + ' homes sold, median ' + money(mp.price) + ', ' + mp.dom + ' days on market, ' + mp.spl + '% of list. Every number is editable, and I would rather you correct me than post something you cannot defend on a listing appointment.</p>',
        after: b => { drafted(b); } };
    }

    /* ---------- event: own open house, or something local ---------- */
    if(hit === 'event' && !/^event:/i.test(text) && !S.tpl){
      S.type = 'event'; S.step = 'event';
      return { body:'<p>Event post. Which one?</p>',
        after: b => b.insertAdjacentHTML('beforeend', eventCards()) };
    }
    if((S.step === 'event' || /^event:/i.test(text)) && !S.tpl){
      const own = propHit, raw = text.replace(/^event:\s*/i, '').trim();
      S.type = 'event';
      S.prop = own ? EVT('Open house \u00b7 ' + own.a.split(',')[0], own.oh, own.a, own.hood)
                   : EVT(raw || 'Neighbourhood event', 'Saturday, 9 AM\u20131 PM', '24th & Noe', AREAS[0]);
      S.step = 'options'; S.tpl = 'bold'; S.cap = null;
      window.MSLIB && window.MSLIB.draft(S.prop, 'event');
      const ep = S.prop;
      return { body:'<p>' + esc(ep.ename) + ' \u2014 ' + esc(ep.ewhen) + ' at ' + esc(ep.ewhere) + '. ' +
          (own ? 'Day and address came off the listing.' : 'I guessed the day and place from what you typed \u2014 fix either one in the editor.') +
          ' Five templates below \u2014 chevron through the rest.</p>',
        after: b => { drafted(b); } };
    }

    /* ---------- property posts ---------- */
    if(hit && propHit && !S.tpl){
      S.type = hit; S.prop = propHit; S.step = 'options'; S.tpl = 'bold'; S.cap = null;
      window.MSLIB && window.MSLIB.draft(propHit, hit);
      return { body:'<p>Straight to it \u2014 ' + TYPES[hit].label.toLowerCase() + ' for ' + esc(propHit.a) + '. Pulled ' + money(propHit.price) + ', ' + propHit.bd + ' bed, ' + propHit.ba + ' bath, ' + propHit.photos + ' photos from the MLS. Five templates below \u2014 three on screen, chevron for the other two. The draft is already saved to your Library.</p>',
        after: b => { drafted(b); } };
    }
    if(hit && !S.tpl){
      S.type = hit; S.step = 'prop';
      return { body:'<p>' + TYPES[hit].label + '. Which property?</p>',
        after: b => b.insertAdjacentHTML('beforeend', propCards()) };
    }
    if(/search the mls/.test(t) && !S.tpl){
      S.step = 'prop';
      return { body:'<p>Any address or MLS number in your MLS \u2014 it does not have to be your listing.</p>',
        after: b => b.insertAdjacentHTML('beforeend', mlsField('Address or MLS number', 'Pull in')) };
    }
    if((S.step === 'prop' || /^pull in/i.test(text)) && !S.tpl){
      const p2 = propHit || (/^pull in/i.test(text) ? MLSPULL(text) : null);
      if(p2){
        S.prop = p2; S.type = S.type || 'justlisted'; S.step = 'options'; S.tpl = 'bold'; S.cap = null;
        window.MSLIB && window.MSLIB.draft(p2, S.type);
        return { body:'<p>' + (p2.kind === 'mls' ? 'Found ' : 'Pulled ') + esc(p2.a) + ' \u2014 ' + money(p2.price) + ', ' + p2.bd + ' bed, ' + p2.ba + ' bath, ' + p2.sqft + ' sqft, ' + p2.photos + ' photos. ' +
            (p2.kind === 'mls' ? 'It is not your listing, so I kept your name off the image and the caption neutral \u2014 co-op rules. ' : '') +
            (S.type === 'pricedrop' ? 'Led with the drop from ' + money(p2.was) + '. ' : '') +
            'Five templates \u2014 tap one to lock it in, chevron for the rest, or just tell me what to change from the actions below.</p>',
          after: b => { drafted(b); } };
      }
      return { body:'<p>I did not catch an address in that. Pick one of yours, or type the street address or MLS number.</p>',
        after: b => b.insertAdjacentHTML('beforeend', propCards()) };
    }
    if(S.step === 'purpose' && !S.tpl){
      return { body:'<p>Not sure which that is \u2014 pick one.</p>',
        after: b => b.insertAdjacentHTML('beforeend', typeChips()) };
    }

    if(S.tpl){
      /* ---------- conversational menu: one pill, one control ---------- */
      if(/^ai rewrite caption$|^rewrite it again$/.test(t)){
        S.cap = REWRITE.ai();
        return { body:'<p>Rewrote it \u2014 same facts, new phrasing, and a clearer ask on the last line. Tap it again for another take, or nudge the tone.</p>',
          after: b => { b.insertAdjacentHTML('beforeend', group('caption') + chatCard() + actions()); renderLive(); } };
      }
      if(/^change the photo$|^change photo$|^show me (other|more) photos$/.test(t)){
        return { body:'<p>' + (S.prop.kind ? 'Here is what I have for this one.' : 'These are the MLS photos on ' + esc(S.prop.a.split(',')[0]) + '.') +
            ' Tap one and it goes on the post.</p>',
          after: b => { b.insertAdjacentHTML('beforeend', group('photo') + chatCard() + suggest()); } };
      }
      if(/^change the colou?r$|^change colou?r$|^pick a colou?r$/.test(t)){
        return { body:'<p>Pick a colour. The dark ones hold white text best at story size.</p>',
          after: b => { b.insertAdjacentHTML('beforeend', group('color') + chatCard() + suggest()); } };
      }
      if(/^change the font$|^change font$/.test(t)){
        return { body:'<p>Three that work for this. Inter is the product default, Newsreader reads more editorial, Mono makes the price the loudest thing on the card.</p>',
          after: b => { b.insertAdjacentHTML('beforeend', group('font') + chatCard() + suggest()); } };
      }
      if(/^change the layout$|^change layout$/.test(t)){
        return { body:'<p>Same content, three arrangements.</p>',
          after: b => { b.insertAdjacentHTML('beforeend', group('layout') + chatCard() + suggest()); } };
      }
      if(/^change the headline$|^edit the headline$|^ai headline$/.test(t)){
        return { body:'<p>Three AI takes on the headline \u2014 tap one and it lands on the post. Your own words live in the open editor.</p>',
          after: b => { b.insertAdjacentHTML('beforeend', group('headline') + chatCard() + suggest()); } };
      }
      if(/^rewrite the caption$|^change the caption$|^edit the caption$/.test(t)){
        return { body:'<p>Here is the caption. Edit it directly, or pick a direction and I will rewrite it.</p>',
          after: b => { b.insertAdjacentHTML('beforeend', group('caption') + chatCard() + suggest()); } };
      }
      if(/^add tags$|^edit the tags$|^change the tags$|^tags$|hashtags/.test(t)){
        return { body:'<p>These go on the end of the caption. Tap to add \u2014 the first five are the ones your posts in ' + esc(S.prop.hood) + ' actually get found on.</p>',
          after: b => { b.insertAdjacentHTML('beforeend', group('tags') + chatCard() + suggest()); } };
      }
    }

    /* ---------- Mel does the edit: colour, tone ---------- */
    if(S.tpl && /back to the photo colou?r|automatic colou?r|^photo colou?r$/.test(t)){
      S.color = null;
      return { body:'<p>Back to the colour sampled from the photo.</p>',
        after: b => { b.insertAdjacentHTML('beforeend', chatCard() + actions()); renderCanvas(true); syncPanels(); } };
    }
    if(S.tpl){
      const cn = COLORS.find(c => new RegExp('^' + c.n.toLowerCase() + '$|use ' + c.n.toLowerCase() + '|' + c.n.toLowerCase() + ' colou?r').test(t));
      if(cn || /darker|lighter|cooler|bolder|different colou?r|change the colou?r|another colou?r/.test(t)){
        const pick = cn || (/darker|bolder/.test(t) ? COLORS[6] : /cooler/.test(t) ? COLORS[1] : /lighter/.test(t) ? COLORS[0] : COLORS[5]);
        S.color = pick.c;
        return { body:'<p>' + esc(pick.n) + ' it is \u2014 it holds white text at story size, which the pale ones do not. Three more below, or open the editor for the full set.</p>',
          after: b => { b.insertAdjacentHTML('beforeend', chatCard() + qr(['Ink', 'Sage', 'Camel', 'Photo colour'])); renderCanvas(true); syncPanels(); } };
      }
      if(/put my version back|undo the rewrite|undo rewrite/.test(t)){
        S.cap = null;
        return { body:'<p>Back to the caption I drafted.</p>',
          after: b => { b.insertAdjacentHTML('beforeend', chatCard() + actions()); renderCanvas(true); syncPanels(); } };
      }
      if(/punchier|warmer|more professional|formal|rewrite|reword|make it sound/.test(t)){
        const kind = /professional|formal/.test(t) ? 'professional' : /warmer/.test(t) ? 'warmer' : 'punchier';
        S.cap = REWRITE[kind](caption());
        return { body:'<p>Rewrote it ' + (kind === 'professional' ? 'straighter' : kind) + '. Two other directions below \u2014 or type the line you want and I will keep it word for word.</p>',
          after: b => { b.insertAdjacentHTML('beforeend', chatCard() + qr(['Punchier', 'Warmer', 'Formal', 'Undo rewrite'])); renderCanvas(true); syncPanels(); } };
      }
    }

    if(/social post|social media post|listing page for my website/.test(t) && !S.tpl){
      S.type = S.type || 'justlisted'; S.prop = S.prop || LISTINGS[0]; S.step = 'options'; S.cap = null; S.tpl = 'bold';
      window.MSLIB && window.MSLIB.draft(S.prop, S.type);
      const p = S.prop;
      return { body:'<p>Pulled ' + esc(p.a) + ' from the MLS — ' + money(p.price) + ', ' + p.bd + ' bed, ' + p.ba + ' bath, ' + p.photos + ' photos. Here are five templates for a ' + TYPES[S.type].label.toLowerCase() + ' post. Tap one to open it full screen, or just tell me what to change right here.</p>',
        after: b => drafted(b) };
    }

    const typeHit = Object.keys(TYPES).find(k => t.includes(TYPES[k].label.toLowerCase()) || t.includes(k));
    const bothHit = typeHit && LISTINGS.find(x => t.includes(x.a.toLowerCase().split(',')[0]));
    if(bothHit && !S.tpl){
      S.type = typeHit; S.prop = bothHit; S.step = 'options'; S.tpl = 'bold'; S.cap = null;
      window.MSLIB && window.MSLIB.draft(bothHit, typeHit);
      return { body:'<p>Straight to it — ' + TYPES[typeHit].label.toLowerCase() + ' for ' + esc(bothHit.a) + '. Pulled ' + money(bothHit.price) + ', ' + bothHit.bd + ' bed, ' + bothHit.ba + ' bath, ' + bothHit.photos + ' photos from the MLS. Five templates below \u2014 three on screen, chevron for the other two. The draft is already saved to your Library.</p>',
        after: b => { drafted(b); } };
    }
    if(typeHit && !S.tpl){
      S.type = typeHit; S.step = 'prop';
      return { body:'<p>' + TYPES[typeHit].label + ' it is. Which property? These three are yours and active right now.</p>',
        after: b => b.insertAdjacentHTML('beforeend', propCards()) };
    }

    if(S.step === 'prop' || (!S.tpl && LISTINGS.some(p => t.includes(p.a.toLowerCase().split(',')[0])))){
      const p = LISTINGS.find(x => t.includes(x.a.toLowerCase().split(',')[0]));
      if(p){
        S.prop = p; S.step = 'options'; S.tpl = 'bold'; S.cap = null;
        window.MSLIB && window.MSLIB.draft(p, S.type);
        return { body:'<p>Pulled ' + esc(p.a) + ' from the MLS — ' + money(p.price) + ', ' + p.bd + ' bed, ' + p.ba + ' bath, ' + p.sqft + ' sqft, ' + p.photos + ' photos. ' +
            (S.type === 'pricedrop' ? 'The price history shows the drop from ' + money(p.was) + ', so I led with that. ' : '') +
            'Five templates — three on screen, chevron for the rest. Tell me what to change and I will do it here.</p>',
          after: b => { drafted(b); } };
      }
    }

    if(/search the mls/.test(t)){
      return { body:'<p>Give me the address or MLS number and I will pull it in — it does not have to be your listing, as long as it is in your MLS.</p>' };
    }

    if(!S.tpl) return null;


    const use = t.match(/use the (.+?) version/);
    if(use){
      const k = Object.keys(TPL).find(x => TPL[x].n.toLowerCase() === use[1].trim());
      if(k){
        S.tpl = k;
        return { body:'<p>Locked to ' + TPL[k].n + '. One tap each from here — or post it.</p>',
          after: b => { b.insertAdjacentHTML('beforeend', chatCard() + suggest()); renderLive(); } };
      }
    }
    if(/another (mls )?(photo|image)|different (photo|image)|swap.*(photo|image)/.test(t)){
      S.upload = false; S.img++;
      return { body:'<p>Swapped to photo ' + ((S.img % PHOTOS.length) + 1) + ' of ' + S.prop.photos + ' — ' + tone().n.toLowerCase() + '. It came in at 4:3 so I reframed it to fill the square; the framing control is under the preview.</p>',
        after: b => { b.insertAdjacentHTML('beforeend', chatCard() + actions()); renderCanvas(true); syncPanels(); } };
    }
    if(/upload/.test(t)){
      setTimeout(() => FILEIN.click(), 260);
      return { body:'<p>Opening your files — pick any photo and I will place it on the post and reframe it to ' + esc(S.channel.ratio) + '.</p>',
        after: b => { b.insertAdjacentHTML('beforeend', group('photo')); } };
    }
    if(/shift the crop|framing|crop/.test(t)){
      S.crop = S.crop === '50%' ? '18%' : '50%';
      return { body:'<p>Moved the framing ' + (S.crop === '18%' ? 'up, so more of the roofline and sky are in.' : 'back to centre.') + '</p>',
        after: b => { b.insertAdjacentHTML('beforeend', chatCard() + actions()); renderCanvas(true); syncPanels(); } };
    }
    if(/headline|different head|change the head/.test(t)){
      S.hl++;
      return { body:'<p>New headline: “' + esc(headline()) + '”. ' + (S.tpl === 'editorial' ? 'It sits in the type band.' : 'On this template the headline only shows in the caption — switch to Editorial if you want it on the image.') + '</p>',
        after: b => { b.insertAdjacentHTML('beforeend', chatCard() + actions()); renderCanvas(true); syncPanels(); } };
    }
    if(/caption short|shorter|trim|tighten/.test(t)){
      S.short = true; S.cap = null;
      return { body:'<p>Tightened it to two lines. Most feeds truncate after about 125 characters, so the ask is now above the fold.</p>',
        after: b => { b.insertAdjacentHTML('beforeend', qr(['Another photo', 'New headline', 'Longer caption', 'Story cut'])); renderCanvas(true); syncPanels(); } };
    }
    if(/longer caption|put the longer/.test(t)){
      S.short = false; S.cap = null;
      return { body:'<p>Back to the full caption.</p>', after: b => { b.insertAdjacentHTML('beforeend', chatCard() + actions()); renderCanvas(true); syncPanels(); } };
    }
    if(/story/.test(t)){
      S.chans.story = true;
      return { body:'<p>Added the story cut. Same photo reframed to 9:16, so a slice of the left edge is gone — check the framing note under the preview before you post.</p>',
        after: b => { b.insertAdjacentHTML('beforeend', qr(['Adjust framing', 'Shorter caption', 'Post it'])); renderCanvas(true); syncPanels(); } };
    }
    if(/post it|publish|send it|go live/.test(t)){
      S.pconf = false; S.pconn = false;
      return { body:'<p>Ready when you are. Confirm below and it goes out as ' + HANDLE + ' — ' +
          (S.conn.ig ? 'the account is already connected.' : 'Instagram is not connected yet, so there is one connect step first.') + '</p>',
        after: b => { b.insertAdjacentHTML('beforeend', group('publish')); } };
    }
    return null;
  }

  /* ---------- wiring ---------- */
  const studioEl = $('ms-studio');
  const PANEL = {
    today: { el:'ms-today', t:'Today', d:'Mel watches list prices, open-house dates and closing anniversaries. These three are worth putting out this week.' },
    listings: { el:'ms-lc', t:'Your listings', d:'Where each one sits in its marketing arc. The highlighted stage is what Mel would post next.' }
  };
  function openPanel(k){
    const p = PANEL[k]; if(!p || !studioEl) return;
    Object.values(PANEL).forEach(x => { const el = $(x.el); if(el) el.style.display = (x === p) ? '' : 'none'; });
    $('ms-ptitle').textContent = p.t;
    $('ms-pdesc').textContent = p.d;
    studioEl.classList.add('paneled');
    const b = document.getElementById('mel-body'); if(b) b.scrollTop = 0;
  }
  function closePanel(){ studioEl && studioEl.classList.remove('paneled'); }
  const backBtn = $('ms-back');
  if(backBtn) backBtn.addEventListener('click', closePanel);

  function openStudio(){
    window.MEL.openMel();
    window.MEL.studio(true);
    canvas.parentNode && window.MEL.page.classList.remove('canvason');
    studioRow.classList.add('on');
    closePanel();
  }
  studioRow.addEventListener('click', () => { window.MEL.page.classList.remove('library'); openStudio(); });
  const CHANNELS = {
    igpost:  { key:'igpost', label:'Instagram feed', ratio:'1:1',  send:'Create a social post for Instagram' },
    igstory: { key:'igstory', label:'Instagram story', ratio:'9:16', send:'Create a social post as an Instagram story' },
    reels:   { key:'reels', label:'Reels', ratio:'9:16', send:'Create a social post as a Reel' },
    tiktok:  { key:'tiktok', label:'TikTok', ratio:'9:16', send:'Create a social post for TikTok' },
    x:       { key:'x', label:'X', ratio:'16:9', send:'Create a social post for X' },
    website: { key:'website', label:'Website listing page', ratio:'16:9', send:'Create a listing page for my website' }
  };
  hub.addEventListener('click', e => {
    const c = e.target.closest('.mshcard'); if(!c || hub.dataset.dragged) return;
    const ch = CHANNELS[c.dataset.hub];
    if(!ch) return;
    /* every starting point is its own chat — never continue the previous flow */
    window.MEL.newChat();
    S.channel = ch;
    S.t0 = Date.now(); S.taps = 1; S.aiN = 0;
    S.step = 'purpose'; S.type = null; S.prop = null; S.tpl = null; S.cap = null;
    S.color = null; S.hlText = null; S.short = false; S.upload = false; S.img = 0; S.hl = 0;
    S.font = 'inter'; S.uploadSrc = null; S.tags = null; S.pconf = false; S.pconn = false;
    S.posted = false; S.confirming = false; S.connecting = false; S.approved = false;
    canvas.innerHTML = ''; window.MEL.page.classList.remove('canvason');
    /* spatial bridge: thread scales in from the pressed card */
    const th = document.getElementById('mel-thread');
    if(th){
      const host = th.parentNode.getBoundingClientRect(), r = c.getBoundingClientRect();
      th.style.setProperty('--mth-ox', ((r.left + r.width/2 - host.left) / host.width * 100) + '%');
      th.style.setProperty('--mth-oy', ((r.top + r.height/2 - host.top) / host.height * 100) + '%');
      th.classList.remove('fromcard');
      hub.querySelectorAll('.mshcard.picked').forEach(p => p.classList.remove('picked'));
      c.classList.add('picked');
      requestAnimationFrame(() => th.classList.add('fromcard'));
      th.addEventListener('animationend', () => { th.classList.remove('fromcard'); c.classList.remove('picked'); }, { once:true });
    }
    window.MEL.send(ch.send);
  });

  document.addEventListener('keydown', e => {
    if(e.key === 'Escape' && window.MEL.page.classList.contains('canvason')) window.MEL.page.classList.remove('canvason');
  });
  document.addEventListener('click', e => {
    const fg = e.target.closest('[data-msfgo]');
    if(fg){
      const f = fg.parentNode.querySelector('[data-msf]');
      const v = ((f && f.value) || '').trim();
      if(!v){ f && f.focus(); return; }
      window.MEL.send(fg.dataset.msfgo + ' ' + v); return;
    }
    const s = e.target.closest('[data-mssend]');
    if(s){ window.MEL.send(s.dataset.mssend); return; }
    const q = e.target.closest('[data-msq]');
    if(q){ window.MEL.send(q.dataset.msq); return; }
    if(!e.target.closest('#ms-navstudio') && !e.target.closest('#mel-body')) studioRow.classList.remove('on');
  });

  document.addEventListener('keydown', e => {
    const f = e.target.closest && e.target.closest('[data-msf]');
    if(f && e.key === 'Enter'){
      e.preventDefault();
      const v = f.value.trim();
      if(v) window.MEL.send(f.dataset.msf + ' ' + v);
    }
  });

  /* ---------- v2 wiring: picker selection, live property search, MLS fetch, carousel ---------- */
  document.addEventListener('click', e => {
    /* selected state on the what-for tiles */
    const t = e.target.closest('[data-mstype]');
    if(t){
      const w = t.closest('.mstypes');
      if(w){ w.querySelectorAll('.mstype').forEach(x => x.classList.toggle('on', x === t)); w.classList.add('chosen'); }
    }
    /* template card = select it, silently — one dark ring, no chat message */
    const tc = e.target.closest('.msopt[data-mstpl]');
    if(tc && !e.target.closest('.msoedit')){
      S.tpl = tc.dataset.mstpl;
      document.querySelectorAll('.msopt[data-mstpl]').forEach(x => x.classList.toggle('on', x.dataset.mstpl === S.tpl));
      syncPanels(); renderLive();
    }
    /* clicks are the currency here — count them so the done state can show the cost */
    if(e.target.closest('[data-msq],[data-msa],[data-mssend],[data-mstpl],[data-msprow],[data-mspmls]')) S.taps = (S.taps || 0) + 1;
  }, true);

  /* AI rewrite pill on a template card — removed; the card has one CTA: Preview */

  document.addEventListener('input', e => {
    const i = e.target.closest('[data-mspq]'); if(!i) return;
    const w = i.closest('[data-mspwrap]');
    w.querySelector('[data-msplist]').innerHTML = propRows(i.value);
    w.querySelector('[data-mspgroup]').textContent = i.value.trim() ? 'Matches' : 'Recently added';
  });
  document.addEventListener('keydown', e => {
    const i = e.target.closest && e.target.closest('[data-mspq]');
    if(!i || e.key !== 'Enter') return;
    e.preventDefault();
    const w = i.closest('[data-mspwrap]');
    const go = w.querySelector('[data-mspmls]') || w.querySelector('[data-msprow]') || w.querySelector('.mspr[data-mssend]');
    if(go) go.click();
  });
  /* MLS number that is not in the CRM: skeleton card, trace, then auto-select it */
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-mspmls]'); if(!b) return;
    const num = b.dataset.mspmls, w = b.closest('[data-mspwrap]'), list = w.querySelector('[data-msplist]');
    const known = true; /* prototype: every number resolves */
    w.querySelector('[data-mspgroup]').textContent = 'Fetching from the board';
    list.innerHTML = '<div class="mspskel"><span class="msthumb"></span>' +
      '<span class="msks"><span></span><span></span></span>' +
      '<span class="msdots3"><i></i><i></i><i></i></span></div>';
    trace(w, known
      ? [['Searching SFAR MLS for ' + num, 520], ['One active record matched', 460], ['Pulling price, beds and 22 photos', 620]]
      : [['Searching SFAR MLS for ' + num, 560], ['No active record for that number', 400, 'err']],
      { label:'Looking it up\u2026', doneLabel:'Listing added', errLabel:'Nothing found for ' + num,
        done(){
          const p = MLSPULL('pull in ' + num);
          w.querySelector('[data-mspgroup]').textContent = 'Added from MLS';
          list.innerHTML = '<button class="mspr picked" type="button" data-msprow="mls">' +
            '<span class="msthumb" style="' + thumbBg(PHOTOS[0]) + '"></span>' +
            '<span style="min-width:0"><b>' + esc(p.a) + '</b><i>' + esc(p.hood + ' \u00b7 ' + p.bd + ' bd \u00b7 ' + p.ba + ' ba \u00b7 MLS ' + num) + '</i></span>' +
            '<span class="msprice">' + money(p.price) + '</span><span class="msptick">' + CHK + '</span></button>';
          setTimeout(() => window.MEL.send('Pull in ' + num), 420);
        },
        err(){
          w.querySelector('[data-mspgroup]').textContent = 'Recently added';
          list.innerHTML = '<div class="mspzero">' + esc(num) + ' is not active in SFAR or Bridge. Check the number, or pick one of yours.</div>' + propRows('');
        } });
  });
  /* template carousel: three visible, five in the set */
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-mscarb]'); if(!b) return;
    const car = b.closest('[data-mscar]'), max = TPLKEYS.length - 2;
    const i = Math.max(0, Math.min(max, (+car.dataset.i || 0) + (+b.dataset.mscarb)));
    car.dataset.i = i;
    car.querySelector('.mscart').style.transform = 'translateX(calc(' + (-i) + ' * ((100% - 12px)/2 + 12px)))';
    car.querySelector('.mscarb.prev').disabled = i === 0;
    car.querySelector('.mscarb.next').disabled = i === max;
    car.querySelectorAll('.mscardots i').forEach((d, n) => d.classList.toggle('on', n === i));
    car.classList.toggle('atend', i === max);
  });

  window.MELSTUDIO = {
    reply: reply,
    reset(){
      S.step = 'idle'; S.type = null; S.prop = null; S.tpl = null; S.img = 0; S.hl = 0;
      S.short = false; S.upload = false; S.crop = '50%'; S.cap = null;
      S.font = 'inter'; S.uploadSrc = null; S.tags = null; S.pconf = false; S.pconn = false;
      S.chans = { ig:true, story:false, fb:false }; S.when = 'now';
      S.posted = false; S.confirming = false; S.connecting = false; S.approved = false;
      S.also = { email:false, flyer:false, site:false };
      canvas.innerHTML = '';
      window.MEL.page.classList.remove('canvason');
    },
    /* Render a real post/preview for the packet editor. Snapshots + restores the
       shared studio state so the ambient flow is not disturbed. */
    renderPreview(prop, channelKey, opts){
      opts = opts || {};
      const backup = Object.assign({}, S);
      try {
        S.channel = { key:channelKey, label:(channelKey === 'website' ? 'Website listing page' : channelKey), ratio: (channelKey === 'igpost' ? '1:1' : channelKey === 'x' || channelKey === 'website' ? '16:9' : '9:16') };
        S.type = opts.type || 'justlisted';
        S.prop = prop;
        S.tpl = opts.tpl || (channelKey === 'website' ? 'editorial' : 'bold');
        S.img = opts.img || 0; S.hl = 0; S.short = false;
        S.font = opts.font || 'inter'; S.color = opts.color || null;
        S.upload = false; S.uploadSrc = null; S.cap = null; S.hlText = null;
        if(channelKey === 'website') return '<div class="mssite">' + siteChrome(sitePage(S.tpl)) + '</div>';
        return '<div class="mspost" style="--s:' + (opts.s || 1) + '">' +
          '<div class="mspostbar"><span class="mspav">MK</span><span><b>' + HANDLE + '</b><i>' + esc(prop.city || prop.hood) + '</i></span><span class="msdots">···</span></div>' +
          frame(S.tpl, { s:(opts.s || 1) }) +
          '<div class="mspcap">' + esc(caption()) + '<span class="mstags">' + HASHTAGS(prop) + '</span></div>' +
        '</div>';
      } catch(err){ return '<div style="padding:20px;color:#a33">Preview error: ' + esc(String(err && err.message || err)) + '</div>'; }
      finally { Object.assign(S, backup); }
    },
    TPLKEYS: Object.keys(TPL),
    WEBTPLKEYS: Object.keys(WEBTPL),
    tplName: tplName,
    LISTINGS: LISTINGS,
    PHOTOS: PHOTOS,
    FONTS: FONTS,
    HANDLE: HANDLE,
    /* preview builders for the packet editor */
    postPreview(prop, ch, opts){
      opts = opts || {};
      const backup = Object.assign({}, S);
      try {
        S.channel = { key:ch, label:ch, ratio: (ch === 'igpost' ? '1:1' : ch === 'x' ? '16:9' : '9:16') };
        S.type = opts.type || 'justlisted';
        S.prop = prop;
        S.tpl = opts.tpl || 'bold';
        S.img = opts.img || 0; S.hl = 0; S.short = ch === 'x';
        S.font = opts.font || 'inter'; S.color = opts.color || null;
        S.upload = false; S.uploadSrc = null; S.cap = null; S.hlText = null;
        return '<div class="mspost">' +
          '<div class="mspostbar"><span class="mspav">MK</span><span><b>' + HANDLE + '</b><i>' + esc(prop.city || prop.hood) + '</i></span><span class="msdots">···</span></div>' +
          frame(S.tpl, { s:(opts.s || 1) }) +
          '<div class="mspcap">' + esc(caption()) + '<span class="mstags">' + HASHTAGS(prop) + '</span></div>' +
        '</div>';
      } catch(err){ return '<div style="padding:20px;color:#a33">Preview error: ' + esc(String(err && err.message || err)) + '</div>'; }
      finally { Object.assign(S, backup); }
    },
    sitePreview(prop, opts){
      opts = opts || {}; const backup = Object.assign({}, S);
      try {
        S.channel = { key:'website', label:'Website', ratio:'16:9' };
        S.type = opts.type || 'justlisted'; S.prop = prop;
        S.tpl = opts.tpl || 'editorial'; S.img = opts.img || 0; S.font = opts.font || 'inter'; S.color = opts.color || null;
        S.upload = false; S.uploadSrc = null; S.cap = null; S.hlText = null;
        return '<div class="mssite">' + siteChrome(sitePage(S.tpl)) + '</div>';
      } catch(err){ return '<div style="padding:20px;color:#a33">Preview error</div>'; }
      finally { Object.assign(S, backup); }
    },
    emailPreview(prop, opts){
      opts = opts || {}; const backup = Object.assign({}, S);
      try {
        S.channel = { key:'email', label:'Email', ratio:'16:9' };
        S.type = opts.type || 'justlisted'; S.prop = prop; S.tpl = opts.tpl || 'bold';
        S.img = opts.img || 0; S.color = opts.color || null; S.font = opts.font || 'inter';
        S.upload = false; S.uploadSrc = null; S.cap = null; S.hlText = null;
        return emailPreview();
      } catch(err){ return '<div style="padding:20px;color:#a33">Preview error</div>'; }
      finally { Object.assign(S, backup); }
    },
    flyerPreview(prop, opts){
      opts = opts || {}; const backup = Object.assign({}, S);
      try {
        S.channel = { key:'flyer', label:'Flyer', ratio:'9:16' };
        S.type = opts.type || 'justlisted'; S.prop = prop; S.tpl = opts.tpl || 'bold';
        S.img = opts.img || 0; S.color = opts.color || null; S.font = opts.font || 'inter';
        S.upload = false; S.uploadSrc = null; S.cap = null; S.hlText = null;
        return flyerPreview();
      } catch(err){ return '<div style="padding:20px;color:#a33">Preview error</div>'; }
      finally { Object.assign(S, backup); }
    },
    tplThumb(k, s, opts){
      opts = opts || {};
      const backup = Object.assign({}, S);
      try {
        S.channel = opts.channel || S.channel || { key:'igpost', label:'IG', ratio:'1:1' };
        S.prop = opts.prop || S.prop || LISTINGS[0];
        S.type = S.type || 'justlisted';
        S.hl = 0; S.short = false; S.cap = null; S.hlText = null; S.uploadSrc = null;
        S.tpl = k; S.img = opts.img || 0; S.font = opts.font || 'inter'; S.color = opts.color || null; S.upload = false;
        return frame(k, { s: s || 0.28 });
      } catch(err){ console.warn('[tplThumb] ' + k + ': ' + (err && err.message || err)); return ''; }
      finally { Object.assign(S, backup); }
    }
  };
})();

