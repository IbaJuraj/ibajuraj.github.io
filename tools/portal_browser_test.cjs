const {chromium}=require("playwright");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root="http://127.0.0.1:8765";
const screenshots="portal-preview";
const routes=["/","/apps/strazca-terminov/","/apps/lexdrive/","/apps/jurajcalc/","/apps/penazenka-kariet/","/news.html","/support.html","/privacy.html","/404.html","/invite.html","/card/"];
(async()=>{
 const browser=await chromium.launch({headless:true});
 fs.mkdirSync(screenshots,{recursive:true});
 try{
 for(const width of [320,390,768,1440]){
   for(const scheme of ["light","dark"]){
     const ctx=await browser.newContext({viewport:{width,height:844},colorScheme:scheme});
     await ctx.route("**/*",route=>route.request().url().startsWith(root)?route.continue():route.abort());
     const page=await ctx.newPage();
     for(const route of routes){
       await page.goto(root+route,{waitUntil:"domcontentloaded"});
       await page.waitForTimeout(120);
       const bounds=await page.evaluate(()=>({w:innerWidth,scroll:document.documentElement.scrollWidth}));
       assert(bounds.scroll<=bounds.w+2,"Horizontal overflow "+route+" "+width+" "+scheme+" "+JSON.stringify(bounds));
       if(width===390 && ["/","/apps/strazca-terminov/","/privacy.html","/support.html"].includes(route)){
         await page.screenshot({path:path.join(screenshots,(route.replaceAll("/","-").replaceAll(".","-")||"home")+"-"+scheme+".png")});
       }
       if(route==="/")assert.equal(await page.locator("[data-gallery]").count(),0);
       if(route.startsWith("/apps/")){
         await page.locator(".app-gallery").waitFor({state:"visible"});
         const image=page.locator(".app-gallery img").first();
         assert((await image.boundingBox()).width<=190,"Oversized screenshot");
         await page.locator(".portal-detail summary").first().click();
         assert(await page.locator(".portal-detail").first().evaluate(n=>n.open));
       }
     }
     await ctx.close();
   }
 }
 const ctx=await browser.newContext({viewport:{width:390,height:844}});
 await ctx.route("**/*",route=>route.request().url().startsWith(root)?route.continue():route.abort());
 const page=await ctx.newPage();
 for(const lang of ["sk","cs","en","de","pl","hu"]){
   await page.goto(root+"/apps/lexdrive/?lang="+lang);
   await page.waitForFunction(l=>document.documentElement.lang===l,lang);
   await page.locator("#site-language").waitFor({state:"attached"});
   assert.equal(await page.locator("#site-language").inputValue(),lang);
 }
 await page.goto(root+"/index.html?app=strazca-terminov&type=technical#support");
 assert(await page.locator("#legacy-support-form").evaluate(n=>n.open));
 assert.equal(await page.locator("#app").inputValue(),"Strážca Termínov");
 await page.goto(root+"/support.html?app=lexdrive&type=suggestion#support");
 assert.equal(await page.locator("#app").inputValue(),"Lex Drive");
 assert.equal(await page.locator("#message-type").inputValue(),"Návrh na zlepšenie");
 // Mock public cache: text must remain text, not executable markup.
 await ctx.route("**/assets/appstore/catalog.json",r=>r.fulfill({json:{schemaVersion:1,apps:{"lexdrive":{id:6794546464,name:"Lex Drive",locales:{sk:{version:"9.9.9",date:"2026-11-01T00:00:00Z",notes:"<script>NOT EXECUTED</script>",description:"Demo",minOS:"26.0",images:[],history:[{version:"9.9.9",date:"2026-11-01T00:00:00Z",notes:"Demo"}]}}}}}}));
 await page.goto(root+"/apps/lexdrive/?lang=sk");
 await page.waitForFunction(()=>document.querySelector("[data-version]").textContent.includes("9.9.9"));
 assert.equal(await page.locator("[data-release-notes]").textContent(),"<script>NOT EXECUTED</script>");
 assert.equal(await page.locator("[data-release-notes] script").count(),0);
 await ctx.close();
 console.log("Portal browser checks passed");
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
