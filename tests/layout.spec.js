import {test,expect} from '@playwright/test';

for(const width of [320,390,600,768,1024,1280,1440]) {
 test(`layout, readable text, and hero separation at ${width}px`,async({page})=>{
  await page.setViewportSize({width,height:800});
  for(const lang of ['en','de','fr']) {
   await page.goto('/?lang='+lang);
   await page.evaluate(()=>document.fonts.ready);
   const issues=await page.evaluate(()=>{
    const copy=document.querySelector('.hero-copy').getBoundingClientRect(),art=document.querySelector('.hero-art').getBoundingClientRect();
    const overlap=Math.min(copy.right,art.right)>Math.max(copy.left,art.left)+1&&Math.min(copy.bottom,art.bottom)>Math.max(copy.top,art.top)+1;
    const smallText=[...document.querySelectorAll('h1,h2,h3,p,button,input,a,small')].filter(e=>e.getBoundingClientRect().width>0&&e.closest('.sidebar')?.inert!==true&&parseFloat(getComputedStyle(e).fontSize)<12).map(e=>e.className);
    return {overflow:document.documentElement.scrollWidth-innerWidth,background:getComputedStyle(document.documentElement).getPropertyValue('--bg').trim(),overlap,smallText};
   });
   expect(issues,{message:`${lang} at ${width}px`}).toEqual({overflow:0,background:'#0d0e14',overlap:false,smallText:[]});
   await page.locator('[data-guide="live-deck"]').first().click();
   await expect(page.locator('dialog')).toBeVisible();
   const overflow=await page.locator('dialog').evaluate(e=>e.scrollWidth-e.clientWidth);
   expect(overflow).toBeLessThanOrEqual(1);
   await page.locator('dialog').evaluate(e=>e.scrollTop=e.scrollHeight);
   await expect(page.locator('.dialog-close')).toBeInViewport();
   await page.locator('[data-action="close"]').click();
  }
 });
}

test('mobile drawer traps focus, closes, and survives desktop resizing',async({page})=>{
 await page.setViewportSize({width:390,height:600});await page.goto('/?lang=de');
 await page.locator('[data-action="menu"]').click();
 await expect(page.locator('.sidebar-close')).toBeFocused();
 await page.keyboard.press('Shift+Tab');
 await expect(page.locator('.sidebar-bottom a')).toBeFocused();
 await page.keyboard.press('Tab');
 await expect(page.locator('.sidebar-close')).toBeFocused();
 await page.locator('.sidebar-close').click();
 await expect(page.locator('[data-action="menu"]')).toBeFocused();
 await page.locator('[data-action="menu"]').click();
 await page.setViewportSize({width:1440,height:800});
 await expect(page.locator('body')).not.toHaveClass(/menu-open/);
 await expect(page.locator('#sidebar')).toHaveAttribute('aria-hidden','false');
 await expect(page.locator('.main-wrap')).not.toHaveAttribute('inert','');
});

test('200% text enlargement and long custom names reflow without overflow',async({page})=>{
 await page.setViewportSize({width:768,height:700});await page.goto('/?lang=de');
 await page.addStyleTag({content:'html{font-size:200%}'});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.locator('[data-builder="pocket"]').click();
 await page.locator('#customForm input').fill('A'.repeat(80));
 await page.locator('#customForm button').click();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.locator('[data-guide="pocket-first"]').first().click();
 expect(await page.locator('dialog').evaluate(e=>e.scrollWidth<=e.clientWidth+1)).toBe(true);
});
