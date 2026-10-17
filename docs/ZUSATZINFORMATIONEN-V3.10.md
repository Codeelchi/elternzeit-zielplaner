# Kontextwissen für die Familienplanung – V3.10

Prüfdatum: **16. Oktober 2026**. Umsetzung: `src/planning-knowledge.cjs`, Regressionen: `tests/v310-knowledge.test.mjs`.

## Ziel und Abgrenzung

Der Rechner erhält kurze Hinweise, die Familien beim Interpretieren ihrer Ergebnisse helfen: Zeiträume verstehen, Einkommensannahmen prüfen und Kosten außerhalb der bisherigen Rechnung erkennen. Die Hinweise verändern **keinen Geldbetrag**, beantragen nichts und behaupten keinen individuellen Anspruch. Sie ersetzen keine Fachprüfung.

Die vorhandene `application-guide.cjs` erstellt bereits datierte Aufgaben, örtliche Zuständigkeiten und eine Unterlagenliste. Diese Engine wird nicht dupliziert: Die neuen Karten erklären beispielsweise den Unterschied zwischen einer frühen Einreichungsempfehlung und der gesetzlichen Rückwirkung und verweisen für persönliche Daten auf die bestehende Checkliste. Die Fristberechnung bleibt ausschließlich dort.

## API und Integration

```js
const {selectPlanningKnowledge} = require('./src/planning-knowledge.cjs');
const knowledge = selectPlanningKnowledge({
  birthDate: '2027-05-28',
  region: 'NRW', city: 'Köln',
  partTime: true, childcareStartLm: 13,
  incomeEntryMode: 'estimate', insuranceStatus: 'unknown', limit: 6
});
```

`birthDate` ist optional (`null`); ohne Datum bleibt eine Kohortenwarnung erhalten. Zulässige Herkunftswerte sind `estimate`, `known`, `official`, Versicherungsstatus `unknown`, `statutory`, `voluntary`, `private`. Das Modul führt keine neue Erhebung sensibler Versicherungsdaten ein; `unknown` ist der Standard. Ungültige Werte schlagen explizit fehl.

Die Ausgabe enthält `cards`, `totalEligible`, `omittedCount`, `coverage`, `warnings` und immer leere `budgetEffects`. Jede Karte liefert `id`, `category`, `title`, `summary`, `action`, `sources` und eine eingegrenzte `validity`. Alle Quellen haben ein eigenes `verifiedAt`. Die Lebensmonatskarte liefert bei vorhandenem Geburtsdatum ein konkretes erstes Lebensmonatsintervall aus der bestehenden Zeitachsenengine.

Standardmäßig werden sechs Karten ausgewählt. Teilzeit und geplanter Kita-Start aktivieren passende Karten und priorisieren diese. `limit: 12` liefert alle aktuell passenden Karten, also höchstens acht. `omittedCount` macht eine verkürzte Auswahl erkennbar. Freiwillige beziehungsweise private Krankenversicherung priorisiert den Kostenhinweis. Die Reihenfolge ist eine kuratierte Informationsauswahl, keine Dringlichkeits- oder Rechtsbewertung.

Die Daten liegen absichtlich im CJS-Modul: keine zusätzliche JSON-Laufzeitabhängigkeit im offline verteilbaren Rechner. `DATA` ist rekursiv eingefroren; Rückgaben sind unabhängig kopiert. Keine Netzaufrufe, Speicherung, Telemetrie oder personenbezogenen URL-Parameter.

## Amtliche Recherche und belegte Aussagen

Alle folgenden zehn URLs wurden am **16.10.2026 tatsächlich abgerufen (HTTP 200)**. Der Abruf ist ein Quellenprüfdatum, kein Beleg für unveränderte zukünftige Regeln. Die NRW-Seite zum Kita-Start trägt selbst den redaktionellen Aktualisierungsstand 22.02.2024.

| Quelle | Geprüfter Inhalt und Umsetzung |
| --- | --- |
| [BEEG § 4 Absatz 2](https://www.gesetze-im-internet.de/beeg/__4.html) | „Elterngeld wird in Monatsbeträgen für Lebensmonate des Kindes gezahlt.“ Hinweis trennt Lebensmonat, Kalendermonat und Bankeingang. Datumsarithmetik kommt unverändert aus `time-axes.cjs`. |
| [Familienportal: Elterngeld-Netto](https://familienportal.de/familienportal/familienleistungen/elterngeld/faq/wie-wird-das-elterngeld-netto-berechnet--124606) | Pauschalierte Abzüge aus berücksichtigungsfähigem Brutto; keine Gleichsetzung mit ausgezahltem Lohnnetto. Eingabeherkunft und Teilzeitnetto bleiben getrennt. Keine neuen pauschalen Beträge aus dem Artikel in die Rechnung übernommen. |
| [Familienportal: Teilzeit und Elterngeld](https://familienportal.de/familienportal/familienleistungen/elterngeld/arbeitssituation/darf-ich-teilzeit-arbeiten-waehrend-ich-elterngeld-beziehe--124622) | Teilzeiteinkommen verändert den Leistungsbetrag; ElterngeldPlus kann bei Teilzeit interessant sein. Artikel erläutert die Kohorte ab September 2021. Hinweis gibt keine Vorteilsgarantie, sondern fordert belastbare Lohnannahmen und Mitteilung tatsächlicher Änderungen. |
| [EStG § 32b Absatz 1 Nummer 1 Buchstabe j](https://www.gesetze-im-internet.de/estg/__32b.html) | Elterngeld ist ausdrücklich im Progressionsvorbehalt genannt. Persönliche Steuerwirkung bleibt offen; keine erfundene pauschale Nachzahlungsquote. |
| [Familienportal: Krankenversicherung](https://familienportal.de/familienportal/familienleistungen/elterngeld/faq/wie-bin-ich-krankenversichert-waehrend-ich-elterngeld-bekomme--124738) | Unterschiedliche Behandlung Pflichtversicherung, freiwilliger GKV und PKV. Pflichtversicherte ohne weitere Einnahmen müssen beim Bezug grundsätzlich keine Beiträge zahlen; Ausnahmen bestehen. Individuelle Klärung, keine automatische Beitragsfreiheit. Bereits im Netto enthaltene Beiträge nicht doppelt als Ausgaben erfassen. |
| [BEEG § 7 Absatz 1](https://www.gesetze-im-internet.de/beeg/__7.html) | Rückwirkung umfasst die letzten drei Lebensmonate vor dem Lebensmonat des Antragseingangs. Keine irreführende Behauptung einer allgemeinen Ausschlussfrist nach LM 3. Früh einreichen bleibt die praktische Empfehlung. |
| [BEEG § 16 Absatz 1](https://www.gesetze-im-internet.de/beeg/__16.html) | Regulär sieben beziehungsweise 13 Wochen, abhängig vom Kindesalter; Erklärung für den Zweijahreszeitraum bei Anmeldung vor dem dritten Geburtstag. Keine zweite Datumsberechnung im Wissensmodul. |
| [BEEG § 28](https://www.gesetze-im-internet.de/beeg/__28.html) | Übergang für vor dem 1. Mai 2025 geborene Kinder beachtet. Textform wird nicht rückwirkend pauschal auf ältere Geburten übertragen. |
| [Familienportal: Elternzeit anmelden](https://familienportal.de/familienportal/familienleistungen/elternzeit/faq/wann-und-wie-muss-ich-elternzeit-beantragen--124810) | Textform kann E-Mail sein. Anmeldung beim Arbeitgeber ist vom Leistungsantrag zu trennen; Zugang bestätigen lassen. Sonderfälle und frühere Geburtskohorten separat prüfen. |
| [Familienportal NRW: Tipps für den Kita-Start](https://www.familienportal.nrw/de/1-bis-3-jahre/betreuung-bildung/tipps-fuer-den-kita-start) | Bedürfnisorientierte Eingewöhnung und Beziehungsaufbau; Einrichtungskonzept berücksichtigen. Keine allgemeingültige Eingewöhnungsdauer, kein zugesagter Betreuungsplatz und keine erfundene kommunale Gebühr. |

Für Geburten nach dem Quellenprüfdatum setzt die Ausgabe `futureBirthRequiresRecheck` und nennt ausdrücklich die fehlende pauschale Bestätigung für 2027. `validFrom: null` bedeutet „keine Geburtskohorte aus dieser allgemeinen Erläuterung abgeleitet“, nicht „unbegrenzte Rechtsgültigkeit“. Das Modul ist eine Informationsschicht; Rechtsvalidator und historischer Regelkatalog bleiben verbindlich für die technische Anspruchsprüfung.

## Verifikation

Neun isolierte Node-Tests prüfen Auswahl, Kontextpriorisierung, nachvollziehbare Verkürzung, unveränderte Budgetwirkung, konkrete Lebensmonatsgrenzen an Monatsenden/Schaltjahren, Textform-Kohorte, Zukunftswarnungen, offizielle HTTPS-Quellen ohne Nutzerdatenparameter, Unveränderlichkeit und Fehlerfälle.

```sh
node --test tests/v310-knowledge.test.mjs
```

Ergebnis der Modulprüfung: **9/9 erfolgreich**. Die Prüfungen verwenden ausschließlich synthetische Daten. Visuelle Integration, vollständiger Gesamttest und Zugänglichkeit der aufklappbaren Hinweise werden in der übergeordneten V3.10-QA geprüft; dieser Modulbericht behauptet keine bereits abgeschlossene Browserprüfung oder externe Fachfreigabe.
