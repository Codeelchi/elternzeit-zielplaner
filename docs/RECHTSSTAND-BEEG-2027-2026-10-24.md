# BEEG 2027 – überprüfter Quellenstand vom 24. Oktober 2026

**Einordnung:** Ein zeitlich begrenztes **Recherche-Dossier**, keine neue Rechts- oder Leistungsberechnung, keine amtliche oder juristische Freigabe. Der Rechner bleibt bei Geburten ab dem 1. Januar 2027 ausdrücklich eine **nicht rechtlich validierte Prognose**.

## 1. Bereits verkündete Änderung: § 2f BEEG ab 1. Januar 2027

Das **SGB VI-Anpassungsgesetz vom 22. Dezember 2025 (BGBl. 2025 I Nr. 355, Art. 18)** wurde laut Bundesarbeitsministerium am 23. Dezember 2025 verkündet. Die Deutsche Rentenversicherung führt einen auf **1. Januar 2027** datierten neuen Rechtsstand zu **§ 2f Absatz 2 Satz 3 BEEG**.

| Rechtsstand | Tatsächliche Formulierung des Verweises | Status |
| --- | --- | --- |
| 01.05.2025–31.12.2026 | **§ 344 Absatz 4 SGB III** | geltender bisheriger Rechtsstand |
| Ab 01.01.2027 | **§ 344 Absatz 3 SGB III** | **verkündete künftige Verweisänderung** |

Die für die pauschale Sozialabgabenbestimmung genannten Prozentsätze 9 %, 10 % und 2 % sind in beiden veröffentlichten Fassungen identisch. Das ist nach den beiden Textfassungen eine **Verweisänderung** und **keine in diesen Texten erkennbare neue Elterngeld-Ersatzrate**. Trotzdem folgt daraus **keine Bestätigung**, dass die gesamte 2027er Rechtslage, der individuelle Netto-Bemessungsweg, Ausnahmen und die anzuwendenden Geburtskohorten bereits vollständig überprüft wären.

**Primärquellen:**
- [Deutsche Rentenversicherung, § 2f BEEG, Rechtsstand ab 01.05.2025](https://rvrecht.deutsche-rentenversicherung.de/SharedDocs/rvRecht/05_Normen_und_Vertraege/02_A-B/BEEG/0002f/0002f_2025_05_01.html) – Geltung bis 31.12.2026, Verweis auf Absatz 4.
- [Deutsche Rentenversicherung, § 2f BEEG, Rechtsstand ab 01.01.2027](https://rvrecht.deutsche-rentenversicherung.de/SharedDocs/rvRecht/05_Normen_und_Vertraege/02_A-B/BEEG/0002f/0002f_2027_01_01.html) – Verweis auf Absatz 3.
- [Bundesministerium für Arbeit und Soziales – Gesetzesverfahren SGB VI-AnpG](https://www.bmas.de/DE/Service/Gesetze-und-Gesetzesvorhaben/sozialgesetzbuch-6-anpassungsgesetz.html) – verkündet am 23.12.2025.

## 2. Was am Prüftag gilt und was nicht daraus folgt

[§ 1 Absatz 8 BEEG](https://www.gesetze-im-internet.de/beeg/__1.html) sieht in der veröffentlichten, im Oktober 2026 geltenden Fassung eine Grenze von **mehr als 175.000 € zu versteuerndem Einkommen** vor. Das [Bundesfamilienportal](https://familienportal.de/familienportal/familienleistungen/elterngeld/faq/was-aendert-sich-fuer-geburten-ab-1-april-2024-beim-elterngeld-237122) erläutert die Anwendbarkeit für Geburten ab 1. April 2025.

Diese Feststellung ist **keine pauschale Rechtsbestätigung für alle Geburten 2027**. Der Prüfstand, spätere Gesetzesänderungen, Übergangsrecht, Bemessungszeitraum und individuelle Bedingungen bleiben zu kontrollieren. Im technischen Register endet das bestätigte **Standard-Geburtenfenster am 31.12.2026**. Das ist eine gewollte Sicherheitsgrenze.

## 3. Größere Elterngeldreform: nicht mit dem verkündeten § 2f verwechseln

Bei der [Bundesregierung-Pressekonferenz vom 7. Juli 2026](https://www.bundesregierung.de/breg-de/aktuelles/regierungspressekonferenz-vom-7-juli-2026-2446104) wurde bestätigt, dass ein Reform-Gesetzentwurf **in die Ressortabstimmung** gegeben wurde. Im öffentlich diskutierten Entwurf tauchten unter anderem **12 statt 14 Gesamtmonate**, **drei reservierte Monate je Elternteil** sowie **330 € / 1.900 €** als neue Mindest-/Höchstbeträge auf. Dies sind **Entwurfswerte**, keine durch die Pressekonferenz bekannt gemachten geltenden Leistungsparameter.

Am [30. September 2026 berichtete die Tagesschau](https://www.tagesschau.de/inland/innenpolitik/prien-kuerzungen-elterngeld-100.html) über eine erneute politische Prüfung einschließlich einer möglichen Abkehr von der Zwölfmonatskürzung. Eine [Rede zum Haushaltsgesetz 2027](https://www.bundesregierung.de/breg-de/service/newsletter-und-abos/bulletin/bmbfsfj-haushaltsgesetz-2027-2452382) verweist auf die noch erforderlichen parlamentarischen Beratungen.

**Nicht eingeführt werden** deshalb aus dieser Recherche: neue Basis-/Plusbeträge, feste 12-Monats-Grenze, neue Elternquoten, automatisch veränderte 2027er Renten-/Sozialversicherungsabzüge oder ein verbindlicher Starttermin im November 2027.

## 4. Trennung von Quellen und Rechner

Die [maschinell prüfbare Rechercheübersicht](../data/rechtsstand-2027-quellenstatus-20261024.json) unterscheidet:

1. **Verkündetes, erst künftig wirksames Recht** (`promulgated_future_effective` – § 2f-Verweis).
2. **Im Oktober 2026 geltendes Recht ohne pauschale 2027-Freigabe** (`current_law_not_2027_signoff` – § 1-Grenze).
3. **Nicht beschlossener politischer Entwurf** (`policy_proposal_not_enacted` – diskutierte Reform).

Der neue Guard `src/2027-source-status.cjs` verhindert in Tests, dass ein Entwurfsbetrag, eine gefälschte Freigabe, ein geänderter Gesetzesstichtag oder ein auf 2027 verlängertes Standard-Geburtenfenster als geprüfter Zustand akzeptiert werden.

**Wichtig:** Das bestehende, in `index.html` eingebettete `data/rechtsentwicklungen-2027-2026-10-15.json` sowie die Geld- und Anspruchsberechnung bleiben **vollständig unverändert**. Dessen andere 2027er Projekte (Kindergeld, Steuerreform, KiBiz) haben weiterhin **ihren eigenen älteren Quellenstand**. Diese neue Recherche ist ein zusätzlicher, separat datierter fachlicher Nachweis, keine undokumentierte Aktualisierung der ganzen Datenbasis.

## 5. Was vor Freigabe weiter fehlt

Eine unabhängige Rechtsprüfung zu künftigen BEEG-Vorschriften und deren Übergangsregelungen, eine verifizierte Bemessungsberechnung für die betroffenen Geburtskohorten, der 4/5-Tage-Mutterschutz-Fachentscheid und die bereits dokumentierten zehn vollständigen unabhängigen Familienfälle. Moderierte echte Nutzer-/Screenreaderprüfungen, Datenschutz- und Betreiberfreigabe stehen weiterhin aus.

**Produktrelease: NO-GO.** Die neu gefundene verkündete Verweisänderung ist eine Quellenpräzisierung, keine Freigabe der 2027er Elterngeldprognose.
