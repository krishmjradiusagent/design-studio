    (function(){
      var pop=document.getElementById('pke-shpop'),btn=document.getElementById('pke-share');
      if(!pop||!btn)return;
      var opts=document.getElementById('pke-shopts'),accBtn=document.getElementById('pke-shacc');
      function place(){
        var r=btn.getBoundingClientRect(),w=pop.offsetWidth||372,h=pop.offsetHeight||420;
        var left=Math.min(Math.max(12,r.right-w),window.innerWidth-w-12);
        var top=r.bottom+8;
        if(top+h>window.innerHeight-12)top=Math.max(12,r.top-h-8);
        pop.style.left=left+'px';pop.style.top=top+'px';
      }
      function close(){
        if(!pop.classList.contains('open'))return;
        pop.classList.remove('open');btn.setAttribute('aria-expanded','false');
        opts.classList.remove('open');accBtn.setAttribute('aria-expanded','false');
        window.removeEventListener('scroll',place,true);window.removeEventListener('resize',place);
      }
      function open(){
        pop.classList.add('open');btn.setAttribute('aria-expanded','true');place();
        window.addEventListener('scroll',place,true);window.addEventListener('resize',place);
      }
      window.__pkeShare={toggle:function(){pop.classList.contains('open')?close():open()},close:close};
      accBtn.addEventListener('click',function(){
        var on=!opts.classList.contains('open');
        opts.classList.toggle('open',on);accBtn.setAttribute('aria-expanded',on?'true':'false');place();
      });
      opts.addEventListener('click',function(e){
        var b=e.target.closest('[data-shacc]');if(!b)return;
        opts.querySelectorAll('[data-shacc]').forEach(function(x){
          x.classList.toggle('on',x===b);x.setAttribute('aria-selected',x===b?'true':'false');
        });
        var lbl=b.querySelector('.ot b'),ic=b.querySelector('svg');
        document.getElementById('pke-shacct').textContent=lbl?lbl.textContent:'';
        if(ic)document.getElementById('pke-shaccic').innerHTML=ic.outerHTML;
        opts.classList.remove('open');accBtn.setAttribute('aria-expanded','false');place();
        if(window.sonner)sonner('Access updated',lbl?lbl.textContent:'');
      });
      document.getElementById('pke-shcopy').addEventListener('click',function(){
        var url='https://radius.co/d/1420-grove-st-feed-post';
        var done=function(){if(window.sonner)sonner('Link copied','radius.co/d/1420-grove-st-feed-post')};
        if(navigator.clipboard&&navigator.clipboard.writeText){
          navigator.clipboard.writeText(url).then(done,function(err){
            console.warn('[pke-share] clipboard blocked: '+err);done();
          });
        }else{console.warn('[pke-share] clipboard API unavailable');done()}
      });
      var ppl=document.getElementById('pke-shppl');
      function invite(){
        var v=(ppl.value||'').trim();
        if(!v){ppl.focus();return}
        if(window.sonner)sonner('Invite sent',v+' can now view this design');
        ppl.value='';
      }
      ppl.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();invite()}});
      document.getElementById('pke-shadd').addEventListener('click',invite);
      document.getElementById('pke-shclose').addEventListener('click',close);
      var ACT={
        settings:['Link settings','Expiry, password and download permissions'],
        dl:['Downloading','PNG export of this asset'],
        ig:['Sending to Instagram','Opens your connected @kri.sf account'],
        fb:['Sending to Facebook','Posts to Radius SF page'],
        link:['Public link ready','Anyone with the link can view this design'],
        phone:['Sent to your phone','Check the Radius app on iPhone'],
        email:['Draft ready','Emailing the Torres family'],
        all:['All destinations','Zillow, LinkedIn, Nextdoor, Mailchimp and more']
      };
      pop.addEventListener('click',function(e){
        var a=e.target.closest('[data-shact]');if(!a)return;
        var k=a.getAttribute('data-shact');
        if(k==='sched'){
          close();
          var m=document.getElementById('pke-schedmodal');
          if(m){m.classList.add('open');m.setAttribute('aria-hidden','false')}
          return;
        }
        var t=ACT[k];if(t&&window.sonner)sonner(t[0],t[1]);
        if(k!=='settings')close();
      });
      document.addEventListener('click',function(e){
        if(!pop.classList.contains('open'))return;
        if(e.target.closest('#pke-shpop')||e.target.closest('#pke-share'))return;
        close();
      });
      document.addEventListener('keydown',function(e){if(e.key==='Escape')close()});
    })();
    
