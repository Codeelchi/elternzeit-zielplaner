#!/usr/bin/env node
/**
 * Reproducible single-file offline build. The JSON file is the only manually
 * maintained legal-rule registry. A checked-in snapshot is embedded in HTML
 * so index.html also works through file:// without network access.
 *
 * Usage: node scripts/embed-rules.mjs [--check]
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const catalogPath = resolve(root, 'data/rechtsregeln-de-nrw-2026-10-14.json');
const htmlPath = resolve(root, 'index.html');
const begin = '/* RULE_CATALOG_EMBED_START */';
const end = '/* RULE_CATALOG_EMBED_END */';
const check = process.argv.includes('--check');

const catalog = JSON.parse(readFileSync(catalogPath, 'utf8'));
const isDay = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) &&
  !Number.isNaN(Date.parse(value + 'T00:00:00Z')) && new Date(value + 'T00:00:00Z').toISOString().slice(0,10) === value;
const requireDay = (day, label) => {
  if (!isDay(day)) throw new Error(`Datum nicht gültig: ${label}: ${day}`);
};
requireDay(catalog.verified_as_of, 'verified_as_of');
requireDay(catalog.applicable_standard_birth_window?.from, 'birth_window.from');
requireDay(catalog.applicable_standard_birth_window?.through, 'birth_window.through');
if (catalog.applicable_standard_birth_window.from > catalog.applicable_standard_birth_window.through) throw new Error('Ungültiges Kohortenfenster');
const forecast = catalog.planning_forecast_window;
if (forecast != null) {
  requireDay(forecast.from, 'planning_forecast_window.from');
  requireDay(forecast.through, 'planning_forecast_window.through');
  requireDay(forecast.observed_at, 'planning_forecast_window.observed_at');
  if (forecast.from > forecast.through || forecast.from <= catalog.applicable_standard_birth_window.through || forecast.status !== 'unverified_forecast_only' ||
      forecast.child_benefit_2027_status !== 'proposed_not_in_force' ||
      !Array.isArray(forecast.sources) || !forecast.sources.length || !forecast.sources.every(x => typeof x === 'string' && x.startsWith('https://'))) {
    throw Error('Prognosefenster muss von rechtlich bestätigten Geburtskohorten getrennt und als ungeprüft markiert sein');
  }
}
const statuses = new Set(['official_source_checked', 'source_listed_review_pending', 'draft_not_in_force']);
if (!Array.isArray(catalog.rules) || catalog.rules.length < 10) throw new Error('Regelregister unvollständig');
const ids = new Set();
for (const rule of catalog.rules) {
  if (!rule.id || ids.has(rule.id)) throw new Error(`Fehlende oder doppelte Rule-ID: ${rule.id}`);
  ids.add(rule.id);
  if (!rule.url?.startsWith('https://') || !rule.source || !rule.summary) throw new Error(`Fehlende amtliche Provenienz: ${rule.id}`);
  if (!statuses.has(rule.verification_status)) throw new Error(`Unbekannter Verifikationsstatus: ${rule.id}`);
  requireDay(rule.effective_from, rule.id + '.effective_from');
  if (rule.effective_to !== null && rule.effective_to !== undefined) {
    requireDay(rule.effective_to, rule.id + '.effective_to');
    if (rule.effective_to < rule.effective_from) throw new Error(`Inverses Intervall: ${rule.id}`);
  }
  if (rule.checked_at !== null && rule.checked_at !== undefined) requireDay(rule.checked_at, rule.id + '.checked_at');
  if (rule.verification_status === 'official_source_checked' && !rule.checked_at)
    throw new Error(`Quelle als überprüft markiert ohne Prüftag: ${rule.id}`);
  if (rule.verification_status === 'draft_not_in_force' && !rule.planned)
    throw new Error(`Gesetzentwurf ohne planned-Flag: ${rule.id}`);
  if (rule.from !== rule.effective_from) throw new Error(`Drift from/effective_from: ${rule.id}`);
}
const legal = catalog.standard_parameters;
if (!legal || legal.basis_min_eur !== 300 || legal.basis_max_eur !== 1800 ||
    legal.plus_min_eur !== 150 || legal.plus_max_eur !== 900 ||
    legal.basis_income_cap_eur !== 2770 || legal.max_weekly_work_hours !== 32) {
  throw new Error('Kernwerte des Standardfalls fehlen oder sind unplausibel; Fachprüfung erforderlich');
}
const html = readFileSync(htmlPath, 'utf8');
const first = html.indexOf(begin), last = html.indexOf(end);
if (first < 0 || last <= first || html.indexOf(begin, first + 1) >= 0 || html.indexOf(end, last + 1) >= 0) {
  throw new Error('Embedded-rule-Marker fehlen oder sind nicht eindeutig');
}
const json = JSON.stringify(catalog, null, 1).replace(/</g, '\\u003c');
const content = begin + '\nconst RULE_CATALOG = Object.freeze(' + json + ');\n' + end;
const wanted = html.slice(0, first) + content + html.slice(last + end.length);
if (html === wanted) {
  console.log('Legal registry embedded snapshot consistent (' + catalog.rules.length + ' rules)');
} else if (check) {
  console.error('ERROR: index.html enthält einen abweichenden Regel-Snapshot. npm run rules:sync ausführen.');
  process.exitCode = 1;
} else {
  writeFileSync(htmlPath, wanted);
  console.log('Embedded offline legal registry updated (' + catalog.rules.length + ' rules)');
}
