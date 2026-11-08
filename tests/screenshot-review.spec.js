import {test,expect} from '@playwright/test';
test('review link, consent gate and no AI claim',async({page})=>{
 await page.goto('/?lang=de');
 await expect(page.locator('a[href="screenshot-review.html"]')).toHaveCount(1);
 await page.goto('/screenshot-review.html');
 await expect(page.locator('h1')).toContainText('Prüfe den Screenshot');
 await expect(page.locator('body')).toContainText('Kein KI-Modell verbunden');
 await expect(page.locator('#imageInput')).toBeDisabled();
 await expect(page.locator('#exportBtn')).toBeDisabled();
});
test('consented local screenshot exports JSON without image bytes',async({page})=>{
 const requests=[];page.on('request',r=>requests.push(r.url()));
 await page.goto('/screenshot-review.html');
 const image=await page.screenshot({type:'png'});
 await page.locator('#consent').check();
 await page.locator('#imageInput').setInputFiles({name:'secret.png',mimeType:'image/png',buffer:image});
 await expect(page.locator('#preview')).toBeVisible();
 await expect(page.locator('#previewImage')).toHaveAttribute('src',/^blob:/);
 await page.locator('#observation').fill('Drei Figuren, selbst gesehen');
 const request=page.waitForEvent('download');
 await page.locator('#exportBtn').click();
 const file=await request;expect(file.suggestedFilename()).toBe('cryogamehelp-screenshot-review-db.json');
 const {readFile}=await import('node:fs/promises');
 const json=await readFile(await file.path(),'utf8');
 const report=JSON.parse(json);
 expect(report).toMatchObject({schemaVersion:1,source:'local-user-annotation',screenshot:{embedded:false,uploaded:false},evidence:{modelUsed:null,aiInferencePerformed:false,metaVerified:false}});
 expect(json).not.toContain('secret.png');
 expect(json).not.toContain('data:image/');
 expect(requests.every(u=>u.startsWith('http://127.0.0.1:4173/'))).toBe(true);
});
test('invalid image content and SVG are rejected',async({page})=>{
 await page.goto('/screenshot-review.html');await page.locator('#consent').check();
 await page.locator('#imageInput').setInputFiles({name:'bad.png',mimeType:'image/png',buffer:Buffer.from('invalid')});
 await expect(page.locator('#feedback')).toContainText('ungültig');
 await page.locator('#imageInput').setInputFiles({name:'bad.svg',mimeType:'image/svg+xml',buffer:Buffer.from('<svg/>')});
 await expect(page.locator('#feedback')).toContainText('abgelehnt');
 await expect(page.locator('#preview')).toBeHidden();await expect(page.locator('#exportBtn')).toBeDisabled();
});
test('consent revoked releases preview and clears inputs',async({page})=>{
 await page.goto('/screenshot-review.html');const image=await page.screenshot({type:'png'});
 await page.locator('#consent').check();
 await page.locator('#imageInput').setInputFiles({name:'local.png',mimeType:'image/png',buffer:image});
 await expect(page.locator('#preview')).toBeVisible();
 await page.locator('#observation').fill('private');
 await page.locator('#consent').uncheck();
 await expect(page.locator('#preview')).toBeHidden();
 await expect(page.locator('#imageInput')).toBeDisabled();
 await expect(page.locator('#observation')).toHaveValue('');
 await page.reload();await expect(page.locator('#consent')).not.toBeChecked();
 expect(await page.evaluate(()=>Object.keys(localStorage).filter(k=>k.includes('screenshot')))).toEqual([]);
});
test('320px keyboard controls have no horizontal overflow',async({page})=>{
 await page.setViewportSize({width:320,height:760});await page.goto('/screenshot-review.html');
 await page.locator('#consent').focus();await page.keyboard.press('Space');
 await expect(page.locator('#imageInput')).toBeEnabled();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
