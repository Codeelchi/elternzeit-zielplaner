# UX-Recherche und Umsetzung V3.10

Stand: 16. Oktober 2026. Fokus: Orientierung nach dem ersten Beispiel, ohne neue Berechnungsformel und ohne personenbezogene Daten zu übertragen.

## Tatsächlich geprüfte Quellen

Die folgenden öffentlichen HTML-Seiten wurden am 16.10.2026 per HTTP abgerufen. Dies ist eine Inhaltsrecherche, kein vollständiger interaktiver Konkurrenztest und keine Bestätigung ihrer Rechengenauigkeit.

| Quelle | Abruf | Befund und Konsequenz |
| --- | --- | --- |
| [Bundes-Elterngeldrechner](https://familienportal.de/familienportal/rechner-antraege/elterngeldrechner) | HTTP 200 | Offizieller Anlaufpunkt für vertiefte Berechnung. In der eigenen Anwendung als bewusst externer Link anbieten; keine Planwerte anfügen oder automatisch übertragen. Der Abruf allein belegt keine konkrete amtliche Nettoermittlungsformel. |
| [DigitalService: Optionen aufzeigen und Fehlern vorbeugen](https://digitalservice.bund.de/blog/elterngeldrechner-optionen-aufzeigen-und-fehlern-vorbeugen) | HTTP 200 | Der Bericht beschreibt schrittweises Heranführen statt Verständnis aller Regeln auf einmal und Forschung mit Eltern und Verwaltungsmitarbeitenden. Daraus abgeleitet: konkrete, navigierbare nächste Schritte nach der Beispielrechnung. Dies sind Erkenntnisse des fremden Projekts, keine eigenen Nutzertestergebnisse. |
| [Einfach Elterngeld: Rechner](https://einfach-elterngeld.de/rechner) | HTTP 200 | Öffentliche Seite unterscheidet einen ungenauen Schnellrechner mit Nettoeingabe von ausführlicherer Berechnung. Daraus abgeleitet: schneller Einstieg bleibt möglich, Schätzannahmen und der Weg zur Präzisierung müssen sichtbar sein. Kein Vergleich von Endbeträgen durchgeführt. |

Der zunächst versuchte Anbieterpfad `/elterngeldrechner` antwortete mit HTTP 404; die oben genannte tatsächliche Rechnerseite wurde anschließend erfolgreich abgerufen. Keine Aussage wird auf den fehlgeschlagenen Pfad gestützt.

## Befund im bestehenden V3.9-Code

Der Schnellstart trennt bereits Beispiel und persönliche Näherung, schützt manuell geänderte Monatspläne und lässt unbekannte Haushaltsausgaben leer. Die vorhandenen Regelbefunde waren im Schnellstart jedoch im Wesentlichen als Statuscode sichtbar. Ein Haushalt konnte deshalb zwar „Daten unvollständig“ sehen, musste den passenden Eingabeort aber selbst suchen. Die kurze Erklärung zum geschätzten Elterngeld-Netto war zudem leicht zu überlesen.

## Implementierung

1. **Nächste Schritte nach Auswahl:** Eine kompakte Aufgabenliste leitet aus den bestehenden Validatorbefunden die Themen Standardfall, zu versteuerndes Vorjahreseinkommen, unvollständige Nettoangaben und weitere Regeln ab. Zusätzlich erscheinen die bereits vorhandenen Modellinformationen zu fehlenden Kosten, geschätzter Nettoquelle und erster Betreuungslücke. Keine Grenzwerte, Gesetzesregeln oder Ersatzraten werden ein zweites Mal implementiert.
2. **Direkt zur Eingabe:** Aufgaben öffnen die passende vorhandene Ansicht und fokussieren, wo sinnvoll, Standardfall, zvE, Elterngeld-Netto oder Ausgaben. Der Seitenwechsel verändert keine Haushaltsdaten und ersetzt keinen Plan.
3. **Aufklappbare Nettohilfe:** Auszahlungsnetto und pauschaliertes Elterngeld-Netto werden in einfachen Worten unterschieden. Der externe amtliche Rechner erhält keine Parameter. Gehaltsabrechnungen und gegebenenfalls Bescheid werden als hilfreiche Unterlagen genannt.
4. **Keine Scheinsicherheit:** Die Aufgabenliste nennt ausdrücklich, dass sie keine Freigabe oder Antragsprüfung ist. Sie zeigt keine rechtliche Fertigstellungsquote. Unbekannte Beträge werden nicht zu null. Eine bewusst eingetragene null ist weiterhin eine gültige Zahl.

Die bestehende Zusammenfassung und die vollständigen Regelbefunde bleiben erhalten. Schnelleingaben verändern weiterhin nur die vorgesehenen Felder; V3.9-Regeln zum Schutz manuell geänderter Werte und Monatspläne bleiben unverändert.

## Tests und Grenzen

`tests/v310-quickstart.test.mjs` enthält sechs neue Integrationstests für die Aufgaben, Fokusnavigation ohne Datenänderung, unbekannte Kosten versus explizite null, leeres Elterngeld-Netto trotz bekannter Nettoquelle, tatsächliche Betreuungslücken und sichere externe Verlinkung. Die Tests laden die aktuellen Quickstart-Quelldateien in den vorhandenen Offline-Rechner, ohne das gemeinsame `index.html` selbst umzuschreiben.

Die vollständigen V3.8-/V3.9-Regressionen und Browser-/Accessibility-Prüfungen gehören zum gemeinsamen Integrationslauf. Diese Dokumentation bestätigt keine menschlichen Nutzertests und keine unabhängige juristische oder finanzmathematische Abnahme. Die Aufgabenliste ersetzt nicht die ausführlichen Quellen, Alternativen und betroffenen Lebensmonate in „Plan prüfen“. Ein tatsächlicher Bankeingang wird weiterhin nicht berechnet.
