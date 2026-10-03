import {translations} from './i18n.js';
import {games, guides, REPO} from './data.js';

const $ = (s, root = document) => root.querySelector(s);
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icons = {
 bolt:'<path d="m13 2-9 11h7l-1 9 10-12h-7z"/>',home:'<path d="m3 10 9-7 9 7v10H3z"/><path d="M9 20v-7h6v7"/>',games:'<rect x="3" y="5" width="18" height="14" rx="4"/><path d="M7 12h6m-3-3v6m7-4h.01m2 3h.01"/>',book:'<path d="M12 5v16m0-16C8 2 3 3 3 3v16s5-1 9 2c4-3 9-2 9-2V3s-5-1-9 2Z"/>',grid:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',bookmark:'<path d="M6 3h12v19l-6-4-6 4z"/>',search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',arrow:'<path d="M4 12h16m-6-6 6 6-6 6"/>',external:'<path d="M14 3h7v7m0-7L10 14M10 3H3v18h18v-7"/>',moon:'<path d="M21 13A9 9 0 0 1 11 3a9 9 0 1 0 10 10Z"/>',sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1 1m12 12 1 1M5 19l1-1M18 6l1-1"/>',menu:'<path d="M3 6h18M3 12h18M3 18h18"/>',close:'<path d="m5 5 14 14M19 5 5 19"/>',plus:'<path d="M12 5v14M5 12h14"/>',minus:'<path d="M5 12h14"/>',download:'<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',check:'<path d="m4 12 5 5L20 6"/>',globe:'<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/>',github:'<path d="M9 19c-4 1-4-2-6-2m15 5v-4c0-1-.3-1.6-.8-2 3-.3 5.8-1.5 5.8-6a5 5 0 0 0-1.5-3.5c.2-.8.2-2-.3-3.5 0 0-1.2-.4-3.7 1.3a13 13 0 0 0-7 0C8 2.6 6.8 3 6.8 3c-.5 1.5-.5 2.7-.3 3.5A5 5 0 0 0 5 10c0 4.5 2.8 5.7 5.8 6-.5.4-.8 1-.8 2v4"/>',shield:'<path d="m12 3 9 4v5c0 5-9 10-9 10S3 17 3 12V7z"/><path d="m8 12 3 3 5-6"/>'
};
const mobileNavigation = matchMedia('(max-width: 1023px)');
const icon = (name, cls = '') => `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.grid}</svg>`;
let storageOK = true;
function read(key, fallback) { try { return JSON.parse(localStorage.getItem('cryo-'+key)) ?? fallback; } catch { return fallback; } }
function store(key, value) { try { localStorage.setItem('cryo-'+key,JSON.stringify(value)); } catch { storageOK = false; } }
const requestedLang = new URLSearchParams(location.search).get('lang');
let lang = [requestedLang, read('lang', null), navigator.language?.slice(0,2)].find(l => translations[l]) || 'en';
let theme = read('theme','dark') === 'light' ? 'light' : 'dark';
let bookmarks = read('bookmarks',[]);
if (!Array.isArray(bookmarks)) bookmarks = [];
bookmarks = bookmarks.filter(id => guides.some(g => g.id === id));
let plans = read('plans',{});
if (!plans || typeof plans !== 'object' || Array.isArray(plans)) plans = {};
// Only restore well-formed, bounded plans from browser storage.
for (const game of games) {
 const raw = Array.isArray(plans[game.id]) ? plans[game.id] : [];
 let used = 0;
 plans[game.id] = raw.filter(e => e && typeof e.id === 'string' && typeof e.name === 'string' && ['pokemon','trainer','energy','unit'].includes(e.type)).map(e => {
  const item = game.items.find(i => i.id === e.id);
  const entry = item ? {...item} : {id:e.id,name:e.name.slice(0,80),type:e.type,names:{},image:null};
  const max = game.id === 'live' && entry.type === 'energy' ? game.target : game.limit;
  entry.qty = Math.max(0,Math.min(Math.floor(Number(e.qty)||0),max,game.target-used)); used += entry.qty;
  return entry;
 }).filter(e => e.qty > 0 && !(game.id === 'pocket' && e.type === 'energy'));
}
let activeGame = 'db', filter = 'all', query = '', pickerQuery = '', savedOnly = false;
let toastTimer, observer;
const t = key => translations[lang][key] || key;
const currentGame = () => games.find(g => g.id === activeGame);
const entryName = entry => entry.names?.[lang] || entry.name;
const image = (name, alt = '', cls = '', eager = false) => `<img class="${cls}" src="assets/games/${name}.webp" alt="${esc(alt)}" ${eager?'fetchpriority="high"':'loading="lazy"'} decoding="async">`;
const repoModule = game => `${REPO}/blob/main/${game.module}/README_${lang==='de'?'DE':lang==='fr'?'FR':'EN'}.md`;
const link = (url, label, cls = '') => `<a class="${cls}" ${cls==='github-button'?`aria-label="${t('viewRepo')}"`:''} href="${esc(url)}" target="_blank" rel="noopener noreferrer">${label}${icon('external')}</a>`;

function render() {
 document.documentElement.lang = lang;
 document.documentElement.dataset.theme = theme;
 document.title = `CRYOGAMEHELP · ${t('heroA')} ${t('heroB')}`;
 $('meta[name="description"]').content = t('heroText');
 $('#app').innerHTML = `
 <a class="skip-link" href="#main">${t('skip')}</a>
 <div class="nav-scrim" data-action="menu-close"></div>
 <aside class="sidebar" id="sidebar">
  <button class="icon-button sidebar-close" data-action="menu-close" aria-label="${t('close')}">${icon('close')}</button>
  <a class="brand" href="#overview"><span class="brand-logo">${icon('bolt')}</span><span>CRYO<span class="brand-green">GAMEHELP</span><small>${t('tagline')}</small></span></a>
  <nav aria-label="${t('navLabel')}"><p class="nav-label">${t('explore')}</p>
   ${[['overview','home','overview'],['games','games','games'],['guides','book','guides']].map(([id,i,label])=>`<a class="nav-link ${id==='overview'?'active':''}" href="#${id}" data-nav="${id}">${icon(i)}<span>${t(label)}</span>${id==='games'?'<small>04</small>':''}</a>`).join('')}
   <p class="nav-label workspace-label">${t('workspace')}</p>
   <a class="nav-link" href="#builder" data-nav="builder">${icon('grid')}<span>${t('builder')}</span></a>
   <a class="nav-link" href="#guides" data-action="saved">${icon('bookmark')}<span>${t('saved')}</span><small id="savedCount">${bookmarks.length}</small></a>
  </nav>
  <div class="sidebar-bottom"><div class="community-card">${icon('bolt')}<strong>${t('community')}</strong><p>${t('communityText')}</p>${link(REPO,t('viewRepo'))}</div><span class="sidebar-foot">CRYOGAMEHELP <span>↗ 2026</span></span></div>
 </aside>
 <div class="main-wrap"><header class="topbar">
  <button class="icon-button mobile-menu" data-action="menu" aria-label="${t('menu')}" aria-controls="sidebar" aria-expanded="false">${icon('menu')}</button>
  <div class="breadcrumb"><span>${t('explore')}</span><i>/</i><strong>${t('overview')}</strong></div>
  <label class="global-search">${icon('search')}<input id="globalSearch" type="search" value="${esc(query)}" placeholder="${t('search')}" aria-label="${t('search')}"><kbd>/</kbd></label>
  <div class="top-actions"><label class="language-control">${icon('globe')}<select id="language" aria-label="${t('language')}"><option value="en" ${lang==='en'?'selected':''}>EN</option><option value="de" ${lang==='de'?'selected':''}>DE</option><option value="fr" ${lang==='fr'?'selected':''}>FR</option></select></label><button class="icon-button" data-action="theme" aria-label="${t('theme')}">${icon(theme==='dark'?'sun':'moon')}</button>${link(REPO,icon('github'),'github-button')}</div>
 </header>
 <main id="main">
  <section class="hero" id="overview"><div class="hero-grid"></div><div class="hero-glow"></div>
   <div class="hero-copy"><p class="eyebrow"><span class="status-dot"></span>${t('welcome')}</p><h1>${t('heroA')}<br><span>${t('heroB')}</span></h1><p class="hero-text">${t('heroText')}</p><div class="hero-buttons"><a class="button primary" href="#games">${t('browse')}${icon('arrow')}</a><a class="button secondary" href="#builder">${icon('grid')}${t('openBuilder')}</a></div><p class="hero-fan">${icon('shield')}${t('fan')}</p></div>
   <div class="hero-art">${image('legends-goku','Super Saiyan Goku — Dragon Ball Legends official artwork','hero-character',true)}<span class="art-star star-one">✦</span><span class="art-star star-two">✧</span></div>
   <button class="hero-feature" data-game="db"><span class="feature-icon">${icon('bolt')}</span><span><small>${t('featured')}</small><strong>${t('heroGame')}</strong><em>${t('heroCaption')}</em></span>${icon('arrow')}</button>
   <span class="hero-index">01 / 04</span>
  </section>
  <div class="hub-stats"><div><span class="stat-symbol">${icon('games')}</span><strong>04</strong><span>${t('fourGames')}</span></div><div><span class="stat-symbol">${icon('globe')}</span><strong>03</strong><span>${t('threeLangs')}</span></div><div><span class="stat-symbol">${icon('github')}</span><strong>100%</strong><span>${t('free')}</span></div></div>
  <section class="section" id="games"><div class="section-head"><div><p class="eyebrow">${t('libraryKicker')}</p><h2>${t('choose')}</h2><p class="section-description">${t('libraryText')}</p></div><span class="section-number">01 — 04</span></div><div class="filter-row" role="group" aria-label="${t('gameFilter')}">${['all','mobile','tcg','pvp'].map(f=>`<button class="filter ${f===filter?'active':''}" data-filter="${f}" aria-pressed="${f===filter}">${t(f)}</button>`).join('')}<span class="filter-total" id="gameCount"></span></div><div class="game-grid" id="gameGrid"></div></section>
  <section class="section" id="guides"><div class="section-head"><div><p class="eyebrow">${t('guideKicker')}</p><h2 id="guidesHeading">${t(savedOnly?'savedHeading':'guideHeading')}</h2><p class="section-description">${t('guideText')}</p></div><button class="text-button" data-action="all-guides">${t('allGuides')}${icon('arrow')}</button></div><div class="guide-grid" id="guideGrid"></div></section>
  <section class="section" id="builder"><div class="section-head"><div><p class="eyebrow">${t('plannerKicker')}</p><h2>${t('plannerHeading')}</h2><p class="section-description">${t('plannerText')}</p></div><span class="section-number">${t('playbook')}</span></div><div class="builder-tabs" role="group" aria-label="${t('chooseGame')}">${games.map(g=>`<button data-builder="${g.id}" class="${g.id===activeGame?'active':''}" aria-pressed="${g.id===activeGame}"><span style="--game-color:${g.color}" class="game-dot"></span>${g.short}</button>`).join('')}</div><div class="builder-layout"><div class="catalog"><div class="panel-heading"><h3>${t('available')}</h3>${icon('plus')}</div><label class="picker-search">${icon('search')}<input id="pickerSearch" type="search" value="${esc(pickerQuery)}" placeholder="${t('filterItems')}" aria-label="${t('filterItems')}"></label><div id="pickerList" class="picker-list"></div><p class="catalog-note">${t('catalogNote')}</p><form id="customForm" class="custom-form"><input name="name" maxlength="80" required placeholder="${t('customName')}" aria-label="${t('customName')}"><select name="type" aria-label="${t('customType')}"></select><button class="button secondary" type="submit">${icon('plus')}${t('addCustom')}</button></form></div><div class="plan-panel"><div class="panel-heading"><div><p class="eyebrow">${t('plan')}</p><h3 id="planTitle"></h3></div><button class="text-button muted" data-action="reset">${t('reset')}</button></div><p id="planRule" class="plan-rule"></p><div id="planEntries"></div><div class="plan-summary" id="planSummary"></div><div class="plan-footer"><span id="storageStatus">${icon('check')}${t(storageOK?'savedLocal':'storageError')}</span><button class="button secondary" data-action="export">${icon('download')}${t('export')}</button></div></div></div><p class="planner-note">${icon('shield')}${t('plannerNote')}</p></section>
  <section class="section" id="news"><div class="section-head"><div><p class="eyebrow">${t('officialKicker')}</p><h2>${t('officialHeading')}</h2><p class="section-description">${t('officialText')}</p></div></div><div class="official-grid">${games.map(g=>link(g.official,`<span class="game-dot" style="--game-color:${g.color}"></span><span><strong>${g.name}</strong><small>${t('official')}</small></span>`,'official-link')).join('')}</div></section>
  <section class="contribute"><div class="contribute-mark">${icon('github')}</div><div><h2>${t('repoHeading')}</h2><p>${t('repoText')}</p></div>${link(REPO,t('contribute'),'button primary')}</section>
  <footer class="footer"><div><a class="footer-brand" href="#overview">CRYO<span>GAMEHELP</span></a><p>${t('footer')}</p></div><div class="footer-links"><button data-action="credits">${t('credits')}</button>${link(REPO+'/blob/main/LICENSE.md',t('license'))}<a href="#overview">${t('backTop')} ↑</a></div><small>${t('copyright')}</small></footer>
 </main></div><dialog id="detailDialog" aria-labelledby="dialogTitle"><div class="dialog-toolbar"><button class="dialog-close icon-button" data-action="close" aria-label="${t('close')}">${icon('close')}</button></div><div id="dialogContent"></div></dialog><div class="toast" role="status" aria-live="polite" id="toast"></div>`;
 renderGames(); renderGuides(); renderPlanner(); bind();
 closeMenu(false);
 $('#detailDialog').addEventListener('close',()=>document.body.classList.remove('dialog-open'));
 observer?.disconnect();
 observer = new IntersectionObserver(entries => {
  const visible = entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
  if (visible) document.querySelectorAll('[data-nav]').forEach(a=>a.classList.toggle('active',a.dataset.nav===visible.target.id));
 },{rootMargin:'-15% 0px -55% 0px',threshold:[0,.2,.5]});
 ['overview','games','guides','builder'].forEach(id=>observer.observe($('#'+id)));
}
function matches(text) { return text.toLocaleLowerCase(lang).includes(query.toLocaleLowerCase(lang).trim()); }
function gameArtwork(g) {
 if(g.id==='go') return image('rayquaza','','card-character')+image('pikachu','','card-secondary');
 return image(g.image,'',g.id==='db'?'card-character':g.id==='live'?'card-screenshot':'card-spread');
}
function renderGames() {
 const filtered = games.filter(g=>(filter==='all'||g.types.includes(filter))&&matches(g.name+' '+t(g.id+'Desc')+' '+g.types.join(' ')));
 $('#gameCount').textContent = `${String(filtered.length).padStart(2,'0')} / 04`;
 $('#gameGrid').innerHTML = filtered.length ? filtered.map((g,i)=>`<article class="game-card game-${g.id}" style="--game-color:${g.color}"><button class="game-art" data-game="${g.id}" aria-label="${t('exploreGame')}: ${g.name}"><span class="game-art-orb"></span>${gameArtwork(g)}<span class="game-art-number">0${games.indexOf(g)+1}</span><span class="game-art-tag">${g.id==='live'?'TCG':g.id==='db'?'PVP':g.id==='go'?'RAIDS':'TCG'}</span></button><div class="game-copy"><p class="game-label">${t(g.id+'Label')}</p><h3>${g.name}</h3><p>${t(g.id+'Desc')}</p><button class="game-open" data-game="${g.id}">${t('exploreGame')}${icon('arrow')}</button></div></article>`).join('') : `<div class="empty-state">${icon('search')}<p>${t('noGames')}</p><button class="button secondary" data-action="clear-search">${t('clearSearch')}</button></div>`;
}
function renderGuides() {
 const filtered = guides.filter(g=>(!savedOnly||bookmarks.includes(g.id))&&matches(g[lang].title+' '+g[lang].intro+' '+games.find(x=>x.id===g.game).name));
 $('#guidesHeading').textContent=t(savedOnly?'savedHeading':'guideHeading');
 $('#guideGrid').innerHTML = filtered.length ? filtered.map(g=>{
  const game = games.find(x=>x.id===g.game), saved=bookmarks.includes(g.id);
  return `<article class="guide-card" style="--game-color:${game.color}"><button class="guide-image ${['pocket-pikachu','pocket-charizard','live-battle'].includes(g.image)?'guide-image--portrait':''}" data-guide="${g.id}" aria-label="${t('readGuide')}: ${esc(g[lang].title)}">${image(g.image,'')}<span class="guide-game">${game.name}</span></button><button class="bookmark-button ${saved?'is-saved':''}" data-save="${g.id}" aria-label="${t(saved?'unsaveGuide':'saveGuide')}: ${esc(g[lang].title)}" aria-pressed="${saved}">${icon('bookmark')}</button><div class="guide-copy"><div class="guide-meta"><span>${t(g.category)}</span><small>${g.minutes} ${t('minute')}</small></div><h3><button data-guide="${g.id}">${esc(g[lang].title)}</button></h3><p>${esc(g[lang].intro)}</p><button class="text-button" data-guide="${g.id}">${t('readGuide')}${icon('arrow')}</button></div></article>`;
 }).join('') : `<div class="empty-state">${icon('bookmark')}<p>${t(savedOnly?'savedEmpty':'noGuides')}</p></div>`;
}
function renderPicker() {
 const game = currentGame();
 const filtered=game.items.filter(e=>(entryName(e)+' '+t(e.type)).toLocaleLowerCase(lang).includes(pickerQuery.toLocaleLowerCase(lang)));
 $('#pickerList').innerHTML=filtered.length ? filtered.map(e=>`<button class="picker-item" data-add="${e.id}" ${canAdd(e)?'':'disabled'}><span class="item-art">${e.image?image(e.image,''):icon(e.type==='energy'?'bolt':'book')}</span><span><strong>${esc(entryName(e))}</strong><small>${t(e.type)}</small></span>${icon('plus')}</button>`).join('') : `<p class="catalog-note">${t('noneFound')}</p>`;
}
function renderPlanner() {
 const game=currentGame(), entries=plans[game.id], count=entries.reduce((n,e)=>n+e.qty,0);
 $('#planTitle').textContent=game.name;$('#planRule').textContent=t(game.id+'Rule');
 document.querySelectorAll('[data-builder]').forEach(b=>{b.classList.toggle('active',b.dataset.builder===activeGame);b.setAttribute('aria-pressed',String(b.dataset.builder===activeGame));});
 const types=game.id==='db'?['unit']:game.id==='go'?['pokemon']:game.id==='pocket'?['pokemon','trainer']:['pokemon','trainer','energy'];
 $('#customForm select').innerHTML=types.map(type=>`<option value="${type}">${t(type)}</option>`).join('');
 if(game.id==='db'||game.id==='go') {
  const expanded=entries.flatMap(e=>Array.from({length:e.qty},()=>e));
  $('#planEntries').innerHTML=`<div class="team-slots">${Array.from({length:6},(_,i)=>{
   const e=expanded[i];return e?`<div class="team-slot filled"><span class="slot-index">0${i+1}</span><button class="slot-remove" data-remove="${esc(e.id)}" aria-label="${t('remove')}: ${esc(entryName(e))}">${icon('close')}</button>${e.image?image(e.image,''):icon('games')}<strong>${esc(entryName(e))}</strong></div>`:`<div class="team-slot empty"><span class="slot-index">0${i+1}</span>${icon('plus')}<small>${t('emptySlot')}</small></div>`;
  }).join('')}</div>`;
 } else {
  $('#planEntries').innerHTML=entries.length?`<div class="deck-list">${entries.map(e=>`<div class="deck-entry"><span class="item-art">${e.image?image(e.image,''):icon(e.type==='energy'?'bolt':'book')}</span><span class="deck-entry-name"><strong>${esc(entryName(e))}</strong><small>${t(e.type)}</small></span><div class="quantity"><button data-remove="${esc(e.id)}" aria-label="${t('remove')}: ${esc(entryName(e))}">${icon('minus')}</button><b>${e.qty}</b><button data-increase="${esc(e.id)}" ${canAdd(e)?'':'disabled'} aria-label="${t('add')}: ${esc(entryName(e))}">${icon('plus')}</button></div></div>`).join('')}</div>`:`<div class="empty-plan">${icon('grid')}<p>${t('emptyPlan')}</p></div>`;
 }
 $('#planSummary').innerHTML=`<div class="progress-heading"><span><b>${count}</b> / ${game.target} ${t(game.target===6?'teamCount':'deckCount')}</span><span>${entries.length} ${t('unique')}</span></div><progress max="${game.target}" value="${count}" aria-label="${t('plan')}"></progress><p>${icon(count===game.target?'check':'grid')}${t(count===game.target?'complete':'incomplete')}</p>`;
 $('#storageStatus').innerHTML=icon(storageOK?'check':'shield')+t(storageOK?'savedLocal':'storageError');
 $('[data-action="export"]').disabled=!entries.length;
 renderPicker();
}
function canAdd(entry) {
 const g=currentGame(), entries=plans[g.id], count=entries.reduce((n,e)=>n+e.qty,0), same=entries.find(e=>e.id===entry.id);
 const limit=g.id==='live'&&entry.type==='energy'?g.target:g.limit;
 return count<g.target && (!same||same.qty<limit);
}
function persistPlan() {store('plans',plans);renderPlanner();}
function addEntry(entry) {
 if(!canAdd(entry)){toast(t('limit'));return;}
 const entries=plans[activeGame], same=entries.find(e=>e.id===entry.id);
 if(same) same.qty++;else entries.push({...entry,qty:1});
 persistPlan();toast(t('added'));
}
function openDialog(html) {
 $('#dialogContent').innerHTML=html;
 document.body.classList.add('dialog-open');
 $('#detailDialog').showModal();
 $('#detailDialog').scrollTop=0;
}
function openGame(id) {
 const game=games.find(g=>g.id===id);
 openDialog(`<div class="dialog-game-art game-${game.id}" style="--game-color:${game.color}">${gameArtwork(game)}</div><div class="dialog-body"><p class="eyebrow">${t(game.id+'Label')}</p><h2 id="dialogTitle">${game.name}</h2><p>${t(game.id+'Desc')}</p><h3>${t('learn')}</h3><div class="dialog-guide-links">${guides.filter(g=>g.game===id).map(g=>`<button data-guide="${g.id}">${esc(g[lang].title)}${icon('arrow')}</button>`).join('')}</div><h3>${t('screenshots')}</h3><div class="screenshot-gallery">${game.gallery.map((name,i)=>`<a href="assets/games/${name}.webp" target="_blank" rel="noopener noreferrer" aria-label="${t('screenshots')}: ${game.name} ${i+1}">${image(name,game.name+' — '+t('screenshots'))}</a>`).join('')}</div><div class="dialog-actions"><button class="button primary" data-plan="${id}">${t('openBuilder')}${icon('arrow')}</button>${link(game.official,t('openOfficial'),'button secondary')}</div>${link(repoModule(game),t('openModule'),'source-link')}<p class="small-note">${t('sourceLanguage')}</p></div>`);
}
function openGuide(id) {
 const guide=guides.find(g=>g.id===id), game=games.find(g=>g.id===guide.game), copy=guide[lang];
 if($('#detailDialog').open) $('#detailDialog').close();
 openDialog(`<div class="dialog-body guide-detail"><p class="eyebrow">${game.name} · ${guide.minutes} ${t('minute')}</p><h2 id="dialogTitle">${esc(copy.title)}</h2><p class="dialog-intro">${esc(copy.intro)}</p><div class="guide-steps">${copy.steps.map(([title,body],i)=>`<section><span>0${i+1}</span><div><h3>${esc(title)}</h3><p>${esc(body)}</p></div></section>`).join('')}</div><div class="guide-source"><h4>${t('source')}</h4><p>${t('guideSource')}</p>${link(game.official,t('openOfficial'))}${link(repoModule(game),t('openModule'))}</div><div class="dialog-actions"><button class="button primary" data-plan="${game.id}">${t('openBuilder')}${icon('arrow')}</button><button class="button secondary" data-save="${guide.id}" aria-pressed="${bookmarks.includes(id)}">${icon('bookmark')}${t(bookmarks.includes(id)?'unsaveGuide':'saveGuide')}</button></div></div>`);
}
function toast(message) {clearTimeout(toastTimer);$('#toast').textContent=message;$('#toast').classList.add('visible');toastTimer=setTimeout(()=>$('#toast')?.classList.remove('visible'),2600);}
function closeMenu(restoreFocus = true) {
 const wasOpen=document.body.classList.contains('menu-open');
 document.body.classList.remove('menu-open');
 $('.main-wrap').inert=false;
 $('#sidebar').inert=mobileNavigation.matches;
 $('#sidebar').setAttribute('aria-hidden',String(mobileNavigation.matches));
 $('[data-action="menu"]')?.setAttribute('aria-expanded','false');
 if(wasOpen&&restoreFocus&&mobileNavigation.matches)$('[data-action="menu"]').focus();
}
function openMenu() {
 document.body.classList.add('menu-open');
 $('#sidebar').inert=false;
 $('#sidebar').setAttribute('aria-hidden','false');
 $('.main-wrap').inert=true;
 $('[data-action="menu"]').setAttribute('aria-expanded','true');
 $('.sidebar-close').focus();
}
mobileNavigation.addEventListener('change',()=>closeMenu(false));
function bind() {
 $('#language').addEventListener('change',e=>{lang=e.target.value;store('lang',lang);const url=new URL(location.href);url.searchParams.set('lang',lang);history.replaceState(null,'',url);render();});
 $('#globalSearch').addEventListener('input',e=>{query=e.target.value;renderGames();renderGuides();});
 $('#globalSearch').addEventListener('keydown',e=>{if(e.key==='Enter') $('#games').scrollIntoView({behavior:'smooth'});});
 $('#pickerSearch').addEventListener('input',e=>{pickerQuery=e.target.value;renderPicker();});
 $('#customForm').addEventListener('submit',e=>{
  e.preventDefault();const form=e.currentTarget,name=form.elements.name.value.trim(),type=form.elements.type.value;
  if(!name){toast(t('invalidName'));return;}
  // Use one identity per name so custom entries cannot bypass copy limits.
  const normalized=name.toLocaleLowerCase(lang), known=currentGame().items.find(i=>[i.name,...Object.values(i.names||{})].some(n=>n.toLocaleLowerCase(lang)===normalized));
  const existing=plans[activeGame].find(i=>entryName(i).toLocaleLowerCase(lang)===normalized||i.name.toLocaleLowerCase(lang)===normalized);
  addEntry(known||existing||{id:'custom-'+normalized,name,type,image:null,names:{}});form.elements.name.value='';
 });
}
$('#app').addEventListener('click',e=>{
 const el=e.target.closest('button,a');if(!el)return;
 if(el.dataset.nav) {if(el.dataset.nav==='guides'){savedOnly=false;renderGuides();}closeMenu();}
 if(el.dataset.game) {openGame(el.dataset.game);return;}
 if(el.dataset.guide) {openGuide(el.dataset.guide);return;}
 if(el.dataset.save) {
  const id=el.dataset.save;bookmarks=bookmarks.includes(id)?bookmarks.filter(x=>x!==id):[...bookmarks,id];store('bookmarks',bookmarks);$('#savedCount').textContent=bookmarks.length;renderGuides();
  if(el.closest('dialog')) {el.innerHTML=icon('bookmark')+t(bookmarks.includes(id)?'unsaveGuide':'saveGuide');el.setAttribute('aria-pressed',String(bookmarks.includes(id)));}return;
 }
 if(el.dataset.builder||el.dataset.plan) {
  activeGame=el.dataset.builder||el.dataset.plan;pickerQuery='';$('#pickerSearch').value='';renderPlanner();
  if(el.dataset.plan){$('#detailDialog').close();$('#builder').scrollIntoView({behavior:'smooth'});}return;
 }
 if(el.dataset.add) {addEntry(currentGame().items.find(i=>i.id===el.dataset.add));return;}
 if(el.dataset.increase) {addEntry(plans[activeGame].find(i=>i.id===el.dataset.increase));return;}
 if(el.dataset.remove) {const entries=plans[activeGame],item=entries.find(i=>i.id===el.dataset.remove);if(item){item.qty--;plans[activeGame]=entries.filter(i=>i.qty>0);persistPlan();toast(t('removed'));}return;}
 switch(el.dataset.action) {
  case 'menu': openMenu();break;
  case 'menu-close': closeMenu();break;
  case 'theme': theme=theme==='dark'?'light':'dark';store('theme',theme);document.documentElement.dataset.theme=theme;el.innerHTML=icon(theme==='dark'?'sun':'moon');break;
  case 'saved': savedOnly=true;renderGuides();closeMenu();break;
  case 'all-guides': savedOnly=false;query='';$('#globalSearch').value='';renderGames();renderGuides();break;
  case 'clear-search': query='';filter='all';render();break;
  case 'reset': plans[activeGame]=[];persistPlan();toast(t('resetDone'));break;
  case 'export': {
   const game=currentGame(),text=[t('downloadTitle'),game.name,t(game.id+'Rule'),' ',...plans[activeGame].map(i=>`${i.qty} × ${entryName(i)} (${t(i.type)})`),' ',t('plannerNote')].join('\n');
   const url=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download=`cryogamehelp-${activeGame}-${lang}.txt`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast(t('exportDone'));break;
  }
  case 'close': $('#detailDialog').close();break;
  case 'credits': openDialog(`<div class="dialog-body"><p class="eyebrow">CRYOGAMEHELP</p><h2 id="dialogTitle">${t('creditsHeading')}</h2><p>${t('creditsIntro')}</p><p>${t('creditsOwners')}</p><div class="credit-links">${link('https://dble.bn-ent.net/en/','Dragon Ball Legends')}${link('https://tcgpocket.pokemon.com/en-us/','Pokémon TCG Pocket')}${link('https://www.pokemon.com/','Pokémon')}${link('https://apps.apple.com/us/app/pok%C3%A9mon-tcg-live/id1557962344','Pokémon TCG Live · App Store')}${link('assets/sources.json',t('sourceManifest'))}</div></div>`);break;
 }
 if(el.dataset.filter) {filter=el.dataset.filter;document.querySelectorAll('[data-filter]').forEach(b=>{b.classList.toggle('active',b===el);b.setAttribute('aria-pressed',String(b===el));});renderGames();}
});
document.addEventListener('click',e=>{if(e.target.classList.contains('nav-scrim'))closeMenu();});
document.addEventListener('keydown',e=>{
 if(e.key==='Escape')closeMenu();
 if(e.key==='Tab'&&document.body.classList.contains('menu-open')) {
  const controls=[...$('#sidebar').querySelectorAll('a[href],button:not([disabled])')].filter(el=>el.getBoundingClientRect().height>0);
  const first=controls[0],last=controls.at(-1);
  if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
  else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
 }
 if(e.key==='/'&&!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)&&!$('#detailDialog').open){e.preventDefault();$('#globalSearch').focus();}
});
render();
if(location.hash)requestAnimationFrame(()=>document.getElementById(location.hash.slice(1))?.scrollIntoView());
$('#app').addEventListener('click',e=>{if(e.target===$('#detailDialog')){const box=e.target.getBoundingClientRect();if(e.clientX<box.left||e.clientX>box.right||e.clientY<box.top||e.clientY>box.bottom)e.target.close();}});
