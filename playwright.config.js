import {defineConfig} from '@playwright/test';
export default defineConfig({
 testDir:'./tests',fullyParallel:true,retries:process.env.CI?1:0,reporter:'list',
 use:{baseURL:'http://127.0.0.1:4173',headless:true},
 webServer:{command:'npm start',url:'http://127.0.0.1:4173',reuseExistingServer:!process.env.CI},
 projects:[{name:'desktop',use:{viewport:{width:1440,height:1000}}},{name:'mobile',use:{viewport:{width:390,height:844},isMobile:true,hasTouch:true}}]
});
