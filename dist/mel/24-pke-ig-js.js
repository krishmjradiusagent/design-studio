(function(){
  var m, attempts = 0, connected = false, timers = [];
  function tCancel(){ timers.forEach(function(id){ clearTimeout(id); }); timers = []; }
  function tSet(fn, ms){ var id = setTimeout(fn, ms); timers.push(id); return id; }
  function set(state){ if(!m) return; m.setAttribute('data-state', state); }
  function open(){
    m = document.getElementById('pke-igmodal'); if(!m) return;
    tCancel();
    m.classList.add('open'); m.setAttribute('aria-hidden', 'false');
    if(connected){ set('posting'); tSet(function(){ set('done'); }, 1600); }
    else { set('idle'); }
  }
  function close(){
    if(!m) return;
    var wasDone = m.getAttribute('data-state') === 'done';
    tCancel();
    m.classList.remove('open'); m.setAttribute('aria-hidden', 'true');
    /* Post completed — tear down the packet editor / packet-picker stack and return to the
       START of the new flow (the workflows screen). The old dark gradient hub is retired:
       dropping .msflow-new here used to expose it, which is why it kept reappearing. */
    if(wasDone){
      try {
        var edit = document.getElementById('pk-edit');
        if(edit) edit.classList.remove('open','gen','manual','dirty');
        var page = document.querySelector('.melpage');
        if(page){ page.classList.remove('pkediton','packeton','canvason','library','paneled'); page.classList.add('studio'); }
        document.body.classList.remove('msfull','mscn-on','msaf-hidefmttabs');
        /* __applyMsFlow re-enters the flow AND resets intent/keys/tpl \u2014 a bare screen()
           would leave the finished run's state live for the next package. */
        if(window.__applyMsFlow) window.__applyMsFlow('new');
        else document.body.classList.add('msflow-new');
      } catch(e2) { console.warn('[igmodal.close] flow-return failed: ' + e2.message); }
    }
  }
  function connect(){
    set('connecting');
    tSet(function(){
      attempts++;
      if(attempts === 1){ set('failed'); return; }
      connected = true;
      set('connected');
      tSet(function(){ set('posting'); tSet(function(){ set('done'); }, 1600); }, 900);
    }, 1500);
  }
  function postNow(){ set('posting'); tSet(function(){ set('done'); }, 1600); }
  document.addEventListener('click', function(e){
    if(e.target.closest && e.target.closest('#pke-sendnow')){ e.preventDefault(); open(); return; }
    if(!m || !m.classList.contains('open')) return;
    if(e.target.closest('[data-igclose]')){ close(); return; }
    if(e.target.closest('[data-igconnect]')){ connect(); return; }
    if(e.target.closest('[data-igpostnow]')){ postNow(); return; }
    if(e.target.closest('[data-igview]')){
      if(window.sonner) sonner('Opening the post', 'instagram.com/mayarealtor');
      close(); return;
    }
  }, true);
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape' && m && m.classList.contains('open')){ close(); }
  });
})();

