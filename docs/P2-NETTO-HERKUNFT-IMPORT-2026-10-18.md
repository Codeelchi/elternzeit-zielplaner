# P2 – Elterngeld-Netto-Herkunft, bewusste Übernahme und sicherer Planimport

**Stand:** 18.10.2026 · **Gültigkeit:** technische UX- und Importprüfung, keine amtliche Fach-, Rechts-, Datenschutz- oder Produktfreigabe.

## Problem und gewählte Sicherheitsgrenze

Ein selbst eingegebenes oder importiertes **Elterngeld-Netto** ist nicht gleich dem gewöhnlichen **Auszahlungsnetto**. Bisher behielt der Rechner bei Änderung des Auszahlungsnettos solche Fachwerte still bei. Technisch war die Beibehaltung absichtlich, fachlich und für Familien ohne Vorkenntnisse jedoch missverständlich.

**Neue Regel:** Enthält der Schnellstart einen bereits hinterlegten, nicht vom Schnellstart selbst erzeugten Fachwert und wird das Auszahlungsnetto verändert, muss der Nutzer im Schnellstart **eine ausdrückliche Entscheidung** treffen. Solange diese fehlt, wird der zuletzt gültige Plan nicht überschrieben. Die Anwendung bietet:
- **Beibehalten:** den bisherigen Fach-/Importwert bewahren; Herkunft bleibt ungeprüft.
- **Neu schätzen:** den betroffenen Wert durch eine unverbindliche Schätzung aus dem neuen Auszahlungsnetto ersetzen; keine amtliche Netto-Ermittlung.
- **Löschen:** den Fachwert als **unbekannt** kennzeichnen (Leerwert), ausdrücklich **nicht** als 0 €.

Der Dialog erscheint **nur**, wenn mindestens ein vorhandener Fachwert betroffen ist und sich das Auszahlungsnetto ändert. Wenn lediglich das Betreuungsziel oder Haushaltsausgaben angepasst werden, erscheint er nicht. Vom Schnellstart selbst geschätzte Werte werden wie bisher nur dann fortgeschrieben, wenn sie nachweislich unverändert aus diesem Schnellstart stammen.

Das Ergebnis erläutert die Herkunft **je Elternteil**: erfundener Vorlagenwert, Schnellstart-Schätzung, beibehaltener Fach-/Importwert unbekannter externer Herkunft oder unbekannter/fehlender Wert. Die Bezeichnung ist eine UI-Herkunftshilfe, **kein unabhängig geprüfter Zahlungsbetrag**. Diese Sitzungsprovenienz ist ausdrücklich **kein Bestandteil von JSON-Schema 1** und darf nach einem Import nicht rückwirkend erfunden werden.

## Import und Datenverlust-Transparenz

Vor dem JSON-Import gibt es eine aufklappbare Information: Die gespeicherten Eingaben, Lebensmonate und enthaltenen Bankbuchungen werden aus einem kompatiblen Export wiederhergestellt. **Nicht** übernommen werden laufende Suchergebnisse, temporäre Zahlungs-/Liquiditätstests, Kita- und Eingewöhnungsvarianten, Risikosimulationen sowie der Lernfortschritt.

Fehler bei ungültigem JSON, überschrittenem 1-MB-Limit, inkompatibler Version und ungültigen Feldwerten führen nicht zu einer teilweisen Übernahme. Technische Feldschlüssel wie "netFather" werden bei Importfehlern in sinnvolle deutsche Bezeichnungen übersetzt. Parse-Fehler zeigen keine rohen JavaScript-Parserfragmente. Fehler- und Erfolgsmeldungen sind außerdem über einen persistenten sichtbaren Status lesbar. Der bestehende Dialog bei Fehlern bleibt aus Gründen der Abwärtskompatibilität erhalten.

Die optionale, unverschlüsselte lokale Speicherung wird durch Import **nicht aktiviert**. Der vorhandene Lösch- und Speicherstatus wird nicht beschönigt. Heruntergeladene Dateien liegen weiterhin außerhalb der Browserkopie und müssen bei Bedarf separat gelöscht werden. Die Importgrenze beträgt unverändert 1 MB; JSON-Schema 1 und die mathematischen Regeln bleiben unverändert.

## Technische Umsetzung

- src/v38-quickstart.html, src/v38-quickstart.css und src/v38-quickstart.js als führende Quellen; npm run quickstart:sync überträgt sie in index.html.
- index.html: Import-Erklärung und sichere Fehlermeldungszuordnung.
- tests/e2e/p2-income-import.spec.mjs: echte Chromium-Datei-/UI-Prüfung aller drei Elterngeld-Netto-Entscheidungen, fehlende Wahl und unveränderten Plan, Import/Rückimport und negative Werte, ungültige JSON-Datei, übergroße Datei, Verhalten nach Import sowie Entwurfsstatus bei Vorlagenwechsel.
- Bereits abgeschlossene gezielte Chromium-Abnahme am Arbeitsstand: **10/10 bestanden**, einschließlich 320/390-Pixel-Ansichten und WCAG-/Fokusprüfung des neuen Auswahlfeldes. Zusätzlich erfolgt eine JSON-Exportprüfung nach der Entscheidung. Die vollständige Suite und CI werden gesondert nachgewiesen; ein grüner Teiltest ist nicht die vollständige Abnahme.

## Unverändert gesperrte Freigabekriterien

Das BEEG-/Mutterschutz-Problem 14./15.07. (4/30 gegenüber 5/30) ist weiterhin offen. Keine qualifizierte unabhängige Familienfallprüfung von zehn Fällen; keine moderierten realen Nutzer-/manuellen Screenreaderprüfungen. Auch Datenschutz-, Betreiber-, Rechts- und endgültige Produktfreigaben fehlen. 2027 bleibt rechtlich ungeprüft; kein Auszahlungsversprechen.

Die GitHub-Pages-Seite ist eine **öffentliche Testvorschau nur mit synthetischen Angaben**. Änderungen an main aktualisieren sie nicht automatisch. Der separat manuell bestätigte Test-Pages-Workflow und sein SHA-Readback bleiben erforderlich. Ein öffentliches Produktdeployment ist weiterhin verboten, bis release:check nach echten Freigaben erfolgreich ist.
