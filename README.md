# Hair Lounge 104 — Designvorschau

Unabhängiger Website-Entwurf von MakeSimpleIT, erstellt auf Barans Auftrag am 26.10.2026. Keine offizielle Veröffentlichung des Salons. Statisches HTML/CSS/JavaScript, direkt mit GitHub Pages auf `main` im Repository-Root auslieferbar.

## Lokal ansehen

`python3 -m http.server 8765` im Projektordner starten. Keine Build-Abhängigkeiten. Pfade sind relativ und unterstützen GitHub Pages Unterverzeichnisse.

## Gestaltung und Funktion

Warme Naturtöne, originale Wortmarke, Cormorant Garamond und DM Sans lokal, große Editorial-Typografie. Ausschließlich echte Fotos des Salons, keine KI-generierten Bilder.

Bewegung ohne Bibliotheken (CSS, Web Animations API, IntersectionObserver, ein bedarfsgesteuerter `requestAnimationFrame`-Takt):

- Logo-Vorhang beim ersten Besuch pro Sitzung, danach Zeilen-Einblendung der Headline und Bildvorhang im Hero.
- Hero-Bildwechsel mit vier echten Looks: Wisch von unten, Fortschrittsbalken als Timer, Auswahl per Klick, Pause-Taste; pausiert außerhalb des Sichtbereichs.
- Laufband der Leistungen, das mit der Scrollgeschwindigkeit beschleunigt und die Richtung übernimmt.
- Bild-Enthüllungen per `clip-path`, Parallaxe in Bildrahmen, Jahreszähler, Wort-für-Wort-Statement.
- Looks-Galerie: ab 1000 × 680 px fixiert, vertikales Scrollen bewegt sie seitlich; darunter native, wischbare Leiste.
- Leistungen: Foto folgt dem Mauszeiger, animierte Akkordeons (`::details-content`, wo unterstützt).
- Drei dezent animierte Salonfotos als Loops, nur im Sichtbereich geladen und abgespielt.
- Live-Öffnungsstatus in Europe/Berlin nach den regulären Zeiten, magnetischer Anruf-Button, mitlaufender Header.

`prefers-reduced-motion` entfernt Bewegung, Autoplay, Fixierung und Videos; Inhalte bleiben ohne JavaScript sichtbar. Kontakt per Telefon/E-Mail; keine vorgetäuschte Buchungsfunktion. Keine eingebetteten Drittanbieter oder Analysewerkzeuge. Designvorschau sichtbar gekennzeichnet, Suchmaschinenindexierung unterbunden.

## Quellen und Bildrechte

- Inhalte, Preise, Team- und Salonbild `salon-wide`, `lounge`, Logo: https://www.hair-lounge-104.de/ sowie /preise/ und /impressum/, gelesen am 26.10.2026.
- Looks (`assets/looks/`) und Salonfotos (`assets/salon/`): Instagram-Profil https://www.instagram.com/hairlounge104/, abgerufen am 26.10.2026. Bewusst nur Aufnahmen ohne Gesichter von Kundinnen. Herkunft je Datei: `balayage` CH0jcRNlUp-, `kupfer` CPJQWyNAYr7, `blond` CQbfVXPg6yp, `rotbob` ClOwYL6MI0w, `straehnen` CCLiXYLK9fh, `beach-waves` CCG_52PqCAB, `bob` BQ5CuUPBQzy, `platin` CqGln4mMv9U, `kupferbraun` CO3Q9IkAAMu, `locken` BTTzPxjhkUv, `pastell` CiQLYiisCMv, `ombre` BTHBSbjhx8u, `blond-balayage` CQoXe0sMHP8, `bar` BS0W6AUhEM3, `raum` BRffMADBElA, `kerzen` Be48CgEh_5h, `wellness` und `kamin` Cq8eaaXMhcy (Beitrags-Kürzel hinter instagram.com/p/).
- Instagram-Rahmen beschnitten. `kupfer`, `rotbob`, `platin`, `kupferbraun`, `locken`, `pastell`, `ombre`, `blond-balayage`, `bar`, `kerzen`, `wellness` und `kamin` mit Higgsfield (`bytedance_image_upscale`, 2K, je 2 Credits) hochskaliert.
- Loops (`assets/loops/`): echte Fotos `kamin`, `kerzen`, `bar` als Start- und Endbild mit Higgsfield MiniMax H3 (5 s, 2K, stehende Kamera, je 10 Credits) dezent animiert, Jobs `3a0e50cf-646e-4ef5-a39e-6575631a7e66`, `e44bbbf4-c2e4-4393-a29a-ef532059439f`, `dbd44f3a-0d26-42bf-9724-fb9897ded315`. Auf der Seite gekennzeichnet.
- Salon-Angebote aus Instagram: Wellness-Haarwäsche im Massage-Sessel (Beitrag Cq8eaaXMhcy), Refill-Station (DWeY40KDOp2), Gründung im Januar 2008 (Jubiläumsbeiträge BeNjNK7hVK7 und DFFjOfDsVTC).
- Alle Fotos: Hair Lounge 104. Alle Rechte bei den jeweiligen Rechteinhabern; dieses Repository erteilt keine Lizenz an den Salonassets. Eine reguläre Salonveröffentlichung setzt deren Freigabe voraus.
- Telefonnummer und Postleitzahl: Kontaktbereich und Impressum stimmen mit `0234 5798529`, `44795 Bochum` überein. Abweichende Angaben im alten Header/Footer wurden nicht übernommen.
- Keine erfundenen Bewertungen, Teamnamen oder Kundenarbeiten. Schriften: Google Fonts, SIL Open Font License; Lizenztexte unter assets/.

Die Preise bilden den veröffentlichten Stand zum Abrufdatum ab; die Texte sind neue Gestaltungsvorschläge. Das verlinkte Salon-Impressum wird nicht als Impressum dieses unabhängigen Entwurfs ausgegeben.
