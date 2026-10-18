import {test,expect} from '@playwright/test';

const fileUrl=new URL('../../index.html',import.meta.url).href;
const mainUrl=process.env.BROWSER_APP_URL || `http://127.0.0.1:${process.env.PLAYWRIGHT_PORT || '8765'}/index.html`;
const KEY='elternzeit-familienplan-v3';
function denyMethod(method){
 // init script arguments serialize as data, not as a generated or trusted page script.
 return {method};
}
test('V3.19 file:// boot and save denial never present a checked but unsaved state',async({page})=>{
 const errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 await page.addInitScript(({method})=>{
  Object.defineProperty(Storage.prototype,method,{configurable:true,
   value(){throw new DOMException('Storage denied','SecurityError')}
  });
 },denyMethod('setItem'));
 await page.goto(fileUrl);
 await expect(page.locator('#sectionNav button').first()).toBeVisible();
 await page.locator('#localSave').click(); // A denied save deliberately unchecks it again.
 await expect(page.locator('#localSave')).not.toBeChecked();
 await expect(page.locator('#privacyStorageStatus')).toHaveAttribute('data-storage-status','error');
 await expect(page.locator('#privacyStorageStatus')).toContainText('Speichern ist blockiert');
 expect(await page.evaluate(()=>window.__elternzeitTest.getState().storageConsent)).toBe(false);
 await page.context().setOffline(true);
 await page.reload();
 await expect(page.locator('#sectionNav button').first()).toBeVisible();
 await expect(page.locator('#localSave')).not.toBeChecked();
 expect(errors).toEqual([]);
});
test('V3.19 denied deletion keeps warning visible on mobile and reset clears working memory',async({page})=>{
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 page.on('dialog',d=>d.accept());
 await page.setViewportSize({width:390,height:844});
 await page.goto(mainUrl);
 await page.locator('#v39PrivacyToggle').click();
 const baseline=await page.evaluate(()=>window.__elternzeitTest.getState().netFather);
 await page.evaluate(key=>{localStorage.setItem(key,'old-stored-copy');window.__elternzeitTest.changeValue('netFather',3037);},KEY);
 await page.evaluate(()=>{
  Object.defineProperty(Storage.prototype,'removeItem',{configurable:true,value(){throw new DOMException('Denied','SecurityError');}});
 });
 await page.locator('#deleteLocal').click();
 await expect(page.locator('#privacyStorageStatus')).toBeVisible();
 await expect(page.locator('#privacyStorageStatus')).toContainText('NICHT bestätigt');
 expect(await page.evaluate(key=>localStorage.getItem(key),KEY)).toBe('old-stored-copy');
 await page.locator('#v39MobileMenu').click();
 await page.locator('#btnReset').click();
 expect(await page.evaluate(()=>window.__elternzeitTest.getState().netFather)).toBe(baseline);
 await expect(page.locator('#privacyStorageStatus')).toContainText('NICHT bestätigt');
 await expect(page.locator('#localSave')).not.toBeChecked();
 expect(errors).toEqual([]);
});
test('V3.19 import under blocked deletion remains local, warns about uncleared browser copies',async({page})=>{
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto(mainUrl);
 const plan=await page.evaluate(()=>window.__elternzeitTest.getState());
 plan.netFather=2731;
 await page.evaluate(key=>localStorage.setItem(key,'previous-private-copy'),KEY);
 await page.evaluate(()=>{
  Object.defineProperty(Storage.prototype,'removeItem',{configurable:true,value(){throw new DOMException('Denied','SecurityError');}});
 });
 await page.locator('#importJson').setInputFiles({
  name:'synthetic-local-plan.json',mimeType:'application/json',
  buffer:Buffer.from(JSON.stringify({fileType:'elternzeit-offline-v3',schemaVersion:1,data:plan}))
 });
 await expect(page.locator('#privacyStorageStatus')).toContainText('NICHT bestätigt');
 expect(await page.evaluate(key=>localStorage.getItem(key),KEY)).toBe('previous-private-copy');
 expect(await page.evaluate(()=>window.__elternzeitTest.getState().netFather)).toBe(2731);
 expect(await page.evaluate(()=>window.__elternzeitTest.getState().storageConsent)).toBe(false);
 expect(errors).toEqual([]);
});
test('V3.19 refused storage reads keep the offline application usable and display a persistent warning',async({page})=>{
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.addInitScript(()=>{
  Object.defineProperty(Storage.prototype,'getItem',{configurable:true,
   value(){throw new DOMException('Storage blocked by browser','SecurityError')}
  });
 });
 await page.setViewportSize({width:320,height:720});
 await page.goto(fileUrl);
 await expect(page.locator('#v38Advanced')).toBeVisible();
 await page.locator('#v38Advanced').click();
 await expect(page.locator('#sectionNav button').first()).toBeVisible();
 await expect(page.locator('#privacyStorageStatus')).toBeVisible();
 await expect(page.locator('#privacyStorageStatus')).toContainText('nicht sicher gelesen');
 await expect(page.locator('#privacyStorageStatus')).toHaveAttribute('data-storage-status','error');
 await expect(page.locator('#localSave')).not.toBeChecked();
 expect(await page.evaluate(()=>window.__elternzeitTest.getState().storageConsent)).toBe(false);
 expect(errors).toEqual([]);
});
