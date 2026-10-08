/* Ring tweak — inside the Marketing Studio page content, every Mel infinity mark renders as the
   animated ring when Ring is selected; Infinity restores it. Mel brand chrome (rail header,
   sidebar pill, ask bar, right assistant panel, chat zero-state) is intentionally excluded. */
(function(){
  var EXCL = '.melhist, .mel, .melbar, .melmini, .melzero, .msvside, .markpick, .twk-panel, .mstri';
  function isMel(img){
    if(!img.closest) return false;
    if(img.closest(EXCL)) return false;
    if(img.classList.contains('msmark')) return false; /* studio header handled by CSS twin */
    var s = img.getAttribute('src')||'';
    var mark = /mel-icon\.svg|mel-orb\.svg/.test(s) || img.classList.contains('melmark') || img.classList.contains('gomel') || img.classList.contains('melspin');
    if(!mark) return false;
    if(img.classList.contains('melspin') || img.classList.contains('gomel')) return true; /* MS generation indicators live outside #mel-page */
    return !!img.closest('#mel-page');
  }
  function ringOn(){ return document.body.classList.contains('trace-ring'); }
  function apply(img){
    if(ringOn()){
      if(!img.__ring){
        var cs = getComputedStyle(img);
        var w = parseFloat(cs.width)||img.offsetWidth||20;
        var h = parseFloat(cs.height)||img.offsetHeight||w;
        var r = document.createElement('span');
        r.className='melring'; r.setAttribute('aria-hidden','true');
        r.style.width=w+'px'; r.style.height=h+'px'; r.style.verticalAlign='middle';
        img.__ring=r;
        if(img.parentNode) img.parentNode.insertBefore(r, img.nextSibling);
      } else if(!img.__ring.isConnected && img.parentNode){
        img.parentNode.insertBefore(img.__ring, img.nextSibling);
      }
      img.style.display='none';
    } else {
      if(img.__ring){ img.__ring.remove(); img.__ring=null; }
      img.style.display='';
    }
  }
  function applyAll(){ document.querySelectorAll('img').forEach(function(img){ if(isMel(img)) apply(img); }); }
  new MutationObserver(applyAll).observe(document.body,{attributes:true,attributeFilter:['class']});
  new MutationObserver(function(ms){
    if(!ringOn()) return;
    ms.forEach(function(m){ m.addedNodes.forEach(function(n){
      if(n.nodeType!==1) return;
      if(n.tagName==='IMG'){ if(isMel(n)) apply(n); return; }
      if(n.querySelectorAll) n.querySelectorAll('img').forEach(function(img){ if(isMel(img)) apply(img); });
    }); });
  }).observe(document.body,{childList:true,subtree:true});
  if(document.readyState!=='loading') applyAll(); else document.addEventListener('DOMContentLoaded',applyAll);
})();

