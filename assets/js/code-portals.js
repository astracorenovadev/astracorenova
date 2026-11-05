import * as THREE from 'three';

/** Sparse moving glyphs suggest a doorway; no solid ring, walls or collisions. */
export function createCodePortals(scene,positions){
 const tokens='01AXIVNΩΣλΔ01AXIVN01',columns=8,rows=3,atlas=document.createElement('canvas');atlas.width=512;atlas.height=384;
 const ctx=atlas.getContext('2d');ctx.font='70px Georgia';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#fff';
 [...tokens].forEach((token,i)=>ctx.fillText(token,(i%columns)*64+32,Math.floor(i/columns)*128+65));
 const texture=new THREE.CanvasTexture(atlas),plane=new THREE.PlaneGeometry(1,1),geometry=new THREE.InstancedBufferGeometry();
 geometry.index=plane.index;geometry.attributes.position=plane.attributes.position;geometry.attributes.uv=plane.attributes.uv;
 const perPortal=72,count=positions.length*perPortal,data=new Float32Array(count*4),seeds=new Float32Array(count*4);
 positions.forEach((z,room)=>{for(let i=0;i<perPortal;i++){const index=room*perPortal+i;data.set([i/perPortal,z,Math.floor(Math.random()*tokens.length),.14+Math.random()*.10],index*4);seeds.set([Math.random()*6.28,Math.random()*2-1,Math.random()*2-1,Math.random()*2-1],index*4);}});
 geometry.instanceCount=count;geometry.setAttribute('aData',new THREE.InstancedBufferAttribute(data,4));geometry.setAttribute('aSeed',new THREE.InstancedBufferAttribute(seeds,4));
 const uniforms={uTime:{value:0},uCameraZ:{value:11},uAtlas:{value:texture}};
 const material=new THREE.ShaderMaterial({uniforms,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,
 vertexShader:`attribute vec4 aData;attribute vec4 aSeed;uniform float uTime;uniform float uCameraZ;varying vec2 vUv;varying float vGlyph;varying float vAlpha;
 void main(){float t=fract(aData.x+uTime*.018);vec3 p=vec3(0.,0.,aData.y);
 if(t<.22){p.x=-4.1;p.y=t/.22*3.3;}else if(t>.78){p.x=4.1;p.y=(1.-t)/.22*3.3;}else{float angle=(t-.22)/.56*3.14159265;p.x=-cos(angle)*4.1;p.y=3.3+sin(angle)*4.1;}
 float distance=abs(uCameraZ-aData.y);float presence=1.-smoothstep(10.,19.,distance);float dissolve=1.-smoothstep(1.,3.8,distance);float scatter=(1.-presence)*1.6+dissolve*1.25;
 p+=vec3(aSeed.y,aSeed.z,aSeed.w)*scatter;p.x+=sin(uTime*.23+aSeed.x)*.035;p.z+=cos(uTime*.2+aSeed.x)*.07;
 vec4 mv=modelViewMatrix*vec4(p,1.);mv.xy+=position.xy*vec2(aData.w*.5,aData.w);gl_Position=projectionMatrix*mv;vUv=uv;vGlyph=aData.z;vAlpha=presence*(1.-dissolve*.82)*(.30+.08*sin(uTime*.8+aSeed.x));}
 `,
 fragmentShader:`uniform sampler2D uAtlas;varying vec2 vUv;varying float vGlyph;varying float vAlpha;void main(){vec2 cell=vec2(mod(vGlyph,8.),2.-floor(vGlyph/8.));float alpha=texture2D(uAtlas,(cell+vUv)/vec2(8.,3.)).a*vAlpha;if(alpha<.008)discard;gl_FragColor=vec4(1.,.69,.27,alpha);}`});
 const portals=new THREE.Mesh(geometry,material);portals.frustumCulled=false;portals.name='Code portals';scene.add(portals);plane.dispose();
 return {count:positions.length,update(time,cameraZ){uniforms.uTime.value=time;uniforms.uCameraZ.value=cameraZ;}};
}
