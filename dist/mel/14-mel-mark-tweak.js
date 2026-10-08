/* Mel mark tweak — swaps every Mel avatar between the infinity mark and the Radius orb. */
(function(){
  var MARKS = {infinity:'assets/mel-icon.svg', orb:'assets/mel-orb.svg'};
  var KEY = 'radius-mel-mark';
  function cur(){ try{ return localStorage.getItem(KEY)==='orb' ? 'orb' : 'infinity'; }catch(e){ return 'infinity'; } }
  function isMel(img){
    if(img.closest && img.closest('.markpick')) return false;
    if(img.dataset && img.dataset.melMark) return true;
    var s = img.getAttribute('src')||'';
    return /mel-icon\.svg|mel-orb\.svg/.test(s) || img.classList.contains('melmark');
  }
  function swap(img, v){
    img.dataset.melMark = '1';
    if(img.getAttribute('src') !== MARKS[v]) img.setAttribute('src', MARKS[v]);
  }
  function applyAll(v){
    document.querySelectorAll('img').forEach(function(img){ if(isMel(img)) swap(img, v); });
    document.querySelectorAll('.markopt').forEach(function(b){ b.classList.toggle('is-on', b.dataset.mark===v); });
    document.body.classList.toggle('mel-orb', v==='orb');
  }
  document.addEventListener('click', function(e){
    var saveBtn = e.target.closest && e.target.closest('#pke-save');
    if(saveBtn){
      if(saveBtn.classList.contains('busy')) return;
      e.stopPropagation();
      var addr = '';
      try{ var pkS = (window.__pkeState && window.__pkeState.prop) || null; if(pkS && pkS.a) addr = pkS.a; }catch(_){ }
      if(!addr){
        try{
          var sub = document.getElementById('pke-sh-sub');
          if(sub && sub.textContent){
            var m = sub.textContent.match(/for\s+(.+)$/);
            if(m && m[1] && !/this listing/i.test(m[1])) addr = m[1].trim();
          }
        }catch(_){ }
      }
      var label = 'Package';
      var wrap = document.querySelector('.sonner');
      if(!wrap){ wrap = document.createElement('div'); wrap.className = 'sonner'; document.body.appendChild(wrap); }
      var t = document.createElement('div');
      t.className = 'snr pkesnr in';
      t.innerHTML = '<svg class="snri" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="40 20"/></svg>' +
        '<div><div class="snrt">Saving to library\u2026</div><div class="snrd"></div></div>' +
        '<span class="snrx">\u2715</span>';
      var ico = t.querySelector('.snri'); ico.style.animation = 'pkspin .8s linear infinite';
      var dEl = t.querySelector('.snrd'); dEl.textContent = label + (addr ? ' \u00b7 ' + addr : '');
      var killed = false;
      var kill = function(){ if(killed) return; killed = true; t.classList.remove('in'); setTimeout(function(){ if(t && t.parentNode) t.remove(); }, 180); };
      t.querySelector('.snrx').onclick = kill;
      wrap.appendChild(t);
      saveBtn.classList.add('busy');
      setTimeout(function(){
        try{ if(window.MSLIB && window.MSLIB.save){ var propArg = (window.__pkeState && window.__pkeState.prop) || { a: addr || 'Listing', ph:'#dcd6c9' }; window.MSLIB.save(propArg, label); } }catch(_){ }
        saveBtn.classList.remove('busy');
        if(killed) return;
        var i2 = t.querySelector('.snri'); if(i2){ i2.style.animation=''; i2.outerHTML = '<svg class="snri done" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>'; }
        t.querySelector('.snrt').textContent = 'Saved to library';
        var body = t.querySelector('.snrd'); body.innerHTML = '';
        var meta = document.createElement('span'); meta.textContent = label + (addr ? ' \u00b7 ' + addr : ''); meta.style.marginRight = '10px';
        var view = document.createElement('a'); view.href = '#'; view.className = 'snrlink'; view.textContent = 'View';
        view.onclick = function(ev){ ev.preventDefault(); kill(); var nav = document.getElementById('ms-navlib'); if(nav) nav.click(); };
        body.appendChild(meta); body.appendChild(view);
        setTimeout(kill, 4400);
      }, 720);
      return;
    }
    var sMenu = document.getElementById('pke-schedmenu');
    var sModal = document.getElementById('pke-schedmodal');
    if(e.target.closest && e.target.closest('#pke-sendmenu')){
      e.stopPropagation();
      if(sMenu){ sMenu.classList.toggle('open'); }
      return;
    }
    var schedItem = e.target.closest && e.target.closest('.pkeschedmenu .itm');
    if(schedItem){
      var kind = schedItem.dataset.schedule;
      if(sMenu) sMenu.classList.remove('open');
      if(kind === 'custom'){
        if(sModal){
          var now = new Date();
          var d = document.getElementById('pke-sdate'), t = document.getElementById('pke-stime');
          if(d && !d.value){ var iso = new Date(now.getTime() - now.getTimezoneOffset()*60000).toISOString().slice(0,10); d.value = iso; }
          if(t && !t.value){ t.value = '09:00'; }
          sModal.classList.add('open');
        }
      } else {
        if(window.sonner) sonner('Post scheduled', schedItem.textContent.replace(/\s+/g,' ').trim());
      }
      return;
    }
    if(sMenu && sMenu.classList.contains('open') && !e.target.closest('#pke-schedmenu') && !e.target.closest('#pke-sendmenu')){
      sMenu.classList.remove('open');
    }
    if(e.target.closest && (e.target.closest('#pke-schedclose') || e.target.closest('#pke-schedcancel') || e.target.closest('.pkeschedscrim'))){
      if(sModal) sModal.classList.remove('open');
    }
    if(e.target.closest && e.target.closest('#pke-schedgo')){
      var dv = document.getElementById('pke-sdate'), tv = document.getElementById('pke-stime');
      var when = (dv && dv.value ? dv.value : '') + (tv && tv.value ? ' \u00b7 ' + tv.value : '');
      if(window.sonner) sonner('Post scheduled', when || 'Choose a date and time');
      if(sModal) sModal.classList.remove('open');
    }
    if(e.target.closest && e.target.closest('#pke-sendnow')){
      /* handled by the Instagram connect modal at the end of body */
    }
    if(e.target.closest && e.target.closest('#pke-sbtoggle')){
      var app = document.querySelector('.app');
      if(app){ app.classList.toggle('collapsed'); }
    }
    if(e.target.closest && e.target.closest('#ms-navstudio')){
      var app2 = document.querySelector('.app');
      if(app2){ app2.classList.add('collapsed'); }
    }
    if(e.target.closest && (e.target.closest('.sidebar > .mel') || e.target.closest('.sidebar .melchev'))){
      var appMel = document.querySelector('.app');
      if(appMel){ appMel.classList.add('collapsed'); }
    }
    if(e.target.closest && e.target.closest('.sidebar .nav[data-page]')){
      var app3 = document.querySelector('.app');
      if(app3){ app3.classList.remove('collapsed'); }
    }
    if(e.target.closest && e.target.closest('#pke-close')){
      /* One exit path: closeEditor() in mel/18 restores the screen that OPENED the editor.
         The old code jumped straight to .packeton, which is empty in the new flow. */
      var edit = document.getElementById('pk-edit');
      if(edit){ edit.classList.remove('manual','dirty'); }
      var back = document.getElementById('pke-back');
      if(back){ back.click(); }
      else {
        console.warn('[pke-close] #pke-back missing \u2014 falling back to the packet screen');
        var page = document.querySelector('.melpage');
        if(edit){ edit.classList.remove('open','gen'); }
        if(page){ page.classList.remove('pkediton'); page.classList.add('studio','packeton'); }
      }
    }
    if(e.target.closest && (e.target.closest('#pke-shclose') || e.target.closest('#pke-shexpand'))){
      var ed = document.getElementById('pk-edit');
      if(ed){ ed.classList.toggle('side-collapsed'); }
    }
    var b = e.target.closest && e.target.closest('.markopt');
    if(!b) return;
    var v = b.dataset.mark;
    try{ localStorage.setItem(KEY, v); }catch(err){}
    applyAll(v);
  });
  new MutationObserver(function(ms){
    var v = cur();
    if(v === 'infinity') return;
    ms.forEach(function(m){ m.addedNodes.forEach(function(n){
      if(n.nodeType !== 1) return;
      if(n.tagName === 'IMG'){ if(isMel(n)) swap(n, v); return; }
      if(n.querySelectorAll) n.querySelectorAll('img').forEach(function(img){ if(isMel(img)) swap(img, v); });
    }); });
  }).observe(document.body, {childList:true, subtree:true});
  applyAll(cur());
})();

