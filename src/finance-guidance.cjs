'use strict';

const VERIFIED_AT='2026-10-17';
const SOURCES=Object.freeze({
 insurance:{label:'Bundesfamilienportal: Krankenversicherung während Elterngeldbezug',url:'https://familienportal.de/familienportal/familienleistungen/elterngeld/faq/wie-bin-ich-krankenversichert-waehrend-ich-elterngeld-bekomme--124738',verifiedAt:VERIFIED_AT},
 leaveInsurance:{label:'Bundesfamilienportal: Versicherung in Elternzeit',url:'https://familienportal.de/familienportal/familienleistungen/elternzeit/arbeit-versicherung/wie-bin-ich-waehrend-der-elternzeit-versichert--124862',verifiedAt:VERIFIED_AT},
 tax:{label:'Bundesfamilienportal: Elterngeld und Progressionsvorbehalt',url:'https://familienportal.de/familienportal/familienleistungen/elterngeld/faq/wie-viel-elterngeld-kann-ich-bekommen--124616',verifiedAt:VERIFIED_AT}
});
const INSURANCE=Object.freeze({
 unknown:{title:'Versicherungsstatus noch nicht angegeben',message:'Bitte Krankenversicherung der Eltern während Mutterschutz, Elternzeit und etwaiger Teilzeit direkt mit der Krankenkasse bzw. privaten Versicherung prüfen. Ohne Beitragsschätzung ist das Familienbudget möglicherweise unvollständig.'},
 mandatory:{title:'Pflichtversichert in der gesetzlichen Krankenkasse',message:'Bei fortbestehender Pflichtmitgliedschaft sind während Elternzeit/Elterngeld häufig keine Krankenversicherungsbeiträge fällig, wenn keine weiteren beitragspflichtigen Einkünfte vorliegen. Teilzeit und Sonderkonstellationen können Beiträge auslösen; Krankenkasse bestätigen lassen.'},
 voluntary:{title:'Freiwillig gesetzlich versichert',message:'Während Elternzeit/Elterngeld sind häufig Beiträge, mindestens jedoch ein Mindestbeitrag fällig. Mögliche Familienversicherung/Befreiungen müssen mit der Krankenkasse geprüft werden. Keine automatische Beitragsfreiheit unterstellen.'},
 private:{title:'Privat krankenversichert',message:'Die private Versicherungsprämie läuft regelmäßig weiter. Ohne Arbeitgeberzuschuss kann der bisher vom Arbeitgeber gezahlte Anteil zusätzlich anfallen. Vertrag und Zusatzbeitrag individuell prüfen.'},
 family:{title:'Beitragsfrei familienversichert',message:'Eine bestehende Familienversicherung kann beitragsfrei fortbestehen, wenn ihre Voraussetzungen weiterhin erfüllt sind. Teilzeiteinkommen und andere Einkünfte können die Voraussetzungen ändern; Krankenkasse prüfen.'}
});
function buildFinanceGuidance({insuranceMode='unknown',hasHouseholdExpenses=false,insuranceIncluded='unknown'}={}) {
 if(!Object.hasOwn(INSURANCE,insuranceMode))throw new RangeError('Unbekannter Versicherungsstatus.');
 if(typeof hasHouseholdExpenses!=='boolean')throw new TypeError('Ausgabenstatus muss eindeutig sein.');
 if(!['yes','no','unknown'].includes(insuranceIncluded))throw new RangeError('Kosten-Abdeckung ungültig.');
 const insurance={id:'insurance',...INSURANCE[insuranceMode],source:SOURCES.insurance,amountMode:'NOT_ESTIMATED'};
 const tax={id:'tax',title:'Progressionsvorbehalt und Steuererklärung',message:'Elterngeld ist steuerfrei, beeinflusst aber den Steuersatz für anderes Einkommen (Progressionsvorbehalt). Der Elterngeldbezug kann eine Steuererklärungspflicht auslösen. Der Rechner schätzt keine persönliche Nachzahlung und berücksichtigt keine steuerlichen Jahresfolgen.',source:SOURCES.tax,amountMode:'NOT_ESTIMATED'};
 const warnings=[];
 if(!hasHouseholdExpenses)warnings.push('Haushaltsausgaben fehlen: weder Versicherungsbeiträge noch Steuerpuffer sind als verfügbare Rücklage überprüfbar.');
 else if(insuranceIncluded==='no')warnings.push('Versicherungsbeiträge sind laut Angabe NICHT in euren Haushaltskosten: Das verfügbare Familienbudget kann zu hoch dargestellt sein.');
 else if(insuranceIncluded==='unknown')warnings.push('Unbekannt, ob Versicherungsbeiträge in den Haushaltsausgaben enthalten sind: Budget und Rücklagen nicht als vollständig bewerten.');
 if(insuranceMode==='unknown')warnings.push('Versicherungsart fehlt: Keine automatische Betragsannahme möglich.');
 return {verifiedAt:VERIFIED_AT,cards:[insurance,tax],warnings,regionalBenefitsIncluded:[],noAutomaticCostAdjustment:true};
}
module.exports={buildFinanceGuidance,SOURCES,VERIFIED_AT};
