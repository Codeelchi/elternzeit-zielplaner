# GitHub Pages – öffentliche Testvorschau (18.10.2026)

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
