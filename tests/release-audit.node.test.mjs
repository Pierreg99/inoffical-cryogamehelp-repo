import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,copyFileSync,rmSync,readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {resolve,join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';

const sourceAudit=resolve(dirname(fileURLToPath(import.meta.url)),'../scripts/release-audit.mjs');
const required=[
 'index.html','app.js','i18n.js','styles.css','omega-lab.html','screenshot-review.html',
 'screenshot-review.js','screenshot-review.css','assets/sources.json','assets/README.md',
 'assets/fonts/DM-Sans-OFL.txt','assets/fonts/Space-Grotesk-OFL.txt','RELEASE_GATE.md','VISION3_ROADMAP.md'
];
function prepare() {
 const root=mkdtempSync(join(tmpdir(),'cryogamehelp-audit-'));
 for(const path of required) {
  const target=join(root,'docs',path);
  mkdirSync(dirname(target),{recursive:true});writeFileSync(target,'fixture\n');
 }
 const script=join(root,'scripts/release-audit.mjs');
 mkdirSync(dirname(script),{recursive:true});copyFileSync(sourceAudit,script);
 mkdirSync(join(root,'docs/assets/games'),{recursive:true});
 writeFileSync(join(root,'LICENSE.md'),'MIT License');
 writeFileSync(join(root,'docs/assets/games/test.webp'),'webp fixture');
 writeFileSync(join(root,'docs/assets/sources.json'),JSON.stringify([
  {file:'assets/games/test.webp',source:'https://example.org/image.webp',
   retrieved:'2026-10-03',rights:'Third-party rights retained by the publisher owners.'}
 ]));
 return root;
}
function run(root) {
 return spawnSync(process.execPath,[join(root,'scripts/release-audit.mjs')],{encoding:'utf8'});
}
function readManifest(root) {
 return JSON.parse(readFileSync(join(root,'docs/assets/sources.json'),'utf8'));
}
function setManifest(root,entries) {
 writeFileSync(join(root,'docs/assets/sources.json'),JSON.stringify(entries));
}
function withFixture(label,fn) {
 test(label,()=>{
  const root=prepare();
  try {fn(root);} finally {rmSync(root,{recursive:true,force:true});}
 });
}
withFixture('valid asset and license inventory passes metadata checks',root=>{
 const output=run(root);
 assert.equal(output.status,0,output.stderr);
 assert.match(output.stdout,/RELEASE METADATA PASS/);
 assert.match(output.stdout,/NOT publisher permission/);
});
withFixture('missing credited asset fails closed',root=>{
 rmSync(join(root,'docs/assets/games/test.webp'));
 const r=run(root);
 assert.notEqual(r.status,0);assert.match(r.stderr,/Image missing/);
});
withFixture('uncredited asset is rejected',root=>{
 writeFileSync(join(root,'docs/assets/games/untracked.webp'),'dummy');
 const r=run(root);
 assert.notEqual(r.status,0);assert.match(r.stderr,/Uncredited image/);
});
withFixture('duplicate manifest entries are rejected',root=>{
 const entries=readManifest(root);setManifest(root,[...entries,...entries]);
 const r=run(root);
 assert.notEqual(r.status,0);assert.match(r.stderr,/Duplicate/);
});
withFixture('malformed HTTPS URL is not accepted as valid provenance',root=>{
 const entries=readManifest(root);entries[0].source='https://';
 setManifest(root,entries);
 const r=run(root);
 assert.notEqual(r.status,0);assert.match(r.stderr,/Invalid HTTPS source/);
});
withFixture('impossible retrieval dates are rejected',root=>{
 const entries=readManifest(root);entries[0].retrieved='2026-02-30';
 setManifest(root,entries);
 const r=run(root);
 assert.notEqual(r.status,0);assert.match(r.stderr,/Bad retrieval date/);
});
withFixture('missing font license notice blocks metadata gate',root=>{
 rmSync(join(root,'docs/assets/fonts/DM-Sans-OFL.txt'));
 const r=run(root);
 assert.notEqual(r.status,0);assert.match(r.stderr,/Required file missing/);
});
withFixture('publisher permission is not inferred from source metadata',root=>{
 const entries=readManifest(root);entries[0].rights='';
 setManifest(root,entries);
 const r=run(root);
 assert.notEqual(r.status,0);assert.match(r.stderr,/Missing rights notice/);
});
