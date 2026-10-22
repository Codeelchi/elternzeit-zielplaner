# Paket 3C – vorbereitete Nutzer- und Accessibility-Abnahme

**Status am 22.10.2026:** **NICHT DURCHGEFÜHRT / NO-GO**. Das folgende Protokoll ist eine ausfüllbare **Prüfanweisung**, kein fiktiver Prüfbericht. Niemand wurde durch diesen Entwicklungsauftrag als echter Nutzer oder unabhängiger fachlicher Reviewer getestet. Es wurden keine echten Familien-, Gesundheits- oder Kontodaten gesammelt.

**Zu prüfender Release-Kandidat:** Commit und `index.html`-Hash unmittelbar vor der menschlichen Abnahme eintragen. Für jeden neuen Commit relevante Fälle wiederholen. Historischer Vorläufer: [formativer Nutzertest V3.7 – nur vorbereitet](NUTZERTEST-PROTOKOLL-V3.7.md).

## Prüfziel, Testpersonen und Datenschutz

Erkennen echte Personen ohne Elterngeld-, Finanz- oder Softwarefachwissen, was der Planer **weiß, annimmt und nicht bestätigt**? Können sie ihre Zeit- und Geldplanung nachvollziehbar ändern, eine Hypothese als solche verstehen, eine Aufgabe persönlich markieren und eine reine **zweiseitige A4-PDF** erzeugen?

- **Vorschlag:** sechs bis acht unabhängige Testpersonen aus Haushalten in unterschiedlichen Arbeits-/Betreuungssituationen; mindestens zwei Personen mit praktischer Erfahrung mit assistiven Technologien für eine separate technische Runde. Kein statistischer Repräsentativitätsnachweis.
- **Endgeräte:** Windows/Firefox und Chromium Desktop, 320-/390-Pixel-Mobilansicht, 200-%-Textvergrößerung; in der manuellen Accessibility-Runde mindestens **NVDA + Firefox/Windows** sowie **VoiceOver + Safari/iOS**. Weitere Browser/Assistive Tech dokumentieren.
- **Nur synthetische Familien-/Einkommenswerte** verwenden; echte Namen, medizinische Daten, Lohnzettel, Elterngeldbescheide und echte PDF-Ausdrucke werden **nicht** angefordert. Druckziel vor dem Test kontrollieren, danach synthetische PDF-Testdatei entfernen.
- Bei etwaiger Audio-/Screen-Aufnahme vorher freiwillige Zustimmung, Verantwortlichen, Zweck, Aufbewahrung, Zugriffsrechte und Löschung separat festlegen. Standard ist Beobachtung ohne identifizierende Aufnahme.
- Moderator liest die Lösung nicht vor, erklärt keine irreführenden Modellwerte und ersetzt keine juristische Prüfung.

## Aufgabenskript (synthetisch, ohne vorweggenommene Antworten)

| Fall | Tätigkeit der Testperson | Was als Verständnis erkennbar sein muss |
| --- | --- | --- |
| A – Einstieg | Fiktive Geburt **11.08.2026**, NRW/Köln, zwei beschäftigte Eltern, Netto-Auszahlungsgehälter 2.800/2.100 €, EG-Netto als getrennte synthetische Zahlen; eine Schnellstartvorlage öffnen | Erkennt Unterschied zwischen Elterngeld-Netto, normalen Monats-Nettoeinkünften und einer Behördenentscheidung |
| B – Fehlende Ausgaben | Haushaltsausgaben zunächst offen lassen, zum Cashflow und „Plan prüfen“ gehen | Kann sagen, warum Einkommen vor Kosten **nicht** freies Budget ist, und warum der Rest ausdrücklich „nicht berechenbar“ bleibt |
| C – Familienzeit | Alternativen 18 und 24 Lebensmonate vergleichen, Startbetreuung im LM 19 als Annahme betrachten | Erklärt die Betreuungszuordnung ohne falsche Kita-Platzzusage oder fiktive wöchentliche Betreuungsgarantie |
| D – Was-wäre-wenn | Kita-Start +2 Monate, Erwerbsnetto-Ausfall und Überbrückungskosten erst leer, danach **explizit** 0 bzw. 200 €; Teilzeitstunden nur mit separatem Nettoeffekt ändern | Unterscheidet hypothetische Differenzen von tatsächlichen Zahlungsterminen und geänderter Elterngeldhöhe |
| E – Aufgaben | Über „Plan prüfen“ zur Aufgabenübersicht wechseln, einen Schritt „Unterlagen vorbereitet“ markieren, in der alten Checkliste gegenprüfen, danach „selbst erledigt“ setzen | Versteht gemeinsame lokale Statusanzeige; „selbst erledigt“ bedeutet **nicht** amtlich bestätigt |
| F – PDF | Kompakte Druckvorschau mit aktuell angegebenen Haushaltskosten öffnen, **„Als PDF speichern“** wählen | Zwei A4-Seiten mit Finanz-/Betreuungsannahmen, offenen Schritten, Quellenstand und Modellgrenzen. Kein kompletter 16-Folien-Ausdruck |
| G – Reset & Import | Abbrechen des Resets, danach bestätigter Reset; falscher JSON-Import, danach gültige synthetische JSON-Datei; Browserreload | Kann sagen, welche Angaben nur temporär sind und warum abgewiesene Aktionen den Stand nicht verändern |
| H – Unsicherheit | Geburtsdatum auf **15.10.2027** setzen, anschließend Eingabe eines unplausiblen Datums provozieren | Erkennt Rechtsstand-2027-Warnung und „nicht berechenbar“, ohne automatisch rechtliche Zusagen zu erwarten |

Verantwortliche wählen ein bis zwei weitere Fälle für reale Sprach- und motorische Bedienhürden. Bei jeder Aufgabe beobachten: erste selbstständige Aktion, Anzahl Missverständnisse, Browser-/UI-Fehler, Hilfestellungen, Abbruchpunkt und den verbalen Grund der Entscheidung. Keine echten Geld-/Leistungsbescheide zur Plausibilitätsprüfung verwenden.

## Manuelle Accessibility-Prüfung – gesonderte Freigabe

1. **Tastatur allein:** Navigation in einfacher Ansicht zu „Plan prüfen“ und zurück, beide Listenfilter, jede Statusauswahl und Druckvorschau. Nach dem Verschieben einer Aufgabe in einen anderen Filter muss der Tastaturfokus sinnvoll erreichbar bleiben.
2. **Screenreader:** Überschriftenhierarchie, Gruppierungsnamen, Aufgabenstatus und Quellenlink verständlich; „offen“/„vorbereitet“/„selbst erledigt“ ohne Farben unterscheidbar; nach Statusänderung wird die Aktualisierung wahrnehmbar.
3. **Berichtsvorschau:** zwei semantisch gegliederte Seiten, Einnahmen **vor** versus Rest **nach** Kosten eindeutig, bei fehlenden Ausgaben „nicht berechenbar“, horizontale Tabellen scrollbar **und per Tastatur fokussierbar**.
4. **Schwarzweiß / Print:** A4-Hochformat, Seite 1 Familienzeit/Budget und Seite 2 Quellen/Aufgaben, keine Inhalte am Rand abgeschnitten, keine leeren Zusatzseiten, Schriftgrößen lesbar; auch bei 36 LM / sechs Aufgaben und bei fehlenden Haushaltsposten.
5. **Vergrößerung:** 200-%-Schrift, 320/390 px bei Hochkant, Fokus sichtbar, keine ungewollte horizontale Seitenbewegung, keine überlagerten Bedienelemente.
6. **Fehlerpfad:** ungültiges Geburtsdatum, unbrauchbare Quellenlage, abgebrochener Reset, abgewiesener Import und Browser-Druckverweigerung; das Formular darf keinen alten Bericht als neuen freigegebenen Stand ausgeben.
7. **Keine aktive Übertragung:** Browser-Netzwerkaufzeichnung, Druckaktion und gespeicherte Daten prüfen; es darf keine automatische Server-/Drittanbieterverbindung oder lokale dauerhafte Aufgabenstatusspeicherung entstehen. Die Nutzerwahl des Druckziels ist gesondert zu beachten.

Automatische axe-/Playwright-Tests aus dem Repository sind **technische Regressionen, kein Ersatz** für diese manuelle Überprüfung.

## Erfolgs- und Abbruchkriterien

- Kritisch (**P0 / sofortiger Release-Stopp**): ein fachlich unbestätigter Anspruch wird als Bescheid verstanden; eine geplante Kita als bestätigter Platz; fehlende Haushaltskosten als 0 €; Änderungen werden unbemerkt gespeichert/übertragen; veraltete Rechtslage ohne Warnung; PDF enthält fremde bzw. ungewollte Daten.
- Hoch (**P1, vor öffentlicher Verteilung zu korrigieren**): Kernaufgabe per Tastatur/Screenreader nicht ausführbar, unverständlicher Aufgabenstatus, mehr als zwei A4-Seiten bei Standardbeispielen, abgeschnittene Zahlen oder verlorener Fokus.
- Formatives Ziel: mindestens **80 %** der Teilnehmenden erklären den Unterschied zwischen Einnahmen/Rest und mindestens eine Modellgrenze korrekt. Bei sechs bis acht Personen **absolute Zahlen** zusammen mit Prozenten ausweisen, kein repräsentatives Marktsignal behaupten.
- **Technische Freigabe ≠ rechtliche Freigabe.** Fehlende unabhängige 10/10-Familienvergleichsrechnungen, 4/5-Mutterschutzfrage, 2027-Anspruchsprüfung und Rechts-/Datenschutz-/Betreiberentscheid können auch nach einem guten Nutzertest ein **NO-GO** begründen.

## Protokoll je Testfall – erst nach realer Durchführung ausfüllen

| Nachweisfeld | Tatsächlicher Befund |
| --- | --- |
| Test-ID (ohne Namen), Datum, Moderation | OFFEN |
| Exakter Git-Commit, HTML-SHA-256 und Teststand | OFFEN |
| Gerät, OS, Browser, Bildschirm/Zoom, ggf. Assistive Tech | OFFEN |
| Gewählte synthetische Aufgabe(n), Reihenfolge | OFFEN |
| Zeit, Hilfestellungen, Fehler, Abbruch | OFFEN |
| Erklärung Einnahmen vor Kosten / freier Rest | OFFEN |
| Erklärung Kita-Annahme / behördlicher Anspruch / Aufgabenstatus | OFFEN |
| Erstellte PDF-Seiten, Beschnitt, Lesbarkeit, Barrierefreiheit | OFFEN |
| Schweregrad, reproduzierbare Schritte, Issue/PR-ID | OFFEN |
| Nachtest, tatsächliche Reviewer-Entscheidung | OFFEN |

**Sammelbewertung:** Zahl der tatsächlich teilnehmenden Personen **0**; unabhängige manuelle Accessibility-Abnahmen **0**; Freigabeentscheid **OFFEN**. Diese Platzhalter dürfen nicht durch automatisierte Tests als erledigt markiert werden.
