/* ================= sidebar shell: collapse rail, rail tooltips, profile menu, more flyout ================= */
(function(){
  const app=document.querySelector('.app'),sb=document.querySelector('.sidebar');
  if(!app||!sb)return;

  /* label every rail row for the collapsed-state tooltip */
  const label=el=>{
    const t=[...el.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent).join(' ').replace(/\s+/g,' ').trim();
    return t||el.getAttribute('title')||'';
  };
  sb.querySelectorAll(':scope > .nav, :scope > .mel').forEach(row=>{
    const t=label(row);if(t)row.setAttribute('data-tip',t);
  });
  const ptop=sb.querySelector('.profiletop');
  if(ptop)ptop.setAttribute('data-tip',(ptop.querySelector('.pname')||{textContent:'Account'}).textContent.trim());

  document.querySelectorAll('.content .phead .sbtoggle').forEach(sbt=>sbt.addEventListener('click',e=>{
    e.stopPropagation();
    document.querySelectorAll('.morewrap.open').forEach(o=>o.classList.remove('open'));
    const pm=document.getElementById('pmenu');if(pm)pm.classList.remove('open');
  }));

  const more=document.getElementById('more');
  if(more)more.addEventListener('click',e=>{
    if(e.target.closest('.flyout'))return;
    e.stopPropagation();more.classList.toggle('open');
  });

  const pmenu=document.getElementById('pmenu');
  if(ptop&&pmenu)ptop.addEventListener('click',e=>{e.stopPropagation();pmenu.classList.toggle('open')});

  const logout=document.getElementById('logoutbtn');
  if(logout)logout.addEventListener('click',e=>{
    e.stopPropagation();pmenu.classList.remove('open');
    if(window.sonner)sonner('Signed out','You have been logged out of Radius');
  });

  document.addEventListener('click',e=>{
    if(pmenu&&!e.target.closest('.pwrap'))pmenu.classList.remove('open');
    if(more&&!e.target.closest('.morewrap'))more.classList.remove('open');
  });
  document.addEventListener('keydown',e=>{
    if(e.key!=='Escape')return;
    if(pmenu)pmenu.classList.remove('open');
    if(more)more.classList.remove('open');
  });
})();

