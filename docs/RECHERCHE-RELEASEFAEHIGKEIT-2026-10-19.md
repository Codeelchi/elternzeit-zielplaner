# Recherche zur Release-Fähigkeit – 19. Oktober 2026

**Status unverändert: öffentlicher Produktrelease NO-GO.** Diese Notiz ersetzt keine externe Fach-, Rechts- oder Datenschutzfreigabe.

## 1. Mutterschutz-Resttage (P0-A) – Rechenweg zur Vorlage beim Fachreview
- § 3 Abs. 2 MuSchG: Schutz „bis zum Ablauf von acht Wochen nach der Entbindung“; maßgeblich ist der tatsächliche Entbindungstag ([KomNet NRW](https://www.komnet.nrw.de/_sitetools/dialog/4244)).
- § 187 Abs. 1 BGB: Der Entbindungstag wird nicht mitgezählt; nach § 188 Abs. 2 BGB endet die Wochenfrist mit dem Tag der letzten Woche, der dem Ereignistag in der Benennung entspricht. Für Geburt 20.05.2026 (Mittwoch) ergibt das **15.07.2026** (Geburt + 56 Tage) – so rechnet das Modell (4 Resttage im Lebensmonat bis 19.07.).
- Das Familienportal-Beispiel (14.07., 5 Tage) weicht ab. Die Ursache (andere Zählweise oder Beispielsdaten) ist ungeklärt; die Seite war in dieser Umgebung nicht abrufbar.
- **Bewertung:** Das stützt die Modellannahme, ist aber eine eigene Herleitung. Die Gate-Bedingung (schriftliche Bestätigung durch Elterngeldstelle oder Fachperson) bleibt offen.

## 2. Elterngeldreform 2027
- Nach Sekundärquellen ([Haufe](https://www.haufe.de/personal/arbeitsrecht/aktuelles-zur-elterngeldreform_76_509900.html), [elterngeld.net](https://www.elterngeld.net/elterngeld-kuerzung.html)): Referentenentwurf seit Juli 2026 in der Ressortabstimmung, kein Kabinettsbeschluss. Berichtet werden 12 statt 14 Basismonate (3 je Elternteil, 6 frei), Mindestbetrag 330 €, Höchstbetrag 1.900 €, Einkommensgrenze 175.000 € unverändert, Geltung für Geburten ab 01.11.2027.
- Die Primärquelle (Entwurfstext) wurde nicht abgerufen. Die Werte stehen deshalb nur als Hinweis in `data/rechtsentwicklungen-2027-2026-10-15.json` und fließen **nicht** in Berechnungen ein. Die App behandelt 2027 weiter als nicht unterstützt.

## 3. Technischer Stand dieser Prüfung
- Frisches `npm ci`, `npm test`: 518/518. Chromium (`npx playwright test`): 93/93.
- `npm run release:check` bleibt gesperrt (erwartet). Der Browser-Nachweis (HTML-SHA256) ist nach der Rechtsdaten-Änderung neu zu erzeugen.

## 4. Was nur extern erledigt werden kann
Mutterschutz-Bestätigung, 10 unabhängige Referenzfamilien, moderierte Nutzertests und Screenreader-Prüfung, Betreiber-/Impressums-/Datenschutzentscheid. Dafür ist kein Agent-Ersatz zulässig.
