/* One persistent temple. Desktop cinema and a lower-cost mobile camera journey. */
const root=document.getElementById('temple-scene');
const status=document.createElement('span');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const narrow=matchMedia('(max-width: 900px)');
const mobile=narrow.matches||matchMedia('(pointer: coarse)').matches;
let dispose=()=>{};
let updateStatus=()=>{};
let battery;
function reason(){
  if(reduced.matches)return 'Постери · зменшення руху';
  if(navigator.hardwareConcurrency<=(mobile?2:4)||(navigator.deviceMemory&&navigator.deviceMemory<=2))return 'Постери · ощадний режим';
  if(navigator.connection?.saveData)return 'Постери · економія трафіку';
  if(battery&&!battery.charging&&battery.level<.2)return 'Постери · низький заряд';
  return '';
}
document.querySelectorAll('a[href^="#"]').forEach(link=>link.addEventListener('click',event=>{
  const id=link.getAttribute('href').slice(1),target=document.getElementById(id);if(!target)return;
  event.preventDefault();target.scrollIntoView({behavior:reduced.matches?'instant':'smooth'});
  history.replaceState(null,'',`#${id}`);
}));
function change(){const fallback=reason();if(fallback){dispose();document.documentElement.classList.remove('scene-preview');status.textContent=fallback;}}
reduced.addEventListener('change',change);narrow.addEventListener('change',change);
document.addEventListener('visibilitychange',()=>updateStatus());

async function start(){
 try{battery=await navigator.getBattery?.();battery?.addEventListener('levelchange',change);battery?.addEventListener('chargingchange',change);}catch{}
 if(reason()){document.documentElement.classList.remove('scene-preview');status.textContent=reason();return;}
 const probe=document.createElement('canvas'),gl=probe.getContext('webgl2');
 if(!gl){document.documentElement.classList.remove('scene-preview');status.textContent='Постери · WebGL2 недоступний';return;}gl.getExtension('WEBGL_lose_context')?.loseContext();
 try{
 const [THREE,{GLTFLoader},{MeshoptDecoder},{RoomEnvironment},{EffectComposer},{RenderPass},{UnrealBloomPass},{BokehPass},{OutputPass},g,s,{mergeGeometries},atmosphere]=await Promise.all([
  import('three'),import('three/addons/loaders/GLTFLoader.js'),import('three/addons/libs/meshopt_decoder.module.js'),import('three/addons/environments/RoomEnvironment.js'),mobile?Promise.resolve({}):import('three/addons/postprocessing/EffectComposer.js'),mobile?Promise.resolve({}):import('three/addons/postprocessing/RenderPass.js'),mobile?Promise.resolve({}):import('three/addons/postprocessing/UnrealBloomPass.js'),mobile?Promise.resolve({}):import('three/addons/postprocessing/BokehPass.js'),mobile?Promise.resolve({}):import('three/addons/postprocessing/OutputPass.js'),mobile?Promise.resolve({}):import('https://cdn.jsdelivr.net/npm/gsap@3.13.0/index.js'),mobile?Promise.resolve({}):import('https://cdn.jsdelivr.net/npm/gsap@3.13.0/ScrollTrigger.js'),import('three/addons/utils/BufferGeometryUtils.js'),import('./temple-atmosphere.js')]);
 if(reason()){status.textContent=reason();return;}
 const {gsap}=g,{ScrollTrigger}=s;if(!mobile)gsap.registerPlugin(ScrollTrigger);
 const renderer=new THREE.WebGLRenderer({alpha:false,antialias:true,powerPreference:'high-performance'});
 renderer.setPixelRatio(Math.min(devicePixelRatio,mobile?1:1.5));renderer.setSize(innerWidth,innerHeight);renderer.setClearColor(0x000000);
 renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.02;
 renderer.shadowMap.enabled=!mobile;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 root.append(renderer.domElement);
 const scene=new THREE.Scene();scene.background=new THREE.Color(0x000000);scene.fog=new THREE.FogExp2(0x000000,.033);
 const camera=new THREE.PerspectiveCamera(49,innerWidth/innerHeight,.1,120);
 const room=new RoomEnvironment(),pmrem=new THREE.PMREMGenerator(renderer),environment=pmrem.fromScene(room,.04,.1,100,{size:mobile?64:256});scene.environment=environment.texture;scene.environmentIntensity=.25;room.dispose();pmrem.dispose();
 const gold=new THREE.MeshStandardMaterial({color:0xc9a044,metalness:.68,roughness:.52,envMapIntensity:.45});
 const darkGold=new THREE.MeshStandardMaterial({color:0x8a6a2a,metalness:.45,roughness:.7,envMapIntensity:.25});
 const marble=new THREE.MeshStandardMaterial({color:0x171614,metalness:0,roughness:.88,envMapIntensity:.12});
 // Procedural marble and gold veins, no heavy texture downloads.
 marble.onBeforeCompile=shader=>{shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 acnPosition;').replace('#include <begin_vertex>','#include <begin_vertex>\nacnPosition=position;');shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 acnPosition;').replace('#include <color_fragment>',`#include <color_fragment>
 float warp=sin(acnPosition.z*1.3+sin(acnPosition.x*.8))*1.8+sin(acnPosition.y*2.7+acnPosition.x*.47)*.45;
 float wave=sin(acnPosition.x*2.1+acnPosition.y*.9+acnPosition.z*.58+warp);
 float veinBase=max(0.0,1.0-abs(wave));float vein=pow(veinBase,95.0);float haze=pow(veinBase,6.0);
 float grain=fract(sin(dot(floor(acnPosition*95.0),vec3(12.9898,78.233,37.719)))*43758.5453);
 diffuseColor.rgb*=.92+grain*.12;
 diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.055,.052,.048),haze*.3);
 diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.14,.105,.055),vein*.3);`);};
 const proceduralColumns=new THREE.Group();scene.add(proceduralColumns);let buildingColumn=false;
 const mesh=(geometry,material,x,y,z)=>{const object=new THREE.Mesh(geometry,material);object.position.set(x,y,z);(buildingColumn?proceduralColumns:scene).add(object);return object;};
 const floorMaterial=marble.clone();floorMaterial.onBeforeCompile=shader=>{marble.onBeforeCompile(shader);shader.fragmentShader=shader.fragmentShader.replace('#include <dithering_fragment>',`vec2 tile=abs(fract(acnPosition.xy/3.2)-.5);float seam=max(smoothstep(.493,.5,tile.x),smoothstep(.493,.5,tile.y));gl_FragColor.rgb*=1.-seam*.25;\n#include <dithering_fragment>`);};floorMaterial.color.multiplyScalar(.5);floorMaterial.roughness=.94;floorMaterial.envMapIntensity=.08;
 const floor=mesh(new THREE.PlaneGeometry(24,140),floorMaterial,0,-.03,-54);floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;
 function flutedShaft(){
  const geometry=new THREE.CylinderGeometry(.43,.55,6.2,mobile?40:100,mobile?1:12),positions=geometry.getAttribute('position');
  for(let i=0;i<positions.count;i++){const x=positions.getX(i),z=positions.getZ(i),radius=Math.hypot(x,z);if(radius<.01)continue;const angle=Math.atan2(z,x),groove=.5+.5*Math.cos(angle*20),factor=1-.065*groove;positions.setX(i,x*factor);positions.setZ(i,z*factor);}
  geometry.computeVertexNormals();return geometry;
 }
 const columnFeet=[];
 for(let z=9;z>=-110;z-=7){
  for(const side of [-1,1]){
   const x=side*6;
   buildingColumn=true;
   const column=mesh(flutedShaft(),marble,x,3.5,z);column.castShadow=true;column.receiveShadow=true;columnFeet.push([x,z]);
   mesh(new THREE.BoxGeometry(1.38,.20,1.38),marble,x,.10,z);
   for(const [y,radius,height]of [[.27,.68,.14],[.40,.59,.12],[6.62,.55,.15],[6.79,.64,.15],[6.96,.72,.15]])mesh(new THREE.CylinderGeometry(radius,radius,height,40),marble,x,y,z);
   for(const y of [.47,6.87])mesh(new THREE.CylinderGeometry(.63,.63,.035,40),darkGold,x,y,z);
   mesh(new THREE.BoxGeometry(1.5,.24,1.5),marble,x,7.16,z);
   buildingColumn=false;
   if(z>-35){const light=new THREE.PointLight(0xffcf8d,5,10,2);light.position.set(x*.86,4.9,z+1.1);scene.add(light);}
  }
  mesh(new THREE.BoxGeometry(14,.45,1.4),marble,0,7.5,z);
  mesh(new THREE.BoxGeometry(13,.025,1.42),darkGold,0,7.25,z);
  if(mobile)await new Promise(resolve=>setTimeout(resolve,0));
 }
 const {createCodePortals}=await import('./code-portals.js');const codePortals=createCodePortals(scene,[-40,-46,-52,-58]);
 for(const z of [2,-27,-74,-100]){
  mesh(new THREE.CylinderGeometry(1.42,1.6,.6,64),marble,2.5,.3,z);
  const ring=mesh(new THREE.TorusGeometry(1.43,.025,8,80),gold,2.5,.61,z);ring.rotation.x=Math.PI/2;
 }
 const hemisphere=new THREE.HemisphereLight(0xffe7bf,0x000000,.72);scene.add(hemisphere);
 const key=new THREE.DirectionalLight(0xffd38e,3.1);key.position.set(-2,8,8);key.castShadow=true;key.shadow.mapSize.set(1536,1536);key.shadow.camera.left=-8;key.shadow.camera.right=8;key.shadow.camera.top=8;key.shadow.camera.bottom=-8;key.shadow.camera.far=50;key.shadow.bias=-.0007;key.shadow.normalBias=.045;key.shadow.radius=3;scene.add(key);scene.add(key.target);
 const rim=new THREE.PointLight(0xffbd4d,65,20,2);rim.position.set(4.5,5,-1);scene.add(rim);
 const cool=new THREE.PointLight(0xe4ded1,18,22,2);cool.position.set(-3,4,-23);scene.add(cool);
 const celestial=atmosphere.createCelestialOrbits(scene,gold,darkGold,[2,-27,-74,-100]);
 const sculptureLighting=atmosphere.createSculptureLighting(scene);
 const columnShadows=atmosphere.createColumnShadows(scene,columnFeet);
 function label(text,x,y,z){const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=128;const ctx=canvas.getContext('2d');ctx.font='32px Cinzel,Georgia';ctx.textAlign='center';ctx.fillStyle='#d4a84b';ctx.fillText(text,512,72);const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;const material=new THREE.SpriteMaterial({map:texture,color:0xffffff,transparent:true,opacity:.8,depthWrite:false});const sprite=new THREE.Sprite(material);sprite.position.set(x,y,z);sprite.scale.set(8,1,1);scene.add(sprite);return sprite;}
 await document.fonts.ready;
 const signs=[label('OPERA DIGITALIA',0,6.3,-28),label('INTELLIGENTIA SINE LIMITIBUS',-5.9,4.5,-5),label('HOMO DECERNIT',0,6.3,-75),label('PRETIUM ET VALOR',0,6.3,-100),...[-40,-46,-52,-58].map((z,i)=>label(['I · COGNITIO','II · EXPERIMENTUM','III · OPUS','IV · CURA'][i],0,6.6,z))];
 const goldenCode=atmosphere.createGoldenCode(scene,{count:mobile?180:520,depth:122,dustCount:mobile?150:580,statues:[[2.5,2],[2.5,-27],[2.5,-74]]});
 // Merge the static columns/trim by material: richer architecture without hundreds of draw calls.
 for(const source of [scene,proceduralColumns])for(const material of [marble,gold,darkGold]){
  const objects=source.children.filter(object=>object.isMesh&&object.material===material&&object!==floor&&object.geometry.type!=='PlaneGeometry');
  const geometries=objects.map(object=>{object.updateMatrix();return object.geometry.clone().applyMatrix4(object.matrix);});
  if(geometries.length){const merged=mergeGeometries(geometries);if(merged){objects.forEach(object=>{source.remove(object);object.geometry.dispose();});const batch=new THREE.Mesh(merged,material);batch.castShadow=true;batch.receiveShadow=true;source.add(batch);}geometries.forEach(geometry=>geometry.dispose());}
 }
 const loader=new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);const statues=[];const pendingModels=new Set(),retryAfter=new Map();let finalMadonna;const columnBatches=[];
 let stopped=false,raf=0,last=0,time=0,mobileRequested='oracle';const state={progress:0,scrollY:0,loaded:0,frames:0,architecture:false,floorInserts:false};
 async function loadColumn(){
  try{
   const url='assets/3d/column.glb';
   const gltf=await loader.loadAsync(url);if(stopped){disposeObject(gltf.scene);return;}
   const original=gltf.scene;original.updateMatrixWorld(true);const bounds=new THREE.Box3().setFromObject(original),size=bounds.getSize(new THREE.Vector3()),center=bounds.getCenter(new THREE.Vector3()),scale=7.3/size.y;
   const normalize=new THREE.Matrix4().makeScale(scale,scale,scale).multiply(new THREE.Matrix4().makeTranslation(-center.x,-bounds.min.y,-center.z));
   const detailedColumns=new THREE.Group();
   original.traverse(object=>{
    if(!object.isMesh)return;
    const materials=(Array.isArray(object.material)?object.material:[object.material]).map(source=>{const material=source.clone();material.roughnessMap=null;material.metalnessMap=null;material.roughness=.76;material.metalness=.16;material.envMapIntensity=.25;return material;});
    for(let first=0;first<columnFeet.length;first+=8){
     const feet=columnFeet.slice(first,first+8),instances=new THREE.InstancedMesh(object.geometry,Array.isArray(object.material)?materials:materials[0],feet.length);
     feet.forEach(([x,z],index)=>instances.setMatrixAt(index,new THREE.Matrix4().makeTranslation(x,0,z).multiply(normalize).multiply(object.matrixWorld)));
     instances.userData.centerZ=feet.reduce((sum,foot)=>sum+foot[1],0)/feet.length;instances.castShadow=true;instances.receiveShadow=true;instances.computeBoundingSphere();detailedColumns.add(instances);columnBatches.push(instances);
    }
   });
   if(!detailedColumns.children.length)return;scene.add(detailedColumns);scene.remove(proceduralColumns);
   proceduralColumns.traverse(object=>{if(object.isMesh)object.geometry.dispose();});state.architecture=true;
  }catch(error){console.warn('ACN: keeping procedural columns',error.message);}
 }
 async function loadFloorInserts(){
  try{
   const url='assets/3d/marble-tile.glb',response=await fetch(url,{method:'HEAD'});if(!response.ok)return;
   const gltf=await loader.loadAsync(url);if(stopped){disposeObject(gltf.scene);return;}
   const original=gltf.scene;original.updateMatrixWorld(true);const bounds=new THREE.Box3().setFromObject(original),size=bounds.getSize(new THREE.Vector3()),center=bounds.getCenter(new THREE.Vector3()),scale=2.8/Math.max(size.x,size.z);
   // Sink the slab into the stone floor, leaving only the engraved top visible.
   const normalize=new THREE.Matrix4().makeScale(scale,scale,scale).multiply(new THREE.Matrix4().makeTranslation(-center.x,-bounds.max.y,-center.z));
   const inserts=new THREE.Group();
   original.traverse(object=>{
    if(!object.isMesh)return;
    const materials=(Array.isArray(object.material)?object.material:[object.material]).map(source=>{const material=source.clone();material.roughnessMap=null;material.metalnessMap=null;material.roughness=.88;material.metalness=.06;material.envMapIntensity=.12;material.color.multiplyScalar(.7);return material;});
    const instances=new THREE.InstancedMesh(object.geometry,Array.isArray(object.material)?materials:materials[0],2);
    [5,-23].forEach((z,index)=>instances.setMatrixAt(index,new THREE.Matrix4().makeTranslation(0,.008,z).multiply(normalize).multiply(object.matrixWorld)));
    instances.castShadow=false;instances.receiveShadow=true;instances.computeBoundingSphere();inserts.add(instances);
   });
   if(inserts.children.length){scene.add(inserts);state.floorInserts=true;}
  }catch(error){console.warn('ACN: keeping plain stone floor',error.message);}
 }
 async function load(name,z){
  try{
   const gltf=await loader.loadAsync(`assets/3d/${name}${mobile?'-mobile':''}.glb`);
   if(stopped||(mobile&&mobileRequested!==name)){disposeObject(gltf.scene);return;}
   if(mobile){statues.splice(0).forEach(statue=>{scene.remove(statue);disposeObject(statue);});}
   const statue=new THREE.Group(),object=gltf.scene;
   const bounds=new THREE.Box3().setFromObject(object),size=bounds.getSize(new THREE.Vector3()),center=bounds.getCenter(new THREE.Vector3()),scale=4.3/Math.max(size.x,size.y,size.z);
   object.scale.setScalar(scale);object.position.set(-center.x*scale,.66-bounds.min.y*scale,-center.z*scale);
   object.traverse(n=>{if(n.isMesh){n.castShadow=!mobile;n.receiveShadow=!mobile;}});
   statue.add(object);statue.userData.modelName=name;statue.position.set(2.5,0,z);scene.add(statue);statues.push(statue);state.loaded++;
   if(!mobile&&name==='madonna'){finalMadonna=statue.clone(true);finalMadonna.userData.modelName='madonna-final';finalMadonna.position.z=-100;scene.add(finalMadonna);statues.push(finalMadonna);}
   return statue;
  }catch(error){console.warn('ACN model fallback',name,error.message);}
 }
 function ensureModel(name,z){
  if(statues.some(statue=>statue.userData.modelName===name)||pendingModels.has(name)||performance.now()<(retryAfter.get(name)||0))return;
  pendingModels.add(name);load(name,z).then(model=>{if(!model)retryAfter.set(name,performance.now()+3000);}).finally(()=>pendingModels.delete(name));
 }
 function selectMobileModel(p){
  const desired=p<.14?'oracle':p<.37?'colossus':p>.64?'madonna':null;
  mobileRequested=desired;
  if(desired){ensureModel(desired,{oracle:2,colossus:-27,madonna:-74}[desired]);if(desired==='madonna')statues.forEach(statue=>{if(statue.userData.modelName==='madonna')statue.position.z=p>.88?-100:-74;});}
  else if(statues.length)statues.splice(0).forEach(statue=>{scene.remove(statue);disposeObject(statue);});
 }
 const route=new THREE.CatmullRomCurve3([new THREE.Vector3(0,2.65,11),new THREE.Vector3(.15,2.65,-19),new THREE.Vector3(-.4,2.8,-33),new THREE.Vector3(.3,2.65,-59),new THREE.Vector3(0,2.7,-66),new THREE.Vector3(0,2.65,-90)]);
 const lookRoute=new THREE.CatmullRomCurve3([new THREE.Vector3(2,2.8,0),new THREE.Vector3(2.5,2.8,-27),new THREE.Vector3(0,3,-43),new THREE.Vector3(0,3,-66),new THREE.Vector3(2.5,2.8,-74),new THREE.Vector3(2.5,3,-100)]);
 const sections=Object.fromEntries(['hero','services','process','security','pricing'].map(id=>[id,document.getElementById(id)]));
 let anchors=[];
 function measure(){anchors=[0,Math.max(1,sections.services.offsetTop-innerHeight*.18),sections.process.offsetTop-innerHeight*.32,sections.process.offsetTop+sections.process.offsetHeight-innerHeight*.8,sections.security.offsetTop-innerHeight*.18,sections.pricing.offsetTop-innerHeight*.18];}
 function routeProgress(scroll){for(let i=0;i<anchors.length-1;i++){if(scroll<=anchors[i+1])return (i+THREE.MathUtils.clamp((scroll-anchors[i])/(anchors[i+1]-anchors[i]),0,1))/(anchors.length-1);}return 1;}
 measure();
 const composer=mobile?{render:()=>renderer.render(scene,camera),setSize:()=>{},dispose:()=>{}}:new EffectComposer(renderer,new THREE.WebGLRenderTarget(innerWidth,innerHeight,{type:THREE.UnsignedByteType}));
 const bokeh=mobile?{enabled:false,uniforms:{aperture:{value:0},focus:{value:10}}}:new BokehPass(scene,camera,{focus:10,aperture:.000012,maxblur:.003});
 if(!mobile){composer.addPass(new RenderPass(scene,camera));composer.addPass(new UnrealBloomPass(new THREE.Vector2(innerWidth,innerHeight),.17,.4,.86));composer.addPass(bokeh);composer.addPass(new OutputPass());}bokeh.enabled=false;
 if(new URLSearchParams(location.search).has('debug'))window.__acnScene={renderer,scene,camera,composer};
 let pointerX=0,pointerY=0;
 const onPointer=event=>{pointerX=(event.clientX/innerWidth-.5)*.24;pointerY=(event.clientY/innerHeight-.5)*.10;};addEventListener('pointermove',onPointer,{passive:true});
 const entranceCopy=document.querySelector('.hero-copy');
 const trigger=mobile?{kill:()=>{}}:ScrollTrigger.create({trigger:'#main',start:'top top',end:()=>anchors[5],scrub:1.05,invalidateOnRefresh:true,onRefresh:measure,animation:gsap.to(state,{scrollY:()=>anchors[5],ease:'none',paused:true})});
 const statusForProgress=()=>{};updateStatus=statusForProgress;
 const onRoomClick=event=>{
  const href=event.target.closest('a[href^="#"]')?.getAttribute('href');
  const name=href==='#services'?'colossus':['#security','#pricing','#contact','#faq','#savings'].includes(href)?'madonna':href==='#hero'?'oracle':null;
  if(name&&!mobile)ensureModel(name,{oracle:2,colossus:-27,madonna:-74}[name]);
 };
 document.addEventListener('click',onRoomClick);

 function render(now){
  if(stopped||document.hidden){raf=0;return;}
  if(now-last>=1000/(mobile?30:60)){
   const delta=Math.min((now-last)/1000,.08);last=now;time+=delta;state.frames++;
   if(mobile)state.scrollY=THREE.MathUtils.damp(state.scrollY,window.scrollY,6,delta);
   const p=routeProgress(state.scrollY),point=route.getPoint(p),target=lookRoute.getPoint(p);state.progress=p;
   if(mobile)selectMobileModel(p);
   if(!mobile){if(p<.14)ensureModel('oracle',2);if(p>.06&&p<.5)ensureModel('colossus',-27);if(p>.49)ensureModel('madonna',-74);}
   point.x+=pointerX+Math.sin(time*.13)*.12;point.y+=pointerY+Math.sin(time*.11)*.025;
   target.x-=mobile?0:1.05;camera.position.copy(point);camera.lookAt(target);
   const transition=Math.sin(Math.PI*p);
   bokeh.enabled=!mobile&&p>.28&&p<.79;bokeh.uniforms.aperture.value=.000012*transition;bokeh.uniforms.focus.value=camera.position.distanceTo(target);
   key.position.set(-2+Math.sin(time*.16)*1.2,8,point.z-3);key.target.position.set(2.5,2.5,target.z);
   key.color.setRGB(1,.82-.10*p,.56+.12*p);key.intensity=3.1+Math.sin(time*.24)*.18;
   scene.fog.density=.026+transition*.01;
   celestial.update(time);goldenCode.update(time,transition);sculptureLighting.update(time,p,target.z);columnShadows.update(time,p,point.z-2);codePortals.update(time,point.z);
   columnBatches.forEach(batch=>batch.visible=Math.abs(batch.userData.centerZ-point.z)<31);statues.forEach(statue=>statue.visible=Math.abs(statue.position.z-point.z)<24);
   document.querySelectorAll('#process .timeline article').forEach((step,i)=>step.classList.toggle('is-active',i===Math.min(3,Math.max(0,Math.floor((p-.4)/.2*4)))));
   statues.forEach((statue,i)=>{statue.rotation.y=time*.052+Math.sin(time*.17+i)*.04+pointerX*.3;statue.position.y=Math.sin(time*.55+i)*.012;});
   signs.forEach((sign,i)=>sign.material.opacity=.73+Math.sin(time*.7+i)*.12);
   entranceCopy.style.opacity='1';
   composer.render();if(state.frames%30===0)statusForProgress();
   window.__acnJourney={canvasCount:root.querySelectorAll('canvas').length,quality:mobile?'mobile':'desktop',residentModels:statues.length,modelNames:statues.map(s=>s.userData.modelName),shadows:renderer.shadowMap.enabled,postprocessing:!mobile,progress:p,room:p<.14?'entrance':p<.35?'services':p<.7?'process':p<.9?'security':'final',models:state.loaded,camera:point.toArray(),frames:state.frames,glyphs:goldenCode.count,motes:goldenCode.dustCount,statueRotations:statues.map(statue=>statue.rotation.y),elapsed:time,architecture:state.architecture,floorInserts:state.floorInserts};
  }
  raf=requestAnimationFrame(render);
 }
 function resume(){if(!stopped&&!document.hidden&&!raf){last=performance.now();raf=requestAnimationFrame(render);}statusForProgress();}
 document.addEventListener('visibilitychange',resume);
 function resize(){if(stopped)return;measure();camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);composer.setSize(innerWidth,innerHeight);if(!mobile)ScrollTrigger.refresh();}addEventListener('resize',resize);
 function disposeObject(object){object.traverse(node=>{if(node.geometry)node.geometry.dispose();const materials=Array.isArray(node.material)?node.material:[node.material];materials.filter(Boolean).forEach(material=>{Object.values(material).forEach(value=>{if(value?.isTexture)value.dispose();});material.dispose();});});}
 dispose=()=>{if(stopped)return;stopped=true;cancelAnimationFrame(raf);trigger.kill();document.removeEventListener('visibilitychange',resume);document.removeEventListener('click',onRoomClick);removeEventListener('pointermove',onPointer);removeEventListener('resize',resize);disposeObject(scene);environment.dispose();composer.dispose();renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove();document.body.classList.remove('scene-ready');document.documentElement.classList.remove('scene-preview');entranceCopy.style.opacity='1';};
 await Promise.all([load('oracle',2),mobile?Promise.resolve():loadColumn()]);if(reason()){dispose();status.textContent=reason();return;}
 if(!mobile)loadFloorInserts();
 camera.position.copy(route.getPoint(0));const firstTarget=lookRoute.getPoint(0);firstTarget.x-=mobile?0:1.05;camera.lookAt(firstTarget);
 state.scrollY=window.scrollY;const initialProgress=routeProgress(state.scrollY);camera.position.copy(route.getPoint(initialProgress));const initialTarget=lookRoute.getPoint(initialProgress);initialTarget.x-=mobile?0:1.05;camera.lookAt(initialTarget);
 await renderer.compileAsync(scene,camera);composer.render();
 document.body.classList.add('scene-ready');root.dataset.state='ready';resume();addEventListener('pagehide',dispose,{once:true});
 }catch(error){dispose();document.documentElement.classList.remove('scene-preview');root.dataset.state='fallback';status.textContent='Постери · 3D тимчасово недоступне';console.warn('ACN journey fallback',error.message);}
}
// Keep the first paint and HTML interaction independent of the 3D engine.
start();
