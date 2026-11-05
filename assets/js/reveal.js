/* Quiet, one-time entrances. Content is visible if JS or IntersectionObserver is absent. */
(() => {
 const motion=matchMedia('(prefers-reduced-motion: reduce)');
 if(motion.matches||!('IntersectionObserver'in window))return;
 const targets=[...document.querySelectorAll('.section-heading h2,.section-heading .latin,.difference-grid article,.service-card,.extra-services a,.timeline article,.industry-grid article,.control-list li,.studio-quote,.price-card,.faq-list details,.contact-layout>div,.contact-form label,#contact-form label')];
 targets.forEach((node,index)=>{node.dataset.reveal='';node.style.setProperty('--reveal-delay',`${(index%4)*65}ms`);});
 const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-revealed');observer.unobserve(entry.target);}});},{threshold:.06,rootMargin:'0px 0px -28px 0px'});
 targets.forEach(node=>observer.observe(node));document.documentElement.classList.add('reveal-ready');
 motion.addEventListener('change',()=>{if(motion.matches){document.documentElement.classList.remove('reveal-ready');observer.disconnect();targets.forEach(node=>node.classList.add('is-revealed'));}});
})();
