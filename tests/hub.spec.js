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
