'use strict';
/** Documentary checks for historical judicial Elterngeld cases.
 * NOT a reproduction of administrative decisions or a current-law award engine.
 */
const allowedStages=new Set([
 'administrative_original_notice','administrative_trial_recalculation_not_final_award',
 'administrative_final_notice','administrative_amended_notice','administrative_earnings_calculation'
]);
const near=(a,b)=>Math.abs(a-b)<0.011;
const cents=n=>Math.round((n+Number.EPSILON)*100)/100;
function inspectCase(record,{targetBirthYear=2027}={}){
 if(!record||!record.id||!/^https:\/\//.test(record.source_url)||!/^\d{4}-\d{2}-\d{2}$/.test(record.decision_date)||
    !Number.isInteger(record.historical_birth_year)||!Array.isArray(record.observations)||record.observations.length===0)throw new TypeError('Historischer Fall ohne nachweisbaren Ursprung');
 const ids=new Set();
 for(const o of record.observations){
   if(!o.id||ids.has(o.id)||!allowedStages.has(o.stage)||typeof o.eur_per_month!=='number'||!Number.isFinite(o.eur_per_month)||o.eur_per_month<0)
    throw new TypeError('Fehlerhafte Beobachtung oder nicht benannter Verfahrensstand');
   ids.add(o.id);
 }
 if(record.fully_reconstructable===true&&record.missing_inputs?.length)throw new TypeError('Vollständige Nachrechnung trotz fehlender Eingaben behauptet');
 const money=Object.fromEntries(record.observations.map(x=>[x.id,x.eur_per_month]));
 const checks=[];
 const check=(id,actual,expected,note)=>checks.push({id,actual:cents(actual),expected:cents(expected),matches:near(actual,expected),note});
 if(record.id==='SG-BERLIN-S2EG5-24'){
   check('original_plus_half_of_basis',money.original_basis/2,money.original_plus,'hälftiges Plus vor Erwerbsaufnahme');
   check('trial_plus_half_of_basis',money.trial_basis/2,money.trial_plus,'Gerichtliche Probeberechnung, keine endgültige Bewilligung');
   const delta=2*(money.trial_basis-money.original_basis)+(money.trial_plus-money.original_plus)+5*(money.trial_parttime_plus-money.original_parttime_plus);
   check('trial_additional_total',delta,record.published_additional_benefit_eur,'bescheidübergreifende Differenz aus publizierten Monaten');
   if(record.case_status==='first_instance_appealed'&&!record.appeal_docket)throw Error('Offene Berufung verschwiegen');
 }
 if(record.id==='LSG-BW-L11EG1334-21'){
   check('original_early_above_final',money.first_award_early>money.recalculated_early?1:0,1,'Rückforderung begründet keine neue Elterngeldquote');
   check('original_later_above_final',money.first_award_later>money.recalculated_later?1:0,1,'getrennte Bescheidstufen vergleichen');
   check('published_income_mean_nonnegative',record.recalculation_postbirth_average_eur>=0?1:0,1,'1.826,05 Euro tatsächlicher Berechnungsmittelwert');
   if(!record.inconsistency_note?.includes('688.72'))throw Error('Textwiderspruch 688,72 Euro muss dokumentiert bleiben');
 }
 if(record.id==='BSG-B10EG1-20R'){
   check('lm1_maternity_offset',money.lm1,0,'bezahlter LM1 nach Mutterleistungen');
   check('lm2_limited',money.lm2<money.lm3_12?1:0,1,'kein Schluss auf 2027er Mutterschutz-Fristen');
 }
 if(record.id==='LSG-BY-L9EG36-18'){
   check('gross_exceeds_net',money.baseline_gross>money.baseline_net?1:0,1,'amtlich berichtete Bemessungsgrößen, noch keine Leistungshöhe');
   check('historical_rate',record.historical_rate,0.65,'historischer Faktor ist ohne Netto-Bemessung keine Bewilligungsrechnung');
 }
 return {
   case_id:record.id,source_url:record.source_url,case_status:record.case_status,
   documentary_checks:checks,
   documentary_pass:checks.length>0&&checks.every(x=>x.matches),
   supported_replay:record.historical_birth_year===targetBirthYear&&record.fully_reconstructable===true&&
     (!record.missing_inputs||record.missing_inputs.length===0),
   replay_note:'Keine vollständige Nachrechnung aus BEEG-Netto/Steuer- und Bemessungsmerkmalen; auf historische Rechtskohorte begrenzt',
   missing_inputs:record.missing_inputs??[]
 };
}
function inspectCatalogue(catalogue,opts){
 if(!catalogue||!Array.isArray(catalogue.cases)||catalogue.cases.length<1)throw TypeError('Historischer Katalog leer');
 const ids=new Set();
 const cases=catalogue.cases.map(c=>{if(ids.has(c.id))throw Error('Doppelte Fall-ID');ids.add(c.id);return inspectCase(c,opts);});
 return {as_of:catalogue.collected_at,cases,documentary_pass:cases.every(x=>x.documentary_pass),
   complete_current_law_replays:cases.filter(x=>x.supported_replay).length,
   warning:'Bestehende Bescheidbeträge sind historische Dokumentbelege; kein amtlich vollständiger 2027er Leistungstest.'};
}
module.exports={inspectCase,inspectCatalogue};
