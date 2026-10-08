/* ================= Mel Copilot =================
   Chat is the input; the artifact card is the output. Every action that leaves
   Radius routes through a confirm bar, then lands in the activity drawer. */
(function(){
  const $ = id => document.getElementById(id);
  const page = $('mel-page'); if(!page) return;
  const thread = $('mel-thread'), bodyEl = $('mel-body'), ta = $('mel-input'),
        composer = $('mel-composer'), attach = $('mel-attach'), tname = $('mel-threadname');
  const AV = 'assets/mel-icon.svg';
  let lastFocus = null;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const scroll = () => { bodyEl.scrollTop = bodyEl.scrollHeight; };
  const svg = d => '<svg viewBox="0 0 24 24">' + d + '</svg>';

  const P = {
    chart:'<path d="M3 3v18h18"/><path d="M18 17V9M13 17V5M8 17v-3"/>',
    alert:'<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
    mail:'<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 6 10-6"/>',
    msg:'<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    sign:'<path d="M3 17c3 0 4-8 7-8s2 6 5 6 3-4 6-4"/><path d="M3 21h18"/>',
    home:'<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/>',
    users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9"/>',
    db:'<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.7 4 3 9 3s9-1.3 9-3V5"/><path d="M3 12c0 1.7 4 3 9 3s9-1.3 9-3"/>',
    check:'<path d="M20 6 9 17l-5-5"/>',
    copy:'<path d="M9 5h9a2 2 0 0 1 2 2v12"/><rect x="4" y="8" width="12" height="12" rx="2"/>',
    redo:'<path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 3v6h-6"/>',
    up:'<path d="M7 10v11H4a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1z"/><path d="M7 10 12 3l1.3.9a2 2 0 0 1 .8 2.2L13 10h5.6a2 2 0 0 1 2 2.5l-1.8 7A2 2 0 0 1 16.8 21H7"/>',
    down:'<path d="M17 14V3h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1z"/><path d="M17 14 12 21l-1.3-.9a2 2 0 0 1-.8-2.2L11 14H5.4a2 2 0 0 1-2-2.5l1.8-7A2 2 0 0 1 7.2 3H17"/>',
    pin:'<path d="M12 17v5"/><path d="M9 10.8V4h6v6.8l2.5 3.2H6.5z"/>',
    pen2:'<path d="M17 3a2.8 2.8 0 0 1 4 4L7.5 20.5 2 22l1.5-5.5z"/>',
    trash:'<path d="M3 6h18M8 6V4h8v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>',
    clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    doc:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>',
    arrows:'<path d="M8 3 4 7l4 4"/><path d="M4 7h16"/><path d="m16 21 4-4-4-4"/><path d="M20 17H4"/>'
  };

  /* ================= open / close ================= */
  function openMel(seed){
    document.body.classList.add('melopen');
    if(window.showPage) showPage('mel');
    if(seed){ setTimeout(() => send(seed), 60); }
    setTimeout(() => ta.focus(), 0);
  }
  function closeMel(){
    document.body.classList.remove('melopen');
    if(window.showPage) showPage('transactions');
  }
  window.openMel = openMel;
  const melPill = document.querySelector('.sidebar .mel');
  if(melPill){
    /* Design studio only: the Mel pill is inert. */
    melPill.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); });
  }
  { const mc = document.getElementById('mel-close'); if(mc) mc.addEventListener('click', closeMel); }

  
  /* page ask bar hands its question to the full copilot */
  const askInput = document.querySelector('.melbar .askinput');
  if(askInput){
    const handoff = () => { const v = askInput.value.trim(); askInput.value = ''; openMel(v || undefined); };
    askInput.addEventListener('keydown', e => { if(e.key === 'Enter'){ e.preventDefault(); handoff(); } });
    const sendBtn = document.querySelector('.melbar .send');
    if(sendBtn) sendBtn.addEventListener('click', handoff);
    const expand = document.querySelector('.melbar .rcluster .icob[title="Expand"]');
    if(expand) expand.addEventListener('click', () => openMel());
  }

  /* ================= history rail ================= */
  let CHATS = [
    { id:'c1', t:'CMA for 1420 Grove St',            day:'Today',       when:'2:14 PM', n:8, pin:true },
    { id:'c2', t:'Follow-ups I owe this week',        day:'Today',       when:'11:02 AM', n:5, pin:false },
    { id:'c3', t:'Buyer rep agreement for A. Rao',    day:'Yesterday',   when:'4:48 PM', n:6, pin:false },
    { id:'c4', t:'Closing blockers on Maple Ave',     day:'Yesterday',   when:'9:31 AM', n:12, pin:false },
    { id:'c5', t:'Listing description for 88 Pine',   day:'Last 7 days', when:'Mon', n:4, pin:false },
    { id:'c6', t:'Price drop note to seller',         day:'Last 7 days', when:'Mon', n:3, pin:false },
    { id:'c7', t:'Open house recap to attendees',     day:'Last 7 days', when:'Sun', n:7, pin:false },
    { id:'c8', t:'Commission split on Oak Terrace',   day:'Last 7 days', when:'Sat', n:9, pin:false }
  ];
  let activeChat = null, hq = '';
  const hscroll = $('mel-hscroll');

  function renderHistory(){
    const q = hq.trim().toLowerCase();
    const hit = CHATS.filter(c => !q || c.t.toLowerCase().includes(q));
    if(!hit.length){ hscroll.innerHTML = '<div class="mhempty">No chats match that search.</div>'; return; }
    const groups = [];
    const pinned = hit.filter(c => c.pin);
    if(pinned.length) groups.push(['Pinned', pinned]);
    ['Today','Yesterday','Last 7 days'].forEach(d => {
      const rows = hit.filter(c => !c.pin && c.day === d);
      if(rows.length) groups.push([d, rows]);
    });
    hscroll.innerHTML = groups.map(([g, rows]) =>
      '<div class="mhgroup">' + g + '</div>' + rows.map(c =>
        '<div class="hrow" data-id="' + c.id + '">' +
          '<button class="mhitem' + (activeChat === c.id ? ' active' : '') + '" type="button" data-open>' +
            esc(c.t) +
            '<span class="hmeta">' + esc(c.when) + ' · ' + c.n + ' messages</span>' +
          '</button>' +
          '<span class="hacts">' +
            '<button type="button" data-pin class="' + (c.pin ? 'on' : '') + '" title="' + (c.pin ? 'Unpin' : 'Pin') + '" aria-label="' + (c.pin ? 'Unpin chat' : 'Pin chat') + '">' + svg(P.pin) + '</button>' +
            '<button type="button" data-menu title="More" aria-label="Chat options">' + svg('<circle cx="12" cy="5" r="1.6" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none"/><circle cx="12" cy="19" r="1.6" fill="currentColor" stroke="none"/>') + '</button>' +
          '</span>' +
          '<div class="hmenu">' +
            '<button type="button" data-rename>' + svg(P.pen2) + 'Rename</button>' +
            '<button type="button" data-pin>' + svg(P.pin) + (c.pin ? 'Unpin' : 'Pin to top') + '</button>' +
            '<button type="button" data-del class="del">' + svg(P.trash) + 'Delete</button>' +
          '</div>' +
        '</div>').join('')).join('');
  }

  hscroll.addEventListener('click', e => {
    const row = e.target.closest('.hrow'); if(!row) return;
    const id = row.dataset.id, chat = CHATS.find(c => c.id === id);
    if(e.target.closest('[data-menu]')){
      const wasOpen = row.classList.contains('menuopen');
      hscroll.querySelectorAll('.hrow').forEach(r => r.classList.remove('menuopen'));
      row.classList.toggle('menuopen', !wasOpen);
      return;
    }
    if(e.target.closest('[data-pin]')){ chat.pin = !chat.pin; renderHistory(); return; }
    if(e.target.closest('[data-del]')){
      CHATS = CHATS.filter(c => c.id !== id);
      if(activeChat === id) newChat();
      renderHistory();
      if(window.sonner) sonner('Chat deleted', esc(chat.t));
      return;
    }
    if(e.target.closest('[data-rename]')){
      row.classList.remove('menuopen');
      const btn = row.querySelector('.mhitem');
      const inp = document.createElement('input');
      inp.className = 'hrename'; inp.value = chat.t;
      btn.replaceWith(inp); inp.focus(); inp.select();
      const commit = ok => {
        if(ok && inp.value.trim()) chat.t = inp.value.trim();
        renderHistory();
        if(ok && activeChat === id) tname.textContent = chat.t;
      };
      inp.addEventListener('keydown', ev => {
        if(ev.key === 'Enter'){ ev.preventDefault(); commit(true); }
        if(ev.key === 'Escape'){ ev.preventDefault(); commit(false); }
      });
      inp.addEventListener('blur', () => commit(true));
      return;
    }
    if(e.target.closest('[data-open]')){ activeChat = id; renderHistory(); loadThread(chat.t); }
  });
  document.addEventListener('click', e => {
    if(!e.target.closest('.hrow')) hscroll.querySelectorAll('.hrow').forEach(r => r.classList.remove('menuopen'));
  });
  $('mel-hsearch').addEventListener('input', e => { hq = e.target.value; renderHistory(); });

  const hist = $('mel-hist');
  function openSearch(){ hist.classList.add('searching'); const i = $('mel-hsearch'); i.focus(); i.select(); }
  $('mel-hsearchbtn').addEventListener('click', () => {
    if(hist.classList.contains('searching')) hist.classList.remove('searching');
    else openSearch();
  });
  $('ms-navsearchmini').addEventListener('click', () => { page.classList.remove('histmini'); openSearch(); });
  $('mel-railmin').addEventListener('click', () => page.classList.add('histmini'));
  $('mel-railexpand').addEventListener('click', () => page.classList.remove('histmini'));
  $('mel-brandlogo').addEventListener('click', () => page.classList.remove('histmini'));
  $('mel-hsearch').addEventListener('keydown', e => {
    if(e.key === 'Escape'){ e.preventDefault(); hist.classList.remove('searching'); hq = ''; e.target.value = ''; renderHistory(); }
  });

  /* ---- header thread menu (name + chevron) ---- */
  const tbtn = $('mel-threadbtn'), tmenu = $('mel-threadmenu');
  function closeTmenu(){ tmenu.classList.remove('open'); tbtn.setAttribute('aria-expanded','false'); }
  tbtn.addEventListener('click', e => {
    e.stopPropagation();
    if(tmenu.classList.contains('open')){ closeTmenu(); return; }
    const c = CHATS.find(x => x.id === activeChat);
    tmenu.innerHTML =
      '<button type="button" data-tm="rename">' + svg(P.pen2) + 'Rename</button>' +
      (c ? '<button type="button" data-tm="pin">' + svg(P.pin) + (c.pin ? 'Unpin' : 'Pin to top') + '</button>' +
           '<button type="button" data-tm="del" class="del">' + svg(P.trash) + 'Delete</button>' : '');
    tmenu.classList.add('open'); tbtn.setAttribute('aria-expanded','true');
  });
  tmenu.addEventListener('click', e => {
    const b = e.target.closest('[data-tm]'); if(!b) return;
    const k = b.dataset.tm, c = CHATS.find(x => x.id === activeChat);
    closeTmenu();
    if(k === 'rename'){
      const inp = document.createElement('input');
      inp.className = 'hrename'; inp.style.width = '240px'; inp.value = tname.textContent;
      tbtn.style.display = 'none'; tbtn.parentNode.insertBefore(inp, tbtn); inp.focus(); inp.select();
      const commit = ok => {
        if(ok && inp.value.trim()){ tname.textContent = inp.value.trim(); if(c){ c.t = tname.textContent; renderHistory(); } }
        inp.remove(); tbtn.style.display = '';
      };
      inp.addEventListener('keydown', ev => {
        if(ev.key === 'Enter'){ ev.preventDefault(); commit(true); }
        if(ev.key === 'Escape'){ ev.preventDefault(); commit(false); }
      });
      inp.addEventListener('blur', () => commit(true));
      return;
    }
    if(k === 'pin' && c){ c.pin = !c.pin; renderHistory(); return; }
    if(k === 'del' && c){
      CHATS = CHATS.filter(x => x.id !== c.id);
      newChat(); renderHistory();
      if(window.sonner) sonner('Chat deleted', esc(c.t));
    }
  });
  document.addEventListener('click', e => { if(!e.target.closest('.ptitle')) closeTmenu(); });
  document.addEventListener('keydown', e => { if(e.key === 'Escape') closeTmenu(); });

  /* ================= activity drawer ================= */
  let TASKS = [
    { id:'r1', state:'run', t:'Just listed post — 1420 Fillmore', m:'Instagram and Facebook · photos and copy from the MLS', pct:64, step:'Writing caption' },
    { id:'r2', state:'run', t:'Market update email — Noe Valley', m:'214 contacts in Past clients · sends Thu 8:00 AM', pct:23, step:'Pulling August comps' },
    { id:'t1', state:'await', t:'Buyer rep agreement — A. Rao', m:'Sent for signature 9:42 AM · 1 of 2 signed', acts:[{ l:'Nudge client', pri:true },{ l:'Open' }] },
    { id:'t2', state:'await', t:'Appraisal gap on 412 Maple Ave', m:'$18,000 under contract · needs your call today', acts:[{ l:'Draft options', pri:true },{ l:'Open' }] },
    { id:'d0', state:'done', t:'Open house reel — 88 Bay St', m:'Finished 8:12 AM · waiting for your post', acts:[{ l:'View' }] }
  ];
  const tscroll = $('mel-tscroll'), ttoggle = $('mel-taskstoggle'),
        foot = $('mel-foot'), tpill = $('mel-taskpill');
  const STEPS = ['Pulling listing data','Choosing photos','Writing caption','Laying out the card','Final check'];
  function openTasks(){
    page.classList.add('taskson');
    ttoggle.setAttribute('aria-expanded', 'true');
    ttoggle.classList.remove('hasnew');
  }
  function renderPill(run, aw){
    foot.classList.toggle('hasrun', run.length > 0);
    foot.classList.toggle('haswait', run.length === 0 && aw.length > 0);
    if(!run.length && !aw.length) return;
    const lead = run[0] || aw[0];
    const n = run.length ? run.length + (run.length === 1 ? ' task running' : ' tasks running')
                         : aw.length + ' waiting on you';
    tpill.innerHTML = '<span class="rdot"></span><span class="rn">' + n + '</span>' +
      '<span class="rsep">·</span><span class="rw">' + esc(lead.t) + '</span>' +
      '<span class="rgo"><svg viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg></span>';
  }
  function renderTasks(){
    const run = TASKS.filter(t => t.state === 'run'),
          aw = TASKS.filter(t => t.state === 'await'),
          dn = TASKS.filter(t => t.state === 'done');
    let out = '';
    if(run.length) out += '<div class="tgroup">Mel is working · ' + run.length + '</div>' + run.map(item).join('');
    out += '<div class="tgroup">Waiting on you · ' + aw.length + '</div>';
    out += aw.length ? aw.map(item).join('') : '<div class="tzero">Nothing waiting. Anything Mel needs a decision on shows up here.</div>';
    if(dn.length) out += '<div class="tgroup">Done by Mel today</div>' + dn.map(item).join('');
    tscroll.innerHTML = out;
    $('mel-tsub').textContent = (run.length ? run.length + ' running · ' : '') + aw.length + ' waiting · ' + dn.length + ' done today';
    renderPill(run, aw);
    function item(t){
      if(t.state === 'run'){
        return '<div class="titem runit" data-id="' + t.id + '">' +
          '<div class="tt">' + esc(t.t) + '</div><div class="tm">' + esc(t.m) + '</div>' +
          '<div class="tprog"><i style="width:' + Math.round(t.pct) + '%"></i></div>' +
          '<div class="tstep"><span>' + esc(t.step) + '</span><span>' + Math.round(t.pct) + '%</span></div>' +
        '</div>';
      }
      return '<div class="titem' + (t.state === 'done' ? ' doneit' : '') + '" data-id="' + t.id + '">' +
        '<div class="tt">' + esc(t.t) + '</div><div class="tm">' + esc(t.m) + '</div>' +
        ((t.acts && t.acts.length) ? '<div class="tacts">' + t.acts.map(a => '<button type="button" class="' + (a.pri ? 'pri' : '') + '">' + esc(a.l) + '</button>').join('') + '</div>' : '') +
      '</div>';
    }
  }
  function addTask(t, m, state){
    TASKS.unshift({ id:'t' + Date.now(), state: state || 'done', t:t, m:m, acts: state === 'await' ? [{ l:'Review', pri:true }] : [{ l:'View' }] });
    renderTasks();
    if(!page.classList.contains('taskson')) ttoggle.classList.add('hasnew');
  }
  function runTask(t, m){
    TASKS.unshift({ id:'r' + Date.now(), state:'run', t:t, m:m, pct:4, step:STEPS[0] });
    renderTasks();
    if(!page.classList.contains('taskson')) ttoggle.classList.add('hasnew');
  }
  window.MELTASK = runTask;
  setInterval(() => {
    const run = TASKS.filter(t => t.state === 'run');
    if(!run.length) return;
    run.forEach(t => {
      t.pct = Math.min(100, t.pct + 3 + Math.random() * 7);
      t.step = STEPS[Math.min(STEPS.length - 1, Math.floor(t.pct / 100 * STEPS.length))];
      if(t.pct >= 100){
        t.state = 'done';
        t.m = 'Finished just now · ready for your review';
        t.acts = [{ l:'Review', pri:true },{ l:'View' }];
        if(!page.classList.contains('taskson')) ttoggle.classList.add('hasnew');
        if(window.sonner) sonner(t.t, 'Mel finished it · open activity to review');
      }
    });
    renderTasks();
  }, 1600);
  tscroll.addEventListener('click', e => {
    const b = e.target.closest('.tacts button'); if(!b) return;
    if(window.sonner) sonner(b.textContent.trim(), 'Wire this action to your flow');
  });
  tpill.addEventListener('click', openTasks);
  ttoggle.addEventListener('click', () => {
    const on = page.classList.toggle('taskson');
    ttoggle.setAttribute('aria-expanded', String(on));
    if(on) ttoggle.classList.remove('hasnew');
  });
  renderTasks();

  /* ================= artifacts ================= */
  const confBar =
    '<div class="maconf"><div class="ct"></div><div class="cb">' +
      '<button class="mab" type="button" data-cancel>Cancel</button>' +
      '<button class="mab primary" type="button" data-go>Confirm</button>' +
    '</div></div>';
  function card(o){
    return '<div class="mart">' +
      '<div class="mah"><span class="mati">' + svg(o.icon) + '</span><span><h4>' + o.title + '</h4><div class="masub">' + o.sub + '</div></span>' +
      (o.badge ? '<span class="mabadge ' + (o.badgeKind || '') + '">' + o.badge + '</span>' : '') + '</div>' +
      '<div class="mabody">' + o.body + '<div class="masrc">' + svg(P.db) + o.src + '</div></div>' +
      confBar +
      '<div class="maf">' + o.actions + '</div>' +
    '</div>';
  }
  const act = (label, o) => '<button class="mab' + (o && o.pri ? ' primary' : '') + '" type="button"' +
    (o && o.ct ? ' data-ct="' + esc(o.ct) + '" data-task="' + esc(o.task) + '" data-taskmeta="' + esc(o.taskmeta || 'Just now · by Mel') + '" data-done="' + esc(o.done || 'Sent') + '"' : '') +
    '>' + label + '</button>';

  const ART = {
    cma: () => card({
      icon:P.chart, title:'CMA · 1420 Grove St', sub:'6 closed comps · 0.4 mi · last 90 days',
      badge:'Draft',
      body:'<div class="malab">Suggested list range</div><div class="maprice">$1,240,000 – $1,310,000</div>' +
        '<div class="mastats"><div><div class="sk">Median days on market</div><div class="sv">18</div></div>' +
        '<div><div class="sk">Median $/sqft</div><div class="sv">$842</div></div>' +
        '<div><div class="sk">Competing active</div><div class="sv">2</div></div></div>' +
        '<table class="matbl"><thead><tr><th>Comparable</th><th>Closed</th><th class="num">Price</th><th class="num">$/sqft</th></tr></thead><tbody>' +
        '<tr><td>1408 Grove St</td><td>Jun 12</td><td class="num">$1,275,000</td><td class="num">851</td></tr>' +
        '<tr><td>55 Alvarado St</td><td>May 28</td><td class="num">$1,205,000</td><td class="num">824</td></tr>' +
        '<tr><td>1391 Grove St</td><td>Apr 30</td><td class="num">$1,330,000</td><td class="num">868</td></tr>' +
        '</tbody></table>',
      src:'SFAR MLS · synced 12 minutes ago',
      actions: act('Email to seller', { pri:true, ct:'This emails the 4-page CMA to marla.chen@gmail.com from your Radius address. The list range is still a draft — confirm the numbers first.', task:'CMA emailed to seller · 1420 Grove St', taskmeta:'Just now · 4-page PDF · by Mel', done:'Emailed' }) +
        act('Open draft') + act('Export PDF')
    }),
    value: () => card({
      icon:P.home, title:'Home value · 2201 Oak Terrace', sub:'AVM plus 4 nearby closed sales',
      badge:'Medium confidence', badgeKind:'warn',
      body:'<div class="malab">Estimated value</div><div class="maprice">$892,000</div>' +
        '<div class="mastats"><div><div class="sk">Range</div><div class="sv">$856k – $921k</div></div>' +
        '<div><div class="sk">Last sold</div><div class="sv">2019 · $704k</div></div>' +
        '<div><div class="sk">Since purchase</div><div class="sv">+26.7%</div></div></div>',
      src:'County records + MLS · 4 comps within 0.6 mi',
      actions: act('Create client summary', { pri:true }) + act('Add to CMA') + act('Copy')
    }),
    blockers: () => card({
      icon:P.alert, title:'3 closings need you this week', sub:'Sorted by how soon they close',
      badge:'2 urgent', badgeKind:'warn',
      body:'<div class="marow"><span class="madot red"></span><span><div class="mrt">412 Maple Ave</div><div class="mrm">Appraisal returned $18,000 under contract price. Buyer has not been told yet.</div></span><span class="mrd">closes Fri<br>Aug 14</span></div>' +
        '<div class="marow"><span class="madot orange"></span><span><div class="mrt">88 Pine St, Unit 12B</div><div class="mrm">Seller disclosure package still unsigned — 4 days out.</div></span><span class="mrd">closes Sat<br>Aug 15</span></div>' +
        '<div class="marow"><span class="madot blue"></span><span><div class="mrt">1420 Grove St</div><div class="mrm">Lender is waiting on updated proof of funds from the buyer.</div></span><span class="mrd">closes Aug 29</span></div>',
      src:'Radius transactions · live',
      actions: act('Draft all 3 updates', { pri:true, ct:'Mel drafts one update per transaction and holds them for your review. Nothing goes to clients until you send each one.', task:'3 closing updates drafted', taskmeta:'Just now · awaiting your review · by Mel', done:'Drafted' }) +
        act('Open transactions') + act('Assign to TC')
    }),
    draftText: () => card({
      icon:P.msg, title:'Text to Priya Raman', sub:'Buyer · last touch 9 days ago',
      badge:'Draft',
      body:'<div class="maprev"><div class="pk">To <b>Priya Raman · (415) 555-0188</b></div><div class="pk">About <b>Noe Valley search · 3 saved listings</b></div>' +
        '<div class="pbody">Hi Priya — three new Noe Valley listings came up that match what you liked about the Grove St place, including one with the yard you wanted. Want me to line up showings Saturday afternoon?</div></div>',
      src:'Drafted from her saved searches and your last 4 texts',
      actions: act('Send text', { pri:true, ct:'This sends the message to Priya Raman at (415) 555-0188 from your Radius number, right now.', task:'Text sent to Priya Raman', taskmeta:'Just now · SMS · by Mel', done:'Sent' }) +
        act('Edit draft') + act('Schedule for 8 AM')
    }),
    agreement: () => card({
      icon:P.sign, title:'Buyer representation & broker compensation', sub:'Client: Anil Rao · prepared from your template',
      badge:'Ready for signature', badgeKind:'ok',
      body:'<div class="macheck">' + svg(P.check) + 'Client details and today\'s date filled<span class="mn">auto</span></div>' +
        '<div class="macheck">' + svg(P.check) + 'Term set to 90 days<span class="mn">Aug 11 – Nov 9</span></div>' +
        '<div class="macheck">' + svg(P.check) + 'Brokerage and license numbers<span class="mn">verified</span></div>' +
        '<div class="marow"><span class="madot orange"></span><span><div class="mrt">Compensation left for you</div><div class="mrm">Mel does not set your commission. Confirm the rate before this goes out.</div></span><span class="mrd">2.5%?</span></div>',
      src:'Radius document templates · CA form rev. 12/25',
      actions: act('Send for signature', { pri:true, ct:'Sends the agreement to anil.rao@outlook.com for e-signature with compensation at 2.5%. Change the rate first if that is wrong.', task:'Signature requested · A. Rao buyer rep', taskmeta:'Just now · awaiting client · by Mel', done:'Sent for signature' }) +
        act('Change rate') + act('Open document')
    }),
    followups: () => card({
      icon:P.users, title:'7 leads have gone quiet', sub:'No contact in 14 days or more',
      badge:'3 warm', badgeKind:'warn',
      body:'<div class="marow"><span class="madot red"></span><span><div class="mrt">R. Chen</div><div class="mrm">Toured 1420 Grove twice, asked about the HOA docs.</div></span><span class="mrd">21 days</span></div>' +
        '<div class="marow"><span class="madot orange"></span><span><div class="mrt">M. Alvarez</div><div class="mrm">Pre-approved to $1.1M, hasn\'t seen anything since June.</div></span><span class="mrd">17 days</span></div>' +
        '<div class="marow"><span class="madot blue"></span><span><div class="mrt">The Watsons</div><div class="mrm">Asked about school boundaries in Rockridge.</div></span><span class="mrd">14 days</span></div>',
      src:'Radius CRM · activity log',
      actions: act('Draft 3 personal notes', { pri:true, ct:'Mel writes one note per lead using your past conversations, then holds all three for your review. Nothing sends automatically.', task:'3 follow-up notes drafted', taskmeta:'Just now · awaiting your review · by Mel', done:'Drafted' }) +
        act('See all 7') + act('Add to nurture')
    }),
    offer: () => card({
      icon:P.doc, title:'Purchase offer · 88 Pine St, Unit 12B', sub:'Buyer: R. Chen · list price $842,000',
      badge:'Started', badgeKind:'ok',
      body:'<div class="mastats"><div><div class="sk">Suggested offer</div><div class="sv">$851,000</div></div>' +
        '<div><div class="sk">Recent list-to-sale</div><div class="sv">101.2%</div></div>' +
        '<div><div class="sk">Days on market</div><div class="sv">11</div></div></div>' +
        '<div class="macheck">' + svg(P.check) + 'Buyer, property and financing pulled in<span class="mn">3 of 3</span></div>' +
        '<div class="macheck">' + svg(P.check) + 'Proof of funds on file<span class="mn">Aug 2</span></div>' +
        '<div class="marow"><span class="madot orange"></span><span><div class="mrt">Still needed from you</div><div class="mrm">Contingency periods and close date. Everything else is filled.</div></span><span class="mrd">2 fields</span></div>',
      src:'Radius forms · comparable offers within 0.5 mi',
      actions: act('Continue offer', { pri:true }) + act('Send to buyer for review', { ct:'Emails a read-only draft of the offer to R. Chen. Terms are still incomplete — the two open fields will show as blank.', task:'Offer draft shared with R. Chen', taskmeta:'Just now · read-only link · by Mel', done:'Shared' })
    })
  };

  /* ================= replies ================= */
  const REPLIES = [
    { k:/valuation report|cma|comps|listing presentation/i, t:'CMA prep',
      body:'<p>I pulled six comparable sales within 0.4 miles that closed in the last 90 days and built the CMA. Two active listings on the same street are competing with you, so I weighted the two closest comps higher.</p>',
      art:'cma' },
    { k:/home value|estimate|worth/i, t:'Home value estimate',
      body:'<p>Here is the estimate for that address. Confidence is medium — only four true comps closed nearby this quarter, and one had a major kitchen remodel.</p>',
      art:'value' },
    { k:/representation agreement|agreement|compensation|sign/i, t:'Buyer rep agreement',
      body:'<p>The buyer representation and broker compensation agreement is prepared and ready for signature. I filled in the client details, the date and a 90-day term. I left the compensation rate for you to confirm.</p>',
      art:'agreement' },
    { k:/text|check in|message/i, t:'Client check-in text',
      body:'<p>Drafted from her three saved listings and the tone of your last few texts. She replies fastest in the evening, so I would send it after 5 PM.</p>',
      art:'draftText' },
    { k:/blocking|closing|blocker|pipeline/i, t:'Closing blockers · this week',
      body:'<p>Three closings need you this week. Two are time-critical — the Maple Ave appraisal gap is the one that can kill the deal.</p>',
      art:'blockers' },
    { k:/follow.?up|leads|quiet|nurture/i, t:'Quiet leads follow-up',
      body:'<p>Seven leads have gone quiet for 14 days or more. These three are the warmest and worth a personal note today.</p>',
      art:'followups' },
    { k:/offer|purchase/i, t:'Purchase offer · 88 Pine St',
      body:'<p>I started the offer and pulled in the buyer, property and financing details. Recent sales in that building have closed slightly over list, so I suggested $851,000.</p>',
      art:'offer' },
    { k:/buyer lead|add.*(lead|client)|contact details/i, t:'New buyer lead',
      body:'<p>Add the lead from Clients, or paste their name, phone and email here and I will create the record, tag the source and start a nurture sequence for you to approve.</p>' }
  ];
  function replyFor(text){
    return REPLIES.find(r => r.k.test(text)) ||
      { body:'<p>On it. I will pull the client record and the related transaction, then draft it for your review — nothing sends until you confirm.</p>' };
  }

  /* ================= streaming ================= */
  let run = null;
  function tokens(html){
    const out = [];
    (html.match(/<[^>]+>|[^<]+/g) || []).forEach(t => {
      if(t.charAt(0) === '<') out.push(t);
      else t.split(/(\s+)/).forEach(w => { if(w) out.push(w); });
    });
    return out;
  }
  function stream(target, html, done){
    const list = tokens(html);
    let i = 0, acc = '';
    run = { stop(){ this.stopped = true; } };
    const self = run;
    (function tick(){
      if(self.stopped){ target.innerHTML = acc; run = null; done(true); return; }
      const step = 2 + Math.floor(Math.random() * 3);
      for(let k = 0; k < step && i < list.length; k++) acc += list[i++];
      target.innerHTML = acc;
      scroll();
      if(i < list.length) self.t = setTimeout(tick, 20);
      else { target.innerHTML = html; run = null; done(false); }
    })();
  }
  $('mel-stop').addEventListener('click', () => { if(run) run.stop(); });

  /* ================= messages ================= */
  function addUser(text, tags){
    const el = document.createElement('div');
    el.className = 'mmsg me';
    const t = (tags && tags.length) ? '<div style="margin-top:6px;font-size:12px;color:var(--neutral-500)">' + esc(tags.join(' · ')) + '</div>' : '';
    el.innerHTML = '<div class="bubble">' + esc(text) + t + '</div>';
    thread.appendChild(el); scroll();
  }
  const MACT =
    '<div class="mmact">' +
      '<button type="button" data-act="copy" title="Copy" aria-label="Copy reply">' + svg(P.copy) + '</button>' +
      '<button type="button" data-act="redo" title="Regenerate" aria-label="Regenerate reply">' + svg(P.redo) + '</button>' +
      '<button type="button" data-act="up" title="Good answer" aria-label="Good answer">' + svg(P.up) + '</button>' +
      '<button type="button" data-act="down" title="Bad answer" aria-label="Bad answer">' + svg(P.down) + '</button>' +
    '</div>';

  /* inline artifact cards — registry of click-to-reopen canvas openers */
  const ARTS = {}; let artSeq = 0;
  window.melArtifact = function(o, open){
    const id = 'a' + (++artSeq); ARTS[id] = open;
    return '<button class="msartc" type="button" data-artc="' + id + '" aria-label="Open ' + esc(o.title) + ' preview">' +
      '<span class="msartthumb" style="--ph:' + (o.ph || '#cfc9c0') + '"><span class="msartkind">' + esc(o.kind || 'Preview') + '</span></span>' +
      '<span class="msartmeta"><b>' + esc(o.title) + '</b><i>' + esc(o.meta || '') + '</i></span>' +
      '<span class="msartgo">' + svg('<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M15 3v18"/>') + '</span></button>';
  };

  function melShell(){
    const el = document.createElement('div');
    el.className = 'mmsg from-mel';
    el.innerHTML = '<img class="mav" src="' + AV + '" alt="Mel"><div class="body"></div>';
    thread.appendChild(el); scroll();
    return el;
  }
  function render(el, r, animate){
    const body = el.querySelector('.body');
    const finish = stopped => {
      el.classList.remove('streaming');
      page.classList.remove('busy');
      if(!stopped && r.art && ART[r.art]) body.insertAdjacentHTML('beforeend', ART[r.art]());
      if(!stopped && typeof r.after === 'function') r.after(body, el);
      body.insertAdjacentHTML('beforeend', MACT);
      el.dataset.q = r.q || '';
      scroll();
    };
    if(animate){
      el.classList.add('streaming');
      page.classList.add('busy');
      stream(body, r.body, finish);
    } else {
      body.innerHTML = r.body;
      finish(false);
    }
  }

  thread.addEventListener('click', e => {
    /* inline artifact card → reopen its side preview */
    const ac = e.target.closest('[data-artc]');
    if(ac){ const f = ARTS[ac.dataset.artc]; if(f) f(); return; }
    /* per-message actions */
    const a = e.target.closest('.mmact button');
    if(a){
      const kind = a.dataset.act, msg = a.closest('.mmsg');
      if(kind === 'copy'){ if(window.sonner) sonner('Copied', 'Reply copied to your clipboard'); return; }
      if(kind === 'redo'){
        const q = msg.dataset.q || '';
        msg.querySelector('.body').innerHTML = '';
        render(msg, replyFor(q) && Object.assign({}, replyFor(q), { q:q }), true);
        return;
      }
      const on = a.classList.contains('on');
      msg.querySelectorAll('.mmact button[data-act="up"],.mmact button[data-act="down"]').forEach(b => b.classList.remove('on'));
      if(!on){ a.classList.add('on'); if(window.sonner) sonner(kind === 'up' ? 'Thanks — noted' : 'Feedback sent', kind === 'up' ? 'Mel will lean on this pattern' : 'Tell Mel what was wrong in your next message'); }
      return;
    }
    /* confirm flow */
    const art = e.target.closest('.mart'); if(!art) return;
    const trigger = e.target.closest('.maf .mab');
    if(trigger){
      if(!trigger.dataset.ct){ if(window.sonner) sonner(trigger.textContent.trim(), 'Wire this action to your flow'); return; }
      art.querySelector('.maconf .ct').textContent = trigger.dataset.ct;
      art.dataset.pending = trigger.textContent.trim();
      art.classList.add('confirming');
      art.querySelector('[data-go]').focus();
      return;
    }
    if(e.target.closest('[data-cancel]')){ art.classList.remove('confirming'); return; }
    if(e.target.closest('[data-go]')){
      const btn = [...art.querySelectorAll('.maf .mab')].find(b => b.textContent.trim() === art.dataset.pending);
      art.classList.remove('confirming');
      if(btn){
        addTask(btn.dataset.task, btn.dataset.taskmeta);
        btn.outerHTML = '<span class="mab done">' + svg(P.check) + esc(btn.dataset.done) + '</span>';
        if(window.sonner) sonner(btn.dataset.done, btn.dataset.task);
      }
    }
  });

  /* ================= send ================= */
  function send(text){
    text = (text || '').trim(); if(!text) return;
    if(run) run.stop();
    const tags = [...attach.querySelectorAll('.matag')].map(t => t.dataset.label);
    page.classList.add('chatting');
    page.classList.remove('studio');
    { const at = document.getElementById('mel-apptitle'); if(at) at.textContent = 'Mel Copilot'; }
    if(tname.textContent === 'New chat'){
      const r0 = replyFor(text);
      tname.textContent = r0.t || (text.length > 42 ? text.slice(0, 42) + '…' : text);
    }
    if(activeChat === null){
      const nid = 'c' + Date.now();
      CHATS.unshift({ id:nid, t:tname.textContent, day:'Today', when:'Now', n:1, pin:false });
      activeChat = nid; renderHistory();
    } else {
      const cc = CHATS.find(x => x.id === activeChat);
      if(cc){ cc.n++; renderHistory(); }
    }
    addUser(text, tags);
    clearAttachments();
    ta.value = ''; sync(); closeSlash();
    const el = melShell();
    const hook = window.MELSTUDIO && window.MELSTUDIO.reply(text);
    const rr = Object.assign({}, hook || replyFor(text), { q:text });
    let tr = null, delay = 380;
    if(!hook && window.MSTRACE){
      tr = window.MSTRACE(el.querySelector('.body'), [
        ['Reading your ask', 300],
        ['Checking your pipeline and listings', 380],
        ['Writing a reply', 300]
      ], { label:'Thinking\u2026', doneLabel:'Thought for a moment' });
      delay = 1200;
    }
    setTimeout(() => {
      if(tr && tr.parentNode) tr.parentNode.removeChild(tr);
      if(tr){
        const after0 = rr.after;
        rr.after = (b, m) => { b.insertBefore(tr, b.firstChild); if(after0) after0(b, m); };
      }
      render(el, rr, true);
    }, delay);
  }
  function loadThread(title){
    if(run) run.stop();
    thread.innerHTML = '';
    page.classList.add('chatting');
    tname.textContent = title;
    addUser(title, null);
    if(window.MELSTUDIO) window.MELSTUDIO.reset();
    const hook = window.MELSTUDIO && window.MELSTUDIO.reply(title);
    render(melShell(), Object.assign({}, hook || replyFor(title), { q:title }), false);
  }
  function newChat(){
    if(run) run.stop();
    thread.innerHTML = '';
    page.classList.remove('studio');
    if(window.MELSTUDIO) window.MELSTUDIO.reset();
    page.classList.remove('chatting');
    tname.textContent = 'New chat';
    activeChat = null; renderHistory();
    clearAttachments();
    ta.value = ''; sync(); closeSlash(); ta.focus();
  }
  $('mel-new').addEventListener('click', newChat);
  { const mn2 = document.getElementById('mel-new2'); if(mn2) mn2.addEventListener('click', newChat); }

  /* ================= slash commands ================= */
  const CMDS = [
    { c:'/cma',        n:'Run a CMA',            d:'Comps, list range and a client-ready draft', p:'Run a CMA for a listing presentation I have this week', i:P.chart },
    { c:'/value',      n:'Home value estimate',  d:'AVM plus nearby closed sales',               p:'Generate a quick home value estimate for an address my client is considering', i:P.home },
    { c:'/blockers',   n:'Closing blockers',     d:'What is holding up this week',               p:'Show what is blocking my closings this week', i:P.alert },
    { c:'/followups',  n:'Quiet leads',          d:'Who has gone cold and what to say',          p:'Which leads have gone quiet and what should I send them', i:P.users },
    { c:'/text',       n:'Draft a client text',  d:'Personalized from their saved searches',     p:'Send a personalized text message to my client to check in on their home search', i:P.msg },
    { c:'/agreement',  n:'Buyer rep agreement',  d:'Prefilled, ready for signature',             p:'Send the buyer representation and broker compensation agreement to a client', i:P.sign },
    { c:'/offer',      n:'Start an offer',       d:'Suggested price and prefilled forms',        p:'Help me start a purchase offer for a client on a specific property', i:P.doc }
  ];
  const slash = $('mel-slash');
  let sIdx = 0, sList = [];
  function renderSlash(q){
    sList = CMDS.filter(c => (c.c + ' ' + c.n + ' ' + c.d).toLowerCase().includes(q));
    if(!sList.length){ closeSlash(); return; }
    if(sIdx >= sList.length) sIdx = 0;
    slash.innerHTML = '<div class="sgh">Mel can do</div>' + sList.map((c, i) =>
      '<div class="sitem' + (i === sIdx ? ' sel' : '') + '" role="option" data-i="' + i + '">' +
        '<span class="sic">' + svg(c.i) + '</span>' +
        '<span><div class="sn">' + c.n + '</div><div class="sd">' + c.d + '</div></span>' +
        '<span class="scmd">' + c.c + '</span>' +
      '</div>').join('');
    slash.classList.add('open');
  }
  function closeSlash(){ slash.classList.remove('open'); sIdx = 0; }
  function pickSlash(i){
    const c = sList[i]; if(!c) return;
    closeSlash();
    send(c.p);
  }
  slash.addEventListener('click', e => {
    const it = e.target.closest('.sitem'); if(it) pickSlash(+it.dataset.i);
  });
  slash.addEventListener('pointermove', e => {
    const it = e.target.closest('.sitem'); if(!it || +it.dataset.i === sIdx) return;
    sIdx = +it.dataset.i;
    slash.querySelectorAll('.sitem').forEach(x => x.classList.toggle('sel', +x.dataset.i === sIdx));
  });

  /* ================= composer ================= */
  function sync(){
    composer.classList.toggle('has', ta.value.trim().length > 0);
    $('mel-send').disabled = !ta.value.trim().length;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 180) + 'px';
  }
  ta.addEventListener('input', () => {
    sync();
    const v = ta.value;
    if(v.charAt(0) === '/' && v.indexOf('\n') < 0) renderSlash(v.toLowerCase());
    else closeSlash();
  });
  ta.addEventListener('keydown', e => {
    if(slash.classList.contains('open')){
      if(e.key === 'ArrowDown' || e.key === 'ArrowUp'){
        e.preventDefault();
        sIdx = (sIdx + (e.key === 'ArrowDown' ? 1 : sList.length - 1)) % sList.length;
        renderSlash(ta.value.toLowerCase());
        return;
      }
      if(e.key === 'Enter' || e.key === 'Tab'){ e.preventDefault(); pickSlash(sIdx); return; }
      if(e.key === 'Escape'){ e.preventDefault(); closeSlash(); return; }
    }
    if(e.key === 'Enter' && !e.shiftKey){ e.preventDefault(); send(ta.value); }
  });
  composer.addEventListener('submit', e => { e.preventDefault(); send(ta.value); });

  /* ================= command palette ================= */
  const pal = $('mel-pal'), palIn = $('mel-palin'), palList = $('mel-pallist');
  let pIdx = 0, pRows = [];
  function palRows(q){
    const rows = [];
    CMDS.filter(c => (c.n + ' ' + c.d + ' ' + c.c).toLowerCase().includes(q))
      .forEach(c => rows.push({ g:'Ask Mel', n:c.n, d:c.d, k:c.c, i:c.i, run:() => { openMel(); send(c.p); } }));
    CHATS.filter(c => c.t.toLowerCase().includes(q)).slice(0, 4)
      .forEach(c => rows.push({ g:'Recent chats', n:c.t, d:c.when + ' · ' + c.n + ' messages', i:P.clock, run:() => { openMel(); activeChat = c.id; renderHistory(); loadThread(c.t); } }));
    [
      { n:'New chat', d:'Start Mel fresh', i:P.msg, run:() => { openMel(); newChat(); } },
      { n:'Mel activity', d:'What Mel is holding for you', i:P.check, run:() => { openMel(); if(!page.classList.contains('taskson')) ttoggle.click(); } },
      { n:'Go to transactions', d:'Leave Mel and open the pipeline', i:P.arrows, run:() => closeMel() }
    ].filter(a => (a.n + ' ' + a.d).toLowerCase().includes(q)).forEach(a => rows.push(Object.assign({ g:'Actions' }, a)));
    if(q && !rows.length) rows.push({ g:'Ask Mel', n:'Ask Mel: “' + palIn.value.trim() + '”', d:'Send this as a message', i:P.msg, run:() => { openMel(); send(palIn.value.trim()); } });
    return rows;
  }
  function renderPal(){
    const q = palIn.value.trim().toLowerCase();
    pRows = palRows(q);
    if(!pRows.length){ palList.innerHTML = '<div class="mpalzero">Nothing matches that.</div>'; return; }
    if(pIdx >= pRows.length) pIdx = 0;
    let out = '', g = '';
    pRows.forEach((r, i) => {
      if(r.g !== g){ g = r.g; out += '<div class="sgh">' + g + '</div>'; }
      out += '<div class="sitem' + (i === pIdx ? ' sel' : '') + '" data-i="' + i + '">' +
        '<span class="sic">' + svg(r.i) + '</span>' +
        '<span><div class="sn">' + esc(r.n) + '</div><div class="sd">' + esc(r.d) + '</div></span>' +
        (r.k ? '<span class="scmd">' + r.k + '</span>' : '') +
      '</div>';
    });
    palList.innerHTML = out;
    const sel = palList.querySelector('.sitem.sel');
    if(sel && sel.offsetTop < palList.scrollTop) palList.scrollTop = sel.offsetTop - 6;
    if(sel && sel.offsetTop + sel.offsetHeight > palList.scrollTop + palList.clientHeight) palList.scrollTop = sel.offsetTop + sel.offsetHeight - palList.clientHeight + 6;
  }
  function openPal(){
    lastFocus = document.activeElement;
    pIdx = 0; palIn.value = ''; renderPal();
    pal.classList.add('open');
    requestAnimationFrame(() => pal.classList.add('in'));
    setTimeout(() => palIn.focus(), 40);
  }
  function closePal(){
    pal.classList.remove('in');
    setTimeout(() => pal.classList.remove('open'), 170);
    if(lastFocus && lastFocus.focus) lastFocus.focus();
  }
  palIn.addEventListener('input', () => { pIdx = 0; renderPal(); });
  palIn.addEventListener('keydown', e => {
    if(e.key === 'ArrowDown' || e.key === 'ArrowUp'){
      e.preventDefault();
      pIdx = (pIdx + (e.key === 'ArrowDown' ? 1 : pRows.length - 1)) % pRows.length;
      renderPal(); return;
    }
    if(e.key === 'Enter'){ e.preventDefault(); const r = pRows[pIdx]; closePal(); if(r) r.run(); return; }
    if(e.key === 'Escape'){ e.preventDefault(); closePal(); }
  });
  palList.addEventListener('click', e => {
    const it = e.target.closest('.sitem'); if(!it) return;
    const r = pRows[+it.dataset.i]; closePal(); if(r) r.run();
  });
  palList.addEventListener('pointermove', e => {
    const it = e.target.closest('.sitem'); if(!it || +it.dataset.i === pIdx) return;
    pIdx = +it.dataset.i;
    palList.querySelectorAll('.sitem').forEach(x => x.classList.toggle('sel', +x.dataset.i === pIdx));
  });
  pal.querySelectorAll('[data-palclose]').forEach(b => b.addEventListener('click', closePal));

  /* ================= prompt rail ================= */
  const rail = $('mel-prompts');
  rail.addEventListener('click', e => {
    const c = e.target.closest('.pcard');
    if(c && !rail.dataset.dragged) send(c.dataset.prompt);
  });
  (function(){
    if(!rail) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    [...rail.children].forEach(c => { const d = c.cloneNode(true); d.setAttribute('aria-hidden','true'); d.tabIndex = -1; rail.appendChild(d); });
    let paused = reduce, raf = 0, half = 0;
    const measure = () => { half = rail.scrollWidth / 2; };
    measure(); window.addEventListener('resize', measure);
    const tick = () => {
      if(!paused && rail.offsetParent){
        rail.scrollLeft += .55;
        if(rail.scrollLeft >= half) rail.scrollLeft -= half;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    rail.addEventListener('pointerenter', () => paused = true);
    rail.addEventListener('pointerleave', () => { if(!reduce) paused = false; });
    rail.addEventListener('focusin', () => paused = true);
    rail.addEventListener('focusout', () => { if(!reduce) paused = false; });
    let down = false, sx = 0, sl = 0;
    rail.addEventListener('pointerdown', e => {
      down = true; sx = e.clientX; sl = rail.scrollLeft;
      delete rail.dataset.dragged; rail.setPointerCapture(e.pointerId);
    });
    rail.addEventListener('pointermove', e => {
      if(!down) return;
      const dx = e.clientX - sx;
      if(Math.abs(dx) > 4) rail.dataset.dragged = '1';
      rail.scrollLeft = sl - dx;
      if(rail.scrollLeft >= half) rail.scrollLeft -= half;
      if(rail.scrollLeft < 0) rail.scrollLeft += half;
    });
    const up = () => { down = false; setTimeout(() => delete rail.dataset.dragged, 0); };
    rail.addEventListener('pointerup', up);
    rail.addEventListener('pointercancel', up);
  })();

  /* ================= attachments ================= */
  function addTag(label){
    const t = document.createElement('span');
    t.className = 'matag'; t.dataset.label = label;
    t.innerHTML = '<span></span><button type="button" aria-label="Remove ' + esc(label) + '"><svg viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg></button>';
    t.firstChild.textContent = label;
    t.querySelector('button').addEventListener('click', () => t.remove());
    attach.appendChild(t);
  }
  function clearAttachments(){ attach.innerHTML = ''; }
  document.querySelectorAll('.mchip[data-attach]').forEach(b => b.addEventListener('click', () => {
    if(b.dataset.attach === 'property'){ openModal(b); return; }
    if(window.sonner) sonner('Attach ' + b.dataset.attach, 'Wire this to your file picker');
  }));

  /* ================= share properties dialog ================= */
  const modal = $('mel-modal'), psearch = $('mel-psearch'), presults = $('mel-presults'), padd = $('mel-padd');
  const STOCK = [
    { a:'1420 Grove St', m:'San Francisco, CA · 3 bd · 2 ba', p:'$1,285,000' },
    { a:'412 Maple Ave', m:'Oakland, CA · 4 bd · 3 ba', p:'$975,000' },
    { a:'88 Pine St, Unit 12B', m:'San Francisco, CA · 2 bd · 2 ba', p:'$842,000' },
    { a:'2201 Oak Terrace', m:'Berkeley, CA · 3 bd · 2 ba', p:'$1,105,000' }
  ];
  let picked = [];
  function renderResults(){
    const q = psearch.value.trim().toLowerCase();
    if(!q){
      presults.innerHTML = '<div class="mmzero"><div>Start typing to search for properties</div><div style="color:var(--neutral-400)">Address, MLS number, or client name</div></div>';
      return;
    }
    const hits = STOCK.filter(s => s.a.toLowerCase().includes(q) || s.m.toLowerCase().includes(q));
    if(!hits.length){ presults.innerHTML = '<div class="mmzero">No properties match “' + esc(q) + '”</div>'; return; }
    presults.innerHTML = hits.map(s =>
      '<div class="mmrow' + (picked.includes(s.a) ? ' on' : '') + '" role="button" tabindex="0" data-addr="' + esc(s.a) + '">' +
        '<span class="mmbox"><svg viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg></span>' +
        '<span><span class="mmaddr">' + esc(s.a) + '</span><span class="mmmeta" style="display:block">' + esc(s.m) + '</span></span>' +
        '<span class="mmprice">' + esc(s.p) + '</span>' +
      '</div>').join('');
  }
  function syncAdd(){
    padd.disabled = !picked.length;
    padd.textContent = picked.length ? 'Add (' + picked.length + ')' : 'Add';
  }
  function toggle(addr){
    picked = picked.includes(addr) ? picked.filter(a => a !== addr) : picked.concat(addr);
    renderResults(); syncAdd();
  }
  presults.addEventListener('click', e => { const r = e.target.closest('.mmrow'); if(r) toggle(r.dataset.addr); });
  presults.addEventListener('keydown', e => {
    const r = e.target.closest('.mmrow');
    if(r && (e.key === 'Enter' || e.key === ' ')){ e.preventDefault(); toggle(r.dataset.addr); }
  });
  psearch.addEventListener('input', renderResults);
  function openModal(trigger){
    lastFocus = trigger || document.activeElement;
    picked = []; psearch.value = ''; renderResults(); syncAdd();
    modal.classList.add('open');
    requestAnimationFrame(() => modal.classList.add('in'));
    setTimeout(() => psearch.focus(), 60);
  }
  function closeModal(){
    modal.classList.remove('in');
    setTimeout(() => modal.classList.remove('open'), 180);
    if(lastFocus && lastFocus.focus) lastFocus.focus();
  }
  modal.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', closeModal));
  padd.addEventListener('click', () => { picked.forEach(addTag); closeModal(); ta.focus(); });
  modal.addEventListener('keydown', e => {
    if(e.key === 'Escape'){ e.stopPropagation(); closeModal(); return; }
    if(e.key !== 'Tab') return;
    const f = [...modal.querySelectorAll('button,input,[tabindex="0"]')].filter(x => x.offsetParent !== null && !x.disabled);
    if(!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
    else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
  });

  /* ================= global keys ================= */
  document.addEventListener('keydown', e => {
    if((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')){
      e.preventDefault();
      pal.classList.contains('open') ? closePal() : openPal();
      return;
    }
    if(e.key === 'Escape'){
      if(pal.classList.contains('open')) return;
      if(modal.classList.contains('open')) return;
      if(slash.classList.contains('open')){ closeSlash(); return; }
      if(run){ run.stop(); return; }
      if(page.style.display !== 'none') closeMel();
    }
  });

  window.MEL = { send:send, addTask:addTask, openMel:openMel, newChat:newChat, page:page, esc:esc, svg:svg, icons:P,
    say(bodyHtml, after){ const el = melShell(); render(el, { body:bodyHtml, after:after }, true); },
    studio(on){ page.classList.toggle('studio', on !== false); if(on !== false) page.classList.remove('chatting'); 
      const at = document.getElementById('mel-apptitle'); if(at) at.textContent = 'Mel Copilot'; },
    appTitle(t){ const at = document.getElementById('mel-apptitle'); if(at) at.textContent = t; } };

  renderHistory();
  sync();
})();

