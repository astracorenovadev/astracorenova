// Dependency-free validation of the actual shipped GLB JSON/image payloads.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
function dimensions(bytes){
 if(bytes.toString('ascii',0,4)!=='RIFF'||bytes.toString('ascii',8,12)!=='WEBP')throw new Error('Not a WebP image');
 const type=bytes.toString('ascii',12,16);
 if(type==='VP8 ')return [bytes.readUInt16LE(26)&16383,bytes.readUInt16LE(28)&16383];
 if(type==='VP8L'){const bits=bytes.readUInt32LE(21);return [(bits&16383)+1,((bits>>>14)&16383)+1];}
 if(type==='VP8X')return [bytes.readUIntLE(24,3)+1,bytes.readUIntLE(27,3)+1];
 throw new Error('Unknown WebP header '+type);
}
let failures=0;
for(const name of ['oracle','madonna','colossus'])for(const mobile of [false,true]){
 const file=name+(mobile?'-mobile':'')+'.glb',b=fs.readFileSync(path.join(root,'assets/3d',file));
 if(b.readUInt32LE(0)!==0x46546c67||b.readUInt32LE(4)!==2||b.readUInt32LE(8)!==b.length)throw new Error('Invalid GLB '+file);
 const n=b.readUInt32LE(12),j=JSON.parse(b.subarray(20,20+n)),offset=28+n;
 const triangles=(j.meshes||[]).reduce((s,m)=>s+m.primitives.reduce((s,p)=>s+((p.mode??4)===4?j.accessors[p.indices??p.attributes.POSITION].count/3:0),0),0);
 const images=(j.images||[]).map(image=>{if(image.mimeType!=='image/webp')throw new Error('Non-WebP texture');const v=j.bufferViews[image.bufferView];return dimensions(b.subarray(offset+(v.byteOffset||0),offset+(v.byteOffset||0)+v.byteLength));});
 const maxBytes=name==='oracle'?4_000_000:2_500_000,maxTriangles=name==='oracle'?150_000:80_000,maxSize=mobile?1024:2048;
 const pass=b.length<=maxBytes&&triangles<=maxTriangles&&images.length>0&&images.every(([w,h])=>w<=maxSize&&h<=maxSize)&&['EXT_meshopt_compression','EXT_texture_webp','KHR_mesh_quantization'].every(e=>j.extensionsUsed.includes(e));
 console.log(`${pass?'PASS':'FAIL'} ${file}: ${b.length.toLocaleString('en-US')} bytes; ${triangles.toLocaleString('en-US')} triangles; ${images.map(d=>d.join('×')).join(', ')} WebP`);
 if(!pass)failures++;
}
process.exitCode=failures?1:0;
