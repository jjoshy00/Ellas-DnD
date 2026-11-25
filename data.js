// Regelwerk der Kampagne (aus den Unterlagen der Spielleiterin).
// Hier lassen sich Namen und Werte anpassen, ohne die App selbst zu ändern.

window.RULES = {
  startLP: 50,
  lpPerLevel: 1,
  resourcePerLevel: 1,
  equipmentSlots: 9,  // Ausrüstungsslots (Namen sind in der App frei wählbar)
  // Level (Tabelle „DnD_Orga_Punkte_NEU“): Punkte, ab denen das nächste Level erreicht ist (Level 0 → 1 ab 5 Punkten …).
  levelPoints: [5, 10, 15, 20, 25, 30, 36, 42, 48, 54, 60, 67, 74, 81, 88, 95, 103, 111, 119, 127, 135],
  // Boni pro Aufstieg, je nach Level, von dem aus aufgestiegen wird.
  levelBonus: [
    { from: 0, lp: 1, res: 1, attr: 1 },
    { from: 5, lp: 2, res: 1, attr: 1 },
    { from: 10, lp: 2, res: 2, attr: 1 },
    { from: 15, lp: 2, res: 2, attr: 2 },
    { from: 20, lp: 3, res: 2, attr: 2 },
    { from: 25, lp: 3, res: 3, attr: 2 },
    { from: 30, lp: 3, res: 3, attr: 3 },
  ],
  // Bepunktete Aktionen: [Name, Punkte regulär, Punkte besonders]
  pointActions: [
    ['Angriff', 1, 2],
    ['Verteidigung', 1, 2],
    ['Ausprobieren (geht gut aus)', 2, 3],
    ['Ausprobieren (geht schlecht aus)', 2, 3],
    ['Redegewandtheit', 2, 3],
    ['Item kreativ eingesetzt', 2, 2],
    ['Sorgt dafür, dass die DM den Kopf auf den Tisch klopfen will', 1, 2],
    ['Erfindet etwas (Zauber/Objekt)', 3, 3],
  ],
  // Wechselkurse: 1000 Kupfer = 1 Silber, 1000 Silber = 1 Gold
  exchange: { kPerS: 1000, sPerG: 1000 },
  guildMax: 10,   // Abenteurergilde: Stufe 0–10
  // Laufzettel der DM (Google-Tabelle): rote Zahl = Position auf dem Ausrichtungs-Chart, Summe = Punkte.
  laufzettel: { sheetId: '1Bucq40p-VDb47HDRdqjeQQpJTg0EFQ1WSLrpbkA1arA', grid: 15, region: 5 },
  inventorySlots: 3,   // Grund-Inventarslots, + 1 je Stufe Traglast, + Ausbau

  classes: {
    zauberer: { name: 'Zauberer', resource: 'Mana', color: '#8e3fa0', light: '#efe0f3' },
    kaempfer: { name: 'Kämpfer', resource: 'Ausdauer', color: '#2b3196', light: '#dfe1f4' },
    kuenstler: { name: 'Künstler', resource: 'Inspiration', color: '#d9a400', light: '#fff4cc' },
    handwerker: { name: 'Handwerker', resource: 'Geduld', color: '#3d7d1e', light: '#e2efd9' },
  },

  // Attributfähigkeiten: 5 Farbgruppen. Die letzte Fähigkeit jeder Gruppe ist erst
  // skillbar, wenn alle anderen der Gruppe mindestens Stufe 1 haben.
  attributeGroups: [
    { color: '#c62828', skills: [
      ['Physische Stärke', 'Für alle Aktionen, die physische Stärke erfordern (z. B. situativ im Kampfgeschehen, um Sachen anzuheben oder zu bewegen, falls man mal länger an einer Klippe hängen möchte, …).'],
      ['Mentale Stärke', 'Für alle Aktionen, die mentale Stärke erfordern (z. B. als Verteidigung gegen psychische Angriffe). Kann ggf. in Kombination mit Auftreten verwendet werden, um andere noch besser zu überzeugen.'],
      ['Traglast', 'Ermöglicht das Tragen von Dingen, die sonst nicht in die Tasche passen würden. Pro Ausbaustufe 1 Itemplatz mehr.'],
      ['Akrobatik', 'Für alle Aktionen, die nach einem Zirkusartisten verlangen.'],
      ['Athletik', 'Einsetzbar, um zu rennen, schwimmen, klettern oder springen (Geschwindigkeit, Höhe, Weite).'],
      ['Lebenspunktebonus', '2 LP pro Ausbaustufe mehr.'],
    ] },
    { color: '#222222', skills: [
      ['Fingerfertigkeit', 'Zum Schlösser knacken, für Kartenspielertricks oder zum Stehlen.'],
      ['Heimlichkeit', 'Je nach Stufe entsprechender Bonus auf das Würfeln, wenn man etwas ungesehen erledigen möchte.'],
      ['Motiv erkennen', 'Spricht dein Gegenüber die Wahrheit? Hat er eine bestimmte Intention? Wenn du jemanden durchschauen möchtest, gibt es entsprechende Boni auf die Würfelzahl.'],
      ['Wahrnehmung', 'Zum Fallen oder Hinweise erkennen (z. B. in Dungeons oder auf der Suche nach verlorenen Kätzchen).'],
      ['Täuschen', 'Willst du, dass andere etwas glauben, das nicht der Wahrheit entspricht? Gilt sowohl für physische Aktionen als auch für Erzählungen deinerseits.'],
      ['Überlebenskunst', 'Pro Ausbaustufe 1 Rettungswurf mehr.'],
    ] },
    { color: '#13875f', skills: [
      ['Konstitution', 'Um entsprechend der Ausbaustufe Würfe zu wiederholen, wo es sonst nicht machbar wäre (z. B. in Dungeons nach Fallen Ausschau halten, einen Trick nochmal vorführen, einen fehlgeschlagenen Angriff wiederholen).'],
      ['Giftresistenz', 'Je nach Ausbaustufe Boni auf die Resistenz.'],
      ['Hitzeresistenz', 'Je nach Ausbaustufe Boni auf die Resistenz.'],
      ['Kälteresistenz', 'Je nach Ausbaustufe Boni auf die Resistenz.'],
      ['Magieresistenz', 'Je nach Ausbaustufe Boni auf die Resistenz.'],
      ['Rettungswurfbonus', 'Pro Ausbaustufe ein entsprechender Bonus auf das Würfeln bei Rettungswürfen.'],
    ] },
    { color: '#8e1a8e', skills: [
      ['Arkane Kunde', 'Wann immer Wissen um arkane Belange erforderlich ist, gibt es entsprechenden Würfelbonus.'],
      ['Erforschung', 'Boni beim Untersuchen von Dingen.'],
      ['Naturkunde', 'Bei Würfeln zum Untersuchen der lokalen Flora und Fauna gibt es entsprechend Boni.'],
      ['Allgemeinwissen', 'Wann immer Wissen zur Politik, zum aktuellen wissenschaftlichen Stand zu etwas, zur Architektur, … erforderlich ist, gibt es entsprechend der Ausbaustufe Würfelboni.'],
      ['Mit Tieren umgehen', 'Falls man mal eine Katze davon überzeugen möchte, vom Baum herunterzukommen, herausfinden möchte, was das Tier möchte/braucht, oder es dazu überreden möchte, sein Haustier zu werden.'],
      ['Heilkunde', 'Mit W4 auf Heilungsgrad würfeln, pro Ausbaustufe ein Punkt mehr (z. B. 2 gewürfelt, Ausbaustufe 4 = 6 LP auffüllen).'],
    ] },
    { color: '#e66a00', skills: [
      ['Einschüchtern', 'Boni in Höhe der Ausbaustufe auf Würfe zum Einschüchtern anderer.'],
      ['Überzeugen', 'Boni in Höhe der Ausbaustufe auf Würfe zum Überzeugen anderer.'],
      ['Auftreten', 'Boni in Höhe der Ausbaustufe auf Würfe für Aktionen, die eine gewisse Präsenz verlangen.'],
      ['Waffenkunde', 'Das Auskennen und der Umgang mit Waffen. Boni beim Untersuchen von Waffen oder ATK-Boni beim Verwenden.'],
      ['Kampfkunst', 'Das Auskennen und der Umgang mit Kampfkünsten. Boni beim Herausfinden, was das Gegenüber anwendet, oder ATK-Boni beim Verwenden.'],
      ['Kampfgeist', 'Pro Ausbaustufe 1 Ausdauer-/Mana-/Geduld-Punkt mehr.'],
    ] },
  ],

  // Klassenfähigkeiten je Unterklasse (Fähigkeiten_<Klasse>.txt), Stufen 1–6.
  subclasses: {
    zauberer: {
      'Druide (Gut, Gesetzestreu)': [
        ['Verwandlung', 'Der Spieler kann Tiergestalt annehmen. Pro Stufe ein Tier wählbar. Verwendung kostet stufenunabhängig 5 Manapunkte, Rückverwandlung 3.'],
        ['Naturkunde', 'Auskennen/Wissen um Pflanzen und Tiere, sowie Mythische.'],
        ['Wunder', 'Stufe 1, 2: 5 Manapunkte; Stufe 3, 4: 10 Manapunkte; Stufe 5, 6: 15 Manapunkte. Der Spieler kann Wunder wirken (Absprache mit DM).'],
      ],
      'Magier (Neutral, Gesetzestreu)': [
        ['Papierkram', 'Kennt alles und kann alles ausfüllen/finden.'],
        ['Autorität', 'Der Spieler hat die Befehlsgewalt.'],
        ['Abrakadabra', 'Kann neue Zauber erschaffen. DM entscheidet, wie viele MP die kosten/wie hoch gewürfelt werden muss, damit sie gelingen.'],
      ],
      'Kleriker (Böse, Gesetzestreu)': [
        ['Anhänger/Fanatiker', 'Der Spieler kann NPCs zu Anhängern (seiner evtl. imaginären) Gottheit machen. Der Spieler kann Reden vor NPCs halten, um sie von etwas zu überzeugen/aufzuhetzen – für die Anzahl der Überzeugten wird zusätzlich ein Würfel in Höhe der gesetzten Manapunkte (4 MP = W4) gewürfelt.'],
        ['Besessenheit', 'Der Spieler wird von einem Dämon besessen (es folgt noch eine Liste mit beschwörbaren Dämonen). Diese geben entsprechend Boni.'],
        ['Zorn des Gottes/Katastrophe', 'Stufe 1, 2: 5 Manapunkte; Stufe 3, 4: 10 Manapunkte; Stufe 5, 6: 15 Manapunkte. Der Spieler kann Katastrophen auslösen (Absprache mit DM).'],
      ],
      'Doktor (Gut, Neutral)': [
        ['Heilung', 'Füllt die LP auf/heilt Verletzungen. Ab Stufe 5 kann ein Spieler, der alle seine Rettungswürfe aufgebraucht hat, wiederbelebt werden. Stufe 6 ermöglicht zusätzlich, die Rettungswürfe wieder aufzufüllen (W4 bestimmt wie viele) – funktioniert nur bei Spielern, die zuvor sämtliche Rettungswürfe aufgebraucht haben.'],
        ['Amputation', 'Magisches Amputieren und Anfügen von Körperteilen.'],
        ['Wundübertragung', 'Der Spieler kann Verletzungen/Schaden auf andere übertragen.'],
      ],
      'Hexer (Böse, Neutral)': [
        ['(Charm-)ante Zauber', 'Kann die Zauber anderer „klauen“ und als Charm einsetzen.'],
        ['Poltergeist', 'Der Spieler kann Geister/Dämonen/Engel/Fey in Objekte einpflanzen (Liste mit Wesenheiten folgt).'],
        ['Flüche', 'Wer würde nicht gerne den Idioten vor seinen Augen in einen Frosch verwandeln oder 5× am Tag stolpern lassen? Der Spieler kann Flüche aussprechen (Liste folgt).'],
      ],
      'Alchemist (Gut, Chaotisch)': [
        ['Stein der Weisen', 'Der Spieler kann Metalle, Mineralien, Material, … erschaffen/verändern (Absprache mit DM erforderlich).'],
        ['Verzauberung', 'Effektverleihung mittels magischer Zutaten.'],
        ['Erschaffer', 'Der Spieler kann mittels entsprechender Zutaten/Materialien Dinge erschaffen (Absprache mit DM).'],
      ],
      'Wahrsager (Neutral, Chaotisch)': [
        ['Eingebung', 'Hilfe vom DM.'],
        ['Seance', 'Der Spieler kann eine Seance abhalten und mit den Toten kommunizieren.'],
        ['Kristallkugel', 'Objekt; kann mit Charms (z. B. Teleport) belegt werden. Auch gut, um NPCs hereinzulegen, indem man ihnen damit die Zukunft voraussagt (für Taschengeld oder um sie zu manipulieren).'],
      ],
      'Nekromant (Böse, Chaotisch)': [
        ['Nekromantie', 'Beschwörung von (Un-)Toten / (Un-)Tote auferstehen lassen.'],
        ['Zersetzung', 'Kann genutzt werden, um z. B. Metalle rosten zu lassen oder Lebewesen altern zu lassen. Zusätzlich zum W6 (Fähigkeiten-Stufen-Würfel) muss ein W100 gewürfelt werden (für %).'],
        ['Opfergabe', 'Der Spieler kann seine Lebensenergie als Mana verwenden. Der Spieler kann einem Unschuldigen das Leben nehmen, um seine wieder (bis zum Maximum) aufzufüllen.'],
      ],
    },
    kaempfer: {
      'Paladin (Gut, Gesetzestreu)': [
        ['Segen', 'Bedingung: Anhänger einer Gottheit sein. Es können Segenssprüche (ggf. Heilsprüche) für Waffen/Ausrüstung/Lebewesen ausgesprochen werden. Absprache mit DM (es werden noch Gottheiten eingeführt – die möglichen Segen sind von der Gottheit abhängig. Gern darf der Spieler auch – in Absprache mit DM! – eine erfinden).'],
        ['Schlachtruf', '2 Anwendungsmöglichkeiten: Überzeugen von Mitstreitern/Einschüchtern von Gegnern (gibt je nach Ausbaustufe entsprechenden Bonus auf Würfelzahl) // Energie der Mitstreiter auffüllen/erhöhen (Ausdauer/Mana/Geduld) je nach Ausbaustufe (1–6 Punkte).'],
        ['Vertrauen', 'Andere vertrauen dem Spieler instinktiv. Kann genutzt werden, um z. B. den Gegner dazu zu bringen, seine Waffen niederzulegen, in Verhandlungen die Wahrheit erzählt zu bekommen, generelle Hilfsbereitschaft der NPC zu fordern, … .'],
      ],
      'Wächter (Neutral, Gesetzestreu)': [
        ['Schild', 'Boni, wenn man andere schützt, sowie Anstieg der LP + VP (ausbaustufenabhängig).'],
        ['Grausamkeit', 'Böse Taten, die dem Schutz anderer dienen, werden als neutral gewertet.'],
        ['Beschützer', 'Kann sich an andere binden/andere zu seinen Schutzbefohlenen machen. Die Ausführung des Beschützers kostet beide Energie (situationsabhängig wen wie viel). Stufe 1: Übernahme von 25 % des Schadens, wenn er sich in der Nähe des anderen befindet. Stufe 2: 50 % des Schadens in der Nähe. Stufe 3: 50 % des Schadens, egal wo sich der andere befindet. Stufe 4: 100 % des Schadens, egal wo. Stufe 5: 100 %, egal wo, sowie Teleportation zum Schutzbefohlenen / kann von dem anderen beschworen werden, wenn sich dieser in Gefahr befindet. Stufe 6: wie Stufe 5, zusätzlich kann er intervenieren (wird z. B. der Schutzbefohlene angegriffen, wird der Beschützer dazwischen teleportiert und kann eine Verteidigungsaktion ausführen, bevor die ATK des Angreifers trifft).'],
      ],
      'Assassine (Böse, Gesetzestreu)': [
        ['Tarnung/Zwielicht', 'Der Spieler kann sich vor anderen verbergen.'],
        ['Zutritt', 'Der Spieler kann sich so ziemlich überall Zutritt verschaffen (sei es durch Schlösser knacken oder indem er andere dazu bringt, ihm den Zutritt zu gestatten).'],
        ['Informationsbeschaffung', 'Ggf. Tipps/Info/Hilfe vom DM / weiß immer, wo welche Informationen zu erhalten sind, und kann diese dem entsprechenden Buch/NPC entlocken.'],
      ],
      'Ritter (Gut, Neutral)': [
        ['Gehorsam/Treueschwur', 'Schwöre jemandem die Treue. Dieser kann dir dann Befehle geben – beim Befolgen der Befehle gibt es Boni beim Würfeln, beim Verweigern/Missachten Abzüge. Die auf Befehl ausgeführten Aktionen verändern nicht den Gut/Neutral-Status des Ritters, sondern den des Befehlsgebers. Der Befehl kostet beide entsprechend Energie (Ausdauer/Mana/Geduld). Stufe 1: W4, W6, W10, W12 = ±1; W20 ±2; W100 ±5. Stufe 2: ±2; W20 ±3; W100 ±10. Stufe 3: ±3; W20 ±4; W100 ±15. Stufe 4: ±4; W20 ±5; W100 ±20. Stufe 5: ±5; W20 ±6; W100 ±25. Stufe 6: ±6; W20 ±7; W100 ±30.'],
        ['Ritterlichkeit', 'Wenn z. B. jemand von dir gerettet wird oder du dich jemandem gegenüber ritterlich verhältst, ist dir diese Person dankbar und bereit, etwas für dich zu machen.'],
        ['Korrektheit', 'NPCs denken, dass das, was der Spieler da gerade macht/sagt, schon richtig sein wird, und agieren entsprechend. Der Spieler wird z. B. nicht verhaftet, wenn er jemanden auf offener Straße angreift, oder er beschuldigt andere/deklariert sie als Verbrecher und diese werden dann inhaftiert, …'],
      ],
      'Räuber (Böse, Neutral)': [
        ['Diebstahl', 'Es fällt dir sehr leicht, Personen/Gebäude auszurauben.'],
        ['Überfall', 'Angriffsbonus bei Überfällen (Überraschungsangriffen) für den Spieler sowie die Mitspieler, die an dem Überfall teilnehmen. Stufe 1: Spieler +1, Mitspieler +1. Stufe 2: S +2, MS +1. Stufe 3: S +3, MS +2. Stufe 4: S +4, MS +2. Stufe 5: S +5, MS +3. Stufe 6: S +6, MS +3.'],
        ['Hehlerei', 'Der Spieler kann seine Ware immer verkaufen (auch gestohlene Objekte).'],
      ],
      'Waldläufer (Gut, Chaotisch)': [
        ['Naturkunde', 'Spieler kann Fährten lesen, Flora und Fauna identifizieren, Boni auf Rettungswürfe (Überlebenskunst – stufenabhängig).'],
        ['Fortbewegung', 'Spieler kann sich mit erhöhter Geschwindigkeit fortbewegen, besser klettern, stolpert nicht – auch bei unebenem Gelände.'],
        ['(un-)bekanntes Terrain', 'Der Spieler kann Lagepläne erstellen (bekommt eine Map vom DM), findet sich schnell zurecht und kann Gefahren/Vorteile erkennen.'],
      ],
      'Söldner (Neutral, Chaotisch)': [
        ['Erst das Geld', 'Der Spieler kann das Geld/die Belohnung bereits bei Annahme des Auftrages einfordern.'],
        ['Waffenmeister', 'Der Spieler kann jede Waffe handhaben.'],
        ['Gefahrenzulage', 'Umso gefährlicher die Situation, desto höher der Gelddrop. Der Spieler kann Geld „opfern“ – je nach Höhe der Summe gibt es Boni (quasi Boni beim DM einkaufen // stufenabhängig).'],
      ],
      'Berserker (Böse, Chaotisch)': [
        ['Alles ist eine Waffe', 'Alles kann in eine Waffe „verwandelt“ werden. Hält einen Spielzug.'],
        ['Erst Handeln, dann Fragen stellen', 'Initiativhoheit. Der Spieler darf sich quasi vordrängeln (sowohl vor Mitspielern als auch vor NPCs) und vor allen anderen seinen Zug machen.'],
        ['Platz da!', 'Einige bis alle gehen dir auf deinen Befehl hin aus dem Weg.'],
      ],
    },
    kuenstler: {
      'Autor (Gut, Gesetzestreu)': [
        ['Zitat', 'Aussagen mit seriös klingender Quellenangabe sind glaubhaft.'],
        ['Gelehrter', 'Verfassen von Schriften, die Einfluss auf die Welt haben.'],
        ['Denkpause', 'Aussetzen des Geschehens / „Zeit anhalten“, damit Spieler z. B. mitten im Kampfgeschehen Strategien besprechen können.'],
      ],
      'Koch (Neutral, Gesetzestreu)': [
        ['Gerichte', 'Wirkungen von Lebensmitteln verstärken/verändern, indem daraus ein Gericht kreiert wird.'],
        ['Empfehlung der Küche', 'Andere müssen sein Gericht konsumieren.'],
        ['Prometheus', 'Kann eigenes Anbauen/Züchten. Menge/Größe je nach Ausbaustufe. Es muss zuvor ein entsprechendes Stück Land gekauft werden.'],
      ],
      'Gamer (Böse, Gesetzestreu)': [
        ['Herausforderung', 'Der Spieler kann andere zu einem Spiel (Kartenspiel, Schere – Stein – Papier, …) herausfordern.'],
        ['Pokern', 'Verhandlung mit dem Schicksal (DM). Der Einsatz sollte entsprechend der Situation ausfallen …'],
        ['Simulation', 'Simulation der Realität (z. B. Austesten von Mechaniken ohne reale Konsequenzen).'],
      ],
      'Maler (Gut, Neutral)': [
        ['Hyperrealismus', 'Zeichne Bilder so echt, dass sie begehbar werden. Stufe 1: Einlagerung von Objekten, klein (6 Itemplätze). Stufe 2: Einlagerung von Objekten, groß (12 Itemplätze). Stufe 3: Du kannst deine Bilder betreten/verlassen. Stufe 4: Lebewesen (außer Personen) können ins Bild gebannt werden. Stufe 5: Du kannst alles und jeden ins Bild bannen oder entfernen. Stufe 6: Du kannst je nach Bild alles ein- und ausgehen lassen.'],
        ['Abstraktion', 'Erwecke deine Zeichnungen zum Leben (der Spieler muss tatsächlich etwas zeichnen). Umso höher die Ausbaustufe, desto mehr darf der Spieler an bereits Vorgezeichnetem verwenden. Hierfür muss zunächst der Gegenstand Skizzenheft/Skizzenbuch erworben werden (Stufe 1 eines, Stufe 2 zwei, …).'],
        ['Radierung', 'Rückgängig machen/Entfernen von Hyperrealismus/Abstraktion.'],
      ],
      'Schneider (Böse, Neutral)': [
        ['Modetrend', 'Kreieren von Kleidung (ggf. mit besonderen Eigenschaften); Umnähen von Kleidungsstücken.'],
        ['Modesünde', 'Wenn der Spieler Kleidungsstücke als hässlich/Modesünde erkennt, kann er diese ohne Gegenwehr/Widerworte dem Gegenüber abnehmen. Begründung erforderlich!'],
        ['Diva', 'Mit den Worten „Das können wir so nicht machen“ (oder ähnlich) können alle Konstrukte verworfen werden.'],
      ],
      'Zirkusartist (Gut, Chaotisch)': [
        ['Schauspieler', 'Die Kunst, sich glaubhaft zu verstellen.'],
        ['Zauberkünstler', 'Nicht-magische Zaubertricks aller Art ausführen.'],
        ['Akrobat', 'Jonglieren, Trapezkünste, Balanceakt, … alles Akrobatische ist möglich.'],
      ],
      'Barde (Neutral, Chaotisch)': [
        ['Sex', 'Der Spieler erhält einen Charismaboost – Ausbaustufe × 2.'],
        ['Drugs', 'Bewusstseinserweiterung durch Konsum von (zum Teil sonst tödlichen) Substanzen.'],
        ['Rock n Roll', 'Mittels Musik/Dichtkunst kann der Spieler je nach Song/Gedicht die Stimmung anderer beeinflussen. Stärke der Beeinflussung ist zweck- und stufenabhängig.'],
      ],
      'Träumer (Böse, Chaotisch)': [
        ['Land der Träume', 'Traumwelt, in die man sich selber begeben sowie andere mit hineinziehen kann. Personenanzahl ist stufenabhängig.'],
        ['Sandmännchen', '2 Einsatzmöglichkeiten: 1. andere schlafen lassen; 2. Träume anderer beeinflussen.'],
        ['Fiebertraum', 'Andere mit flammenden Reden überzeugen.'],
      ],
    },
    handwerker: {
      'Doktor (Gut, Gesetzestreu)': [
        ['Prothesen', 'Anfügen/Ersetzen von Körperteilen mittels chirurgischer Techniken.'],
        ['Anamnese', 'Allgemeine Befindlichkeit feststellen. Lebewesen analysieren.'],
        ['Heilung', 'Infektionen, Gifte oder Verletzungen behandeln (Achtung: keine magische Sofortheilung).'],
      ],
      'Pharmazeut (Neutral, Gesetzestreu)': [
        ['Analyse', 'Feststellen, ob etwas Gift/Medizin/etwas anderes ist (Tränke, Mixturen).'],
        ['Trankmischer', 'Ist in der Lage, aus entsprechenden Zutaten entsprechende Tränke herzustellen.'],
        ['Beipackzettel', 'Durch Aufschreiben, was die jeweilige Mixtur macht, wird dies zur Realität. Mindestens angegeben: was drin ist, wofür es ist, wie es angewendet wird, eventuelle Nebenwirkungen.'],
      ],
      'Wissenschaftler (Böse, Gesetzestreu)': [
        ['Wissensdurst', 'Weiß immer, wo sich z. B. Bücher befinden, wer gefragt werden muss, und kann diesen das gewünschte Wissen entlocken.'],
        ['Spezialwissen', 'Der Spieler kann Fakten/Wissen zu bestimmten (Alltags-)Dingen wie z. B. Kochen, Biologie, Geschichte, … aufrufen (wenn der DM dazu noch nichts festgelegt hat, z. B. eine Vogelart, die etwas Bestimmtes macht/hat, und die Beschreibung gefällt, wird dies fest in die Spielwelt aufgenommen). Beschränkung auf 5 Fachgebiete.'],
        ['Untiefen des Gedächtnisses', 'Tipps/Info/Hilfe vom DM.'],
      ],
      'Schmied (Gut, Neutral)': [
        ['Schmiedekunst, grob', 'Schmieden von z. B. Waffen, Rüstungen, groben Werkzeugen (Sense, Hammer, …).'],
        ['Schmiedekunst, fein', 'Schmieden von z. B. Schmuck, Verzierungen, feinen Werkzeugen (Schere, Nadel, …).'],
        ['Effektverleihung', 'Kann Waffen/Gegenständen mittels Schmiedekunst Effekte verleihen bzw. den jeweiligen Gegenstand verändern, z. B. mehr Schärfe, Stabilität, Gewichtsanpassungen, …'],
      ],
      'Händler (Böse, Neutral)': [
        ['Artikulation/Verhandlungsgeschick', 'Sich gewählt/an das Gegenüber angepasst ausdrücken zu können und so für ein gewisses Vertrauen/Überzeugungskraft zu sorgen.'],
        ['Wanderbeutel/Truhe/Dimensionslager', 'Achtung – andere Stufen! 1–2 Wanderbeutel, 3–4 Wandertruhe, 5–6 Dimensionslager (niedrigere Stufe = klein, höhere Stufe = groß). Der Spieler ist im Besitz eines besonderen Itemlagers. Im kleinen Dimensionslager können auch Lebewesen transportiert werden, ins große sogar die Spieler.'],
        ['Neutraler Boden', 'Der Spieler kann seinen Verkaufsstand/Teppich auch mitten im Kampfgeschehen aufstellen. Der Händler und diejenigen, die den „Laden betreten“, können nicht angegriffen werden.'],
      ],
      'Modifizierer (Gut, Chaotisch)': [
        ['Vielfraß', 'Nahrung füllt die LP nicht nur auf, sondern kann auch kurzzeitig die Gesamt-LP erhöhen.'],
        ['Reverse Engineering', 'Erkennt, wie Fallen/Dungeons/Waffen/Gegenstände (auf-)gebaut sind, und kann diese ggf. nachbauen/auseinandernehmen // technisches Wissen darüber, wie etwas funktioniert.'],
        ['Modifikation', 'Der Spieler kann Objekte/Gegenstände nach seinen Wünschen verändern/erweitern. Es muss erklärt und festgehalten werden, wie genau das passiert, sprich: welcher Gegenstand wird mittels welcher Werkzeuge und Materialien wie verändert und was macht das mit dem Objekt.'],
      ],
      'Erfinder (Neutral, Chaotisch)': [
        ['Werkzeugkiste', 'Dem Spieler steht eine Werkzeugkiste zur Verfügung, in der sich die Werkzeuge befinden, die der Spieler gerade benötigt.'],
        ['Fachgedöns/Maschinenmojo', 'Der Spieler kann Objekten „gut zureden“: Dinge funktionieren besser, wenn er sie sich anguckt/daneben steht. Ab Stufe 5 können auch magische Wesen (Feen, Kobolde etc.), die in Objekte eingesperrt worden sind, überzeugt bzw. dazu überredet werden, darin einzuziehen, sofern mindestens Stufe 4 in Erfindungen, Modifikation oder Artikulation/Verhandlungsgeschick besteht.'],
        ['Erfindungen', 'Es kann Neues erschaffen werden. Es müssen Materialien und Herstellungsprozess sowie was das Neue macht festgelegt werden.'],
      ],
      'Alchemist (Böse, Chaotisch)': [
        ['Brauerei', 'Es können Tränke produziert und Neues ausprobiert werden, indem Zutaten hinzugefügt werden.'],
        ['(Wirkstoff-)Transformation', 'Durch Hinzufügen/Extrahieren von Zutaten können Tränke und deren Wirkungen sowie ggf. die Wirkstoffe verändert werden.'],
        ['Labor', 'Das praktische Labor to-go, das man immer mit sich führt.'],
      ],
    },
  },

  // Übungsbögen (Ordner „Techniken“). Abschnitte im Uhrzeigersinn ab oben rechts.
  sheets: [
    { key: 'koerper', title: 'Kampf · Körper', klass: 'kaempfer', listName: 'Technik', thresholds: 'normal',
      charts: [{ key: 'k', label: '', aspects: ['Ausweichen', 'Parieren', 'Kontern', 'Angreifen'] }] },
    { key: 'nahkampf', title: 'Kampf · Nahkampfwaffen', klass: 'kaempfer', listName: 'Technik', thresholds: 'normal',
      charts: [{ key: 'k', label: '', aspects: ['Ausweichen', 'Parieren', 'Kontern', 'Angreifen'] }] },
    { key: 'fernkampf', title: 'Kampf · Fernkampfwaffen', klass: 'kaempfer', listName: 'Technik', thresholds: 'normal',
      charts: [{ key: 'k', label: '', aspects: ['Ausweichen', 'Parieren', 'Kontern', 'Angreifen'] }] },
    { key: 'zauber', title: 'Zauber', klass: 'zauberer', listName: 'Zauber', thresholds: 'zauber',
      charts: [
        // Die Achterkreise sind je zwei Kreise in einer Darstellung: pro Gruppe ist genau ein Feld wählbar.
        { key: 'art', label: 'Einordnung & Methode', aspects: ['Wechselhaft', 'Negativ', 'Verbalmagie', 'Bewegungsmagie', 'Chaosmagie', 'Runenmagie', 'Positiv', 'Neutral'],
          groups: [{ label: 'Einordnung', aspects: ['Positiv', 'Neutral', 'Wechselhaft', 'Negativ'] }, { label: 'Methode', aspects: ['Runenmagie', 'Chaosmagie', 'Bewegungsmagie', 'Verbalmagie'] }] },
        { key: 'element', label: 'Elemente', aspects: ['Erde', 'Feuer', 'Hitze', 'Dunkelheit', 'Licht', 'Kälte', 'Wasser', 'Luft'],
          groups: [{ label: 'Grundelement', aspects: ['Wasser', 'Luft', 'Erde', 'Feuer'] }, { label: 'Übergeordnetes Element', aspects: ['Kälte', 'Licht', 'Dunkelheit', 'Hitze'] }] },
        { key: 'mod', label: 'Modifikator', aspects: ['Erschaffen', 'Zusammenführen', 'Auslöschen', 'Trennen'] },
      ] },
    { key: 'kunst', title: 'Kunst', klass: 'kuenstler', listName: 'Technik', thresholds: 'normal',
      charts: [
        { key: 'tun', label: '', aspects: ['Erschaffen', 'Beibringen', 'Nachmachen', 'Verstehen', 'Verändern', 'Zerstören', 'Dekonstruieren', 'Reparieren'] },
        { key: 'art', label: '', aspects: ['Grob', 'Fein'] },
      ] },
    { key: 'handwerk', title: 'Handwerk', klass: 'handwerker', listName: 'Technik', thresholds: 'normal',
      charts: [
        { key: 'tun', label: '', aspects: ['Erschaffen', 'Beibringen', 'Nachmachen', 'Verstehen', 'Verändern', 'Zerstören', 'Dekonstruieren', 'Reparieren'] },
        { key: 'art', label: '', aspects: ['Grob', 'Fein'] },
      ] },
  ],

  // Punktegebung beim Anwenden (Dokumente „Punktegebung Fertigkeiten_Techniken_…“):
  // W20 + Stufe (Würfelbonus) → Ergebnis und Punkte; der Schadens-/Qualitätswürfel hängt von der Schwierigkeit ab.
  rollOutcomes: [
    { min: 1, max: 4, text: 'klappt nicht / trifft nicht', factor: 0 },
    { min: 5, max: 10, text: 'klappt halb / halber Schaden', factor: 0.5 },
    { min: 11, max: 19, text: 'klappt / trifft', factor: 1 },
    { min: 20, max: 999, text: 'besser als gedacht / doppelter Schaden', factor: 2 },
  ],
  rollPoints: [{ max: 6, points: 1 }, { max: 13, points: 2 }, { max: 999, points: 3 }],
  diffDice: { leicht: 4, mittel: 6, schwer: 8 },
  freeMaxForeign: 3,   // fremde Klasse: freier Ausbau einer Technik höchstens bis Stufe 3
  difficulties: { leicht: 'leicht', mittel: 'mittel', schwer: 'schwer', sonstiges: 'Sonstiges' },

  // Benötigte Punkte für den Aufstieg von Stufe n auf n+1 (Index n), Punktegebung-Dokumente.
  // Kreise (Grundwerte, Spalte „W20“): je Bogen; Techniken: nach Schwierigkeit.
  baseThresholds: {
    normal: [10, 30, 50, 100, 250, 400, 750, 1000, 2000, 5000, 10000, 17000, 25000, 35000, 50000],
    zauber: [50, 150, 250, 500, 1250, 2000, 3750, 5000, 10000, 25000, 50000, 85000, 125000, 175000, 250000],
  },
  teacherFrom: 3,   // ab dieser Stufe braucht man jemanden, der die nächste beibringt
  masterFrom: 8,    // Stufen 9–15: Meisterstufen, nur bei einem Meister in der Lehre
  thresholds: {
    leicht: [5, 15, 25, 50, 125, 200, 375, 500, 1000, 1750, 2750, 4000, 5500, 7500, 10000],
    mittel: [10, 30, 50, 100, 250, 400, 700, 1000, 2000, 3500, 5500, 8000, 11000, 15000, 20000],
    schwer: [15, 45, 75, 150, 375, 600, 1075, 1500, 3000, 5250, 8250, 12000, 16500, 22500, 30000],
  },
};
