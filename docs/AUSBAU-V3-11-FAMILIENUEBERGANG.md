# V3.11 - Betreuung und finanzieller Uebergang (erster Implementierungsschritt)

Stand: 2026-10-17. Entwicklungszweig; **keine Beta-/Rechtsfreigabe**.

## Implementiert

- Die Schnellstart-Zusammenfassung wertet Betreuungsluecken ueber den ganzen gewaehlten Zeitraum in zusammenhaengenden Lebensmonatsintervallen aus.
- Negative Modellbudgets werden ausschliesslich bei explizit bekannten Haushaltsausgaben angezeigt. Bei fehlenden Kosten gibt es keine falsche Aussage zur Liquiditaet.
- Bei festgelegtem Kita-Start wird ein **separates unverbindliches** Zwei-Lebensmonate-Verzoegerungsszenario zur Betreuung durchgerechnet.
- Kita-Verzoegerung aendert keinerlei persoenliche Einstellungen oder gespeicherte Plaene; keine zusaetzlichen Elterngeldberechnungen.
- Die Anzeige benennt Grenzen: Die Kita-Verzoegerung berechnet weder Einkommen noch Betreuungskosten neu und ersetzt keine Wochenplanung, Platz-/Eingewoehnungszusage oder echten Zahlungsplan.
- Direkte Navigation zur regionalen Kita-Konfiguration.

## Test

- Neue DOM-Integrationstests: erkannte Betreuungsluecken, Ausgaben unbekannt vs. exakt Null, unveraendertes Szenario und Hinweis auf unveraenderte Geldwerte.
- Vollstaendige Node/DOM-Suite: 282/282 (gegenueber 279/279 auf V3.10).

## Naechste getrennte Arbeitspakete

1. Eigener, bedienbarer Verzugsregler (0-6 LM) einschliesslich transparentem Ansatz der Einnahmen/Kita-Kosten unter neuen Arbeitszeitannahmen; keine Doppelberechnung des Elterngeldes.
2. Rueckwaerts-Zielsuche mit harten Bedingungen, Pareto-Auswahl und nachvollziehbarer Modellbegruendung; existierende Ranking-Engine wiederverwenden.
3. Echte Zahltermine nur nach manueller Bestaetigung, strikt getrennt von Lebensmonatsanspruechen.
4. Unabhaengige amtliche Netto- und Mutterschutzfallpruefung, externe Rechts-/Datenschutzreviews und echte Nutzertests **vor** oeffentlichem Betrieb.

Die Release-Sperren aus data/release-gates.json bleiben unveraendert.
