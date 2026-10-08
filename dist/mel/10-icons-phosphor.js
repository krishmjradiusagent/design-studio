/* ---------- Phosphor is the icon system for this page ----------
   Every inline Lucide glyph is swapped for its Phosphor equivalent at runtime,
   keeping the size and colour the CSS already resolved. Anything unmapped, or a
   failed webfont load, falls back to the original Lucide SVG untouched. */
(function(){
  const PH=Object.assign({
    'rect:x=2,y=7,width=20,height=13,rx=2|path:M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2|path:M2 12h20':'briefcase',
    'rect:x=6,y=2,width=12,height=20,rx=3|path:M10.5 5.5h3M12 18.2h.01':'device-mobile',
    'circle:cx=12,cy=5,r=1|circle:cx=12,cy=12,r=1|circle:cx=12,cy=19,r=1':'dots-three-vertical',
    'circle:cx=12,cy=5,r=1.8|circle:cx=12,cy=12,r=1.8|circle:cx=12,cy=19,r=1.8':'dots-three-vertical',
    'polyline:points=22 7 13.5 15.5 8.5 10.5 2 17|polyline:points=16 7 22 7 22 13':'trend-up',
    'polyline:points=22 17 13.5 8.5 8.5 13.5 2 7|polyline:points=16 17 22 17 22 11':'trend-down',
    'path:M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z':'palette'
  },{"rect:x=3,y=3,width=18,height=18,rx=2|path:M9 3v18":"sidebar-simple","path:m9 18 6-6-6-6":"caret-right","path:M7 17 17 7M7 7h10v10":"arrow-up-right","circle:cx=11,cy=11,r=7|path:m21 21-4.35-4.35":"magnifying-glass","path:M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2|circle:cx=9,cy=7,r=4|path:M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75":"users","path:M8 3 4 7l4 4|path:M4 7h16|path:m16 21 4-4-4-4|path:M20 17H4":"arrows-left-right","path:M3 3v18h18|path:M18 17V9M13 17V5M8 17v-3":"chart-bar","rect:x=3,y=4,width=18,height=16,rx=2|circle:cx=9,cy=10,r=2|path:M15 8h3M15 12h3M6 16c.5-1.5 1.8-2 3-2s2.5.5 3 2":"identification-card","path:M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z":"chat-circle-dots","path:M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9|path:M10.3 21a1.94 1.94 0 0 0 3.4 0":"bell","circle:cx=12,cy=12,r=3|path:M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.08a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z":"gear","circle:cx=12,cy=12,r=1|circle:cx=19,cy=12,r=1|circle:cx=5,cy=12,r=1":"dots-three-vertical","path:M21 12V7H5a2 2 0 0 1 0-4h14v4|path:M3 5v14a2 2 0 0 0 2 2h16v-5|path:M18 12a2 2 0 0 0 0 4h4v-4z":"wallet","rect:x=3,y=8,width=18,height=4,rx=1|path:M12 8v13|path:M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7|path:M7.5 8a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8s1-5 4.5-5a2.5 2.5 0 0 1 0 5":"gift","path:M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2|path:M18 14h-8M15 18h-5M10 6h8v4h-8z":"newspaper","path:M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16|rect:x=2,y=6,width=20,height=14,rx=2":"briefcase","path:M20 12v10H4V12|path:M2 7h20v5H2z|path:M12 22V7":"package","path:M21.42 10.92a1 1 0 0 0-.02-1.84L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.83l8.57 3.91a2 2 0 0 0 1.66 0z|path:M22 10v6|path:M6 12.5V16a6 3 0 0 0 12 0v-3.5":"graduation-cap","circle:cx=12,cy=8,r=4|path:M4 21v-1a7 7 0 0 1 16 0v1":"user","path:M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4|path:m16 17 5-5-5-5|path:M21 12H9":"sign-out","path:m6 9 6 6 6-6":"caret-down","circle:cx=9,cy=7,r=3|circle:cx=17,cy=9,r=3|path:M2 21v-1a6 6 0 0 1 12 0v1M14 21v-1a6 6 0 0 1 8-5.6":"users-three","circle:cx=11,cy=11,r=7|path:m21 21-4.3-4.3":"magnifying-glass","path:M3 3v18h18|path:m7 15 3-3 3 2 5-7":"chart-line","path:M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4|path:m7 10 5 5 5-5|path:M12 15V3":"download-simple","path:M18 6 6 18M6 6l12 12":"x","rect:x=3,y=3,width=18,height=18,rx=2|path:M9 3v18M15 3v18":"columns","path:M22 3H2l8 9.46V19l4 2v-8.54z":"funnel","path:M8 2v4M16 2v4|rect:x=3,y=4,width=18,height=18,rx=2|path:M3 10h18":"calendar-blank","path:M4 7h16M7 12h10M10 17h4":"funnel-simple","path:M5 12h14|path:m13 6 6 6-6 6":"arrow-right","path:M3 8V3h5|path:M21 8V3h-5|path:M3 16v5h5|path:M21 16v5h-5":"arrows-out-simple","path:M8.7 3A6 6 0 0 1 18 8c0 7 3 9 3 9h-4|path:M6.3 6.3A6 6 0 0 0 6 8c0 7-3 9-3 9h10|path:M10.3 21a1.94 1.94 0 0 0 3.4 0|path:m2 2 20 20":"bell-slash","path:m15 18-6-6 6-6":"caret-left","rect:x=3,y=11,width=18,height=11,rx=2|path:M7 11V7a5 5 0 0 1 10 0v4":"lock-simple","defs:":"dots-three-vertical","path:M12 9v4M12 17h.01|path:M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z":"warning","path:M12 5v14M5 12h14":"plus","path:M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z|path:M14 2v6h6":"file","path:M12 3l1.9 4.6L18.5 9.5 13.9 11.4 12 16l-1.9-4.6L5.5 9.5l4.6-1.9z|path:M18.5 15.5l.8 1.9 1.9.8-1.9.8-.8 1.9-.8-1.9-1.9-.8 1.9-.8z":"sparkle","path:M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4|path:M7 10l5-5 5 5M12 5v13":"upload-simple","path:M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2|circle:cx=9,cy=7,r=4|path:M19 8v6M22 11h-6":"user-plus","path:M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z|path:M12 9v4M12 17h.01":"warning","path:M7 7 17 17M17 7v10H7":"arrow-up-right","path:m7 15 5 5 5-5M7 9l5-5 5 5":"arrows-down-up","path:M3 9h18M3 15h18M9 3v18|rect:x=3,y=3,width=18,height=18,rx=2":"table","path:M12 2 2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5":"stack","path:M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6":"user","circle:cx=3,cy=6,r=1.4|circle:cx=3,cy=12,r=1.4|circle:cx=3,cy=18,r=1.4|circle:cx=9,cy=6,r=1.4|circle:cx=9,cy=12,r=1.4|circle:cx=9,cy=18,r=1.4":"dots-six-vertical","path:M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6|path:M15 3h6v6|path:M10 14 21 3":"arrow-square-out","rect:x=2,y=3,width=20,height=5,rx=1|path:M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8|path:M10 12h4":"archive","circle:cx=12,cy=12,r=4|path:M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41":"sun","path:M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z":"moon","path:M20 6 9 17l-5-5":"check","path:M5 12h14M13 6l6 6-6 6":"arrow-right","path:M8.7 3A6 6 0 0 1 18 8c0 7 3 9 3 9h-4|path:M6.3 6.3A6 6 0 0 0 6 8c0 7-3 9-3 9h10|path:m2 2 20 20":"bell-slash","path:M9 17H7A5 5 0 0 1 7 7h2M15 7h2a5 5 0 0 1 0 10h-2M8 12h8":"link","rect:x=3,y=5,width=18,height=14,rx=2|circle:cx=9,cy=10,r=1.6|path:m5 17 5-5 4 4 2-2 3 3":"image","path:M7 17 17 7M8 7h9v9":"arrow-up-right","path:m9 6 6 6-6 6":"caret-right","path:m5 13 4 4L19 7":"check","path:M12 3v12m0 0 4-4m-4 4-4-4|path:M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2":"download-simple","rect:x=2,y=4,width=20,height=16,rx=2|path:m2 7 10 6 10-6":"envelope","circle:cx=12,cy=12,r=9|path:M12 8v4l2.5 1.5":"clock"});
  const keyOf=svg=>[...svg.children].map(e=>e.tagName.toLowerCase()+':'+(e.getAttribute('d')||[...e.attributes].filter(a=>!a.name.startsWith('data-')&&!a.name.startsWith('aria-')).map(a=>a.name+'='+a.value).join(','))).join('|');
  function swap(svg){
    if(svg.dataset.phDone)return;
    if(svg.hasAttribute('data-noswap')||svg.closest('[data-noswap]')){svg.dataset.phDone='1';return;}
    const name=PH[keyOf(svg)];
    if(!name){svg.dataset.phDone='1';return;}
    const cs=getComputedStyle(svg);
    const w=parseFloat(cs.width)||16, hh=parseFloat(cs.height)||w;
    let col=cs.stroke; if(!col||col==='none') col=cs.fill;
    const i=document.createElement('i');
    i.className='ph ph-'+name+(svg.getAttribute('class')?' '+svg.getAttribute('class'):'');
    i.dataset.phDone='1';
    i.style.cssText='font-size:'+(Math.max(w,hh)*1.12).toFixed(1)+'px;width:'+w+'px;height:'+hh+'px;line-height:1;flex:none;display:inline-flex;align-items:center;justify-content:center;overflow:visible';
    if(col&&col!=='none'&&!/currentcolor/i.test(col)&&!svg.closest('.sidebar'))i.style.color=col;
    const t=svg.getAttribute('aria-label'); if(t)i.setAttribute('aria-label',t); else i.setAttribute('aria-hidden','true');
    svg.replaceWith(i);
  }
  /* Mel Copilot keeps its own Lucide icon set — never phosphor-swap inside it */
  const SKIP='.spark,.melpage,.mpal,.mmodalwrap,.sonner';
  const sweep=root=>{(root.querySelectorAll?root.querySelectorAll('svg'):[]).forEach(s=>{if(!s.closest(SKIP))swap(s);});};
  function start(){
    sweep(document);
    new MutationObserver(muts=>{
      for(const mu of muts) for(const n of mu.addedNodes){
        if(n.nodeType!==1)continue;
        if(n.tagName==='svg'){if(!n.closest(SKIP))swap(n);} else sweep(n);
      }
    }).observe(document.body,{childList:true,subtree:true});
  }
  /* only swap once the Phosphor face is really available — otherwise Lucide stays */
  const go=()=>{
    if(!document.fonts||!document.fonts.load){start();return;}
    document.fonts.load('16px Phosphor','\ue000').then(()=>{
      if(document.fonts.check('16px Phosphor'))start();
    }).catch(()=>{});
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',go); else go();
})();
