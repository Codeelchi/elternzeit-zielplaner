# Recherche 30.10.2026 – 4/5 Mutterschutztage (Elterngeld-Anrechnung)

**Status:** Recherche, **keine Fachfreigabe**. Kein Gate wurde geändert (`data/release-gates.json` unverändert); der öffentliche Rechner bleibt **NO-GO**. Nur synthetische Datumsbeispiele.

## Abrufgrenze dieser Sitzung (wichtig)

Am 30.10.2026 waren `www.gesetze-im-internet.de` und `familienportal.de` aus der Recherche-Sitzung **nicht erreichbar** (DNS-Fehler, Host nicht in den erlaubten Netzwerkdomains). Es konnte daher **kein Primärquellentext neu abgerufen oder wörtlich zitiert** werden. Die Websuche lieferte nur Sekundärquellen (Krankenkassen-/Portaltexte, kein Gesetzestext). Primärquellen-Zitate aus dem Stand 22.10.2026 stehen in `FACHQUELLEN-MUTTERSCHUTZ-2026-10-22.md` und wurden hier **nicht erneut verifiziert**. Folgeschritt: Domains freigeben und die Abschnitte "Zu verifizieren" nachziehen.

## Gesichert (nur soweit aus Vorstand 22.10. und Sekundärlage konsistent; Primärabruf am 30.10. ausstehend)

| Aussage | Quelle / Status |
| --- | --- |
| Schutzfrist: sechs Wochen vor ET, grundsätzlich acht Wochen nach Entbindung; bei früherer Geburt verlängert sich die Frist nach der Geburt | § 3 MuSchG (laut Doku 22.10.); Sekundärbestätigung per Websuche 30.10. (Krankenkassen-/Portaltexte) |
| Mutterschaftsgeld wird für die Schutzfristen **und den Entbindungstag** gezahlt | § 24i Abs. 3 SGB V bzw. § 19 MuSchG (laut Doku 22.10.); Sekundärsnippet 30.10.: "für die Schutzfristen vor und nach der Entbindung sowie für den Entbindungstag" (zusammenfassende Suchergebnisantwort, nicht Gesetzestext) |
| Für denselben Zeitraum gezahltes Mutterschaftsgeld wird auf Elterngeld angerechnet; Lebensmonate mit Mutterschaftsleistungen gelten als Basiselterngeldmonate der Mutter | § 3 BEEG (nur Sekundärquelle am 30.10.: nexvyra.de, abgeordnetenwatch.de – **keine amtlichen Quellen**) |
| Pauschales Mutterschaftsgeld (210 EUR, z. B. Privatversicherte) wird nicht angerechnet | Sekundär (Allianz-Merkblatt); amtlich zu verifizieren |

## Offen (auslegungsbedürftig)

1. **Zählt der Entbindungstag (Tag 0) für die Elterngeld-Anrechnung als Mutterschaftsleistungstag?** Schutzfrist nach Geburt beginnt am Folgetag (§§ 187/188 BGB, KomNet 4244), Mutterschaftsgeld und Arbeitgeberzuschuss werden aber auch für den Entbindungstag gezahlt. Daraus folgt: Schutzfristende, Zahlungszeitraum und Anrechnungszeitraum sind **nicht ohne weitere Begründung identisch**.
2. **Fall Geburt = ET = 20.05.2026 (synthetisch):** Modell = 4 Resttage im 2. Lebensmonat (Schutzfristende 15.07.), Bundesfamilienportal-Beispiel (Stand 22.10.) = 5 Resttage (Leistungen bis 14.07.). Beide Zahlen sind im Repo so festgehalten (`data/maternity-delta-evidence-2026-10-17.json`, `scripts/maternity-delta-check.mjs` – `UNRESOLVED_OFFICIAL_DISCREPANCY`). Eine Primärquelle, die die taggenaue Anrechnung eindeutig regelt, wurde **nicht gefunden**.
3. **Abgrenzung nach Versicherungsart und Zahlungsträger** (gesetzliche Kasse, Bundesamt für Soziale Sicherung/Mutterschaftsgeld, Arbeitgeberzuschuss): Wirkung auf die anteilige Anrechnung im 2. Lebensmonat ungeklärt.
4. **Zu verifizieren, sobald Netz freigegeben:** Wortlaut § 3 MuSchG, § 19 MuSchG, § 24i SGB V, § 3 BEEG (Anrechnung und Lebensmonatsbezug), Familienportal-Beispiel (Wortlaut/Stand), BSV-/GKV-Spitzenverband-Hinweise, ggf. Verwaltungsvorschriften zum BEEG und Rechtsprechung (BSG zur Anrechnung von Mutterschaftsleistungen).

## Entscheidungsvorschlag (muss von fachkundiger Stelle bestätigt werden)

- **Vorläufig konservativ bleiben:** Beide Werte (4 und 5) weiterhin als offene Abweichung führen; keine stille Festlegung im Rechner. Ergebnis im UI/Export weiterhin als nicht verbindlich kennzeichnen.
- **Falls eine Stelle bestätigen soll:** Hypothese A (4 Tage: Anrechnung bis Schutzfristende) vs. Hypothese B (5 Tage: Anrechnung folgt dem Familienportal-Beispiel, Leistungsende einen Tag früher). Die Stelle (Elterngeldstelle des Landes bzw. gesetzliche Krankenkasse, schriftlich und datiert) sollte entscheiden, ob der Entbindungstag in die Anrechnung fällt und wie der 2. Lebensmonat anteilig (x/30) gemindert wird.
- Erst danach: Geldlogik und Tests anpassen; Gate-Änderung ausschließlich durch die verantwortlichen Personen.

Dieses Dokument ist **keine Rechts- oder Leistungsauskunft** und hebt keinen Blocker auf.
