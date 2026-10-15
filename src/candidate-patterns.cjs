'use strict';

/** Create a second care template by exchanging the parents' monthly choices.
 * Actual maternal protection rows are preserved, including protection touching a
 * third life month. They cannot be transferred to the father. Hours in those
 * protected rows are left with their original parent; other hour overrides swap.
 *
 * This transformation does not preserve benefit quotas or certify legality.
 * Every generated variant must pass the same validator and budget/coverage gates
 * as the original. In particular, maternal benefit months still consume quota.
 */
const CODES = new Set(['W', 'MS', 'B', 'R', 'P', 'T', 'Q', 'K', 'U']);
function mirrorCarePlan(schedule) {
  if (!Array.isArray(schedule)) throw new TypeError('Monatsplan muss eine Liste sein');
  return schedule.map(row => {
    if (!row || typeof row !== 'object' || !CODES.has(row.f) || !CODES.has(row.m)) {
      throw new TypeError('Monatsplan enthält ungültige Elterncodes');
    }
    if (row.f === 'MS') throw new RangeError('Mutterschutz ist nur bei der Mutter unterstützt');
    if (row.m === 'MS') return {...row, f:'W', m:'MS'};
    const mirrored = {...row, f:row.m, m:row.f};
    delete mirrored.hf;
    delete mirrored.hm;
    if (Object.hasOwn(row, 'hm')) mirrored.hf = row.hm;
    if (Object.hasOwn(row, 'hf')) mirrored.hm = row.hf;
    return mirrored;
  });
}
module.exports = {mirrorCarePlan};
