/* 28 — text edit mode.
   Makes every visible label on the page editable in place, including the ones the
   scripts above build at runtime from their own data arrays (CHATS, TASKS, PKG,
   TODAY, LIB, P…). Those have no source markup, so the host editor cannot reach
   them; this layer can.

   Off by default — nothing changes until it is switched on.
     window.MELEDIT.on() / .off() / .toggle() / .reset()
     Alt+Shift+E toggles
     the "Text editing" tweak on the component toggles it too

   Edits persist in localStorage under one key and are re-applied after any
   re-render, so a saved label survives the panel being rebuilt. */
(function () {
  'use strict';

  var KEY = 'mel.textedits.v1';
  var AKEY = 'mel.attredits.v1';
  var EDITABLE_ATTRS = ['placeholder', 'title', 'aria-label', 'alt', 'value'];
  var SKIP_TAG = { SCRIPT: 1, STYLE: 1, SVG: 1, PATH: 1, CIRCLE: 1, RECT: 1, LINE: 1, POLYGON: 1, POLYLINE: 1, G: 1, DEFS: 1, USE: 1, IMG: 1, INPUT: 1, TEXTAREA: 1, SELECT: 1, OPTION: 1, BR: 1, HR: 1, CANVAS: 1, IFRAME: 1 };
  var store = {};
  var astore = {};
  var on = false;
  var applying = false;
  var obs = null;

  try {
    store = JSON.parse(localStorage.getItem(KEY) || '{}') || {};
  } catch (e) {
    console.warn('[meledit] could not read saved edits: ' + e.message);
    store = {};
  }

  try {
    astore = JSON.parse(localStorage.getItem(AKEY) || '{}') || {};
  } catch (e) {
    console.warn('[meledit] could not read saved attribute edits: ' + e.message);
    astore = {};
  }

  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(store));
      localStorage.setItem(AKEY, JSON.stringify(astore));
    } catch (e) {
      console.warn('[meledit] could not save edits: ' + e.message);
    }
  }

  /* ---------- stable-ish key for an element ----------
     Anchors on the nearest identifying attribute so a re-rendered row keeps its
     edit, then falls back to a tag/index path. */
  var ANCHOR = ['id', 'data-id', 'data-pk', 'data-pks', 'data-k', 'data-l', 'data-tm', 'data-mx', 'data-msq', 'data-mssend', 'data-tpl'];

  function anchorOf(el) {
    for (var i = 0; i < ANCHOR.length; i++) {
      var v = el.getAttribute && el.getAttribute(ANCHOR[i]);
      if (v) return ANCHOR[i] + '=' + v;
    }
    return null;
  }

  function isWrap(el) {
    return el.nodeType === 1 && el.hasAttribute('data-ed-wrap');
  }

  function seg(el) {
    var t = el.tagName.toLowerCase();
    var p = el.parentElement;
    if (!p) return t;
    /* the [data-ed-wrap] spans only exist while edit mode is on — never count them,
       or a key saved during editing will not match the key computed on reload */
    var n = 1;
    for (var c = el.previousElementSibling; c; c = c.previousElementSibling) {
      if (isWrap(c)) continue;
      if (c.tagName === el.tagName) n++;
    }
    var cls = (el.className && typeof el.className === 'string') ? el.className.trim().split(/\s+/)[0] : '';
    return t + (cls ? '.' + cls : '') + ':' + n;
  }

  function keyFor(el, childIndex) {
    var parts = [];
    var node = el;
    while (node && node !== document.body) {
      if (isWrap(node)) { node = node.parentElement; continue; }
      var a = anchorOf(node);
      if (a) { parts.unshift('[' + a + ']'); break; }
      parts.unshift(seg(node));
      node = node.parentElement;
      if (parts.length > 14) break;
    }
    return parts.join('>') + (childIndex == null ? '' : '#t' + childIndex);
  }

  /* ---------- what counts as an editable text run ---------- */
  function editableTextNodes(root) {
    var out = [];
    var walk = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        if (!n.nodeValue || !n.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        var p = n.parentElement;
        if (!p) return NodeFilter.FILTER_REJECT;
        if (SKIP_TAG[p.tagName]) return NodeFilter.FILTER_REJECT;
        if (p.closest('svg')) return NodeFilter.FILTER_REJECT;
        if (p.closest('[data-noedit]')) return NodeFilter.FILTER_REJECT;
        if (p.isContentEditable && !p.hasAttribute('data-ed')) return NodeFilter.FILTER_REJECT;
        var cs = getComputedStyle(p);
        if (cs.display === 'none' || cs.visibility === 'hidden') return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var n;
    while ((n = walk.nextNode())) out.push(n);
    return out;
  }

  function textIndex(node) {
    var i = 0;
    var p = node.parentNode;
    /* a [data-ed-wrap] span stands in for the text run it holds, so the index is the
       same whether edit mode is on or off */
    if (p && p.nodeType === 1 && isWrap(p)) { node = p; p = p.parentNode; }
    for (var c = p.firstChild; c; c = c.nextSibling) {
      if (c === node) return i;
      if (c.nodeType === 3 && c.nodeValue && c.nodeValue.trim()) i++;
      else if (c.nodeType === 1 && isWrap(c)) i++;
    }
    return i;
  }

  /* ---------- attribute edits (placeholders) ----------
     A placeholder is an attribute, not a text node, so the text pass cannot see it.
     While edit mode is on the placeholder is moved into the field's own value channel
     — same element, same font, no DOM inserted — and written back on the way out. */
  var PH_SEL = 'input[placeholder],textarea[placeholder],input[data-ed-ph],textarea[data-ed-ph]';

  function attrKey(el, attr) {
    return keyFor(el) + '#@' + attr;
  }

  function applySavedAttrs(root) {
    if (!Object.keys(astore).length) return;
    var els = (root || document.body).querySelectorAll(PH_SEL);
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (el.closest('[data-noedit]')) continue;
      var k = attrKey(el, 'placeholder');
      if (!Object.prototype.hasOwnProperty.call(astore, k)) continue;
      if (el.hasAttribute('data-ed-ph')) {
        if (el.value !== astore[k]) el.value = astore[k];
      } else if (el.getAttribute('placeholder') !== astore[k]) {
        el.setAttribute('placeholder', astore[k]);
      }
    }
  }

  function markAttrs(root) {
    var els = (root || document.body).querySelectorAll('input[placeholder],textarea[placeholder]');
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (el.hasAttribute('data-ed-ph') || el.closest('[data-noedit]')) continue;
      var ph = el.getAttribute('placeholder') || '';
      el.setAttribute('data-ed-ph', ph);
      el.setAttribute('data-ed-val', el.value);
      el.setAttribute('data-ed-akey', attrKey(el, 'placeholder'));
      el.value = ph;
      el.setAttribute('placeholder', '');
      el.classList.add('meledit-ph');
    }
  }

  function unmarkAttrs(root) {
    var els = (root || document.body).querySelectorAll('[data-ed-ph]');
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      var typed = el.value.trim();
      var orig = el.getAttribute('data-ed-ph') || '';
      el.setAttribute('placeholder', typed || orig);
      el.value = el.getAttribute('data-ed-val') || '';
      el.classList.remove('meledit-ph');
      el.removeAttribute('data-ed-ph');
      el.removeAttribute('data-ed-val');
      el.removeAttribute('data-ed-akey');
    }
  }

  /* ---------- apply saved edits ---------- */
  function applySaved(root) {
    var keys = Object.keys(store);
    if (!keys.length) return;
    applying = true;
    try {
      var nodes = editableTextNodes(root || document.body);
      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        var k = keyFor(n.parentElement, textIndex(n));
        if (Object.prototype.hasOwnProperty.call(store, k) && n.nodeValue.trim() !== store[k]) {
          var lead = n.nodeValue.match(/^\s*/)[0];
          var tail = n.nodeValue.match(/\s*$/)[0];
          n.nodeValue = lead + store[k] + tail;
        }
      }
    } catch (e) {
      console.warn('[meledit applySaved] ' + e.message);
    }
    applying = false;
  }

  /* ---------- edit mode on ---------- */
  var CSS_ID = 'meledit-css';
  function ensureCss() {
    if (document.getElementById(CSS_ID)) return;
    var s = document.createElement('style');
    s.id = CSS_ID;
    s.textContent =
      '[data-ed]{outline:1px dashed rgba(90,95,242,.42);outline-offset:1px;border-radius:3px;' +
      'cursor:text;transition:background 120ms ease,outline-color 120ms ease}' +
      '[data-ed]:hover{background:rgba(90,95,242,.07);outline-color:rgba(90,95,242,.75)}' +
      '[data-ed]:focus{outline:2px solid #5A5FF2;outline-offset:1px;background:rgba(90,95,242,.06)}' +
      '.meledit-ph{color:#737373 !important;outline:1px dashed rgba(90,95,242,.42);outline-offset:2px;border-radius:3px}' +
      '.meledit-ph:focus{outline:2px solid #5A5FF2;outline-offset:2px}' +
      '.meledit-hud{position:fixed;right:16px;bottom:16px;z-index:2147483000;display:inline-flex;' +
      'align-items:center;gap:8px;min-height:34px;padding:6px 14px 6px 11px;border:1px solid #E4E4FB;' +
      'border-radius:12px;background:linear-gradient(100deg,#F7F7FE 0%,#FCFAFD 48%,#FFFBF8 100%);' +
      'box-shadow:0 6px 20px rgba(16,16,40,.14);font:500 13px/17px var(--font,system-ui);cursor:pointer}' +
      '.meledit-hud:hover{border-color:#C9CAF8;box-shadow:0 2px 12px rgba(90,95,242,.16)}' +
      '.meledit-hud:active{transform:scale(.98)}' +
      '.meledit-hud .msp{flex:0 0 auto;color:#6D6EF3}' +
      '.meledit-hud .mlab{background:var(--mel-gradient,linear-gradient(100deg,#7B7FF5,#5A5FF2,#F08068,#F0A468));' +
      '-webkit-background-clip:text;background-clip:text;color:transparent}';
    document.head.appendChild(s);
  }

  var hud = null;
  function ensureHud() {
    if (hud) return hud;
    hud = document.createElement('button');
    hud.type = 'button';
    hud.className = 'meledit-hud';
    hud.setAttribute('data-noedit', '');
    hud.innerHTML =
      '<svg class="msp" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
      '<path d="M12 2c.6 5 4 8.4 9 9-5 .6-8.4 4-9 9-.6-5-4-8.4-9-9 5-.6 8.4-4 9-9z"/></svg>' +
      '<span class="mlab">Editing text — click to finish</span>';
    hud.addEventListener('click', function () { api.off(); });
    document.body.appendChild(hud);
    return hud;
  }

  function markup(root) {
    var nodes = editableTextNodes(root || document.body);
    /* every key is computed BEFORE any wrapper is inserted — inserting as we go would
       shift the text-run index of the siblings still to come */
    var plan = [];
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      var p = n.parentElement;
      if (!p || p.hasAttribute('data-ed')) continue;
      plan.push({ node: n, parent: p, key: keyFor(p, textIndex(n)) });
    }
    for (var j = 0; j < plan.length; j++) {
      var it = plan[j], host;
      if (it.parent.childNodes.length === 1) {
        host = it.parent; /* clean leaf — edit it directly, no DOM change */
      } else {
        host = document.createElement('span');
        host.setAttribute('data-ed-wrap', '');
        it.node.parentNode.insertBefore(host, it.node);
        host.appendChild(it.node);
      }
      host.setAttribute('data-ed', '');
      host.setAttribute('data-ed-key', it.key);
      host.contentEditable = 'true';
      host.spellcheck = false;
    }
  }

  function unmark(root) {
    var els = (root || document.body).querySelectorAll('[data-ed]');
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      el.removeAttribute('contenteditable');
      el.removeAttribute('spellcheck');
      el.removeAttribute('data-ed');
      el.removeAttribute('data-ed-key');
      if (el.hasAttribute('data-ed-wrap')) {
        var p = el.parentNode;
        while (el.firstChild) p.insertBefore(el.firstChild, el);
        p.removeChild(el);
        p.normalize();
      }
    }
  }

  function commit(el) {
    var k = el.getAttribute('data-ed-key');
    if (!k) return;
    var v = el.textContent.replace(/\s+/g, ' ').trim();
    if (!v) { delete store[k]; } else { store[k] = v; }
    save();
  }

  document.addEventListener('input', function (e) {
    var el = e.target;
    if (!el || el.nodeType !== 1 || !el.hasAttribute) return;
    if (el.hasAttribute('data-ed')) { commit(el); return; }
    if (el.hasAttribute('data-ed-akey')) {
      var k = el.getAttribute('data-ed-akey');
      var v = el.value.trim();
      if (!v) { delete astore[k]; } else { astore[k] = v; }
      save();
    }
  }, true);

  document.addEventListener('keydown', function (e) {
    if (e.altKey && e.shiftKey && (e.key === 'E' || e.key === 'e')) {
      e.preventDefault();
      api.toggle();
      return;
    }
    if (!on) return;
    var el = e.target;
    if (el && el.nodeType === 1 && el.hasAttribute && el.hasAttribute('data-ed')) {
      if (e.key === 'Enter') { e.preventDefault(); el.blur(); }
      if (e.key === 'Escape') { el.blur(); }
      e.stopPropagation(); /* keep typing out of the page's own shortcuts */
    }
  }, true);

  /* while editing, a click on a label must not fire the app's handler */
  document.addEventListener('click', function (e) {
    if (!on) return;
    var el = e.target;
    if (el && el.closest && el.closest('[data-ed]') && !el.closest('.meledit-hud')) {
      e.preventDefault();
      e.stopPropagation();
      var h = el.closest('[data-ed]');
      if (h) h.focus();
    }
  }, true);

  /* re-apply saved edits, and re-mark, whenever the scripts above re-render */
  var pending = null;
  function schedule() {
    if (applying) return;
    if (pending) clearTimeout(pending);
    pending = setTimeout(function () {
      pending = null;
      applying = true;
      try {
        applySaved(document.body);
        applySavedAttrs(document.body);
        if (on) { markup(document.body); markAttrs(document.body); }
      } catch (e) {
        console.warn('[meledit observer] ' + e.message);
      }
      applying = false;
    }, 60);
  }

  function watch() {
    if (obs) return;
    obs = new MutationObserver(function (recs) {
      for (var i = 0; i < recs.length; i++) {
        var r = recs[i];
        if (r.type === 'characterData' && r.target.parentElement && r.target.parentElement.hasAttribute('data-ed')) continue;
        if (r.target && r.target.closest && r.target.closest('.meledit-hud')) continue;
        schedule();
        return;
      }
    });
    obs.observe(document.body, { childList: true, subtree: true, characterData: true });
  }

  var api = {
    get isOn() { return on; },
    on: function () {
      if (on) return;
      on = true;
      ensureCss();
      applying = true;
      try { markup(document.body); markAttrs(document.body); } catch (e) { console.warn('[meledit on] ' + e.message); }
      applying = false;
      ensureHud().style.display = '';
      document.body.setAttribute('data-text-editing', '');
    },
    off: function () {
      if (!on) return;
      on = false;
      applying = true;
      try { unmarkAttrs(document.body); unmark(document.body); } catch (e) { console.warn('[meledit off] ' + e.message); }
      applying = false;
      if (hud) hud.style.display = 'none';
      document.body.removeAttribute('data-text-editing');
    },
    set: function (v) { v ? api.on() : api.off(); },
    toggle: function () { on ? api.off() : api.on(); },
    reset: function () {
      store = {};
      astore = {};
      save();
      location.reload();
    },
    count: function () { return Object.keys(store).length + Object.keys(astore).length; },
    /* the placeholder cyclers above must not fight a saved override */
    attrLocked: function (el, attr) {
      if (!el) return false;
      if (el.hasAttribute('data-ed-ph')) return true;
      try { return Object.prototype.hasOwnProperty.call(astore, attrKey(el, attr || 'placeholder')); }
      catch (e) { console.warn('[meledit attrLocked] ' + e.message); return false; }
    }
  };

  window.MELEDIT = api;

  applySaved(document.body);
  applySavedAttrs(document.body);
  watch();
})();
