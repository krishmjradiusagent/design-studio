/* ============================================================================
   MEL — property website: end-to-end flow.
   chat entry → listing picker (recent / search / MLS) → drafting trace →
   template thumbnails → builder (fields + AI edits + template grid + design)
   → desktop / mobile preview + validation → Save draft vs Host.
   Self-contained: hooks window.MSEXT.reply, uses window.MEL + sonner.
   ========================================================================== */
(function(){
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const money = n => '$' + Number(n).toLocaleString('en-US');
  const sv = d => '<svg viewBox="0 0 24 24">' + d + '</svg>';
  const I = {
    search:'<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
    check:'<path d="M20 6 9 17l-5-5"/>',
    x:'<path d="M18 6 6 18M6 6l12 12"/>',
    back:'<path d="M19 12H5M11 18l-6-6 6-6"/>',
    chev:'<path d="m6 9 6 6 6-6"/>',
    plus:'<path d="M12 5v14M5 12h14"/>',
    minus:'<path d="M5 12h14"/>',
    desktop:'<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>',
    mobile:'<rect x="7" y="2" width="10" height="20" rx="2.5"/><path d="M11 19h2"/>',
    grid:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    shield:'<path d="M12 3l7 3v6c0 4-3 7-7 9-4-2-7-5-7-9V6z"/><path d="m9 12 2 2 4-4"/>',
    globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 3 2.5 15 0 18M12 3c-2.5 3-2.5 15 0 18"/>',
    publish:'<path d="M12 20V5"/><path d="m6 11 6-6 6 6"/><path d="M4 20h16"/>',
    save:'<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><path d="M17 21v-8H7v8M7 3v5h8"/>',
    copy:'<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"/>',
    ext:'<path d="M15 3h6v6M10 14 21 3M21 14v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h6"/>',
    eye:'<circle cx="12" cy="12" r="3"/><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/>',
    warn:'<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
    up:'<path d="m18 15-6-6-6 6"/>', down:'<path d="m6 9 6 6 6-6"/>',
    star:'<path d="M12 3l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.8 6.2 20.9l1.1-6.5L2.6 9.8l6.5-.9z"/>',
    trash:'<path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/>'
  };
  const melmark = '<img src="assets/mel-icon.svg" alt="" class="melmark">';
  const toast = (a, b) => { if(window.sonner) window.sonner(a, b); };

  /* ---------------------------- data ---------------------------- */
  const PH = [
    { n:'Front elevation', c:'#cfc9c0' }, { n:'Living room', c:'#c7d0d2' },
    { n:'Kitchen', c:'#d6cec4' }, { n:'Primary suite', c:'#c3ccc5' },
    { n:'Garden', c:'#b9c3ae' }, { n:'Dining', c:'#d2c8c8' },
    { n:'Bath', c:'#c9d2d8' }, { n:'Street view', c:'#c5bfb6' },
    { n:'Twilight', c:'#a9a7b6' }, { n:'Aerial', c:'#bcc6c9' }
  ];
  const LIST = [
    { id:'grove', a:'1420 Grove St', unit:'', city:'San Francisco, CA 94117', hood:'Noe Valley', bd:3, ba:2, sqft:'1,510',
      lot:'2,900', yr:1912, price:1285000, photos:24, mls:'424118', days:2, tier:'standard',
      oh:'Open Saturday, 1–4 PM', status:'Active · listed 2 days ago',
      feats:['Chef kitchen with gas range','Primary suite with walk-in closet','Original 1912 millwork','North-facing garden','Two-car garage','Two blocks from 24th St'],
      hood_copy:'Noe Valley trades noise for sun. The 24th Street corridor is a five-minute walk — bakeries, the farmers market on Saturdays, and a straight shot downtown on the J.',
      chips:['Walk score 94','Alvarado Elementary','J-Church two blocks','Farmers market Saturdays'] },
    { id:'pine', a:'88 Pine St', unit:'Unit 12B', city:'San Francisco, CA 94111', hood:'Financial District', bd:2, ba:2, sqft:'1,120',
      lot:'—', yr:2008, price:842000, photos:18, mls:'424096', days:11, tier:'standard',
      oh:'Open Sunday, 12–3 PM', status:'Active · 11 days on market',
      feats:['12th-floor bay views','Floor-to-ceiling glass','Deeded parking space','Attended lobby','Roof deck and gym','Walk score 99'],
      hood_copy:'You are above the Financial District with the Embarcadero on one side and Chinatown on the other. Ferry Building is eight minutes on foot.',
      chips:['Walk score 99','Transit score 100','Ferry Building 8 min','Doorman building'] },
    { id:'maple', a:'412 Maple Ave', unit:'', city:'Oakland, CA 94618', hood:'Rockridge', bd:4, ba:3, sqft:'2,240',
      lot:'5,100', yr:1948, price:975000, photos:31, mls:'424077', days:19, tier:'standard',
      oh:'Open Saturday, 2–4 PM', status:'Active · 19 days on market',
      feats:['Level lawn and patio','Bonus room over the garage','Remodelled in 2021','Primary on the main level','Central heat and A/C','Walk to College Ave'],
      hood_copy:'Rockridge is the flat-street, walk-to-dinner part of Oakland. College Ave is four blocks; BART is a ten-minute walk for a twelve-minute ride to the city.',
      chips:['Walk score 88','Chabot Elementary','Rockridge BART 10 min','College Ave dining'] },
    { id:'sea', a:'27 Seacliff Ave', unit:'', city:'San Francisco, CA 94121', hood:'Sea Cliff', bd:5, ba:5.5, sqft:'6,480',
      lot:'11,200', yr:1929, price:12750000, photos:52, mls:'424131', days:5, tier:'luxury',
      oh:'Private showings by appointment', status:'Active · listed 5 days ago',
      feats:['Golden Gate and Marin headland views','1929 Willis Polk architecture','Elevator to all four levels','Wine cellar for 1,200 bottles','Chef kitchen with scullery','Terraced garden by Blasen','Four-car garage and motor court','Guest house above the garage'],
      hood_copy:'Sea Cliff is thirty-eight houses on a bluff above China Beach. The bridge is the view from the front rooms and the Presidio trails start at the end of the street.',
      chips:['China Beach 3 min walk','Presidio trailheads','Lincoln Park golf','Private, gated street'] },
    { id:'vine', a:'1800 Vineyard Ridge', unit:'', city:'St. Helena, CA 94574', hood:'Napa Valley', bd:6, ba:7, sqft:'8,900',
      lot:'21 acres', yr:2016, price:24500000, photos:64, mls:'424140', days:9, tier:'luxury',
      oh:'Private showings by appointment', status:'Active · 9 days on market',
      feats:['21 planted acres of cabernet','Infinity pool over the valley','Bond-eligible winery permit','Guest barn with two suites','Olive grove and orchard','Bocce court and pizza oven','Solar array and back-up power','Gated drive lined with olives'],
      hood_copy:'Ten minutes from downtown St. Helena and the Silverado Trail. The ridge sits above the fog line, which is why the fruit here ripens the way it does.',
      chips:['21 acres planted','Meadowood 6 min','Downtown St. Helena','Ridge-line privacy'] }
  ];
  const AGENT = { name:'Maya Kapoor', team:'The Kapoor Group', broker:'Radius Agent Realty', dre:'DRE 02114488',
    phone:'(415) 555-0142', email:'maya@kapoorgroup.com', office:'1 Letterman Dr, Suite C, San Francisco, CA 94129' };

  const TPL = {
    editorial:{ n:'Image-led editorial', d:'Full-bleed hero, headline over the photo', fam:'standard' },
    minimal:  { n:'Modern minimal',      d:'Centred type, quiet rules, lots of air', fam:'standard' },
    feature:  { n:'Feature-focused',     d:'Spec panel beside the hero photo', fam:'standard' },
    split:    { n:'Split hero',          d:'Photo left, detail card right', fam:'standard' },
    priceled: { n:'Price-led',           d:'Price first, centred over the photo', fam:'standard' },
    estate:   { n:'Luxury presentation', d:'Serif, centred, generous margins', fam:'luxury' },
    noir:     { n:'Dark editorial',      d:'Near-black canvas, restrained accent', fam:'luxury' },
    lifestyle:{ n:'Neighborhood story',  d:'Hero plus three lifestyle panels', fam:'luxury' },
    gallery:  { n:'Gallery-led',         d:'Photo mosaic before the copy', fam:'luxury' }
  };
  const tplThumb = k => '<img class="wbthumbimg" src="assets/tpl/' + k + '.png" alt="' + esc(TPL[k].n) + ' template">';
  const COLORS = [
    { c:'#5A5FF2', n:'Radius indigo' }, { c:'#1F2937', n:'Graphite' }, { c:'#0F766E', n:'Teal' },
    { c:'#B45309', n:'Amber' }, { c:'#7C2D12', n:'Sienna' }, { c:'#3F3F46', n:'Slate' },
    { c:'#8A7A5C', n:'Champagne' }, { c:'#1E3A5F', n:'Navy' }
  ];
  const FONTS = {
    sans:  { n:'Sans',       b:"'Inter',-apple-system,sans-serif", h:"'Inter',-apple-system,sans-serif" },
    serif: { n:'Serif head', b:"'Inter',-apple-system,sans-serif", h:"'Newsreader',Georgia,serif" },
    all:   { n:'All serif',  b:"'Newsreader',Georgia,serif",       h:"'Newsreader',Georgia,serif" }
  };

  /* ---------------------------- state ---------------------------- */
  let W = null;
  const short = p => p.a + (p.unit ? ', ' + p.unit : '');
  const slugify = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  function draftCopy(p){
    const lux = p.tier === 'luxury';
    return {
      headline: lux ? 'A bluff-top classic, held by one family since 1974'.replace('bluff-top classic, held by one family since 1974',
                        p.id === 'sea' ? 'bluff-top Polk classic above China Beach' : 'ridge-top estate with 21 planted acres')
                    : p.bd + ' bedrooms, ' + p.hood + ', and a garden that gets the sun',
      intro: lux
        ? 'Offered for the first time in a generation, ' + short(p) + ' is ' + p.sqft + ' square feet on ' + p.lot + (String(p.lot).indexOf('acre') > -1 ? '' : ' square feet') + ' in ' + p.hood + '.'
        : short(p) + ' is a ' + p.sqft + ' square foot, ' + p.bd + ' bedroom home in ' + p.hood + ', listed at ' + money(p.price) + '.',
      desc: lux
        ? 'Built in ' + p.yr + ' and reworked with a light hand, the house reads calm from the entry: long sight lines, quiet materials, and every principal room turned toward the view. ' +
          p.feats[0] + ' anchors the main floor, and ' + p.feats[1].toLowerCase() + ' is the detail buyers ask about twice. ' +
          'Systems and finishes were brought current without erasing the original hand. Showings are private and by appointment; the full disclosure package and floor plans are available on request.'
        : 'The plan works the way people actually live: an open main floor, a kitchen that fits two cooks, and bedrooms set back from the street. ' +
          p.feats[0] + ', ' + p.feats[1].toLowerCase() + ', and ' + p.feats[3].toLowerCase() + ' are the three things buyers keep coming back to. ' +
          'Built in ' + p.yr + ' and kept up carefully since. Request a private tour below and I will send the full disclosure package the same day.'
    };
  }
  function initState(p, tpl){
    const c = draftCopy(p);
    W = {
      p:p, tpl:tpl || (p.tier === 'luxury' ? 'estate' : 'editorial'),
      f:{ title:short(p), address:p.city, headline:c.headline, intro:c.intro, desc:c.desc,
          feats:p.feats.slice(), cta:p.tier === 'luxury' ? 'Arrange a private viewing' : 'Request a private tour',
          cta2:'Download the disclosure package', hoodLink:'noevalleyguide.com/schools',
          agent:Object.assign({}, AGENT) },
      photos:PH.map((x, i) => ({ i:i, on:i < 7 })),
      sel:0, hero:0,
      design:{ acc:'#5A5FF2', font:p.tier === 'luxury' ? 'serif' : 'sans', framing:'50%' },
      tone:'professional', device:'desktop', tab:'content',
      open:{ hero:true },
      saved:false, hosted:false, hostedAt:null, dirty:false,
      slug:slugify(p.a) + (p.unit ? '-' + slugify(p.unit) : ''),
      linkBroken:true, checked:false
    };
    return W;
  }
  const url = () => 'kapoorgroup.radius.site/' + (W ? W.slug : 'listing');
  const usedPhotos = () => W.photos.filter(x => x.on);
  const PROPIMG = ['assets/prop/s1.jpg','assets/prop/s2.jpg','assets/prop/s3.jpg','assets/prop/s4.jpg'];
  const propImg = p => PROPIMG[((LIST.indexOf(p) % 4) + 4) % 4];
  const picOf = idx => {
    const list = usedPhotos();
    const n = (list.length ? list[((W.hero + idx) % list.length + list.length) % list.length].i : 0);
    return PH[n].c + " url('" + PROPIMG[n % 4] + "') center/cover no-repeat";
  };
  const touch = () => { if(W.hosted) W.dirty = true; };

  /* ---------------------------- the website ---------------------------- */
  function renderSite(tplKey, thumb){
    const t = TPL[tplKey], p = W.p, f = W.f, d = W.design, acc = d.acc;
    const ff = FONTS[d.font] || FONTS.sans;
    const bg = i => 'background:' + picOf(i);
    const price = money(p.price);
    const meta = p.hood + ' · ' + p.bd + ' bd · ' + p.ba + ' ba · ' + p.sqft + ' sqft';
    const eb = p.tier === 'luxury' ? 'Presented by ' + f.agent.team : 'For sale · ' + p.hood;
    const cta = esc(f.cta);
    let hero = '';
    if(tplKey === 'split'){
      hero = '<div class="wssplit"><div class="wssp wsphoto" style="' + bg(0) + '"></div>' +
        '<div class="wssc"><span class="wsebd">' + esc(eb) + '</span><h1 class="wsh1 dk">' + esc(f.title) + '</h1>' +
        '<div class="wsmeta dk">' + esc(meta) + '</div><div class="wsprice dk">' + price + '</div>' +
        '<span class="wsherocta">' + cta + '</span></div></div>';
    } else if(tplKey === 'feature'){
      hero = '<div class="wsfeatwrap"><div class="wssp wsphoto" style="' + bg(0) + '"></div>' +
        '<div class="wsspecs"><span class="wsebd">' + esc(eb) + '</span><h1>' + esc(f.title) + '</h1>' +
        '<div class="wsrow"><span>Bedrooms</span><b>' + p.bd + '</b></div>' +
        '<div class="wsrow"><span>Bathrooms</span><b>' + p.ba + '</b></div>' +
        '<div class="wsrow"><span>Interior</span><b>' + p.sqft + ' sqft</b></div>' +
        '<div class="wsrow"><span>Lot</span><b>' + esc(p.lot) + '</b></div>' +
        '<div class="wsrow"><span>Year built</span><b>' + p.yr + '</b></div>' +
        '<div class="wsp">' + price + '</div><span class="wsherocta">' + cta + '</span></div></div>';
    } else if(tplKey === 'minimal'){
      hero = '<div class="wscentre"><span class="wsebd">' + esc(eb) + '</span><h1 class="wsh1 dk">' + esc(f.title) + '</h1>' +
        '<div class="wsmeta dk">' + esc(meta) + ' · ' + price + '</div></div>' +
        '<div class="wsmph wsphoto" style="' + bg(0) + '"></div>';
    } else if(tplKey === 'priceled'){
      hero = '<div class="wshero wsphoto" style="' + bg(0) + '"><div class="wsscrim"></div><div class="wshc">' +
        '<div class="wspricebig">' + price + '</div><h1 class="wsh1">' + esc(f.title) + '</h1>' +
        '<div class="wsmeta">' + esc(meta) + '</div><span class="wsherocta">' + cta + '</span></div></div>';
    } else if(tplKey === 'gallery'){
      hero = '<div class="wsmosaic"><span class="wsphoto" style="' + bg(0) + '"></span><span class="wsphoto" style="' + bg(1) + '"></span>' +
        '<span class="wsphoto" style="' + bg(2) + '"></span><span class="wsphoto" style="' + bg(3) + '"></span></div>' +
        '<div class="wsgtitle"><span><span class="wsebd">' + esc(eb) + '</span><h1 class="wsh1 dk">' + esc(f.title) + '</h1>' +
        '<div class="wsmeta dk">' + esc(meta) + '</div></span><div class="wsprice dk">' + price + '</div></div>';
    } else {
      hero = '<div class="wshero wsphoto" style="' + bg(0) + '"><div class="wsscrim"></div><div class="wshc">' +
        '<span class="wseb">' + esc(eb) + '</span><h1 class="wsh1">' + esc(f.title) + '</h1>' +
        '<div class="wsmeta">' + esc(meta) + '</div><div class="wsprice">' + price + '</div>' +
        '<span class="wsherocta">' + cta + '</span></div></div>';
    }
    const fact = (b, l) => '<div class="wsfact"><b>' + esc(b) + '</b><i>' + esc(l) + '</i></div>';
    const gal = usedPhotos().length > 4
      ? '<div class="wsgal' + (tplKey === 'gallery' ? ' mosaic' : '') + '">' +
        [1,2,3].concat(tplKey === 'gallery' ? [4] : []).map(i =>
          '<span class="wsphoto" style="' + bg(i) + '"></span>').join('') + '</div>'
      : '<div class="wssec"><span class="wslab">Gallery</span><div class="wsseclead">Photos coming</div></div>';
    const lifestyle = tplKey === 'lifestyle'
      ? '<div class="wslifestyle">' + (p.chips.slice(0,3)).map((c, i) =>
          '<span class="wslc"><span class="wsphoto" style="' + bg(i + 4) + '"></span><b>' + esc(c) + '</b>' +
          '<i>' + esc(i === 0 ? 'Five minutes on foot from the front door.' : i === 1 ? 'The part of the neighborhood buyers ask about.' : 'Weekends here look like this.') + '</i></span>').join('') + '</div>'
      : '';
    const link = W.f.hoodLink
      ? '<a class="wshoodlink" href="#">' + esc(W.f.hoodLink) + '</a>' : '';
    return '<div class="ws v-' + tplKey + ' fam-' + t.fam + '" style="--acc:' + acc + ';--ff:' + ff.b + ';--ffh:' + ff.h + '">' +
      '<div class="wsnav"><span class="wsbrand">' + esc(f.agent.team) + '</span>' +
        '<span class="wslinks"><span>Gallery</span><span>Details</span><span>Neighborhood</span><span>Contact</span></span>' +
        '<span class="wsncta">' + cta + '</span></div>' +
      hero +
      '<div class="wsfacts">' + fact(p.bd, 'Bedrooms') + fact(p.ba, 'Bathrooms') + fact(p.sqft, 'Interior sqft') +
        fact(p.lot, 'Lot') + fact(p.yr, 'Year built') + '</div>' +
      '<div class="wsabout"><h2>' + esc(f.headline) + '</h2><div><p class="wsintro">' + esc(f.intro) + '</p>' +
        '<p>' + esc(f.desc) + '</p></div></div>' +
      gal +
      '<div class="wssec"><span class="wslab">Features and amenities</span><div class="wsfgrid">' +
        (f.feats.length ? f.feats.map(x => '<span class="wsf"><em></em>' + esc(x) + '</span>').join('')
                        : '<span class="wsf"><em></em>No features listed yet</span>') + '</div></div>' +
      '<div class="wshood"><div><span class="wslab">The neighborhood</span>' +
        '<div class="wsseclead">' + esc(p.hood) + '</div><p>' + esc(p.hood_copy) + '</p>' +
        '<div class="wschips">' + p.chips.map(c => '<span class="wschip">' + esc(c) + '</span>').join('') + '</div>' +
        link + '</div><div class="wsmap"></div></div>' +
      lifestyle +
      '<div class="wsband"><span><b>' + esc(p.oh) + '</b><i>' + esc(f.title) + ' · ' + esc(f.address) + '</i></span>' +
        '<span class="wscta">' + cta + '</span></div>' +
      '<div class="wsagent"><span class="wsav">' + esc(f.agent.name.split(' ').map(x => x[0]).join('').slice(0,2)) + '</span>' +
        '<span><b>' + esc(f.agent.name) + '</b><i>' + esc(f.agent.team) + ' · ' + esc(f.agent.broker) + ' · ' + esc(f.agent.dre) + '</i>' +
        '<span class="wsc"><span>' + esc(f.agent.phone || 'Phone not set') + '</span><span>' + esc(f.agent.email || 'Email not set') + '</span></span>' +
        '<i>' + esc(f.agent.office) + '</i></span>' +
        '<span class="wscta ghost">' + esc(f.cta2 || 'Contact') + '</span></div>' +
      '<div class="wsfoot"><span>© 2026 ' + esc(f.agent.team) + '</span><span>' + esc(f.agent.broker) + '</span>' +
        '<span>Equal Housing Opportunity</span><span>' + esc(url()) + '</span></div></div>';
  }

  /* ---------------------------- chat: trace ---------------------------- */
  function trace(host, steps, label, doneLabel, done){
    if(window.MSTRACE) return window.MSTRACE(host, steps, { label:label, doneLabel:doneLabel, done:done });
    const el = document.createElement('div');
    el.className = 'wbtrace';
    el.innerHTML = '<div class="wbtrh"><span class="wbsp"></span><span class="wbtrt">' + esc(label) + '</span><em></em></div>' +
      '<div class="wbtrl">' + steps.map(s => '<div class="wbtrr"><span class="wbti"><b></b></span><span>' + esc(s[0]) + '</span></div>').join('') + '</div>';
    host.appendChild(el);
    const rows = [].slice.call(el.querySelectorAll('.wbtrr'));
    const t0 = Date.now();
    let i = 0;
    const tick = () => {
      if(i > 0){ rows[i-1].classList.remove('run'); rows[i-1].classList.add('ok'); }
      if(i >= rows.length){
        el.classList.add('done');
        el.querySelector('.wbtrt').textContent = doneLabel;
        el.querySelector('.wbsp').innerHTML = sv(I.check);
        el.querySelector('.wbtrh em').textContent = ((Date.now() - t0) / 1000).toFixed(1) + 's';
        if(done) done();
        return;
      }
      rows[i].classList.add('seen', 'run');
      const d = steps[i][1] || 500; i++;
      setTimeout(tick, d);
    };
    setTimeout(tick, 60);
    return el;
  }

  /* ---------------------------- chat: pickers ---------------------------- */
  const rowHtml = (p, badge) =>
    '<button class="mspr" type="button" data-wbsend="Website for ' + esc(short(p)) + '">' +
      '<span class="msthumb" style="--ph:' + PH[0].c + ';background-image:url(\'' + propImg(p) + '\');background-size:cover;background-position:50% 50%"></span>' +
      '<span style="min-width:0"><b>' + esc(short(p)) + '</b><i>' + esc(p.hood + ' · ' + p.bd + ' bd · ' + p.ba + ' ba · MLS ' + p.mls) + '</i></span>' +
      (badge ? '<span class="msnew">Newest</span>' : '<span class="msprice">' + money(p.price) + '</span>') + '</button>';

  function pickerRows(q){
    const sorted = LIST.slice().sort((a, b) => a.days - b.days);
    const raw = (q || '').trim();
    const t = raw.toLowerCase();
    const hit = sorted.filter(p => !t || short(p).toLowerCase().indexOf(t) > -1 || p.hood.toLowerCase().indexOf(t) > -1 || p.mls.indexOf(t) === 0);
    let out = hit.map((p, i) => rowHtml(p, !t && i === 0)).join('');
    const num = t.replace(/[^0-9]/g, '');
    if(!hit.length && num.length >= 4){
      out += '<button class="mspr pull" type="button" data-wbmlsgo="' + esc(num) + '">' +
        '<span class="msthumb">' + sv(I.search) + '</span>' +
        '<span style="min-width:0"><b>MLS ' + esc(num) + '</b><i>Not in your CRM — I will pull it from the board</i></span></button>';
    } else if(!hit.length){
      out += '<div class="mspzero">Nothing matches that. Type a full MLS number and I will pull it from the board.</div>';
    }
    return out;
  }
  function pickerHtml(q){
    return '<div class="msprop" data-wbpick>' +
      '<div class="mspsearch">' + sv(I.search) +
        '<input type="text" data-wbq value="' + esc(q || '') + '" placeholder="Search address or MLS number" autocomplete="off" spellcheck="false">' +
        '<span class="mspkbd">Enter</span></div>' +
      '<div class="mspgroup" data-wbgroup>Recently added</div>' +
      '<div class="msplist" data-wbrows>' + pickerRows(q) + '</div></div>';
  }

  function cardsHtml(){
    const fam = W.p.tier === 'luxury' ? 'luxury' : 'standard';
    const keys = Object.keys(TPL).filter(k => TPL[k].fam === fam);
    const max = Math.max(0, keys.length - 2);
    const dots = Array.from({ length: max + 1 }, (_, n) => '<i class="' + (n === 0 ? 'on' : '') + '"></i>').join('');
    return '<div class="mscar" data-wbcar data-i="0">' +
      '<button class="mscarb prev" type="button" data-wbcarb="-1" aria-label="Previous templates" disabled>' + sv('<path d="M15 18l-6-6 6-6"/>') + '</button>' +
      '<div class="mscarv"><div class="mscart">' + keys.map(k =>
        '<button class="wbcard' + (W.tpl === k ? ' on' : '') + '" type="button" data-wbtpl="' + k + '">' +
          '<span class="wbthumb tall">' + renderSite(k, true) + '</span>' +
          '<span class="wbopen">' + sv(I.eye) + 'Open in builder</span>' +
          '<span class="wbcname"><b>' + esc(TPL[k].n) + '</b><i>' + esc(TPL[k].d) + '</i></span>' +
          '<span class="wbccap"><b>' + esc(W.f.headline) + '</b> · ' + esc(W.f.intro) + '</span></button>').join('') + '</div></div>' +
      '<button class="mscarb next" type="button" data-wbcarb="1" aria-label="More templates"' + (max === 0 ? ' disabled' : '') + '>' + sv('<path d="M9 18l6-6-6-6"/>') + '</button>' +
      '<div class="mscarf"><div class="mscardots">' + dots + '</div>' +
        '<button class="wbaib" type="button" data-wballtpl="1">' + sv(I.grid) + 'All ' + Object.keys(TPL).length + ' templates</button>' +
        '<span class="mscarn">' + keys.length + ' ' + fam + ' · ' + Object.keys(TPL).length + ' in total</span></div></div>';
  }

  /* ---------------------------- builder shell ---------------------------- */
  const app = document.createElement('div');
  app.className = 'wbapp';
  app.id = 'wb-app';
  const wbHost = document.querySelector('.melwrap') || document.body;
  wbHost.appendChild(app);
  const sheet = document.createElement('div');
  sheet.className = 'wbsheet';
  sheet.id = 'wb-sheet';
  wbHost.appendChild(sheet);

  function openBuilder(tpl){
    if(tpl) W.tpl = tpl;
    app.classList.add('open');
    document.body.classList.add('wb-builder-open');
    renderApp();
  }
  function closeBuilder(){
    app.classList.remove('open');
    sheet.classList.remove('open');
    document.body.classList.remove('wb-builder-open');
  }

  /* ---- AI text helpers (canned, deterministic) ---- */
  const TONE = {
    luxury: () => { const p = W.p, f = W.f;
      return 'Set on ' + (String(p.lot).indexOf('acre') > -1 ? p.lot : p.lot + ' square feet') + ' in ' + p.hood + ', the house is composed rather than decorated — long sight lines, quiet materials, and principal rooms that hold the view. ' +
        p.feats[0] + '. ' + p.feats[1] + '. Offered with floor plans and a complete disclosure package; showings are private and by appointment.'; },
    conversational: () => { const p = W.p;
      return 'Here is what I love about this one: the main floor actually works for real life, the kitchen fits two cooks, and the bedrooms are set back from the street. ' +
        p.feats[0].toLowerCase().replace(/^./, c => c.toUpperCase()) + ', plus ' + p.feats[3].toLowerCase() + '. Come see it Saturday — I will have the disclosures printed and ready.'; },
    professional: () => { const p = W.p;
      return 'Built in ' + p.yr + ' and offered at ' + money(p.price) + ', this ' + p.sqft + ' square foot residence has ' + p.bd + ' bedrooms and ' + p.ba + ' bathrooms in ' + p.hood + '. ' +
        p.feats.slice(0, 3).join(', ') + '. Request a private tour below; the full disclosure package is available the same day.'; }
  };
  const altHeads = () => { const p = W.p; return p.tier === 'luxury'
    ? ['A ' + p.yr + ' landmark above ' + p.hood + ', offered for the first time in a generation',
       p.sqft + ' square feet, ' + p.lot + ', and the view everyone comes here for',
       'Quietly extraordinary in ' + p.hood]
    : [p.bd + ' bedrooms in ' + p.hood + ', ready before the school year',
       'The ' + p.hood + ' floor plan buyers keep asking for',
       'Sun, a garden, and a five-minute walk to everything']; };
  const FEATSUG = { kitchen:'Chef kitchen with gas range and pantry', views:'Framed views from the principal rooms',
    outdoor:'Private outdoor space for dining', schools:'Assigned to a top-rated elementary' };

  function aiRun(btn, fn){
    const html = btn.innerHTML;
    btn.classList.add('busy');
    btn.innerHTML = '<span class="wbsp2"></span>Mel…';
    setTimeout(() => { btn.classList.remove('busy'); btn.innerHTML = html; fn(); }, 620);
  }

  /* ---- validation ---- */
  function issues(){
    const f = W.f, out = [];
    const photos = usedPhotos().length;
    if(photos < 6) out.push({ k:'photos', lvl:photos < 4 ? 'err' : 'warn', t:'Only ' + photos + ' photos selected',
      d:'The gallery and lifestyle panels use five. ' + W.p.photos + ' photos are synced from the MLS.', fix:'Add three more', act:'photos' });
    if(!f.agent.phone || !f.agent.email) out.push({ k:'contact', lvl:'err', t:'Contact details incomplete',
      d:'Buyers cannot reach you from the page — phone and email both show in the agent block.', fix:'Fill contact', act:'contact' });
    if(!f.cta.trim()) out.push({ k:'cta', lvl:'err', t:'No call to action',
      d:'The nav, hero and viewing band all render the same button label. Empty means no button.', fix:'Add a label', act:'cta' });
    if(f.headline.length > 62) out.push({ k:'head', lvl:'warn', t:'Headline runs past its space',
      d:f.headline.length + ' characters — the about section is laid out for about 60. It will wrap onto a fourth line on mobile.', fix:'Shorten with Mel', act:'headline' });
    if(f.desc.trim().length < 240) out.push({ k:'desc', lvl:'warn', t:'Description is thin',
      d:'Reads short beside the headline. 240–600 characters holds the section without crowding it.', fix:'Generate from listing', act:'desc' });
    if(f.feats.length < 4) out.push({ k:'feats', lvl:'warn', t:'Features section nearly empty',
      d:'Two columns of amenities need at least four lines to look intentional.', fix:'Suggest features', act:'feats' });
    if(W.linkBroken) out.push({ k:'link', lvl:'err', t:'Broken link in the neighborhood section',
      d:esc(f.hoodLink) + ' returns 404. It is the only outbound link on the page.', fix:'Remove the link', act:'link' });
    return out;
  }

  /* ---------------------------- builder render ---------------------------- */
  function preview(){
    return '<div class="wbframe"><div class="wbchrome"><span class="cd"></span><span class="cd"></span><span class="cd"></span>' +
      '<span class="wburl">' + (W.hosted ? '<b>' + esc(url()) + '</b>' : esc(url()) + ' · draft, not public') + '</span>' +
      '<button class="wbmini" type="button" data-wb="check" style="display:none">Check page</button></div>' +
      '<div class="wbscroll">' + renderSite(W.tpl) + '</div></div>';
  }
  function notice(){
    if(W.hosted && W.dirty) return '<div class="wbnotice warn">' + sv(I.warn) +
      '<span><b>Edits are not live yet.</b> The public page still shows the version you hosted at ' + esc(W.hostedAt) + '.</span>' +
      '<span class="wbsp3"><button class="wbbtn" type="button" data-wb="discard">Discard edits</button>' +
      '<button class="wbbtn warn" type="button" data-wb="pubchanges">Publish changes</button></span></div>';
    if(W.hosted) return '<div class="wbnotice">' + sv(I.globe) +
      '<span><b>Live since ' + esc(W.hostedAt) + '.</b> <code>' + esc(url()) + '</code></span>' +
      '<span class="wbsp3"><button class="wbbtn" type="button" data-wb="copy">' + sv(I.copy) + 'Copy link</button>' +
      '<button class="wbbtn" type="button" data-wb="visit">' + sv(I.ext) + 'Open</button>' +
      '<button class="wbbtn" type="button" data-wb="unpublish">Unpublish</button></span></div>';
    return '';
  }
  const fld = (label, key, val, kind, hint, count) =>
    '<div><div class="wblab">' + esc(label) + (count ? '<em class="' + (val.length > count ? 'over' : '') + '">' + val.length + '/' + count + '</em>' : '') + '</div>' +
    (kind === 'ta' ? '<textarea class="wbta" rows="' + (key === 'desc' ? 7 : 3) + '" data-wbf="' + key + '">' + esc(val) + '</textarea>'
                   : '<input class="wbin" type="text" data-wbf="' + key + '" value="' + esc(val) + '">') +
    (hint ? '<div class="wbhint" style="margin-top:6px">' + hint + '</div>' : '') + '</div>';
  const sec = (key, title, note, body, flag) =>
    '<div class="wbsec' + (W.open[key] ? ' open' : '') + (flag ? ' flag' : '') + '" data-wbsec="' + key + '">' +
      '<button class="wbsech" type="button" data-wbtoggle="' + key + '"><b>' + esc(title) + '</b><i>' + esc(note || '') + '</i>' +
      '<svg class="wbchev" viewBox="0 0 24 24">' + I.chev + '</svg></button>' +
      '<div class="wbsecb">' + body + '</div></div>';
  const aib = (act, label) => '<button class="wbaib" type="button" data-wbai="' + act + '">' + melmark + esc(label) + '</button>';

  function railContent(){
    const f = W.f, iss = issues(), flagged = k => iss.some(x => x.act === k);
    const photos = '<div class="wbphotos">' + W.photos.map((x, n) =>
      '<button class="wbph' + (x.on ? ' on' : ' off') + (W.sel === n ? ' hero' : '') + '" type="button" data-wbph="' + n + '" style="--ph:' + PH[x.i].c + ';--phimg:url(\'' + PROPIMG[x.i % 4] + '\')">' +
        '<span></span><i>' + esc(PH[x.i].n) + '</i>' +
        '<span class="wbord">' + (x.on ? (W.photos.filter((y, m) => y.on && m <= n).length) : '–') + '</span></button>').join('') + '</div>' +
      '<div class="wbai"><button class="wbaib" type="button" data-wb="phtoggle">' + sv(I.check) + (W.photos[W.sel].on ? 'Remove from page' : 'Add to page') + '</button>' +
      '<button class="wbaib" type="button" data-wb="phhero">' + sv(I.star) + 'Use as hero</button>' +
      '<button class="wbaib" type="button" data-wb="phup">' + sv(I.up) + 'Move earlier</button>' +
      '<button class="wbaib" type="button" data-wb="phdown">' + sv(I.down) + 'Move later</button></div>' +
      '<div class="wbhint">' + usedPhotos().length + ' of ' + PH.length + ' on the page · ' + W.p.photos + ' synced from MLS ' + W.p.mls + '. Selected: ' + esc(PH[W.photos[W.sel].i].n) + '.</div>';

    return sec('prop', 'Property', short(W.p),
        fld('Property title', 'title', f.title) + fld('Address line', 'address', f.address) +
        '<div class="wbhint">Price, beds, baths, lot and year come from MLS ' + W.p.mls + ' and update with the board — they are not editable here.</div>') +
      sec('hero', 'Headline and intro', 'Hero + about',
        fld('Headline', 'headline', f.headline, 'in', '', 62) +
        '<div class="wbai">' + aib('althead', 'Alternate headlines') + aib('shorthead', 'Shorten to fit') + '</div>' +
        '<div data-wbalts></div>' +
        fld('Introduction', 'intro', f.intro, 'ta') +
        '<div class="wbai">' + aib('rewriteintro', 'Rewrite') + '</div>', flagged('headline')) +
      sec('desc', 'Property description', f.desc.trim().length + ' chars',
        fld('Full description', 'desc', f.desc, 'ta') +
        '<div class="wblab" style="margin-top:2px">Tone</div>' +
        '<div class="wbseg">' + ['luxury','conversational','professional'].map(t =>
          '<button type="button" data-wbtone="' + t + '" class="' + (W.tone === t ? 'on' : '') + '">' + t.replace(/^./, c => c.toUpperCase()) + '</button>').join('') + '</div>' +
        '<div class="wbai">' + aib('gendesc', 'Generate from listing data') + aib('rewrite', 'Rewrite') +
          aib('shorten', 'Shorten to fit') + aib('grammar', 'Fix grammar and clarity') + '</div>' +
        '<div class="wblab" style="margin-top:2px">Emphasize</div>' +
        '<div class="wbai">' + Object.keys(FEATSUG).map(k =>
          '<button class="wbaib" type="button" data-wbemph="' + k + '">' + melmark + k.replace(/^./, c => c.toUpperCase()) + '</button>').join('') + '</div>', flagged('desc')) +
      sec('feats', 'Features and amenities', f.feats.length + ' lines',
        f.feats.map((x, i) => '<div class="wbfeat"><input class="wbin" type="text" data-wbfeat="' + i + '" value="' + esc(x) + '">' +
          '<button type="button" data-wb="featdel" data-i="' + i + '" aria-label="Remove">' + sv(I.minus) + '</button></div>').join('') +
        '<button class="wbadd" type="button" data-wb="featadd">' + sv(I.plus) + 'Add a feature</button>' +
        '<div class="wbai">' + aib('sugfeats', 'Suggest from listing') + '</div>', flagged('feats')) +
      sec('photos', 'Photos', usedPhotos().length + ' on page', photos, flagged('photos')) +
      sec('agent', 'Agent and contact', esc(f.agent.name),
        fld('Agent name', 'agent.name', f.agent.name) + fld('Team name', 'agent.team', f.agent.team) +
        fld('Brokerage', 'agent.broker', f.agent.broker) + fld('Phone', 'agent.phone', f.agent.phone) +
        fld('Email', 'agent.email', f.agent.email) + fld('Office address', 'agent.office', f.agent.office) +
        fld('License', 'agent.dre', f.agent.dre), flagged('contact')) +
      sec('cta', 'Calls to action', esc(f.cta || 'not set'),
        fld('Primary button', 'cta', f.cta, 'in', 'Used in the nav, the hero and the viewing band.') +
        fld('Secondary button', 'cta2', f.cta2, 'in', 'Sits in the agent block.') +
        fld('Neighborhood link', 'hoodLink', f.hoodLink, 'in', W.linkBroken ? '<span style="color:#DC2626">This link returns 404.</span>' : 'Checked — resolves.'), flagged('cta') || flagged('link'));
  }
  function railDesign(){
    const d = W.design;
    const tplGrid = Object.keys(TPL).filter(k => TPL[k].fam === TPL[W.tpl].fam).map(k =>
      '<button class="wbtpl' + (W.tpl === k ? ' on' : '') + '" type="button" data-wbtpl="' + k + '">' +
        '<span class="wbthumb">' + tplThumb(k) + '</span><i>' + esc(TPL[k].n) + '</i></button>').join('');
    return sec('tpl', 'Template', TPL[W.tpl].n,
        '<div class="wbtpls">' + tplGrid + '</div>' +
        '<button class="wbadd" type="button" data-wb="tplsheet">' + sv(I.grid) + 'All ' + Object.keys(TPL).length + ' templates</button>' +
        '<div class="wbhint">Layouts are fixed. Switching keeps every field you have edited — nothing is regenerated.</div>') +
      sec('acc', 'Accent colour', COLORS.filter(c => c.c === d.acc).map(c => c.n)[0] || 'Custom',
        '<div class="wbsw">' + COLORS.map(c => '<button class="wbswatch' + (d.acc === c.c ? ' on' : '') + '" type="button" data-wbacc="' + c.c + '" title="' + esc(c.n) + '" style="--ph:' + c.c + '"></button>').join('') + '</div>' +
        '<div class="wbhint">Buttons, dividers and the map pin. Everything else stays neutral.</div>') +
      sec('type', 'Typeface', FONTS[d.font].n,
        '<div class="wbseg">' + Object.keys(FONTS).map(k =>
          '<button type="button" data-wbfont="' + k + '" class="' + (d.font === k ? 'on' : '') + '">' + FONTS[k].n + '</button>').join('') + '</div>') +
      sec('heropic', 'Hero photo', esc(PH[W.photos[W.hero] ? W.photos[W.hero].i : 0].n),
        '<div class="wbphotos">' + W.photos.filter(x => x.on).map((x, n) =>
          '<button class="wbph on' + (W.hero === n ? ' hero' : '') + '" type="button" data-wbhero="' + n + '" style="--ph:' + PH[x.i].c + '"><span></span><i>' + esc(PH[x.i].n) + '</i></button>').join('') + '</div>' +
        '<div class="wblab" style="margin-top:2px">Framing</div>' +
        '<div class="wbseg">' + [['18%','Top'],['50%','Centre'],['82%','Bottom']].map(([v, l]) =>
          '<button type="button" data-wbframe="' + v + '" class="' + (d.framing === v ? 'on' : '') + '">' + l + '</button>').join('') + '</div>');
  }
  function chkPanel(){
    const iss = issues();
    const body = iss.length ? iss.map(x =>
      '<div class="wbissue ' + x.lvl + '"><span class="wbit"><span class="wbii">' + sv(x.lvl === 'ok' ? I.check : I.warn) + '</span>' +
      '<span><b>' + x.t + '</b><p>' + x.d + '</p></span></span>' +
      '<button class="wbfix" type="button" data-wbfix="' + x.act + '">' + melmark + esc(x.fix) + '</button></div>').join('')
      : '<div class="wbissue ok"><span class="wbit"><span class="wbii">' + sv(I.check) + '</span>' +
        '<span><b>Page is ready to host</b><p>Photos, contact details, calls to action, section lengths and links all check out on desktop and mobile.</p></span></span></div>';
    return '<div class="wbchk"><div class="wbchkh">' + melmark + '<b>Page check</b>' +
      '<button type="button" data-wb="closechk" aria-label="Close">' + sv(I.x) + '</button></div>' +
      '<div class="wbchkb">' + body + '</div>' +
      '<div class="wbchkf">Checked against desktop and mobile at 390px. Mel re-runs this every time you host.</div></div>';
  }

  function renderApp(){
    const iss = issues();
    app.classList.toggle('mobile', W.device === 'mobile');
    const state = W.hosted
      ? (W.dirty ? '<span class="wbstate dirty"><span class="dot"></span>Live · edits pending</span>'
                 : '<span class="wbstate live"><span class="dot"></span>Live</span>')
      : '<span class="wbstate"><span class="dot"></span>' + (W.saved ? 'Draft saved' : 'Draft') + '</span>';
    app.innerHTML =
      '<div class="wbbar">' +
        '<button class="wbback" type="button" data-wb="back" aria-label="Back to Mel">' + sv(I.back) + '</button>' +
        '<span class="wbtitle"><b>' + esc(W.f.title) + '</b><i>Listing website</i></span>' +
        '<div class="wbdev"><button type="button" data-wb="dev" data-v="desktop" title="Desktop" aria-label="Desktop preview" class="' + (W.device === 'desktop' ? 'on' : '') + '">' + sv(I.desktop) + '</button>' +
          '<button type="button" data-wb="dev" data-v="mobile" title="Mobile" aria-label="Mobile preview" class="' + (W.device === 'mobile' ? 'on' : '') + '">' + sv(I.mobile) + '</button></div>' +
        '<button class="wbbtn" type="button" data-wb="check">' + sv(I.shield) + 'Check' + (iss.length ? '<span class="wbcount">' + iss.length + '</span>' : '') + '</button>' +
        '<button class="wbbtn iconly" type="button" data-wb="save" title="Save draft" aria-label="Save draft">' + sv(I.save) + '</button>' +
        (W.hosted
          ? (W.dirty ? '<button class="wbbtn warn" type="button" data-wb="pubchanges">' + sv(I.globe) + 'Publish changes</button>'
                     : '<button class="wbbtn" type="button" data-wb="visit">' + sv(I.ext) + 'View live page</button>')
          : '<button class="wbbtn pri" type="button" data-wb="host">' + sv(I.publish) + 'Publish</button>') +
      '</div>' +
      '<aside class="wbrail"><div class="wbrtabs">' +
        ['content','design'].map(k => '<button class="wbrtab' + (W.tab === k ? ' on' : '') + '" type="button" data-wbtab2="' + k + '">' +
          (k === 'content' ? 'Content' : 'Design') + '</button>').join('') + '</div>' +
        '<div class="wbrbody">' + (W.tab === 'content' ? railContent() : railDesign()) + '</div></aside>' +
      '<div class="wbstage"><div style="width:100%;max-width:1180px;margin:0 auto">' + notice() + preview() + '</div></div>' +
      chkPanel();
  }
  function renderPreviewOnly(){
    const host = app.querySelector('.wbscroll');
    if(host) host.innerHTML = renderSite(W.tpl);
  }

  /* ---------------------------- sheets ---------------------------- */
  let sheetFam = null;
  function tplSheet(){
    const fam = sheetFam || TPL[W.tpl].fam;
    const cards = Object.keys(TPL).filter(k => TPL[k].fam === fam).map(k =>
      '<button class="wbgcard' + (W.tpl === k ? ' on' : '') + '" type="button" data-wbtpl="' + k + '">' +
        '<span class="wbthumb">' + tplThumb(k) + '</span>' +
        '<span class="wbgm"><b>' + esc(TPL[k].n) + '</b><i>' + esc(TPL[k].d) + '</i>' +
        '<span class="wbfamtag">' + (fam === 'luxury' ? 'Luxury' : 'Standard') + '</span></span></button>').join('');
    sheet.innerHTML = '<div class="wbsheetc"><div class="wbsh"><span><h3>Templates</h3>' +
      '<p>Nine controlled layouts in two families. Your copy, photos, colour and contact details carry across — the structure is what changes.</p></span>' +
      '<button class="wbx" type="button" data-wb="closesheet" aria-label="Close">' + sv(I.x) + '</button></div>' +
      '<div class="wbsb"><div class="wbfamtabs">' +
        ['standard','luxury'].map(x => '<button type="button" data-wbfam="' + x + '" class="' + (fam === x ? 'on' : '') + '">' +
          (x === 'standard' ? 'Standard properties' : 'Luxury properties') + '</button>').join('') + '</div>' +
      '<div class="wbgrid">' + cards + '</div></div>' +
      '<div class="wbfoot"><span class="wbhint">' + esc(W.p.tier === 'luxury' ? 'Mel suggested the luxury family for ' + money(W.p.price) + '.' : 'Mel suggested the standard family for this price band.') + '</span>' +
      '<button class="wbbtn" type="button" data-wb="closesheet">Done</button></div></div>';
    sheet.classList.add('open');
  }
  function hostSheet(){
    const iss = issues();
    sheet.innerHTML = '<div class="wbsheetc narrow"><div class="wbsh"><span><h3>Host this website</h3>' +
      '<p>Hosting publishes the page and returns a live link you can share by text, email or social. Saving keeps it private in your Marketing Studio library.</p></span>' +
      '<button class="wbx" type="button" data-wb="closesheet" aria-label="Close">' + sv(I.x) + '</button></div>' +
      '<div class="wbsb"><div class="wbfield"><div class="wblab">Public address</div>' +
        '<div class="wbslug"><span>kappoorgroup.radius.site/</span><input type="text" data-wbslug value="' + esc(W.slug) + '"></div>' +
        '<div class="wbhint">You can change this later; the old address redirects for 30 days.</div></div>' +
        (iss.length
          ? iss.slice(0, 4).map(x => '<div class="wbcheckline warn">' + sv(I.warn) + '<span>' + x.t + '</span></div>').join('') +
            '<div class="wbhint" style="margin-top:8px">You can host with these open — they are quality flags, not blockers.</div>'
          : '<div class="wbcheckline">' + sv(I.check) + '<span>Page check passed on desktop and mobile.</span></div>' +
            '<div class="wbcheckline">' + sv(I.check) + '<span>Photos, contact details and calls to action all present.</span></div>') +
      '</div><div class="wbfoot"><span class="wbhint">Nothing is public until you press host.</span>' +
      '<button class="wbbtn" type="button" data-wb="closesheet">Cancel</button>' +
      '<button class="wbbtn pri" type="button" data-wb="dohost">' + sv(I.globe) + 'Host it</button></div></div>';
    sheet.classList.add('open');
  }
  function hostRun(publishChanges){
    const c = sheet.querySelector('.wbsb');
    if(c){
      c.innerHTML = '<div id="wb-hosttrace"></div>';
      trace(c.querySelector('#wb-hosttrace'), [
        ['Building the page', 520], ['Optimising ' + usedPhotos().length + ' photos', 560],
        ['Publishing to ' + url(), 520], ['Warming the CDN and checking links', 460]
      ], 'Hosting…', 'Live', () => setTimeout(finish, 420));
    } else finish();
    function finish(){
      const now = new Date();
      W.hosted = true; W.dirty = false; W.saved = true;
      W.hostedAt = now.toLocaleTimeString('en-US', { hour:'numeric', minute:'2-digit' });
      sheet.classList.remove('open');
      renderApp();
      toast(publishChanges ? 'Changes are live' : 'Website is live', url() + ' · link copied');
      if(window.MEL && window.MEL.addTask) window.MEL.addTask(
        (publishChanges ? 'Website updated · ' : 'Website hosted · ') + short(W.p),
        url() + ' · ' + TPL[W.tpl].n + ' template · by Mel');
    }
  }

  /* ---------------------------- interactions ---------------------------- */
  function applyFix(act){
    if(act === 'photos'){ W.photos.forEach((x, i) => { if(i < 10) x.on = true; }); toast('Three photos added', 'Gallery and lifestyle panels are full'); }
    if(act === 'contact'){ W.f.agent.phone = AGENT.phone; W.f.agent.email = AGENT.email; toast('Contact details filled', 'From your Radius profile'); }
    if(act === 'cta'){ W.f.cta = W.p.tier === 'luxury' ? 'Arrange a private viewing' : 'Request a private tour'; toast('Button label set', W.f.cta); }
    if(act === 'headline'){ W.f.headline = altHeads()[2]; toast('Headline shortened', W.f.headline.length + ' characters'); }
    if(act === 'desc'){ W.f.desc = TONE[W.tone](); toast('Description generated', 'From MLS ' + W.p.mls + ' · ' + W.tone + ' tone'); }
    if(act === 'feats'){ W.f.feats = W.p.feats.slice(); toast('Features added', W.f.feats.length + ' lines from the listing'); }
    if(act === 'link'){ W.f.hoodLink = ''; W.linkBroken = false; toast('Broken link removed', 'No outbound links left to check'); }
    W.open[act === 'contact' ? 'agent' : act === 'headline' ? 'hero' : act === 'link' ? 'cta' : act] = true;
    W.tab = 'content';
    touch(); renderApp();
  }
  const setDeep = (key, val) => {
    if(key.indexOf('agent.') === 0) W.f.agent[key.slice(6)] = val;
    else W.f[key] = val;
    if(key === 'hoodLink') W.linkBroken = /noevalleyguide/.test(val);
  };

  app.addEventListener('click', e => {
    const tpl = e.target.closest('[data-wbtpl]');
    if(tpl){ W.tpl = tpl.dataset.wbtpl; touch(); renderApp(); return; }
    const tg = e.target.closest('[data-wbtoggle]');
    if(tg){ const k = tg.dataset.wbtoggle; W.open[k] = !W.open[k]; renderApp(); return; }
    const t2 = e.target.closest('[data-wbtab2]');
    if(t2){ W.tab = t2.dataset.wbtab2; renderApp(); return; }
    const tone = e.target.closest('[data-wbtone]');
    if(tone){ W.tone = tone.dataset.wbtone; W.f.desc = TONE[W.tone](); touch(); renderApp();
      toast('Tone changed to ' + W.tone, 'Description rewritten · nothing else touched'); return; }
    const emph = e.target.closest('[data-wbemph]');
    if(emph){ const k = emph.dataset.wbemph;
      aiRun(emph, () => {
        const line = FEATSUG[k];
        W.f.feats = [line].concat(W.f.feats.filter(x => x !== line)).slice(0, 8);
        W.f.desc = W.f.desc.replace(/\s*$/, '') + ' ' + (k === 'kitchen' ? 'The kitchen is the room that sells this house.'
          : k === 'views' ? 'The views hold from the principal rooms all day.'
          : k === 'outdoor' ? 'The outdoor space is usable, not decorative.'
          : 'The assigned schools are the reason families stay on this block.');
        touch(); renderApp(); toast('Emphasised ' + k, 'Feature moved up · one line added to the description');
      }); return; }
    const ai = e.target.closest('[data-wbai]');
    if(ai){ const k = ai.dataset.wbai;
      aiRun(ai, () => {
        if(k === 'althead'){
          const host = app.querySelector('[data-wbalts]');
          if(host) host.innerHTML = '<div class="wblab" style="margin:2px 0 6px">Three alternates · tap to use</div><div class="wbalts">' +
            altHeads().map(h => '<button class="wbalt" type="button" data-wbusehead="' + esc(h) + '">' + esc(h) + '</button>').join('') + '</div>';
          return;
        }
        if(k === 'shorthead'){ W.f.headline = altHeads()[2]; toast('Headline shortened', W.f.headline.length + ' characters'); }
        if(k === 'rewriteintro'){ W.f.intro = short(W.p) + ' · ' + W.p.bd + ' bed, ' + W.p.ba + ' bath, ' + W.p.sqft + ' sqft in ' + W.p.hood + '. ' +
          (W.p.tier === 'luxury' ? 'Shown privately, by appointment.' : 'Open ' + W.p.oh.replace('Open ', '') + '.'); toast('Intro rewritten', 'Same facts, tighter'); }
        if(k === 'gendesc'){ W.f.desc = TONE[W.tone](); toast('Description generated', 'From MLS ' + W.p.mls + ' · ' + W.tone + ' tone'); }
        if(k === 'rewrite'){ W.f.desc = TONE[W.tone]() + ' Ask me for the disclosure package and I will send it the same day.'; toast('Rewritten', 'Kept every fact, changed the sentences'); }
        if(k === 'shorten'){ W.f.desc = W.f.desc.split(/(?<=\.)\s/).slice(0, 2).join(' '); toast('Shortened to fit', W.f.desc.length + ' characters · fits the about section'); }
        if(k === 'grammar'){ W.f.desc = W.f.desc.replace(/\s+/g, ' ').replace(/\s([,.])/g, '$1').replace(/^./, c => c.toUpperCase()).trim();
          if(!/[.!?]$/.test(W.f.desc)) W.f.desc += '.'; toast('Grammar and clarity', '3 fixes · no facts changed'); }
        if(k === 'sugfeats'){ W.f.feats = W.p.feats.slice(); toast('Features suggested', W.f.feats.length + ' lines from MLS ' + W.p.mls); }
        touch(); renderApp();
      }); return; }
    const use = e.target.closest('[data-wbusehead]');
    if(use){ W.f.headline = use.dataset.wbusehead; touch(); renderApp(); toast('Headline updated', ''); return; }
    const ph = e.target.closest('[data-wbph]');
    if(ph){ W.sel = +ph.dataset.wbph; renderApp(); return; }
    const hero = e.target.closest('[data-wbhero]');
    if(hero){ W.hero = +hero.dataset.wbhero; touch(); renderApp(); return; }
    const acc = e.target.closest('[data-wbacc]');
    if(acc){ W.design.acc = acc.dataset.wbacc; touch(); renderApp(); return; }
    const font = e.target.closest('[data-wbfont]');
    if(font){ W.design.font = font.dataset.wbfont; touch(); renderApp(); return; }
    const frame = e.target.closest('[data-wbframe]');
    if(frame){ W.design.framing = frame.dataset.wbframe; touch(); renderApp(); return; }
    const fix = e.target.closest('[data-wbfix]');
    if(fix){ applyFix(fix.dataset.wbfix); return; }

    const b = e.target.closest('[data-wb]'); if(!b) return;
    const k = b.dataset.wb;
    if(k === 'back'){ closeBuilder(); return; }
    if(k === 'dev'){ W.device = b.dataset.v; renderApp(); return; }
    if(k === 'check'){ W.checked = true; app.classList.toggle('chk', !app.classList.contains('chk')); return; }
    if(k === 'closechk'){ app.classList.remove('chk'); return; }
    if(k === 'tplsheet'){ sheetFam = TPL[W.tpl].fam; tplSheet(); return; }
    if(k === 'save'){
      W.saved = true; renderApp();
      if(window.MSLIB && window.MSLIB.save) window.MSLIB.save({ id:W.p.id, a:short(W.p), hood:W.p.hood, price:W.p.price }, 'Property website');
      toast('Saved to your Library', 'Editable draft · not public');
      return;
    }
    if(k === 'host'){ hostSheet(); return; }
    if(k === 'pubchanges'){ hostRun(true); return; }
    if(k === 'discard'){ W.dirty = false; renderApp(); toast('Edits discarded', 'Back to the live version'); return; }
    if(k === 'copy'){ toast('Link copied', url()); return; }
    if(k === 'visit'){ toast('Opening the live page', url()); return; }
    if(k === 'unpublish'){
      W.hosted = false; W.dirty = false; renderApp();
      toast('Page unpublished', 'The link is dead · the draft stays in your Library');
      return;
    }
    if(k === 'featadd'){ W.f.feats.push(''); W.open.feats = true; touch(); renderApp(); return; }
    if(k === 'featdel'){ W.f.feats.splice(+b.dataset.i, 1); touch(); renderApp(); return; }
    if(k === 'phtoggle'){ const x = W.photos[W.sel]; x.on = !x.on; if(usedPhotos().length < 1) x.on = true; touch(); renderApp(); return; }
    if(k === 'phhero'){ const x = W.photos[W.sel]; x.on = true; W.hero = usedPhotos().indexOf(x); touch(); renderApp(); return; }
    if(k === 'phup' || k === 'phdown'){
      const to = W.sel + (k === 'phup' ? -1 : 1);
      if(to >= 0 && to < W.photos.length){ const a = W.photos[W.sel]; W.photos[W.sel] = W.photos[to]; W.photos[to] = a; W.sel = to; touch(); renderApp(); }
      return;
    }
  });
  app.addEventListener('input', e => {
    const f = e.target.closest('[data-wbf]');
    if(f){ setDeep(f.dataset.wbf, f.value); touch(); renderPreviewOnly(); return; }
    const ft = e.target.closest('[data-wbfeat]');
    if(ft){ W.f.feats[+ft.dataset.wbfeat] = ft.value; touch(); renderPreviewOnly(); }
  });
  sheet.addEventListener('click', e => {
    if(e.target === sheet){ sheet.classList.remove('open'); return; }
    const fam = e.target.closest('[data-wbfam]');
    if(fam){ sheetFam = fam.dataset.wbfam; tplSheet(); return; }
    const tpl = e.target.closest('[data-wbtpl]');
    if(tpl){ W.tpl = tpl.dataset.wbtpl; touch(); tplSheet(); renderApp(); return; }
    const b = e.target.closest('[data-wb]'); if(!b) return;
    if(b.dataset.wb === 'closesheet'){ sheet.classList.remove('open'); return; }
    if(b.dataset.wb === 'dohost'){ hostRun(false); return; }
  });
  sheet.addEventListener('input', e => {
    const s = e.target.closest('[data-wbslug]');
    if(s) W.slug = slugify(s.value);
  });
  document.addEventListener('keydown', e => {
    if(e.key !== 'Escape') return;
    if(sheet.classList.contains('open')){ e.stopPropagation(); sheet.classList.remove('open'); return; }
    if(app.classList.contains('open')){ e.stopPropagation(); closeBuilder(); }
  }, true);

  /* ---------------------------- chat wiring ---------------------------- */
  document.addEventListener('click', e => {
    const cb = e.target.closest('[data-wbcarb]');
    if(cb){
      const car = cb.closest('[data-wbcar]');
      const n = car.querySelectorAll('.wbcard').length, max = Math.max(0, n - 2);
      const i = Math.max(0, Math.min(max, (+car.dataset.i || 0) + (+cb.dataset.wbcarb)));
      car.dataset.i = i;
      car.querySelector('.mscart').style.transform = 'translateX(calc(' + (-i) + ' * ((100% - 20px)/2.4 + 10px)))';
      car.querySelector('.mscarb.prev').disabled = i === 0;
      car.querySelector('.mscarb.next').disabled = i === max;
      car.querySelectorAll('.mscardots i').forEach((d, k) => d.classList.toggle('on', k === i));
      return;
    }
    const send = e.target.closest('[data-wbsend]');
    if(send){ window.MEL.send(send.dataset.wbsend); return; }
    const card = e.target.closest('[data-wbtpl]');
    if(card && !card.closest('#wb-app') && !card.closest('#wb-sheet')){ openBuilder(card.dataset.wbtpl); return; }
    const go = e.target.closest('[data-wbmlsgo]');
    if(go){
      const num = go.dataset.wbmlsgo;
      const hit = LIST.find(p => p.mls === num) || LIST[0];
      const rows = go.closest('[data-wbpick]').querySelector('[data-wbrows]');
      rows.innerHTML = '';
      trace(rows, [['Querying the board for MLS ' + num, 620], ['Pulling photos and remarks', 640]],
        'Looking it up…', 'Listing added to your CRM', () => {
          const g = go.closest('[data-wbpick]') && document.querySelector('[data-wbpick] [data-wbgroup]');
          const grp = rows.parentElement.querySelector('[data-wbgroup]') || g;
          if(grp) grp.textContent = 'Added from the MLS';
          rows.insertAdjacentHTML('beforeend', rowHtml(hit));
        });
      return;
    }
    const openAll = e.target.closest('[data-wballtpl]');
    if(openAll){ openBuilder(); sheetFam = TPL[W.tpl].fam; tplSheet(); return; }
  });
  document.addEventListener('input', e => {
    const q = e.target.closest('[data-wbq]');
    if(!q) return;
    const pick = q.closest('[data-wbpick]');
    pick.querySelector('[data-wbrows]').innerHTML = pickerRows(q.value);
    const grp = pick.querySelector('[data-wbgroup]');
    if(grp) grp.textContent = q.value.trim() ? 'Matches' : 'Recently added';
  });
  document.addEventListener('keydown', e => {
    const m = e.target.closest && e.target.closest('[data-wbq]');
    if(m && e.key === 'Enter'){
      const pick = m.closest('[data-wbpick]');
      const go = pick.querySelector('[data-wbmlsgo]') || pick.querySelector('[data-wbsend]');
      if(go){ e.preventDefault(); go.click(); }
    }
  });

  /* the studio re-streams message bodies; if an injection gets wiped, put it back */
  function ensure(marker, html){
    let n = 0;
    const tick = () => {
      if(++n > 10) return;
      if(!document.querySelector(marker)){
        const bodies = document.querySelectorAll('.melthread .mmsg.from-mel .body');
        const b = bodies[bodies.length - 1];
        if(b) b.insertAdjacentHTML('beforeend', html);
      }
      setTimeout(tick, 400);
    };
    setTimeout(tick, 400);
  }

  const START = /create (a )?(property )?(listing page for my website|website|web page)|property website|make (me )?a website|website for/i;
  function reply(text, t){
    if(START.test(text) && !LIST.some(p => t.indexOf(p.a.toLowerCase()) > -1)){
      return { takeover:true,
        body:'<p>Property website — I build these from a listing so the price, beds, baths and photos stay tied to the MLS. Which listing is this for?</p>',
        after: b => { b.insertAdjacentHTML('beforeend', pickerHtml('')); ensure('[data-wbpick]', pickerHtml('')); } };
    }
    const p = LIST.find(x => t.indexOf(x.a.toLowerCase()) > -1);
    if(p && /website|listing page|web page/i.test(text)){
      initState(p);
      const fam = p.tier === 'luxury' ? 'luxury' : 'standard';
      return { takeover:true,
        body:'<p>Pulled ' + esc(short(p)) + ' — ' + money(p.price) + ', ' + p.bd + ' bed, ' + p.ba + ' bath, ' + p.sqft + ' sqft, ' + p.photos + ' photos from MLS ' + p.mls + '. Give me a moment on the copy.</p>',
        after: b => {
          const rest = document.createElement('div');
          b.appendChild(rest);
          rest.insertAdjacentHTML('beforeend', '<button class="wbaib" type="button" data-wbtpl="' +
            (p.tier === 'luxury' ? 'estate' : 'editorial') + '" style="margin:2px 0 4px">' + sv(I.ext) + 'Open the builder now</button>');
          trace(rest, [
            ['Reading the listing, remarks and ' + p.photos + ' photos', 620],
            ['Writing a headline, intro and full description', 720],
            ['Picking the ' + fam + ' template family for ' + money(p.price), 560],
            ['Laying out ' + Object.keys(TPL).filter(k => TPL[k].fam === fam).length + ' ' + fam + ' templates', 520]
          ], 'Drafting the page…', 'Draft ready · saved to your Library', () => {
            const tail = '<p style="margin:12px 0 0;font-size:13.5px;line-height:20px">Here is the draft on the ' + fam +
              ' layouts. Open any one and you land in the builder with the copy, photos and your contact block already in place — ' +
              'you can switch templates in there without losing an edit.</p>' + cardsHtml();
            rest.insertAdjacentHTML('beforeend', tail);
            ensure('.wbcard', tail);
            /* draft is ready — take the agent straight into the builder */
            setTimeout(() => openBuilder(p.tier === 'luxury' ? 'estate' : 'editorial'), 650);
          });
        } };
    }
    return null;
  }

  const prev = window.MSEXT;
  window.MSEXT = {
    reply(text, t){
      const mine = reply(text, t || String(text).toLowerCase());
      if(mine) return mine;
      return prev && prev.reply ? prev.reply(text, t) : null;
    },
    openCma(){ if(prev && prev.openCma) prev.openCma(); },
    openWebsite(p, tpl){ initState(p || LIST[0], tpl); openBuilder(); }
  };
  window.WEBSITE = { open:(id, tpl) => { initState(LIST.find(x => x.id === id) || LIST[0], tpl); openBuilder(); }, LIST:LIST };
})();
