import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const axes=require('../src/time-axes.cjs');
const a=JSON.parse(readFileSync(new URL('../data/maternity-delta-evidence-2026-10-17.json',import.meta.url),'utf8'));
if(a.reviewState!=='UNRESOLVED_OFFICIAL_DISCREPANCY'||a.entitlementDecisionAllowed!==false||a.externalAuthorityReply!==null)
 throw Error('Mutterschutz-Delta ohne unabhängigen Bescheid nicht freigebbar.');
const lm=axes.lifeMonths(a.birthDate,a.lifeMonth)[a.lifeMonth-1];
const postnatal=axes.maternityTimeline({birthDate:a.birthDate,expectedDueDate:a.expectedBirthDate,postnatalDays:a.daysAfterBirth}).postnatal;
const covered=axes.daysOverlapInclusive(lm.startDate,lm.endDate,postnatal.startDate,postnatal.endDate);
const localUncovered=lm.days-covered;
if(localUncovered!==4||a.officialFederalExample.uncoveredDays!==5||
 a.independentAdministrativeCalendarExplanation.uncoveredDays!==4||
 postnatal.endDate!==a.independentAdministrativeCalendarExplanation.lastProtectionDate||
 a.officialFederalExample.lastMaternityBenefitDate===postnatal.endDate)
 throw Error('Mutterschutz-Konflikt wurde im Test unerlaubt überschrieben.');
console.log('Mutterschutz-LM2:',lm.days,'Tage; Modell:',localUncovered,'unbedeckte; Bundesportal:',a.officialFederalExample.uncoveredDays,'unbedeckte; ABWEICHUNG OFFEN.');
