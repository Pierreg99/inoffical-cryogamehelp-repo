import {existsSync,readFileSync,readdirSync} from 'node:fs';
import {resolve,join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..'),doc=p=>join(root,'docs',p);
const errors=[],fail=s=>errors.push(s);
for(const p of ['index.html','app.js','i18n.js','styles.css','omega-lab.html','screenshot-review.html','screenshot-review.css','screenshot-review.js',
 'assets/sources.json','assets/README.md','assets/fonts/DM-Sans-OFL.txt','assets/fonts/Space-Grotesk-OFL.txt','RELEASE_GATE.md','VISION3_ROADMAP.md']){
 if(!existsSync(doc(p)))fail('Required file missing: '+p);
}
if(!existsSync(join(root,'LICENSE.md')))fail('Missing license');
let list=[];try{const x=JSON.parse(readFileSync(doc('assets/sources.json'),'utf8'));if(!Array.isArray(x))throw Error('expected array');list=x;}catch(e){fail('Bad manifest: '+e.message);}
const seen=new Set();
for(const e of list){
 if(!e||typeof e.file!=='string'||!/^assets\/games\/[a-z0-9-]+\.webp$/.test(e.file)){fail('Invalid image entry');continue;}
 if(seen.has(e.file))fail('Duplicate: '+e.file);seen.add(e.file);
 if(!existsSync(doc(e.file)))fail('Image missing: '+e.file);
 let validUrl=false;
 try {const u=new URL(e.source);validUrl=u.protocol==='https:'&&!!u.hostname&&!u.username&&!u.password;}catch{}
 if(!validUrl)fail('Invalid HTTPS source: '+e.file);
 const dateStr=e.retrieved;
 const parsed=typeof dateStr==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(dateStr)?Date.parse(dateStr+'T00:00:00Z'):NaN;
 if(!Number.isFinite(parsed)||new Date(parsed).toISOString().slice(0,10)!==dateStr||parsed>Date.now())fail('Bad retrieval date: '+e.file);
 if(typeof e.rights!=='string'||!/rights|owners|third.party/i.test(e.rights))fail('Missing rights notice: '+e.file);
}
let names=[];try{names=readdirSync(doc('assets/games')).filter(n=>n.endsWith('.webp'));}catch{fail('Image directory missing');}
for(const name of names)if(!seen.has('assets/games/'+name))fail('Uncredited image: '+name);
if(!list.length)fail('Empty source manifest');
if(errors.length){errors.forEach(x=>console.error('AUDIT FAILED: '+x));process.exitCode=1;}
else{console.log('RELEASE METADATA PASS: '+names.length+' game images matched to source manifest.');console.log('Font notices and required review files found. NOT publisher permission or release approval.');}
