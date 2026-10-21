'use strict';

// Ranking only: callers must validate law, coverage and minimum budgets first.
// No entitlement calculation or exhaustive combinatorial search takes place here.
const SEARCH_LIMITATIONS = Object.freeze([
  'Begrenzte Vorlagensuche: keine vollständige Prüfung aller möglichen Monatsfolgen.',
  'Die Vorlagen beschränken Wechsel, Teilzeitstarts und Bonusabschnitte; frei editierte Pläne können andere Ergebnisse liefern.',
  'Empfehlungen vergleichen geschätzte Reste nach eingetragenen Haushalts- und Kita-Kosten je Lebensmonat, keine garantierten Bankeingänge oder globalen Optima.'
]);
const FREE = new Set(['B', 'P', 'U', 'MS']);
const PROFILES = ['finance', 'balanced', 'robust'];
// Product comparison thresholds, not legal parameters. Financial differences
// must reach EUR 100 per month (average across the horizon for total budgets)
// or EUR 500 in initial reserves. One whole parent/combined-care or part-time
// month is a visible structural change. Calendar shifts alone do not qualify.
const DIVERSITY_THRESHOLDS = Object.freeze({monthlyEuro:100, averageMonthlyEuro:100, reserveEuro:500, months:1});
const PART_TIME = new Set(['R', 'T', 'Q', 'K']);
const FINGERPRINT_CODES=Object.freeze({W:'W',MS:'M',B:'B',R:'R',P:'P',T:'T',Q:'Q',K:'K',U:'U'});
function scheduleFingerprint(schedule) {
  // Encode each supported status in one character; retain sparse indexed hours.
  // Generic unknown codes use the original lossless format instead of colliding.
  const codes=[],hours=[];
  for(const [index,row]of schedule.entries()){
    if(!Object.hasOwn(FINGERPRINT_CODES,row.f)||!Object.hasOwn(FINGERPRINT_CODES,row.m))return JSON.stringify(schedule.map(r=>[r.f,r.m,r.hf??null,r.hm??null]));
    codes.push(FINGERPRINT_CODES[row.f]+FINGERPRINT_CODES[row.m]);
    if(row.hf!=null||row.hm!=null)hours.push([index,row.hf??null,row.hm??null]);
  }
  return JSON.stringify([codes.join(''),hours]);
}

function metrics(calc, horizon, minimum = 0) {
  const rows = calc.rows.slice(0, horizon);
  if (rows.length < horizon || rows.some(row => !Number.isFinite(row.cashAfter))) return null;
  const total = rows.reduce((sum, row) => sum + row.cashAfter, 0);
  const floor = Math.min(...rows.map(row => row.cashAfter));
  const father = rows.filter(row => FREE.has(row.f)).length;
  const mother = rows.filter(row => FREE.has(row.m)).length;
  let running = 0, reserve = 0;
  for (const row of rows) { running += row.cashAfter - minimum; reserve = Math.max(reserve, -running); }
  return {total, floor, father, mother, balance: -Math.abs(father - mother), home: father + mother,
    sharedHome:rows.filter(row=>FREE.has(row.f)&&FREE.has(row.m)).length,
    fatherPartTime:rows.filter(row=>PART_TIME.has(row.f)).length,
    motherPartTime:rows.filter(row=>PART_TIME.has(row.m)).length, reserve};
}
function diversityDifferences(a, b, horizon) {
  const dimensions = [
    ['father', 'Volle Monate ohne Erwerbsarbeit beim Vater', 1, 'Monate'],
    ['mother', 'Volle Monate ohne Erwerbsarbeit bei der Mutter', 1, 'Monate'],
    ['sharedHome', 'Gemeinsame volle Monate ohne Erwerbsarbeit', 1, 'Monate'],
    ['fatherPartTime', 'Teilzeitmonate beim Vater', 1, 'Monate'],
    ['motherPartTime', 'Teilzeitmonate bei der Mutter', 1, 'Monate'],
    ['floor', 'Niedrigster Rest nach Haushalts- und Kita-Kosten / LM', DIVERSITY_THRESHOLDS.monthlyEuro, 'EUR'],
    ['total', 'Rest nach Haushalts- und Kita-Kosten über den Zeitraum', DIVERSITY_THRESHOLDS.averageMonthlyEuro * horizon, 'EUR'],
    ['reserve', 'Anfangsrücklage gegenüber dem Mindest-Rest nach Haushalts- und Kita-Kosten über den Zeitraum', DIVERSITY_THRESHOLDS.reserveEuro, 'EUR']
  ];
  // An absent stress scenario must never be presented as measured robustness.
  if (a.hasAdverse && b.hasAdverse) dimensions.push(
    ['adverseFloor', 'Niedrigster Rest nach Haushalts- und Kita-Kosten / LM im vorsichtigen Szenario', DIVERSITY_THRESHOLDS.monthlyEuro, 'EUR'],
    ['adverseTotal', 'Rest nach Haushalts- und Kita-Kosten über den Zeitraum im vorsichtigen Szenario', DIVERSITY_THRESHOLDS.averageMonthlyEuro * horizon, 'EUR'],
    ['adverseReserve','Anfangsrücklage gegenüber dem Mindest-Rest nach Haushalts- und Kita-Kosten im vorsichtigen Szenario',DIVERSITY_THRESHOLDS.reserveEuro,'EUR']);
  return dimensions.flatMap(([code,label,threshold,unit])=>{
    const delta = a.metrics[code] - b.metrics[code];
    return Math.abs(delta) >= threshold ? [{code,label,delta,threshold,unit}] : [];
  });
}
function compare(a, b, profile) {
  const keys = profile === 'father' ? ['father', 'total', 'floor'] :
    profile === 'floor' ? ['floor', 'total', 'balance'] :
    profile === 'balanced' ? ['balance', 'home', 'total', 'floor'] :
    profile === 'robust' ? ['adverseFloor', 'adverseTotal', 'floor', 'total'] :
    ['total', 'floor', 'balance'];
  for (const key of keys) {
    const delta = b.metrics[key] - a.metrics[key];
    if (delta) return delta;
  }
  return a.fingerprint.localeCompare(b.fingerprint);
}
function euro(amount) {
  return new Intl.NumberFormat('de-DE', {style:'currency',currency:'EUR',maximumFractionDigits:0}).format(amount);
}
function explanation(profile, m, horizon, hasAdverse) {
  if (profile === 'father') return `${m.father} volle Monate ohne Erwerbsarbeit beim Vater im Vergleichszeitraum; bei Gleichstand entscheidet der Rest nach Haushalts- und Kita-Kosten.`;
  if (profile === 'balanced') return `Möglichst gleichmäßige volle Monate ohne Erwerbsarbeit: Vater ${m.father}, Mutter ${m.mother} (einschließlich Mutterschutz). Dies misst Monate, keine tatsächlichen Betreuungsstunden.`;
  if (profile === 'floor') return `Höchster niedrigster Rest nach Haushalts- und Kita-Kosten je LM unter den verbleibenden Vorlagen: ${euro(m.floor)}; bei Gleichstand entscheidet der Rest nach Haushalts- und Kita-Kosten über den Zeitraum.`;
  if (profile === 'robust') return hasAdverse ? `Stabilität im vorsichtigen Szenario: niedrigster Rest nach Haushalts- und Kita-Kosten je LM ${euro(m.adverseFloor)}, Rest nach Haushalts- und Kita-Kosten über ${horizon} LM ${euro(m.adverseTotal)}.` : `Vergleich nach niedrigstem Rest nach Haushalts- und Kita-Kosten je LM ${euro(m.floor)}. Ohne vorsichtiges Szenario ist keine Aussage zur Robustheit möglich.`;
  return `Höchster geschätzter Rest nach Haushalts- und Kita-Kosten unter den verbleibenden Vorlagen: ${euro(m.total)} über ${horizon} LM; niedrigster Rest je LM ${euro(m.floor)}.`;
}
/** A selected objective is more informative than raw whole-month totals alone.
 * Profile names describe the focus among the remaining search candidates,
 * never a globally optimal or legally guaranteed recommendation.
 */
function proposalTitle(profile, m, horizon, hasAdverse) {
  switch (profile) {
    case 'father': return `Vaterzeit im Fokus · ${m.father} volle Monate`;
    case 'balanced': return `Zeitaufteilung im Fokus · ${m.father}/${m.mother} volle Monate`;
    case 'floor': return `Rest nach Haushalts- und Kita-Kosten je LM im Fokus · mindestens ${euro(m.floor)}`;
    case 'robust': return hasAdverse
      ? `Vorsichtiges Szenario · Rest nach Haushalts- und Kita-Kosten je LM mindestens ${euro(m.adverseFloor)}`
      : `Rest nach Haushalts- und Kita-Kosten je LM ohne Stresstest · mindestens ${euro(m.floor)}`;
    default: return `Rest nach Haushalts- und Kita-Kosten im Fokus · ${euro(m.total)} über ${horizon} LM`;
  }
}
/**
 * Pareto comparison of the ALREADY validated/eligible candidate pool.
 * Two visible, competing dimensions only: total household budget (max) and
 * sum of full parent months (max). Double-counted overlap is disclosed by UI.
 * Efficient O(pool size + distinct home values log distinct home values).
 * This intentionally does not claim an exhaustive or legal optimum.
 */
function tradeoffFrontier(pool) {
  if(!Array.isArray(pool))throw new TypeError('Geprüfte Muster als Liste erforderlich.');
  const comparedCandidates=pool.length;
  const bestByHome=new Map();
  for(const item of pool){
    const home=item?.metrics?.home,total=item?.metrics?.total;
    if(!Number.isInteger(home)||home<0||!Number.isFinite(total))throw new TypeError('Vergleichsmetriken fehlen.');
    const totalCents=Math.round(total*100);
    if(!Number.isSafeInteger(totalCents))throw new RangeError('Gesamtbudget außerhalb des sicheren Vergleichs.');
    const old=bestByHome.get(home);
    if(old===undefined||totalCents>old)bestByHome.set(home,totalCents);
  }
  const homes=[...bestByHome.keys()].sort((a,b)=>b-a);
  const bestHigher=new Map();
  let maxFromHigher=-Infinity,frontierCombinations=0;
  for(const home of homes){
    bestHigher.set(home,maxFromHigher);
    const best=bestByHome.get(home);
    if(best>maxFromHigher)frontierCombinations++;
    maxFromHigher=Math.max(maxFromHigher,best);
  }
  const annotate=metrics=>{
    const own=Math.round(metrics.total*100);
    const maxSameHome=bestByHome.get(metrics.home);
    const maxHigherHome=bestHigher.get(metrics.home);
    return {scope:'VALIDATED_CANDIDATE_POOL',axes:['totalAvailable','fullParentMonths'],
      isNondominated:own===maxSameHome&&maxHigherHome<own,
      comparedCandidates,frontierCombinations};
  };
  return {annotate,frontierCombinations,comparedCandidates};
}
/** Returns copies of candidates, selected in objective order then diverse profiles.
 * Input: {schedule, calc:{rows,valid}, adverse?:{rows}}. Search gates belong to caller.
 * Monetary values represent budgets after costs. Ranking is lexicographic, never
 * an arbitrary weighted sum that can silently override the selected objective.
 * The first result always wins the selected objective. Later results must differ
 * materially from EVERY preceding result using DIVERSITY_THRESHOLDS. Their
 * diversity.comparedWith entries explain signed differences; fewer results are
 * intentional when no materially different candidate survives. This is a
 * transparent heuristic, not a proof of Pareto or globally optimal coverage.
 */
function rankCandidates(items, {horizon = 36, objective = 'finance', limit = 3, allowProvisional = false, minimum = 0} = {}) {
  if (!Number.isInteger(horizon) || horizon < 1 || horizon > 96) throw new RangeError('Ungültiger Vergleichszeitraum');
  if (!Number.isInteger(limit) || limit < 0 || limit > 20) throw new RangeError('Ungültige Vorschlagsanzahl');
  if(typeof minimum!=='number'||!Number.isFinite(minimum)||minimum<0)throw new RangeError('Ungültiger Mindestbetrag');
  if (!Array.isArray(items)) throw new TypeError('Vorschläge müssen eine Liste sein');
  const seen = new Set(), pool = [];
  for (const item of items) {
    if (!item || !Array.isArray(item.schedule) || !item.calc || !Array.isArray(item.calc.rows) || (item.calc.valid === false && !(allowProvisional===true && item.calc.forecastPlanningReady===true))) continue;
    const m = metrics(item.calc, horizon, minimum);
    if (!m) continue;
    const fingerprint = scheduleFingerprint(item.schedule);
    if (seen.has(fingerprint)) continue;
    const adverse = item.adverse ? (Array.isArray(item.adverse.rows) && (item.adverse.valid !== false || (allowProvisional===true && item.adverse.forecastPlanningReady===true)) ? metrics(item.adverse, horizon, minimum) : null) : m;
    if (!adverse) continue;
    seen.add(fingerprint);
    m.adverseFloor = adverse.floor; m.adverseTotal = adverse.total;m.adverseReserve=adverse.reserve;
    pool.push({item, metrics:m, fingerprint, hasAdverse:!!item.adverse});
  }
  const frontier=tradeoffFrontier(pool);
  const preferred = ['father','floor','robust','balanced','finance'].includes(objective) ? objective : 'finance';
  const profiles = [preferred, ...PROFILES.filter(profile => profile !== preferred)];
  const selected = [], chosen = [];
  for (let i = 0; pool.length && selected.length < limit; i++) {
    const profile = profiles[Math.min(i, profiles.length - 1)];
    pool.sort((a,b) => compare(a,b,profile));
    const index = pool.findIndex(candidate=>chosen.every(previous=>diversityDifferences(candidate,previous,horizon).length));
    if (index < 0) break;
    const [candidate] = pool.splice(index,1);
    const comparedWith = chosen.map((previous,selectionIndex)=>({selectionIndex,differences:diversityDifferences(candidate,previous,horizon)}));
    const diversity = {kind:chosen.length?'alternative':'primary', comparedWith,
      thresholds:{...DIVERSITY_THRESHOLDS, totalEuro:DIVERSITY_THRESHOLDS.averageMonthlyEuro*horizon}};
    chosen.push(candidate);
    selected.push({...candidate.item, profile, title:proposalTitle(profile,candidate.metrics,horizon,candidate.hasAdverse), rankingMetrics:{...candidate.metrics}, tradeoff:frontier.annotate(candidate.metrics), diversity, explanation:explanation(profile,candidate.metrics,horizon,candidate.hasAdverse), score:candidate.metrics[profile==='father'?'father':profile==='robust'?(candidate.hasAdverse?'adverseFloor':'floor'):profile==='floor'?'floor':profile==='balanced'?'balance':'total']});
  }
  return selected;
}
module.exports = {rankCandidates, scheduleFingerprint, tradeoffFrontier, SEARCH_LIMITATIONS, DIVERSITY_THRESHOLDS};
