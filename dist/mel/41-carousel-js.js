/* ---------- mel/41 — carousel mode. Loads last (after 39) on purpose: it reads the
   editor stage those files paint, and adds only new nodes. ----------

   Carousel is a delivery SHAPE, not a template, and it is chosen in the EDITOR.
   The templates CARD is never touched — no badge, no extra control, no height change.
     · editor         : Single ⇄ Carousel segmented above the stage. Flipping to
                        carousel keeps the design, photo, accent and font — Mel only
                        adds slides 2..N (a different MLS photo per slide, plus a
                        price slide and a closing agent card).
     · caption        : one per carousel, never per slide (Instagram's own rule).

   Every slide is a clone of the CURRENT render, so any edit the agent already made
   carries into the whole set. */
(function(){
  const DEF_N = 6, MAX_N = 10, MIN_N = 2;
  const CAR = { on:{}, slides:{}, idx:{} };
  window.MELCAR = CAR;

  const roleOf = (i, n) => i === 0 ? 'Cover' : i === 1 ? 'Price' : i === n - 1 ? 'Agent' : 'Room ' + (i - 1);

  /* --------------------------------------------------------------- editor ---- */
  function photos(){
    const p = (window.MELSTUDIO && window.MELSTUDIO.PHOTOS) || [];
    if(!Array.isArray(p)) return [];
    /* PHOTOS entries are objects ({c, n, img}) — keep the array as URL strings */
    return p.map(x => (x && (x.img || x.src)) || (typeof x === 'string' ? x : '')).filter(Boolean);
  }
  function priceOf(root){
    const m = (root.textContent || '').match(/\$[\d,]{4,}/);
    return m ? m[0] : '';
  }
  function handleOf(root){
    const b = root.querySelector('.mspostbar b');
    return (b && b.textContent) || (window.MELSTUDIO && window.MELSTUDIO.HANDLE) || '';
  }

  function swapPhoto(root, url){
    /* MELSTUDIO writes the photo with the background SHORTHAND, so match any
       inline url() and rewrite the token in place. Success is "a url token was
       found" — not "the string changed": PHOTOS cycles a handful of files, so a
       slide can legitimately land on the same photo as the base render. */
    const RE = /url\((['"]?)[^)]*\1\)/g;
    let found = 0;
    root.querySelectorAll('[style*="url("]').forEach(el => {
      const s = el.getAttribute('style') || '';
      const hits = s.match(RE);
      if(!hits) return;
      found += hits.length;
      el.setAttribute('style', s.replace(RE, "url('" + url + "')"));
    });
    if(!found) console.warn('[carousel] no inline photo url to swap on this slide');
  }

  function buildSlide(base, i, n){
    const slide = document.createElement('div');
    slide.className = 'pkecslide';
    slide.dataset.role = roleOf(i, n).toLowerCase().replace(/\s.*/, '');
    slide.innerHTML = base;
    const ph = photos();
    if(i > 0 && ph.length) swapPhoto(slide, ph[i % ph.length]);
    const frame = slide.querySelector('.mspost') || slide;
    if(i === 1){
      const price = priceOf(slide);
      if(price){
        const band = document.createElement('div');
        band.className = 'pkecband';
        band.innerHTML = '<span>Just listed</span>' + price;
        frame.appendChild(band);
      }
    }
    if(i === n - 1){
      const h = handleOf(slide);
      const card = document.createElement('div');
      card.className = 'pkecagent';
      card.innerHTML = '<span class="av">MK</span><span class="tx"><b>Maya Kapoor</b>' +
        '<i>Radius Agent Realty' + (h ? ' · ' + h : '') + '</i></span>';
      frame.appendChild(card);
    }
    return slide;
  }

  function go(cell, i){
    const key = cell.dataset.pk;
    const track = cell.querySelector('.pkectrack');
    const n = (CAR.slides[key] || []).length;
    if(!track || !n) return;
    CAR.idx[key] = Math.max(0, Math.min(n - 1, i));
    track.style.transform = 'translateX(-' + (CAR.idx[key] * 100) + '%)';
    cell.querySelectorAll('.pkecdots button').forEach((d, j) =>
      d.setAttribute('aria-current', j === CAR.idx[key] ? 'true' : 'false'));
    cell.querySelectorAll('.pkecthumb').forEach((t, j) =>
      t.setAttribute('aria-current', j === CAR.idx[key] ? 'true' : 'false'));
    const p = cell.querySelector('.pkecnav--prev'), nx = cell.querySelector('.pkecnav--next');
    if(p) p.disabled = CAR.idx[key] === 0;
    if(nx) nx.disabled = CAR.idx[key] === n - 1;
  }

  /* the thumb is the slide's own photo — read straight off the built slide, so it
     always matches what the deck shows */
  function slidePhoto(slide){
    const el = slide && slide.querySelector('[style*="url("]');
    const m = el && (el.getAttribute('style') || '').match(/url\((['"]?)([^)]*?)\1\)/);
    return m ? m[2] : '';
  }

  function paintStrip(cell){
    const key = cell.dataset.pk, n = (CAR.slides[key] || []).length;
    const strip = cell.querySelector('.pkecstrip');
    if(!strip) return;
    const slides = cell.querySelectorAll('.pkectrack > .pkecslide');
    strip.textContent = '';
    for(let i = 0; i < n; i++){
      const t = document.createElement('button');
      t.type = 'button';
      t.className = 'pkecthumb';
      t.dataset.cslide = i;
      t.setAttribute('aria-current', i === (CAR.idx[key] || 0) ? 'true' : 'false');
      const box = document.createElement('span');
      box.className = 'box';
      const url = slidePhoto(slides[i]);
      if(url) box.style.backgroundImage = "url('" + url + "')";
      else console.warn('[carousel] slide ' + i + ' has no photo to thumb');
      if(i === 0){
        const cov = document.createElement('span');
        cov.className = 'cov'; cov.textContent = 'Cover';
        box.appendChild(cov);
      }
      if(n > MIN_N){
        const rm = document.createElement('span');
        rm.className = 'rm'; rm.dataset.cdel = i;
        rm.setAttribute('role','button'); rm.title = 'Remove slide';
        rm.innerHTML = '<i class="ph ph-x" aria-hidden="true"></i>';
        box.appendChild(rm);
      }
      const rl = document.createElement('span');
      rl.className = 'rl'; rl.textContent = roleOf(i, n);
      t.appendChild(box); t.appendChild(rl);
      strip.appendChild(t);
    }
    const add = document.createElement('button');
    add.type = 'button'; add.className = 'pkecadd'; add.dataset.cadd = '1';
    add.title = n >= MAX_N ? 'Instagram allows 10 slides' : 'Add a slide';
    add.setAttribute('aria-label', add.title);
    add.disabled = n >= MAX_N;
    add.innerHTML = '<i class="ph ph-plus" aria-hidden="true"></i>';
    strip.appendChild(add);
  }

  function buildDeck(cell, n){
    const key = cell.dataset.pk;
    const real = cell.querySelector('.real');
    if(!real){ console.warn('[carousel] asset ' + key + ' has no .real stage'); return; }
    if(!cell._carBase) cell._carBase = real.innerHTML;
    CAR.slides[key] = Array.from({ length:n }, (_, i) => i);
    real.textContent = '';
    const deck = document.createElement('div');
    deck.className = 'pkecdeck';
    const track = document.createElement('div');
    track.className = 'pkectrack';
    for(let i = 0; i < n; i++) track.appendChild(buildSlide(cell._carBase, i, n));
    deck.appendChild(track);
    ['prev','next'].forEach(d => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'pkecnav pkecnav--' + d;
      b.dataset.cnav = d;
      b.title = d === 'prev' ? 'Previous slide' : 'Next slide';
      b.setAttribute('aria-label', b.title);
      b.innerHTML = '<i class="ph ph-caret-' + (d === 'prev' ? 'left' : 'right') + '" aria-hidden="true"></i>';
      deck.appendChild(b);
    });
    real.appendChild(deck);
    const dots = document.createElement('div');
    dots.className = 'pkecdots';
    for(let i = 0; i < n; i++){
      const d = document.createElement('button');
      d.type = 'button'; d.dataset.cslide = i;
      d.title = 'Slide ' + (i + 1); d.setAttribute('aria-label', d.title);
      dots.appendChild(d);
    }
    real.appendChild(dots);
    /* one caption for the whole carousel, lifted out of slide 1 */
    const tmp = document.createElement('div');
    tmp.innerHTML = cell._carBase;
    const cap = tmp.querySelector('.mspcap');
    if(cap) real.appendChild(cap);
    const strip = document.createElement('div');
    strip.className = 'pkecstrip';
    real.appendChild(strip);
    requestAnimationFrame(() => { paintStrip(cell); go(cell, CAR.idx[key] || 0); });
  }

  function setMode(cell, on, n){
    const key = cell.dataset.pk;
    CAR.on[key] = !!on;
    const seg = cell.querySelector('.pkecarseg');
    if(seg) seg.querySelectorAll('button').forEach(b =>
      b.setAttribute('aria-pressed', (b.dataset.cmode === 'car') === !!on ? 'true' : 'false'));
    if(on){
      buildDeck(cell, n || (CAR.slides[key] || []).length || DEF_N);
    } else {
      const real = cell.querySelector('.real');
      if(real && cell._carBase) real.innerHTML = cell._carBase;
      CAR.idx[key] = 0;
    }
  }

  function mountSeg(cell){
    if(cell.querySelector('.pkecar')) return;
    const pv = cell.querySelector('.pv');
    if(!pv) return;
    const row = document.createElement('div');
    row.className = 'pkecar';
    row.innerHTML =
      '<span class="pkecarseg" role="group" aria-label="Post shape">' +
        '<button type="button" data-cmode="one" aria-pressed="true">' +
          '<i class="ph ph-file-image" aria-hidden="true"></i>Single</button>' +
        '<button type="button" data-cmode="car" aria-pressed="false">' +
          '<i class="ph ph-squares-four" aria-hidden="true"></i>Carousel</button>' +
      '</span>';
    pv.parentNode.insertBefore(row, pv);
  }

  /* the editor paints its assets asynchronously — mount on whatever shows up */
  function scan(){
    document.querySelectorAll('.pkast[data-pk="igpost"]').forEach(cell => {
      mountSeg(cell);
    });
  }
  const rail = document.getElementById('pke-rail') || document.body;
  new MutationObserver(() => requestAnimationFrame(scan)).observe(rail, { childList:true, subtree:true });
  scan();

  document.addEventListener('click', e => {
    const t = e.target;
    if(!t.closest) return;
    const cell = t.closest('.pkast');
    if(!cell) return;
    const mode = t.closest('[data-cmode]');
    if(mode){
      e.preventDefault(); e.stopPropagation();
      const on = mode.dataset.cmode === 'car';
      if(!!CAR.on[cell.dataset.pk] === on) return;
      setMode(cell, on, DEF_N);
      if(window.sonner) sonner(on ? 'Carousel · ' + DEF_N + ' slides' : 'Single post',
        on ? 'Same design and accent — Mel filled slides 2 to ' + DEF_N
           : 'Slide 1 kept · the rest are gone');
      return;
    }
    const del = t.closest('[data-cdel]');
    if(del){
      e.preventDefault(); e.stopPropagation();
      const key = cell.dataset.pk, n = (CAR.slides[key] || []).length;
      if(n <= MIN_N) return;
      setMode(cell, true, n - 1);
      if(window.sonner) sonner('Slide removed', (n - 1) + ' slides left');
      return;
    }
    if(t.closest('[data-cadd]')){
      e.preventDefault(); e.stopPropagation();
      const key = cell.dataset.pk, n = (CAR.slides[key] || []).length;
      if(n >= MAX_N) return;
      setMode(cell, true, n + 1);
      return;
    }
    const jump = t.closest('[data-cslide]');
    if(jump){
      e.preventDefault(); e.stopPropagation();
      go(cell, parseInt(jump.dataset.cslide, 10) || 0);
      return;
    }
    const nav = t.closest('[data-cnav]');
    if(nav){
      e.preventDefault(); e.stopPropagation();
      go(cell, (CAR.idx[cell.dataset.pk] || 0) + (nav.dataset.cnav === 'prev' ? -1 : 1));
    }
  }, true);

})();
