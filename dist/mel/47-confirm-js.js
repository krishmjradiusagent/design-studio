/* Confirmation gate. Two ways in:
     1. window.melConfirm({title, body, ok, cancel, danger}) -> Promise<boolean>
     2. the CONFIRMS registry below: a selector plus copy. Clicks on those controls are caught in
        the CAPTURE phase (before every other document listener), held, and replayed only if the
        agent confirms — so no existing handler needed changing.
   Also fixes the editor's X: it used to drop the page onto the empty packet screen. It now runs the
   same exit path as Back (closeEditor in mel/18), which restores the screen that opened the editor. */
(function(){
  var CONFIRMS = [
    { sel:'#pke-close',      title:'Close the editor?',            body:'Your assets stay in this package. Anything you typed since the last save is not kept.', ok:'Close editor' },
    { sel:'#pke-regen',      title:'Regenerate this asset?',       body:'Mel rebuilds it from your listing data. The current render is replaced.', ok:'Regenerate' },
    { sel:'#upv2-finalize',  title:'Add this template to the package?', body:'Mel applies the logo, palette and font you picked, then adds it to every listing in this package.', ok:'Finalize' },
    { sel:'#upv2-keep',      title:'Keep the original only?',      body:'Mel saves your upload exactly as you sent it \u2014 no logo, palette or font changes.', ok:'Keep original' },
    { sel:'#upv2-replace',   title:'Replace this design?',         body:'The design Mel read is discarded and the next file you pick takes its place.', ok:'Replace', danger:true },
    { sel:'#msaf-pkgclear',  title:'Exit package mode?',           body:'Your template picks for this package are cleared.', ok:'Exit package mode', danger:true }
  ];

  function dlg(){ return document.getElementById('melcf'); }

  window.melConfirm = function(cfg){
    cfg = cfg || {};
    var d = dlg();
    if(!d){
      console.warn('[confirm] #melcf markup missing \u2014 action ran unconfirmed');
      return Promise.resolve(true);
    }
    var t = d.querySelector('.melcf-title'), b = d.querySelector('.melcf-body'),
        ok = d.querySelector('.melcf-ok'), no = d.querySelector('.melcf-cancel');
    if(cfg.title && t) t.textContent = cfg.title;
    if(cfg.body && b) b.textContent = cfg.body;
    if(ok) ok.textContent = cfg.ok || 'Confirm';
    if(no) no.textContent = cfg.cancel || 'Cancel';
    d.classList.toggle('danger', !!cfg.danger);
    d.classList.add('open');
    d.setAttribute('aria-hidden', 'false');
    if(ok) ok.focus();

    return new Promise(function(resolve){
      function done(v){
        d.classList.remove('open');
        d.setAttribute('aria-hidden', 'true');
        d.removeEventListener('click', onclick);
        document.removeEventListener('keydown', onkey, true);
        resolve(v);
      }
      function onclick(e){
        if(e.target.closest('.melcf-ok')) return done(true);
        if(e.target.closest('.melcf-cancel') || e.target.closest('.melcf-scrim')) return done(false);
      }
      function onkey(e){
        if(e.key === 'Escape'){ e.preventDefault(); done(false); }
        else if(e.key === 'Enter'){ e.preventDefault(); done(true); }
      }
      d.addEventListener('click', onclick);
      document.addEventListener('keydown', onkey, true);
    });
  };

  var SKIP = '__melConfirmed';
  document.addEventListener('click', function(e){
    var t = e.target;
    if(!t || !t.closest) return;
    if(t.closest('#melcf')) return;
    for(var i = 0; i < CONFIRMS.length; i++){
      var c = CONFIRMS[i];
      var hit = t.closest(c.sel);
      if(!hit) continue;
      if(hit[SKIP]){ hit[SKIP] = false; return; }
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      window.melConfirm(c).then(function(el){
        return function(yes){
          if(!yes) return;
          el[SKIP] = true;
          el.click();
        };
      }(hit));
      return;
    }
  }, true);
})();
