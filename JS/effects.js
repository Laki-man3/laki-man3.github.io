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
    const s=JSON.parse(localStorage.getItem('qa-prefs')||'{}');
    const bZoom=document.getElementById('bZoom');
    const bCb=document.getElementById('bCb');
    const bTheme=document.getElementById('bTheme');
    const ltog=document.getElementById('ltog');
    const lRu=document.getElementById('lRu');
    const lEn=document.getElementById('lEn');
    if(bZoom&&s.large){bZoom.classList.add('on');bZoom.setAttribute('aria-pressed','true');}
    if(bCb&&s.cb){
      bCb.classList.add('on');bCb.setAttribute('aria-pressed','true');
      const u=bCb.querySelector('use');if(u)u.setAttribute('href','#ic-eye-on');
    }
    if(bTheme&&s.light){bTheme.classList.add('on');bTheme.setAttribute('aria-pressed','true');}
    if(ltog&&s.lang==='en'){
      ltog.classList.add('en');ltog.setAttribute('aria-checked','true');
      if(lRu)lRu.classList.remove('al');
      if(lEn)lEn.classList.add('al');
    }
  }catch(e){}

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
}

const canvas=document.getElementById('particle-canvas');
if(canvas&&!PRM){
  const ctx=canvas.getContext('2d');
  let W=0,H=0;
  function resize(){W=canvas.width=window.innerWidth;H=canvas.height=window.innerHeight;}
  resize();
  window.addEventListener('resize',resize,{passive:true});

  const STAR_COUNT=110;
  const stars=[];
  for(let i=0;i<STAR_COUNT;i++){
    stars.push({
      x:Math.random(),y:Math.random(),
      r:.4+Math.random()*1.1,
      base:.25+Math.random()*.5,
      ph:Math.random()*Math.PI*2,
      sp:.2+Math.random()*.9
    });
  }

  const meteors=[];
  let mTimer=0;
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
    el.textContent='';el.classList.remove('tw-done');
    let i=0;
    const fixedDelay=spd;
    function tick(){
      if(i<=text.length){
        el.textContent=text.slice(0,i);i++;
        setTimeout(tick,fixedDelay);
      } else {
        el.classList.add('tw-done');if(cb)cb();
      }
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
    typewrite(nameEl,n,55,function(){setTimeout(function(){typewrite(roleEl,r,65);},180);});
  }

  if(document.readyState==='complete'){
    setTimeout(run,120);
  } else {
    window.addEventListener('load',function(){setTimeout(run,120);},{once:true});
  }

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
  pairs.forEach(function(p){
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

  function setSize(){
    const vw=window.innerWidth;
    ec.width=vw;
    ec.height=isTouch?Math.round(vw*.38):Math.round(vw*.28);
    ec.style.width='100%';
    ec.style.height=ec.height+'px';
  }
  setSize();
  window.addEventListener('resize',function(){setSize();draw();},{passive:true});

  function draw(){
    const W=ec.width,H=ec.height;
    ctx.clearRect(0,0,W,H);
    const dark=isDark();

    const R=W*.52;
    const cx=W/2;
    const cy=H+R*.08;

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx,cy,R,0,Math.PI*2);
    ctx.clip();

    if(dark){
      const base=ctx.createRadialGradient(cx-R*.18,cy-R*.15,0,cx,cy,R);
      base.addColorStop(0,'#c8d0e8');
      base.addColorStop(.25,'#a0aac8');
      base.addColorStop(.6,'#7080a8');
      base.addColorStop(1,'#3a4868');
      ctx.beginPath();ctx.arc(cx,cy,R,0,Math.PI*2);
      ctx.fillStyle=base;ctx.fill();

      function mspot(bx,by,rx,ry,rot,col,a){
        ctx.save();ctx.translate(cx+bx,cy+by);ctx.rotate(rot||0);
        ctx.globalAlpha=a||1;
        ctx.beginPath();ctx.ellipse(0,0,rx,ry,0,0,Math.PI*2);
        ctx.fillStyle=col;ctx.fill();ctx.restore();
        ctx.globalAlpha=1;
      }
      mspot(-R*.08,-R*.22,R*.32,R*.24,.2,'#8090b8',1);
      mspot(R*.18,-R*.08,R*.18,R*.14,-.3,'#7888b0',1);
      mspot(-R*.28,R*.12,R*.14,R*.28,.15,'#6878a8',1);
      mspot(R*.1,R*.28,R*.22,R*.14,.1,'#7888b0',1);
      mspot(-R*.18,-R*.38,R*.1,R*.08,.35,'#9098c0',1);
      mspot(R*.28,-R*.3,R*.08,R*.06,-.2,'#8890b8',1);
      mspot(-R*.38,-R*.08,R*.06,R*.16,-.1,'#9098c0',1);
      mspot(R*.22,R*.1,R*.06,R*.04,.4,'#a0a8c8',1);

      mspot(-R*.05,-R*.1,R*.2,R*.12,.25,'#5060a0',.55);
      mspot(R*.22,R*.02,R*.12,R*.08,-.2,'#4858a0',.5);
      mspot(-R*.22,R*.18,R*.1,R*.18,.1,'#4858a0',.5);
      mspot(R*.08,R*.3,R*.15,R*.1,.05,'#5060a0',.55);

      function crater(bx,by,r2,col,shadow){
        ctx.save();ctx.translate(cx+bx,cy+by);
        const g=ctx.createRadialGradient(-r2*.25,-r2*.2,0,0,0,r2);
        g.addColorStop(0,shadow||'rgba(20,28,55,.55)');
        g.addColorStop(.6,'rgba(40,50,80,.2)');
        g.addColorStop(1,'rgba(180,190,220,.18)');
        ctx.beginPath();ctx.arc(0,0,r2,0,Math.PI*2);
        ctx.fillStyle=g;ctx.fill();
        ctx.strokeStyle='rgba(160,170,210,.35)';ctx.lineWidth=.8;ctx.stroke();
        ctx.restore();
      }
      crater(-R*.12,-R*.28,R*.055,'rgba(30,40,70,.6)');
      crater(R*.24,-R*.18,R*.04,'rgba(30,40,70,.5)');
      crater(-R*.3,R*.06,R*.038,'rgba(30,40,70,.5)');
      crater(R*.08,R*.2,R*.048,'rgba(30,40,70,.55)');
      crater(-R*.06,R*.32,R*.028,'rgba(30,40,70,.45)');
      crater(R*.32,-R*.04,R*.025,'rgba(30,40,70,.4)');
      crater(-R*.2,-R*.05,R*.032,'rgba(30,40,70,.45)');
      crater(R*.16,R*.34,R*.022,'rgba(30,40,70,.4)');
      crater(-R*.36,-R*.2,R*.018,'rgba(30,40,70,.35)');
      crater(R*.04,-R*.38,R*.016,'rgba(30,40,70,.35)');

      const terminator=ctx.createLinearGradient(cx+R*.2,cy,cx-R*.3,cy);
      terminator.addColorStop(0,'rgba(0,0,0,0)');
      terminator.addColorStop(.4,'rgba(0,0,0,.08)');
      terminator.addColorStop(.75,'rgba(0,5,20,.45)');
      terminator.addColorStop(1,'rgba(0,5,20,.7)');
      ctx.beginPath();ctx.arc(cx,cy,R,0,Math.PI*2);
      ctx.fillStyle=terminator;ctx.fill();

      const shine=ctx.createRadialGradient(cx-R*.28,cy-R*.3,0,cx-R*.28,cy-R*.3,R*.55);
      shine.addColorStop(0,'rgba(255,255,255,.12)');
      shine.addColorStop(.5,'rgba(255,255,255,.04)');
      shine.addColorStop(1,'rgba(255,255,255,0)');
      ctx.beginPath();ctx.arc(cx,cy,R,0,Math.PI*2);
      ctx.fillStyle=shine;ctx.fill();

      [[-R*.02,-R*.14],[-R*.12,-R*.08],[R*.15,-R*.05],[R*.1,-R*.22],
       [-R*.25,R*.06],[R*.22,R*.14],[R*.06,R*.1],[-R*.04,R*.22],
       [-R*.18,R*.28],[R*.3,R*.05],[-R*.32,-R*.12],[R*.04,-R*.32]]
        .forEach(function(l){
          const gCity=ctx.createRadialGradient(cx+l[0],cy+l[1],0,cx+l[0],cy+l[1],R*.022);
          gCity.addColorStop(0,'rgba(255,225,120,.55)');
          gCity.addColorStop(.5,'rgba(255,200,80,.2)');
          gCity.addColorStop(1,'rgba(255,200,80,0)');
          ctx.beginPath();ctx.arc(cx+l[0],cy+l[1],R*.022,0,Math.PI*2);
          ctx.fillStyle=gCity;ctx.fill();
        });

    } else {
      const base=ctx.createRadialGradient(cx-R*.22,cy-R*.2,0,cx,cy,R);
      base.addColorStop(0,'#ffd080');
      base.addColorStop(.2,'#ffb830');
      base.addColorStop(.5,'#ff8800');
      base.addColorStop(.8,'#e05000');
      base.addColorStop(1,'#a02800');
      ctx.beginPath();ctx.arc(cx,cy,R,0,Math.PI*2);
      ctx.fillStyle=base;ctx.fill();

      function sunspot(bx,by,rx,ry,rot,a){
        ctx.save();ctx.translate(cx+bx,cy+by);ctx.rotate(rot||0);
        ctx.globalAlpha=a||1;
        ctx.beginPath();ctx.ellipse(0,0,rx,ry,0,0,Math.PI*2);
        ctx.fillStyle='rgba(120,40,0,.55)';ctx.fill();ctx.restore();
        ctx.globalAlpha=1;
      }
      sunspot(-R*.1,-R*.12,R*.14,R*.1,.2,.7);
      sunspot(R*.2,R*.06,R*.1,R*.07,-.3,.6);
      sunspot(-R*.22,R*.18,R*.08,R*.12,.1,.5);
      sunspot(R*.05,R*.24,R*.12,R*.08,.05,.65);
      sunspot(-R*.05,-R*.28,R*.06,R*.05,.35,.5);

      function convCell(bx,by,r2){
        ctx.save();ctx.translate(cx+bx,cy+by);
        const gc=ctx.createRadialGradient(0,0,0,0,0,r2);
        gc.addColorStop(0,'rgba(255,240,160,.18)');
        gc.addColorStop(.7,'rgba(255,180,40,.06)');
        gc.addColorStop(1,'rgba(200,80,0,.04)');
        ctx.beginPath();ctx.arc(0,0,r2,0,Math.PI*2);
        ctx.fillStyle=gc;ctx.fill();
        ctx.strokeStyle='rgba(200,100,0,.12)';ctx.lineWidth=.6;ctx.stroke();
        ctx.restore();
      }
      for(let ci=0;ci<18;ci++){
        convCell(
          (Math.random()-.5)*R*1.8,
          (Math.random()-.5)*R*1.8,
          R*(.08+Math.random()*.12)
        );
      }

      const limb=ctx.createRadialGradient(cx,cy,R*.72,cx,cy,R);
      limb.addColorStop(0,'rgba(0,0,0,0)');
      limb.addColorStop(.6,'rgba(100,30,0,.12)');
      limb.addColorStop(1,'rgba(60,10,0,.55)');
      ctx.beginPath();ctx.arc(cx,cy,R,0,Math.PI*2);
      ctx.fillStyle=limb;ctx.fill();

      const glare=ctx.createRadialGradient(cx-R*.3,cy-R*.32,0,cx-R*.3,cy-R*.32,R*.5);
      glare.addColorStop(0,'rgba(255,255,220,.22)');
      glare.addColorStop(.5,'rgba(255,240,180,.06)');
      glare.addColorStop(1,'rgba(255,240,180,0)');
      ctx.beginPath();ctx.arc(cx,cy,R,0,Math.PI*2);
      ctx.fillStyle=glare;ctx.fill();
    }

    ctx.restore();

    if(dark){
      const atmGrd=ctx.createRadialGradient(cx,cy,R*.96,cx,cy,R*1.055);
      atmGrd.addColorStop(0,'rgba(160,185,255,0)');
      atmGrd.addColorStop(.4,'rgba(140,170,255,.12)');
      atmGrd.addColorStop(.8,'rgba(100,140,255,.06)');
      atmGrd.addColorStop(1,'rgba(80,120,240,0)');
      ctx.beginPath();ctx.arc(cx,cy,R*1.055,0,Math.PI*2);
      ctx.fillStyle=atmGrd;ctx.fill();
    } else {
      const corona1=ctx.createRadialGradient(cx,cy,R*.94,cx,cy,R*1.08);
      corona1.addColorStop(0,'rgba(255,200,60,.0)');
      corona1.addColorStop(.3,'rgba(255,180,40,.15)');
      corona1.addColorStop(.7,'rgba(255,140,0,.06)');
      corona1.addColorStop(1,'rgba(255,120,0,0)');
      ctx.beginPath();ctx.arc(cx,cy,R*1.08,0,Math.PI*2);
      ctx.fillStyle=corona1;ctx.fill();

      const corona2=ctx.createRadialGradient(cx,cy,R*1.05,cx,cy,R*1.22);
      corona2.addColorStop(0,'rgba(255,160,20,.08)');
      corona2.addColorStop(.5,'rgba(255,120,0,.03)');
      corona2.addColorStop(1,'rgba(255,100,0,0)');
      ctx.beginPath();ctx.arc(cx,cy,R*1.22,0,Math.PI*2);
      ctx.fillStyle=corona2;ctx.fill();
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
