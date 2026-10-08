/* Mel chat composer: attach (+), voice (mic), send on Enter. One delegated binding for
   every .melchat — the studio search box and the editor side panel (all tabs). */
(function(){
  const box = el => el.closest('.melchat');
  const field = c => c.querySelector('.melchat-in, input[type="text"]');
  const say = (t, d) => { if(window.sonner) sonner(t, d); };

  function stopRec(c, insert){
    if(!c.classList.contains('rec')) return;
    c.classList.remove('rec');
    if(c.__melTimer){ clearTimeout(c.__melTimer); c.__melTimer = null; }
    const f = field(c), line = c.dataset.melchatVoice || '';
    if(insert && f && line){
      f.value = line; f.focus();
      f.dispatchEvent(new Event('input', { bubbles:true }));
      say('Heard you', line);
    }
  }
  function startRec(c){
    document.querySelectorAll('.melchat.rec').forEach(o => { if(o !== c) stopRec(o, false); });
    c.classList.add('rec');
    say('Listening', 'Tap the mic again when you are done');
    c.__melTimer = setTimeout(() => stopRec(c, true), 3200);
  }

  document.addEventListener('click', e => {
    const add = e.target.closest('[data-melchat-add]');
    if(add){
      const fi = document.getElementById(add.dataset.melchatFile || '');
      if(fi){ fi.value = ''; fi.click(); }
      else console.warn('[melchat] no file input #' + (add.dataset.melchatFile || ''));
      return;
    }
    const mic = e.target.closest('[data-melchat-mic]');
    if(mic){ const c = box(mic); if(!c) return; c.classList.contains('rec') ? stopRec(c, true) : startRec(c); }
  });

  document.addEventListener('keydown', e => {
    if(!e.target.classList || !e.target.classList.contains('melchat-in')) return;
    const c = box(e.target); if(!c) return;
    if(e.key === 'Escape'){ stopRec(c, false); return; }
    if(e.key !== 'Enter') return;
    e.preventDefault();
    const v = e.target.value.trim();
    if(!v) return;
    e.target.value = '';
    say('Mel is on it', v);
    c.dispatchEvent(new CustomEvent('melchat:send', { bubbles:true, detail:{ text:v } }));
  });
})();

