// Inlined in the head: choose the first-paint treatment before content is drawn.
(()=>{
 const mobile=matchMedia('(max-width:900px), (pointer:coarse)').matches;
 const limited=navigator.hardwareConcurrency<=(mobile?2:4)||(navigator.deviceMemory&&navigator.deviceMemory<=2);
 window.ACN_SCENE_ALLOWED=!limited&&!matchMedia('(prefers-reduced-motion: reduce)').matches&&!navigator.connection?.saveData&&!!window.WebGL2RenderingContext;
 if(!window.ACN_SCENE_ALLOWED)return;
 document.documentElement.classList.add('scene-preview');
 function preload(rel,href,as){const link=document.createElement('link');link.rel=rel;link.href=href;if(as)link.as=as;if(as==='fetch'||rel==='modulepreload')link.crossOrigin='anonymous';document.head.append(link);}
 const wide=!mobile&&matchMedia('(min-aspect-ratio:8/5)').matches;
 preload('preload',`assets/3d/temple-entry${mobile?'-mobile':wide?'-wide':''}.webp`,'image');
})();
