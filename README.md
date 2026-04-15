LUNEA
Pädagogische KI-Lernumgebung für geführten Unterricht.
LUNEA ist kein freier KI-Chat. Es ist ein lehrkraftgesteuertes System, das KI didaktisch kontrolliert einsetzt – als Werkzeug für tieferes Denken, nicht als Abkürzung zum Ergebnis.
Was LUNEA grundlegend anders macht
Das 10-10-10-10-Modell
LUNEA strukturiert jede Unterrichtsstunde in vier aufeinander aufbauende Phasen:
  ✦ EIGENPHASE (10 min) ◈ KI-PHASE (10 min) ◉ FOKUSPHASE (10 min) ◇ REFLEXION (10 min)
KI gesperrt. Schüler:innen denken zuerst selbst.
KI freigegeben. Begrenzte Prompts. Pädagogische Begleitung.
KI gesperrt. Eigenständige Weiterarbeit mit dem Gelernten.
Kein KI-Zugang. Transfer, Vergleich, Gruppenanalyse.
Die Zeiten sind anpassbar. Das Prinzip nicht: KI kommt erst nach eigenem Denken.
Warum das wichtig ist: Skill Skipping verhindern
Wenn Schüler:innen sofort mit der KI beginnen, überspringen sie den Denkprozess, der Lernen erst ermöglicht. LUNEA schützt diesen Prozess strukturell – nicht durch Verbote, sondern durch Reihenfolge.
Human-in-the-Loop
Die Lehrkraft behält jederzeit die Kontrolle:
Sie legt Fach, Jahrgang, Thema und Arbeitsauftrag fest
Sie wählt den KI-Modus
Sie bestimmt das Prompt-Limit
Sie steuert die Phasen live
Sie sieht alle Schülerprompts und kann Top-5-Analyse starten Sie entscheidet, wann Gruppenvergleich gezeigt wird
 Die KI ergänzt. Sie ersetzt nicht.
 Funktionen im Detail
Vorwissensaktivierung
Vor der eigentlichen Arbeit generiert LUNEA automatisch drei themenspezifische Fragen, die gezielt drei kognitive Ebenen abdecken:
1. Faktenwissen
2. Zusammenhänge
3. Eigene Erfahrung / Alltagsbezug
Die Fragen werden von der KI aus Fach, Jahrgang, Thema und konkretem Arbeitsauftrag generiert – nicht generisch, sondern spezifisch.
KI-Modi
Standard – strukturierend, geduldig, altersgerecht. Gibt keine Lösungen. Stellt Leitfragen.
Sokratisch – antwortet ausschließlich mit Rückfragen. Kein erklärender Text. Schüler:innen müssen selbst weiterkommen.
Kritisch (Halluzinationsübung) – die KI baut absichtlich subtile Fehler ein: falsche Jahreszahlen, verdrehte Zusammenhänge, erfundene Details. Ziel: Schüler:innen lernen, KI- Ausgaben zu prüfen und nicht blind zu vertrauen. Ein zentrales Ziel digitaler Bildung.
Prompt-Begrenzung
Maximal 2, 3, 5 oder 7 Prompts pro Schüler:in. Das zwingt zu Qualität statt Quantität. Wer weiß, dass er nur 3 Fragen stellen darf, denkt vorher nach.
Bild-Upload
Schüler:innen können Bilder (Arbeitsblätter, Notizen, Zeichnungen) hochladen und in ihren Chat einbinden. Die KI kann das Bild sehen und darauf eingehen. Vollständig serverseitig verarbeitet.
Prompt-Bewertung in 3 Dimensionen
Jeder Prompt wird automatisch bewertet nach: Präzision – wie klar und spezifisch ist die Frage?

 Eigenanteil – zeigt sie eigenes Vordenken?
Lernwert – führt sie zu echtem Verstehen?
Die Bewertung erscheint direkt in der Schüleransicht und setzt Reflexionsimpulse.
Schülerfeedback in 5 Dimensionen
Am Ende der KI-Phase können Schüler:innen persönliches Feedback anfordern. Es ist differenziert in fünf Bereiche:
1. Eigenanteil – wo war selbstständiges Denken sichtbar?
2. Präzision – wie präzise waren die Fragen?
3. KI-Nutzung – Denkwerkzeug oder Antwortgeber?
4. Nächster besserer Prompt – ein konkretes Beispiel, wie es stärker gegangen wäre 5. Nächster Lernschritt – was genau ist die nächste sinnvolle Handlung?
Kein generisches Lob. Keine Noten. Direktes, substanzielles Feedback.
Top-5-Prompt-Analyse für Lehrkräfte
Die Lehrkraft kann jederzeit eine Analyse aller Schülerprompts starten. Das Ergebnis: Die 5 stärksten Prompts mit Begründung, warum sie stark sind
Typische Muster in der Gruppe
Häufige Schwächen in der Promptqualität
Allgemeines Feedback für die Gruppe
Reflexion und Gruppenvergleich
In der Reflexionsphase beantworten Schüler:innen fünf Reflexionsfragen und formulieren einen Transfer-Satz: Was nehme ich aus dieser Stunde mit, in einem Satz?
Die KI vergleicht dann alle Transfer-Sätze der Gruppe und zeigt: Was alle / die meisten gemeinsam verstanden haben
Wo es Unterschiede im Verständnis gibt
Welche Antwort den Kern am präzisesten trifft
Die Transferantworten werden erst sichtbar, nachdem jede:r die eigene eingereicht hat.

 Curricular anschlussfähige Themenwahl
LUNEA enthält eine vollständige Fach- und Themenstruktur für:
17 Fächer: Deutsch, Englisch, Mathematik, Physik, Chemie, Biologie, Geschichte, Erdkunde, Politik, Musik, Kunst, Sport, Informatik, Französisch, Latein, Religion, Wirtschaft
Jahrgangsstufen 5–13 mit Themen orientiert am Kerncurriculum Niedersachsen. Eigene Themen sind jederzeit zusätzlich eingebbar – unabhängig von der vorhandenen
Struktur.
API-Sicherheit
Alle KI-Aufrufe laufen serverseitig über Next.js API Routes. Der API-Key ist niemals im Frontend. Das Frontend spricht ausschließlich mit internen Endpunkten.
   Route
  /api/chat
  /api/prior-knowledge
  /api/rate-prompt
  /api/analyze
  /api/group-compare
Starten
Voraussetzungen
Funktion
KI-Chat mit pädagogischer Persona Themenspezifische Vorwissensfragen Prompt-Bewertung in 3 Dimensionen Top-5-Gruppenanalyse + Schülerfeedback Transferantworten der Gruppe vergleichen
                            Node.js 18 oder höher
Anthropic API-Key (console.anthropic.com)
Schritte
  # 1. Dependencies installieren
  npm install
 
    # 2. API-Key setzen
  # Öffne .env.local und ersetze den Platzhalter:
  # ANTHROPIC_API_KEY=sk-ant-...
  # 3. Entwicklungsserver starten
  npm run dev
  # → http://localhost:3000
  # 4. Produktion bauen und testen
  npm run build
  npm start
Phasenmodell im Überblick
✦ EIGENPHASE
KI gesperrt. Schüler:innen aktivieren Vorwissen,
notieren eigene Gedanken und beantworten Vorwissensfragen. Erst danach wird die KI freigeschaltet.
◈ KI-PHASE
KI freigegeben mit Prompt-Limit.
Jeder Prompt wird automatisch in 3 Dimensionen bewertet. Persönliches Feedback in 5 Dimensionen auf Abruf. Bild-Upload möglich.
◉ FOKUSPHASE
KI erneut gesperrt. Schüler:innen arbeiten eigenständig weiter mit dem, was sie gelernt und erarbeitet haben.
◇ REFLEXION
5 Reflexionsfragen. Transfer-Satz. Gruppenvergleich. KI nicht verfügbar.
Standard: 10–10–10–10 Minuten. Alle Zeiten anpassbar.
Tech-Stack
Next.js 14 · TypeScript · Zustand · Anthropic SDK (serverseitig) · DM Sans + Sora
    
Lizenz
Privat. Alle Rechte vorbehalten.
