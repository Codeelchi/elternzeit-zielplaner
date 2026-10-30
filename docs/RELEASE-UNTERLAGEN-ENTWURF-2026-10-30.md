# Release-Unterlagen – ENTWURF (30. Oktober 2026)

> **ENTWURF · KEINE RECHTSBERATUNG · KEINE FREIGABE.** Dieses Dokument sammelt Recherchehinweise und Textentwürfe für einen möglichen öffentlichen Betrieb. Es ändert keinen Gate-Status: `data/release-gates.json` bleibt maßgeblich (`publicReleaseApproved: false`, `legalReview`/`privacyReview`: `pending`). Der Produktrelease bleibt **NO-GO**. Keiner der Texte wurde von Jurist:innen oder Datenschutzbeauftragten bewertet. Die Recherche stützt sich teils auf Sekundärquellen (Kammern, Kanzleien); Gesetzes- und Behördentexte sind vor Verwendung im Original zu lesen. Platzhalter `[…]` dürfen nicht mit erfundenen Angaben gefüllt werden.

## 0. Ausgangslage (aus dem Repository)

- Offline-fähige statische Seiten (`index.html` Rechner, `start.html` Infoportal); laut Status kein Konto, kein Rechen-Backend, keine appseitige Telemetrie; Netzwerk-/Cookie-/Drittmedien-Schnittstellen werden nur **statisch** geprüft (`scripts/privacy-technical-check.mjs`, kein Datenschutz-Audit).
- Lokale Speicherung im Browser nur nach Opt-in, **unverschlüsselt** (`elternzeit-familienplan-v3`), mit Löschfunktion; JSON/CSV-Export und Druck liegen beim Nutzer.
- Hosting-Kandidat: GitHub Pages (öffentlich, eigene Zugriffsprotokollierung der Plattform). Betreiber-/Impressumsangaben und Hostingform sind laut Gate-Begründung offen.
- Eingaben sind Familien- und Finanzdaten (Einkommen, Netto, Geburtsdaten, Betreuung) und bei lokaler Speicherung im Alltagssinn sensibel, auch wenn nichts an den Betreiber übertragen wird.

## 1. Checkliste Pflichtunterlagen

Status-Spalte: alle Punkte **offen**.

### 1.1 Impressum (Anbieterkennzeichnung)

| Pflichtinhalt / Prüfpunkt | Quelle | Status |
| --- | --- | --- |
| Pflicht gilt für geschäftsmäßige, in der Regel gegen Entgelt angebotene digitale Dienste; seit 14.05.2024 in § 5 DDG (zuvor § 5 TMG). Ob ein privates, unentgeltliches Angebot erfasst ist, ist zu klären (Q1). | [§ 5 DDG](https://www.gesetze-im-internet.de/ddg/__5.html); Überblick: [IHK Nürnberg Merkblatt](https://ihk-nuernberg.de/fileadmin/IHK_Nuernberg/user_upload/Pflichtangaben_im_Internetimpressum_117-24.pdf), [MTH Partner](https://www.mth-partner.de/impressumspflicht-nach-dem-ddg-rechtssicheres-impressum-erstellen/) | offen |
| Name und ladungsfähige Anschrift (bei Rechtsform: Vertretungsberechtigte) | § 5 Abs. 1 Nr. 1 DDG | offen |
| Schnelle elektronische Kontaktaufnahme (E-Mail) plus zweiter unmittelbarer Kommunikationsweg | § 5 Abs. 1 Nr. 2 DDG | offen |
| Ggf. Register, USt-IdNr., Aufsichtsbehörde, Berufsrecht (nur falls zutreffend) | § 5 Abs. 1 Nr. 3–6 DDG | offen |
| Redaktionell Verantwortlicher mit Anschrift, falls journalistisch-redaktionelle Inhalte (Infoportal prüfen) | § 18 Abs. 2 MStV | offen |
| Leicht erkennbar, unmittelbar erreichbar, ständig verfügbar; Offline-Nutzung bedenken (Q6) | § 5 Abs. 1 DDG | offen |
| Veraltete Verweise auf „§ 5 TMG“ vermeiden | MTH Partner (s. o.) | offen |

### 1.2 Datenschutzerklärung

| Pflichtinhalt / Prüfpunkt | Quelle | Status |
| --- | --- | --- |
| Verantwortlicher mit Kontaktdaten; ggf. Datenschutzbeauftragter | Art. 13 Abs. 1 lit. a, b [DSGVO](https://eur-lex.europa.eu/eli/reg/2016/679/oj) | offen |
| Zwecke, Rechtsgrundlagen, ggf. berechtigtes Interesse | Art. 13 Abs. 1 lit. c, d | offen |
| Empfänger bzw. Kategorien (Hosting-Anbieter), Drittlandübermittlung und Grundlage (GitHub/USA: Angemessenheitsbeschluss/DPF, SCC? – Q3) | Art. 13 Abs. 1 lit. e, f; Art. 44 ff. | offen |
| Speicherdauer bzw. Kriterien (Server-Logs beim Host; Browser-Speicher bis Löschung durch Nutzer) | Art. 13 Abs. 2 lit. a | offen |
| Betroffenenrechte, Widerruf der Einwilligung, Beschwerderecht bei Aufsichtsbehörde | Art. 13 Abs. 2 lit. b–d; Art. 15–21 | offen |
| Hinweis, ob Bereitstellung erforderlich ist; keine automatisierte Entscheidungsfindung | Art. 13 Abs. 2 lit. e, f | offen |
| Server-Logdaten (IP-Adresse etc.) beim Aufruf: Ob GitHub Auftragsverarbeiter oder eigenständig Verantwortlicher ist, wird in Praxisquellen uneinheitlich behandelt (Q3). Die Suche fand nur Beispiel-Datenschutzerklärungen, keine Primärquelle von GitHub oder einer Aufsichtsbehörde. | Beispieltexte nur als Beleg der Meinungsvielfalt: [pixelsaft.de](https://pixelsaft.de), [amedeo.com](https://amedeo.com/privacy) | offen |
| Lokale Speicherung im Endgerät: § 25 TDDDG erfasst nach Sekundärquellen auch localStorage/sessionStorage/IndexedDB; Einwilligung nötig, außer die Speicherung ist unbedingt erforderlich für einen ausdrücklich gewünschten Dienst (§ 25 Abs. 2 Nr. 2). Der vorhandene Opt-in-Schalter ist juristisch zu bewerten (Q2). | [§ 25 TDDDG](https://www.gesetze-im-internet.de/ttdsg/__25.html); DSK: [OH Digitale Dienste](https://datenschutzkonferenz-online.de/media/oh/OH_Digitale_Dienste.pdf), [OH Telemedien 2021 (V1.1)](https://datenschutzkonferenz-online.de/media/oh/20221130_OH_Telemedien_2021_Version_1_1.pdf) (Volltext hier nicht ausgewertet) | offen |
| Art. 32 DSGVO: Hinweis auf Unverschlüsselung der lokalen Kopie, gemeinsam genutzte Geräte, Export-Dateien | Art. 32 DSGVO; Repo-Status | offen |
| Drittdienste (Fonts, Karten, Analytics): laut statischem Check derzeit nicht vorhanden; vor Release erneut belegen | `scripts/privacy-technical-check.mjs` | offen |

### 1.3 Barrierefreiheitserklärung

| Prüfpunkt | Quelle | Status |
| --- | --- | --- |
| Einschlägiges Regime klären: BITV 2.0/BGG betrifft Stellen des Bundes; BFSG betrifft bestimmte Verbraucher-Produkte und -Dienstleistungen privater Anbieter (u. a. E-Commerce); Kleinstunternehmen sind bei Dienstleistungen ausgenommen (<10 Beschäftigte und ≤2 Mio. EUR Umsatz/Bilanz). Ob ein unentgeltlicher, privater Planer erfasst ist, ist offen (Q4). | [BFSG](https://www.gesetze-im-internet.de/bfsg/); [BITV 2.0](https://www.gesetze-im-internet.de/bitv_2_0/); Überblick: [IHK Köln](https://www.ihk.de/koeln/hauptnavigation/recht-steuern/barrierefreiheit-von-webseiten-dienstleistungen-und-produkten-5921172), [ZDH](https://www.zdh.de/fileadmin/noindex/Praxis_Recht/20250228_2_Praxis_Recht_Barrierefreie_Webseiten_Betriebe.pdf) | offen |
| Technischer Maßstab: EN 301 549 (für Web Bezug auf WCAG 2.1 AA laut Sekundärquelle; Versionsabgleich Q4) | [EN 301 549 (ETSI)](https://www.etsi.org/deliver/etsi_en/301500_301599/301549/) | offen |
| Falls Erklärung nötig oder gewünscht: Stand der Vereinbarkeit, nicht barrierefreie Teile mit Begründung, Datum und Methode der Bewertung, Feedback-Mechanismus, Verweis auf Durchsetzungs-/Schlichtungsstelle | BITV 2.0 § 12; BFSG § 14 (im Original zu prüfen) | offen |
| Tatsächliche Evidenz: nur automatisierte Axe-, Tastatur- und Responsive-Tests, **0 echte Screenreader-/Nutzersitzungen** (P0-E); Konformität darf nicht behauptet werden | `docs/STATUS-TECHNISCH-2026-10-19.md` | offen |

### 1.4 Haftungsausschluss / Nutzungshinweise

| Prüfpunkt | Quelle | Status |
| --- | --- | --- |
| Ein Haftungsausschluss ersetzt keine rechtliche Einordnung und kann zwingendes Recht (z. B. Vorsatz, Verletzung von Leben, Körper, Gesundheit) nicht ausschließen; Formulierung durch Jurist:in (Q5). | allgemeines Zivilrecht (§§ 276, 309 BGB bei AGB) | offen |
| Abgrenzung Rechtsdienstleistung: § 2 Abs. 1 RDG verlangt eine konkrete fremde Angelegenheit mit rechtlicher Prüfung im Einzelfall; für Rechner-Angebote betont der BGH (VIII ZR 285/18, Mietpreisrechner) eine eher großzügige Betrachtung. Übertragbarkeit auf einen Elterngeld-Planer und Wirkung von „unverbindlich“-Hinweisen sind nicht belegt (Q5). | [§ 2 RDG](https://www.gesetze-im-internet.de/rdg/__2.html); [BGH 27.11.2019](https://rewis.io/urteile/urteil/bjq-27-11-2019-viii-zr-28518/) | offen |
| Inhaltliche Grenzen sichtbar halten: Modell, nicht amtliche Berechnung; Standardfall-Eingrenzung; 2027 Prognose; Mutterschutz-Referenzen widersprüchlich; vereinfachtes Netto; Hinweis auf Elterngeldstelle | `data/release-gates.json`, Status-Dokument | offen |
| Verlinkte Fremdseiten (Familienportal etc.): Linkhaftung, Aktualität der Links | allgemein | offen |

## 2. Entwurfstexte (ENTWÜRFE – nicht veröffentlichen ohne Prüfung)

Platzhalter: `[BETREIBER_NAME]`, `[ANSCHRIFT]`, `[E-MAIL]`, `[ZWEITER_KONTAKTWEG]`, `[REDAKTIONELL_VERANTWORTLICH]`, `[HOSTING_ANBIETER_UND_ANSCHRIFT]`, `[DSB_ODER_ENTFÄLLT]`, `[DATUM]`.

### 2.1 Impressum – ENTWURF

> **[ENTWURF – nicht rechtlich bewertet]**
>
> **Anbieter:** [BETREIBER_NAME], [ANSCHRIFT]
> **Kontakt:** E-Mail [E-MAIL]; [ZWEITER_KONTAKTWEG]
> **Vertretungsberechtigt / Rechtsform:** [ANGABE, falls zutreffend]
> **Register / USt-IdNr.:** [nur falls vorhanden, sonst streichen]
> **Verantwortlich für redaktionelle Inhalte:** [REDAKTIONELL_VERANTWORTLICH, ANSCHRIFT – falls erforderlich]
> Stand: [DATUM]

### 2.2 Datenschutzerklärung – ENTWURF

> **[ENTWURF – nicht rechtlich bewertet; kein Ersatz für Beratung durch Datenschutzbeauftragte]**
>
> **1. Verantwortlicher.** [BETREIBER_NAME], [ANSCHRIFT], [E-MAIL]. Datenschutzbeauftragte:r: [DSB_ODER_ENTFÄLLT].
>
> **2. Aufruf der Seite / Hosting.** Die Seite wird über [HOSTING_ANBIETER_UND_ANSCHRIFT] ausgeliefert. Beim Abruf verarbeitet der Hosting-Anbieter technisch notwendige Zugriffsdaten (z. B. IP-Adresse, Zeitpunkt, abgerufene Datei, Browserkennung). Der Betreiber erhält [KLÄREN: ob Zugriff auf diese Logs besteht]. Rechtsgrundlage: [KLÄREN: Art. 6 Abs. 1 lit. f DSGVO?]. Übermittlung in Drittländer: [KLÄREN: Grundlage und Anbieterangaben].
>
> **3. Eingaben im Planer.** Eingaben werden im Browser auf Ihrem Gerät verarbeitet. Nach unserem Stand werden sie nicht an den Betreiber übertragen [VOR VERÖFFENTLICHUNG TECHNISCH UND RECHTLICH BESTÄTIGEN].
>
> **4. Lokale Speicherung (optional).** Nur wenn Sie dies ausdrücklich aktivieren, speichert der Planer Ihre Eingaben unverschlüsselt im lokalen Speicher Ihres Browsers (Schlüssel `elternzeit-familienplan-v3`). Sie können dies jederzeit über die Löschfunktion oder die Browser-Einstellungen entfernen. Auf gemeinsam genutzten Geräten sollten Sie die Speicherung nicht aktivieren. Rechtsgrundlage: [KLÄREN: § 25 TDDDG, Einwilligung oder Ausnahme; Art. 6 DSGVO].
>
> **5. Exporte und Druck.** JSON/CSV-Dateien und Ausdrucke erstellt Ihr Browser lokal; sie liegen danach in Ihrer Verantwortung.
>
> **6. Cookies, Tracking, Drittanbieter.** [NUR ÜBERNEHMEN, WENN VOR RELEASE BELEGT: Es werden keine Cookies gesetzt und keine Analyse- oder Drittanbieterdienste eingebunden.]
>
> **7. Ihre Rechte.** Auskunft, Berichtigung, Löschung, Einschränkung, Widerspruch, Datenübertragbarkeit sowie Widerruf erteilter Einwilligungen; Beschwerde bei einer Datenschutz-Aufsichtsbehörde: [ZUSTÄNDIGE BEHÖRDE EINTRAGEN].
>
> Stand: [DATUM]

### 2.3 Barrierefreiheitserklärung – ENTWURF

> **[ENTWURF – Konformität NICHT festgestellt; Pflicht und Muster klären]**
>
> [BETREIBER_NAME] bemüht sich, den Planer für möglichst viele Menschen nutzbar zu machen. Maßstab ist [KLÄREN: EN 301 549 / WCAG 2.1 AA bzw. 2.2].
>
> **Stand:** Bisher liegen ausschließlich automatisierte Prüfungen (Axe, Tastatur- und Responsive-Tests) vor. Eine manuelle Prüfung mit Screenreadern und Mobilgeräten sowie Nutzertests mit Betroffenen wurden **noch nicht durchgeführt**. Eine Aussage zur Konformität kann daher derzeit nicht getroffen werden.
>
> **Bekannte Einschränkungen:** [NACH MANUELLER PRÜFUNG EINTRAGEN]
>
> **Barrieren melden:** [E-MAIL] / [ZWEITER_KONTAKTWEG]. Zuständige Durchsetzungs-/Schlichtungsstelle: [KLÄREN].
>
> Erstellt am: [DATUM]

### 2.4 Hinweise zur Nutzung / Haftungsausschluss – ENTWURF

> **[ENTWURF – juristisch zu formulieren]**
>
> Der Planer ist ein Modell zur Orientierung und Planung. Er ersetzt weder eine amtliche Berechnung noch eine Beratung durch Elterngeldstelle, Steuer- oder Rechtsberatung. Ergebnisse sind unverbindlich; maßgeblich ist allein der Bescheid der zuständigen Stelle. Der Standardfall ist eingegrenzt (siehe Seite „Grenzen“); Angaben zu 2027 sind Prognosen. Das Netto für das Elterngeld wird von Ihnen eingegeben und nicht amtlich ermittelt. [HAFTUNGSREGELUNG: durch Jurist:in zu formulieren, gesetzliche Grenzen beachten.] Verlinkte externe Seiten liegen außerhalb unserer Kontrolle.

## 3. Offene Fragen für Jurist:in / Datenschutzbeauftragte

- **Q1 Impressumspflicht:** Besteht bei einem unentgeltlichen, nicht kommerziellen Angebot einer Privatperson eine Pflicht nach § 5 DDG? Falls ja: welche Anschrift (Wohnadresse vs. Postfach-/c/o-Lösungen)? Gilt § 18 MStV für das Infoportal?
- **Q2 Lokale Speicherung:** Ist localStorage mit Opt-in-Schalter und Löschfunktion nach § 25 TDDDG als „unbedingt erforderlich“ einzustufen, oder ist eine Einwilligung nach DSK-Maßstäben nötig und reicht der vorhandene Schalter? Ist der Betreiber für Daten verantwortlich, auf die er keinen Zugriff hat?
- **Q3 Hosting GitHub Pages:** Rollenverteilung (Auftragsverarbeiter, gemeinsam oder eigenständig Verantwortliche), nötiger AV-Vertrag, Drittlandgrundlage (DPF/SCC), Rechtsgrundlage und Transparenzangaben für IP-/Log-Verarbeitung, Erfordernis einer Datenschutzfolgenabschätzung. Positionen der Landesdatenschutzbehörden sind hier nicht im Original ausgewertet. Alternative: EU-Hosting?
- **Q4 Barrierefreiheit:** Fällt der Betrieb unter BFSG (Verbraucher-Dienstleistung? Kleinstunternehmen? Unentgeltlichkeit?) oder BITV/BGG? Ist eine Barrierefreiheitserklärung Pflicht oder freiwillig? Welche WCAG-Version ist maßgeblich?
- **Q5 RDG / Haftung:** Bleibt der Planer im Rahmen des § 2 RDG, insbesondere mit Hinweisen zu Elterngeld, Mutterschutz, Steuern? Welche Haftungsklauseln sind wirksam, welche Formulierungen vermeiden Irreführung (UWG)? Ist eine Versicherung sinnvoll?
- **Q6 Offline-Paket:** Müssen Impressum/Datenschutz/Erklärungen in den heruntergeladenen oder offline gespeicherten Dateien enthalten sein, und wie wird deren Aktualität sichergestellt (Versionsangabe, Hash)?
- **Q7 Besondere Datenkategorien:** Entstehen durch Geburts-/Mutterschutzdaten besondere Kategorien (Art. 9 DSGVO) oder Hinweispflichten, obwohl nur lokal verarbeitet?
- **Q8 Betrieb:** Wer ist Verantwortlicher (Person/Verein/Firma), wer bearbeitet Betroffenenanfragen, Löschkonzept für Logs, Meldeweg bei Datenpannen?
- **Q9 Urheber-/Lizenzfragen:** Illustrationen (WebP), Texte aus amtlichen Quellen, Linkhinweise.

## 4. Nächste Schritte (außerhalb dieses Dokuments)

Betreiberentscheid und Hostingform festlegen; Q1–Q9 klären lassen; Texte nach Beratung finalisieren; Technikbelege aktualisieren; erst danach gesondertes Go/No-Go durch die Verantwortlichen. Dieses Dokument ist dafür weder Beleg noch Freigabe.
