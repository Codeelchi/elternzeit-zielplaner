# Regelvalidator: Standardfall, Prüfstand 14.10.2026

`src/rule-validator.cjs` ist eine reine, deterministische Validierungsengine. Sie verändert keine Eingaben, greift nicht auf Netzwerk oder Speicher zu und berechnet keine Leistungsbeträge. Ihre Regeln und veränderlichen Grenzwerte stammen aus dem versionierten Rechtsregel-Katalog. Browser und Node verwenden denselben Quelltext.

## Vertrag

```js
const result = validatePlan({state, schedule}, RULE_CATALOG);
```

`state` verwendet die vorhandenen Felder `date`, `births`, `zve`, `hoursFather`, `hoursMother`, `netFather`, `netMother`, `ptNetFather`, `ptNetMother` und die finanzielle Berechnungsbasis `egNetFather`/`egNetMother`. Die vier Nettofelder vor Geburt müssen gültige, nichtnegative Zahlen sein. Teilzeit-Nettoangaben sind nur erforderlich, wenn der jeweilige Elternteil einen Teilzeitcode verwendet; optional ausdrücklich eingegebene Teilzeit-Elterngeld-Nettozahlen dürfen ebenfalls nicht ungültig oder negativ sein. Erforderlich ist außerdem `standardCaseConfirmed === true`: Der Nutzer bestätigt zwei abhängig beschäftigte Eltern in Deutschland mit gemeinsamem Haushalt und eigener Betreuung, ein regulär geborenes Kind und keine besonderen Anspruchssachverhalte. Die Bestätigung ist eine Benutzereingabe, keine durchgeführte amtliche Prüfung. Sie darf bei Altimporten nicht automatisch gesetzt werden. Eine ausdrückliche Ablehnung (`false`) führt zu NICHT_UNTERSTUETZT; eine noch unbeantwortete Bestätigung zu DATEN_UNVOLLSTAENDIG.

Optionale Sonderfallangaben (`specialCases`, `selfEmployed`, `singleParent`, `adoption`, `disability`, `siblingBonus`, `prematureBirth`) sperren eine Standardbewertung. Ein vom Geburtsdatum abweichender `expectedDueDate` oder eine abweichende `postnatalDays`-Frist ist ebenfalls nicht automatisch validiert.

Die Planung benötigt 14–96 vollständige Lebensmonatszeilen mit Elterncodes `f`/`m`. Codes entsprechen der Bestandsanwendung: W, MS, B, R, P, T, Q, K, U. `hf`/`hm` überschreiben die globalen Teilzeitstunden; leere Overrides sind fehlende Angaben, keine Nullstunden. Unbekannte Codes und fehlende Zeilen werden nicht stillschweigend als Vollzeit umgedeutet.

Ergebnis:

- `status`: PLAUSIBEL_STANDARD, REGELKONFLIKT, NICHT_UNTERSTUETZT oder DATEN_UNVOLLSTAENDIG.
- `valid`: ausschließlich bei PLAUSIBEL_STANDARD wahr; keine Rechtsgültigkeitszusage.
- `findings`: maschinenlesbarer `code`, `ruleId`, betroffene `parents`/`lifeMonths`, Erklärung, Alternativen und `source` mit URL, Titel, Prüfdatum, Gültigkeit und Quellenstatus. Bei einer fehlenden Katalogregel bleiben diese Felder als Objekt vorhanden (URL/Datum `null`), damit eine Erklärung sicher dargestellt werden kann.
- `totals`: reguläre Basis-Äquivalente je Elternteil, gemeinsam sowie Bonusmonate. Bonus zählt zusätzlich und verbraucht das reguläre Kontingent nicht.
- `catalogueVersion`, `checkedAt`, `disclaimer`.

Bei mehreren Problemen gilt NICHT_UNTERSTUETZT vor DATEN_UNVOLLSTAENDIG vor REGELKONFLIKT; sämtliche Befunde bleiben sichtbar. Diese Reihenfolge verhindert eine scheinbar vollständige Rechtsprüfung bei unbekannter Kohorte oder fehlenden Voraussetzungen. Fehlende Quellen/Grenzwerte erzeugen ebenfalls eine Sperre. Es gibt keinen stillen Rückgriff auf unversionierte Regelwerte.

## Unabhängige Quellenprüfung vor Implementierung

Die folgenden amtlichen Einzelnormen wurden am **14.10.2026** per HTTPS abgerufen und inhaltlich gelesen:

| Quelle | Geprüfter Inhalt | Katalogbezug |
| --- | --- | --- |
| [§ 1 BEEG](https://www.gesetze-im-internet.de/beeg/__1.html), Abs. 1, 6, 8 | Wohnsitz, gemeinsamer Haushalt, Selbstbetreuung; höchstens 32 Wochenstunden im Lebensmonatsdurchschnitt; Anspruchsausschluss bei **mehr als** 175.000 € gemeinsamem zu versteuerndem Einkommen | BE-32, BE-2025 |
| [§ 4 BEEG](https://www.gesetze-im-internet.de/beeg/__4.html), Abs. 1–4, 6 | Basis bis LM14, Plus bis LM32 mit gemeinsamer Kontinuität ab LM15; 12 reguläre Basisbeträge plus zwei Partnermonate bei Einkommensminderung in zwei LM; höchstens 12 je Person; Mindestbezug zwei LM; Mutterschaftsanrechnung zählt als Basis; gleichzeitiges Basis nur ein LM innerhalb LM1–12 im Standardfall | BE-4, BE-PLUS, BE-MUT, BE-PAR |
| [§ 4b BEEG](https://www.gesetze-im-internet.de/beeg/__4b.html), Abs. 1–3, 5 | Beide Eltern 24–32 Wochenstunden, zwei bis vier gemeinsame aufeinanderfolgende zusätzliche Plusbeträge; Sonderregel für nachträglich nicht erfüllte Bonusvoraussetzungen | BE-BON |

Die Befunde referenzieren weiterhin die entsprechenden Katalogeinträge und deren amtliche URLs; diese Tabelle dokumentiert die zusätzliche unabhängige Normprüfung. Der Katalogprüfstand bestätigt **keine Rechtslage für Geburten 2027**. Die bisherige grobe Katalogspanne bis Ende 2027 allein reicht dafür nicht aus: Geburtsjahre nach dem Quellenprüfjahr erhalten NICHT_UNTERSTUETZT, auch wenn der Kalender rechnerisch dargestellt werden kann.

## Abgrenzung und verbleibende Prüfung

PLAUSIBEL_STANDARD bedeutet nur, dass die unterstützten Planungskombinationen und die explizit bestätigten Standardannahmen keinen bekannten Konflikt ergeben. Aufenthaltsrecht, tatsächliche Einkommensnachweise, Versicherungsstatus und vollständige Unterlagen werden nicht verifiziert. Die Nettowerte der Bestandsanwendung dienen zur Plausibilisierung einer Einkommensminderung; sie ersetzen kein amtliches Elterngeld-Netto.

Die Engine bewertet geplante Bonusblöcke. Rückforderungen und die Ausnahme für nachträglich entfallene Bonusvoraussetzungen gemäß § 4b Abs. 5 sind kein unterstützter Standardplanfall. Arbeitsrechtliche Elternzeitabschnitte, Arbeitgeberzustimmungen und Anmeldung werden auf ihrer unabhängigen Zeitachse geprüft, nicht aus dem Elterngeldbezug abgeleitet. Ein bereits gezahlter Bankbetrag wird nicht als Beweis eines Anspruchs behandelt.

Die Mutterschaftsprüfung verwendet ausschließlich `lifeMonths`, `maternityTimeline` und `daysOverlapInclusive` aus dem gemeinsamen Modul `time-axes.cjs`; sie enthält keine zweite Datumsformel. Die dort modellierte Schutzfrist von acht Wochen nach Geburt umfasst zusätzlich den geschützten Geburtstag (57 Kalendertage bei 56 Tagen nach Geburt). Die tatsächlich berührten Lebensmonate müssen im unveränderten Eingabeplan den MS-Code tragen. Fehlende Codes dürfen bei der Finanzprojektion nicht stillschweigend geheilt werden. Nur wenn die tatsächliche Schutzfrist einen Lebensmonat jenseits LM2 berührt, wird dieser Finanzsonderfall gesperrt. Abweichende Fristen/Termine bleiben gesperrt.

**Release-Gate:** Die amtliche Referenz zur taggenauen Anrechnung der Mutterschaftsleistungen muss unabhängig mit Finanzprojektion und Schutzfrist abgeglichen werden. Insbesondere abweichende bisherige Referenzbeträge dürfen nicht durch Anpassung der erwarteten Testwerte verdeckt werden. Die kalenderfachliche Korrektur allein zertifiziert die Elterngeld-Anrechnung nicht; sie sperrt zugleich nicht pauschal alle regulären Standardfälle.

## Tests

`node --test tests/rule-validator.test.mjs` prüft Einkommensgrenzen, Quellenstatus und Gültigkeit, unbekannte Kohorten/Sonderfälle, leere/ungültige Angaben, Eltern- und Gemeinschaftskontingente, gleichzeitiges Basis einschließlich Mutterschaftsanrechnung, Pluskontinuität mit erlaubtem Start LM15, Bonuslänge/-gleichzeitigkeit/-Stunden, Mindestbezug, späte Bezugsmonate und reine/deterministische Verarbeitung. Zusätzliche Regressionen prüfen die explizite Ablehnung des Standardfalls, finanzielle Pflichtdaten, bedingte Teilzeitdaten, fehlende Quellenobjekte und unveränderte MS-Eingaben. Stand: 41 Modulprüfungen erfolgreich. Ausschließlich synthetische Haushalte. Die Normbeispiele dienen der Regelprüfung, nicht der unabhängigen Zertifizierung der Finanzformel.


## Abschließende Integration: Budget und manuelle Elternzeit

Explizit eingetragene `expenses`, `childcareMonthly` und `goalMinIncome` müssen endliche, nichtnegative Zahlen sein. Fehlende oder leere optionale Eingaben bleiben erlaubt; negative Werte, NaN und ungültige Typen erzeugen DATEN_UNVOLLSTAENDIG, bevor ein Plan als plausibel eingeordnet werden kann.

Ist `leaveOverrides` vorhanden, prüft die Engine die arbeitsrechtliche Achse getrennt vom Leistungsbezug mit `TimeAxes.buildTimeAxes`. Der Katalogeintrag **BEEG-15** ist für diese manuelle Prüfung und für eine aus dem Q-Monatsstatus abgeleitete Überschreitung der arbeitsrechtlichen Stundengrenze erforderlich. Ungültige Intervalle, überlappende Abschnitte, mehr als drei Abschnitte und manuelle Überschneidungen mit Mutterschutz erhalten NICHT_UNTERSTUETZT, bis die Eingaben bzw. notwendige Arbeitgeberzustimmungen individuell geprüft sind. Übersteigt die modellierte Erwerbsarbeitszeit in einem Lebensmonat mit manueller Elternzeit die 32-Stunden-Grenze, entsteht ein eigener REGELKONFLIKT mit Elternteil und Lebensmonaten. Unabhängige `employmentOverrides` werden dabei berücksichtigt; Leistungsbezug allein ersetzt keine Elternzeit-Anmeldung.

Hierfür wurden am **14.10.2026** zusätzlich [§ 15 Abs. 4 BEEG](https://www.gesetze-im-internet.de/beeg/__15.html) (höchstens 32 Wochenstunden im Monatsdurchschnitt während Elternzeit) und [§ 16 Abs. 1 BEEG](https://www.gesetze-im-internet.de/beeg/__16.html) (drei Zeitabschnitte, weitere nur mit Arbeitgeberzustimmung) amtlich abgerufen und gelesen. Die Prüfung unterstützt weiterhin nur den bestätigten Arbeitnehmer-Standardfall; besondere arbeitsrechtliche Ausnahmen sind nicht freigeschaltet.

Budgetwerte und manuelle Elternzeit-/Erwerbsarbeitsangaben werden bei jedem Suchkandidaten erneut ausgewertet. Der einzelne Kalender-Memoeintrag enthält ausschließlich geschützte Lebensmonatsnummern für Datum, effektiven Planungshorizont und Schutzfristwert; weder Haushaltsdaten noch Prüfergebnisse werden wiederverwendet. Regressionstests prüfen ausdrücklich Änderungen am Budget und an manuellen Intervallen bei identischem Kalender.


## Sicherheitsreview der Eingabegrenzen (15.10.2026)

Der Quellenprüfstand bleibt **14.10.2026**; dieser Review verändert keine rechtlichen Grenzwerte. Reproduziert und geschlossen wurden folgende Fälle, in denen widersprüchliche oder fehlerhafte Eingaben zuvor trotzdem PLAUSIBEL_STANDARD ergeben konnten:

- `specialCases: "self-employed"` sowie `selfEmployed: 1` bzw. `"true"`: Sonderfallkennzeichen waren zuvor nur bei exakt `true` oder einer nichtleeren Liste wirksam. Die Engine lässt bei einzelnen Sonderfall-Flags ausschließlich `false`, fehlende Werte oder `null` als verneint gelten; andere Werte sperren die Standardbewertung. Das Sammelfeld erlaubt zusätzlich eine leere Liste bzw. leere Zeichenkette. Eine positive Standardbestätigung hebt widersprechende Sonderfallangaben nicht auf.
- `leaveOverrides: {fater: [...]}`: Ein unbekannter Elternschlüssel wurde vorher stillschweigend ignoriert. Manuelle Elternzeitobjekte erlauben jetzt ausschließlich `father` und `mother`; Tippfehler oder andere Rollen müssen korrigiert werden.
- Ungültiges bzw. fehlendes `effective_to`, ein Ende vor dem Regelbeginn, ein Quellenprüfdatum nach dem Katalogprüfstand oder eine leere/ungültige/umgekehrte Standard-Geburtsspanne verhindern jetzt eine positive Standardbewertung. Ein offenes Regelende wird ausdrücklich durch `null` dokumentiert.

Zusätzliche Regressionen bestätigen, dass eine überzogene Kontingentplanung bei unbestätigter Quelle weiterhin NICHT_UNTERSTUETZT bleibt und dass der Mindestbezug von zwei Lebensmonaten bereits unabhängig für die Mutter geprüft wird. Diese beiden Verdachtsfälle benötigten keine Änderung an der Fachlogik.

Der Dateimport muss dieselben Angaben erhalten oder die Datei zurückweisen. Das Weglassen widersprüchlicher Sonderfallfelder vor dem Aufruf dieser Engine wäre keine zulässige Datenbereinigung. Diese Importgrenze wird separat in der Browserintegration geprüft.


### Erwerbsarbeit ohne Leistungsbezug und ohne Elternzeit

Der Legacy-Code `Q` beschreibt ohne manuelle Elternzeitachse weiterhin abgeleitete Teilzeit **in Elternzeit**. Über 32 Wochenstunden erzeugen dann einen Konflikt nach dem bereits geprüften § 15 Abs. 4 BEEG, mit Elternteil und betroffenen Lebensmonaten; für diese Rechtsabfrage muss BEEG-15 bestätigt sein. Gewöhnliche Basis-Fälle benötigen dadurch keine zusätzliche Quellenabhängigkeit.

Sind `leaveOverrides` vorhanden, entscheidet ausschließlich die tatsächliche Elternzeitabdeckung der unabhängigen Achse: `father: []` bedeutet ausdrücklich keine Elternzeit dieses Elternteils. 35 Stunden Erwerbsarbeit ohne Elterngeld und ohne eingetragene Elternzeit sind deshalb zulässig darstellbar, auch wenn die Finanzprojektion hierfür intern den Teilzeitcode Q verwendet. Ein **fehlender** Elternschlüssel behält dagegen die dokumentierte Ableitung aus Monatscodes bei; er ist nicht mit einer ausdrücklich leeren Liste gleichzusetzen. Die Arbeitszeitprüfung berücksichtigt daher die tatsächliche Abdeckung beider Elternteile, auch bei nur teilweise manuell überschriebenen Achsen.
