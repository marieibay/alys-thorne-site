/* ===== HERO SCENE ===== */
(function(){
const cv=document.getElementById('scene'),ctx=cv.getContext('2d');
let W,H,dpr,stars,sky,city,moonTex,moonR,moonXf,moonYf,cloudA,cloudV,cloudB,tmp,tctx,rain,bats=[],flash=0,nextFlash=4000,nextBat=3000,mx=0,my=0,tx=0,ty=0,realMoon=null;
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const rnd=(a,b)=>a+Math.random()*(b-a);
const mk=(w,h)=>{const c=document.createElement('canvas');c.width=Math.max(1,Math.round(w));c.height=Math.max(1,Math.round(h));return c};
const sstep=(a,b,x)=>{x=Math.min(1,Math.max(0,(x-a)/(b-a)));return x*x*(3-2*x)};
const lerp=(a,b,t)=>a+(b-a)*t;

function hash(x,y,s){let h=(x*374761393+y*668265263+s*982451653)|0;h=(h^(h>>>13))*1274126177|0;return((h^(h>>>16))>>>0)/4294967295}
function vnoise(x,y,P,s){
  const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi,u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf);
  const w=P?(a=>((a%P)+P)%P):(a=>a);
  const a=hash(w(xi),yi,s),b=hash(w(xi+1),yi,s),c=hash(w(xi),yi+1,s),d=hash(w(xi+1),yi+1,s);
  return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v;
}
function fbm(x,y,oct,P,s){let a=.5,f=1,sum=0,n=0;for(let o=0;o<oct;o++){sum+=a*vnoise(x*f,y*f,P?P*f:0,s+o);n+=a;a*=.5;f*=2}return sum/n}

function buildSky(){
  sky=mk(W,H);const g=sky.getContext('2d');
  const gr=g.createLinearGradient(0,0,0,H);
  gr.addColorStop(0,'#04040a');gr.addColorStop(.4,'#0d0816');gr.addColorStop(.72,'#2a1020');gr.addColorStop(1,'#431320');
  g.fillStyle=gr;g.fillRect(0,0,W,H);
  const dome=g.createRadialGradient(W*.5,H*.8,0,W*.5,H*.8,W*.7);
  dome.addColorStop(0,'rgba(255,110,70,.12)');dome.addColorStop(1,'rgba(255,110,70,0)');
  g.fillStyle=dome;g.fillRect(0,0,W,H);
  stars=[];for(let i=0;i<190;i++)stars.push({x:rnd(0,W),y:rnd(0,H*.55),r:rnd(.3,1.3),p:rnd(0,7),s:rnd(.5,2)});
}

function buildFallbackMoon(){
  const R=moonR,D=R*2,c=mk(D,D),g=c.getContext('2d'),img=g.createImageData(D,D),px=img.data;
  const L=[-.5,-.55,.67],ln=Math.hypot(...L);L[0]/=ln;L[1]/=ln;L[2]/=ln;
  for(let y=0;y<D;y++)for(let x=0;x<D;x++){
    const nx=(x+.5-R)/R,ny=(y+.5-R)/R,rr=nx*nx+ny*ny,i=(y*D+x)*4;if(rr>=1.02)continue;
    const nz=Math.sqrt(Math.max(0,1-rr)),lam=Math.max(0,nx*L[0]+ny*L[1]+nz*L[2]);
    const mar=lerp(1,.5,sstep(.46,.6,fbm(nx*1.7+4,ny*1.7+9,4,0,3))),hi=.8+fbm(nx*7,ny*7,5,0,11)*.42;
    const lum=Math.min(1,(.12+.88*Math.pow(lam,.72))*Math.pow(nz,.45)*mar*hi);
    px[i]=lerp(48,255,lum);px[i+1]=lerp(4,108,Math.pow(lum,1.9));px[i+2]=lerp(14,92,Math.pow(lum,2.2));
    px[i+3]=255*(1-sstep(.97,1.01,Math.sqrt(rr)));
  }
  g.putImageData(img,0,0);moonTex=c;
}
function loadRealMoon(){
  const im=new Image();im.crossOrigin='anonymous';
  im.onload=()=>{try{
    const sw=im.naturalWidth,sh=im.naturalHeight,sc=Math.min(1,900/Math.max(sw,sh));
    const w=Math.round(sw*sc),h=Math.round(sh*sc),c0=mk(w,h),g0=c0.getContext('2d',{willReadFrequently:true});
    g0.drawImage(im,0,0,w,h);const d0=g0.getImageData(0,0,w,h).data;
    let x0=w,x1=0,y0=h,y1=0;
    for(let y=0;y<h;y+=2)for(let x=0;x<w;x+=2){const i=(y*w+x)*4;if((d0[i]+d0[i+1]+d0[i+2])/3>30){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y}}
    if(x1-x0<w*.3){x0=0;x1=w;y0=0;y1=h}
    const cx=(x0+x1)/2,cy=(y0+y1)/2,r=Math.min(x1-x0,y1-y0)/2;
    const S=Math.min(900,Math.round(moonR*4)),o=mk(S,S),og=o.getContext('2d',{willReadFrequently:true});
    og.drawImage(c0,cx-r,cy-r,2*r,2*r,0,0,S,S);
    const id=og.getImageData(0,0,S,S),p=id.data,Rr=S/2;
    for(let y=0;y<S;y++)for(let x=0;x<S;x++){
      const i=(y*S+x)*4,nx=(x+.5-Rr)/Rr,ny=(y+.5-Rr)/Rr,d=Math.sqrt(nx*nx+ny*ny);
      if(d>=1){p[i+3]=0;continue}
      let l=(p[i]+p[i+1]+p[i+2])/765;
      l=Math.min(1,Math.pow(l*1.35,1.05))*(1-.38*Math.pow(d,3.2));
      p[i]=lerp(34,255,Math.pow(l,.85));p[i+1]=lerp(3,112,Math.pow(l,1.9));p[i+2]=lerp(10,96,Math.pow(l,2.3));
      p[i+3]=255*(1-sstep(.972,.996,d));
    }
    og.putImageData(id,0,0);realMoon=o;moonTex=o;
  }catch(e){}};
  im.src='assets/img/moon.webp';
}
function buildMoon(){
  moonR=Math.round(Math.min(W,H)*(W<700?.2:.15));
  if(realMoon){moonTex=realMoon}else{buildFallbackMoon();loadRealMoon()}
}

function cloudLayer(wCss,hCss,o){
  const sc=3,w=Math.ceil(wCss/sc),h=Math.ceil(hCss/sc),c=mk(w,h),g=c.getContext('2d'),img=g.createImageData(w,h),p=img.data;
  const cells=o.cells,sx=cells/w,sy=sx*o.stretch;
  for(let y=0;y<h;y++){
    const m=Math.exp(-Math.pow((y/h-o.cy)/o.hh,2));
    for(let x=0;x<w;x++){
      const nx=x*sx,ny=y*sy,d=fbm(nx,ny,5,cells,o.seed)*(.25+.9*m),a=sstep(o.cover,o.cover+.2,d);
      if(a<=0.003)continue;
      const dUp=fbm(nx,ny-.18,5,cells,o.seed)*(.25+.9*Math.exp(-Math.pow(((y-.18/sy)/h-o.cy)/o.hh,2)));
      const lit=Math.min(1,Math.max(0,(d-dUp)*7))*o.lit,i=(y*w+x)*4;
      p[i]=lerp(o.col[0],o.rim[0],lit);p[i+1]=lerp(o.col[1],o.rim[1],lit);p[i+2]=lerp(o.col[2],o.rim[2],lit);p[i+3]=255*a*o.alpha;
    }
  }
  g.putImageData(img,0,0);return {c,w:w*sc,h:h*sc};
}
function buildClouds(){
  cloudA=cloudLayer(W*2,H*.46,{cells:8,stretch:2.4,cy:.5,hh:.42,cover:.43,col:[74,28,50],rim:[255,120,120],lit:.9,alpha:.8,seed:7});
  cloudV=cloudLayer(W*2,H*.34,{cells:6,stretch:2.6,cy:.5,hh:.26,cover:.33,col:[34,16,34],rim:[235,100,108],lit:.85,alpha:.97,seed:41});
  cloudB=cloudLayer(W*2,H*.42,{cells:8,stretch:2.8,cy:.55,hh:.34,cover:.44,col:[11,6,15],rim:[170,50,66],lit:.7,alpha:.96,seed:23});
  tmp=mk(W,H);tctx=tmp.getContext('2d');
}
function drawClouds(L,speed,y,t,par,mX,mY,glowK){
  tctx.clearRect(0,0,W,H);tctx.globalCompositeOperation='source-over';
  const w=L.w/2,off=((t*speed)%w+w)%w,px=-mx*par;
  for(let k=-1;k<3;k++)tctx.drawImage(L.c,-off+k*w+px,y,L.w,L.h);
  tctx.globalCompositeOperation='source-atop';
  const g=tctx.createRadialGradient(mX,mY,moonR*.5,mX,mY,moonR*6);
  g.addColorStop(0,`rgba(255,70,80,${.6*glowK})`);g.addColorStop(.35,`rgba(200,40,60,${.28*glowK})`);g.addColorStop(1,'rgba(120,20,40,0)');
  tctx.fillStyle=g;tctx.fillRect(0,0,W,H);
  ctx.drawImage(tmp,0,0);
}

/* ---- CITY: windows are now sparse, dim, and fade out toward the lower third so the UI stays readable ---- */
const WARM=['#ffd28a','#ffc070','#ffe4b0','#ffcf9a','#ffd9a0'];
function bld(g,x,by,w,h,type){
  g.beginPath();
  switch(type){
    case 'gothic':{
      g.rect(x,by-h,w,h+H);g.fill();
      g.beginPath();g.moveTo(x-1,by-h);g.lineTo(x+w/2,by-h-w*rnd(1.1,1.9));g.lineTo(x+w+1,by-h);g.fill();
      g.beginPath();g.moveTo(x-1,by-h);g.lineTo(x+1.5,by-h-w*.5);g.lineTo(x+4,by-h);g.fill();
      g.beginPath();g.moveTo(x+w-4,by-h);g.lineTo(x+w-1.5,by-h-w*.5);g.lineTo(x+w+1,by-h);g.fill();break}
    case 'step':{
      g.rect(x,by-h*.62,w,h*.62+H);g.rect(x+w*.12,by-h*.82,w*.76,h*.3);g.rect(x+w*.28,by-h,w*.44,h*.3);g.rect(x+w*.48,by-h*1.18,Math.max(1.5,w*.04),h*.2);g.fill();break}
    case 'glass':{
      g.moveTo(x,by-h);g.lineTo(x+w,by-h-w*.28);g.lineTo(x+w,by+H);g.lineTo(x,by+H);g.closePath();g.fill();break}
    default:{
      g.rect(x,by-h,w,h+H);
      if(Math.random()<.35)g.rect(x+w*rnd(.1,.5),by-h-h*.07,w*rnd(.2,.35),h*.07);
      if(Math.random()<.3)g.rect(x+w*.5,by-h-h*.22,1.6,h*.22);
      g.fill();
    }
  }
}
function figure(g,cx,roofY,s){
  g.beginPath();g.moveTo(cx-s*.36,roofY);g.lineTo(cx-s*.2,roofY-s*2);g.lineTo(cx+s*.2,roofY-s*2);g.lineTo(cx+s*.4,roofY);g.closePath();g.fill();
  g.beginPath();g.arc(cx,roofY-s*2.35,s*.27,0,7);g.fill();
}
function gargoyle(g,cx,by,s){
  g.beginPath();g.ellipse(cx,by-s*.7,s*.55,s*.72,0,0,7);g.fill();
  g.beginPath();g.ellipse(cx+s*.1,by-s*1.55,s*.36,s*.3,0,0,7);g.fill();
  g.beginPath();g.moveTo(cx-s*.2,by-s*1.72);g.lineTo(cx-s*.4,by-s*2.2);g.lineTo(cx-s*.02,by-s*1.82);g.fill();
  g.beginPath();g.moveTo(cx+s*.3,by-s*1.8);g.lineTo(cx+s*.55,by-s*2.25);g.lineTo(cx+s*.5,by-s*1.7);g.fill();
  g.beginPath();g.moveTo(cx-s*.35,by-s*1.2);g.lineTo(cx-s*1.55,by-s*1.95);g.lineTo(cx-s*1.1,by-s*1.1);g.lineTo(cx-s*1.5,by-s*.75);g.lineTo(cx-s*.5,by-s*.5);g.fill();
  g.beginPath();g.moveTo(cx+s*.45,by-s*1.2);g.lineTo(cx+s*1.6,by-s*1.95);g.lineTo(cx+s*1.15,by-s*1.1);g.lineTo(cx+s*1.55,by-s*.75);g.lineTo(cx+s*.55,by-s*.5);g.fill();
  g.fillRect(cx-s*.7,by-s*.18,s*1.4,s*.2);
}
function blackspire(g,x,by,h,lights,li){
  g.beginPath();
  g.rect(x-36,by-h*.5,72,h*.5+H);
  g.rect(x-27,by-h*.76,54,h*.28);
  g.rect(x-18,by-h*.89,36,h*.15);
  g.fill();
  g.beginPath();g.moveTo(x-19,by-h*.89);g.lineTo(x,by-h);g.lineTo(x+19,by-h*.89);g.fill();
  [[x-31,by-h*.76],[x+31,by-h*.76],[x-22,by-h*.89],[x+22,by-h*.89]].forEach(p=>{
    g.beginPath();g.moveTo(p[0]-5,p[1]);g.lineTo(p[0],p[1]-h*.07);g.lineTo(p[0]+5,p[1]);g.fill()});
  g.fillRect(x-1,by-h*1.07,2,h*.08);
  for(let r=0;r<6;r++)for(let c=-1;c<=1;c+=2){
    lights[li].push({k:'slit',x:x+c*9-1.5,y:by-h*.84+r*h*.052,w:3,h:h*.03,ph:rnd(0,7),sp:rnd(.5,1.3)})}
  for(let r=0;r<4;r++)for(let c=-2;c<=2;c+=2){
    lights[li].push({k:'slit',x:x+c*10-1.5,y:by-h*.46+r*h*.06,w:3,h:h*.035,ph:rnd(0,7),sp:rnd(.5,1.3)})}
  lights[li].push({k:'beacon',x:x,y:by-h*1.07,ph:0});
}
const CITY=[
  {base:.74,h:.15,bw:[10,22],col:'#2d1322',rim:'rgba(190,70,92,.85)',gothic:.12,step:.2,glass:.15,pLit:.025,pRed:0,par:5},
  {base:.79,h:.22,bw:[16,34],col:'#1d0d19',rim:'rgba(150,50,70,.8)',gothic:.28,step:.2,glass:.18,pLit:.035,pRed:.004,par:12},
  {base:.86,h:.30,bw:[22,48],col:'#100611',rim:'rgba(110,34,52,.75)',gothic:.28,step:.15,glass:.22,pLit:.05,pRed:.006,par:24,tower:true},
  {base:.94,h:.26,bw:[30,70],col:'#08040b',rim:'rgba(78,22,38,.7)',gothic:.2,step:.12,glass:.2,pLit:.04,pRed:.004,par:42,figure:true},
  {base:1,h:0,bw:[0,0],col:'#020104',rim:'rgba(48,12,24,.6)',gothic:0,step:0,glass:0,pLit:0,pRed:0,par:76,fg:true}
];
function buildCity(){
  city=[];
  CITY.forEach((d,li)=>{
    const w=Math.round(W*1.3),t=mk(w,H),g=t.getContext('2d'),by=H*d.base,lights=[[],[],[],[],[]],wins=[];
    g.fillStyle=d.col;
    let towerX=w*.77,gx=0,gy=0;
    if(d.fg){
      const top=H*.945;
      g.fillRect(0,top,w,H-top);
      for(let x=0;x<w;x+=Math.max(34,H*.05)){g.fillRect(x,top-H*.022,Math.max(18,H*.028),H*.022)}
      gx=w*.3;gy=top-H*.022;
      gargoyle(g,gx,gy,Math.max(26,H*.06));
      g.fillRect(w*.8,top-H*.07,H*.05,H*.07);g.beginPath();g.moveTo(w*.8-3,top-H*.07);g.lineTo(w*.8+H*.025,top-H*.12);g.lineTo(w*.8+H*.05+3,top-H*.07);g.fill();
    }else{
      let x=-10,idx=0;
      while(x<w+10){
        const bw=rnd(d.bw[0],d.bw[1]),hh=H*d.h*rnd(.3,1),r=Math.random();
        let type=r<d.gothic?'gothic':r<d.gothic+d.step?'step':r<d.gothic+d.step+d.glass?'glass':'flat';
        if(d.figure&&idx===9)type='flat';
        bld(g,x,by,bw,hh,type);
        if(!(d.tower&&Math.abs(x+bw/2-towerX)<60))wins.push({x,y:by-hh,w:bw,h:hh});
        if(d.figure&&idx===9){figure(g,x+bw*.5,by-hh,H*.034);lights[li].push({k:'eye',x:x+bw*.5-2.5,y:by-hh-H*.034*2.38,off:5200,r:.9},{k:'eye',x:x+bw*.5+2.5,y:by-hh-H*.034*2.38,off:5200,r:.9})}
        x+=bw+rnd(0,3);idx++;
      }
      g.fillRect(0,by,w,H-by);
      if(d.tower)blackspire(g,towerX,by,H*.5,lights,li);
    }
    const r=mk(w,H),rg=r.getContext('2d');
    rg.drawImage(t,0,0);rg.globalCompositeOperation='source-in';rg.fillStyle=d.rim;rg.fillRect(0,0,w,H);
    const c=mk(w,H),cg=c.getContext('2d');cg.drawImage(r,0,-2.2);cg.drawImage(t,0,0);
    wins.forEach(b=>{
      const cols=Math.floor((b.w-4)/9),rows=Math.floor((b.h-8)/12);
      for(let rr=0;rr<rows;rr++)for(let cc=0;cc<cols;cc++){
        const wx=b.x+3+cc*9,wy=b.y+6+rr*12,q=Math.random();
        const fade=1-sstep(H*.5,H*.7,wy);           /* no windows in the lower third (behind the buttons) */
        if(q<d.pLit*fade){cg.globalAlpha=rnd(.16,.42);cg.fillStyle=WARM[(Math.random()*WARM.length)|0];cg.fillRect(wx,wy,2.8,4.2)}
        else if(q<d.pLit*fade+d.pRed*fade){lights[li].push({k:'win',x:wx,y:wy,w:2.8,h:4.2,ph:rnd(0,7),sp:rnd(.5,1.4)})}
      }
    });
    cg.globalAlpha=1;
    if(d.fg){const s=Math.max(26,H*.06);lights[li].push({k:'eye',x:gx-s*.06,y:gy-s*1.58,off:0,r:1.6},{k:'eye',x:gx+s*.26,y:gy-s*1.58,off:0,r:1.6})}
    city.push({c,par:d.par,lights:lights[li]});
  });
}
function drawLights(f,t){
  const ox=-W*.15-mx*f.par,oy=-my*f.par*.3;
  for(const l of f.lights){
    const sx=l.x+ox,sy=l.y+oy;
    if(sx<-20||sx>W+20)continue;
    if(l.k==='eye'){
      const ph=(t+l.off)%15000;if(ph>2600)continue;
      const a=Math.sin(Math.PI*ph/2600);
      ctx.fillStyle=`rgba(255,40,60,${a})`;ctx.shadowColor='#ff2840';ctx.shadowBlur=10;
      ctx.beginPath();ctx.ellipse(sx,sy,l.r*1.4,l.r*.8,0,0,7);ctx.fill();ctx.shadowBlur=0;continue;
    }
    if(l.k==='beacon'){
      const a=.15+.85*Math.max(0,Math.sin(t*.0025)),g=ctx.createRadialGradient(sx,sy,0,sx,sy,26);
      g.addColorStop(0,`rgba(255,60,80,${a})`);g.addColorStop(1,'rgba(255,40,60,0)');
      ctx.fillStyle=g;ctx.fillRect(sx-26,sy-26,52,52);continue;
    }
    let a=.4+.28*Math.sin(t*.0017*l.sp+l.ph)+flash*.5;
    if(Math.sin(t*.0003*l.sp+l.ph*3)>.94)a*=.12;
    a=Math.min(1,Math.max(0,a));
    ctx.fillStyle=`rgba(255,45,70,${a*.16})`;ctx.fillRect(sx-2,sy-2,l.w+4,l.h+4);
    ctx.fillStyle=`rgba(255,55,80,${a*.9})`;ctx.fillRect(sx,sy,l.w,l.h);
  }
}
function initRain(){
  rain=[];const n=Math.min(200,Math.round(W/7));
  for(let i=0;i<n;i++)rain.push({x:rnd(0,W),y:rnd(0,H),l:rnd(8,18),v:rnd(11,19),a:rnd(.08,.22)});
}
function drawRain(){
  ctx.lineWidth=1;
  for(const d of rain){
    d.y+=d.v;d.x-=d.v*.12;
    if(d.y>H){d.y=-20;d.x=rnd(0,W+60)}
    ctx.strokeStyle=`rgba(190,200,235,${d.a})`;ctx.beginPath();ctx.moveTo(d.x,d.y);ctx.lineTo(d.x-d.l*.12,d.y+d.l);ctx.stroke();
  }
}
function resize(){
  dpr=Math.min(devicePixelRatio||1,2);
  W=cv.clientWidth;H=cv.clientHeight;cv.width=W*dpr;cv.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);
  moonXf=W>800?.77:.72;moonYf=W>800?.27:.2;
  buildSky();buildMoon();buildClouds();buildCity();initRain();
}
let rt;addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(resize,200)});
addEventListener('mousemove',e=>{tx=(e.clientX/innerWidth-.5);ty=(e.clientY/innerHeight-.5)},{passive:true});

function fogBand(yFrac,a){
  const y=H*yFrac,g=ctx.createLinearGradient(0,y-H*.1,0,y+H*.14);
  g.addColorStop(0,'rgba(120,30,52,0)');g.addColorStop(.55,`rgba(110,28,50,${a})`);g.addColorStop(1,'rgba(40,10,22,0)');
  ctx.fillStyle=g;ctx.fillRect(0,y-H*.1,W,H*.24);
}
function drawBat(b,t){
  const f=Math.sin(t*.02*b.sp+b.ph)*b.s*.7;
  ctx.fillStyle='#050308';ctx.beginPath();ctx.moveTo(b.x,b.y);
  ctx.quadraticCurveTo(b.x-b.s*.6,b.y-b.s*.9-f,b.x-b.s*1.5,b.y-f*.4);
  ctx.quadraticCurveTo(b.x-b.s*.8,b.y+b.s*.1,b.x,b.y+b.s*.35);
  ctx.quadraticCurveTo(b.x+b.s*.8,b.y+b.s*.1,b.x+b.s*1.5,b.y-f*.4);
  ctx.quadraticCurveTo(b.x+b.s*.6,b.y-b.s*.9-f,b.x,b.y);ctx.fill();
}
let last=0;
function frame(t){
  const dt=Math.min(t-last,50);last=t;
  mx+=(tx-mx)*.04;my+=(ty-my)*.04;
  ctx.clearRect(0,0,W,H);
  ctx.drawImage(sky,0,0,W,H);
  stars.forEach(s=>{const a=.35+.65*Math.abs(Math.sin(t*.001*s.s+s.p));
    ctx.fillStyle=`rgba(225,215,230,${a*.7})`;ctx.fillRect(s.x-mx*6,s.y-my*4,s.r,s.r)});

  const mxp=W*moonXf-mx*18,myp=H*moonYf-my*10,pulse=1+Math.sin(t*.0006)*.05;
  let g=ctx.createRadialGradient(mxp,myp,moonR*.9,mxp,myp,moonR*8*pulse);
  g.addColorStop(0,'rgba(200,30,58,.5)');g.addColorStop(.18,'rgba(160,20,46,.26)');g.addColorStop(.5,'rgba(90,12,34,.1)');g.addColorStop(1,'rgba(40,6,20,0)');
  ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  ctx.drawImage(moonTex,mxp-moonR,myp-moonR,moonR*2,moonR*2);
  g=ctx.createRadialGradient(mxp,myp,moonR*.97,mxp,myp,moonR*1.16);
  g.addColorStop(0,'rgba(255,90,90,.22)');g.addColorStop(1,'rgba(255,90,90,0)');
  ctx.fillStyle=g;ctx.beginPath();ctx.arc(mxp,myp,moonR*1.2,0,7);ctx.fill();

  nextBat-=dt;
  if(nextBat<0&&!reduce){nextBat=rnd(5000,11000);const n=Math.floor(rnd(2,5)),dir=Math.random()<.5?1:-1,y0=rnd(H*.15,H*.5);
    for(let i=0;i<n;i++)bats.push({x:dir>0?-30-i*40:W+30+i*40,y:y0+rnd(-30,30),vx:dir*rnd(1.4,2.4),vy:rnd(-.25,.1),s:rnd(5,10),sp:rnd(.8,1.3),ph:rnd(0,6)})}
  bats=bats.filter(b=>b.x>-120&&b.x<W+120);
  bats.forEach(b=>{b.x+=b.vx;b.y+=b.vy+Math.sin(t*.004+b.ph)*.4;drawBat(b,t)});

  drawClouds(cloudA,.016,myp-H*.23,t,10,mxp,myp,1);
  drawClouds(cloudV,.011,myp-H*.17,t+60000,16,mxp,myp,1);

  nextFlash-=dt;
  if(nextFlash<0&&!reduce){nextFlash=rnd(7000,16000);flash=1}
  if(flash>0){
    const lx=W*(.15+Math.random()*.0+.2),lg=ctx.createRadialGradient(lx,H*.16,0,lx,H*.16,W*.42),a=flash*(Math.random()<.5?.4:.2);
    lg.addColorStop(0,`rgba(255,140,160,${a})`);lg.addColorStop(1,'rgba(255,120,140,0)');
    ctx.fillStyle=lg;ctx.fillRect(0,0,W,H);flash-=dt/380;
  }

  const fo=i=>{const f=city[i];ctx.drawImage(f.c,-W*.15-mx*f.par,-my*f.par*.3);drawLights(f,t)};
  fo(0);
  drawClouds(cloudB,.022,H*.3-my*10,t,22,mxp,myp,.55);
  fogBand(.74,.20);fo(1);fogBand(.80,.24);fo(2);fogBand(.9,.22);fo(3);
  drawRain();
  fo(4);
  if(!reduce)requestAnimationFrame(frame);
}
resize();
if(reduce){frame(0)}else{requestAnimationFrame(frame)}
})();
