# P1-Sprint: öffentliche Vorschau, Validierung und veraltete Ergebnisse

**Stand 18.10.2026 · technischer Entwicklungsnachweis, keine amtliche oder rechtliche Freigabe.**
Basis: main beim Sprintbeginn ee2bb2dfe683a29392502a2bb8976e2d8014f226. Der spätere PR-/Merge-Commit und ein Pages-Deployment müssen separat nachgewiesen werden.

## Aus externem Review reproduzierte Mängel

1. Öffentliche Vorschau fordert ausschließlich synthetische Daten, zeigte aber teilweise Aufrufe zu eigenen Werten, Bescheidübernahme und persönlichen Änderungen (auch dynamisch).
2. Negative Finanzwerte wurden teilweise still zu 0 geklemmt; 41 Wochenstunden konnten im Modell landen.
3. Fehlgeschlagener oder noch nicht abgeschickter Schnellstart ließ die letzten Ergebniswerte ohne Kennzeichnung stehen.
4. Vorschau-Startdatum 28.05.2027 liegt außerhalb der bestätigten Standardkohorte.

## Technische Korrekturen

**A. Fiktive Testwerte in der öffentlichen Vorschau:** Der whitelist-basierte Pages-Build ersetzt weitere statische Texte in index.html und start.html (Schnellstart, Fach-Einkommensprofil samt amtlichem Auswahltext, Elternbezeichnungen, Beispiele, Bankbuchungen, FAQ, Kosten). Dynamische Schnellstart-, Zielsuche-, Status- und Wissenskartenhinweise verwenden bei erkanntem Preview-Commit ebenfalls ausschließlich auf synthetische Daten bezogene Texte. Die Offline-Version bleibt vom Preview-Wording getrennt. Die vorhandene Testbanner/CSP/Commitbindung bleiben erhalten.

**B. Feldnahe Finanz- und Stundenvalidierung:** Editierte Daten aus data-field, numerischen data-extra und Monatsstunden werden vor Übernahme geprüft. Bei negativen, zu großen, nicht endlichen oder ungültigen Stundenwerten bleibt der zuletzt akzeptierte Zustand unverändert. Der Nutzer erhält eine konkrete Meldung am Feld, aria-invalid=true und eine zugeordnete aria-describedby-Fehlermeldung mit role=alert. Leere Einkommenswerte bleiben unbekannt statt still als 0 interpretiert zu werden; die bewusst eingegebene 0 bleibt 0. Stunden von 0 bis 40 sind als Arbeitseingabe möglich; die separate anspruchsbezogene Höchstgrenze 32 Stunden bleibt Sache der bestehenden Regelvalidierung. Positive Beträge dürfen Centanteile enthalten. Erfolgreicher Import und Reset löschen veraltete Feldwarnungen.

**C. Alte Ergebnisse werden kenntlich:** Ungültiger oder noch nicht eingereichter Schnellstart setzt eine sicht- und vorlesbare Warnung, dass die angezeigten Ergebnisse weiterhin zum letzten gültigen Plan gehören. Bei neuer gültiger Berechnung oder bewusstem Vorlagenwechsel wird nur die entsprechende Warnung aufgehoben; gleichzeitig bestehende Fachfeldfehler bleiben separat bestehen.

**D. Vorschau-Startdatum 2026:** Für GitHub Pages (Metatag preview-commit) startet ein ausdrücklich fiktives Beispiel mit 28.05.2026. Die lokale Offline-Fassung behält die bisherige Voreinstellung. Ein bewusst gewähltes Datum 2027 bleibt nicht unterstützt bzw. Prognose. Die Leistungsregeln, die berechneten Fachformeln und JSON-Schema 1 werden nicht verändert.

## Tests und Nachweisgrenzen

- Neue reale Chromium-Negativtests in tests/e2e/p1-preview-ux.spec.mjs decken Preview-Copy, fiktiven 2026-Start, 2027-Sperre, Eingabevalidierung, Stundenkorridor, Blank/Null, Datumsvalidierung, alte Ergebniswarnungen und Wiederherstellung ab.
- Die bestehenden Pages-Browser- und Build-Tests prüfen die Whitelist mit zwei HTML-Dateien, die Skriptintegrität und die Herkunftsangaben.
- Vollständige Node-/E2E-, Source-, Privacy-, Usability-, Staging-, Import-/Export- und Release-Sperrprüfungen müssen für den finalen Merge-Stand erneut ausgeführt und dokumentiert werden.

**Unverändert offen:** Mutterschutz 4/30 gegen 5/30 und externer Fachentscheid, 0/10 qualifizierte unabhängige Familienfälle, echte Nutzer- und Screenreaderprüfung, Betreiber-/Rechts-/Datenschutzfreigaben. Diese technischen Tests ersetzen keinerlei unabhängige Freigabe.

## Nicht in diesem Sprint abgenommen

Elterngeld-Netto-Herkunft bei manuell überschriebenen Feldern, internationale/behördliche Sonderfälle, persönliche Betreiberangaben, vollständige mobile Realgeräte- und manuelle Screenreaderprüfung, Performance der Zielsuche und amtliche 2027-Regelpflege.

GitHub Pages ist weiterhin eine **öffentliche, nicht amtliche Testvorschau**. Die Seite wird nur nach separat bestätigter manueller Workflow-Auslösung aktualisiert. Ein erfolgreicher Merge ist **kein automatisches Pages-Deployment**; release:check bleibt absichtlich NO-GO.
