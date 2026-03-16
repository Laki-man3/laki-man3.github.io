(function(){
'use strict';

const html=document.documentElement;
const body=document.body;
const prefersReducedMotion=window.matchMedia('(prefers-reduced-motion:reduce)').matches;

const cel=document.getElementById('celestial');

function buildCelestial(){
  const moonEl=document.createElement('div');
  moonEl.className='body moon-body';

  const craters=[
    {w:18,h:18,t:28,l:18},
    {w:10,h:10,t:55,l:65},
    {w:8,h:8,t:20,l:70},
    {w:14,h:14,t:70,l:30},
  ];
  craters.forEach(function(c){
    const cr=document.createElement('div');
    cr.className='crater';
    cr.style.cssText='width:'+c.w+'px;height:'+c.h+'px;top:'+c.t+'px;left:'+c.l+'px';
    moonEl.appendChild(cr);
  });

  const sunEl=document.createElement('div');
  sunEl.className='body sun-body';

  const halo=document.createElement('div');
  halo.className='halo';
  sunEl.appendChild(halo);

  const rayCount=12;
  const baseR=64;
  for(let i=0;i<rayCount;i++){
    const ray=document.createElement('div');
    ray.className='ray';
    const angle=(360/rayCount)*i;
    const len=12+Math.random()*14;
    const thick=2+Math.random()*3;
    ray.style.cssText=
      'width:'+thick+'px;height:'+len+'px;'+
      'margin-left:'+(-thick/2)+'px;'+
      'margin-top:'+(-len-baseR)+'px;'+
      'transform:rotate('+angle+'deg);'+
      'animation:rayPulse '+(1.5+Math.random())+'s ease-in-out '+(Math.random()*.8)+'s infinite';
    sunEl.appendChild(ray);
  }

  cel.appendChild(moonEl);
  cel.appendChild(sunEl);

  if(!document.getElementById('rayKf')){
    const s=document.createElement('style');
    s.id='rayKf';
    s.textContent='@keyframes rayPulse{0%,100%{opacity:.7;transform-origin:bottom center}50%{opacity:1;transform-origin:bottom center;filter:brightness(1.3)}}';
    document.head.appendChild(s);
  }
}

if(cel)buildCelestial();

const canvas=document.getElementById('particle-canvas');
if(canvas&&!prefersReducedMotion){
  const ctx=canvas.getContext('2d');
  let W,H,particles=[];
  const COUNT=55;

  function resize(){
    W=canvas.width=window.innerWidth;
    H=canvas.height=window.innerHeight;
  }
  resize();
  window.addEventListener('resize',resize,{passive:true});

  function getColors(){
    const isCb=body.classList.contains('cb');
    const isLight=html.classList.contains('lt-mode');
    if(isCb&&isLight) return ['rgba(0,91,170,','rgba(204,102,0,'];
    if(isCb)          return ['rgba(77,184,255,','rgba(255,153,51,'];
    if(isLight)       return ['rgba(0,119,204,','rgba(5,150,105,'];
    return ['rgba(0,229,255,','rgba(0,255,157,'];
  }

  function Particle(){
    this.reset();
  }
  Particle.prototype.reset=function(){
    this.x=Math.random()*W;
    this.y=Math.random()*H;
    this.r=.6+Math.random()*1.8;
    this.vx=(Math.random()-.5)*.25;
    this.vy=-.08-Math.random()*.2;
    this.life=0;
    this.maxLife=200+Math.random()*300;
    this.colorIdx=Math.random()<.6?0:1;
  };
  Particle.prototype.update=function(){
    this.x+=this.vx;
    this.y+=this.vy;
    this.life++;
    if(this.life>this.maxLife||this.y<-10||this.x<-10||this.x>W+10)this.reset();
  };
  Particle.prototype.draw=function(ctx,colors){
    const t=this.life/this.maxLife;
    const alpha=t<.15?t/.15:t>.75?(1-t)/.25:1;
    ctx.beginPath();
    ctx.arc(this.x,this.y,this.r,0,Math.PI*2);
    ctx.fillStyle=colors[this.colorIdx]+(alpha*.65)+')';
    ctx.fill();
  };

  for(let i=0;i<COUNT;i++){
    const p=new Particle();
    p.life=Math.random()*p.maxLife;
    particles.push(p);
  }

  let raf;
  let lastFrame=0;
  function loop(ts){
    raf=requestAnimationFrame(loop);
    if(ts-lastFrame<33)return;
    lastFrame=ts;
    ctx.clearRect(0,0,W,H);
    const colors=getColors();

    for(let i=0;i<particles.length;i++){
      particles[i].update();
      particles[i].draw(ctx,colors);
    }

    const isLight=html.classList.contains('lt-mode');
    const isCb=body.classList.contains('cb');
    let lc;
    if(isCb&&isLight) lc='rgba(0,91,170,';
    else if(isCb)     lc='rgba(77,184,255,';
    else if(isLight)  lc='rgba(0,119,204,';
    else              lc='rgba(0,229,255,';

    for(let i=0;i<particles.length;i++){
      for(let j=i+1;j<particles.length;j++){
        const dx=particles[i].x-particles[j].x;
        const dy=particles[i].y-particles[j].y;
        const dist=Math.sqrt(dx*dx+dy*dy);
        if(dist<90){
          ctx.beginPath();
          ctx.moveTo(particles[i].x,particles[i].y);
          ctx.lineTo(particles[j].x,particles[j].y);
          ctx.strokeStyle=lc+(.12*(1-dist/90))+')';
          ctx.lineWidth=.5;
          ctx.stroke();
        }
      }
    }
  }

  const pageIo=new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      if(en.isIntersecting){
        if(!raf)raf=requestAnimationFrame(loop);
      } else {
        if(raf){cancelAnimationFrame(raf);raf=null;}
      }
    });
  });
  pageIo.observe(document.body);
}

const cursorEl=document.getElementById('cursor-glow');
if(cursorEl){
  const isTouchDevice=('ontouchstart' in window)||navigator.maxTouchPoints>0;
  if(isTouchDevice){
    cursorEl.style.display='none';
  } else {
    let cx=0,cy=0,ex=0,ey=0,visible=false;

    document.addEventListener('mousemove',function(e){
      ex=e.clientX;ey=e.clientY;
      if(!visible){visible=true;cursorEl.classList.add('active');}
    },{passive:true});

    document.addEventListener('mouseleave',function(){
      visible=false;cursorEl.classList.remove('active');
    });

    document.addEventListener('mouseenter',function(){
      visible=true;cursorEl.classList.add('active');
    });

    let expanding=false;
    document.addEventListener('mousedown',function(){
      expanding=true;
      cursorEl.style.width='42px';cursorEl.style.height='42px';
    },{passive:true});
    document.addEventListener('mouseup',function(){
      expanding=false;
      cursorEl.style.width='28px';cursorEl.style.height='28px';
    },{passive:true});

    document.querySelectorAll('a,button,.a11y-btn,.lang-toggle,.btn,.course-cert,.project-card').forEach(function(el){
      el.addEventListener('mouseenter',function(){
        if(!expanding){cursorEl.style.width='44px';cursorEl.style.height='44px';cursorEl.style.borderColor='var(--accent)';}
      });
      el.addEventListener('mouseleave',function(){
        if(!expanding){cursorEl.style.width='28px';cursorEl.style.height='28px';cursorEl.style.borderColor='';}
      });
    });

    function lerp(a,b,t){return a+(b-a)*t;}
    function animCursor(){
      requestAnimationFrame(animCursor);
      cx=lerp(cx,ex,.18);
      cy=lerp(cy,ey,.18);
      cursorEl.style.left=cx+'px';
      cursorEl.style.top=cy+'px';
    }
    animCursor();
  }
}

})();
