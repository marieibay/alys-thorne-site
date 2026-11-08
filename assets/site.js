/* ============ SITE SETTINGS — edit these, nothing else needed ============ */
const SITE = {
  social: {                 // paste full profile URLs; empty ones stay hidden automatically
    instagram: 'https://www.instagram.com/alysthornebooks/',
    tiktok: '',
    x: ''
  },
  contactEmail: 'alysthorne@gmail.com',         // e.g. 'hello@yourdomain.com' (shows an Email button)
  newsletterAction: 'https://script.google.com/macros/s/AKfycbygKChDfA1rZa0gI9kVTXhKPG_D7CSbrGQLOEvqv_5F4gCXyH2it7jjZaGNW20id5td/exec'      // Google Apps Script web app that saves signups to your Google Sheet
};
/* ========================================================================= */
(function(){
  const $$=s=>[...document.querySelectorAll(s)];
  const y=document.getElementById('yr'); if(y)y.textContent=new Date().getFullYear();

  const nav=document.getElementById('nav'),burger=document.getElementById('burger'),links=document.getElementById('navlinks');
  if(burger)burger.onclick=()=>links.classList.toggle('open');
  if(links)links.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>links.classList.remove('open')));
  const prog=document.getElementById('progress');
  addEventListener('scroll',()=>{
    const h=document.documentElement;
    if(prog)prog.style.width=(h.scrollTop/(h.scrollHeight-h.clientHeight)*100)+'%';
    if(nav&&nav.hasAttribute('data-home'))nav.classList.toggle('solid',scrollY>60);
  },{passive:true});

  const rs=$$('#riddle p');let ri=0;
  if(rs.length)setInterval(()=>{rs[ri].classList.remove('on');ri=(ri+1)%rs.length;rs[ri].classList.add('on')},4200);

  $$('img[data-fallback]').forEach(img=>img.addEventListener('error',()=>{
    img.style.display='none';
    const c=img.parentElement.querySelector('.css-cover');if(c)c.style.opacity=1;
  }));
  $$('.cover-art .css-cover').forEach(c=>c.style.opacity=0);

  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.1});
  $$('.reveal').forEach(el=>io.observe(el));

  $$('.tilt').forEach(c=>{
    c.addEventListener('mousemove',e=>{const r=c.getBoundingClientRect(),x=e.clientX-r.left,yy=e.clientY-r.top;
      c.style.transform=`perspective(900px) rotateY(${(x/r.width-.5)*5}deg) rotateX(${-(yy/r.height-.5)*5}deg) translateY(-4px)`});
    c.addEventListener('mouseleave',()=>c.style.transform='');
  });

  const glow=document.getElementById('glow');
  if(glow)addEventListener('mousemove',e=>{glow.style.opacity=1;glow.style.left=e.clientX+'px';glow.style.top=e.clientY+'px'},{passive:true});

  /* ---------- newsletter -> Google Sheet (name + email) ---------- */
  $$('.nl-form').forEach(f=>{
    const msg=f.parentElement.querySelector('.nl-msg');

    // name box on its own row above the email box
    const nameBox=document.createElement('input');
    nameBox.type='text';nameBox.name='name';nameBox.placeholder='Your first name';nameBox.required=true;
    nameBox.autocomplete='given-name';nameBox.maxLength=80;nameBox.setAttribute('aria-label','Your first name');
    nameBox.style.cssText='flex:1 1 100%;min-width:0;background:transparent;border:0;border-bottom:1px solid var(--line);outline:0;padding:16px 20px;color:var(--text);font:inherit;font-size:18px';
    f.style.flexWrap='wrap';
    f.insertBefore(nameBox,f.firstChild);

    // hidden spam trap: real people never fill this in
    const hp=document.createElement('input');
    hp.type='text';hp.name='website';hp.tabIndex=-1;hp.autocomplete='off';hp.setAttribute('aria-hidden','true');
    hp.style.cssText='position:absolute;left:-9999px;width:1px;height:1px;opacity:0';
    f.appendChild(hp);

    const err=document.createElement('div');
    err.style.cssText='display:none;margin-top:16px;color:#e8708a;font-style:italic';
    (msg||f).after(err);

    f.addEventListener('submit',async e=>{
      e.preventDefault();
      if(msg)msg.style.display='none';err.style.display='none';
      const name=(nameBox.value||'').trim(),email=(f.elements.email.value||'').trim();
      if(!SITE.newsletterAction||hp.value){
        if(msg)msg.style.display='block';f.reset();return;
      }
      const btn=f.querySelector('button[type=submit]'),label=btn.textContent;
      btn.disabled=true;btn.textContent='Sending…';
      try{
        await fetch(SITE.newsletterAction,{
          method:'POST',mode:'no-cors',
          body:new URLSearchParams({name,email,page:(location.pathname.split('/').pop()||'index.html')})
        });
        if(msg){msg.textContent='Welcome'+(name?', '+name:'')+'. The shadows have your name now. ✦';msg.style.display='block'}
        f.reset();
      }catch(_){
        err.textContent='Something went wrong. Please try again in a moment.';err.style.display='block';
      }
      btn.disabled=false;btn.textContent=label;
    });
  });
  if(SITE.newsletterAction)$$('.nl-note').forEach(n=>n.hidden=true);

  $$('a[data-social]').forEach(a=>{
    const k=a.dataset.social;
    const url=k==='email'?(SITE.contactEmail?'mailto:'+SITE.contactEmail:''):SITE.social[k];
    if(url){a.href=url;a.hidden=false;if(k!=='email'){a.target='_blank';a.rel='noopener'}}
  });
  const anySocial=$$('a[data-social]').some(a=>!a.hidden);
  $$('.no-social').forEach(n=>n.hidden=anySocial);
})();
