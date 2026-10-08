/* Safety net: if a scrim gets stuck open (dialog/sheet closed but overlay remained),
   Escape or a click on the scrim itself clears every open scrim in one shot.
   Prevents the whole viewport turning medium-gray (rgba(10,10,10,.5) over content)
   with no way to recover but a refresh. */
(function(){
  const SCRIM_SEL = '.dwscrim,.fscrim,.tkscrim,.tksscrim,.lkscrim,.nscrim,.txd-dscrim,.txd-iscrim,.txd-lb,.msu,.mscrim,.pscrim,.mmodalwrap,.mpal,.msv,.rds-overlay,.swp';
  const ON_CLASSES = ['on','open','in'];
  function clearAll(){
    document.querySelectorAll(SCRIM_SEL).forEach(el => {
      ON_CLASSES.forEach(c => el.classList.remove(c));
    });
    /* companion panels/sheets/dialogs that share the on/open class */
    document.querySelectorAll('.dw.open,.fsheet.on,.tksheet.on,.tkssheet.on,.lkdlg.on,.npanel.open,.txd-drawer.on,.txd-ipanel.on,.mmodal.open,.mpalbox.open').forEach(el => {
      ON_CLASSES.forEach(c => el.classList.remove(c));
    });
    document.body.style.overflow = '';
  }
  document.addEventListener('keydown', e => {
    if(e.key === 'Escape'){
      /* only kick in if at least one scrim is currently visible */
      const stuck = document.querySelector(SCRIM_SEL + ':is(.on,.open,.in)');
      if(stuck) clearAll();
    }
  });
  /* click on any fixed scrim also clears — most already handle this, this is a fallback */
  document.addEventListener('click', e => {
    const s = e.target;
    if(s && s.matches && s.matches(SCRIM_SEL) && s.classList.contains('on') || (s.classList && s.classList.contains('open'))){
      if(s.matches(SCRIM_SEL)) clearAll();
    }
  }, true);
  window.__clearScrims = clearAll;
})();

