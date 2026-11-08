'use strict';
const el=id=>document.getElementById(id);
const consent=el('consent'),input=el('imageInput'),preview=el('preview'),img=el('previewImage'),exportBtn=el('exportBtn');
const observation=el('observation'),uncertainty=el('uncertainty'),sourceNote=el('sourceNote');
let url=null,selected=null,loadVersion=0;
function inform(text,kind='info'){el('feedback').textContent=text;el('feedback').dataset.kind=kind;}
function release(){loadVersion++;img.removeAttribute('src');preview.hidden=true;if(url)URL.revokeObjectURL(url);url=null;selected=null;input.value='';exportBtn.disabled=true;}
function reset(){release();consent.checked=false;input.disabled=true;observation.value='';uncertainty.value='';sourceNote.value='';el('game').value='db';inform('Vorschau und Eingaben entfernt. Es gab keinen Upload.','ok');}
function isImage(type,buffer){const b=[...new Uint8Array(buffer)];
 if(type==='image/png')return b.length>=8&&[137,80,78,71,13,10,26,10].every((v,i)=>b[i]===v);
 if(type==='image/jpeg')return b.length>=3&&b[0]===255&&b[1]===216&&b[2]===255;
 if(type==='image/webp')return b.length>=12&&[82,73,70,70].every((v,i)=>b[i]===v)&&[87,69,66,80].every((v,i)=>b[i+8]===v);
 return false;}
function update(){exportBtn.disabled=!(consent.checked&&selected&&observation.value.trim());}
consent.addEventListener('change',()=>{if(!consent.checked){reset();return;}input.disabled=false;inform('Einwilligung aktiv. Screenshot auswählen.');update();});
input.addEventListener('change',async()=>{
 const file=input.files?.[0];release();const ownVersion=loadVersion;
 if(!consent.checked||!file)return;
 if(!['image/png','image/jpeg','image/webp'].includes(file.type)||!file.size||file.size>8*1024*1024){
  inform('Datei abgelehnt: PNG, JPEG oder WebP bis 8 MiB.','error');return;
 }
 try{
  const signature=await file.slice(0,12).arrayBuffer();
  // Selection may change or consent may be revoked while reading/decoding.
  if(ownVersion!==loadVersion||!consent.checked)return;
  if(!isImage(file.type,signature))throw Error('invalid');
  const candidate=URL.createObjectURL(file);url=candidate;img.src=candidate;
  await img.decode();
  if(ownVersion!==loadVersion||!consent.checked||url!==candidate)return;
  selected={mimeType:file.type,bytes:file.size};
  el('previewMeta').textContent='Nur lokale Vorschau · '+file.type;
  preview.hidden=false;
  inform('Screenshot lokal geöffnet. Beobachtung eintragen.','ok');update();
 }catch{
  if(ownVersion!==loadVersion)return;
  release();inform('Bilddaten ungültig oder Datei nicht lesbar.','error');
 }
});
for(const x of [observation,uncertainty,sourceNote])x.addEventListener('input',update);
el('clearBtn').addEventListener('click',reset);
exportBtn.addEventListener('click',()=>{if(exportBtn.disabled||!selected||!consent.checked)return;
 const obj={schemaVersion:1,source:'local-user-annotation',createdAt:new Date().toISOString(),language:'de',game:el('game').value,
 screenshot:{mimeType:selected.mimeType,bytes:selected.bytes,embedded:false,uploaded:false},
 observation:observation.value.trim().slice(0,500),uncertainty:uncertainty.value.trim().slice(0,300),sourceNote:sourceNote.value.trim().slice(0,240),
 evidence:{modelUsed:null,aiInferencePerformed:false,sourceVerified:false,gameRulesVerified:false,metaVerified:false,legalityVerified:false}};
 const blob=URL.createObjectURL(new Blob([JSON.stringify(obj,null,2)],{type:'application/json'}));
 const a=document.createElement('a');a.href=blob;a.download='cryogamehelp-screenshot-review-'+obj.game+'.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(blob),1000);
 inform('Bericht exportiert. Screenshot nicht enthalten.','ok');
});
window.addEventListener('pagehide',release);
