# Familienstart: Informationsportal V3.10

Stand: **16. Oktober 2026**. Technischer und redaktioneller Umsetzungsstand, keine öffentliche Freigabe.

## Ziel und Einstieg

`start.html` ergänzt den vorhandenen Elternzeit-Zielplaner um eine eigenständige, kleine Informationswebseite für werdende Eltern. Sie bündelt Orientierung in der Schwangerschaft, organisatorische Schritte vor der Geburt, Hilfen in der ersten Zeit und passende öffentliche Beratungsangebote. Der bestehende Rechner bleibt unverändert unter `index.html` erreichbar; seine Dateistruktur und bestehende Direktlinks werden nicht ersetzt.

Die Startseite folgt einer bewussten Reihenfolge:

1. Verständlicher Einstieg mit unmittelbarem Rechnerzugang.
2. Sechs kurze Hinweise, nach drei Lebensphasen filterbar.
3. Vorstellung des Rechners mit transparentem Standardfall und Schätzungsgrenzen.
4. Öffentliche Beratung und Leistungsinformationen; eigener Abschnitt für NRW und Köln.
5. Direkt erreichbare Schwangerschaftsberatung für belastende Situationen.
6. Antworten zu Eingaben, Datenschutz, Offline-Nutzung und fachlichen Grenzen.
7. Datierter Quellenhinweis und ausdrücklicher Vorschau-/Freigabestatus.

Die grafischen Zeitbalken zeigen ausschließlich ein **Illustrationsschema**. Sie werden nicht als individuelle Berechnung oder Empfehlung ausgegeben. Keine erfundenen Erfahrungsberichte, Bewertungen, Partnerlogos oder Anbieterangaben.

## Gestaltung und Bedienung

Warme Creme-, Mint- und Pfirsichtöne treffen auf dunkles Petrol, eine große Serifenschrift in Überschriften und eine ruhige Systemschrift für Bedienelemente. Die eingebettete SVG-Illustration stellt eine Familie abstrahiert dar. Sie enthält Titel und Beschreibung und benötigt keine externen Bilddienste. Rechner-CTA und Beratung bleiben sprachlich klar unterscheidbar.

Die Layouts wechseln von drei zu zwei und schließlich einer Kartenspalte. Es gibt einen sichtbaren Tastaturfokus, einen Sprunglink, semantische Abschnitte, native aufklappbare FAQ sowie beschriftete Navigation. Der Filter ist eine Gruppe nativer Buttons mit `aria-pressed` und einer Live-Rückmeldung. Ohne JavaScript bleibt der gesamte redaktionelle Inhalt sichtbar; die dann funktionslose Filterleiste bleibt verborgen. Reduzierte Bewegung und Ausdruck werden berücksichtigt.

Die externe Verlinkung wird angekündigt. Externe Links verwenden HTTPS, `target="_blank"` und `rel="noopener noreferrer"`. Die lokalen Rechnerlinks verwenden relative Dateipfade. Die Telefonnummer des Hilfetelefons und 112 sind direkt anwählbar. Medizinische Sorgen werden an Hebamme oder Arztpraxis verwiesen, statt Diagnosen oder Therapievorschläge zu erzeugen.

## Tatsächlich geprüfte Primärquellen

Prüfung am **16.10.2026**, HTTP-Abfragen mit Python `urllib.request`, Seiteninhalte ohne Skripte/Stile als Text gelesen. Erreichbarkeit bedeutet keine Garantie zukünftiger Verfügbarkeit und keine pauschale fachliche Validierung aller Unterseiten.

| Quelle | Tatsächlich abgerufene Zielseite | Ergebnis und verwendete Aussage |
| --- | --- | --- |
| Familienportal des Bundes | https://familienportal.de/familienportal/lebenslagen/schwangerschaft-geburt | HTTP 200; thematischer Einstieg Schwangerschaft, Geburt, Leistungen und Organisation. Keine Beträge oder Fristen daraus übernommen. |
| BIÖG, familienplanung.de | https://www.familienplanung.de/schwangerschaft/ | HTTP 200; Orientierung zur Schwangerschaft. Keine medizinische Einzelregel übernommen. |
| BIÖG, Beratungsstellensuche | https://www.familienplanung.de/beratung/beratungsstelle-finden/ | HTTP 200; Suche nach persönlichen Beratungsstellen. Keine pauschale Verfügbarkeitsgarantie. |
| Netzwerk Gesund ins Leben / BZfE | https://www.gesund-ins-leben.de/fuer-familien/fit-durch-die-schwangerschaft/ | HTTP 200; Seite enthält die Themen Ernährung, Supplemente, Alkohol/Rauchen/Medikamente sowie Sport und Bewegung. Der frühere Einstieg `/fuer-familien/schwangerschaft/` leitet hierhin um; Startseite verwendet direkt das Ziel. Keine Dosierungen oder individuellen Ernährungsanweisungen übernommen. |
| Nationales Zentrum Frühe Hilfen | https://www.elternsein.info/fruehe-hilfen/was-sind-fruehe-hilfen/ | HTTP 200; explizit: freiwillig, kostenlos, für Familien mit Babys/Kleinkindern bis drei Jahre, Unterstützung bereits ab Schwangerschaft. Über diese belegte Einordnung hinaus keine Zusage örtlicher Angebote. |
| BIÖG, kindergesundheit-info.de | https://www.kindergesundheit-info.de/themen/entwicklung/ | HTTP 200; fachlicher Einstieg zur kindlichen Entwicklung. Keine Entwicklungsdiagnostik auf eigener Seite. |
| Hilfetelefon Schwangere in Not | https://www.hilfetelefon-schwangere.de/ | HTTP 200; Seitenvolltext bestätigt **0800 40 40 020**, anonym, kostenlos und rund um die Uhr. Website weist selbst auf mögliche Wartezeiten hin; unsere Seite garantiert daher keine sofortige Gesprächsannahme. |
| Familienportal NRW | https://www.familienportal.nrw/de | HTTP 200; Landesinformationen. Stammdomain leitet auf `/de` um; direkter Zielpfad verwendet. Keine regionale Leistung in Haushaltszahlen eingerechnet. |
| Stadt Köln | https://www.stadt-koeln.de/leben-in-koeln/familie-kinder/ | HTTP 200; städtischer Themenbereich mit Familienberatung, Familienbildung, Elterngeld, Kindergeld und Hilfen. Kein konkreter freier Beratungsplatz behauptet. |

Ein probeweise geprüfter älterer Kölner Servicepfad `/service/produkte/00408/index.html` lieferte **410 Gone** und wurde ausdrücklich **nicht** übernommen. Die Verlinkung nutzt den aktuell erreichbaren städtischen Familieneinstieg.

Die redaktionellen Tipps „Unterlagen sammeln“, „Unterstützung für Einkauf/Essen besprechen“ und „mehrere Budgetmodelle vergleichen“ sind praktische Organisationsvorschläge. Sie behaupten weder eine gesetzliche Pflicht noch individuelle gesundheitliche Wirkung. Die Seite veröffentlicht keine neuen Rechtsberechnungen und übernimmt keine ungeprüften Leistungshöhen für 2027.

## Datenschutz und Offline-Verteilung

Die Startseite lädt weder externe Schriftarten noch Bilder, Skripte, Frames oder Analysewerkzeuge. Es gibt keine Formulare, Cookies, Netzwerkaufrufe per JavaScript oder Nutzung von Web Storage. Die Phase wird nur im flüchtigen DOM gewählt und beim erneuten Laden zurückgesetzt. Gesundheitsdaten werden nicht abgefragt.

`start.html` und `index.html` bleiben gemeinsam im selben Verzeichnis; beide können über `file://` geöffnet werden. Die Startseite selbst benötigt keine weiteren Dateien. Externe Beratungsseiten benötigen Internet. Beim Besuch externer Angebote gelten deren Datenverarbeitung und Datenschutzhinweise; ihre Funktionen sind nicht in die lokale Seite eingebettet. Beim späteren Webhosting sind mögliche Serverprotokolle unabhängig von dieser lokalen Implementierung zu prüfen.

Der Text beschreibt ausdrücklich keine vollständige Datenschutzfreigabe. Betreiberangaben und ein erforderliches Impressum können nicht erfunden werden; sie sind vor einer öffentlichen Veröffentlichung verbindlich zu ergänzen. Öffentliche Freigabe bleibt zusätzlich von den bestehenden unabhängigen Fach-, Rechts-, Datenschutz- und Nutzerprüfungen abhängig.

## Automatisierte Prüfung

`node --test tests/v310-portal.test.mjs`: **5/5 bestanden**.

Die Regressionstests prüfen sinnvolle Produktzusagen: lokale Rechnernavigation und Sprungziele, funktionierenden Phasenwechsel mit korrekter Ergebnisanzahl, vollständig verfügbare Tipps ohne JavaScript, fehlende externe Ressourcen/Formulardatenerfassung, sichere Links zu den kuratierten Quellendomains sowie transparente Quellen- und Freigabehinweise. Sie ersetzen keine Browser- oder Inhaltsprüfung.

Desktop-/Mobile-Browserprüfung, echte Klicks, file://-Netzwerkprüfung und Axe-Prüfung werden im übergreifenden V3.10-QA-Bericht dokumentiert; dieses Dokument behauptet deren Ergebnis nicht vorab. Das Portal enthält keine erfundenen Nutzertestergebnisse. Ob die neue Seite die Orientierung tatsächlich verbessert, muss mit werdenden Eltern beobachtet werden.

## Bewusste nächste Erweiterungen

- Nach Freigabe echte Betreiber-/Kontaktangaben und Datenschutztexte einbinden.
- Im Nutzertest Orientierung, Verständnis der Eingaben und Übergang zum Rechner prüfen.
- Beratungslinks regelmäßig auf Erreichbarkeit und thematische Passung kontrollieren; einen neuen Quellencheck nicht aus einem unveränderten Datum ableiten.
- Regionale Spezialisierung über verifizierte Behördeninformationen ausbauen; keine unbestätigten Förderbeträge addieren.
- Kalender-/Checklistenangebote erst mit klarer Datensparsamkeit und fachlich geprüften Fristen ergänzen.
