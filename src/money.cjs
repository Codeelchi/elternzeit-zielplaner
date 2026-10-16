'use strict';

/** Cent rounding for calculated euro amounts.
 * Source: BEEG-Richtlinien 07/2026, 2.0.3.3.1, PDF p. 90 / printed p. 56:
 * euro amounts, including intermediate results, are rounded to full cents;
 * first discarded decimal >= 5 rounds up.
 * https://www.bmbfsfj.bund.de/resource/blob/243236/8a26d08d56511511e2fb7c9d5236b4de/richtlinien-zum-beeg-data.pdf
 *
 * roundEuro must be called at each legally relevant euro step by the caller:
 * relevant income averages, income difference, benefit formula result, Plus
 * cap and payment fractions. This helper does not determine the legal order,
 * benefit rates, eligibility, or the assessment period. meanEuro rounds the
 * final arithmetic mean, not each source value; pre-round inputs separately
 * only where the applicable calculation requires that intermediate step.
 *
 * Conversion uses the number's canonical decimal representation rather than
 * binary multiplication by 100 (e.g. 1.005 -> 1.01). Precision already lost in
 * upstream arithmetic cannot be recovered. Negative half-values round away
 * from zero as a symmetric technical convention, not an assertion that a
 * negative entitlement is legally payable. Results never contain -0.
 */
const MAX_EURO = 1e9;
function decimal(value) {
  if (typeof value !== 'number' || !Number.isFinite(value) || Math.abs(value) > MAX_EURO) {
    throw new RangeError('Euro-Betrag muss eine endliche Zahl zwischen -1e9 und 1e9 sein');
  }
  const [mantissa, exponent = '0'] = Math.abs(value).toString().split('e');
  const [whole, fraction = ''] = mantissa.split('.');
  let numerator = BigInt(whole + fraction);
  let scale = fraction.length - Number(exponent);
  if (scale < 0) { numerator *= 10n ** BigInt(-scale); scale = 0; }
  return {numerator:value < 0 ? -numerator : numerator, scale};
}
function roundedRatio(numerator, denominator) {
  const negative = numerator < 0n;
  const magnitude = (negative ? -numerator : numerator) * 100n;
  let cents = magnitude / denominator;
  if ((magnitude % denominator) * 2n >= denominator) cents += 1n;
  if (cents === 0n) return 0;
  return (negative ? -Number(cents) : Number(cents)) / 100;
}
function roundEuro(value) {
  const {numerator, scale} = decimal(value);
  return roundedRatio(numerator, 10n ** BigInt(scale));
}
function meanEuro(values) {
  if (!Array.isArray(values) || values.length === 0) throw new RangeError('Mittelwert benötigt eine nichtleere Liste von Euro-Beträgen');
  const parts = [];
  let scale = 0;
  for (const value of values) { const part = decimal(value); parts.push(part); scale = Math.max(scale, part.scale); }
  const sum = parts.reduce((total, part)=>total + part.numerator * 10n ** BigInt(scale - part.scale), 0n);
  return roundedRatio(sum, 10n ** BigInt(scale) * BigInt(parts.length));
}
/** Apply a scenario percentage without losing decimal precision in a prior
 * binary multiplication. Percentages are assumptions, not entitlement rates.
 * deltaPercent=-15 means 85% of value. */
function roundEuroByPercent(value,deltaPercent) {
  const amount=decimal(value),percent=decimal(deltaPercent);
  if(deltaPercent < -100 || deltaPercent > 100)throw new RangeError('Szenarioänderung muss zwischen -100 und 100 Prozent liegen');
  const percentScale=10n ** BigInt(percent.scale);
  return roundedRatio(amount.numerator*(100n*percentScale+percent.numerator),100n*10n ** BigInt(amount.scale+percent.scale));
}
module.exports = {roundEuro, roundEuroByPercent, meanEuro, MAX_EURO};
