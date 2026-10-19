# GitHub Pages – öffentliche Testvorschau (18.10.2026)

**Statusnachtrag 19.10.2026:** Der GitHub-Pages-Abruf zeigt noch den **alten Vorschau-Commit \`ee2bb2dfe683a29392502a2bb8976e2d8014f226\`** (Deployment-Lauf \`39146755107\`). Der letzte integrierte Funktions-\`main\` ist bereits **\`3c837cbf47fe818a94157202a2b5699d7e697212\`** (PR #30). Die Preview enthält daher **noch nicht alle P1/P2-Verbesserungen**, obwohl sie im Repo und der Main-CI bestanden haben. Nur ein bestätigter manueller GitHub-Pages-Workflow erzeugt und verifiziert den aktuellen Teststand. Sein Start ist über den verbundenen PAT mit HTTP 403 fehlgeschlagen; **durch den Betreiber über die GitHub-Oberfläche auszulösen**. Keine Freigabe oder Redeploy-Automatik setzen. [Eindeutiger Projekt-/Freigabestatus](STATUS-TECHNISCH-2026-10-19.md).


## Ziel und Abgrenzung

Diese Bereitstellung dient ausschließlich einem **öffentlich erreichbaren Funktionstest mit fiktiven Beispieldaten**. Sie ist ausdrücklich **keine** Produktveröffentlichung oder fachliche, rechtliche oder datenschutzrechtliche Freigabe. Das private Repository bleibt privat, **die GitHub-Pages-Website ist dennoch weltweit öffentlich abrufbar**. Der aktuelle Standardfall ist nicht unabhängig fachlich geprüft; der Mutterschutz-Konflikt 4/30 versus 5/30 ist offen.

GitHub Pages speichert Besucher-IP-Adressen für Sicherheitszwecke. Auf der Website werden keine Benutzerkonten, Tracker oder Cloud-Datenspeicherung hinzugefügt. Browser-Storage bleibt optional und unverschlüsselt. Für persönliche Einkommens-, Konto- oder Gesundheitsdaten ist diese Testvorschau **nicht** freigegeben.

## Eingeschränkter Veröffentlichungsumfang

scripts/pages-preview-build.mjs erzeugt aus den unveränderten, offlinefähigen Originalseiten ein gesondertes Artefakt unter dist/pages-preview/. Öffentlich gehen **nur**:

- index.html – Planer mit eingeblendeter Warnung „ÖFFENTLICHE TESTVORSCHAU“
- start.html – Infoseite mit derselben Warnung
- robots.txt und .nojekyll – technische Hilfsdateien

Nicht übertragen werden private Repo-Inhalte, Datenmatrizen, Testfall-Dateien, Git-Informationen, interne Dokumente, Releases, API-Tokens oder Logs. JavaScript stammt ausschließlich aus den eingebetteten HTML-Dateien. Beide Pages-Dateien erhalten eine restriktive **Meta-CSP** mit SHA-256 des jeweiligen Inline-Skripts, connect-src 'none', Noindex-Metatag und unübersehbarem Warnhinweis. Auf GitHub Pages können wir HTTP-Sicherheitsheader nicht frei festlegen; Meta-CSP ersetzt z. B. frame-ancestors nicht. Das ist ausdrücklich eine Test- und keine Security-Produktivabnahme.

Die Seiten funktionieren weiterhin mit relativen Links unter dem Projektpfad /elternzeit-zielplaner/.

## Aktivierung und manueller Testlauf

1. **Voraussetzung:** Ein GitHub-Tarif, der Pages für **private Repositories** erlaubt (GitHub Pro/Team/Enterprise; mit GitHub Free muss ein Repository öffentlich sein). **Das Repository nicht öffentlich schalten.**
2. GitHub öffnen: https://github.com/Codeelchi/elternzeit-zielplaner/settings/pages
3. Unter „Build and deployment“ → „Source“ den Eintrag **GitHub Actions** auswählen.
4. Dann auf https://github.com/Codeelchi/elternzeit-zielplaner/actions/workflows/pages-test-preview.yml den Workflow **Run workflow** mit Branch main und expliziter Bestätigung confirm_public_preview=true starten.
5. Nur ein vollständig erfolgreicher Lauf bedeutet Deployment. Die erwartete Projekt-URL ist **https://codeelchi.github.io/elternzeit-zielplaner/**, muss aber *tatsächlich* über GitHub Pages/HTTP geprüft werden. Sie ist nicht allein durch diese Anleitung aktiv.
6. Mit **fiktiven** Beispielwerten die Ansichten, mobile Navigation und JSON-/CSV-Exporte prüfen; auf dem persönlichen Gerät ggf. Browserkopien und Downloads nach dem Test löschen.

Die GitHub Actions-Datei .github/workflows/pages-test-preview.yml ist **manuell** auslösbar und auf main begrenzt. Vor dem Deploy muss die technische Mindestprüfung bestehen (Quellen, Roadmap, statische Datenschutzregeln, whitelist-basierter Pages-Build und Chromium-Smoketest). Zusätzlich muss npm run release:check **weiterhin blockieren**. Das ist beabsichtigt: Die öffentlich testbare Vorschau **ist nicht** der Produktauslieferungspfad. Automatisches Deployment bei jedem Commit findet nicht statt.

## Rücknahme

Der Betreiber kann GitHub Pages unter Repository → **Settings → Pages** deaktivieren. Das ist ein öffentlicher Site-Schalter; nur den Test-Workflow zu entfernen beendet eine bestehende Pages-Auslieferung nicht zwangsläufig. Für die spätere endgültige Veröffentlichung bleiben eigene Betreiber-, Fach-, Rechts-, Datenschutz- und Nutzertest-Freigaben nötig. Es wurde kein solches Gate auf „approved“ gesetzt.

## Prüfung

- npm run pages:check – unveränderte Quellen, Whitelist, Bannereinbau, Noindex, CSP und HTML-Hashes.
- npm run test:e2e -- tests/e2e/pages-preview.spec.mjs – reale Chromiumprüfung im GitHub-Pages-Unterpfad, sichtbar erklärter Teststatus, Smartphone-Darstellung, keine Fremdrequests, lokal geöffnetes Preview und Offline-Neuladen.
- npm run release:check – bleibt bei fehlenden unabhängigen Freigaben absichtlich **NO-GO**.

**Wichtig:** Kein passwortgeschütztes Pages für ein persönliches Repository. Das Noindex-Metatag ist kein Zugriffsschutz. Falls GitHub die Pages-Administration wegen fehlender Tokenberechtigungen zurückweist, ist der manuelle Schritt unter Settings → Pages erforderlich.

## Pages-Testseiten-Review: nachvollziehbarer Build und synthetische Daten

Die nächste **manuell ausgelöste** öffentliche Pages-Testvorschau zeigt nun die Paketversion 3.10.0, den getrennten Stand der Rechtsquellen (15.10.2026), den exakten Git-Commit samt Link und – im GitHub-Workflow – die Ausführungs-ID. Historische V3.15/V3.16-Modulnamen werden getrennt erklärt. Alle Eingabe-, Zeitachsen-/Buchungs- und Ergebnisansichten verweisen in dieser Vorschau ausdrücklich auf **ausschließlich synthetische Testdaten**. Die Original-Offline-Quellen bleiben unverändert; JSON-Schema 1 und Rechenlogik ebenfalls. Die NRW-KomNet-Fachauskunft stärkt die eigenständige Schutzfrist-Herleitung, **löst die 4/5-Tage-Anrechnung nicht abschließend**. P0-A/B/D/E und Betreiberfreigabe bleiben offen. Die Vorschau wird nicht automatisch beim Merge veröffentlicht. [Externer Review-Abgleich, Prüfergebnisse und Rollout-Grenzen](PAGES-REVIEW-ABGLEICH-2026-10-18.md).

## P1 UX: synthetische Vorschau, Feldfehler und letzte gültige Ergebnisse

Die öffentliche GitHub-Pages-Testvorschau verwendet nun in zusätzlichen statischen und dynamischen Bereichen ausschließlich synthetische Finanz- und Familienangaben; auch die Infoseite erklärt das explizit. Die Vorschau startet mit einem fiktiven Datum 28.05.2026, während die lokale Offline-Fassung ihre bisherige Voreinstellung behält. Negative/ungültige Einnahmen, Datumsangaben sowie Wochenstunden über 40 werden vor Übernahme in die Modellberechnung abgewiesen (feldnahe zugängliche Fehler). Ein noch nicht berechneter oder ungültiger Schnellstart kennzeichnet das bisherige Ergebnis als letzten gültigen Entwurf. Bewusst eingetragene 0 bleibt verschieden von unbekanntem/leerem Betrag. Rechenformeln und JSON-Schema 1 bleiben bestehen.

Fachprüfungen 4/30 gegen 5/30, unabhängige Referenzfälle (0/10), manuelle Screenreader-/Nutzertests und Rechts-/DSGVO-/Betreiberfreigaben bleiben **offen**. Ein Merge aktualisiert die GitHub-Pages-Testvorschau nicht automatisch; der betreiberseitig bestätigte manuelle Pages-Workflow ist weiterhin erforderlich. [Implementierung und Testgrenzen](P1-UX-VALIDIERUNG-2026-10-18.md).

## P2 – Herkunft des Elterngeld-Netto und verständlicherer JSON-Import

Bei Änderung des Schnellstart-Auszahlungsnettos und schon vorhandenen manuellen/importierten Elterngeld-Netto-Fachwerten verlangt die Anwendung nun eine ausdrückliche Wahl: **beibehalten, unverbindlich neu schätzen oder als unbekannt leeren**. Ohne Wahl bleibt der alte Berechnungszustand erhalten. Die Ergebnisübersicht nennt die Herkunft je Elternteil ausdrücklich ohne amtlichen Prüfclaim. Schätzungen, leer/unbekannt und 0 € bleiben unterscheidbar. Das JSON-Schema 1 sowie die rechtlichen Formeln bleiben unverändert. Der Import erklärt vorab, welche temporären Szenarien nicht exportiert werden, zeigt feldbezogene deutsche Fehlermeldungen statt roher Parser-/Datenschlüsseltexte, erhält auf Fehlern den vorherigen Plan und aktiviert nie ungefragt die Browserspeicherung. Die bekannten fachlichen und rechtlichen Release-Gates bleiben offen; die öffentliche GitHub-Pages-Testvorschau ist weiterhin manuell freizugeben und nur für fiktive Eingaben gedacht. [Technischer Nachweis und Testgrenzen](P2-NETTO-HERKUNFT-IMPORT-2026-10-18.md).

## P2-Zielsuche: drei vergleichbare Modellkennzahlen und Laufzeit

Die bestehende Zielsuche zeigt nun je Vorschlag direkt dieselben drei Kennzahlen: Gesamtbudget realistisch, niedrigster Lebensmonat realistisch und Anfangsruecklage vorsichtig. Die vollstaendige Realistisch/Vorsichtig-Tabelle samt Engpassmonaten und Zielkonflikten ist weiterhin in aufklappbaren Details verfuegbar. Die Suchgrenzen und der fehlende globale Optimalitaetsnachweis bleiben sichtbar; angezeigte Betragswerte sind weder Bewilligungen noch Bankbuchungen. Der Suchlauf zeigt den Busy-Status, echten Fortschritt und die nur auf diesem Geraet beobachtete Laufzeit; Abbruch und Eingabeaenderungen uebernehmen nie ungefragt den Monatsplan. Ein separat startbarer, synthetischer file://-Chromium-Benchmark protokolliert getesteten HTML-SHA, Plattform, Browser und Wallzeit ohne Speicherung oder Netzwerk. Quellformeln, JSON-Schema und Release-Sperre bleiben unveraendert. Mutterschutz 4/5 Tage, 0/10 externe Referenzen, Nutzer-/Screenreader-/Datenschutz-/Rechts-/Betreiberfreigaben bleiben offen. GitHub Pages bleibt eine nur manuell ausgeloeste synthetische Testvorschau. [Vollstaendiger technischer Bericht](P2-ZIELSUCHE-VERGLEICH-2026-10-18.md).
