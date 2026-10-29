# KI-gestützter Einstieg in den Elternzeit-Zielplaner

Der Rechner bietet im Schnellstart eine kopierbare Anweisung für ChatGPT und andere Assistenten. Ein Assistent kann Angaben im Gespräch sammeln und einen JSON-Vorschlag erzeugen. Die App hat keine KI-Verbindung, keinen automatischen Datenaustausch und keine Agenten-API. Es wird kein Konto oder API-Schlüssel benötigt.

Die Nutzer entscheiden selbst, ob sie persönliche Daten mit einem externen Dienst teilen; zum Testen nur fiktive Daten verwenden. Es werden keine Unterlagen, Namen, Adressen oder Versicherungsnummern benötigt. Dienste und deren Datenschutzbedingungen können unterschiedlich sein.

## Ablauf

1. Rechner lokal öffnen und „Mit ChatGPT oder einem KI-Assistenten vorbereiten“ aufklappen.
2. Anweisung kopieren, in den gewünschten Assistenten einfügen und die Fragen beantworten. Unbekanntes bleibt unbekannt.
3. JSON-Antwort in den Rechner einfügen und „Vorschlag prüfen“ wählen. Die Vorschau zeigt alle konkret vorgeschlagenen Änderungen.
4. Erst „Geprüfte Angaben in Eingabefelder übernehmen“ ersetzt die genannten Felder. Unbekannte oder ausgelassene Felder bleiben unverändert. Danach alle Angaben prüfen und die Berechnung ausdrücklich selbst starten.

Die Übernahme verändert weder den berechneten Plan noch die Speichereinstellung. Bestehende Fachwerte und individuelle Monatspläne unterliegen den vorhandenen Schutzabfragen bei der Berechnung. Der Vorschlag ist keine Elterngeldberechnung, Fachprüfung, Bewilligung oder Rechtsauskunft. Elterngeld-Netto ist nicht mit Auszahlungsnetto gleichzusetzen. Die offenen Release-Gates gelten unverändert.

## Schnittstellenvertrag für Agenten

Ein JSON-Objekt mit `format: "elternzeit-ki-einstieg-v1"` und optionalen Schlüsseln `geburt` (ISO-Datum), `netto1`, `netto2`, `ausgaben` (Zahlen von 0 bis 100000 Euro) und `betreuung` (14, 18, 24, 30 oder 36) erstellen. Nicht bekannte Werte mit `null` kennzeichnen oder auslassen; sie überschreiben keine vorhandenen Angaben. Mindestens eine konkrete Angabe ist erforderlich. Null als Zahl ist eine bewusste Angabe und nicht unbekannt. Andere Schlüssel und ungültige Werte werden abgewiesen. Maximale Eingabegröße: 10000 Zeichen.

Das Format ist **kein Planexport** und ersetzt nicht das existierende JSON-Importschema 1. Eine direkte Tool-/MCP-Anbindung oder automatische Ausfüllung durch ChatGPT ist damit noch nicht implementiert. Für diese wären eine gesonderte Schnittstelle, Berechtigungskonzept und Prüfungen nötig.

## Weitere Bedienung

In der Familienzeitübersicht wechseln die Monatstasten den ausgewählten Lebensmonat und damit auch die vorhandene Detailansicht. Auf kleinen Bildschirmen erscheint die Monatskarte vor der horizontalen Tabelle; der Variantenvergleich zeigt dieselben Modellkennzahlen als Karten. Die gewählte Monatsansicht ändert keine Planannahmen. Der Schnellstart erklärt ausdrücklich, dass Elternteil 2 im bestehenden Modell der gebärende Elternteil ist.
