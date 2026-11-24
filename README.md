# Charakterbogen (Handy-App)

Digitaler Charakterbogen für die Kampagne „Die Abenteuer von Hicks und Vince La Grak“.
Läuft komplett im Browser, ohne Server. Die Daten bleiben nur auf dem jeweiligen Handy
(Sicherung als Datei im Reiter „Notizen“).

## Aufs Handy bringen
1. Auf GitHub: Settings → Pages → Source „Deploy from a branch“, Branch `main`, Ordner `/ (root)` → Save.
2. Nach ein bis zwei Minuten ist die App unter `https://jjoshy00.github.io/Ellas-DnD/` erreichbar.
3. Auf dem Handy diese Adresse öffnen und „Zum Startbildschirm hinzufügen“ wählen
   (Android/Chrome: Menü ⋮ → „App installieren“; iPhone/Safari: Teilen → „Zum Home-Bildschirm“).
4. Danach funktioniert sie auch ohne Internet.

## Regeln anpassen
Alle Regelwerte (Klassen, Fähigkeiten, Kreise, Punktetabellen) stehen in `data.js`.
Nach einer Änderung in `sw.js` die `VERSION` und in `index.html` die Zahl hinter `?v=` erhöhen.
