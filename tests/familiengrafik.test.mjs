import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';

test('Familienillustration ist in der einzelnen Informationsseite eingebettet und offline verfügbar',()=>{
 const html=readFileSync(new URL('../start.html',import.meta.url),'utf8');
 const {document}=new JSDOM(html).window;
 const image=document.querySelector('.hero-art img');
 assert.ok(image);
 assert.equal(image.getAttribute('alt'),'');
 assert.match(image.getAttribute('src'),/^data:image\/webp;base64,/);
 const asset=readFileSync(new URL('../assets/familienstart-garten.webp',import.meta.url));
 assert.deepEqual(Buffer.from(image.getAttribute('src').split(',')[1],'base64'),asset);
 assert.equal(document.querySelectorAll('img[src^="https:"]').length,0);
});

test('Rechnerillustration ist dekorativ, offline und mit der Quelldatei synchron',()=>{
 const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
 const {document}=new JSDOM(html).window;
 const image=document.querySelector('#v38QuickStart img.v38-selection-art');
 assert.ok(image);assert.equal(image.getAttribute('alt'),'');
 assert.equal(image.getAttribute('aria-hidden'),'true');
 assert.match(image.getAttribute('src'),/^data:image\/webp;base64,/);
 const asset=readFileSync(new URL('../assets/familienplan-notizbuch.webp',import.meta.url));
 assert.deepEqual(Buffer.from(image.getAttribute('src').split(',')[1],'base64'),asset);
});
