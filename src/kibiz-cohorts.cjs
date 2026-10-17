'use strict';
const time=require('./time-axes.cjs');
const LAW_2026='https://recht.nrw.de/lrgv/gesetz/01082026-gesetz-zur-fruehen-bildung-und-foerderung-von-kindern-kinderbildungsgesetz/';
const LAW_2027='https://recht.nrw.de/lrgv/gesetz/01082027-gesetz-zur-fruehen-bildung-und-foerderung-von-kindern-kinderbildungsgesetz/';
const COLOGNE='https://www.stadt-koeln.de/leben-in-koeln/familie/betreuung/haeufig-gestellte-fragen-zum-vormerk-anmeldeverfahren-little-bird';
const REVIEWED_AT='2026-10-17';
function minusMonths(iso,count){
 time.lifeMonths(iso,1);
 if(!Number.isInteger(count)||count<0||count>36)throw new RangeError('Monatsabstand ungültig.');
 const [year,month,day]=iso.split('-').map(Number);
 const first=new Date(Date.UTC(year,month-1-count,1));
 const max=new Date(Date.UTC(first.getUTCFullYear(),first.getUTCMonth()+1,0)).getUTCDate();
 first.setUTCDate(Math.min(day,max));
 return first.toISOString().slice(0,10);
}
function childcareLawWindow({birthDate,careStartDate,region='NRW',city='',asOf=REVIEWED_AT}={}){
 time.lifeMonths(birthDate,1);time.lifeMonths(careStartDate,1);time.lifeMonths(asOf,1);
 if(typeof region!=='string'||typeof city!=='string')throw new TypeError('Region/Wohnort müssen Text sein.');
 if(region!=='NRW')return {supported:false,lawStatus:'REGION_NOT_SUPPORTED',noticeDate:null,feeWaiverNotCalculated:true,feesBooked:0,
  warnings:['Das KiBiz NRW wird für dieses Bundesland nicht angewendet. Örtliche Regelung prüfen.']};
 const law=careStartDate>='2027-08-01'?
  {version:'2027-08-01',status:careStartDate>asOf?'PROMULGATED_FUTURE_EFFECTIVE':'EFFECTIVE',source:LAW_2027}:
  careStartDate>='2026-08-01'?
  {version:'2026-08-01',status:'EFFECTIVE',source:LAW_2026}:
  {version:null,status:'EARLIER_VERSION_NOT_REVIEWED',source:LAW_2026};
 const startYear=Number(careStartDate.slice(0,4));
 const turnsFourYear=Number(birthDate.slice(0,4))+4;
 const day= birthDate.slice(5);
 const waiverYear=turnsFourYear+(day>'09-30'?1:0);
 const waiverFirstDay=waiverYear+'-08-01';
 const noticeDate=minusMonths(careStartDate,6);
 const noticeLawVersion=noticeDate>='2027-08-01'?'2027-08-01':noticeDate>='2026-08-01'?'2026-08-01':'older_unreviewed';
 const isCologne=city.toLocaleLowerCase('de-DE').includes('köln');
 const warnings=[
  'KiBiz § 5: Bedarfsanzeige grundsätzlich sechs Kalendermonate vorher. Kurzfristiger Bedarf und örtliche Verfahren gesondert mit dem Jugendamt klären. Keine Platzzusage.',
  '§ 50: Das vorläufig errechnete Kindergartenjahr ersetzt weder eine individuelle Beitragsentscheidung noch die Prüfung von Einschulung, Geschwistern und Essensgeld.',
  'Die veröffentlichte Kölner Tabelle seit 2025 ist keine bestätigte Beitragsfestsetzung für künftige Jahre. Das Haushaltsbudget bleibt manuell.',
  ...(noticeLawVersion==='older_unreviewed'?['Die Sechsmonats-Anmeldefrist liegt vor der hier vertieft geprüften Rechtsfassung; örtliche Verfahrenslage zum damaligen Zeitpunkt prüfen.']:[]),
  ...(law.status==='PROMULGATED_FUTURE_EFFECTIVE'?['Die KiBiz-Fassung ab 01.08.2027 ist verkündet, zum Prüfdatum aber noch nicht in Kraft.']:[]),
  ...(law.version===null?['Betreuungsbeginn vor dem geprüften Fassungskorridor; keine eigene Rechtsgültigkeitsaussage.']:[])
 ];
 return {
  supported:true,region:'NRW',lawStatus:law.status,lawVersion:law.version,lawSource:law.source,reviewedAt:REVIEWED_AT,
  careStartDate,birthDate,noticeDate,noticeLawVersion,localEarlyNoticeDate:isCologne?minusMonths(careStartDate,9):null,
  localProcedureSource:isCologne?COLOGNE:null,
  indicativeFeeWaiverFrom:waiverFirstDay,
  indicativeFeeWaiverReachedAtCareStart:careStartDate>=waiverFirstDay,
  waiverDependsOnSchoolEnrollment:true,waiverIndividuallyConfirmed:false,
  historicalMunicipalFeeVerifiedForCareDate:careStartDate<='2026-10-17'&&careStartDate>='2025-08-01',
  feeWaiverNotCalculated:true,feesBooked:0,assessedAgainstLocalTariff:false,
  displayYear:startYear,warnings
 };
}
module.exports={childcareLawWindow,minusMonths,LAW_2026,LAW_2027,COLOGNE,REVIEWED_AT};
