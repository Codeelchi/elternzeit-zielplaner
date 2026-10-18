# V3.19 – Browser-Speicher, Löschung und technische Release-Gates

**Stand 18.10.2026.** Technischer Entwicklungsnachweis für den internen Familien-Szenario- und Budgetplaner. **Keine DSGVO-, Fach- oder Veröffentlichungsfreigabe.** Paketversion 3.10.0, JSON-Importschema 1 unverändert.

## Prüfgegenstand und konkret behobener Fehler

Browser-localStorage kann durch private Browsermodi, lokale file://-Richtlinien, Browser-Erweiterungen oder Unternehmensrichtlinien den Zugriff verweigern. Bisher konnte ein abgelehntes setItem die Speichern-Checkbox aktiv lassen. Ein abgelehntes removeItem warf beim Löschen eine unbehandelte Ausnahme und unterbrach teilweise den Import oder den vollständigen Reset. Die Oberfläche durfte deshalb den Erfolg dieser Operationen nicht annehmen.

**Neues technisches Verhalten:**

- Speicher-Opt-in ist erst praktisch nutzbar, wenn setItem erfolgreich war. Bei Fehlern wird es sofort deaktiviert, die Checkbox zurückgesetzt und eine dauerhafte, mit role="status" für Screenreader erkennbare Warnung angezeigt. Eine ältere Kopie wird ausdrücklich als möglich erwähnt.
- Die Löschfunktion entfernt gezielt die drei Anwendungsschlüssel (elternzeit-familienplan-v1/v2/v3) und prüft anschließend per getItem, ob alle fehlen. Nur wenn alle Prüfungen erfolgreich sind, meldet die App eine erfolgreiche Löschung. **Bei Ausnahmen oder nicht bestätigter Entfernung wird kein Löscherfolg behauptet.**
- Zurücksetzen verwirft den aktuellen Arbeitsplan und die flüchtigen Szenario-/Lernstände **auch dann**, wenn eine alte Browserkopie nicht gelöscht werden kann. Die Warnung zu dieser Kopie bleibt sichtbar.
- Ein gültiger JSON-Import bleibt auch bei gesperrtem Browser-Speicher als reine Sitzung möglich. Beim gescheiterten Löschen vorheriger Browserkopien benennt die UI dieses Risiko ausdrücklich. Importe behaupten keine Betreiber- oder Fachfreigabe; das JSON-Schema bleibt 1.
- Eine beschädigte oder nicht lesbare gespeicherte Kopie wird nicht als erfolgreich wiederhergestellt ausgegeben.
- Auf mobilen Geräten erscheint die Speicherwarnung **außerhalb des zugeklappten Datenschutz-Panels** und bleibt daher auch nach dem Schließen des Panels sichtbar.

## Prüfung und Negativfälle

- tests/storage-denial.test.mjs: vier DOM-Tests gegen blockiertes setItem, blockiertes removeItem, vollständigen Arbeitsplan-Reset und beschädigte Kopien. **Keine simulierte externe Datenschutzfreigabe.**
- tests/e2e/v319-storage-privacy.spec.mjs: reale Chromiumfälle mit file://, HTTP, 320/390-px-Ansichten, Storage-Ausnahmen, Import-/Reset-Bedienung, Konsolenfehlern und Offline-Neuladen.
- scripts/privacy-technical-check.mjs: statische Netzwerk-/Opt-in-Kontrolle. Es ersetzt keine menschliche Datenschutzfolgenabschätzung und kein Browser-/Host-Sicherheitsaudit.
- npm run release:check bleibt absichtlich **BLOCKED**; data/release-gates.json und unabhängige Prüfbelege bleiben unverändert.

## CI-Zuverlässigkeit ohne abgeschwächte Qualität

Die bisherige GitHub-Actions-Testaufgabe führte zuerst eine mehrere Minuten lange Node-Suite und danach die umfangreiche Chromium-Matrix innerhalb **eines** 15-Minuten-Limits aus. V3.19 trennt die Arbeit in **parallele, vollständige** Jobs:

| Job | Aufgabe | Bestehende Prüftiefe |
| --- | --- | --- |
| node | npm test, inklusive Rechts-, Datenschutz-, Usability-, Releasevorbereitungs- und neuer Speicher-Regressionen | Unverändert + neue Tests |
| browser | Vollständiges npm run test:e2e inklusive realer file://-/mobil-/Accessibility-Fälle | Unverändert + neue Tests |
| staging | Build, echter privater Nginx-Docker-Lauf, Header-/CSP-/Hash-/Route-Sicherheit | Unverändert |
| test | Schlusskontrolle: abhängig von node, browser und staging; nur erfolgreich, wenn **alle drei** technische Jobs Erfolg melden | Fail-closed, schützt die vorhandene test-Statusprüfung |

Alle Jobs bleiben reine CI-Prüfungen. **Kein** öffentlicher Deploy-Befehl, kein Umgehen eines fehlenden Reviews. Wenn ein Job ausfällt, soll auch die Schlusskontrolle fehlschlagen. Der Gesamttest kann schneller abgeschlossen werden, ohne Tests auszublenden oder Zeitlimits pro Einzelfall zu erhöhen.

## Umgang mit einem gemeinsam genutzten Gerät

1. Im Abschnitt **Datenschutz & Speichern** zunächst die Browser-Speicheroption **ausgeschaltet** lassen. Die App arbeitet flüchtig ohne Konto.
2. Bei aktivierter lokaler Speicherung und geplanter Weitergabe des Geräts zuerst **Browserkopie löschen** verwenden und die Bestätigung beziehungsweise Warnung lesen.
3. Zusätzlich **Zurücksetzen** wählen, um Eingaben und Szenarien aus dem offenen Tab zu entfernen, oder den Tab schließen.
4. Bei Warnung **Löschen ... NICHT bestätigt** die Website-/Datei-Origin-Daten in den Browser-Einstellungen **selbst** löschen. Die Anwendung kann die Entfernung dann gerade **nicht garantieren**.
5. **JSON-/CSV-/ICS-Dateien**, Browser-Downloads, Screenshots, Backups und Browser-Synchronisierungen werden von der App nicht entfernt. Diese Kopien sind bei Bedarf **gesondert** zu löschen.

## Offene P0-Entscheidungen

- Ein echter unabhängiger DSGVO-/Betriebsform-Review, Impressum/Datenschutzhinweise, Betreiberidentität, Löschkonzept für eventuelle Webserver-/Proxy-Logs und ein Support-/Meldekanal fehlen weiterhin.
- Tatsächlich moderierte Nutzertests, manuelle Screenreader-Abnahme und Datenschutztests auf realen iOS-/Android-Geräten sind offen.
- 0/10 vollständige unabhängige Familienreferenzen; 4/30 vs. 5/30 Restelterngeld ungeklärt; 2027 beim Elterngeld nicht rechtsfreigegeben.
- Technische CI- und Browserergebnisse sowie PR-Merge-Commit müssen nach der Integration **am tatsächlichen Commit** aktualisiert werden. **Keine erfundenen Testpersonen, Signaturen oder Betreiberfreigaben.**

**Verantwortlich:** Technische Regression: Repository-Betreuer. Datenschutz-/Betriebsentscheidung: zu benennende verantwortliche Stelle und qualifizierte Datenschutz-/Rechtsprüfung. Fachliche Ansprüche: unabhängige Elterngeld-Fachstelle.
