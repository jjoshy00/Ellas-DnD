// Regelwerk der Kampagne (aus den Unterlagen der Spielleiterin).
// Hier lassen sich Namen und Werte anpassen, ohne die App selbst zu ändern.

window.RULES = {
  startLP: 50,
  lpPerLevel: 1,
  resourcePerLevel: 1,
  equipmentSlots: 9,  // Ausrüstungsslots (Namen sind in der App frei wählbar)
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
      ['Physische Stärke', 'Für alle Aktionen, die physische Stärke erfordern.'],
      ['Mentale Stärke', 'Für alle Aktionen, die mentale Stärke erfordern (z. B. Verteidigung gegen psychische Angriffe).'],
      ['Traglast', 'Pro Ausbaustufe 1 Itemplatz mehr.'],
      ['Akrobatik', 'Für alle Aktionen, die nach einem Zirkusartisten verlangen.'],
      ['Athletik', 'Rennen, schwimmen, klettern, springen.'],
      ['Lebenspunktebonus', '2 LP pro Ausbaustufe mehr.'],
    ] },
    { color: '#222222', skills: [
      ['Fingerfertigkeit', 'Schlösser knacken, Kartentricks, stehlen.'],
      ['Heimlichkeit', 'Bonus, wenn man etwas ungesehen erledigen möchte.'],
      ['Motiv erkennen', 'Spricht das Gegenüber die Wahrheit? Welche Absicht hat es?'],
      ['Wahrnehmung', 'Fallen oder Hinweise erkennen.'],
      ['Täuschen', 'Andere etwas glauben lassen, das nicht stimmt.'],
      ['Überlebenskunst', 'Pro Ausbaustufe 1 Rettungswurf mehr.'],
    ] },
    { color: '#13875f', skills: [
      ['Konstitution', 'Würfe entsprechend der Ausbaustufe wiederholen.'],
      ['Giftresistenz', 'Boni auf die Resistenz je nach Ausbaustufe.'],
      ['Hitzeresistenz', 'Boni auf die Resistenz je nach Ausbaustufe.'],
      ['Kälteresistenz', 'Boni auf die Resistenz je nach Ausbaustufe.'],
      ['Magieresistenz', 'Boni auf die Resistenz je nach Ausbaustufe.'],
      ['Rettungswurfbonus', 'Pro Ausbaustufe Bonus auf Rettungswürfe.'],
    ] },
    { color: '#8e1a8e', skills: [
      ['Arkane Kunde', 'Würfelbonus bei Wissen um arkane Belange.'],
      ['Erforschung', 'Boni beim Untersuchen von Dingen.'],
      ['Naturkunde', 'Boni beim Untersuchen von Flora und Fauna.'],
      ['Allgemeinwissen', 'Politik, Wissenschaft, Architektur …'],
      ['Mit Tieren umgehen', 'Tiere verstehen, beruhigen, überreden.'],
      ['Heilkunde', 'Mit W4 auf Heilung würfeln, pro Ausbaustufe 1 Punkt mehr.'],
    ] },
    { color: '#e66a00', skills: [
      ['Einschüchtern', 'Bonus in Höhe der Ausbaustufe.'],
      ['Überzeugen', 'Bonus in Höhe der Ausbaustufe.'],
      ['Auftreten', 'Bonus für Aktionen, die Präsenz verlangen.'],
      ['Waffenkunde', 'Umgang mit Waffen, ATK-Boni beim Verwenden.'],
      ['Kampfkunst', 'Umgang mit Kampfkünsten, ATK-Boni beim Verwenden.'],
      ['Kampfgeist', 'Pro Ausbaustufe 1 Ausdauer/Mana/Geduld mehr.'],
    ] },
  ],

  // Klassenfähigkeiten je Unterklasse (Fähigkeiten_<Klasse>.txt), Stufen 1–6.
  subclasses: {
    zauberer: {
      'Druide (Gut, Gesetzestreu)': [
        ['Verwandlung', 'Tiergestalt annehmen, pro Stufe ein Tier. Kostet 5 Mana, Rückverwandlung 3.'],
        ['Naturkunde', 'Wissen um Pflanzen, Tiere und Mythisches.'],
        ['Wunder', 'Wunder wirken (Absprache mit DM). Stufe 1–2: 5 Mana, 3–4: 10 Mana, 5–6: 15 Mana.'],
      ],
      'Magier (Neutral, Gesetzestreu)': [
        ['Papierkram', 'Kennt alles und kann alles ausfüllen/finden.'],
        ['Autorität', 'Hat die Befehlsgewalt.'],
        ['Abrakadabra', 'Kann neue Zauber erschaffen. DM entscheidet Manakosten und nötigen Wurf.'],
      ],
      'Kleriker (Böse, Gesetzestreu)': [
        ['Anhänger/Fanatiker', 'NPCs zu Anhängern machen; zusätzlicher Würfel in Höhe der gesetzten Manapunkte (4 MP = W4).'],
        ['Besessenheit', 'Von einem Dämon besessen werden, der Boni gibt.'],
        ['Zorn des Gottes/Katastrophe', 'Katastrophen auslösen (Absprache mit DM). Stufe 1–2: 5 Mana, 3–4: 10 Mana, 5–6: 15 Mana.'],
      ],
      'Doktor (Gut, Neutral)': [
        ['Heilung', 'LP auffüllen/Verletzungen heilen. Ab Stufe 5 Wiederbelebung, Stufe 6 füllt Rettungswürfe (W4) wieder auf.'],
        ['Amputation', 'Magisches Amputieren und Anfügen von Körperteilen.'],
        ['Wundübertragung', 'Verletzungen/Schaden auf andere übertragen.'],
      ],
      'Hexer (Böse, Neutral)': [
        ['(Charm-)ante Zauber', 'Zauber anderer „klauen“ und als Charm einsetzen.'],
        ['Poltergeist', 'Geister/Dämonen/Engel/Fey in Objekte einpflanzen.'],
        ['Flüche', 'Flüche aussprechen.'],
      ],
      'Alchemist (Gut, Chaotisch)': [
        ['Stein der Weisen', 'Metalle, Mineralien, Material erschaffen/verändern (Absprache mit DM).'],
        ['Verzauberung', 'Effektverleihung mittels magischer Zutaten.'],
        ['Erschaffer', 'Mit Zutaten/Materialien Dinge erschaffen (Absprache mit DM).'],
      ],
      'Wahrsager (Neutral, Chaotisch)': [
        ['Eingebung', 'Hilfe vom DM.'],
        ['Seance', 'Mit den Toten kommunizieren.'],
        ['Kristallkugel', 'Objekt, kann mit Charms belegt werden; Zukunft voraussagen.'],
      ],
      'Nekromant (Böse, Chaotisch)': [
        ['Nekromantie', 'Beschwörung von (Un-)Toten.'],
        ['Zersetzung', 'Rosten/Altern lassen. Zusätzlich zum W6 ein W100 (%).'],
        ['Opfergabe', 'Lebensenergie als Mana verwenden; Leben nehmen, um die eigene aufzufüllen.'],
      ],
    },
    kaempfer: {
      'Paladin (Gut, Gesetzestreu)': [
        ['Segen', 'Segenssprüche für Waffen/Ausrüstung/Lebewesen (Anhänger einer Gottheit).'],
        ['Schlachtruf', 'Mitstreiter überzeugen/Gegner einschüchtern oder Energie der Mitstreiter auffüllen (1–6).'],
        ['Vertrauen', 'Andere vertrauen dem Spieler instinktiv.'],
      ],
      'Wächter (Neutral, Gesetzestreu)': [
        ['Schild', 'Boni beim Schützen anderer, Anstieg der LP + VP.'],
        ['Grausamkeit', 'Böse Taten zum Schutz anderer gelten als neutral.'],
        ['Beschützer', 'Schaden für Schutzbefohlene übernehmen (Stufe 1: 25 % … Stufe 6: 100 %, Teleport, Eingreifen).'],
      ],
      'Assassine (Böse, Gesetzestreu)': [
        ['Tarnung/Zwielicht', 'Sich vor anderen verbergen.'],
        ['Zutritt', 'Sich so ziemlich überall Zutritt verschaffen.'],
        ['Informationsbeschaffung', 'Weiß immer, wo Informationen zu holen sind.'],
      ],
      'Ritter (Gut, Neutral)': [
        ['Gehorsam/Treueschwur', 'Jemandem die Treue schwören; Boni beim Befolgen, Abzüge beim Missachten.'],
        ['Ritterlichkeit', 'Gerettete sind dankbar und helfen.'],
        ['Korrektheit', 'NPCs halten das Handeln des Spielers für richtig.'],
      ],
      'Räuber (Böse, Neutral)': [
        ['Diebstahl', 'Personen/Gebäude leicht ausrauben.'],
        ['Überfall', 'Angriffsbonus bei Überraschungsangriffen (Stufe 1: +1/+1 … Stufe 6: +6/+3).'],
        ['Hehlerei', 'Kann Ware (auch Gestohlenes) immer verkaufen.'],
      ],
      'Waldläufer (Gut, Chaotisch)': [
        ['Naturkunde', 'Fährtenlesen, Flora/Fauna, Boni auf Rettungswürfe.'],
        ['Fortbewegung', 'Schneller, besser klettern, stolpert nicht.'],
        ['(un-)bekanntes Terrain', 'Lagepläne erstellen, Gefahren/Vorteile erkennen.'],
      ],
      'Söldner (Neutral, Chaotisch)': [
        ['Erst das Geld', 'Belohnung schon bei Annahme einfordern.'],
        ['Waffenmeister', 'Jede Waffe handhaben.'],
        ['Gefahrenzulage', 'Mehr Geld bei Gefahr; Geld für Boni „opfern“.'],
      ],
      'Berserker (Böse, Chaotisch)': [
        ['Alles ist eine Waffe', 'Alles in eine Waffe verwandeln, hält einen Spielzug.'],
        ['Erst Handeln, dann Fragen stellen', 'Initiativhoheit.'],
        ['Platz da!', 'Andere gehen auf Befehl aus dem Weg.'],
      ],
    },
    kuenstler: {
      'Autor (Gut, Gesetzestreu)': [
        ['Zitat', 'Aussagen mit seriöser Quellenangabe sind glaubhaft.'],
        ['Gelehrter', 'Schriften verfassen, die Einfluss auf die Welt haben.'],
        ['Denkpause', 'Geschehen anhalten, um Strategien zu besprechen.'],
      ],
      'Koch (Neutral, Gesetzestreu)': [
        ['Gerichte', 'Wirkungen von Lebensmitteln verstärken/verändern.'],
        ['Empfehlung der Küche', 'Andere müssen das Gericht konsumieren.'],
        ['Prometheus', 'Selbst anbauen/züchten (Land nötig).'],
      ],
      'Gamer (Böse, Gesetzestreu)': [
        ['Herausforderung', 'Andere zu einem Spiel herausfordern.'],
        ['Pokern', 'Verhandlung mit dem Schicksal (DM).'],
        ['Simulation', 'Realität simulieren ohne Konsequenzen.'],
      ],
      'Maler (Gut, Neutral)': [
        ['Hyperrealismus', 'Begehbare Bilder (Stufe 1: 6 Itemplätze … Stufe 6: alles ein- und ausgehen lassen).'],
        ['Abstraktion', 'Zeichnungen zum Leben erwecken (Skizzenbuch nötig).'],
        ['Radierung', 'Hyperrealismus/Abstraktion rückgängig machen.'],
      ],
      'Schneider (Böse, Neutral)': [
        ['Modetrend', 'Kleidung kreieren/umnähen.'],
        ['Modesünde', 'Hässliche Kleidung ohne Gegenwehr abnehmen.'],
        ['Diva', '„Das können wir so nicht machen“ verwirft Konstrukte.'],
      ],
      'Zirkusartist (Gut, Chaotisch)': [
        ['Schauspieler', 'Sich glaubhaft verstellen.'],
        ['Zauberkünstler', 'Nicht-magische Zaubertricks.'],
        ['Akrobat', 'Alles Akrobatische ist möglich.'],
      ],
      'Barde (Neutral, Chaotisch)': [
        ['Sex', 'Charismaboost: Ausbaustufe × 2.'],
        ['Drugs', 'Bewusstseinserweiterung durch Substanzen.'],
        ['Rock n Roll', 'Mit Musik/Dichtkunst die Stimmung beeinflussen.'],
      ],
      'Träumer (Böse, Chaotisch)': [
        ['Land der Träume', 'Traumwelt, andere mit hineinziehen.'],
        ['Sandmännchen', 'Andere schlafen lassen oder Träume beeinflussen.'],
        ['Fiebertraum', 'Mit flammenden Reden überzeugen.'],
      ],
    },
    handwerker: {
      'Doktor (Gut, Gesetzestreu)': [
        ['Prothesen', 'Körperteile chirurgisch anfügen/ersetzen.'],
        ['Anamnese', 'Befinden feststellen, Lebewesen analysieren.'],
        ['Heilung', 'Infektionen, Gifte, Verletzungen behandeln (keine magische Sofortheilung).'],
      ],
      'Pharmazeut (Neutral, Gesetzestreu)': [
        ['Analyse', 'Gift/Medizin/anderes erkennen.'],
        ['Trankmischer', 'Tränke aus Zutaten herstellen.'],
        ['Beipackzettel', 'Aufgeschriebene Wirkung wird Realität.'],
      ],
      'Wissenschaftler (Böse, Gesetzestreu)': [
        ['Wissensdurst', 'Weiß immer, wo Wissen zu finden ist.'],
        ['Spezialwissen', 'Fakten zu bis zu 5 Fachgebieten aufrufen.'],
        ['Untiefen des Gedächtnisses', 'Hilfe vom DM.'],
      ],
      'Schmied (Gut, Neutral)': [
        ['Schmiedekunst, grob', 'Waffen, Rüstungen, grobe Werkzeuge.'],
        ['Schmiedekunst, fein', 'Schmuck, Verzierungen, feine Werkzeuge.'],
        ['Effektverleihung', 'Gegenständen Effekte verleihen.'],
      ],
      'Händler (Böse, Neutral)': [
        ['Artikulation/Verhandlungsgeschick', 'Gewählt ausdrücken, Vertrauen schaffen.'],
        ['Wanderbeutel/Truhe/Dimensionslager', 'Besonderes Itemlager (Stufe 1–2 Beutel, 3–4 Truhe, 5–6 Dimensionslager).'],
        ['Neutraler Boden', 'Verkaufsstand auch im Kampf, dort kein Angriff.'],
      ],
      'Modifizierer (Gut, Chaotisch)': [
        ['Vielfraß', 'Nahrung kann kurzzeitig die Gesamt-LP erhöhen.'],
        ['Reverse Engineering', 'Erkennt, wie Dinge gebaut sind, kann nachbauen.'],
        ['Modifikation', 'Gegenstände nach Wunsch verändern/erweitern.'],
      ],
      'Erfinder (Neutral, Chaotisch)': [
        ['Werkzeugkiste', 'Hat immer das gerade benötigte Werkzeug.'],
        ['Fachgedöns/Maschinenmojo', 'Dinge funktionieren besser, ab Stufe 5 auch magische Wesen überzeugen.'],
        ['Erfindungen', 'Neues erschaffen.'],
      ],
      'Alchemist (Böse, Chaotisch)': [
        ['Brauerei', 'Tränke produzieren und Neues ausprobieren.'],
        ['(Wirkstoff-)Transformation', 'Tränke und Wirkstoffe verändern.'],
        ['Labor', 'Labor to-go.'],
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
        { key: 'art', label: 'Einordnung & Methode', aspects: ['Wechselhaft', 'Negativ', 'Verbalmagie', 'Bewegungsmagie', 'Chaosmagie', 'Runenmagie', 'Positiv', 'Neutral'] },
        { key: 'element', label: 'Elemente', aspects: ['Erde', 'Feuer', 'Hitze', 'Dunkelheit', 'Licht', 'Kälte', 'Wasser', 'Luft'] },
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

  difficulties: { leicht: 'leicht (W4)', mittel: 'mittel (W6)', schwer: 'schwer (W8)' },

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
