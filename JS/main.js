(function(){
'use strict';

document.addEventListener('click',function(e){
  const a=e.target.closest('a[href^="#"]');
  if(!a)return;
  const t=document.querySelector(a.getAttribute('href'));
  if(t){e.preventDefault();t.scrollIntoView({behavior:'smooth'});}
},{passive:true});

const io=new IntersectionObserver(function(entries){
  entries.forEach(function(en){
    if(en.isIntersecting){en.target.classList.add('vis');io.unobserve(en.target);}
  });
},{threshold:.08,rootMargin:'0px 0px -40px 0px'});
document.querySelectorAll('.reveal').forEach(function(el){io.observe(el);});

let lang='ru',isLt=false,isCb=false,isLight=false;
const body=document.body;
const html=document.documentElement;
const ltog=document.getElementById('ltog');
const lRu=document.getElementById('lRu');
const lEn=document.getElementById('lEn');
const tOv=document.getElementById('tOv');
const tOvTxt=document.getElementById('tOvTxt');
const bZoom=document.getElementById('bZoom');
const bCb=document.getElementById('bCb');
const bTheme=document.getElementById('bTheme');

let txNodes=null;
function cacheTx(){
  if(txNodes)return;
  txNodes={
    html:Array.from(document.querySelectorAll('[data-ru][data-en]')),
    ph:Array.from(document.querySelectorAll('[data-ru-ph][data-en-ph]'))
  };
}

function applyLang(l){
  cacheTx();
  txNodes.html.forEach(function(el){el.innerHTML=el.getAttribute('data-'+l);});
  txNodes.ph.forEach(function(el){el.placeholder=el.getAttribute('data-'+l+'-ph');});
  html.lang=l==='en'?'en':'ru';
  ltog.classList.toggle('en',l==='en');
  ltog.setAttribute('aria-checked',String(l==='en'));
  lRu.classList.toggle('al',l!=='en');
  lEn.classList.toggle('al',l==='en');
  ltog.setAttribute('data-tip',l==='en'?'Switch to RU':'RU / EN');
  bZoom.setAttribute('data-tip',isLt?(l==='en'?'Normal text':'Обычный текст'):(l==='en'?'Large text':'Крупный текст'));
  bCb.setAttribute('data-tip',isCb?(l==='en'?'Normal colors':'Обычные цвета'):(l==='en'?'Colorblind mode':'Режим дальтоника'));
  bTheme.setAttribute('data-tip',l==='en'?'Change theme':'Смена темы');
}

function switchLang(){
  const nl=lang==='ru'?'en':'ru';
  tOvTxt.textContent=nl==='en'?'Translating…':'Перевод…';
  tOv.classList.add('show');tOv.setAttribute('aria-hidden','false');
  requestAnimationFrame(function(){
    requestAnimationFrame(function(){
      applyLang(nl);lang=nl;
      setTimeout(function(){tOv.classList.remove('show');tOv.setAttribute('aria-hidden','true');},280);
    });
  });
}

ltog.addEventListener('click',switchLang);
ltog.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();switchLang();}});

bZoom.addEventListener('click',function(){
  isLt=!isLt;
  html.classList.toggle('lt',isLt);
  bZoom.classList.toggle('on',isLt);
  bZoom.setAttribute('aria-pressed',String(isLt));
  bZoom.setAttribute('data-tip',isLt?(lang==='en'?'Normal text':'Обычный текст'):(lang==='en'?'Large text':'Крупный текст'));
});

bCb.addEventListener('click',function(){
  isCb=!isCb;
  body.classList.toggle('cb',isCb);
  bCb.classList.toggle('on',isCb);
  bCb.setAttribute('aria-pressed',String(isCb));
  bCb.querySelector('use').setAttribute('href',isCb?'#ic-eye-on':'#ic-eye-off');
  bCb.setAttribute('data-tip',isCb?(lang==='en'?'Normal colors':'Обычные цвета'):(lang==='en'?'Colorblind mode':'Режим дальтоника'));
});

bTheme.addEventListener('click',function(){
  isLight=!isLight;
  html.classList.toggle('lt-mode',isLight);
  bTheme.classList.toggle('on',isLight);
  bTheme.setAttribute('aria-pressed',String(isLight));
});

let rcLoaded=false;
function loadRecaptcha(){
  if(rcLoaded)return;
  rcLoaded=true;
  const wrap=document.getElementById('rcWrap');
  const widgetDiv=document.createElement('div');
  widgetDiv.className='g-recaptcha';
  widgetDiv.setAttribute('data-sitekey','6LcpYukqAAAAANHAGhEhD6kkQf4HD1zoXsKNOyqg');
  wrap.appendChild(widgetDiv);
  const s=document.createElement('script');
  s.src='https://www.google.com/recaptcha/api.js';
  s.async=true;s.defer=true;
  document.head.appendChild(s);
}

const cForm=document.getElementById('cForm');
cForm.addEventListener('focusin',loadRecaptcha,{once:true});
cForm.addEventListener('click',loadRecaptcha,{once:true});

cForm.addEventListener('submit',function(e){
  e.preventDefault();
  const n=cForm.elements.name,em=cForm.elements.email,msg=cForm.elements.message;
  if(!n.value||!em.value||!msg.value){alert(lang==='en'?'Please fill in all fields':'Пожалуйста, заполните все поля');return;}
  if(!rcLoaded||typeof grecaptcha==='undefined'){alert(lang==='en'?'Please wait for the captcha to load':'Подождите, пока загрузится капча');return;}
  const rc=grecaptcha.getResponse();
  if(!rc){alert(lang==='en'?'Please confirm you are not a robot':'Пожалуйста, подтвердите, что вы не робот');return;}
  const fd=new FormData(cForm);
  fd.append('g-recaptcha-response',rc);
  fetch(cForm.action,{method:'POST',body:fd,headers:{Accept:'application/json'}})
    .then(function(r){
      if(r.ok){alert(lang==='en'?'Message sent successfully!':'Сообщение успешно отправлено!');cForm.reset();grecaptcha.reset();}
      else{alert(lang==='en'?'Send error. Please try again later.':'Ошибка отправки. Попробуйте позже.');}
    })
    .catch(function(){alert(lang==='en'?'Send error. Please try again later.':'Ошибка отправки. Попробуйте позже.');});
});

})();
