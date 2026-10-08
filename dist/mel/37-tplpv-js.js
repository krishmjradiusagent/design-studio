/* ---------- Template preview dialog ----------
   One dialog for both entries on the templates page:
     • "Preview all"  → every picked template, grouped by format in the left rail
     • eye on a card  → the same dialog with that one template
   Layout is the package review screen: format rail · render + caption · share rail.
   mel/35 hands off to window.MELTPLPV when this file is loaded. */
(function(){
  const FMT = {
    post:     { lbl:'Posts',          one:'Feed post',     ratio:'4:5',   ar:4/5,     icon:'ph-file-image',          net:'Instagram', cap:true },
    carousel: { lbl:'Carousels',      one:'Carousel',      ratio:'4:5',   ar:4/5,     icon:'ph-squares-four',        net:'Instagram', cap:true },
    story:    { lbl:'Stories',        one:'Story',         ratio:'9:16',  ar:9/16,    icon:'ph-device-mobile',       net:'Instagram', cap:true, phone:true },
    reel:     { lbl:'Reels',          one:'Reel',          ratio:'9:16',  ar:9/16,    icon:'ph-play',                net:'Instagram', cap:true, phone:true },
    flier:    { lbl:'Flyers',         one:'Flyer',         ratio:'8.5:11',ar:8.5/11,  icon:'ph-file-text',           net:'Print' },
    site:     { lbl:'Listing site',   one:'Listing site',  ratio:'16:9',  ar:16/9,    icon:'ph-globe',               net:'Web' },
    email:    { lbl:'Emails',         one:'Email',         ratio:'600 px',ar:3/4,     icon:'ph-envelope-simple',     net:'Email' },
    cards:    { lbl:'Business cards', one:'Business card', ratio:'3.5:2', ar:3.5/2,   icon:'ph-identification-card', net:'Print' },
    signs:    { lbl:'Yard signs',     one:'Yard sign',     ratio:'24:18', ar:24/18,   icon:'ph-signpost',            net:'Print' }
  };
  const SOC = [
    { k:'ig', icon:'ph-instagram-logo', name:'Instagram', on:true },
    { k:'tt', icon:'ph-tiktok-logo',    name:'TikTok',    on:true },
    { k:'fb', icon:'ph-facebook-logo',  name:'Facebook',  on:false },
    { k:'li', icon:'ph-linkedin-logo',  name:'LinkedIn',  on:false }
  ];
  function esc(s){ return (s||'').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }
  function toast(t, d){ if(window.sonner) sonner(t, d); else console.warn('[tplpv] sonner unavailable: ' + t); }
  function addr(){
    const el = document.querySelector('[data-nfaddr]');
    const v = el && (el.textContent || '').trim();
    if(!v){ console.warn('[tplpv] no [data-nfaddr] in the DOM — falling back to "this listing"'); return 'this listing'; }
    return v;
  }
  function siteUrl(a){ return a.toLowerCase().replace(/[^a-z0-9]/g, '') + '.melsites.com'; }
  function cardOf(key){ return document.querySelector('.msafcard--tpl[data-nftpl="' + key + '"]'); }
  function nameOf(card){
    const n = card && card.querySelector('.msafcard-addr');
    return (n && n.textContent.trim()) || 'Template';
  }
  function captionOf(a){
    return 'Just listed at ' + a + '. Full photo tour and details are on the listing site — ' +
           'DM "TOUR" and I\'ll send the link. #justlisted';
  }

  /* ---------- what to show ---------- */
  function groupsAll(){
    const by = (window.__pkgPicksByFormat && window.__pkgPicksByFormat()) || null;
    if(by){
      return Object.keys(by).filter(f => FMT[f] && (by[f] || []).length)
        .map(f => ({ fmt:f, keys:by[f].slice() }));
    }
    console.warn('[tplpv] __pkgPicksByFormat unavailable — grouping every pick under Posts');
    const keys = (window.__pkgPickedKeys && window.__pkgPickedKeys()) || [];
    return keys.length ? [{ fmt:'post', keys:keys }] : [];
  }
  function groupsOne(card){
    const active = document.querySelector('.msaf-tab.on[data-nfformat], .msaf-moreitem.on[data-nfformat]');
    let f = active && active.dataset.nfformat;
    if(!FMT[f]) f = ((card.dataset.nfformats || '').split(/\s+/).filter(x => FMT[x])[0]) || 'post';
    return [{ fmt:f, keys:[card.dataset.nftpl] }];
  }

  /* ---------- dialog ---------- */
  let host = null, groups = [], cur = { g:0, i:0 }, lastFocus = null;
  const FOCUSABLE = 'button:not([disabled]),[href],input,select,textarea,[tabindex]:not([tabindex="-1"])';
  function close(){
    if(!host) return;
    host.remove(); host = null;
    document.removeEventListener('keydown', onKey);
    if(lastFocus && lastFocus.isConnected && lastFocus.focus) lastFocus.focus();
    lastFocus = null;
  }
  function onKey(e){
    if(!host) return;
    if(e.key === 'Escape'){ e.stopPropagation(); close(); return; }
    if(e.key !== 'Tab') return;
    const f = Array.prototype.filter.call(host.querySelectorAll(FOCUSABLE), el => el.offsetParent !== null);
    if(!f.length){ console.warn('[tplpv] no focusable control in the dialog'); return; }
    const first = f[0], last = f[f.length - 1], a = document.activeElement;
    if(e.shiftKey && (a === first || !host.contains(a))){ e.preventDefault(); last.focus(); }
    else if(!e.shiftKey && (a === last || !host.contains(a))){ e.preventDefault(); first.focus(); }
  }

  function railHTML(){
    const total = groups.reduce((n, g) => n + g.keys.length, 0);
    let h = '<div class="mstpvw-eyebrow">Package · ' + esc(addr()) + '</div>';
    groups.forEach((g, gi) => {
      const m = FMT[g.fmt], on = gi === cur.g;
      const lbl = g.keys.length > 1 || m.lbl !== m.one ? m.lbl + ' · ' + g.keys.length : m.lbl;
      h += '<button class="mstpvw-navitem' + (on ? ' on' : '') + '" type="button" data-pvg="' + gi + '"' +
           (on ? ' aria-current="true"' : '') + '><i class="ph ' + m.icon + '" aria-hidden="true"></i>' +
           '<span>' + esc(lbl) + '</span></button>';
      if(on && g.keys.length > 1){
        g.keys.forEach((k, ii) => {
          h += '<button class="mstpvw-sub' + (ii === cur.i ? ' on' : '') + '" type="button" ' +
               'data-pvg="' + gi + '" data-pvi="' + ii + '"><span>' + esc(nameOf(cardOf(k))) + '</span></button>';
        });
      }
    });
    h += '<div class="mstpvw-railfoot">Ready to share · ' + total + ' of ' + total + '</div>';
    return h;
  }

  function sideHTML(m, a, fmt){
    const socs = SOC.map(s =>
      '<button class="mstpvw-soc' + (s.on ? '' : ' off') + '" type="button" data-pvsoc="' + s.k + '" ' +
      'aria-pressed="' + (s.on ? 'true' : 'false') + '" ' +
      'title="' + s.name + (s.on ? ' — connected' : ' — connect') + '" ' +
      'aria-label="' + s.name + (s.on ? ' — connected' : ' — connect') + '">' +
      '<i class="ph ' + s.icon + '" aria-hidden="true"></i></button>').join('');
    const on = SOC.filter(s => s.on).map(s => s.name).join(', ');
    const off = SOC.filter(s => !s.on).map(s => s.name).join(', ');
    const social = !!m.cap;
    return '<div class="mstpvw-sidehead"><div class="mstpvw-sidettl">' +
        (social ? 'Share to' : 'Send out') + '</div>' +
        '<button class="mstpvw-close" type="button" data-pvclose="1" title="Close preview" ' +
        'aria-label="Close preview"><i class="ph ph-x" aria-hidden="true"></i></button></div>' +
      (social
        ? '<div class="mstpvw-socials">' + socs + '</div>' +
          '<div class="mstpvw-note" id="mstpvw-desc">' + esc(on) + ' connected · ' + esc(off) + ' need connecting</div>' +
          '<button class="mstpvw-btn primary" type="button" data-pvact="share">Share now</button>' +
          '<button class="mstpvw-btn outline" type="button" data-pvact="sched">Schedule…</button>'
        : '<div class="mstpvw-note" id="mstpvw-desc">' + esc(m.one) + ' · ' + esc(m.net) + ' output at ' + esc(m.ratio) + '</div>' +
          '<button class="mstpvw-btn primary" type="button" data-pvact="download">Download</button>' +
          '<button class="mstpvw-btn outline" type="button" data-pvact="print">Send to print</button>') +
      (fmt === 'site'
        ? '<div class="mstpvw-sect"><div class="mstpvw-sidettl">Listing site</div>' +
          '<div class="mstpvw-url"><span class="mstpvw-urltxt">' + esc(siteUrl(a)) + '</span>' +
          '<button class="mstpvw-copy" type="button" data-pvact="copy">Copy</button></div>' +
          '<button class="mstpvw-btn outline sm" type="button" data-pvact="client">Send to client</button></div>'
        : '');
  }

  function fillStage(stage, card, w, h, mode){
    const src = card && card.querySelector('.msafcard-photo');
    if(!src){ console.warn('[tplpv] ' + (card && card.dataset.nftpl) + ' has no .msafcard-photo to render'); return; }
    const r = src.getBoundingClientRect();
    const sw = r.width || 300, sh = r.height || 375;
    /* one uniform scale in both axes — the artwork is never stretched.
       contain: whole render visible.  cover: fills the box, edges crop. */
    const k = mode === 'cover' ? Math.max(w / sw, h / sh) : Math.min(w / sw, h / sh);
    const clone = src.cloneNode(true);
    clone.removeAttribute('aria-hidden');
    clone.querySelectorAll('.msafcard-tplhover,.msaf-favbtn,.msafcard-status,.msafcard-melbadge')
      .forEach(n => n.remove());
    clone.style.cssText += ';width:' + sw + 'px;height:' + sh + 'px;transform:scale(' + k + ');' +
      'left:' + ((w - sw * k) / 2) + 'px;top:' + ((h - sh * k) / 2) + 'px';
    stage.appendChild(clone);
  }

  /* ---------- device frames ----------
     One language for both: a neutral grey frame (1px border, chrome strip, card radius),
     never a photographic bezel — the frame must not compete with the render inside it.
     Each surface is a grey skeleton laid out at a design width and uniformly scaled. */
  const PHONE = { ref:320, ar:320/660, chrome:26 };   /* screen design px + chrome strip */
  const WEB_REF = 1180;
  const PHONE_FMT = { post:1, carousel:1, story:1, reel:1, email:1 };

  /* returns the skeleton HTML for one surface; the .skart slot carries its own design px size */
  function surface(fmt, refW, refH, cap){
    if(fmt === 'reel' || fmt === 'story'){
      return '<div class="skart" style="width:' + refW + 'px;height:' + refH + 'px;background:var(--neutral-900,#171717)"></div>' +
        '<div class="skfull"><div class="skscrim"></div>' +
        (fmt === 'story'
          ? '<div class="skprog"><span class="on"></span><span></span><span></span></div>' +
            '<div class="skhead"><span class="skav"></span><span class="skbar" style="width:88px"></span></div>'
          : '<div class="skrail"><span></span><span></span><span></span><span></span></div>') +
        '<div class="skover"><div style="display:flex;align-items:center;gap:8px">' +
        '<span class="skav"></span><span class="skbar" style="width:76px"></span></div>' +
        '<div class="skovcap">' + esc(cap) + '</div></div></div>';
    }
    if(fmt === 'email'){
      const artH = Math.round(Math.max(160, Math.min(refW * 0.62, refH - 290)));
      return '<div class="skpad" style="height:20px"></div>' +
        '<div class="skrow" style="height:34px"><span class="skic"></span><span class="skgrow"></span>' +
        '<span class="skdot"></span><span class="skdot"></span></div>' +
        '<div class="skrow" style="height:30px"><span class="skbar" style="width:186px;height:12px"></span></div>' +
        '<div class="skrow" style="height:44px"><span class="skav"></span>' +
        '<span class="skcol"><span class="skbar" style="width:118px"></span>' +
        '<span class="skbar thin" style="width:74px"></span></span></div>' +
        '<div class="skart" style="width:' + refW + 'px;height:' + artH + 'px"></div>' +
        '<div class="sklines"><span class="skbar" style="width:100%"></span>' +
        '<span class="skbar" style="width:92%"></span><span class="skbar thin" style="width:64%"></span>' +
        '<span class="skpill" style="margin-top:6px"></span></div>';
    }
    if(fmt === 'site'){
      const wide = refW > 600;
      const navH = wide ? 54 : 44;
      const artH = Math.round(refH - navH - (wide ? 0 : 40));
      return (wide ? '' : '<div class="skpad" style="height:20px"></div>') +
        '<div class="sknav" style="height:' + navH + 'px;padding:0 ' + (wide ? 24 : 12) + 'px">' +
        '<span class="skbar" style="width:' + (wide ? 104 : 84) + 'px;height:12px"></span><span class="skgrow"></span>' +
        (wide ? '<span class="skbar" style="width:52px"></span><span class="skbar" style="width:52px"></span>' +
                '<span class="skbar" style="width:52px"></span><span class="skpill"></span>'
              : '<span class="skic"></span>') + '</div>' +
        '<div class="skart" data-fit="contain" style="width:' + refW + 'px;height:' + artH + 'px"></div>';
    }
    /* feed post / carousel */
    const chrome = 20 + 34 + 44 + 34 + 64 + 44;
    const artH = Math.round(Math.max(180, Math.min(refW * 1.25, refH - chrome)));
    return '<div class="skpad" style="height:20px"></div>' +
      '<div class="skrow" style="height:34px"><span class="skbar" style="width:70px;height:12px"></span>' +
      '<span class="skgrow"></span><span class="skdot"></span><span class="skdot"></span></div>' +
      '<div class="skrow" style="height:44px"><span class="skav"></span>' +
      '<span class="skcol"><span class="skbar" style="width:96px"></span>' +
      '<span class="skbar thin" style="width:58px"></span></span><span class="skgrow"></span>' +
      '<span class="skdot"></span></div>' +
      '<div class="skart" style="width:' + refW + 'px;height:' + artH + 'px"></div>' +
      '<div class="skrow" style="height:34px"><span class="skic"></span><span class="skic"></span>' +
      '<span class="skic"></span><span class="skgrow"></span><span class="skic"></span></div>' +
      '<div class="skcap">' + esc(cap) + '</div>' +
      '<div class="sktabs"><span></span><span></span><span></span><span></span><span></span></div>';
  }

  function paintBody(){
    if(!host) return;
    const g = groups[cur.g], m = FMT[g.fmt], key = g.keys[cur.i], card = cardOf(key), a = addr();
    const name = nameOf(card);
    host.querySelector('.mstpvw-rail').innerHTML = railHTML();
    host.querySelector('.mstpvw-side').innerHTML = sideHTML(m, a, g.fmt);
    host.querySelector('.mstpvw-title').textContent = name + ' · ' + m.one + ' · ' + m.ratio;

    const body = host.querySelector('.mstpvw-body');
    const cap = captionOf(a);
    const isSite = g.fmt === 'site';
    const phone = isSite ? cur.dev === 'mobile' : !!PHONE_FMT[g.fmt];
    const toggle = isSite
      ? '<div class="mstpvw-devtoggle" role="group" aria-label="Preview device">' +
        '<button class="mstpvw-dev' + (phone ? '' : ' on') + '" type="button" data-pvdev="desktop" ' +
        'aria-pressed="' + (phone ? 'false' : 'true') + '">' +
        '<i class="ph ph-monitor" aria-hidden="true"></i>Desktop</button>' +
        '<button class="mstpvw-dev' + (phone ? ' on' : '') + '" type="button" data-pvdev="mobile" ' +
        'aria-pressed="' + (phone ? 'true' : 'false') + '">' +
        '<i class="ph ph-device-mobile" aria-hidden="true"></i>Mobile</button></div>'
      : '';
    const br = body.getBoundingClientRect();
    const availW = Math.max(160, br.width - 40);
    const availH = Math.max(200, br.height - 40 - (toggle ? 44 : 0));

    if(phone){
      /* same fit as the browser window: the frame fills the pane, the render scales into it */
      let sh = Math.max(160, availH - PHONE.chrome - 2), sw = sh * PHONE.ar;
      if(sw > availW - 2){ sw = availW - 2; sh = sw / PHONE.ar; }
      sw = Math.round(sw); sh = Math.round(sh);
      const k = sw / PHONE.ref, refH = Math.round(sh / k);
      body.innerHTML = toggle +
        '<div class="mstpvw-device" style="width:' + (sw + 2) + 'px">' +
          '<div class="mstpvw-devchrome"><span class="mstpvw-notch"></span></div>' +
          '<div class="mstpvw-screen" style="position:relative;width:' + sw + 'px;height:' + sh + 'px">' +
            '<div class="mstpvw-scr' + (g.fmt === 'reel' || g.fmt === 'story' ? ' dark' : '') +
              '" style="width:' + PHONE.ref + 'px;height:' + refH + 'px;transform:scale(' + k + ')">' +
              surface(g.fmt, PHONE.ref, refH, cap) + '</div>' +
          '</div></div>';
    } else if(isSite){
      /* the window fills the pane; the page render is contain-fit inside the viewport */
      const vw = Math.round(availW), vh = Math.round(availH - 36);
      const k = vw / WEB_REF, refH = Math.round(vh / k);
      body.innerHTML = toggle +
        '<div class="mstpvw-browser" style="width:' + Math.round(vw) + 'px">' +
          '<div class="mstpvw-chrome"><span class="mstpvw-dots"><span></span><span></span><span></span></span>' +
          '<span class="mstpvw-chromeurl">' + esc(siteUrl(a)) + '</span></div>' +
          '<div class="mstpvw-screen" style="position:relative;width:' + Math.round(vw) + 'px;height:' +
            Math.round(vh) + 'px">' +
            '<div class="mstpvw-scr" style="width:' + WEB_REF + 'px;height:' + refH +
              'px;transform:scale(' + k + ')">' + surface('site', WEB_REF, refH, cap) + '</div>' +
          '</div></div>';
    } else {
      /* print formats: no device \u2014 the artwork's own aspect on a plain card, contain-fit */
      const src = card && card.querySelector('.msafcard-photo');
      const r = src && src.getBoundingClientRect();
      const ar = (r && r.width && r.height) ? r.width / r.height : m.ar;
      let h = availH, w = h * ar;
      if(w > availW){ w = availW; h = w / ar; }
      body.innerHTML = '<div class="mstpvw-stage" style="width:' + Math.round(w) + 'px;height:' +
        Math.round(h) + 'px"></div>';
      fillStage(body.querySelector('.mstpvw-stage'), card, Math.round(w), Math.round(h), 'contain');
      return;
    }
    const art = body.querySelector('.skart');
    if(!art){ console.warn('[tplpv] no .skart slot in the ' + g.fmt + ' skeleton'); return; }
    const aw = parseFloat(art.style.width), ah = parseFloat(art.style.height);
    if(!aw || !ah){ console.warn('[tplpv] .skart has no size for ' + g.fmt); return; }
    fillStage(art, card, aw, ah, art.dataset.fit || 'cover');
  }

  function open(gs){
    if(!gs.length){ console.warn('[tplpv] nothing picked — dialog not opened'); return; }
    const opener = document.activeElement;
    close();
    lastFocus = opener;
    groups = gs; cur = { g:0, i:0, dev:'desktop' };
    host = document.createElement('div');
    host.className = 'mstpvw';
    host.innerHTML =
      '<div class="mstpvw-overlay" data-pvclose="1"></div>' +
      '<div class="mstpvw-content" role="dialog" aria-modal="true" aria-labelledby="mstpvw-ttl" ' +
        'aria-describedby="mstpvw-desc">' +
        '<nav class="mstpvw-rail" aria-label="Package contents"></nav>' +
        '<div class="mstpvw-main">' +
          '<div class="mstpvw-head"><h2 class="mstpvw-title" id="mstpvw-ttl"></h2>' +
            '<button class="mstpvw-headbtn" type="button" data-pvact="editor">Open in editor</button></div>' +
          '<div class="mstpvw-body"></div>' +
        '</div>' +
        '<aside class="mstpvw-side" aria-label="Share"></aside>' +
      '</div>';
    document.body.appendChild(host);
    paintBody();
    document.addEventListener('keydown', onKey);
    const c = host.querySelector('.mstpvw-close'); if(c) c.focus();
  }

  document.addEventListener('click', e => {
    if(!host || !host.contains(e.target)) return;
    if(e.target.closest('[data-pvclose]')){ close(); return; }
    const dev = e.target.closest('[data-pvdev]');
    if(dev){ cur.dev = dev.dataset.pvdev; paintBody(); return; }
    const nav = e.target.closest('[data-pvg]');
    if(nav){
      const gi = +nav.dataset.pvg, ii = nav.dataset.pvi != null ? +nav.dataset.pvi : (gi === cur.g ? cur.i : 0);
      cur = { g:gi, i:ii, dev:cur.dev };
      paintBody();
      return;
    }
    const soc = e.target.closest('[data-pvsoc]');
    if(soc){
      const s = SOC.filter(x => x.k === soc.dataset.pvsoc)[0];
      if(!s){ console.warn('[tplpv] unknown network ' + soc.dataset.pvsoc); return; }
      toast(s.on ? s.name + ' selected' : 'Connect ' + s.name,
            s.on ? 'This asset will post to your connected account' : 'Takes you to Settings · Connected accounts');
      return;
    }
    const act = e.target.closest('[data-pvact]');
    if(!act) return;
    const g = groups[cur.g], m = FMT[g.fmt], name = nameOf(cardOf(g.keys[cur.i])), a = addr();
    switch(act.dataset.pvact){
      case 'editor':
        close();
        const go = document.getElementById('msaf-package-btn');
        if(go) go.click(); else console.warn('[tplpv] no #msaf-package-btn — nothing to open');
        break;
      case 'share':    toast('Share queued', name + ' · ' + m.one + ' → Instagram, TikTok'); break;
      case 'sched':    toast('Schedule this ' + m.one.toLowerCase(), 'Pick a date and time in the editor'); break;
      case 'download': toast('Downloading', name + ' · ' + m.one + ' at ' + m.ratio); break;
      case 'print':    toast('Sent to print', name + ' · ' + m.one + ' — proof in your inbox'); break;
      case 'client':   toast('Sent to client', siteUrl(a) + ' shared with the ' + a + ' contacts'); break;
      case 'copy':
        const url = 'https://' + siteUrl(a);
        const done = () => toast('Link copied', siteUrl(a));
        if(navigator.clipboard && navigator.clipboard.writeText){
          navigator.clipboard.writeText(url).then(done, err => {
            console.warn('[tplpv] clipboard blocked: ' + err); done();
          });
        } else { console.warn('[tplpv] clipboard API unavailable'); done(); }
        break;
      default: console.warn('[tplpv] unhandled action ' + act.dataset.pvact);
    }
  });

  let rt = null;
  window.addEventListener('resize', () => {
    if(!host) return;
    clearTimeout(rt);
    rt = setTimeout(paintBody, 120);
  });

  window.MELTPLPV = {
    openAll(){ open(groupsAll()); },
    openOne(card){
      if(!card){ console.warn('[tplpv] openOne called without a card'); return; }
      open(groupsOne(card));
    },
    close: close
  };
})();
