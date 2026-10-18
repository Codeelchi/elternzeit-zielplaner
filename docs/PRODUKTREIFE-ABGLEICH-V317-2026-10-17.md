# Prüfgrundlage aus extern übergebenem Audit – Abgleich mit dem Repository

**Erstellt 17.10.2026, basierend auf der vom Nutzer übergebenen Prüfgrundlage „Elternzeit-Zielplaner: Produktreife und unabhängige Prüfung“ vom selben Tag.** Das zugrunde liegende Audit ist eine **sekundäre, unverifizierte Zusammenstellung früherer Befunde** und wird weder als unabhängiger Rechts- noch als Code- oder Sicherheitsreview gewertet. Die Bewertung unten referenziert **selbst eingesehene Repositorystellen** des damaligen `main` nach PR #20, Merge-SHA `19f047d`; keine nachträglich erfundene externe Freigabe.

| Audit-Aussage | Nachprüfung am 17.10.2026 | Präzise Verwendung |
| --- | --- | --- |
| PR #20 mit V3.15/16 noch nicht auf `main` | **Historisch richtig, jetzt überholt.** PR #20 am 17.10.2026 nach erfolgreicher GitHub-CI zu `19f047d` gemergt; Workbench-Fast-Forward und Release-Blockade geprüft. | V3.15–V3.16 sind **intern integriert**, nicht öffentlich freigegeben. |
| 452 Node-/DOM- und 53 Browserfälle | **Technisch bestätigt**, durch frühere Workbench- und GitHub-PR-CI-Läufe zu `750205e`; zusätzlich 4 direkte `file://`-V3.16-Fälle. | Regression belegt keine Elterngeld-Netto-/Rechtsrichtigkeit. Jede neue Änderung braucht eigene Tests. |
| Standardfall nicht abgegrenzt | **Zu präzisieren.** `src/rule-validator.cjs` verlangt explizite Standardfallbestätigung: zwei abhängig beschäftigte Eltern, gemeinsamer Haushalt, selbst betreutes Kind, Einzelgeburt, ohne unbestätigte Sonderfälle. | Die **technische** Positiv-/Negativliste existiert, ihre **unabhängige fachliche Abnahme und Nutzerverständlichkeit fehlen**. |
| Regeln nur 2025–2026 | **Bestätigt, zeitlich eingegrenzt.** `RULE_CATALOG.applicable_standard_birth_window` ist 01.04.2025–31.12.2026. Der Validator trennt `BIRTH_COHORT_UNSUPPORTED` und die vorläufige Prognose für 2027. | Keine pauschale positive Geburtenbewertung ab 2027; Vorschauen gesondert kennzeichnen. |
| Ungeklärter Mutterschutz-Referenztag | **Bestätigt; nicht gelöst.** `tests/reference.test.mjs` demonstriert 4/30 Modell versus 5/30 amtliches Beispiel; `docs/ROADMAP-FACHABNAHME-V314-2026-10-17.md` enthält Klärungsauftrag. | Weder die Portalreferenz noch die eigene Herleitung als abschließend richtig behaupten. Rechtlich und behördlich getrennt Schutzfrist, Entbindungstag, Mutterschaftsgeld und BEEG-Anrechnung klären. |
| Zehn Referenzfamilien | **Vorbereitet, nicht unabhängig abgeschlossen.** `data/independent-case-requests-2026-10-17.json` beschreibt zehn synthetische Fälle; dokumentierte Vollabnahmen **0/10**. | Keine automatisiert erzeugten eigenen Sollwerte als unabhängige Referenzen ausgeben. |
| Eigene Brutto-Netto-Engine / Steuer | **Nicht unabhängig bestätigt.** Bestehendes Modell übernimmt manuelles Elterngeld-Netto bzw. hypothetische Nettoannahmen. | Zwischen Auszahlungsnetto, Elterngeld-Netto und Bezugsbetrag klar unterscheiden; keine amtliche Rechenzusage. |
| Anspruch, Zahlung und echte Buchung könnten doppelt zählen | **Technische Trennung vorhanden.** `src/family-budget.cjs`, `src/expected-payments.cjs`, `src/recorded-liquidity.cjs` benutzen getrennte Datenbezüge und Herkunftshinweise. | Vollständiger fachlicher Zeitachsen-Abgleich und Nutzerverständnis fehlen weiterhin. |
| Globale Optimierung unbewiesen | **Im Code bereits abgegrenzt.** `src/search-coverage.cjs` setzt `completenessKnown:false`, `globalOptimumClaimAllowed:false`; `src/goal-ranking.cjs` benennt begrenzte Vorlagen. | „Beste unter den geprüften Kandidaten“, niemals „global optimal“ oder „einzigartig“. |
| Datenschutz/Offline | **Technische Tests vorhanden**, unabhängig geprüfte Datenschutzwirkung, Datenfluss im tatsächlichen Hosting und manueller Screenreader-Test nicht belegt. | Weder Offline noch grüner Axe-Scan ist eine vollständige DSGVO-/Accessibility-Abnahme. |
| V3.16 Wochenplanung | **Technisch vorhanden und in main gemergt**, 15-Minuten-Raster Mo–Fr, nur flüchtige Wochenannahmen; keine realen Schichten, Pendelzeiten, Feiertage. | Die Wochenplanung ist eine Alternative zum Ein-Eltern-Kita-Kostenmodell, die Ergebnisse nicht addieren; kein berechneter Partnerschaftsbonus. |

## Produktentscheidung für die nächste Runde

**Interne Produktbeschreibung:** „Familien-Szenario- und Budgetplaner mit offlinefähigen, nachvollziehbaren Entwürfen für Auszeit, Elterngeldannahmen, Rücklagen, Betreuung und Berufsrückkehr. Er zeigt Rechts-/Datenlücken und ersetzt weder Bescheid noch Beratung.“

**P0 bleibt:** überprüfte Standardfallgrenze, eindeutige Einkommensbegriffe, Mutterschutz-Frist und Leistungsanrechnung, unabhängige Familienreferenzen, Abgleich Anspruch/Zahlung/Buchung, Datenschutz-/Rechts-/Betreiberreview, manuelle Accessibility und echter Nutzertest. Eine moderierte Demonstration mit synthetischen Daten ist **keine** öffentliche Freigabe.

**P1 bleibt:** echte Wochenkalender, Schichten/Pendelzeiten, geprüfter Brutto-Netto-Bemessungsweg, komplexe Einkünfte und Familienkonstellationen, weitere Regionen, verschlüsseltes Teilen. Das Etikett „später“ entlastet nur, wenn diese Fälle **in Eingabe und Ergebnis wirksam begrenzt** bleiben.

**V3.17-A als erster umsetzbarer Schritt:** Eine auf dem bestehenden Validator beruhende, rein informative Statusanzeige, die fehlende/abweichende Eingaben, Zukunftskohorten und plausible Modellfälle samt Quellenstand/Schätzgrenzen unterscheidet. Kein Setzen von `data/release-gates.json`; keine Rechtsneuberechnung. [Operative Roadmap](ROADMAP.md).

## Noch fehlende unabhängige Evidenz

| Nachweis | Vorhandenes Material | Erforderliche externe Rolle |
| --- | --- | --- |
| Amtliche Mutterschutzklärung | `tests/reference.test.mjs`, [V3.14 Fachreview](ROADMAP-FACHABNAHME-V314-2026-10-17.md) | Zuständige Elterngeldstelle/BEEG- und Mutterschutz-Fachperson |
| Zehn validierte Lebensmonats-Familienfälle | `data/independent-case-requests-2026-10-17.json` | Unabhängige fachliche Berechnungsreviewer |
| Rechte, Datenschutz, Betreiberangaben | `data/release-gates.json` | Verantwortlicher Betreiber/Rechts- und Datenschutzreview |
| Nutzer-/Barrierefreiheitstest | Automatisierte Axe-/Browserprüfungen, Vorlagen | Menschen mit und ohne Assistenztechnik, moderierte Aufgaben |

**Keine der externen Entscheidungen wird in dieser Datei erteilt.** Aufklärungsbedarf ist kein nachgewiesener Bug; umgekehrt ist das Fehlen eines Bugreports keine Bestätigung der Rechtsrichtigkeit.
