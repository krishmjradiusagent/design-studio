/* Sites — dashboard of listing sites → site settings (Overview, Versions, SEO, Leads, Analytics) → Publish dialog. */
(function(){
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const money = n => '$' + Number(n).toLocaleString('en-US');
  const host = document.querySelector('.melwrap') || document.body;
  const IMG = ['assets/prop/s1.jpg','assets/prop/s2.jpg','assets/prop/s3.jpg','assets/prop/s4.jpg'];
  const toast = (a,b) => { if(window.sonner) sonner(a,b); };
  const ic = n => '<i class="ph ph-' + n + '"></i>';
  const LIST = (window.WEBSITE && window.WEBSITE.LIST) || [];
  if(!LIST.length) console.warn('[site-publish] WEBSITE.LIST missing — dashboard will be empty');
  const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const now = () => new Date().toLocaleString('en-US', { month:'short', day:'numeric', hour:'numeric', minute:'2-digit' });

  const mk = (L, status, i) => ({ id:L.id, L, img:IMG[i % 4], status, slug:slug(L.a + (L.unit ? ' ' + L.unit : '')),
    domains:{ radius:true, custom:status === 'live' && L.id === 'pine' ? 'pine88.com' : null },
    versions: status === 'draft' ? [] : [
      { v:2, t:'Today, 9:12 AM', n:'Updated open house time', live:status === 'live' },
      { v:1, t:'Yesterday, 4:40 PM', n:'First publish', live:false }].slice(status === 'changes' ? 1 : 0).map((x, j) => status === 'changes' && j === 0 ? Object.assign(x, { live:true }) : x),
    seoT:L.a + ' · ' + L.hood + ' home for sale', seoD:L.bd + ' bed, ' + L.ba + ' bath home in ' + L.hood + ', ' + L.city.split(',')[0] + '. ' + money(L.price) + '. Book a private tour.',
    index:true, leads:{ name:true, phone:true, email:true, msg:true, tour:true, notify:true, sms:false },
    last: status === 'draft' ? null : 'Today, 9:12 AM' });
  const SITES = LIST.slice(0, 5).map((L, i) => mk(L, ['draft','live','changes','live','draft'][i], i));
  const S = { view:'list', id:null, tab:'overview', dev:'desktop', pub:null };
  let bypass = false;

  const app = document.createElement('div'); app.className = 'sp-app'; app.id = 'sp-app'; host.appendChild(app);
  const cur = () => SITES.find(x => x.id === S.id);
  const url = s => 'kapoorgroup.radius.site/' + s.slug;
  const badge = s => s.status === 'live' ? '<span class="sp-badge live"><i></i>Live</span>' : s.status === 'changes' ? '<span class="sp-badge changes"><i></i>Live · unpublished changes</span>' : '<span class="sp-badge draft"><i></i>Draft</span>';
  const addr = L => L.a + (L.unit ? ', ' + L.unit : '');

  function checks(s){
    return [
      ['Photos and hero image', true, s.L.photos + ' photos ready'],
      ['Agent contact details', true, 'Name, phone and email set'],
      ['Call to action', true, 'Request a private tour'],
      ['Lead form delivers to you', s.leads.notify, s.leads.notify ? 'Email to maya@kapoorgroup.com' : 'Turn on notifications in Leads'],
      ['Page title and description', s.seoT.length > 10 && s.seoD.length > 40, s.seoD.length > 40 ? 'Set in SEO and sharing' : 'Description is too short'],
      ['Mobile layout', true, 'Checked at 390 px']
    ];
  }
  function dashboard(){
    app.innerHTML = '<div class="sp-top"><button class="sp-btn" data-sp="exit">' + ic('arrow-left') + 'Design studio</button><h1>Websites</h1><div class="sp-sp"></div></div><div class="sp-main"><div class="sp-wrap">' +
      '<div class="sp-h"><div style="flex:1"><h2>Your listing websites</h2><p>' + SITES.filter(s => s.status !== 'draft').length + ' live · ' + SITES.filter(s => s.status === 'draft').length + ' draft. Each home gets its own address.</p></div><button class="sp-btn pri" data-sp="new">' + ic('plus') + 'New website</button></div>' +
      '<div class="sp-grid">' + SITES.map(s => '<button class="sp-card" data-sp="open" data-v="' + s.id + '"><span class="sp-thumb" style="background-image:url(' + s.img + ')">' + badge(s) + '</span><span class="sp-cb"><b>' + esc(addr(s.L)) + '</b><span>' + (s.status === 'draft' ? 'Not published' : esc(url(s))) + '</span><span>' + (s.last ? 'Published ' + esc(s.last) : 'Last edited just now') + '</span></span></button>').join('') +
      '</div></div></div><div class="sp-dlgw" id="sp-dlgw"></div>';
  }
  function head(s){
    return '<div class="sp-top"><button class="sp-btn" data-sp="back">' + ic('arrow-left') + 'Websites</button><h1>' + esc(addr(s.L)) + '</h1>' + badge(s) + '<div class="sp-sp"></div>' +
      (s.status !== 'draft' ? '<button class="sp-btn" data-sp="visit">' + ic('arrow-square-out') + 'View live</button>' : '') +
      '<button class="sp-btn" data-sp="edit">' + ic('pencil-simple') + 'Edit site</button>' +
      '<button class="sp-btn pri" data-sp="publish">' + ic('globe') + (s.status === 'live' ? 'Published' : s.status === 'changes' ? 'Publish changes' : 'Publish') + '</button></div>' +
      '<div class="sp-tabs">' + [['overview','house-line','Overview'],['versions','clock-counter-clockwise','Versions'],['seo','magnifying-glass','SEO and sharing'],['leads','envelope-simple','Leads'],['analytics','chart-line-up','Analytics']].map(t => '<button class="sp-tab' + (S.tab === t[0] ? ' on' : '') + '" data-sp="tab" data-v="' + t[0] + '">' + ic(t[1]) + t[2] + '</button>').join('') + '</div>';
  }
  function tabBody(s){
    const t = S.tab, L = s.L;
    if(t === 'overview'){
      const w = { desktop:'100%', tablet:'70%', mobile:'38%' }[S.dev];
      return '<div class="sp-two"><div><div class="sp-box"><div style="display:flex;align-items:center;gap:12px;margin-bottom:12px"><div style="flex:1"><h3>Preview</h3></div><div class="sp-seg">' +
        [['desktop','desktop'],['tablet','device-tablet'],['mobile','device-mobile']].map(d => '<button class="' + (S.dev === d[0] ? 'on' : '') + '" data-sp="dev" data-v="' + d[0] + '" aria-label="' + d[0] + '">' + ic(d[1]) + '</button>').join('') + '</div></div>' +
        '<div class="sp-prevw"><div class="sp-dev" style="width:' + w + '"><div class="bar"><i></i><i></i><i></i></div><div class="hero" style="background-image:url(' + s.img + ')"></div><div class="tx"><b>' + esc(addr(L)) + '</b><span>' + esc(L.city) + ' · ' + L.bd + ' bd · ' + L.ba + ' ba · ' + L.sqft + ' sqft</span><em>' + money(L.price) + '</em></div></div></div></div>' +
        '<div class="sp-box"><h3>Domains</h3><p>Where visitors can reach this site.</p>' +
        '<div class="sp-row"><span class="ph-ic ' + (s.status === 'draft' ? '' : 'ok') + '">' + ic('globe') + '</span><span class="g"><div>' + esc(url(s)) + '</div><small>Free Radius address · SSL included</small></span>' + (s.status === 'draft' ? '<span class="sp-badge draft">Not live</span>' : '<span class="sp-badge live"><i></i>Live</span>') + '</div>' +
        '<div class="sp-row"><span class="ph-ic ' + (s.domains.custom ? 'ok' : '') + '">' + ic('link-simple') + '</span><span class="g"><div>' + (s.domains.custom ? esc(s.domains.custom) : 'Custom domain') + '</div><small>' + (s.domains.custom ? 'Connected · DNS verified' : 'Use your own address like 1420grove.com') + '</small></span><button class="sp-btn" data-sp="domain">' + (s.domains.custom ? 'Manage' : 'Connect') + '</button></div></div></div>' +
        '<div><div class="sp-box"><h3>Before you publish</h3><p>Mel checks these every time.</p>' + checks(s).map(c => '<div class="sp-row"><span class="ph-ic ' + (c[1] ? 'ok' : 'warn') + '">' + ic(c[1] ? 'check' : 'warning') + '</span><span class="g"><div>' + c[0] + '</div><small>' + esc(c[2]) + '</small></span></div>').join('') + '</div></div></div>';
    }
    if(t === 'versions'){
      return '<div class="sp-box"><h3>Version history</h3><p>Every publish is saved. Restore any version and it goes live right away.</p>' + (s.versions.length ? s.versions.map(v => '<div class="sp-row"><span class="ph-ic ' + (v.live ? 'ok' : '') + '">' + ic('clock-counter-clockwise') + '</span><span class="g"><div>Version ' + v.v + ' · ' + esc(v.n) + '</div><small>' + esc(v.t) + ' · Maya Kapoor</small></span>' + (v.live ? '<span class="sp-badge live"><i></i>Live</span>' : '<button class="sp-btn" data-sp="restore" data-v="' + v.v + '">Restore</button>') + '</div>').join('') : '<div class="sp-empty"><b>No versions yet</b>Your first publish creates version 1.</div>') + '</div>' +
        (s.status !== 'draft' ? '<div class="sp-box"><h3>Unpublish</h3><p>Takes the site offline. The link stops working and the draft stays in your library.</p><button class="sp-btn dng" data-sp="unpublish">' + ic('eye-slash') + 'Unpublish site</button></div>' : '');
    }
    if(t === 'seo'){
      return '<div class="sp-two"><div class="sp-box"><h3>SEO and sharing</h3><p>How this page looks in search and when you text or post the link.</p>' +
        '<label class="sp-lab" style="margin-top:0">Page title</label><input class="sp-in" data-si="seoT" value="' + esc(s.seoT) + '">' +
        '<label class="sp-lab">Description <span id="sp-cnt" style="float:right">' + s.seoD.length + ' / 160</span></label><textarea class="sp-in" data-si="seoD" maxlength="160">' + esc(s.seoD) + '</textarea>' +
        '<label class="sp-lab">Address</label><input class="sp-in" data-si="slug" value="' + esc(s.slug) + '">' +
        '<div class="sp-row" style="margin-top:8px"><span class="g"><div>Let search engines index this page</div><small>Turn off for private or pre-market listings</small></span><button class="sp-tg' + (s.index ? ' on' : '') + '" data-sp="index" aria-label="Indexing"></button></div></div>' +
        '<div><div class="sp-box"><h3>Search result</h3><div class="sp-google"><u>' + esc(url(s)) + '</u><b id="sp-gt">' + esc(s.seoT) + '</b><span id="sp-gd">' + esc(s.seoD) + '</span></div></div>' +
        '<div class="sp-box"><h3>Link preview</h3><div class="sp-social"><div style="background-image:url(' + s.img + ')"></div><p>' + esc(s.seoT) + '<small>' + esc(url(s).split('/')[0]) + '</small></p></div></div></div></div>';
    }
    if(t === 'leads'){
      const f = [['name','Name'],['phone','Phone'],['email','Email'],['msg','Message'],['tour','Preferred tour time']];
      const lead = s.status === 'draft' ? [] : [['Jordan Lee','Requested a tour · Saturday 2 PM','Today'],['Priya Shah','Asked about HOA dues','Yesterday'],['Marcus Cole','Requested a tour · Sunday 11 AM','Mon']];
      return '<div class="sp-two"><div><div class="sp-box"><h3>Contact form</h3><p>Fields visitors fill in on the site.</p>' + f.map(x => '<div class="sp-row"><span class="g">' + x[1] + '</span><button class="sp-tg' + (s.leads[x[0]] ? ' on' : '') + '" data-sp="lead" data-v="' + x[0] + '" aria-label="' + x[1] + '"></button></div>').join('') + '</div>' +
        '<div class="sp-box"><h3>Notifications</h3><p>Leads also land in your Radius CRM.</p><div class="sp-row"><span class="g"><div>Email me new leads</div><small>maya@kapoorgroup.com</small></span><button class="sp-tg' + (s.leads.notify ? ' on' : '') + '" data-sp="lead" data-v="notify" aria-label="Email notifications"></button></div>' +
        '<div class="sp-row"><span class="g"><div>Text me new leads</div><small>(415) 555-0142</small></span><button class="sp-tg' + (s.leads.sms ? ' on' : '') + '" data-sp="lead" data-v="sms" aria-label="Text notifications"></button></div></div></div>' +
        '<div class="sp-box"><h3>Recent leads</h3>' + (lead.length ? lead.map(l => '<div class="sp-row"><span class="g"><div>' + l[0] + '</div><small>' + l[1] + '</small></span><small>' + l[2] + '</small></div>').join('') : '<div class="sp-empty"><b>No leads yet</b>They show up here once the site is live.</div>') + '</div></div>';
    }
    if(s.status === 'draft') return '<div class="sp-box"><div class="sp-empty"><b>No analytics yet</b>Publish the site and visits, tour requests and sources appear here.</div></div>';
    const bars = [30,44,38,52,61,48,70,66,58,82,74,91,86,100];
    return '<div class="sp-stat"><div><span>Visitors · 14 days</span><b>1,284</b></div><div><span>Tour requests</span><b>19</b></div><div><span>Avg. time on page</span><b>2:41</b></div></div>' +
      '<div class="sp-two"><div class="sp-box"><h3>Visitors per day</h3><div class="sp-chart">' + bars.map(b => '<i style="height:' + b + '%"></i>').join('') + '</div></div>' +
      '<div class="sp-box"><h3>Where they came from</h3>' + [['Instagram','46%'],['Text and email','28%'],['Search','17%'],['Direct','9%']].map(r => '<div class="sp-row"><span class="g">' + r[0] + '</span><b style="font-variant-numeric:tabular-nums">' + r[1] + '</b></div>').join('') + '</div></div>';
  }
  function detail(){
    const s = cur();
    app.innerHTML = head(s) + '<div class="sp-main"><div class="sp-wrap">' + tabBody(s) + '</div></div><div class="sp-dlgw" id="sp-dlgw"></div>';
  }
  const render = () => S.view === 'list' ? dashboard() : detail();

  /* ---------- dialogs ---------- */
  const dlg = h => { const w = document.getElementById('sp-dlgw'); w.innerHTML = '<div class="sp-dlg">' + h + '</div>'; w.classList.add('open'); };
  const closeDlg = () => { const w = document.getElementById('sp-dlgw'); if(w) w.classList.remove('open'); };
  const ck = (on, attr, off) => '<button class="sp-ck' + (on ? ' on' : '') + (off ? ' off' : '') + '" ' + attr + ' aria-label="Select">' + (on ? ic('check') : '') + '</button>';
  function publishDlg(){
    const s = cur(), P = S.pub || (S.pub = { radius:true, custom:!!s.domains.custom, connecting:false, verified:false });
    const cs = checks(s), bad = cs.filter(c => !c[1]);
    const changes = s.status === 'changes';
    dlg('<div class="sp-dh"><div style="flex:1"><h3>' + (changes ? 'Publish changes' : 'Publish site') + '</h3><p>' + esc(addr(s.L)) + (s.status === 'draft' ? ' · nothing is public until you publish' : '') + '</p></div><button class="sp-btn ico" data-sp="closedlg" aria-label="Close">' + ic('x') + '</button></div><div class="sp-db">' +
      '<label class="sp-lab" style="margin-top:8px">Publish to</label>' +
      '<div class="sp-row">' + ck(P.radius, 'data-sp="pdom" data-v="radius"') + '<span class="g"><div>' + esc(url(s)) + '</div><small>Free Radius address</small></span></div>' +
      (s.domains.custom ? '<div class="sp-row">' + ck(P.custom, 'data-sp="pdom" data-v="custom"') + '<span class="g"><div>' + esc(s.domains.custom) + '</div><small>Custom domain · verified</small></span></div>' :
        '<div class="sp-row"><span class="ph-ic">' + ic('link-simple') + '</span><span class="g"><div>Custom domain</div><small>Use your own address</small></span><button class="sp-btn" data-sp="domain">Connect</button></div>') +
      '<label class="sp-lab">Checklist</label>' + cs.map(c => '<div class="sp-row" style="padding:7px 0"><span style="color:' + (c[1] ? '#3F7A1F' : '#C2410C') + '">' + ic(c[1] ? 'check-circle' : 'warning') + '</span><span class="g">' + c[0] + '<small>' + esc(c[2]) + '</small></span></div>').join('') +
      (bad.length ? '<div style="font:400 12px var(--font);color:var(--neutral-500);margin:6px 0">These are quality flags, not blockers. You can still publish.</div>' : '') +
      '</div><div class="sp-df"><span style="flex:1;font:400 12px var(--font);color:var(--neutral-500)">' + (changes ? 'Replaces version ' + (s.versions[0] ? s.versions[0].v : 1) + ' on all selected domains.' : 'You can unpublish any time.') + '</span><button class="sp-btn" data-sp="closedlg">Cancel</button><button class="sp-btn pri" data-sp="dopub"' + (P.radius || P.custom ? '' : ' disabled') + '>' + ic('globe') + (changes ? 'Publish changes' : 'Publish') + '</button></div>');
  }
  function domainDlg(){
    const s = cur(), P = S.pub || (S.pub = { radius:true, custom:!!s.domains.custom });
    if(s.domains.custom){
      dlg('<div class="sp-dh"><div style="flex:1"><h3>' + esc(s.domains.custom) + '</h3><p>Connected · DNS verified · SSL active</p></div><button class="sp-btn ico" data-sp="closedlg">' + ic('x') + '</button></div><div class="sp-df"><button class="sp-btn dng" data-sp="rmdomain">Disconnect domain</button><span class="sp-sp"></span><button class="sp-btn pri" data-sp="closedlg">Done</button></div>'); return;
    }
    dlg('<div class="sp-dh"><div style="flex:1"><h3>Connect a custom domain</h3><p>Point a domain you own at this site.</p></div><button class="sp-btn ico" data-sp="closedlg">' + ic('x') + '</button></div><div class="sp-db"><label class="sp-lab">Domain</label><input class="sp-in" id="sp-dom" placeholder="1420grove.com" value="' + esc(P.domTxt || '') + '">' +
      '<label class="sp-lab">Add these records at your registrar</label><div class="sp-dns"><div><span>Type</span><span>Name</span><span>Value</span></div><div><span>A</span><span>@</span><code>76.76.21.21</code></div><div><span>CNAME</span><span>www</span><code>sites.radius.site</code></div></div>' +
      '<div style="font:400 12px var(--font);color:var(--neutral-500)">DNS changes can take up to an hour. Mel keeps checking and tells you when it is ready.</div></div>' +
      '<div class="sp-df"><span class="sp-sp"></span><button class="sp-btn" data-sp="closedlg">Cancel</button><button class="sp-btn pri" data-sp="verify">' + ic('check-circle') + 'Verify domain</button></div>');
  }
  function runPublish(){
    const s = cur(), P = S.pub, changes = s.status === 'changes';
    const steps = ['Building the page', 'Optimising ' + s.L.photos + ' photos', 'Publishing to ' + [P.radius && url(s), P.custom && s.domains.custom].filter(Boolean).join(' and '), 'Checking links on desktop and mobile'];
    dlg('<div class="sp-dh"><div style="flex:1"><h3>Publishing…</h3></div></div><div class="sp-db"><div class="sp-prog"><i id="sp-pr"></i></div><div class="sp-steps" id="sp-steps">' + steps.map(t => '<div style="opacity:.4">' + ic('circle') + t + '</div>').join('') + '</div></div><div class="sp-df"></div>');
    let i = 0; const iv = setInterval(() => {
      const el = document.getElementById('sp-steps'); if(!el){ clearInterval(iv); return; }
      el.children[i].style.opacity = 1; el.children[i].firstChild.className = 'ph ph-check-circle'; i++;
      document.getElementById('sp-pr').style.width = (i / steps.length * 100) + '%';
      if(i >= steps.length){ clearInterval(iv); setTimeout(finish, 350); }
    }, 480);
    function finish(){
      const n = s.versions.length ? s.versions[0].v + 1 : 1;
      s.versions.forEach(v => v.live = false);
      s.versions.unshift({ v:n, t:'Today, ' + new Date().toLocaleTimeString('en-US', { hour:'numeric', minute:'2-digit' }), n:changes ? 'Published changes' : 'First publish', live:true });
      s.status = 'live'; s.last = now(); s.domains.custom = s.domains.custom && P.custom ? s.domains.custom : s.domains.custom;
      if(window.MEL && window.MEL.addTask) window.MEL.addTask('Website ' + (changes ? 'updated' : 'published') + ' · ' + addr(s.L), url(s) + ' · version ' + n + ' · by Mel');
      toast(changes ? 'Changes are live' : 'Site is live', url(s));
      syncBuilder(s);
      dlg('<div class="sp-dh"><div style="flex:1"><h3>' + (changes ? 'Changes published' : 'Your site is live') + '</h3><p>Version ' + n + ' is live on ' + [P.radius && 'your Radius address', P.custom && s.domains.custom].filter(Boolean).join(' and ') + '.</p></div></div><div class="sp-db">' +
        '<div class="sp-row"><span class="ph-ic ok">' + ic('globe') + '</span><span class="g"><div>' + esc(url(s)) + '</div><small>Share it by text, email or social</small></span><button class="sp-btn" data-sp="copy">' + ic('copy') + 'Copy link</button></div></div>' +
        '<div class="sp-df"><span class="sp-sp"></span><button class="sp-btn" data-sp="closedlg">Close</button><button class="sp-btn pri" data-sp="visit">' + ic('arrow-square-out') + 'View live site</button></div>');
      S.pub = null; if(S.view === 'detail') { const b = app.querySelector('.sp-main'); const keep = document.getElementById('sp-dlgw').innerHTML; detail(); dlgRestore(keep); }
    }
  }
  function dlgRestore(h){ const w = document.getElementById('sp-dlgw'); w.innerHTML = h; w.classList.add('open'); }
  /* keep the editor's own Live/Draft chip in step when it is open */
  function syncBuilder(s){
    const wb = document.getElementById('wb-app'); if(!wb || !wb.classList.contains('open')) return;
    const h = wb.querySelector('[data-wb="host"]'); if(!h) return;
    bypass = true; h.click(); const d = document.querySelector('#wb-sheet [data-wb="dohost"]'); if(d) d.click(); bypass = false;
  }

  /* ---------- events ---------- */
  app.addEventListener('click', e => {
    const b = e.target.closest('[data-sp]'); if(!b){ if(e.target.id === 'sp-dlgw') closeDlg(); return; }
    const a = b.dataset.sp, v = b.dataset.v, s = S.id ? cur() : null;
    if(a === 'exit'){ app.classList.remove('open'); return; }
    if(a === 'open'){ S.id = v; S.view = 'detail'; S.tab = 'overview'; S.pub = null; render(); return; }
    if(a === 'back'){ S.view = 'list'; S.pub = null; render(); return; }
    if(a === 'new'){ app.classList.remove('open'); if(window.WEBSITE) window.WEBSITE.open(); return; }
    if(a === 'tab'){ S.tab = v; detail(); return; }
    if(a === 'dev'){ S.dev = v; detail(); return; }
    if(a === 'edit'){ if(window.WEBSITE){ S.editing = s.id; app.classList.remove('open'); window.WEBSITE.open(s.id); } return; }
    if(a === 'publish'){ S.pub = null; publishDlg(); return; }
    if(a === 'pdom'){ S.pub[v] = !S.pub[v]; publishDlg(); return; }
    if(a === 'dopub'){ runPublish(); return; }
    if(a === 'closedlg'){ closeDlg(); return; }
    if(a === 'domain'){ const fromPub = !!document.querySelector('.sp-dlg [data-sp="dopub"]'); S.pub = S.pub || { radius:true, custom:false }; S.pub.fromPub = fromPub; domainDlg(); return; }
    if(a === 'verify'){
      const inp = document.getElementById('sp-dom'), d = (inp && inp.value || '').trim().toLowerCase();
      if(!/^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(d)){ if(inp){ inp.style.borderColor = '#DC2626'; inp.focus(); } toast('Enter a domain like 1420grove.com', 'Letters, numbers and dots only'); return; }
      b.disabled = true; b.innerHTML = ic('spinner') + 'Checking DNS…';
      setTimeout(() => { s.domains.custom = d; if(S.pub) S.pub.custom = true; toast('Domain connected', d); S.view === 'detail' && detail(); publishDlgOrClose(); }, 1300); return;
    }
    if(a === 'rmdomain'){ s.domains.custom = null; if(S.pub) S.pub.custom = false; closeDlg(); detail(); toast('Domain disconnected', 'The Radius address still works'); return; }
    if(a === 'restore'){ const n = +v; s.versions.forEach(x => x.live = x.v === n); s.status = 'live'; s.last = now(); detail(); toast('Version ' + n + ' restored', 'It is live now'); return; }
    if(a === 'unpublish'){ dlg('<div class="sp-dh"><div style="flex:1"><h3>Unpublish this site?</h3><p>' + esc(url(s)) + ' will stop working right away. Your draft and versions stay in the library.</p></div></div><div class="sp-df"><span class="sp-sp"></span><button class="sp-btn" data-sp="closedlg">Cancel</button><button class="sp-btn dng" data-sp="dounpub">Unpublish</button></div>'); return; }
    if(a === 'dounpub'){ s.status = 'draft'; s.versions.forEach(x => x.live = false); closeDlg(); detail(); toast('Site unpublished', 'The link is offline · draft kept'); return; }
    if(a === 'visit'){ toast('Opening the live site', url(s)); return; }
    if(a === 'copy'){ toast('Link copied', url(s)); return; }
    if(a === 'index'){ s.index = !s.index; b.classList.toggle('on', s.index); return; }
    if(a === 'lead'){ s.leads[v] = !s.leads[v]; b.classList.toggle('on', s.leads[v]); return; }
  });
  function publishDlgOrClose(){ const w = document.getElementById('sp-dlgw'); if(S.pub && S.pub.fromPub){ publishDlg(); } else closeDlg(); }
  app.addEventListener('input', e => {
    const t = e.target, k = t.dataset.si; if(!k) return;
    const s = cur(); s[k] = k === 'slug' ? slug(t.value) : t.value;
    if(k === 'seoT'){ const g = document.getElementById('sp-gt'); if(g) g.textContent = s.seoT; }
    if(k === 'seoD'){ const g = document.getElementById('sp-gd'), c = document.getElementById('sp-cnt'); if(g) g.textContent = s.seoD; if(c) c.textContent = s.seoD.length + ' / 160'; }
    if(s.status === 'live') { s.status = 'changes'; const bd = app.querySelector('.sp-top .sp-badge'); if(bd) bd.outerHTML = badge(s); const pb = app.querySelector('[data-sp="publish"]'); if(pb) pb.innerHTML = ic('globe') + 'Publish changes'; }
  });
  document.addEventListener('keydown', e => { if(e.key === 'Escape' && app.classList.contains('open')) closeDlg(); });

  /* ---------- entry points ---------- */
  function open(id){ app.classList.add('open'); if(id){ S.id = id; S.view = 'detail'; S.tab = 'overview'; } else S.view = 'list'; render(); }
  window.SITES = { open };
  document.addEventListener('click', e => {
    const c = e.target.closest('.mshcard[data-hub="website"]');
    if(c){ e.preventDefault(); e.stopImmediatePropagation(); open(); return; }
    /* editor's Publish → the same Webflow-style dialog as the site page */
    const w = e.target.closest('#wb-app [data-wb="host"], #wb-app [data-wb="pubchanges"], #wb-sheet [data-wb="dohost"]');
    if(w && !bypass){
      e.preventDefault(); e.stopImmediatePropagation();
      if(w.dataset.wb === 'dohost') return;
      const sh = document.getElementById('wb-sheet'); if(sh) sh.classList.remove('open');
      const s = SITES.find(x => x.id === S.editing) || SITES[0];
      document.getElementById('wb-app').classList.remove('open');
      S.id = s.id; S.view = 'detail'; S.tab = 'overview'; app.classList.add('open'); render();
      S.pub = null; if(w.dataset.wb === 'pubchanges') s.status = 'changes'; publishDlg();
    }
  }, true);
})();
