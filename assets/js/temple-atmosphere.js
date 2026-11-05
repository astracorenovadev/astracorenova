import * as THREE from 'three';

function radialTexture(stops){
 const canvas=document.createElement('canvas');canvas.width=canvas.height=128;
 const context=canvas.getContext('2d'),gradient=context.createRadialGradient(64,64,0,64,64,64);
 stops.forEach(([position,color])=>gradient.addColorStop(position,color));context.fillStyle=gradient;context.fillRect(0,0,128,128);
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;return texture;
}

/** Quiet code throughout the architecture, with clear space around both sculptures. */
export function createGoldenCode(scene,options={}){
 const tokens=['0','1','A','Ω','Σ','λ','N','X','0','1','I','V','C','Δ','01','10','∴','∷','{','}',';','/','+','=','observe();','learn();','adapt();','cognitio','01 10 01','ex astris','nova aetas','intellect'];
 const atlas=document.createElement('canvas');atlas.width=1024;atlas.height=512;const ctx=atlas.getContext('2d');
 tokens.forEach((token,index)=>{const word=index>=24;ctx.font=`${word?19:68}px ${word?'monospace':'Georgia'}`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#fff';ctx.fillText(token,(index%8)*128+64,Math.floor(index/8)*128+65);});
 const texture=new THREE.CanvasTexture(atlas);texture.colorSpace=THREE.SRGBColorSpace;
 const plane=new THREE.PlaneGeometry(1,1),geometry=new THREE.InstancedBufferGeometry();geometry.index=plane.index;geometry.attributes.position=plane.attributes.position;geometry.attributes.uv=plane.attributes.uv;
 const count=options.count||240,depth=options.depth||48,statuePositions=options.statues||[[2.5,2],[2.5,-27]],dustCount=options.dustCount||300,seeds=new Float32Array(count*4),data=new Float32Array(count*4);
 for(let i=0;i<count;i++){
  let x,z;
  do{x=(Math.random()-.5)*15;z=8-Math.random()*depth;}while(statuePositions.some(([sx,sz])=>Math.hypot(x-sx,z-sz)<3.7));
  seeds.set([Math.random(),x,z,.018+Math.random()*.018],i*4);
  data.set([0,i%19===0?24+(i%8):Math.floor(Math.random()*24),Math.random()*6.28,.12+Math.random()*.12],i*4);
 }
 geometry.setAttribute('aSeed',new THREE.InstancedBufferAttribute(seeds,4));geometry.setAttribute('aData',new THREE.InstancedBufferAttribute(data,4));geometry.instanceCount=count;
 const uniforms={uTime:{value:0},uAtlas:{value:texture},uEnergy:{value:.8}};
 const material=new THREE.ShaderMaterial({uniforms,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,
 vertexShader:`attribute vec4 aSeed;attribute vec4 aData;uniform float uTime;uniform float uEnergy;varying vec2 vUv;varying float vGlyph;varying float vAlpha;
 void main(){float rise=fract(aSeed.x+uTime*aSeed.w);
 vec3 center=vec3(aSeed.y+sin(uTime*.19+aData.z)*.16,.45+rise*7.4,aSeed.z+cos(uTime*.13+aData.z)*.14);
 vec4 mv=modelViewMatrix*vec4(center,1.);float word=step(23.5,aData.y);vec2 size=vec2(mix(.18,.57,word),mix(.22,.57,word))*(.8+aData.w);
 mv.xy+=position.xy*size;gl_Position=projectionMatrix*mv;vUv=uv;vGlyph=aData.y;vAlpha=sin(rise*3.14159)*(.10+aData.w*.2)*uEnergy;}
 `,
 fragmentShader:`uniform sampler2D uAtlas;uniform float uTime;varying vec2 vUv;varying float vGlyph;varying float vAlpha;
 void main(){vec2 cell=vec2(mod(vGlyph,8.),3.-floor(vGlyph/8.));vec2 atlasUv=(cell+vUv)/vec2(8.,4.);float alpha=texture2D(uAtlas,atlasUv).a*vAlpha;if(alpha<.008)discard;float shimmer=.9+.1*sin(uTime*1.1+vGlyph);gl_FragColor=vec4(vec3(1.,.69,.29)*shimmer,alpha);}`});
 const glyphs=new THREE.Mesh(geometry,material);glyphs.frustumCulled=false;scene.add(glyphs);plane.dispose();
 const dustGeometry=new THREE.BufferGeometry(),positions=new Float32Array(dustCount*3),phases=new Float32Array(dustCount);
 for(let i=0;i<dustCount;i++){positions.set([(Math.random()-.5)*15,.3+Math.random()*7,11-Math.random()*(depth+3)],i*3);phases[i]=Math.random();}
 dustGeometry.setAttribute('position',new THREE.BufferAttribute(positions,3));dustGeometry.setAttribute('aPhase',new THREE.BufferAttribute(phases,1));
 const dustUniforms={uTime:{value:0},uPixelRatio:{value:Math.min(devicePixelRatio,1.5)}};
 const dustMaterial=new THREE.ShaderMaterial({uniforms:dustUniforms,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
 vertexShader:`attribute float aPhase;uniform float uTime;uniform float uPixelRatio;varying float vAlpha;void main(){vec3 p=position;p.y=mod(p.y+uTime*(.07+aPhase*.14),7.);p.x+=sin(uTime*.25+aPhase*25.)*.24;vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;gl_PointSize=clamp((10.+aPhase*12.)/max(1.,-mv.z),1.,2.4)*uPixelRatio;vAlpha=.10+.18*aPhase;}`,
 fragmentShader:`varying float vAlpha;void main(){float d=length(gl_PointCoord-.5)*2.;if(d>1.)discard;gl_FragColor=vec4(1.,.72,.32,(1.-d)*(1.-d)*vAlpha);}`});
 const dust=new THREE.Points(dustGeometry,dustMaterial);dust.frustumCulled=false;scene.add(dust);
 return {update(time,transition){uniforms.uTime.value=time;uniforms.uEnergy.value=.78+transition*.08;dustUniforms.uTime.value=time;},count,dustCount};
}

export function createCelestialOrbits(scene,gold,darkGold,roomPositions=[2,-27]){
 const groups=[],lights=[];
 const glow=radialTexture([[0,'rgba(255,243,202,1)'],[.12,'rgba(255,211,112,.8)'],[.38,'rgba(212,145,39,.15)'],[1,'rgba(212,145,39,0)']]);
 const glowMaterial=new THREE.SpriteMaterial({map:glow,color:0xffd888,transparent:true,opacity:.55,depthWrite:false,blending:THREE.AdditiveBlending});
 for(const roomZ of roomPositions){
  const room=new THREE.Group();room.position.set(2.5,2.7,roomZ);
  for(let i=0;i<3;i++){
   const ring=new THREE.Group();ring.rotation.set(.28+i*.56,.2+i*.49,.22+i*.58);
   const radius=2.55+i*.37,track=new THREE.Mesh(new THREE.TorusGeometry(radius,.008+(i===0?.004:0),5,112),i===0?gold:darkGold);ring.add(track);
   const satellites=[];
   for(let j=0;j<2;j++){
    const satellite=new THREE.Group(),sphere=new THREE.Mesh(new THREE.SphereGeometry(j===0?.11:.065,20,16),gold);satellite.add(sphere);
    const halo=new THREE.Sprite(glowMaterial);halo.scale.setScalar(j===0?.58:.36);satellite.add(halo);ring.add(satellite);satellites.push({satellite,phase:j*Math.PI+roomZ*.03});
   }
   room.add(ring);groups.push({ring,radius,satellites,index:i,phase:roomZ*.015});
  }
  scene.add(room);
  // A restrained gold halo behind the pedestal, rather than an opaque neon ring.
  const floorRing=new THREE.Mesh(new THREE.TorusGeometry(1.63,.009,5,100),gold);floorRing.rotation.x=Math.PI/2;floorRing.position.set(2.5,.012,roomZ);scene.add(floorRing);
 }
 return {update(time){groups.forEach(({ring,radius,satellites,index,phase})=>{ring.rotation.y=.2+index*.49+Math.sin(time*.11+phase)*.10;ring.rotation.z=.22+index*.58+time*(index%2?.017:-.012);satellites.forEach(({satellite,phase:p})=>{const angle=time*(.22+index*.045)*(index%2?-1:1)+p;satellite.position.set(Math.cos(angle)*radius,Math.sin(angle)*radius,0);});});}};
}

export function createSculptureLighting(scene){
 const goldKey=new THREE.SpotLight(0xffd69b,125,22,.57,.85,1.6);goldKey.position.set(7,7,7);scene.add(goldKey);scene.add(goldKey.target);
 const blueRim=new THREE.SpotLight(0xd7d2c8,60,19,.64,1,1.8);blueRim.position.set(-.7,5,-1);scene.add(blueRim);scene.add(blueRim.target);
 const edge=new THREE.PointLight(0xffc15a,30,10,1.6);scene.add(edge);
 const contact=radialTexture([[0,'rgba(0,0,0,.82)'],[.3,'rgba(0,0,0,.63)'],[.7,'rgba(0,0,0,.22)'],[1,'rgba(0,0,0,0)']]);
 for(const z of [2,-27]){
  const shadow=new THREE.Mesh(new THREE.PlaneGeometry(5,5),new THREE.MeshBasicMaterial({map:contact,transparent:true,depthWrite:false,toneMapped:false,opacity:.7}));shadow.rotation.x=-Math.PI/2;shadow.position.set(2.5,-.009,z);scene.add(shadow);
 }
 return {update(time,progress,focusZ){
  const z=focusZ??2-29*progress;
  goldKey.position.set(6.5+Math.sin(time*.15)*1.5,6.7+Math.sin(time*.11)*.3,z+5);goldKey.target.position.set(2.5,2.6,z);
  goldKey.intensity=125+Math.sin(time*.31)*13;
  blueRim.position.set(-.4+Math.sin(time*.12)*.65,4.6,z-1.5);blueRim.target.position.set(2.5,2.9,z);blueRim.intensity=55+progress*20;
  edge.position.set(4.7+Math.cos(time*.18)*.45,3.5,z-1.2);edge.intensity=28+Math.sin(time*.3)*5;
 }};
}

export function createColumnShadows(scene,feet){
 const texture=radialTexture([[0,'rgba(0,0,0,.86)'],[.3,'rgba(0,0,0,.7)'],[.7,'rgba(0,0,0,.22)'],[1,'rgba(0,0,0,0)']]);
 const shadows=new THREE.InstancedMesh(new THREE.PlaneGeometry(2.4,3.1),new THREE.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,toneMapped:false,opacity:.7}),feet.length);
 const transform=new THREE.Object3D();feet.forEach(([x,z],index)=>{transform.position.set(x+.10,-.018,z+.28);transform.rotation.x=-Math.PI/2;transform.updateMatrix();shadows.setMatrixAt(index,transform.matrix);});scene.add(shadows);
 // A narrow grazing light reveals the stone flutes; the moving key still casts real shadows.
 const grazing=new THREE.SpotLight(0xffddaf,48,18,.43,.9,1.7);scene.add(grazing);scene.add(grazing.target);
 return {update(time,progress,focusZ){const z=focusZ??9-29*progress;grazing.position.set(1.7,6.2,z+3);grazing.target.position.set(6,3.2,z-1.4);grazing.intensity=44+Math.sin(time*.18)*4;}};
}
