'use strict';

// Ranking only: callers must validate law, coverage and minimum budgets first.
// No entitlement calculation or exhaustive combinatorial search takes place here.
const SEARCH_LIMITATIONS = Object.freeze([
  'Begrenzte Vorlagensuche: keine vollständige Prüfung aller möglichen Monatsfolgen.',
  'Die Vorlagen beschränken Wechsel, Teilzeitstarts und Bonusabschnitte; frei editierte Pläne können andere Ergebnisse liefern.',
  'Empfehlungen vergleichen geschätzte Lebensmonatsbudgets, keine garantierten Bankeingänge oder globalen Optima.'
]);
const FREE = new Set(['B', 'P', 'U', 'MS']);
const PROFILES = ['finance', 'balanced', 'robust'];
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

function metrics(calc, horizon) {
  const rows = calc.rows.slice(0, horizon);
  if (rows.length < horizon || rows.some(row => !Number.isFinite(row.cashAfter))) return null;
  const total = rows.reduce((sum, row) => sum + row.cashAfter, 0);
  const floor = Math.min(...rows.map(row => row.cashAfter));
  const father = rows.filter(row => FREE.has(row.f)).length;
  const mother = rows.filter(row => FREE.has(row.m)).length;
  return {total, floor, father, mother, balance: -Math.abs(father - mother), home: father + mother};
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
  if (profile === 'father') return `${m.father} volle Monate ohne Erwerbsarbeit beim Vater im Vergleichszeitraum; bei Gleichstand entscheidet das verfügbare Budget.`;
  if (profile === 'balanced') return `Möglichst gleichmäßige volle Monate ohne Erwerbsarbeit: Vater ${m.father}, Mutter ${m.mother} (einschließlich Mutterschutz). Dies misst Monate, keine tatsächlichen Betreuungsstunden.`;
  if (profile === 'floor') return `Höchster niedrigster Monatsbetrag unter den verbleibenden Vorlagen: ${euro(m.floor)}; bei Gleichstand entscheidet das Gesamtbudget.`;
  if (profile === 'robust') return hasAdverse ? `Stabilität im vorsichtigen Szenario: niedrigster Monatsbetrag ${euro(m.adverseFloor)}, Gesamtbudget ${euro(m.adverseTotal)} über ${horizon} Lebensmonate.` : `Vergleich nach niedrigstem Monatsbetrag ${euro(m.floor)}. Ohne vorsichtiges Szenario ist keine Aussage zur Robustheit möglich.`;
  return `Höchstes geschätztes verfügbares Gesamtbudget unter den verbleibenden Vorlagen: ${euro(m.total)} über ${horizon} Lebensmonate; niedrigster Monat ${euro(m.floor)}.`;
}
/** Returns copies of candidates, selected in objective order then diverse profiles.
 * Input: {schedule, calc:{rows,valid}, adverse?:{rows}}. Search gates belong to caller.
 * Monetary values represent budgets after costs. Ranking is lexicographic, never
 * an arbitrary weighted sum that can silently override the selected objective.
 */
function rankCandidates(items, {horizon = 36, objective = 'finance', limit = 3} = {}) {
  if (!Number.isInteger(horizon) || horizon < 1 || horizon > 96) throw new RangeError('Ungültiger Vergleichszeitraum');
  if (!Number.isInteger(limit) || limit < 0 || limit > 20) throw new RangeError('Ungültige Vorschlagsanzahl');
  if (!Array.isArray(items)) throw new TypeError('Vorschläge müssen eine Liste sein');
  const seen = new Set(), pool = [];
  for (const item of items) {
    if (!item || !Array.isArray(item.schedule) || !item.calc || !Array.isArray(item.calc.rows) || item.calc.valid === false) continue;
    const m = metrics(item.calc, horizon);
    if (!m) continue;
    const fingerprint = scheduleFingerprint(item.schedule);
    if (seen.has(fingerprint)) continue;
    const adverse = item.adverse ? (Array.isArray(item.adverse.rows) && item.adverse.valid !== false ? metrics(item.adverse, horizon) : null) : m;
    if (!adverse) continue;
    seen.add(fingerprint);
    m.adverseFloor = adverse.floor; m.adverseTotal = adverse.total;
    pool.push({item, metrics:m, fingerprint, hasAdverse:!!item.adverse});
  }
  const preferred = ['father','floor','robust','balanced','finance'].includes(objective) ? objective : 'finance';
  const profiles = [preferred, ...PROFILES.filter(profile => profile !== preferred)];
  const selected = [];
  for (let i = 0; pool.length && selected.length < limit; i++) {
    const profile = profiles[Math.min(i, profiles.length - 1)];
    pool.sort((a,b) => compare(a,b,profile));
    const candidate = pool.shift();
    selected.push({...candidate.item, profile, rankingMetrics:{...candidate.metrics}, explanation:explanation(profile,candidate.metrics,horizon,candidate.hasAdverse), score:candidate.metrics[profile==='father'?'father':profile==='robust'?'adverseFloor':profile==='floor'?'floor':profile==='balanced'?'balance':'total']});
  }
  return selected;
}
module.exports = {rankCandidates, scheduleFingerprint, SEARCH_LIMITATIONS};
