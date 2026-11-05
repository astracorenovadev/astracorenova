// Inlined in the head: choose the first-paint treatment before content is drawn.
(()=>{
 if(matchMedia('(prefers-reduced-motion: reduce)').matches||navigator.hardwareConcurrency<=4||navigator.connection?.saveData||!window.WebGL2RenderingContext)return;
 document.documentElement.classList.add('scene-preview');
 const mobile=matchMedia('(max-width:900px), (pointer:coarse)').matches;
 function preload(rel,href,as){const link=document.createElement('link');link.rel=rel;link.href=href;if(as)link.as=as;if(as==='fetch'||rel==='modulepreload')link.crossOrigin='anonymous';document.head.append(link);}
 preload('preload',`assets/3d/temple-entry${mobile?'-mobile':''}.webp`,'image');
 preload('preload',`assets/3d/oracle${mobile?'-mobile':''}.glb`,'fetch');
 preload('modulepreload','https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js');
})();
