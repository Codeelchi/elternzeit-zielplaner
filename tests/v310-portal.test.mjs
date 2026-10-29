import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';

const source=readFileSync(new URL('../start.html',import.meta.url),'utf8');
function portal(scripts=true){return new JSDOM(source,{url:'file:///offline/start.html',...(scripts?{runScripts:'dangerously'}:{})});}

test('V3.10 Infostartseite bietet lokale Rechnerpfade und semantische Orientierung',()=>{
 const {document}=portal().window;
 assert.equal(document.documentElement.lang,'de');
 assert.equal(document.querySelectorAll('h1').length,1);
 assert.equal(document.querySelector('a.skip').getAttribute('href'),'#inhalt');
 assert.ok(document.querySelector('main#inhalt'));
 assert.ok([...document.querySelectorAll('a[href="index.html"]')].length>=3);
 for(const a of document.querySelectorAll('a[href^="#"]'))assert.ok(document.getElementById(a.hash.slice(1)),`Sprungziel ${a.hash}`);
 assert.equal(document.querySelectorAll('#fragen details').length,5);
 for(const detail of document.querySelectorAll('details'))assert.equal(detail.firstElementChild.tagName,'SUMMARY');
});

test('Phasenfilter grenzt Tipps verständlich ein und setzt Auswahl zurück',()=>{
 const {document}=portal().window;
 const group=document.getElementById('phase-filter');
 assert.equal(group.hidden,false);
 for(const phase of ['pregnancy','planning','newborn']){
  group.querySelector(`[data-phase="${phase}"]`).click();
  const visible=[...document.querySelectorAll('[data-tip-phase]')].filter(x=>!x.hidden);
  assert.equal(visible.length,2);
  assert.ok(visible.every(x=>x.dataset.tipPhase===phase));
  assert.equal(group.querySelectorAll('[aria-pressed="true"]').length,1);
  assert.match(document.getElementById('filter-result').textContent,/2 hilfreiche Tipps/);
 }
 group.querySelector('[data-phase="all"]').click();
 assert.equal(document.querySelectorAll('[data-tip-phase]:not([hidden])').length,6);
 assert.match(document.getElementById('filter-result').textContent,/Alle Themen: 6/);
});

test('Ohne JavaScript sind alle Tipps und Rechnerangebote zugänglich',()=>{
 const {document}=portal(false).window;
 assert.equal(document.querySelectorAll('[data-tip-phase]:not([hidden])').length,6);
 assert.equal(document.getElementById('phase-filter').hidden,true);
 assert.match(source,/\.filters\[hidden\]\{display:none\}/);
 assert.ok(document.querySelector('#rechner a[href="index.html"]'));
});

test('Infoportal lädt keine fremden Ressourcen und sammelt keine Formulardaten',()=>{
 const {document}=portal().window;
 assert.equal(document.querySelectorAll('script[src],link[rel="stylesheet"],iframe,form,input,textarea').length,0);
 for(const image of document.querySelectorAll('img[src]'))assert.match(image.getAttribute('src'),/^data:image\/(?:webp|png|jpeg);base64,/);
 assert.doesNotMatch(source,/\b(?:fetch|XMLHttpRequest|localStorage|sessionStorage|sendBeacon)\b/);
 assert.doesNotMatch(source,/url\s*\(/i);
 const authorities=new Set(['www.familienplanung.de','www.gesund-ins-leben.de','familienportal.de','www.elternsein.info','www.kindergesundheit-info.de','www.familienportal.nrw','www.stadt-koeln.de','www.hilfetelefon-schwangere.de']);
 for(const a of document.querySelectorAll('a[href^="https:"]')){
  assert.ok(authorities.has(new URL(a.href).hostname),`Primärquelle ${a.href}`);
  assert.equal(a.target,'_blank');
  assert.ok(a.relList.contains('noopener'));
  assert.ok(a.relList.contains('noreferrer'));
 }
 assert.equal(document.querySelector('a[href="tel:08004040020"]').textContent,'0800 40 40 020');
 assert.ok(document.querySelector('a[href="tel:112"]'));
});

test('Redaktion nennt datierte Quellen, Grenzen und ausstehende Freigaben',()=>{
 const {document}=portal().window;
 assert.equal(document.querySelector('time').dateTime,'2026-10-16');
 const text=document.body.textContent;
 assert.match(text,/kein amtlicher Bescheid/);
 assert.match(text,/Unabhängige|unabhängige/);
 assert.match(text,/Nutzertests/);
 assert.match(text,/Impressum/);
 assert.match(text,/keine Analyse- oder Werbedienste/);
 assert.match(text,/Auszahlungsnetto und das für Elterngeld maßgebliche Netto/);
});
