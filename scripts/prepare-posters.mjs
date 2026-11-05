import {createRequire}from'node:module';import path from'node:path';import{fileURLToPath}from'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),require=createRequire(path.join(process.env.ACN_TOOL_DIR||path.resolve(root,'../tooling/site-qa'),'package.json')),sharp=require('sharp');
for(const name of ['oracle','madonna','colossus'])for(const width of [320,480])await sharp(path.join(root,`assets/3d/${name}-poster.webp`)).resize({width}).webp({quality:80,alphaQuality:95,effort:6}).toFile(path.join(root,`assets/3d/${name}-poster-${width}.webp`));
console.log('Prepared lightweight mobile posters; transparent source masters retained.');
