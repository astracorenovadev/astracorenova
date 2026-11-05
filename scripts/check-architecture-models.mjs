// Actual shipped geometry and embedded WebP validation, no npm dependencies.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
function dimensions(b){
 if(b.toString('ascii',0,4)!=='RIFF'||b.toString('ascii',8,12)!=='WEBP')throw new Error('Invalid WebP payload');
 const type=b.toString('ascii',12,16);
 if(type==='VP8 ')return [b.readUInt16LE(26)&16383,b.readUInt16LE(28)&16383];
 if(type==='VP8L'){const n=b.readUInt32LE(21);return [(n&16383)+1,((n>>>14)&16383)+1];}
 if(type==='VP8X')return [b.readUIntLE(24,3)+1,b.readUIntLE(27,3)+1];
 throw new Error('Unknown WebP header');
}
let failures=0;
for(const [name,maxBytes,maxTriangles]of [['column',1_500_000,24_000],['marble-tile',700_000,8_000]]){
 const b=fs.readFileSync(path.join(root,'assets/3d',name+'.glb'));
 if(b.readUInt32LE(0)!==0x46546c67||b.readUInt32LE(4)!==2||b.readUInt32LE(8)!==b.length)throw new Error('Invalid GLB '+name);
 const n=b.readUInt32LE(12),j=JSON.parse(b.subarray(20,20+n)),offset=28+n;
 const triangles=j.meshes.reduce((s,m)=>s+m.primitives.reduce((s,p)=>s+((p.mode??4)===4?j.accessors[p.indices??p.attributes.POSITION].count/3:0),0),0);
 const textures=j.images.map(img=>{if(img.mimeType!=='image/webp')throw new Error('Non-WebP texture');const v=j.bufferViews[img.bufferView];return dimensions(b.subarray(offset+(v.byteOffset||0),offset+(v.byteOffset||0)+v.byteLength));});
 const pass=b.length<=maxBytes&&triangles<=maxTriangles&&j.materials.length===1&&textures.length===3&&textures.every(([w,h])=>w<=1024&&h<=1024)&&['EXT_meshopt_compression','EXT_texture_webp','KHR_mesh_quantization'].every(ext=>j.extensionsUsed.includes(ext));
 console.log(`${pass?'PASS':'FAIL'} ${name}.glb: ${b.length.toLocaleString('en-US')} bytes; ${triangles.toLocaleString('en-US')} triangles; ${textures.map(t=>t.join('×')).join(', ')} WebP; 1 material`);
 if(!pass)failures++;
}
process.exitCode=failures?1:0;
