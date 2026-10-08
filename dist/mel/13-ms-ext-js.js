/* ================= Studio, part two =================
   The things Lucy gets right that a single post flow misses:
   a daily queue, the listing lifecycle, a library that remembers,
   celebrations, comps, and a report the seller can read. */
(function(){
  const $ = id => document.getElementById(id);
  const page = window.MEL && window.MEL.page;
  if(!page) return;
  const esc = window.MEL.esc, money = n => '$' + n.toLocaleString('en-US');
  const canvas = $('ms-canvas');
  const sv = d => '<svg viewBox="0 0 24 24">' + d + '</svg>';

  const P = {
    grove: { id:'grove', a:'1420 Grove St', hood:'Noe Valley', price:1285000, ph:'#cfc9c0' },
    maple: { id:'maple', a:'412 Maple Ave', hood:'Rockridge', price:975000, ph:'#c7d0d2' },
    pine:  { id:'pine',  a:'88 Pine St, Unit 12B', hood:'Financial District', price:842000, ph:'#d6cec4' }
  };

  /* ---------------- Mel today ---------------- */
  const TODAY = [
    { hot:true, ico:'<path d="M12 5v14"/><path d="m19 12-7 7-7-7"/>', when:'now',
      t:'412 Maple Ave has held the same price for 21 days',
      d:'Three comps in Rockridge went under contract below it this month. A price improvement post re-surfaces it to the buyers who passed.',
      go:'Price drop post for 412 Maple Ave', cta:'Make the post' },
    { ico:'<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M9 21v-6h6v6"/>', when:'by Thu',
      t:'Open house Saturday at 1420 Grove St',
      d:'Your last four open-house posts did best two days out. Thursday morning beats Saturday morning by roughly double the reach.',
      go:'Open house post for 1420 Grove St', cta:'Make the post' },
    { ico:'<path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.5-7 10-7 10z"/>', when:'Sunday',
      t:'Dan and Rosa Mehta hit one year at 2280 Union St',
      d:'You closed it Aug 16 last year. A quiet anniversary post keeps you in their feed without asking them for anything.',
      go:'Show my celebration queue', cta:'See the queue' }
  ];
  function renderToday(){
    const el = $('ms-today'); if(!el) return;
    el.innerHTML = '<div class="mssech"><img src="assets/mel-icon.svg" alt=""><b>Today</b>' +
      '<i>Ranked by what moves the listing</i>' +
      '<button class="msmore" type="button" data-mx="whytoday">Why these?</button></div>' +
      TODAY.map(x => '<button class="mstd' + (x.hot ? ' hot' : '') + '" type="button" data-mssend="' + esc(x.go) + '">' +
        '<span class="mstdi">' + sv(x.ico) + '</span>' +
        '<span class="mstdt"><b>' + esc(x.t) + '</b><i>' + esc(x.d) + '</i></span>' +
        '<span class="mswhen">' + x.when + '</span>' +
        '<span class="mstdgo">' + x.cta + '</span></button>').join('');
  }

  /* ---------------- listing lifecycle ---------------- */
  const STAGES = [
    { k:'coming', n:'Soon', full:'coming soon' }, { k:'listed', n:'Listed', full:'just listed' }, { k:'open', n:'Open', full:'open house' },
    { k:'price', n:'Price', full:'price drop' }, { k:'contract', n:'Contract', full:'under contract' }, { k:'sold', n:'Sold', full:'just sold' }
  ];
  const SEND = { listed:'Just listed post for ', open:'Open house post for ', price:'Price drop post for ', sold:'Just sold post for ' };
  const ARC = [
    { p:P.grove, done:['coming','listed'], next:'open', note:'Open house Saturday, 1\u20134 PM' },
    { p:P.maple, done:['coming','listed','open'], next:'price', note:'21 days on market, no offers' },
    { p:P.pine,  done:['coming','listed','open','price','contract'], next:'sold', note:'In contract \u00b7 closing Aug 21' }
  ];
  function renderLifecycle(){
    const el = $('ms-lc'); if(!el) return;
    el.innerHTML = ARC.map(r => {
      const track = STAGES.map(s => {
        const done = r.done.includes(s.k), next = r.next === s.k;
        const send = next && SEND[s.k] ? ' data-mssend="' + esc(SEND[s.k] + r.p.a) + '"' : '';
        return '<button class="msstage' + (done ? ' done' : '') + (next ? ' next' : '') + '" type="button"' + send +
          ' title="' + esc(s.full.replace(/^./, c => c.toUpperCase())) + '"' +
          (next ? '' : ' tabindex="-1" aria-disabled="true"') + '><span class="msdotp"></span><em>' + s.n + '</em></button>';
      }).join('');
      const cta = SEND[r.next]
        ? '<button class="mslcgo" type="button" data-mssend="' + esc(SEND[r.next] + r.p.a) + '">Make the ' + STAGES.find(s => s.k === r.next).full + ' post</button>'
        : '<button class="mslcgo quiet" type="button" data-mx="noop">Nothing due yet</button>';
      return '<div class="mslcr"><span class="mslcp"><span class="msthumb" style="--ph:' + r.p.ph + '"></span>' +
        '<span><b>' + esc(r.p.a.split(',')[0]) + '</b><i>' + esc(r.note) + '</i></span></span>' +
        '<span class="mstrack">' + track + '</span>' + cta + '</div>';
    }).join('');
  }

  /* ---------------- library ---------------- */
  let LIB = [
    { kind:'Post', label:'Price drop \u00b7 412 Maple Ave', st:'draft', when:'Saved yesterday, 4:12 PM', ph:P.maple.ph },
    { kind:'Post', label:'Just sold \u00b7 88 Pine St', st:'scheduled', when:'Sat, Aug 15 \u00b7 9:00 AM', ph:P.pine.ph },
    { kind:'Post', label:'Just listed \u00b7 1420 Grove St', st:'posted', when:'Aug 10 \u00b7 412 likes, 38 saves', ph:P.grove.ph },
    { kind:'Post', label:'Open house \u00b7 412 Maple Ave', st:'posted', when:'Aug 2 \u00b7 168 likes', ph:P.maple.ph },
    { kind:'Email', label:'Noe Valley market update', st:'posted', when:'Jul 28 \u00b7 41% open rate', ph:'#c3ccc5' },
    { kind:'Post', label:'Coming soon \u00b7 1420 Grove St', st:'archived', when:'Jul 22 \u00b7 replaced by Just listed', ph:'#ccc6cf' }
  ];
  let TAB = 'draft';
  const TABS = [['draft','Drafts'],['scheduled','Scheduled'],['posted','Posted'],['archived','Archived']];
  const EMPTY = {
    draft:'No drafts. Anything you start in the Studio saves itself here the moment Mel generates a version.',
    scheduled:'Nothing scheduled. Pick “Schedule” instead of “Post now” in the publish panel and it lands here.',
    posted:'Nothing posted yet.',
    archived:'Nothing archived. Superseded posts move here instead of disappearing.'
  };
  function renderLib(){
    const tabs = $('ms-libtabs'), body = $('ms-libbody');
    if(!tabs || !body) return;
    tabs.innerHTML = TABS.map(([k, n]) => {
      const c = LIB.filter(x => x.st === k).length;
      return '<button class="mstab' + (TAB === k ? ' on' : '') + '" type="button" data-mx="tab" data-k="' + k + '">' + n +
        (c ? '<u>' + c + '</u>' : '') + '</button>';
    }).join('');
    const items = LIB.filter(x => x.st === TAB);
    body.innerHTML = items.length
      ? '<div class="mslgrid">' + items.map(x =>
          '<button class="msasset" type="button" data-mx="asset" data-l="' + esc(x.label) + '">' +
          '<span class="msathumb' + (x.kind === 'Email' ? ' tall' : '') + '" style="--ph:' + x.ph + '"><span class="msakind">' + x.kind + '</span></span>' +
          '<span class="msameta"><b>' + esc(x.label) + '</b><i>' + esc(x.when) + '</i></span></button>').join('') + '</div>'
      : '<div class="mslempty">' + EMPTY[TAB] + '</div>';
    const hist = $('ms-hist');
    if(hist) hist.innerHTML = Object.values(P).map(p => {
      const n = LIB.filter(x => x.label.includes(p.a.split(',')[0])).length;
      const posted = LIB.filter(x => x.label.includes(p.a.split(',')[0]) && x.st === 'posted').length;
      return '<div class="mslcr"><span class="mslcp" style="width:auto;flex:1"><span class="msthumb" style="--ph:' + p.ph + '"></span>' +
        '<span><b>' + esc(p.a) + '</b><i>' + n + ' asset' + (n === 1 ? '' : 's') + ' \u00b7 ' + posted + ' published \u00b7 ' + esc(p.hood) + '</i></span></span>' +
        '<button class="mslcgo quiet" type="button" data-mssend="Seller report for ' + esc(p.a) + '">Seller report</button></div>';
    }).join('');
  }
  window.MSLIB = {
    draft(p, type){
      const label = (type || '').replace(/^./, c => c.toUpperCase());
      const nice = { justlisted:'Just listed', openhouse:'Open house', justsold:'Just sold', pricedrop:'Price drop' }[type] || label;
      const l = nice + ' \u00b7 ' + p.a;
      if(!LIB.some(x => x.label === l && x.st === 'draft')) LIB.unshift({ kind:'Post', label:l, st:'draft', when:'Saved just now', ph:p.ph || '#cfc9c0' });
      renderLib();
    },
    publish(p, typeLabel, when, also){
      const l = typeLabel + ' \u00b7 ' + p.a;
      LIB = LIB.filter(x => !(x.label === l && x.st === 'draft'));
      LIB.unshift({ kind:'Post', label:l, st: when === 'now' ? 'posted' : 'scheduled',
        when: when === 'now' ? 'Just now \u00b7 Instagram' : 'Sat, Aug 15 \u00b7 9:00 AM', ph:p.ph || '#cfc9c0' });
      if(also){
        if(also.email) LIB.unshift({ kind:'Email', label:typeLabel + ' email \u00b7 ' + p.a, st:'draft', when:'Saved just now', ph:p.ph || '#cfc9c0' });
        if(also.flyer) LIB.unshift({ kind:'Flyer', label:typeLabel + ' flyer \u00b7 ' + p.a, st:'draft', when:'Saved just now \u00b7 print ready', ph:p.ph || '#cfc9c0' });
      }
      this.last = l; renderLib();
    },
    undo(){
      if(!this.last) return;
      const i = LIB.findIndex(x => x.label === this.last && x.st !== 'draft');
      if(i > -1) LIB[i] = Object.assign({}, LIB[i], { st:'draft', when:'Saved just now \u00b7 taken down' });
      renderLib();
    }
  };

  /* ---------------- celebrations ---------------- */
  const CELEB = [
    { ico:'<path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.5-7 10-7 10z"/>', when:'Sun, Aug 16',
      t:'Dan and Rosa Mehta \u00b7 one year at 2280 Union St', d:'Home anniversary. Mel has the closing photo and the original listing shot.' },
    { ico:'<rect x="3" y="8" width="18" height="13" rx="2"/><path d="M12 8V4M8 8V5.5M16 8V5.5"/>', when:'Fri, Aug 14',
      t:'Priya Shah \u00b7 birthday', d:'Past client, referred you twice. A DM lands better than a feed post here.' },
    { ico:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>', when:'Mon, Sep 7',
      t:'Labor Day', d:'Neighborhood-branded post. Low effort, keeps the grid warm between listings.' }
  ];

  /* ---------------- comps for the CMA ---------------- */
  const COMPS = [
    { a:'1509 Church St', bd:'3/2', sqft:'1,455', sold:1240000, psf:852, dom:12, ago:'5 wks ago' },
    { a:'2231 Castro St', bd:'3/2.5', sqft:'1,580', sold:1310000, psf:829, dom:9, ago:'7 wks ago' },
    { a:'480 Duncan St', bd:'3/2', sqft:'1,390', sold:1198000, psf:862, dom:21, ago:'3 wks ago' }
  ];

  function openCanvas(html){
    canvas.innerHTML = '<div class="mswin">' + html + '</div>';
    page.classList.add('canvason');
  }
  const cvHead = (title, sub, badge) =>
    '<div class="msch"><span><h3>' + title + '</h3><div class="mssub">' + sub + '</div></span>' +
    '<span class="msbadge">' + badge + '</span>' +
    '<button class="msx" type="button" data-mx="close" aria-label="Close">' + sv('<path d="M18 6 6 18M6 6l12 12"/>') + '</button></div>';

  function cmaCanvas(p){
    const rows = COMPS.map(c => '<tr><td>' + esc(c.a) + '<div style="font-size:10.5px;color:var(--neutral-500);margin-top:2px">' +
      c.bd + ' \u00b7 ' + c.sqft + ' sqft \u00b7 ' + c.ago + '</div></td>' +
      '<td class="num">' + money(c.sold) + '</td><td class="num">$' + c.psf + '</td><td class="num">' + c.dom + '</td></tr>').join('');
    openCanvas(cvHead('CMA \u00b7 ' + esc(p.a), 'SFAR MLS \u00b7 3 closed comps within 0.5 mi', 'Draft') +
      '<div class="mxwrap">' +
        '<div class="mxcard"><div class="mxh"><b>Suggested list range</b><i>Based on $/sqft of the three closest closed sales</i></div>' +
        '<div class="mxrange"><span class="mxnum">' + money(1245000) + ' \u2013 ' + money(1315000) + '</span>' +
        '<div class="mxbar"><span></span><b></b></div>' +
        '<div class="mxlegend"><span>' + money(1198000) + '</span><span>Your list price ' + money(p.price) + '</span><span>' + money(1360000) + '</span></div></div></div>' +
        '<div class="mxcard"><div class="mxh"><b>Closed comps</b><i>Sorted by distance</i></div>' +
        '<table class="mxtable"><thead><tr><th>Address</th><th class="num">Sold</th><th class="num">$/sqft</th><th class="num">DOM</th></tr></thead><tbody>' + rows + '</tbody></table></div>' +
        '<div class="mxcard"><div class="mxstat">' +
          '<div><span>Median $/sqft</span><b>$848</b></div>' +
          '<div><span>Median DOM</span><b>12</b></div>' +
          '<div><span>Sale to list</span><b>101%</b></div>' +
        '</div></div>' +
        '<div class="msnote">' + sv('<path d="M12 9v4M12 17h.01"/><circle cx="12" cy="12" r="9"/>') +
        '<span>Two active listings in Noe Valley sit above this range. Mel left them out of the math but flagged them for the seller conversation.</span></div>' +
      '</div>' +
      '<div class="mspub"><button class="msgo" type="button" data-mx="cmadeck">' +
        sv('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>') + 'Build the listing presentation</button>' +
        '<button class="msghost" type="button" data-mx="cmasend">Send the range to the seller</button>' +
        '<div class="mssettings">Nothing leaves Radius until you send it.</div></div>');
  }

  function reportCanvas(p) {
    const acts = [
      { ok:true, t:'Just listed post \u00b7 Instagram feed', w:'Aug 10' },
      { ok:true, t:'Listing page published \u00b7 maya.radius.com/' + p.id, w:'Aug 10' },
      { ok:true, t:'Email to 312 buyers watching ' + p.hood, w:'Aug 11' },
      { ok:true, t:'Open house post \u00b7 feed and story', w:'Aug 11' },
      { ok:false, t:'Open house \u00b7 Saturday, 1\u20134 PM', w:'Aug 15' },
      { ok:false, t:'Price improvement post, if no offers', w:'Aug 24' }
    ];
    openCanvas(cvHead('Seller report \u00b7 ' + esc(p.a.split(',')[0]), 'Everything done for this listing so far', 'Ready to send') +
      '<div class="mxwrap">' +
        '<div class="mxcard"><div class="mxstat">' +
          '<div><span>Assets published</span><b>4</b></div>' +
          '<div><span>Social reach</span><b>12.4k</b></div>' +
          '<div><span>Listing page views</span><b>1,842</b></div>' +
        '</div></div>' +
        '<div class="mxcard"><div class="mxh"><b>Marketing activity</b><i>Auto-logged, nothing typed by hand</i></div>' +
        '<div class="mxlist">' + acts.map(a => '<div class="mxli"><span class="mxdot' + (a.ok ? ' ok' : '') + '"></span>' +
          esc(a.t) + '<span class="mxwhen">' + a.w + '</span></div>').join('') + '</div></div>' +
        '<div class="msnote">' + sv('<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.7 4 3 9 3s9-1.3 9-3V5"/>') +
        '<span>Saved views, saves and shares come from your connected accounts. The seller sees a read-only link, not your CRM.</span></div>' +
      '</div>' +
      '<div class="mspub"><button class="msgo" type="button" data-mx="rsend">' +
        sv('<path d="m22 2-7 20-4-9-9-4z"/>') + 'Send the link to the seller</button>' +
        '<button class="msghost" type="button" data-mx="rpdf">Export as PDF</button></div>');
  }

  const qr = list => '<div class="msqr">' + list.map(x => '<button type="button" data-msq="' + esc(x) + '">' + esc(x) + '</button>').join('') + '</div>';
  const PROPTHUMBS = ['assets/prop/s1.jpg','assets/prop/s2.jpg','assets/prop/s3.jpg','assets/prop/s4.jpg'];
  let __pt = 0;
  const tiles = arr => '<div class="mspick">' + arr.map(p =>
    '<button class="mstile" type="button" data-mssend="' + esc(p.send) + '">' +
      (p.ph ? '<span class="msthumb" style="--ph:' + p.ph + ';background-image:url(\'' + PROPTHUMBS[(__pt++) % 4] + '\');background-size:cover;background-position:50% 50%"></span>' : sv(p.ico || '<circle cx="12" cy="12" r="9"/>')) +
      '<span><b>' + esc(p.b) + '</b><i>' + esc(p.i) + '</i></span>' +
      (p.right ? '<span class="msprice">' + esc(p.right) + '</span>' : '') + '</button>').join('') + '</div>';

  let want = null;

  /* ---------------- the extra replies ---------------- */
  function reply(text, t){
    const prop = Object.values(P).find(p => t.includes(p.a.toLowerCase().split(',')[0]));

    if(/seller report/.test(t)){
      const p = prop || P.grove;
      return { body:'<p>Here is the seller report for ' + esc(p.a) + '. Four assets out, 12.4k reach, 1,842 page views \u2014 all logged automatically as things published, so nothing here is you remembering what you did.</p>' +
        '<p>The two greyed rows are what is still coming. Sellers read that as a plan, not a receipt.</p>',
        after: b => { b.insertAdjacentHTML('beforeend', window.melArtifact({ ph:p.ph, kind:'Report', title:'Seller report · ' + p.a.split(',')[0], meta:'4 assets · 12.4k reach · ready to send' }, () => reportCanvas(p)) + qr(['Send it to the seller', 'Add the open house numbers after Saturday'])); reportCanvas(p); } };
    }

    if(/celebration queue|celebrations|anniversar|birthday/.test(t)){
      return { body:'<p>Three things coming up. I watch closing dates and contact birthdays, so this queue fills itself \u2014 you only decide what goes out.</p>',
        after: b => {
          b.insertAdjacentHTML('beforeend', '<div class="mstoday" style="margin-top:12px">' +
            CELEB.map(c => '<button class="mstd" type="button" data-msq="Draft the ' + esc(c.t.split(' \u00b7 ')[1] || 'celebration') + ' post for ' + esc(c.t.split(' \u00b7 ')[0]) + '">' +
              '<span class="mstdi">' + sv(c.ico) + '</span>' +
              '<span class="mstdt"><b>' + esc(c.t) + '</b><i>' + esc(c.d) + '</i></span>' +
              '<span class="mswhen">' + c.when + '</span><span class="mstdgo">Draft it</span></button>').join('') + '</div>' +
            qr(['Turn on auto-drafts for anniversaries', 'Show the next 30 days']));
        } };
    }

    if(/auto-drafts/.test(t)){
      return { body:'<p>On. Two days before each home anniversary or client birthday I will draft the post and drop it in your Library as a draft \u2014 never scheduled, never posted. You approve or ignore it.</p>' +
        '<p>Ignored drafts archive themselves after a week so the Library does not turn into a graveyard.</p>',
        after: () => { if(window.sonner) sonner('Auto-drafts on', 'Anniversaries and birthdays \u00b7 drafts only'); } };
    }

    if(/draft the .* post for/.test(t)){
      return { body:'<p>Drafted and saved to your Library. I used the original listing photo from the 2025 sale and kept the copy short \u2014 anniversary posts that ask for a referral read badly. If you want the ask in there, say so and I will add a soft one.</p>',
        after: b => { b.insertAdjacentHTML('beforeend', qr(['Add a soft referral line', 'Open my Library'])); } };
    }

    if(!want && /\bcma\b|comparative market analysis|home value estimate/.test(t)){
      want = 'cma';
      if(prop){ want = null; return cmaReply(prop); }
      return { body:'<p>Which property? I have comps for anything in your MLS \u2014 search below or pick one of yours.</p>',
        after: b => { b.insertAdjacentHTML('beforeend', window.MSPROP()); } };
    }
    if(want === 'cma' && prop){ want = null; return cmaReply(prop); }

    if(/pool|under \$?1|3 bed|two bed|furnished|pet.friendly/.test(t) && /find|show|search|any|looking/.test(t)){
      return { body:'<p>Four matches in Bridge MLS, active in the last 30 days. I filtered on what you actually said \u2014 the pool has to be in the remarks or the amenities, not just the photos.</p>',
        after: b => { b.insertAdjacentHTML('beforeend', tiles([
          { send:'Just listed post for 412 Maple Ave', b:'412 Maple Ave', i:'Rockridge \u00b7 4 bd \u00b7 3 ba \u00b7 pool \u00b7 21 DOM', right:money(975000), ph:P.maple.ph },
          { send:'Run the CMA for 412 Maple Ave', b:'6120 Chabot Rd', i:'Rockridge \u00b7 3 bd \u00b7 2 ba \u00b7 pool \u00b7 6 DOM', right:money(1149000), ph:'#c3ccc5' },
          { send:'Run the CMA for 412 Maple Ave', b:'375 Alcatraz Ave', i:'Temescal \u00b7 3 bd \u00b7 2 ba \u00b7 spa \u00b7 14 DOM', right:money(1050000), ph:'#ccc6cf' }
        ]) + qr(['Save this as a search alert', 'Send these three to a client'])); } };
    }

    if(/save this as a search alert/.test(t)){
      return { body:'<p>Saved. New matches will show up in your Mel activity, and I will not email you \u2014 you get enough of those.</p>',
        after: () => { window.MEL.addTask('Search alert saved \u00b7 Rockridge, pool, under $1.2M', 'Bridge MLS \u00b7 new matches appear here'); } };
    }

    if(/open my library|show my library|open the library/.test(t)){
      return { body:'<p>Opening it \u2014 drafts first.</p>', after: () => openLibrary() };
    }

    return null;
  }

  function cmaReply(p){
    return { body:'<p>Ran it on ' + esc(p.a) + '. Three closed comps inside half a mile, all within the last seven weeks, median $848 a foot. That puts the range at ' + money(1245000) + ' to ' + money(1315000) + ' \u2014 your current list price sits almost exactly mid-range, which is the honest answer.</p>' +
      '<p>The two active listings above the range are the ones a seller will bring up. They are in the report, marked as active, not counted in the math.</p>',
      after: b => { b.insertAdjacentHTML('beforeend', window.melArtifact({ ph:p.ph, kind:'CMA', title:'CMA · ' + p.a, meta:money(1245000) + ' – ' + money(1315000) + ' suggested range' }, () => cmaCanvas(p)) + qr(['Build the listing presentation', 'Add a just listed post from this', 'Send the range to the seller'])); cmaCanvas(p); } };
  }

  /* ---------------- library nav ---------------- */
  function openLibrary(){
    window.MEL.openMel();
    window.MEL.studio(true);
    page.classList.add('library');
    page.classList.remove('canvason');
    window.MEL.appTitle('Library');
    $('ms-navlib').classList.add('on');
    $('ms-navstudio').classList.remove('on');
    renderLib();
  }
  $('ms-navlib').addEventListener('click', openLibrary);

  const origSend = window.MEL.send;
  window.MEL.send = function(txt){
    page.classList.remove('library');
    $('ms-navlib').classList.remove('on');
    return origSend.call(window.MEL, txt);
  };

  canvas.addEventListener('click', e => {
    const b = e.target.closest('[data-mx]'); if(!b) return;
    const k = b.dataset.mx;
    if(k === 'close'){ page.classList.remove('canvason'); return; }
    if(k === 'cmadeck'){ if(window.sonner) sonner('Listing presentation queued', '9 slides from this CMA \u00b7 in progress'); return; }
    if(k === 'cmasend'){ if(window.sonner) sonner('Range sent', 'Read-only link \u00b7 the seller cannot see your comps notes'); return; }
    if(k === 'rsend'){ if(window.sonner) sonner('Seller report sent', 'Link expires in 30 days \u00b7 view count tracked'); return; }
    if(k === 'rpdf'){ if(window.sonner) sonner('PDF exported', '3 pages \u00b7 saved to your Library'); return; }
  });

  document.addEventListener('click', e => {
    const b = e.target.closest('[data-mx]'); if(!b || e.target.closest('#ms-canvas')) return;
    const k = b.dataset.mx;
    if(k === 'tab'){ TAB = b.dataset.k; renderLib(); return; }
    if(k === 'asset'){ if(window.sonner) sonner(b.dataset.l, 'Opens in the Studio with its full history \u00b7 in progress'); return; }
    if(k === 'whytoday'){ if(window.sonner) sonner('How Mel picks these', 'Days on market, comp activity, open-house dates and closing anniversaries'); return; }
    if(k === 'noop'){ return; }
  });

  window.MSEXT = { reply: reply, openCma(){ cmaCanvas(P.grove); } };
  renderToday(); renderLifecycle(); renderLib();

  /* ---------------- library: chip filter + tile click ---------------- */
  (function(){
    const lib = document.getElementById('ms-library');
    if(!lib) return;
    const chips = lib.querySelectorAll('.lbchip');
    const tiles = lib.querySelectorAll('.lbtile');
    const secs = lib.querySelectorAll('.lbsec');
    function apply(f){
      chips.forEach(x => {
        const on = x.dataset.f === f;
        x.classList.toggle('on', on);
        x.setAttribute('aria-selected', on ? 'true' : 'false');
      });
      let visible = 0;
      tiles.forEach(t => {
        const show = (f === 'all') || (t.dataset.status === f);
        t.classList.toggle('hide', !show);
        if(show) visible++;
      });
      secs.forEach(s => {
        const any = [...s.querySelectorAll('.lbtile')].some(t => !t.classList.contains('hide'));
        s.style.display = any ? '' : 'none';
      });
      lib.dataset.empty = visible === 0 ? '1' : '0';
    }
    chips.forEach(c => c.addEventListener('click', () => apply(c.dataset.f)));
    tiles.forEach(t => {
      const open = () => {
        const kind = (t.querySelector('.lbtype') || {}).textContent || 'Asset';
        const tpl = (t.querySelector('.lbtpl') || {}).textContent || '';
        const failed = t.dataset.status === 'failed';
        if(window.sonner){
          sonner(
            (failed ? 'Retry ' : 'Open ') + kind.toLowerCase() + ' in Design studio',
            (tpl || 'Loads with its full history') + (failed ? ' · opens at the failed step' : '')
          );
        }
      };
      t.addEventListener('click', open);
      t.addEventListener('keydown', e => {
        if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); open(); }
      });
    });
  })();
})();

