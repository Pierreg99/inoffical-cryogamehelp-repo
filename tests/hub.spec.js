import {test,expect} from '@playwright/test';

test('all three languages update the interface and persist',async({page})=>{
 await page.goto('/?lang=en');
 await expect(page.locator('h1')).toContainText('Play smarter.');
 await page.locator('#language').selectOption('de');
 await expect(page.locator('h1')).toContainText('Spiel smarter.');
 await expect(page.locator('html')).toHaveAttribute('lang','de');
 await page.locator('#language').selectOption('fr');
 await expect(page.locator('h1')).toContainText('Jouez mieux.');
 await page.reload();
 await expect(page.locator('html')).toHaveAttribute('lang','fr');
 await page.locator('[data-guide="pocket-first"]').first().click();
 await expect(page.locator('dialog')).toContainText('Un plan de jeu clair.');
 await expect(page.locator('.guide-steps section')).toHaveCount(3);
 await page.keyboard.press('Escape');await expect(page.locator('dialog')).not.toBeVisible();
});

test('search and filters work together with accurate results',async({page})=>{
 await page.goto('/?lang=en');
 await page.locator('[data-filter="tcg"]').click();
 await expect(page.locator('.game-card')).toHaveCount(2);
 await page.locator('#globalSearch').fill('GO');
 await expect(page.locator('.game-card')).toHaveCount(0);
 await page.locator('[data-action="clear-search"]').click();
 await expect(page.locator('.game-card')).toHaveCount(4);
 await page.locator('#globalSearch').fill('Pocket');
 await expect(page.locator('.game-card')).toHaveCount(1);
 await expect(page.locator('.guide-card')).toHaveCount(2);
});

test('guide bookmarks are saved and can be removed',async({page})=>{
 await page.goto('/?lang=en');
 await page.locator('[data-save="legends-core"]').click();
 await page.reload();
 await expect(page.locator('[data-save="legends-core"]')).toHaveAttribute('aria-pressed','true');
 if(test.info().project.name==='mobile')await page.locator('[data-action="menu"]').click();
 await page.locator('[data-action="saved"]').click();
 await expect(page.locator('.guide-card')).toHaveCount(1);
 await page.locator('[data-save="legends-core"]').click();
 await expect(page.locator('.guide-card')).toHaveCount(0);
 await expect(page.locator('#guideGrid')).toContainText('Save a guide');
});

test('filtered builder adds the correct unit and saves separate plans',async({page})=>{
 await page.goto('/?lang=en');
 await page.locator('#pickerSearch').fill('Vegeta');
 await page.locator('[data-add="vegeta"]').click();
 await expect(page.locator('.team-slot.filled')).toContainText('Vegeta');
 await page.locator('[data-builder="go"]').click();
 await expect(page.locator('.team-slot.filled')).toHaveCount(0);
 await page.locator('[data-add="rayquaza"]').click();
 await page.locator('[data-builder="db"]').click();
 await expect(page.locator('.team-slot.filled')).toContainText('Vegeta');
 await page.reload();
 await expect(page.locator('.team-slot.filled')).toContainText('Vegeta');
 await page.locator('[data-remove="vegeta"]').click();
 await expect(page.locator('.team-slot.filled')).toHaveCount(0);
});

test('deck capacity, copy limits, custom entries, and export',async({page})=>{
 await page.goto('/?lang=en');
 await page.locator('[data-builder="pocket"]').click();
 await page.locator('[data-add="pikachu-ex"]').click();
 await page.locator('[data-add="pikachu-ex"]').click();
 await expect(page.locator('[data-add="pikachu-ex"]')).toBeDisabled();
 await page.locator('#customForm input').fill('Pikachu ex');
 await page.locator('#customForm button').click();
 await expect(page.locator('.deck-entry')).toHaveCount(1);
 await expect(page.locator('.quantity b')).toHaveText('2');
 await page.locator('#customForm input').fill('<img src=x onerror=alert(1)>');
 await page.locator('#customForm button').click();
 await expect(page.locator('.deck-entry')).toHaveCount(2);
 await expect(page.locator('.deck-entry-name').last()).toContainText('<img src=x');
 await expect(page.locator('img[src="x"]')).toHaveCount(0);
 const downloadPromise=page.waitForEvent('download');
 await page.locator('[data-action="export"]').click();
 expect((await downloadPromise).suggestedFilename()).toBe('cryogamehelp-pocket-en.txt');
 await page.locator('[data-builder="live"]').click();
 await page.locator('[data-add="fire-energy"]').click();
 for(let i=0;i<59;i++)await page.locator('[data-increase="fire-energy"]').click();
 await expect(page.locator('#planSummary')).toContainText('60');
 await expect(page.locator('[data-add="water-energy"]')).toBeDisabled();
 await expect(page.locator('#planSummary')).toContainText('Target reached');
});

test('all artwork loads, no browser errors, and layout fits viewport',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/?lang=de');
 await page.locator('#news').scrollIntoViewIfNeeded();
 // Check every asset, including intentionally off-screen lazy images.
 await page.evaluate(()=>document.querySelectorAll('img').forEach(img=>img.loading='eager'));
 await page.waitForFunction(()=>[...document.images].every(i=>i.complete&&i.naturalWidth>0));
 expect(errors).toEqual([]);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.locator('[data-action="theme"]').click();
 await expect(page.locator('html')).toHaveAttribute('data-theme','light');
 await page.reload();
 await expect(page.locator('html')).toHaveAttribute('data-theme','light');
 await page.locator('[data-game="db"]').first().click();
 await expect(page.locator('dialog')).toBeVisible();
 await page.locator('[data-plan="db"]').click();
 await expect(page.locator('dialog')).not.toBeVisible();
});

test('Legends checklist persists across reload, language changes, and reset', async ({page})=>{
 await page.goto('/?lang=en');
 await page.locator('[data-guide="legends-core"]').first().click();
 await expect(page.locator('#learningStatus')).toHaveText('0 / 3 steps complete');
 await expect(page.locator('[data-action="reset-learning"]')).toBeDisabled();
 await page.locator('[data-progress-step="0"]').check();
 await page.locator('[data-progress-step="2"]').check();
 await expect(page.locator('#learningStatus')).toHaveText('2 / 3 steps complete');
 await expect(page.locator('#learningMeter')).toHaveJSProperty('value',2);
 await expect(page.locator('[data-learning-step="0"]')).toHaveClass(/is-complete/);
 await expect(page.locator('[data-learning-step="2"]')).toHaveClass(/is-complete/);
 await page.reload();
 await page.locator('[data-guide="legends-core"]').first().click();
 await expect(page.locator('[data-progress-step="0"]')).toBeChecked();
 await expect(page.locator('[data-progress-step="1"]')).not.toBeChecked();
 await expect(page.locator('[data-progress-step="2"]')).toBeChecked();
 await page.keyboard.press('Escape');
 await page.locator('#language').selectOption('de');
 await page.locator('[data-guide="legends-core"]').first().click();
 await expect(page.locator('#learningStatus')).toHaveText('2 / 3 Schritte abgeschlossen');
 await page.locator('[data-action="reset-learning"]').click();
 await expect(page.locator('#learningStatus')).toHaveText('0 / 3 Schritte abgeschlossen');
 await expect(page.locator('[data-progress-step="0"]')).not.toBeChecked();
 await expect(page.locator('[data-learning-step="0"]')).not.toHaveClass(/is-complete/);
 await expect(page.locator('[data-learning-step="2"]')).not.toHaveClass(/is-complete/);
 await page.reload();
 await page.locator('[data-guide="legends-core"]').first().click();
 await expect(page.locator('#learningStatus')).toHaveText('0 / 3 Schritte abgeschlossen');
});

test('Legends checklist ignores malformed and out-of-range localStorage values',async({page})=>{
 await page.goto('/?lang=en');
 await page.evaluate(()=>localStorage.setItem('cryo-legends-progress',JSON.stringify([0,0,99,-1,'1',null])));
 await page.reload();
 await page.locator('[data-guide="legends-core"]').first().click();
 await expect(page.locator('#learningStatus')).toHaveText('1 / 3 steps complete');
 await expect(page.locator('[data-progress-step="0"]')).toBeChecked();
 await expect(page.locator('[data-progress-step="1"]')).not.toBeChecked();
 await page.evaluate(()=>localStorage.setItem('cryo-legends-progress','{"corrupt":true}'));
 await page.reload();
 await page.locator('[data-guide="legends-core"]').first().click();
 await expect(page.locator('#learningStatus')).toHaveText('0 / 3 steps complete');
});

test('Legends visual step completion responds to check and uncheck without reloading',async({page})=>{
 await page.goto('/?lang=en');
 await page.locator('[data-guide="legends-core"]').first().click();
 const row=page.locator('[data-learning-step="1"]');
 const input=page.locator('[data-progress-step="1"]');
 await expect(row).not.toHaveClass(/is-complete/);
 await input.check();
 await expect(row).toHaveClass(/is-complete/);
 await expect(row.locator('.learning-toggle span')).toHaveText('Step completed');
 await expect(page.locator('#learningStatus')).toHaveText('1 / 3 steps complete');
 await input.uncheck();
 await expect(row).not.toHaveClass(/is-complete/);
 await expect(row.locator('.learning-toggle span')).toHaveText('Mark step complete');
 await expect(page.locator('#learningStatus')).toHaveText('0 / 3 steps complete');
 await expect(page.locator('#learningMeter')).toHaveJSProperty('value',0);
});

test('all eight guides have isolated progress and browser persistence',async({page})=>{
 await page.goto('/?lang=en');
 await expect(page.locator('.guide-card')).toHaveCount(8);
 await page.locator('[data-guide="pocket-first"]').first().click();
 await expect(page.locator('[data-learning-panel="pocket-first"]')).toBeVisible();
 await expect(page.locator('[data-progress-step]')).toHaveCount(3);
 await page.locator('[data-progress-step="1"]').check();
 await expect(page.locator('#learningStatus')).toHaveText('1 / 3 steps complete');
 await expect(page.locator('[data-learning-step="1"]')).toHaveClass(/is-complete/);
 await page.keyboard.press('Escape');
 await expect(page.locator('.guide-progress-badge')).toHaveCount(1);
 await page.locator('[data-guide="live-deck"]').first().click();
 await expect(page.locator('#learningStatus')).toHaveText('0 / 3 steps complete');
 await page.locator('[data-progress-step="0"]').check();
 await page.locator('[data-progress-step="2"]').check();
 await page.reload();
 await page.locator('[data-guide="pocket-first"]').first().click();
 await expect(page.locator('#learningStatus')).toHaveText('1 / 3 steps complete');
 await expect(page.locator('[data-progress-step="1"]')).toBeChecked();
 await page.locator('[data-action="reset-learning"]').click();
 await expect(page.locator('#learningStatus')).toHaveText('0 / 3 steps complete');
 await page.keyboard.press('Escape');
 await page.locator('[data-guide="live-deck"]').first().click();
 await expect(page.locator('#learningStatus')).toHaveText('2 / 3 steps complete');
 await expect(page.locator('[data-progress-step="2"]')).toBeChecked();
 await page.keyboard.press('Escape');
 for(const id of ['legends-core','go-raids','legends-resources','pocket-collection','go-battle','live-resources']) {
  await page.locator(`[data-guide="${id}"]`).first().click();
  await expect(page.locator(`[data-learning-panel="${id}"]`)).toBeVisible();
  await expect(page.locator('[data-progress-step]')).toHaveCount(3);
  await page.keyboard.press('Escape');
 }
});
test('legacy Legends progress migrates when another guide is first checked',async({page})=>{
 await page.goto('/?lang=en');
 await page.evaluate(()=>{localStorage.removeItem('cryo-guide-progress-v1');localStorage.setItem('cryo-legends-progress','[0,2,99,"1"]')});
 await page.reload();
 await page.locator('[data-guide="legends-core"]').first().click();
 await expect(page.locator('#learningStatus')).toHaveText('2 / 3 steps complete');
 await page.keyboard.press('Escape');
 await page.locator('[data-guide="go-battle"]').first().click();
 await page.locator('[data-progress-step="1"]').check();
 const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('cryo-guide-progress-v1')));
 expect(stored.version).toBe(1);
 expect(stored.guides['legends-core']).toEqual([0,2]);
 expect(stored.guides['go-battle']).toEqual([1]);
 await page.evaluate(()=>localStorage.setItem('cryo-legends-progress','[1]'));
 await page.reload();
 await page.locator('[data-guide="legends-core"]').first().click();
 await expect(page.locator('[data-progress-step="0"]')).toBeChecked();
 await expect(page.locator('[data-progress-step="1"]')).not.toBeChecked();
});
test('versioned progress ignores invalid entries and resets only the selected guide',async({page})=>{
 await page.goto('/?lang=fr');
 await page.evaluate(()=>localStorage.setItem('cryo-guide-progress-v1',JSON.stringify({version:1,guides:{'pocket-first':[0,0,-1,3,'1'],'live-deck':[2,9],unknown:[0]}})));
 await page.reload();
 await page.locator('[data-guide="pocket-first"]').first().click();
 await expect(page.locator('#learningStatus')).toHaveText('1 / 3 étapes terminées');
 await page.locator('[data-action="reset-learning"]').click();
 await page.keyboard.press('Escape');
 await page.locator('[data-guide="live-deck"]').first().click();
 await expect(page.locator('#learningStatus')).toHaveText('1 / 3 étapes terminées');
 await expect(page.locator('[data-progress-step="2"]')).toBeChecked();
 const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('cryo-guide-progress-v1')));
 expect(stored.guides['pocket-first']).toEqual([]);
 expect(stored.guides['live-deck']).toEqual([2]);
 expect(stored.guides.unknown).toBeUndefined();
});
test('browser storage failures are shown without false persistence claims',async({page})=>{
 await page.addInitScript(()=>{
  const write=Storage.prototype.setItem;
  Storage.prototype.setItem=function(key,value){
   if(key==='cryo-guide-progress-v1')throw new DOMException('Blocked','QuotaExceededError');
   return write.call(this,key,value);
  };
 });
 await page.goto('/?lang=en');
 await page.locator('[data-guide="pocket-collection"]').first().click();
 await page.locator('[data-progress-step="0"]').check();
 await expect(page.locator('#learningStatus')).toHaveText('1 / 3 steps complete');
 await expect(page.locator('.learning-note')).toContainText('unavailable');
 await page.reload();
 await page.locator('[data-guide="pocket-collection"]').first().click();
 await expect(page.locator('#learningStatus')).toHaveText('0 / 3 steps complete');
});

test('Legends Strategy Lab creates 3 battle and 3 bench members with role switching',async({page})=>{
 await page.goto('/?lang=en');
 for(const id of ['goku','vegeta','frieza','broly']) await page.locator(`[data-add="${id}"]`).click();
 await expect(page.locator('[data-team-group="battle"] .team-slot.filled')).toHaveCount(3);
 await expect(page.locator('[data-team-group="bench"] .team-slot.filled')).toHaveCount(1);
 await expect(page.locator('[data-team-move="broly"]')).toBeDisabled();
 await page.locator('[data-remove="frieza"]').click();
 await page.locator('[data-team-move="broly"]').click();
 await expect(page.locator('[data-team-group="battle"] .team-slot.filled')).toHaveCount(3);
 await expect(page.locator('[data-team-group="bench"] .team-slot.filled')).toHaveCount(0);
 for(const id of ['cell','android17','frieza']) await page.locator(`[data-add="${id}"]`).click();
 await expect(page.locator('[data-team-group="bench"] .team-slot.filled')).toHaveCount(3);
 await page.reload();
 await expect(page.locator('[data-team-group="battle"] .team-slot.filled')).toHaveCount(3);
 await expect(page.locator('[data-team-group="bench"] .team-slot.filled')).toHaveCount(3);
 const roleList=await page.evaluate(()=>JSON.parse(localStorage.getItem('cryo-plans')).db.map(e=>e.role));
 expect(roleList.filter(r=>r==='battle')).toHaveLength(3);
 expect(roleList.filter(r=>r==='bench')).toHaveLength(3);
});
test('Legends local notes are escaped, persisted, exported and cleared',async({page})=>{
 await page.goto('/?lang=de');
 await page.locator('[data-add="goku"]').click();
 await page.locator('[data-legends-note="tag"]').fill('<img src=x onerror=alert(1)>');
 await page.locator('[data-legends-note="zAbility"]').fill('Synthetischer Teamhinweis, nicht validiert');
 await page.reload();
 await expect(page.locator('[data-legends-note="tag"]')).toHaveValue('<img src=x onerror=alert(1)>');
 await expect(page.locator('[data-legends-note="zAbility"]')).toHaveValue('Synthetischer Teamhinweis, nicht validiert');
 await expect(page.locator('img[src="x"]')).toHaveCount(0);
 const event=page.waitForEvent('download');
 await page.locator('[data-action="export"]').click();
 const download=await event;
 expect(download.suggestedFilename()).toBe('cryogamehelp-db-de.txt');
 const {readFile}=await import('node:fs/promises');
 const data=await readFile(await download.path(),'utf8');
 expect(data).toContain('Kampfkern');
 expect(data).toContain('Synthetischer Teamhinweis');
 await page.locator('[data-action="reset"]').click();
 await expect(page.locator('[data-legends-note="tag"]')).toHaveValue('');
 await expect(page.locator('[data-legends-note="zAbility"]')).toHaveValue('');
 await expect(page.locator('[data-team-group="battle"] .team-slot.filled')).toHaveCount(0);
});
test('legacy six-slot team order migrates to 3 battle and bench without data loss',async({page})=>{
 await page.goto('/?lang=en');
 await page.evaluate(()=>localStorage.setItem('cryo-plans',JSON.stringify({db:[
  {id:'goku',name:'Super Saiyan Goku',type:'unit',qty:1},
  {id:'vegeta',name:'Super Saiyan Vegeta',type:'unit',qty:1},
  {id:'frieza',name:'Frieza',type:'unit',qty:1},
  {id:'broly',name:'Broly',type:'unit',qty:1}
 ]})));
 await page.reload();
 await expect(page.locator('[data-team-group="battle"] .team-slot.filled')).toHaveCount(3);
 await expect(page.locator('[data-team-group="bench"] .team-slot.filled')).toHaveCount(1);
 await expect(page.locator('[data-team-group="bench"]')).toContainText('Broly');
});

test('Pocket deck JSON roundtrip exports and imports with safe counts',async({page})=>{
 await page.goto('/?lang=en');
 await page.locator('[data-builder="pocket"]').click();
 await page.locator('[data-add="pikachu-ex"]').click();
 await page.locator('[data-add="pikachu-ex"]').click();
 await page.locator('[data-add="potion"]').click();
 await expect(page.locator('.deck-breakdown')).toContainText('Pokémon: 2');
 await expect(page.locator('.deck-breakdown')).toContainText('Trainer: 1');
 const dl=page.waitForEvent('download');
 await page.locator('[data-action="export-deck-json"]').click();
 const file=await dl;
 expect(file.suggestedFilename()).toBe('cryogamehelp-pocket-deck.json');
 const {readFile}=await import('node:fs/promises');
 const exported=JSON.parse(await readFile(await file.path(),'utf8'));
 expect(exported).toMatchObject({format:'cryogamehelp-deck',version:1,game:'pocket'});
 expect(exported.entries).toHaveLength(2);
 await page.locator('[data-action="reset"]').click();
 await expect(page.locator('.deck-entry')).toHaveCount(0);
 await page.locator('#deckFileInput').setInputFiles({name:'pocket.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(exported))});
 await expect(page.locator('.deck-entry')).toHaveCount(2);
 await expect(page.locator('#planSummary')).toContainText('3');
 await page.reload();
 await expect(page.locator('.deck-entry')).toHaveCount(2);
});

test('Deck JSON import rejects incompatible games and invalid or oversized inputs',async({page})=>{
 await page.goto('/?lang=en');
 await page.locator('[data-builder="pocket"]').click();
 const load=async data=>page.locator('#deckFileInput').setInputFiles({name:'input.json',mimeType:'application/json',buffer:Buffer.from(typeof data==='string'?data:JSON.stringify(data))});
 const base={format:'cryogamehelp-deck',version:1,game:'pocket'};
 await load({...base,entries:[{id:'potion',name:'Potion',type:'trainer',qty:3}]});
 await expect(page.locator('.deck-entry')).toHaveCount(0);
 await expect(page.locator('#toast')).toContainText('rejected');
 await load({...base,entries:[{id:'pikachu-ex',name:'Pikachu ex',type:'pokemon',qty:1},{id:'pikachu-ex',name:'Other',type:'pokemon',qty:1}]});
 await expect(page.locator('.deck-entry')).toHaveCount(0);
 await load({...base,game:'live',entries:[]});
 await expect(page.locator('.deck-entry')).toHaveCount(0);
 await load('not-json');
 await expect(page.locator('.deck-entry')).toHaveCount(0);
 await load(' '.repeat(65537));
 await expect(page.locator('.deck-entry')).toHaveCount(0);
});

test('Live deck JSON supports basic Energy while escaping custom names',async({page})=>{
 await page.goto('/?lang=en');
 await page.locator('[data-builder="live"]').click();
 const payload={format:'cryogamehelp-deck',version:1,game:'live',entries:[
  {id:'fire-energy',name:'Basic Fire Energy',type:'energy',qty:40},
  {id:'custom-malicious',name:'<img src=x onerror=alert(1)>',type:'trainer',qty:1}
 ]};
 await page.locator('#deckFileInput').setInputFiles({name:'live.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(payload))});
 await expect(page.locator('.deck-entry')).toHaveCount(2);
 await expect(page.locator('.deck-breakdown')).toContainText('40');
 await expect(page.locator('.deck-entry-name').last()).toContainText('<img src=x');
 await expect(page.locator('img[src="x"]')).toHaveCount(0);
});
