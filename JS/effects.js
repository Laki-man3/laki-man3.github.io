(function(){
'use strict';

const html=document.documentElement;
const body=document.body;
const PRM=window.matchMedia('(prefers-reduced-motion:reduce)').matches;
const isTouch=('ontouchstart' in window)||navigator.maxTouchPoints>0;

function lerp(a,b,t){return a+(b-a)*t;}
function isDark(){return !html.classList.contains('lt-mode');}
function getThemeColors(){
  const cb=body.classList.contains('cb');
  const lt=html.classList.contains('lt-mode');
  if(cb&&lt)return{p:'rgba(0,91,170,',a:'rgba(204,102,0,',hex:'#005baa'};
  if(cb)    return{p:'rgba(77,184,255,',a:'rgba(255,153,51,',hex:'#4db8ff'};
  if(lt)    return{p:'rgba(0,119,204,',a:'rgba(5,150,105,',hex:'#0077cc'};
  return         {p:'rgba(0,229,255,',a:'rgba(0,255,157,',hex:'#00e5ff'};
}

(function(){
  try{
    const s=JSON.parse(localStorage.getItem('qa-prefs')||'{}');
    if(s.light)html.classList.add('lt-mode');
    if(s.cb)body.classList.add('cb');
    if(s.large)html.classList.add('lt');
    if(s.lang==='en')html.setAttribute('data-init-lang','en');
  }catch(e){}
})();

window.addEventListener('DOMContentLoaded',function(){
  try{
    function savePrefs(){
      localStorage.setItem('qa-prefs',JSON.stringify({
        light:html.classList.contains('lt-mode'),
        cb:body.classList.contains('cb'),
        large:html.classList.contains('lt'),
        lang:html.lang||'ru'
      }));
    }
    ['bTheme','bCb','bZoom','ltog'].forEach(function(id){
      const el=document.getElementById(id);
      if(el)el.addEventListener('click',function(){setTimeout(savePrefs,80);});
    });
    const initLang=html.getAttribute('data-init-lang');
    if(initLang==='en'){
      const ltog=document.getElementById('ltog');
      if(ltog)setTimeout(function(){ltog.click();},50);
    }
  }catch(e){}
});

const cel=document.getElementById('celestial');
if(cel){
  const moonEl=document.createElement('div');
  moonEl.className='body moon-body';
  [{w:18,h:18,t:28,l:18},{w:10,h:10,t:55,l:65},{w:8,h:8,t:20,l:70},{w:14,h:14,t:70,l:30}]
    .forEach(function(c){
      const cr=document.createElement('div');cr.className='crater';
      cr.style.cssText='width:'+c.w+'px;height:'+c.h+'px;top:'+c.t+'px;left:'+c.l+'px';
      moonEl.appendChild(cr);
    });
  const sunEl=document.createElement('div');sunEl.className='body sun-body';
  const halo=document.createElement('div');halo.className='halo';sunEl.appendChild(halo);
  for(let i=0;i<12;i++){
    const ray=document.createElement('div');ray.className='ray';
    const ang=(360/12)*i,len=12+Math.random()*14,th=2+Math.random()*3;
    ray.style.cssText='width:'+th+'px;height:'+len+'px;margin-left:'+(-th/2)+'px;margin-top:'+(-len-64)+'px;transform:rotate('+ang+'deg);animation:rayPulse '+(1.5+Math.random())+'s ease-in-out '+(Math.random()*.8)+'s infinite';
    sunEl.appendChild(ray);
  }
  cel.appendChild(moonEl);cel.appendChild(sunEl);
  if(!document.getElementById('rayKf')){
    const s=document.createElement('style');s.id='rayKf';
    s.textContent='@keyframes rayPulse{0%,100%{opacity:.7}50%{opacity:1;filter:brightness(1.3)}}';
    document.head.appendChild(s);
  }
  if(!PRM){
    let celY=0,celT=0;
    window.addEventListener('scroll',function(){celT=window.scrollY*.35;},{passive:true});
    function celLoop(){requestAnimationFrame(celLoop);celY=lerp(celY,celT,.08);cel.style.transform='translateY('+celY+'px)';}
    celLoop();
  }
}

const canvas=document.getElementById('particle-canvas');
if(canvas&&!PRM){
  const ctx=canvas.getContext('2d');
  let W=0,H=0;
  function resize(){W=canvas.width=window.innerWidth;H=canvas.height=window.innerHeight;}
  resize();
  window.addEventListener('resize',resize,{passive:true});

  const stars=[];
  for(let i=0;i<110;i++)stars.push({x:Math.random(),y:Math.random(),r:.4+Math.random()*1.1,base:.25+Math.random()*.5,ph:Math.random()*Math.PI*2,sp:.2+Math.random()*.9});

  const meteors=[];
  let mTimer=0,lastMTs=0;
  function spawnMeteor(){
    meteors.push({x:Math.random()*W*1.4-W*.2,y:-20,vx:3.5+Math.random()*4,vy:2+Math.random()*3,len:80+Math.random()*120,life:0,maxLife:50+Math.random()*35});
  }
  function tickMeteors(dt){
    mTimer+=dt;
    if(mTimer>4500+Math.random()*7000){mTimer=0;if(isDark()&&Math.random()<.75)spawnMeteor();}
    for(let i=meteors.length-1;i>=0;i--){
      const m=meteors[i];m.x+=m.vx;m.y+=m.vy;m.life++;
      if(m.life>=m.maxLife)meteors.splice(i,1);
    }
  }
  function drawMeteors(){
    meteors.forEach(function(m){
      const t=m.life/m.maxLife;
      const alpha=t<.2?t/.2:t>.65?(1-t)/.35:1;
      const grd=ctx.createLinearGradient(m.x-m.vx/5*m.len,m.y-m.vy/5*m.len,m.x,m.y);
      grd.addColorStop(0,'rgba(255,255,255,0)');
      grd.addColorStop(1,'rgba(255,255,255,'+(alpha*.85)+')');
      ctx.beginPath();ctx.moveTo(m.x-m.vx/5*m.len,m.y-m.vy/5*m.len);ctx.lineTo(m.x,m.y);
      ctx.strokeStyle=grd;ctx.lineWidth=1.5;ctx.stroke();
      ctx.beginPath();ctx.arc(m.x,m.y,1.4,0,Math.PI*2);
      ctx.fillStyle='rgba(255,255,255,'+alpha+')';ctx.fill();
    });
  }

  const COUNT=isTouch?28:50;
  const particles=[];
  function Particle(){this.reset();}
  Particle.prototype.reset=function(){
    this.x=Math.random()*W;this.y=H+10+Math.random()*H*.5;
    this.r=.5+Math.random()*1.5;this.vx=(Math.random()-.5)*.22;this.vy=-.06-Math.random()*.18;
    this.life=0;this.maxLife=220+Math.random()*320;this.ci=Math.random()<.6?0:1;
  };
  Particle.prototype.update=function(){
    this.x+=this.vx;this.y+=this.vy;this.life++;
    if(this.life>this.maxLife||this.y<-10||this.x<-10||this.x>W+10)this.reset();
  };
  Particle.prototype.draw=function(colors){
    const t=this.life/this.maxLife;
    const a=t<.15?t/.15:t>.75?(1-t)/.25:1;
    ctx.beginPath();ctx.arc(this.x,this.y,this.r,0,Math.PI*2);
    ctx.fillStyle=colors[this.ci]+(a*.58)+')';ctx.fill();
  };
  for(let i=0;i<COUNT;i++){const p=new Particle();p.y=Math.random()*H;p.life=Math.random()*p.maxLife;particles.push(p);}

  let raf=null,lastTs=0;
  function loop(ts){
    raf=requestAnimationFrame(loop);
    if(ts-lastTs<34)return;
    const dt=ts-lastTs;lastTs=ts;
    ctx.clearRect(0,0,W,H);
    const dark=isDark();
    const tc=getThemeColors();

    if(dark){
      stars.forEach(function(s){
        const a=s.base+Math.sin(ts*.001*s.sp+s.ph)*.22;
        ctx.beginPath();ctx.arc(s.x*W,s.y*H,s.r,0,Math.PI*2);
        ctx.fillStyle='rgba(210,225,255,'+a+')';ctx.fill();
      });
    }

    tickMeteors(dt);
    if(dark)drawMeteors();

    for(let i=0;i<particles.length;i++){particles[i].update();particles[i].draw([tc.p,tc.a]);}

    if(!isTouch){
      for(let i=0;i<particles.length;i++){
        for(let j=i+1;j<particles.length;j++){
          const dx=particles[i].x-particles[j].x,dy=particles[i].y-particles[j].y,d2=dx*dx+dy*dy;
          if(d2<8100){
            ctx.beginPath();ctx.moveTo(particles[i].x,particles[i].y);ctx.lineTo(particles[j].x,particles[j].y);
            ctx.strokeStyle=tc.p+(.1*(1-Math.sqrt(d2)/90))+')';ctx.lineWidth=.5;ctx.stroke();
          }
        }
      }
    }
  }
  document.addEventListener('visibilitychange',function(){
    if(document.hidden){if(raf){cancelAnimationFrame(raf);raf=null;}}
    else if(!raf)raf=requestAnimationFrame(loop);
  });
  raf=requestAnimationFrame(loop);
}

const cursorEl=document.getElementById('cursor-glow');
if(cursorEl&&!isTouch){
  let cx=0,cy=0,ex=0,ey=0,vis=false,exp=false;
  document.addEventListener('mousemove',function(e){ex=e.clientX;ey=e.clientY;if(!vis){vis=true;cursorEl.classList.add('active');}},{passive:true});
  document.addEventListener('mouseleave',function(){vis=false;cursorEl.classList.remove('active');});
  document.addEventListener('mouseenter',function(){vis=true;cursorEl.classList.add('active');});
  document.addEventListener('mousedown',function(){exp=true;cursorEl.style.width=cursorEl.style.height='42px';},{passive:true});
  document.addEventListener('mouseup',function(){exp=false;cursorEl.style.width=cursorEl.style.height='28px';},{passive:true});
  document.querySelectorAll('a,button,.a11y-btn,.lang-toggle,.btn,.course-cert,.project-card').forEach(function(el){
    el.addEventListener('mouseenter',function(){if(!exp){cursorEl.style.width=cursorEl.style.height='44px';cursorEl.style.borderColor='var(--accent)';}});
    el.addEventListener('mouseleave',function(){if(!exp){cursorEl.style.width=cursorEl.style.height='28px';cursorEl.style.borderColor='';}});
  });
  (function animCursor(){requestAnimationFrame(animCursor);cx=lerp(cx,ex,.18);cy=lerp(cy,ey,.18);cursorEl.style.left=cx+'px';cursorEl.style.top=cy+'px';})();
}else if(cursorEl){cursorEl.style.display='none';}

document.addEventListener('click',function(e){
  if(e.target.closest('#cursor-glow,#bTop'))return;
  const rip=document.createElement('span');
  rip.className='ripple';
  rip.style.cssText='left:'+e.clientX+'px;top:'+e.clientY+'px;--rc:'+getThemeColors().hex;
  document.body.appendChild(rip);
  setTimeout(function(){rip.remove();},700);
},{passive:true});

(function(){
  const nameEl=document.querySelector('.tw-name');
  const roleEl=document.querySelector('.tw-role');
  if(!nameEl||!roleEl)return;

  function typewrite(el,text,spd,cb){
    el.textContent='';el.classList.remove('tw-done');let i=0;
    function tick(){
      if(i<=text.length){el.textContent=text.slice(0,i);i++;setTimeout(tick,spd+Math.random()*28-14);}
      else{el.classList.add('tw-done');if(cb)cb();}
    }
    tick();
  }
  function run(){
    if(PRM){
      const l=html.lang==='en'?'en':'ru';
      nameEl.textContent=nameEl.getAttribute('data-'+l)||'';
      nameEl.classList.add('tw-done');
      roleEl.textContent=roleEl.getAttribute('data-'+l)||'';
      roleEl.classList.add('tw-done');
      return;
    }
    const l=html.lang==='en'?'en':'ru';
    const n=nameEl.getAttribute('data-'+l)||'';
    const r=roleEl.getAttribute('data-'+l)||'';
    typewrite(nameEl,n,52,function(){setTimeout(function(){typewrite(roleEl,r,62);},180);});
  }
  setTimeout(run,250);
  let twT=null;
  new MutationObserver(function(){
    if(twT)clearTimeout(twT);
    twT=setTimeout(run,380);
  }).observe(html,{attributes:true,attributeFilter:['lang']});
})();

if(!isTouch&&!PRM){
  document.querySelectorAll('.tilt-card').forEach(function(card){
    card.addEventListener('mousemove',function(e){
      const r=card.getBoundingClientRect();
      const dx=(e.clientX-r.left-r.width/2)/(r.width/2);
      const dy=(e.clientY-r.top-r.height/2)/(r.height/2);
      card.style.transform='perspective(800px) rotateY('+dx*6+'deg) rotateX('+(-dy*4)+'deg) translateX(6px)';
    });
    card.addEventListener('mouseleave',function(){card.style.transform='';});
  });
}

(function(){
  const btn=document.getElementById('bTop');
  if(!btn)return;
  let shown=false;
  window.addEventListener('scroll',function(){
    const s=window.scrollY>400;
    if(s!==shown){shown=s;btn.classList.toggle('visible',shown);}
  },{passive:true});
  btn.addEventListener('click',function(){window.scrollTo({top:0,behavior:'smooth'});});
})();

(function(){
  const links=document.querySelectorAll('.nav-links a[href^="#"]');
  const pairs=[];
  links.forEach(function(a){const el=document.querySelector(a.getAttribute('href'));if(el)pairs.push({el,a});});
  new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      if(en.isIntersecting){
        pairs.forEach(function(p){p.a.classList.remove('active');});
        const f=pairs.find(function(p){return p.el===en.target;});
        if(f)f.a.classList.add('active');
      }
    });
  },{rootMargin:'-40% 0px -55% 0px'}).observe&&pairs.forEach(function(p){
    new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if(en.isIntersecting){
          pairs.forEach(function(pp){pp.a.classList.remove('active');});
          p.a.classList.add('active');
        }
      });
    },{rootMargin:'-40% 0px -55% 0px'}).observe(p.el);
  });
})();

(function(){
  const flash=document.getElementById('section-flash');
  if(!flash||PRM)return;
  let t=null;
  document.addEventListener('click',function(e){
    const a=e.target.closest('a[href^="#"]');if(!a)return;
    flash.classList.add('flashing');
    if(t)clearTimeout(t);
    t=setTimeout(function(){flash.classList.remove('flashing');},420);
  },{passive:true});
})();

(function(){
  const ec=document.getElementById('earth-canvas');
  if(!ec)return;
  const ctx=ec.getContext('2d');
  const S=isTouch?220:300;
  ec.width=S;ec.height=Math.round(S*.55);

  function draw(){
    ctx.clearRect(0,0,ec.width,ec.height);
    const cx=S/2,cy=ec.height+S*.42,R=S*.56;
    const dark=isDark();

    const atm=ctx.createRadialGradient(cx,cy,R*.88,cx,cy,R*1.2);
    atm.addColorStop(0,'rgba(60,120,255,0)');
    atm.addColorStop(.5,dark?'rgba(50,140,255,.2)':'rgba(100,170,255,.25)');
    atm.addColorStop(1,'rgba(30,80,200,0)');
    ctx.beginPath();ctx.arc(cx,cy,R*1.2,0,Math.PI*2);ctx.fillStyle=atm;ctx.fill();

    const oc=ctx.createRadialGradient(cx-R*.22,cy-R*.2,0,cx,cy,R);
    oc.addColorStop(0,dark?'#1e55a0':'#4a9ee0');
    oc.addColorStop(.55,dark?'#0e3268':'#1e70c0');
    oc.addColorStop(1,dark?'#071a3c':'#0e4a8a');
    ctx.beginPath();ctx.arc(cx,cy,R,0,Math.PI*2);ctx.fillStyle=oc;ctx.fill();

    function blob(bx,by,rx,ry,rot,col){
      ctx.save();ctx.translate(cx+bx,cy+by);ctx.rotate(rot||0);
      ctx.beginPath();ctx.ellipse(0,0,rx,ry,0,0,Math.PI*2);
      ctx.fillStyle=col;ctx.fill();ctx.restore();
    }
    const lc=dark?'#2e7a3c':'#3aaa48',lc2=dark?'#3a6e28':'#4a9a34';
    blob(-R*.05,-R*.15,R*.28,R*.18,.3,lc);
    blob(-R*.02,-R*.08,R*.12,R*.1,.5,lc2);
    blob(-R*.03,R*.12,R*.1,R*.18,.1,lc);
    blob(-R*.32,-R*.05,R*.1,R*.22,-.2,lc);
    blob(R*.25,R*.18,R*.09,R*.07,.2,lc);
    blob(-R*.18,-R*.32,R*.07,R*.06,.4,lc2);

    blob(0,-R*.42,R*.18,R*.06,0,'rgba(235,248,255,.6)');
    blob(0,R*.42,R*.14,R*.05,0,'rgba(235,248,255,.6)');

    ['rgba(255,255,255,.2)','rgba(255,255,255,.18)','rgba(255,255,255,.16)'].forEach(function(col,i){
      blob([-R*.1,R*.15,-R*.22][i],[R*.05*i-R*.25+i*R*.15][0]||0,R*.16,R*.04,[.6,-.3,.2][i],col);
    });
    blob(-R*.1,-R*.25,R*.16,R*.04,.6,'rgba(255,255,255,.2)');
    blob(R*.15,R*.05,R*.13,R*.035,-.3,'rgba(255,255,255,.18)');
    blob(-R*.2,R*.1,R*.1,R*.03,.2,'rgba(255,255,255,.16)');

    const sh=ctx.createRadialGradient(cx+R*.5,cy,0,cx+R*.45,cy,R*1.15);
    sh.addColorStop(0,'rgba(0,0,0,0)');sh.addColorStop(.65,'rgba(0,0,0,0)');sh.addColorStop(1,'rgba(0,0,0,.38)');
    ctx.beginPath();ctx.arc(cx,cy,R,0,Math.PI*2);ctx.fillStyle=sh;ctx.fill();

    const sp=ctx.createRadialGradient(cx-R*.3,cy-R*.28,0,cx-R*.3,cy-R*.28,R*.5);
    sp.addColorStop(0,'rgba(255,255,255,.18)');sp.addColorStop(1,'rgba(255,255,255,0)');
    ctx.beginPath();ctx.arc(cx,cy,R,0,Math.PI*2);ctx.fillStyle=sp;ctx.fill();

    ctx.globalCompositeOperation='destination-in';
    ctx.beginPath();ctx.arc(cx,cy,R,0,Math.PI*2);ctx.fill();
    ctx.globalCompositeOperation='source-over';

    if(dark){
      [[-R*.05,-R*.12],[-R*.1,-R*.08],[R*.12,-R*.05],[R*.08,-R*.2],[-R*.22,R*.05],[R*.2,R*.12],[-R*.05,R*.08],[R*.02,-R*.28]]
        .forEach(function(l){
          ctx.beginPath();ctx.arc(cx+l[0],cy+l[1],1.4,0,Math.PI*2);
          ctx.fillStyle='rgba(255,215,90,.6)';ctx.fill();
        });
    }
  }

  draw();
  new MutationObserver(draw).observe(html,{attributes:true,attributeFilter:['class']});
  new MutationObserver(draw).observe(body,{attributes:true,attributeFilter:['class']});
})();

if('serviceWorker' in navigator){
  window.addEventListener('load',function(){
    navigator.serviceWorker.register('sw.js').catch(function(){});
  });
}

})();
