import {test,expect} from '@playwright/test';

test('Legends Strategy Lab keeps mobile role controls accessible at 320px',async({page})=>{
 await page.setViewportSize({width:320,height:720});
 await page.goto('/?lang=de');
 for(const id of ['goku','vegeta','frieza']) await page.locator(`[data-add="${id}"]`).click();
 await expect(page.locator('[data-team-group="battle"] .team-slot.filled')).toHaveCount(3);
 await expect(page.locator('[data-team-group="bench"] .team-slot.empty')).toHaveCount(3);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 const move=page.locator('[data-team-group="battle"] .team-move').first();
 await move.focus();
 await expect(move).toBeFocused();
 await page.keyboard.press('Enter');
 await expect(page.locator('[data-team-group="battle"] .team-slot.filled')).toHaveCount(2);
 await expect(page.locator('[data-team-group="bench"] .team-slot.filled')).toHaveCount(1);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.locator('[data-legends-note="zAbility"]').fill('a'.repeat(240));
 await expect(page.locator('[data-legends-note="zAbility"]')).toHaveValue('a'.repeat(240));
});
