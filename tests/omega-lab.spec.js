import {test,expect} from '@playwright/test';

test('main site links to the optional Omega Lab',async({page})=>{
 await page.goto('/?lang=de');
 await expect(page.locator('a[href="omega-lab.html"]')).toHaveCount(1);
 await page.goto('/omega-lab.html');
 await expect(page.locator('h1')).toContainText('Deine Strategie');
 await expect(page.locator('[data-game]')).toHaveCount(4);
});

test('four profiles are isolated and persist after reload',async({page})=>{
 await page.goto('/omega-lab.html');
 await page.locator('#entryName').fill('Vegeta');
 await page.locator('#addForm button[type="submit"]').click();
 await expect(page.locator('#countLabel')).toHaveText('1 / 6');
 await page.locator('[data-game="pocket"]').click();
 await expect(page.locator('#countLabel')).toHaveText('0 / 20');
 await page.locator('#entryName').fill('Pikachu ex');
 await page.locator('#entryQty').fill('2');
 await page.locator('#addForm button[type="submit"]').click();
 await expect(page.locator('#countLabel')).toHaveText('2 / 20');
 await page.reload();
 await page.locator('[data-game="pocket"]').click();
 await expect(page.locator('#countLabel')).toHaveText('2 / 20');
 await page.locator('[data-game="db"]').click();
 await expect(page.locator('#entries')).toContainText('Vegeta');
});

test('copy limits and user name escaping work',async({page})=>{
 await page.goto('/omega-lab.html');
 await page.locator('[data-game="pocket"]').click();
 await page.locator('#entryName').fill('Pikachu ex');
 await page.locator('#entryQty').fill('2');
 await page.locator('#addForm button[type="submit"]').click();
 await page.locator('#entryName').fill('Pikachu ex');
 await page.locator('#entryQty').fill('1');
 await page.locator('#addForm button[type="submit"]').click();
 await expect(page.locator('#countLabel')).toHaveText('2 / 20');
 await expect(page.locator('#feedback')).toContainText('überschreitet');
 await page.locator('#entryName').fill('<img src=x onerror=alert(1)>');
 await page.locator('#addForm button[type="submit"]').click();
 await expect(page.locator('#entries')).toContainText('<img src=x onerror=alert(1)>');
 await expect(page.locator('#entries img[src="x"]')).toHaveCount(0);
});

test('JSON export reports explicitly unverified evidence',async({page})=>{
 await page.goto('/omega-lab.html');
 await page.locator('#entryName').fill('Goku');
 await page.locator('#addForm button[type="submit"]').click();
 const promise=page.waitForEvent('download');
 await page.locator('#exportBtn').click();
 const downloaded=await promise;
 expect(downloaded.suggestedFilename()).toBe('cryogamehelp-omega-db.json');
 const {readFile}=await import('node:fs/promises');
 const parsed=JSON.parse(await readFile(await downloaded.path(),'utf8'));
 expect(parsed).toMatchObject({schemaVersion:1,game:'db',source:'local-user-draft',verifiedMeta:false,verifiedLegality:false});
 expect(parsed.entries).toMatchObject([{name:'Goku',role:'core',qty:1}]);
});

test('keyboard tabs and 320px width are operable',async({page})=>{
 await page.setViewportSize({width:320,height:750});
 await page.goto('/omega-lab.html');
 await page.locator('[data-game="db"]').focus();
 await page.keyboard.press('ArrowRight');
 await expect(page.locator('[data-game="pocket"]')).toHaveAttribute('aria-selected','true');
 await expect(page.locator('[data-game="pocket"]')).toBeFocused();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test('corrupt stored entries are bounded',async({page})=>{
 await page.addInitScript(()=>{
  const invalid={db:[{name:'<img src=x onerror=alert(1)>',role:'core',qty:999},{name:'ok',role:'bench',qty:1}],pocket:[{name:'Fake',role:'pokemon',qty:999}]};
  localStorage.setItem('cryogamehelp-omega-lab-v1',JSON.stringify(invalid));
 });
 await page.goto('/omega-lab.html');
 await expect(page.locator('#countLabel')).toHaveText('1 / 6');
 await expect(page.locator('#entries img[src="x"]')).toHaveCount(0);
 await page.locator('[data-game="pocket"]').click();
 await expect(page.locator('#countLabel')).toHaveText('2 / 20');
});
