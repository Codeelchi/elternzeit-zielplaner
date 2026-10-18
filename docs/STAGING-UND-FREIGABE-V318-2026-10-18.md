# V3.18: Private Staging- und Freigabevorbereitung (18.10.2026)

**Status: interne technische Vorbereitung, ausdrücklich kein öffentlicher Release.** Baseline: PR #21, main `7f9d65c3f6c0477648ba5a1517bf16374ad17492`; Version 3.10.0, JSON-Schema 1. Keine Zustimmung einer Fachperson, einer Testperson oder eines Betreibers wird durch dieses Dokument ersetzt.

## Reproduzierbare private Bereitstellung

1. Aus dem geprüften Commit: `npm ci --ignore-scripts --no-audit --no-fund`, `npm test`, `npm run test:e2e`, `npm run staging:build`.
2. `npm run staging:check` vergleicht Dateien, CSP-Hashes und lokale Sicherheitsvorgaben. Der Build legt unveränderte Offline-Dateien in `dist/staging/` ab, die nicht eingecheckt werden.
3. Ausschließlich intern und nur in einer abgesicherten Testumgebung: `docker compose -f deploy/staging/compose.yaml up --build -d`. Der Dienst bindet **nur** `127.0.0.1:8768` und verwendet keine Cloud-Datenbank. Ohne Docker ist dies eine **Bereitstellungsanleitung**, keine bereits gestartete Staging-URL. Host-Firewall und Container-Policies separat kontrollieren.
4. Prüfen: `curl -I http://127.0.0.1:8768/index.html` und `/start.html` mit Headern; `curl -i http://127.0.0.1:8768/healthz`; unbekannte Pfade -> 404, POST -> verweigert. Chromium im **frischen Profil** mit leerem Storage gegen die loopback-Adresse, sowie direkt über `file://` testen. Netzwerk-Requests/Console, mobile 320/375/768/1280 Pixel, Tastatur, Accessibility, JSON/CSV, Offline und Löschung prüfen.
5. Kein öffentlicher Proxy, keine DNS-Veröffentlichung, keine echte Familienfinanzdaten in Staging. Ein späterer privater Zugriff braucht VPN oder Zugriffskontrolle vor dem Origin, TLS und einen separaten Test der Proxy-Header. Reverse-Proxy-Logs können selbst dann personenbezogene IP-Adressen enthalten.
6. Rollback: Bei kritischem Befund den Staging-Dienst sofort stoppen (`docker compose -f deploy/staging/compose.yaml down`), zum zuletzt geprüften Git-Commit zurückwechseln, `npm ci` und Build neu ausführen. Ein öffentlicher Rollback ist nicht nötig, da kein öffentlicher Dienst freigegeben ist.

**Security-Konfiguration:** `no-store`, deaktivierte Access-Logs im Origin, Referrer-Policy no-referrer, nosniff, X-Frame-Options DENY, CORP same-origin, restriktive Permissions Policy, CSP mit exakten Script-Hashes und `connect-src 'none'`, keine Fremdressourcen. Wegen der bestehenden umfangreichen Inline-Styles wird `style-src 'unsafe-inline'` benötigt; vor einem anspruchsvolleren Produktions-CSP sollten Styles ausgelagert werden. Skript-Hashes wechseln bei jeder Änderung am HTML; stets neu bauen. Dockerfile verwendet einen Versions-Tag statt eines vorab verifizierten Image-Digests: Digest-Pinning, Image-Scan, Laufzeittest und TLS-Proxy-Abnahme sind vor Deployment offen.

## Technischer Datenschutzbefund – Umfang und Grenzen

- `index.html` und `start.html` sind lokal ausführbare Einzeldateien; keine Accounts, Tracker oder absichtlichen API-Aufrufe. `scripts/privacy-technical-check.mjs` prüft diese Eigenschaften statisch; Browser-Netzwerk- und Offlinefälle gehören zum E2E-Satz. Das beweist **nicht**, dass Erweiterungen, Browserdienste, Hosts oder Reverse-Proxys niemals Daten übertragen.
- Der Plan verbleibt ohne Speicher-Opt-in im Arbeitsspeicher; mit Opt-in wird Browser-`localStorage` **unverschlüsselt** verwendet. Auf geteilten Geräten nicht einschalten. `deleteLocalData` löscht die vorgesehenen App-Keys aus diesem Origin, nicht sämtliche Kopien/Browser-Backups. Ein offener Tab hält den aktuellen Plan weiter im Speicher. Exportierte JSON-/CSV-Dateien bleiben bis zur eigenen Dateilöschung auf dem Gerät.
- Manipulierte Importdateien: 1 MB-Grenze, Schema-/Typprüfung, whitelisted Monatscodes inklusive Schutz vor Prototyp-Vererbung, begleitende Validierung und keine Übernahme importierter angeblicher Freigaben. Bedrohungen: Gerätekompromittierung, manipulierte Browserumgebung, gespeicherte Exporte und physische Einsicht. Weitere Fuzzing-/Security-Reviews bleiben sinnvoll.
- Verantwortliche Stelle, Betriebsform, Impressum nach § 5 DDG (falls einschlägig), Art.-13-DSGVO-Informationen für **tatsächlich** anfallende Webserver-/Proxy-Logs und Anfragen, Lösch-/Aufbewahrungsregeln, Kontakt, Sicherheitsupdates und Auskunftsprozess sind **nicht entschieden**. Keine vorgetäuschte vollständige Datenschutzerklärung. Bei rein lokaler Nutzung fallen andere Betreiberpflichten an als beim öffentlichen Hosting; durch fachkundige Stelle entscheiden lassen.

## P0-Eigentümer und Freigabekriterien

| P0 | Technischer Stand | Offener Nachweis / verantwortliche Rolle | Restrisiko |
| --- | --- | --- | --- |
| A Mutterschutz | Frist und Leistungsanrechnung getrennt modelliert, 4/5-Konflikt ausdrücklich dokumentiert | Schriftliche Interpretation für Geburt 20.05. inkl. MuSchG §3, BGB §§187–188, SGB V §24i und BEEG sowie Richtlinien, zuständige Elterngeld-/Mutterschutz-Fachstelle | Falsche Resttage/Leistung |
| B zehn Referenzfamilien | SHA-gebundene Inbox, derzeit **0/10** unabhängig bestätigt | Zehn unabhängige vollständige Sollrechnungen und qualifizierte Reviewentscheidung, externe Elterngeld-Fachperson | Abweichung bei Netto, Teilzeit, Rundung, Bonus |
| C unterstützter Standardfall | Technische Grenze 01.04.2025–31.12.2026; 2027 als Prognose/nicht unterstützt | Rechtsstand, Kohorten, Sonderfälle und Ausschlüsse signiert beurteilen, externe Fachperson und Regelpflege-Verantwortliche | Fehlanwendung bei Sonderfällen/Gesetzeswechsel |
| D Datenschutz/Security | Offline-/Opt-in- und Importkontrollen; private Staging-Dateien mit Header-Vorlage | Laufender Host-/Container-/Proxy-Security-Test, DSB/Jurist, festgelegter Betreiber, Impressum und DSGVO-Informationen | Datenabfluss, Betreiberpflichten |
| E UX/Barrierefreiheit | Acht synthetische Übungen, automatisierte Checks; **0 beobachtete Personen** | Moderierte echte Nutzertests, manuelle NVDA/VoiceOver- und Tastaturprüfung, unabhängige Testleitung | Fehlverständnis von Budget vs. Anspruch |
| Betrieb/Release | `npm run release:check` absichtlich BLOCKED | Betreiber bestimmt Support/Fehlerkanal, dokumentiert Regelpflege, Incident/Recall/Abnahmedatum und gibt separat ausdrücklich frei | Unkontrollierte veraltete Regeln |

## Aktuelle amtliche Prüfpfade (keine eigenständige Auslegung)

- https://www.gesetze-im-internet.de/muschg_2018/__3.html
- https://www.gesetze-im-internet.de/bgb/__187.html und https://www.gesetze-im-internet.de/bgb/__188.html
- https://www.gesetze-im-internet.de/sgb_5/__24i.html
- https://www.gesetze-im-internet.de/beeg/__3.html und https://www.gesetze-im-internet.de/beeg/__4.html
- https://familienportal.de/familienportal/familienleistungen/elterngeld/faq/kann-ich-elterngeld-und-mutterschaftsleistungen-bekommen--124776

**Gezielte schriftliche Fachfrage:** Bei Entbindung am 20.05.2026 zum erwarteten Termin und regulärer Achtwochenfrist: Was sind nach MuSchG §3, BGB §§187–188, SGB V §24i, BEEG und den einschlägigen Richtlinien *jeweils* der letzte Schutzfristtag, der letzte Mutterschaftsgeld-/Arbeitgeberzuschusstag und der erste Tag eines anteiligen Elterngeldanspruchs in LM 2 (20.06.–19.07.)? Warum nennt das Bundesfamilienportal den 14.07./5 Tage, während eine Frist-Herleitung den 15.07./4 Tage ergibt? Bitte Rechtsfassung, Berechnung und verbindliche Quelle schriftlich beifügen. Bis dahin **keine Freigabe**.

## Unveränderte Freigabegrenze

`data/release-gates.json` darf nicht durch Codegenerierung oder Tests freigegeben werden. `npm run release:check` **muss** scheitern, solange externe Nachweise fehlen. Der Betreiber entscheidet später über eine Veröffentlichung, niemals dieser technische Staging-Build.

## Tatsächlicher technischer Lauf 18.10.2026

- `npm test`: **496/496 PASS**, einschließlich neuem Staging-Integritätstest.
- `npm run sources:check`, `roadmap:check`, `privacy:technical-check`, `independent-evidence:check`, `usability:check`, `staging:check` und `git diff --check`: **PASS**.
- `npm run release:check`: **BLOCKED wie gefordert** (Review- und Betreiber-Gates pending, amtlicher Abgleich nicht bestanden).
- `npm run test:e2e`: zuerst Port 8765 belegt; mit Port 8879 konnte der Test-Server starten, aber **alle 63 Browserfälle bereits beim Chromium-Start blockiert**, weil `/opt/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-linux64/chrome-headless-shell` fehlte. Installationsversuch `npx playwright install chromium` erreichte das Zeitlimit; **kein Browser-PASS für V3.18**. Frühere 63/63 von PR #21 sind historisch und gelten nicht als erneute Abnahme. Direkte neue `file://`-Chromiumprüfung ebenfalls nicht erfolgt. Hier muss ein Browser-Runner nachgerüstet und der vollständige E2E-/file://-Lauf wiederholt werden.
- `npm audit --omit=dev --audit-level=high`: **0 berichtete Produktionsabhängigkeits-Schwachstellen**, aber keine vollständige Auditierung aller Entwicklungsabhängigkeiten oder Images.
- Container/Reverse-Proxy und echter frischer Browser-Storage-Test: **nicht verifiziert**. Keine Staging-URL behauptet.
