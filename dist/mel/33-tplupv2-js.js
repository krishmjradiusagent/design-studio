/* Upload template — v2 screen. Replaces the old .msup conversation UI.

   It is NOT a popup and NOT a separate page: on open the panel is moved into the
   Marketing Studio templates card (.msnfs[data-nf="templates"] .msaf) and fills it with
   position:absolute, so the CRM sidebar and the studio frame stay exactly where they were.
   mel/27 still owns every trigger ([data-msupload], [data-upstart], #msaf-upload-btn);
   its openUp() hands off to window.MELTPLUP.open(). Loads last so the hook exists first. */
(function(){
  var $ = function(id){ return document.getElementById(id); };
  function panel(){ return $('msaf-upv2'); }
  function host(){ return document.querySelector('.msnfs[data-nf="templates"] .msaf'); }

  /* The studio's floating "Build listing package" bar sits in the same card the upload panel
     takes over, and the CSS rule (body.upv2-on …) was not winning in the live page, so it showed
     through the panel's own footer. Hide it inline on open, restore on close — no cascade to lose. */
  function bars(){ return document.querySelectorAll('.msaf-actionwrap'); }
  function hideBars(on){
    var n = bars();
    if(!n.length){ console.warn('[upv2] studio action bar not found — nothing to hide'); return; }
    n.forEach(function(b){ b.style.display = on ? 'none' : ''; });
  }

  function mount(){
    var p = panel();
    if(!p){ console.warn('[upv2] panel markup missing — #msaf-upv2 not in the document'); return null; }
    var h = host();
    if(h){ if(p.parentNode !== h) h.appendChild(p); }
    else console.warn('[upv2] templates card not found — panel stays where it mounted');
    return p;
  }

  /* Stage 1 is the dialog. Only one alternate source now: a pasted link. */
  function showRow(kind){
    var url = $('upv2-urlrow');
    if(!url){ console.warn('[upv2] url row missing — paste-a-link dead'); return; }
    url.hidden = kind !== 'url';
    if(!url.hidden){ var f = $('upv2-url'); if(f) f.focus(); }
  }

  /* back to stage 1: dialog on the templates card, nothing read yet */
  function reset(){
    var p = panel(); if(!p) return;
    p.classList.remove('has-file');
    var art = $('upv2-art');
    if(art){ art.style.backgroundImage = ''; art.classList.remove('has-img'); }
    var url = $('upv2-urlrow'), f = $('upv2-url');
    if(url) url.hidden = true;
    if(f) f.value = '';
  }

  /* dialog → canvas takeover */
  function toStage2(){
    var p = panel(); if(!p) return;
    p.classList.add('has-file');
  }

  function pick(){
    var i = $('upv2-file');
    if(!i){ console.warn('[upv2] file input missing'); return; }
    i.value = ''; i.click();
  }

  function paint(src, label){
    var art = $('upv2-art');
    if(!art){ console.warn('[upv2] preview frame missing'); return; }
    art.style.backgroundImage = "url('" + src + "')";
    art.classList.add('has-img');
    toStage2();
    if(window.sonner) sonner('Mel read your template', (label || 'Your design') + ' \u00b7 headline, type and palette pulled out');
    else console.warn('[upv2] sonner missing, no confirmation shown');
  }

  /* PDF: rendered in-browser with pdf.js (lazy-loaded once). Every page is classified by its
     aspect ratio so a multi-template PDF (post + story + flyer…) is understood page by page. */
  var PDFJS = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/legacy/build/';
  var pdfReady = null;
  function loadPdfJs(){
    if(window.pdfjsLib) return Promise.resolve(window.pdfjsLib);
    if(pdfReady) return pdfReady;
    pdfReady = new Promise(function(res, rej){
      var s = document.createElement('script');
      s.src = PDFJS + 'pdf.min.js';
      s.onload = function(){
        if(!window.pdfjsLib){ rej(new Error('pdfjsLib missing after load')); return; }
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS + 'pdf.worker.min.js';
        res(window.pdfjsLib);
      };
      s.onerror = function(){ pdfReady = null; rej(new Error('pdf.js failed to load')); };
      document.head.appendChild(s);
    });
    return pdfReady;
  }
  function kindOf(w, h){
    var r = w / h;
    if(Math.abs(r - 9/16) < 0.04) return 'Story';
    if(Math.abs(r - 1) < 0.04) return 'Square post';
    if(Math.abs(r - 4/5) < 0.04) return 'Portrait post';
    if(Math.abs(r - 8.5/11) < 0.03 || Math.abs(r - 1/Math.SQRT2) < 0.03) return 'Flyer';
    if(r > 1.6) return 'Banner';
    return r > 1 ? 'Landscape' : 'Portrait';
  }
  function renderPage(pdf, n, maxW){
    return pdf.getPage(n).then(function(pg){
      var vp1 = pg.getViewport({ scale: 1 });
      var vp = pg.getViewport({ scale: Math.min(2, maxW / vp1.width) });
      var c = document.createElement('canvas');
      c.width = Math.round(vp.width); c.height = Math.round(vp.height);
      return pg.render({ canvasContext: c.getContext('2d'), viewport: vp }).promise.then(function(){
        return { n: n, w: vp1.width, h: vp1.height, kind: kindOf(vp1.width, vp1.height), src: c.toDataURL('image/jpeg', 0.86) };
      });
    });
  }
  function takePdf(f){
    if(window.sonner) sonner('Reading ' + f.name, 'Mel is opening every page');
    f.arrayBuffer().then(function(buf){
      return loadPdfJs().then(function(lib){ return lib.getDocument({ data: buf }).promise; });
    }).then(function(pdf){
      var jobs = [];
      for(var i = 1; i <= Math.min(pdf.numPages, 12); i++) jobs.push(renderPage(pdf, i, 1100));
      return Promise.all(jobs).then(function(pages){ return { pdf: pdf, pages: pages }; });
    }).then(function(r){
      var pages = r.pages;
      window.MELTPLUP = window.MELTPLUP || {};
      window.MELTPLUP.pages = pages;
      var counts = {};
      pages.forEach(function(p){ counts[p.kind] = (counts[p.kind] || 0) + 1; });
      var summary = Object.keys(counts).map(function(k){ return counts[k] + ' ' + k.toLowerCase() + (counts[k] > 1 ? 's' : ''); }).join(', ');
      paint(pages[0].src, f.name);
      if(window.sonner) sonner(r.pdf.numPages + (r.pdf.numPages > 1 ? ' pages' : ' page') + ' found', summary + (r.pdf.numPages > 12 ? ' \u00b7 first 12 read' : ''));
    }).catch(function(e){
      console.warn('[upv2] PDF read failed: ' + (e && e.message || e));
      if(window.sonner) sonner('Couldn\u2019t open ' + f.name, 'The PDF may be protected or damaged. Try exporting it again, or upload a PNG.');
    });
  }

  function takeFile(f){
    if(!f) return;
    var isPdf = f.type === 'application/pdf' || /\.pdf$/i.test(f.name || '');
    if(isPdf){ takePdf(f); return; }
    if(!/^image\//.test(f.type || '')){
      console.warn('[upv2] unsupported file type: ' + (f.type || f.name));
      if(window.sonner) sonner('Can\u2019t read ' + f.name, 'Upload a PNG, JPG or PDF.');
      return;
    }
    var r = new FileReader();
    r.onload = function(){ paint(r.result, f.name); };
    r.onerror = function(){ console.warn('[upv2] could not read ' + f.name); };
    r.readAsDataURL(f);
  }

  function fontName(){
    var n = $('upv2-fontname');
    return (n && n.textContent.trim()) || 'your font';
  }
  function palName(){
    var p = panel();
    var on = p && p.querySelector('[data-upv2pal].on');
    return (on && (on.dataset.palname || '')) || 'your palette';
  }
  function logoLabel(){
    var p = panel();
    var on = p && p.querySelector('[data-upv2logo].on');
    var nm = on && on.querySelector('.upv2-optnm');
    return ((nm && nm.textContent) || 'wordmark').toLowerCase();
  }
  /* one option in a group wins; the group is whichever data-attr the button carries */
  function selectOne(btn, attr){
    var p = panel(); if(!p) return;
    p.querySelectorAll('[' + attr + ']').forEach(function(b){
      b.classList.toggle('on', b === btn);
      b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
    });
  }

  /* one card into the gallery, cloned off the hidden prototype the gallery ships */
  function saveCard(withEdits){
    var proto = document.querySelector('.msafcard--up'), grid = $('msnf-tplgrid');
    if(!proto || !grid){ console.warn('[upv2] gallery prototype or grid missing — nothing saved'); return null; }
    var card = proto.cloneNode(true);
    card.classList.remove('msafcard--up');
    card.hidden = false;
    card.dataset.nftpl = 'up-' + Date.now();
    card.dataset.nfcat = 'Uploaded';          /* drives the "Your templates" tab + Mel meta styling */
    var hl = $('upv2-headline');
    var name = ((hl && hl.textContent) || '').replace(/[\u201c\u201d"]/g, '').trim() || 'Your template';
    card.setAttribute('aria-label', name);
    var addr = card.querySelector('.msafcard-addr');
    if(addr) addr.textContent = name;
    var art = $('upv2-art'), ph = card.querySelector('.prev .ph');
    if(ph && art && art.style.backgroundImage) ph.style.backgroundImage = art.style.backgroundImage;
    var loc = card.querySelector('.msafcard-loc span');
    if(loc) loc.textContent = withEdits
      ? 'Your upload \u00b7 ' + palName() + ' \u00b7 ' + logoLabel() + ' logo'
      : 'Your upload \u00b7 exactly as you sent it';
    var hint = card.querySelector('.msafcard-hinttx');
    if(hint) hint.textContent = 'Mel matched ' + fontName() + ', your logo and palette';
    var first = grid.querySelector('.msafcard--tpl');
    if(first) grid.insertBefore(card, first); else grid.appendChild(card);
    return name;
  }

  function open(start){
    var p = mount(); if(!p) return;
    reset();
    p.classList.add('open');
    p.setAttribute('aria-hidden', 'false');
    document.body.classList.add('upv2-on');
    hideBars(true);
    if(start === 'link') showRow('url');
    else if(start === 'image' || start === 'brand' || start === 'file') setTimeout(pick, 300);
  }
  function close(){
    var p = panel(); if(!p) return;
    p.classList.remove('open');
    p.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('upv2-on');
    hideBars(false);
    reset();
  }
  function isOpen(){ var p = panel(); return !!p && p.classList.contains('open'); }

  window.MELTPLUP = { open: open, close: close, isOpen: isOpen };

  document.addEventListener('click', function(e){
    var t = e.target; if(!t || !t.closest) return;
    if(!isOpen()) return;
    if(!t.closest('#msaf-upv2')) return;

    if(t.closest('#upv2-back')){ close(); return; }
    if(t.closest('#upv2-dlgx') || t.closest('#upv2-dlgcancel') || t.closest('#upv2-dlgscrim')){ close(); return; }

    var show = t.closest('[data-upv2show]');
    if(show){ showRow(show.dataset.upv2show); return; }

    if(t.closest('#upv2-replace') || t.closest('#upv2-frame') || t.closest('#upv2-drop')){ pick(); return; }

    /* one in-place editor for every read-out: headline, caption, font name */
    var ed = t.closest('[data-upv2edit]');
    if(ed){
      var tgt = $(ed.dataset.upv2edit);
      var row = tgt && (tgt.classList.contains('upv2-ftext') ? tgt : (tgt.closest('.upv2-fval') || tgt));
      if(!row){ console.warn('[upv2] nothing to edit for #' + ed.dataset.upv2edit); return; }
      row.setAttribute('contenteditable', 'true');
      row.focus();
      var multi = row.classList.contains('upv2-ftext');
      var sel = window.getSelection(), rg = document.createRange();
      rg.selectNodeContents(row);
      if(multi) rg.collapse(false);           /* caption: caret at the end, don't nuke the draft */
      sel.removeAllRanges(); sel.addRange(rg);
      row.addEventListener('blur', function done(){
        row.removeAttribute('contenteditable');
        row.removeEventListener('blur', done);
      });
      row.addEventListener('keydown', function key(e){
        if(e.key === 'Enter' && !(multi && e.shiftKey)){
          e.preventDefault(); row.blur(); row.removeEventListener('keydown', key);
        }
      });
      return;
    }

    if(t.closest('#upv2-logoupload')){
      var li = $('upv2-logofile');
      if(!li){ console.warn('[upv2] logo input missing'); return; }
      li.value = ''; li.click();
      return;
    }

    var lg = t.closest('[data-upv2logo]');
    if(lg){
      selectOne(lg, 'data-upv2logo');
      var ln = $('upv2-logoname');
      var lnm = lg.querySelector('.upv2-optnm');
      if(ln && lnm) ln.textContent = 'Crestview Realty \u00b7 ' + lnm.textContent.toLowerCase();
      return;
    }

    var pl = t.closest('[data-upv2pal]');
    if(pl){
      selectOne(pl, 'data-upv2pal');
      var pn = $('upv2-palname');
      if(pn) pn.textContent = pl.dataset.palname || '';
      return;
    }

    if(t.closest('#upv2-urlgo')){
      var f = $('upv2-url');
      var val = f ? f.value.trim() : '';
      if(!val){ if(f) f.focus(); return; }
      toStage2();
      if(window.sonner) sonner('Reading the link', val.replace(/^https?:\/\//, '') + ' \u00b7 layout, type and palette');
      return;
    }

    if(t.closest('#upv2-finalize')){
      var n1 = saveCard(true);
      close();
      if(window.sonner) sonner('Added to the package', (n1 || 'Your template') + ' \u00b7 ' + logoLabel() + ' logo, ' + palName() + ', ' + fontName());
      return;
    }
    if(t.closest('#upv2-keep')){
      var n2 = saveCard(false);
      close();
      if(window.sonner) sonner('Original kept', (n2 || 'Your template') + ' \u00b7 saved exactly as you uploaded it');
      return;
    }
  });

  function takeLogo(f){
    if(!f) return;
    var p = panel(); if(!p) return;
    var tile = p.querySelector('[data-upv2logo].on') || p.querySelector('[data-upv2logo]');
    var art = tile && tile.querySelector('.upv2-logoart');
    if(!art){ console.warn('[upv2] no logo tile to paint'); return; }
    var r = new FileReader();
    r.onload = function(){
      art.style.backgroundImage = "url('" + r.result + "')";
      art.innerHTML = '';
      var nm = tile.querySelector('.upv2-optnm');
      if(nm) nm.textContent = 'Your logo';
      var ln = $('upv2-logoname');
      if(ln) ln.textContent = f.name.replace(/\.[a-z0-9]+$/i, '') + ' \u00b7 uploaded';
      if(window.sonner) sonner('Logo saved', 'Mel will place it on every asset in this package');
    };
    r.onerror = function(){ console.warn('[upv2] could not read logo ' + f.name); };
    r.readAsDataURL(f);
  }

  var fi = null;
  function wireFile(){
    fi = $('upv2-file');
    if(!fi){ return false; }
    fi.addEventListener('change', function(){ takeFile(fi.files && fi.files[0]); });
    var li = $('upv2-logofile');
    if(li) li.addEventListener('change', function(){ takeLogo(li.files && li.files[0]); });
    else console.warn('[upv2] logo file input missing \u2014 logo upload disabled');
    ['upv2-drop','upv2-frame'].forEach(function(id){
      var fr = $(id);
      if(!fr){ console.warn('[upv2] drop target #' + id + ' missing'); return; }
      ['dragenter','dragover'].forEach(function(n){
        fr.addEventListener(n, function(e){ e.preventDefault(); fr.classList.add('drag'); });
      });
      ['dragleave','drop'].forEach(function(n){
        fr.addEventListener(n, function(e){ e.preventDefault(); fr.classList.remove('drag'); });
      });
      fr.addEventListener('drop', function(e){
        var f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
        if(f) takeFile(f);
      });
    });
    return true;
  }
  if(!wireFile()){
    var tries = 0;
    var t = setInterval(function(){
      if(wireFile() || ++tries > 40){
        clearInterval(t);
        if(!fi) console.warn('[upv2] file input never appeared — upload picker disabled');
      }
    }, 120);
  }

  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape' && isOpen()){ close(); return; }
    if((e.key === 'Enter' || e.key === ' ') && isOpen()
       && document.activeElement && document.activeElement.id === 'upv2-drop'){
      e.preventDefault(); pick();
    }
  });
})();
