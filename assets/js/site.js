/* Small progressive enhancements: the full Ukrainian page works without JavaScript. */
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const translateNodes = [...document.querySelectorAll('[data-en]')];
  translateNodes.forEach(node => { node.dataset.uk = node.textContent; });
  let language = 'uk';
  try { if (localStorage.getItem('acn_lang') === 'en') language = 'en'; } catch {}
  function setLanguage(next) {
    language = next === 'en' ? 'en' : 'uk';
    translateNodes.forEach(node => { node.textContent = node.dataset[language]; });
    document.documentElement.lang = language;
    document.querySelectorAll('[data-lang]').forEach(button => button.setAttribute('aria-pressed', button.dataset.lang === language));
    document.querySelector('.desktop-nav')?.setAttribute('aria-label', language === 'uk' ? 'Основна навігація' : 'Main navigation');
    try { localStorage.setItem('acn_lang', language); } catch {}
  }
  document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLanguage(button.dataset.lang)));
  setLanguage(language);
  const toggle = document.getElementById('hamburger'), menu = document.getElementById('mobileMenu');
  function closeMenu() { menu.hidden = true; toggle.setAttribute('aria-expanded', 'false'); }
  toggle.addEventListener('click', () => { menu.hidden = !menu.hidden; toggle.setAttribute('aria-expanded', !menu.hidden); toggle.setAttribute('aria-label', language === 'uk' ? (menu.hidden ? 'Відкрити меню' : 'Закрити меню') : (menu.hidden ? 'Open menu' : 'Close menu')); });
  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && !menu.hidden) { closeMenu(); toggle.focus(); } });
  document.addEventListener('click', event => { if (!menu.hidden && !menu.contains(event.target) && !toggle.contains(event.target)) closeMenu(); });

  document.querySelector('.skip-link')?.addEventListener('click',()=>{const main=document.getElementById('main');main.tabIndex=-1;main.focus({preventScroll:true});});

  document.getElementById('contact-form').addEventListener('submit', event => {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const text = `Ім’я / Name: ${values.get('name')}\nКомпанія / Company: ${values.get('company')}\nТелефон / Messenger: ${values.get('contact')}\n\nЗадача / Task:\n${values.get('task')}`;
    location.href = `mailto:contact@astracorenova.com?subject=${encodeURIComponent('Цифровий працівник для бізнесу')}&body=${encodeURIComponent(text)}`;
    document.getElementById('form-status').textContent = language === 'uk' ? 'Якщо поштова програма не відкрилася, напишіть на адресу поруч із формою.' : 'If your email app did not open, write to the email address beside the form.';
  });

  const activeScrambles = new Map();
  document.querySelectorAll('[data-scramble]').forEach(node => {
    const original = node.textContent;
    node.dataset.original = original;
    const trigger = node.closest('.section-heading') || node.parentElement;
    trigger.addEventListener('pointerenter', () => {
      if (reduced.matches || activeScrambles.has(node)) return;
      const start = performance.now();
      function frame(now) {
        if (reduced.matches || now - start >= 600) { node.textContent = original; activeScrambles.delete(node); return; }
        const reveal = Math.floor((now-start)/600*original.length);
        node.textContent = [...original].map((letter,index) => letter === ' ' || index < reveal ? letter : '01ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random()*28)]).join('');
        activeScrambles.set(node, requestAnimationFrame(frame));
      }
      activeScrambles.set(node, requestAnimationFrame(frame));
    });
  });
  reduced.addEventListener('change', () => { if (reduced.matches) { activeScrambles.forEach((id,node) => { cancelAnimationFrame(id); node.textContent = node.dataset.original; }); activeScrambles.clear(); } });

  // Motion preferences and device limits are checked again inside the scene module.
  if (!reduced.matches && !(navigator.hardwareConcurrency <= 4) && !navigator.connection?.saveData) {
    import('./temple-journey.js').catch(()=>document.documentElement.classList.remove('scene-preview'));
  }
  const rooms=[...document.querySelectorAll('[data-room-link]')];
  if (rooms.length) {
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){rooms.forEach(link=>{if(link.dataset.roomLink===entry.target.id)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});}}),{rootMargin:'-15% 0px -55% 0px'});
    rooms.forEach(link=>{const section=document.getElementById(link.dataset.roomLink);if(section)observer.observe(section);});
  }
})();
