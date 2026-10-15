# Umsetzung des Wettbewerbs- und MVP-Audits – V3.7.0

Stand: 15.10.2026. Auf V3.6 und dem [Wettbewerbsaudit](WETTBEWERB-MVP-AUDIT-2026-10-15.md) aufgebaut. Die Umsetzung erhält die einzelne offlinefähige HTML-Datei. Eine öffentliche Fachfreigabe wird damit nicht erklärt.

## Umgesetzte Produktänderungen

### Neutraler, geführter Einstieg

- Freie optionale Bezeichnungen für beide Eltern, mit konservativer Längen-/Datentypprüfung und Textausgabe statt HTML-Interpretation. Standard: Elternteil 1 und Elternteil 2. Namen werden mit JSON exportiert/importiert und bleiben ohne Einwilligung nur im Arbeitsspeicher.
- Elternteil 2 bleibt im Modell die gebärende Person. Eine Anzeigeänderung tauscht weder den Mutterschutz noch die Rechtsrolle. Namen sind keine Erweiterung des unterstützten Familien-/Erwerbsfalls.
- Beispiel-/Schätzmodus, bekannte Werte oder manuelle Übernahme aus amtlicher Berechnung/Bescheid. Herkunftswahl ist eine Nutzerangabe, keine automatische Verifikation. Keine Daten werden an den verlinkten Bundesrechner gesendet.
- Auszahlungs-Netto, Elterngeld-Netto und Teilzeitwerte erklärt. Insbesondere gehört ein Leistungsbetrag wie 1.300 Euro nicht in das EG-Netto-Feld.
- Feste Aussagen zu Ehe, Steuerklasse IV/IV und gleichen 4.000-Euro-Gehältern aus den persönlichen Zusammenfassungen entfernt. Die Startübersicht zeigt stattdessen eingegebenes gemeinsames Erwerbsnetto, Betreuungsziel und Mindestbudget.
- Drei Einstiegsschritte bleiben sichtbar; weitere Ansichten werden als Vertiefung erklärt. Vorbelegte Beträge sind ausdrücklich ein Beispiel. Die Oberfläche ist weiterhin umfangreich; eine erfolgreiche Bedienung durch echte Testpersonen wird nicht behauptet.

### Verständlicher Direktvergleich

`src/plan-comparison.cjs` verwendet für alle Vorschläge identische Optionen und dieselbe `FamilyBudget`-Projektion. Je Vorschlag erscheinen:

1. Volle Monate ohne Erwerbsarbeit beider Eltern, einschließlich Mutterschutz; keine behaupteten Betreuungsstunden.
2. Verfügbares Gesamtbudget und niedrigster Monatsbetrag im gleichen Vergleichszeitraum.
3. Anfangsrücklage und Engpass-Lebensmonate gegenüber dem gewählten Mindestbetrag.
4. Realistisches und vorsichtiges Szenario direkt nebeneinander.
5. Differenzen zum ersten Vorschlag; mehr Rücklagenbedarf wird nicht als Verbesserung dargestellt.

Rücklagen werden zur Ganz-Euro-Anzeige aufgerundet, damit ein positiver Centbedarf nicht als null erscheint. Leistungsanspruch und tatsächliche Zahlung bleiben getrennt. Auszahlungsverzögerungen sind nicht modelliert; der vorsichtige Fall ist ein Stresstest, keine Wahrscheinlichkeit.

### Erkennbar unterschiedliche Ergebnisse

Das erste Ergebnis bleibt der lexikografische Gewinner des gewählten Ziels. Weitere Vorschläge müssen sich gegenüber **jedem** bereits ausgewählten Vorschlag erkennbar unterscheiden:

- mindestens ein voller freier, gemeinsamer freier oder Teilzeitmonat; oder
- mindestens 100 Euro beim niedrigsten Monatsbetrag; oder
- insgesamt mindestens 100 Euro je Vergleichsmonat beim Gesamtbudget; oder
- mindestens 500 Euro Anfangsrücklage.

Die Finanzschwellen werden auch auf echte vorsichtige Szenarien angewendet. Rücklagen beziehen sich auf den eingegebenen Mindestbetrag. Unterschiede sind mit Vorzeichen und Schwelle nachvollziehbar. Gibt es keine ausreichende Vielfalt, werden weniger Vorschläge angezeigt. Die Schwellen sind eine transparente Produktauswahl, keine gesetzliche Regel und keine nachgewiesene Pareto-Front.

### Unterbrechbare und erklärte Suche

Eine gemeinsame Generatorlogik unterstützt synchron reproduzierbare Modultests und eine schrittweise Browserauswertung. Nach jeweils 64 erzeugten Rohvarianten wird an die Oberfläche zurückgegeben. Abbrechen oder Änderungen an suchrelevanten Angaben beendet die laufende Suche ohne Planübernahme. Unvollständige Zwischenstände werden nicht als Empfehlung übernommen.

Fortschritt und Erst-Ausschlussgründe sind sichtbar: Betreuung, gemeinsame Auszeit, Regeln/Berechnungsgrenzen, Aufteilung und Mindestbudget. Rohvarianten, Dubletten, unterschiedliche geprüfte Muster und geeignete Kandidaten werden getrennt gezählt. Eine Kategorie benennt den ersten verletzten Filter; ein Plan kann weitere Konflikte besitzen.

Die Vorlagen sind weiterhin begrenzt. Insbesondere werden nicht alle Monatsfolgen oder freien Wiedereinstiegstermine enumeriert. Weder globale Optimalität noch universelle Smartphone-Laufzeiten werden behauptet. Die Suche kann weiterhin länger dauern, lässt sich aber bedienen und abbrechen.

## Fachliche Änderung: Cent-Rundung

Die erneut abgerufenen amtlichen BEEG-Richtlinien 07/2026, Abschnitt 2.0.3.3.1, gedruckte Seite 56/PDF-Seite 90, verlangen Cent-Rundung auch für Euro-Zwischenergebnisse. Quelle und Hash sind im [Fachbericht](FACHPRUEFUNG-FORTSETZUNG-2026-10-15.md) dokumentiert und beim Regelobjekt BE-2 verknüpft.

`src/money.cjs` behandelt binärkritische Halbwerte anhand der kanonischen Dezimaldarstellung, beispielsweise 1,005 → 1,01 und 274,625 → 274,63. Die vorhandene Betragsrechnung rundet relevante Einkommensmittel, Differenzbetrag, Ersatzbetrag, Plus-Deckel und Monatsanteil. Geldsummen des Elterngelds werden aus den Cent-Monatswerten gebildet. Der Geldhelfer entscheidet weder Leistungsberechtigung noch die Rechtsreihenfolge selbst.

Beispiel: Aus 650 Euro maßgeblichem Netto entstehen 549,25 Euro Basis und 274,63 Euro Plus. 24 solche Plusmonate ergeben 6.591,12 Euro. Diese zwölf Cent gegenüber zwölf Basisbeträgen sind die Folge monatlicher Rundung, kein zusätzlicher Optimierungsbonus.

Der Regressionstest zur Mutterschaftsdifferenz berücksichtigt die explizite Cent-Regel, erhält aber den ursprünglichen Fünf-Tage-Referenzwert und die nicht bestandene Fachfreigabe. Er wurde nicht durch einen angepassten Behördenwert grün gemacht. Der Kalender-/Geldwiderspruch wird im Monatsdetail und Ergebnisvergleich ausdrücklich benannt.

## In Browserprüfungen gefundene und korrigierte Integrationsfehler

1. Finanzzeilen enthielten in freien Monaten noch Referenz-Teilzeitstunden. Dadurch meldete der neue Vergleich null freie Monate. Die effektiven Zeilen enthalten jetzt null Erwerbsstunden bei freien Codes, reguläre Vollzeit bei W und die tatsächlichen Modellstunden bei Teilzeit. Vergleich und Ranking werden auf übereinstimmende freie Monate geprüft.
2. Ein fokussiertes Namensfeld wurde nach Import nicht aktualisiert. Profile werden jetzt bei abweichendem Wert vollständig synchronisiert; identische Eingaben werden zur Erhaltung der Eingabeposition nicht überschrieben.
3. Namen können Wörter wie „Mutter“ oder HTML-Zeichen enthalten. Die Rollenersetzung erfolgt in einem einzelnen Textschritt, damit bereits eingesetzte Namen nicht erneut als Platzhalter interpretiert werden. Der Browser prüft ausdrücklich ausbleibende HTML-Ausführung.

## Nachweise und verbleibende Abnahmen

- **216 Node-/Modul-/DOM-Tests bestanden**, einschließlich neuer Vergleichs-, Rundungs-, Diversitäts-, Eingabe- und Abbruchregressionen.
- 16/16 Browserfälle direkt über `file://`, 52 Axe-Prüfungen ohne Verstöße, keine erfassten Laufzeitfehler oder Seitenüberläufe. Aktueller Nachweis mit HTML-Hash: `qa/browser-environment.json`, vollständiger Lauf in `qa/browser-results.json`; acht aktuelle Screenshots für Desktop/Mobil.
- 48 monetäre amtliche Vergleichswerte bleiben erfolgreich; Mutterschutzabweichung weiterhin **−1 Tag**. Vier historische Dokumentkonsistenzen sind weiterhin keine vollständigen Bescheid-Reproduktionen.
- Quellmodule und eingebettete Offline-Snapshots werden durch `npm test` geprüft. Versionierter Referenzbericht: `qa/reference-deltas-v3.7.0.json`.
- Echte formative Nutzertests sind [vorbereitet](NUTZERTEST-PROTOKOLL-V3.7.md), nicht durchgeführt. Unabhängige Fach-/Rechts-/Datenschutzreview und Assistenztechnikprüfung bleiben offen.

Die automatische Brutto-zu-Elterngeld-Netto-Ermittlung wurde bewusst nicht ergänzt. Der im MVP vorgesehene transparente manuelle Eingabeweg ist umgesetzt. Vor Veröffentlichung benötigt die tatsächlich angebotene Finanzlogik weiterhin unabhängige Fachabnahme. Keine Sonderfälle oder zukünftigen Gesetze wurden durch diese Arbeit pauschal freigeschaltet.
