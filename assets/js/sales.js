/* Four-step inquiry, cost estimate and owner-configured public integrations. */
(()=>{
 const config=window.ACN_CONFIG||{},form=document.getElementById('business-quiz');
 const uk=()=>document.documentElement.lang!=='en',message=(a,b)=>uk()?a:b;
 const configured=(key)=>typeof config[key]==='string'&&config[key]!==key&&config[key].trim()!=='';
 const hero=document.getElementById('hero-primary-cta'),sticky=document.querySelector('.persistent-contact');
 if(hero&&sticky){
  let heroVisible=true,quizVisible=false;
  const sync=()=>sticky.hidden=heroVisible||quizVisible;
  new IntersectionObserver(entries=>{heroVisible=entries[0].isIntersecting;sync();},{threshold:0}).observe(hero);
  if(form)new IntersectionObserver(entries=>{quizVisible=entries[0].isIntersecting;sync();},{threshold:0}).observe(form);
 }

 document.querySelectorAll('[data-telegram]').forEach(link=>{
  if(configured('TELEGRAM_URL')){
   try{const url=new URL(config.TELEGRAM_URL);if(url.protocol==='https:'&&['t.me','telegram.me'].includes(url.hostname)){link.href=url.href;link.removeAttribute('aria-disabled');link.querySelector('[data-telegram-note]')?.remove();}}catch{}
  }
 });
 const ranges=['people','hours','salary'].map(id=>document.getElementById('calc-'+id));
 function calculate(){
  if(ranges.some(input=>!input))return;
  const [people,hours,salary]=ranges.map(input=>Number(input.value)),format=new Intl.NumberFormat(uk()?'uk-UA':'en-GB');
  ['people','hours','salary'].forEach((id,index)=>{
   const units=uk()?['осіб','год','грн']:['people','hours','UAH'];
   const text=`${format.format(Number(ranges[index].value))} ${units[index]}`;
   document.getElementById('calc-'+id+'-value').textContent=text;ranges[index].setAttribute('aria-valuetext',text);
  });
  document.getElementById('routine-cost').textContent=format.format(Math.round(people*salary*hours/8));
 }
 ranges.forEach(input=>input?.addEventListener('input',calculate));calculate();
 document.querySelectorAll('[data-lang]').forEach(button=>button.addEventListener('click',()=>{calculate();if(form)updateContact();}));
 if(!form)return;
 const fields=[...form.querySelectorAll('[data-quiz-step]')],back=document.getElementById('quiz-back'),next=document.getElementById('quiz-next'),submit=document.getElementById('quiz-submit'),error=document.getElementById('quiz-error'),fallback=document.getElementById('quiz-mail-fallback');
 let step=1,sending=false,widget=null,captchaLoading=null;
 const selected=name=>[...form.querySelectorAll(`input[name="${name}"]:checked`)].map(input=>input.value);
 function fail(text,mail=false){error.textContent=text;fallback.hidden=!mail;error.focus({preventScroll:true});}
 function validate(){
  error.textContent='';fallback.hidden=true;
  if(step===1&&!selected('industry').length){fail(message('Оберіть вашу галузь.','Select your industry.'));return false;}
  if(step===2&&!selected('team').length){fail(message('Оберіть розмір команди.','Select your team size.'));return false;}
  if(step===3&&!selected('tasks').length){fail(message('Оберіть хоча б одну задачу.','Choose at least one task.'));return false;}
  for(const input of fields[step-1].querySelectorAll('input,textarea,select'))if(!input.checkValidity()){input.reportValidity();return false;}
  return true;
 }
 function updateContact(){
  const input=form.elements.contact,method=form.elements.contact_method.value;
  input.type=method==='email'?'email':['phone','WhatsApp'].includes(method)?'tel':'text';
  input.autocomplete=method==='email'?'email':['phone','WhatsApp'].includes(method)?'tel':'off';
  document.getElementById('contact-hint').textContent=method==='Telegram'?'@username':method==='email'?'name@example.com':message('Номер з кодом країни, наприклад +380…','Include your country code, e.g. +380…');
 }
 form.elements.contact_method.addEventListener('change',updateContact);updateContact();
 form.querySelectorAll('[name="tasks"]').forEach(input=>input.addEventListener('change',()=>{
  const other=selected('tasks').includes('Інше'),label=form.querySelector('.quiz-other');label.hidden=!other;form.elements.other_task.required=other;
 }));
 function loadCaptcha(){
  if(!configured('WEB3FORMS_KEY')){
   document.getElementById('quiz-setup-note').textContent=message('Надсилання ще налаштовується. Поки можна написати нам на email.','Online submission is being configured. You can email us meanwhile.');fallback.hidden=false;return;
  }
  if(widget!==null||captchaLoading)return;
  captchaLoading=new Promise((resolve,reject)=>{
   window.acnCaptchaReady=()=>{try{widget=window.hcaptcha.render('quiz-captcha',{sitekey:'50b2fe65-b00b-4b9e-ad62-3ba471098be2',theme:'dark',size:'compact','expired-callback':()=>{error.textContent=message('Перевірка спливла. Пройдіть її ще раз.','Verification expired. Please complete it again.');}});resolve();}catch(e){reject(e);}};
   const script=document.createElement('script');script.src='https://js.hcaptcha.com/1/api.js?onload=acnCaptchaReady&render=explicit&recaptchacompat=off';script.async=true;script.onerror=()=>reject(new Error('captcha-network'));document.head.append(script);
  }).catch(()=>{captchaLoading=null;fail(message('Не вдалося завантажити перевірку. Спробуйте ще раз або напишіть на email.','Verification could not load. Retry or email us.'),true);});
 }
 function showStep(focus=true){
  fields.forEach((field,index)=>field.hidden=index!==step-1);back.hidden=step===1;next.hidden=step===4;submit.hidden=step!==4;
  document.getElementById('quiz-step-number').textContent=String(step);
  const progress=document.getElementById('quiz-progress');progress.setAttribute('aria-valuenow',String(step));progress.style.setProperty('--progress',`${step*25}%`);
  error.textContent='';fallback.hidden=true;
  if(step===4){document.getElementById('quiz-summary').textContent=[...selected('industry'),...selected('team'),...selected('tasks')].join(' · ');loadCaptcha();}
  if(focus){fields[step-1].querySelector('legend').focus({preventScroll:true});document.getElementById('quiz-step-label').scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});}
 }
 next.addEventListener('click',()=>{if(!sending&&validate()){step++;showStep();}});
 back.addEventListener('click',()=>{if(!sending&&step>1){step--;showStep();}});
 form.addEventListener('keydown',event=>{if(event.key==='Enter'&&step<4&&event.target.tagName!=='TEXTAREA'&&event.target.tagName!=='BUTTON'){event.preventDefault();next.click();}});
 form.addEventListener('submit',async event=>{
  event.preventDefault();if(sending)return;if(step<4){next.click();return;}if(!validate())return;
  if(form.elements.botcheck.checked){fail(message('Не вдалося надіслати заявку.','Could not submit the inquiry.'));return;}
  if(!configured('WEB3FORMS_KEY')){fail(message('Надсилання ще налаштовується. Напишіть нам на email — ми відповімо на вашу заявку.','Submission is being configured. Please email your inquiry.'),true);return;}
  const captcha=widget!==null?window.hcaptcha?.getResponse(widget):'';
  if(!captcha){fail(message('Підтвердьте, що ви не робот.','Please complete the verification.'));loadCaptcha();return;}
  const data=Object.fromEntries(new FormData(form));data.access_key=config.WEB3FORMS_KEY;data.subject=`Заявка: ${selected('industry')[0]}, ${selected('team')[0]}`;data.tasks=selected('tasks').join('; ');data['h-captcha-response']=captcha;data.consent='yes';delete data.botcheck;
  data.from_name='Сайт AstraCoreNova';
  if(data.contact_method==='email')data.email=data.contact;
  sending=true;submit.disabled=true;back.disabled=true;form.setAttribute('aria-busy','true');
  const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),15000);
  try{
   const response=await fetch('https://api.web3forms.com/submit',{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify(data),signal:controller.signal});
   const result=await response.json();if(!response.ok||result.success!==true)throw new Error('submission-rejected');
   form.hidden=true;const success=document.getElementById('quiz-success');success.hidden=false;success.focus();
  }catch{fail(message('Заявку не надіслано. Перевірте інтернет і спробуйте ще раз або напишіть на email.','Your inquiry was not sent. Check your connection and retry, or email us.'),true);}
  finally{clearTimeout(timeout);sending=false;submit.disabled=false;back.disabled=false;form.removeAttribute('aria-busy');if(widget!==null)window.hcaptcha?.reset(widget);}
 });
 showStep(false);
})();
