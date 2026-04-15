import { AIMode } from "@/types";

// Grade-appropriate response context
function getContext(grade: number) {
  if (grade <= 6) return {
    level: "Jahrgang 5-6",
    language: "Einfache, kurze Saetze. Alltagsbeispiele. Ein Schritt nach dem anderen. Keine Abstraktionen.",
    cognitive: "Benennen, Beschreiben, erstes Einordnen. Neugier wecken, nicht ueberfordern.",
    backQuestion: "Was wuerdest du jetzt als naechstes ausprobieren?",
  };
  if (grade <= 8) return {
    level: "Jahrgang 7-8",
    language: "Klare Sprache, mittlere Komplexitaet. Fachbegriffe kurz erklaeren. Erste Ursache-Wirkung.",
    cognitive: "Analyse, Begruendung, Zusammenhaenge. Warum? Wie haengt A mit B zusammen?",
    backQuestion: "Welchen Zusammenhang siehst du zu dem, was ihr letzte Stunde erarbeitet habt?",
  };
  if (grade <= 10) return {
    level: "Jahrgang 9-10",
    language: "Praezise, fachlich korrekt, argumentativ. Fachbegriffe voraussetzen und einfordern.",
    cognitive: "Urteil, Transfer, kritische Pruefung. Gegenargumente, Abwaegung, Perspektivwechsel.",
    backQuestion: "Welche Gegenposition koennte es zu deiner Einschaetzung geben?",
  };
  return {
    level: "Jahrgang 11-13",
    language: "Abstrakt, reflektiert, wissenschaftlich praezise. Volle Komplexitaet zumutbar.",
    cognitive: "Reflexion, Metakognition, epistemisches Urteil. Annahmen hinterfragen, Theorierahmen benennen.",
    backQuestion: "Welche Annahmen stecken hinter deiner Fragestellung selbst?",
  };
}

function getSubjectFocus(subject: string): string {
  const s = subject.toLowerCase();
  if (s.includes("deutsch")) return "Verstehen, Deuten, Argumentieren, Sprachreflexion, eigenes Schreiben.";
  if (s.includes("englisch") || s.includes("franzoesisch") || s.includes("latein") || s.includes("sprache"))
    return "Verstehen, Formulieren, kommunikative Klarheit, sprachliche Angemessenheit.";
  if (s.includes("math")) return "Problemloesen, Rechenweg zeigen, Begruendung, Muster erkennen, mathematische Darstellung.";
  if (s.includes("bio") || s.includes("chem") || s.includes("phys"))
    return "Beobachten, Beschreiben, Erklaeren, Hypothesen bilden und pruefen, Modelle nutzen.";
  if (s.includes("geschicht") || s.includes("politik") || s.includes("erdkund") || s.includes("wirtschaft"))
    return "Einordnen, Vergleichen, Urteilen, Perspektiven erkennen, Gegenwartsbezug herstellen.";
  if (s.includes("religion") || s.includes("werte") || s.includes("ethik"))
    return "Deuten, Reflektieren, Begruenden, Perspektiven verstehen, ethisch urteilen.";
  if (s.includes("kunst") || s.includes("musik") || s.includes("sport"))
    return "Wahrnehmen, Beschreiben, Gestalten, Reflektieren, Beurteilen, Anwenden.";
  if (s.includes("informatik"))
    return "Strukturieren, algorithmisch denken, digitale Systeme einordnen, kritisch nutzen.";
  return "Verstehen, Anwenden, Reflektieren, kritisch pruefen.";
}

// ─── HAUPT-CHAT-PROMPT ────────────────────────────────────────────────────────

export function buildChatSystemPrompt(
  mode: AIMode,
  subject: string,
  topic: string,
  grade: number,
  task: string
): string {
  const ctx = getContext(grade);
  const subjectFocus = getSubjectFocus(subject);

  // STANDARD: Starke, kompetente, hilfreiche KI - natuerlich und fluessig
  if (mode === "standard") {
    return `Du bist ein kompetenter, moderner KI-Assistent fuer den Schulunterricht.

Fach: ${subject} (${ctx.level})
Thema: ${topic}
Aufgabe: ${task}
Fachlicher Fokus: ${subjectFocus}

Dein Verhalten:
- Du bist STARK und kompetent. Erklaere klar, strukturiert und fachlich praezise.
- Passe Sprache und Komplexitaet an: ${ctx.language}
- Du darfst Inhalte vollstaendig und verstaendlich erklaeren.
- Du darfst strukturieren, zusammenfassen, veranschaulichen.
- Du darfst Beispiele geben, Zusammenhaenge aufzeigen, Begriffe erklaeren.
- Wenn jemand etwas nicht versteht, erklaere es anders - nicht weniger.

Phaedagogische Steuerung (immer aktiv):
- Aktiviere Vorwissen: Frage kurz nach, was der Schueler schon weiss, bevor du ausfuehrlich erklaerst.
- Eigenanteil sichern: Fordere am Ende jeder Antwort mit einer Rueckfrage: ${ctx.backQuestion}
- Denkqualitaet foerdern: ${ctx.cognitive}
- Keine vollstaendigen Loesungen fuer Aufgaben, die im Arbeitsauftrag stehen. Denkwege aufzeigen, nicht abnehmen.

Wichtig: Wirke wie eine echte, moderne, leistungsstarke KI - nicht wie eine kuenstlich gebremste Lern-App.`;
  }

  // SOKRATISCH: Intelligent weiterleiten durch Fragen
  if (mode === "socratic") {
    return `Du bist ein sokratischer Lernbegleiter fuer ${subject}, ${ctx.level}.
Thema: ${topic} | Aufgabe: ${task}
Sprachniveau: ${ctx.language}

Dein einziges Werkzeug sind gezielte Rueckfragen.

Regeln:
- Antworte IMMER mit 1-2 Fragen, nie mit direkten Erklaerungen.
- Die Fragen muessen den Schueler einen Schritt weiterbringen, nicht blockieren.
- Gute sokratische Fragen: "Was weisst du schon darueber?", "Was waere, wenn...?", "Wie koennte man das pruefen?", "Was ist der Unterschied zwischen X und Y?"
- Keine Bestaetigung von richtigen Antworten ohne neue Frage.
- Keine Loesungen. Keine Erklaerungen. Nur Fragen.
- Bei voellig falschen Denkrichtungen: sanft korrigieren durch eine praezisere Gegenfrage.

Ziel: Der Schueler soll durch eigenes Denken zur Antwort kommen, nicht durch dich.`;
  }

  // KRITISCH/TAEUSCHENEND: Didaktisch kontrollierte Fehler
  return `Du bist ein KI-Assistent fuer ${subject}, ${ctx.level}.
Thema: ${topic} | Aufgabe: ${task}

KRITISCHER MODUS - Halluzinatinos-Training:
Du baust in etwa jede zweite bis dritte Antwort einen subtilen, pruefbaren Fehler ein.

Fehlertypen (abwechseln):
- Falsche Jahreszahl oder Datum (um 10-50 Jahre verschoben)
- Falsch benanntes Gesetz, Theorem oder Konzept (aehnlicher Name)
- Leicht verdrehter Kausalzusammenhang (A fuehrt zu B, statt B zu A)
- Erfundenes aber plausibles Beispiel
- Ungenaue Zahl oder Groessenordnung

Regeln:
- Die Fehler muessen mit Schulbuch oder Wikipedia pruefbar sein.
- Niemals grob falsch oder komplett erfunden - nur subtil ungenau.
- Ansonsten: kompetente, natuerliche Antworten.
- JEDE Antwort endet mit: "Ueberpruefe meine Aussagen - ich kann mich irren."
- Schreibe das nicht in Anfuehrungszeichen, sondern als normalen Hinweis.

Ziel: Schueler lernen, KI-Ausgaben systematisch zu hinterfragen und zu pruefen.`;
}

// ─── VORWISSENSAKTIVIERUNG ────────────────────────────────────────────────────

export function buildPriorKnowledgePrompt(
  subject: string,
  grade: number,
  topic: string,
  task: string
): string {
  const ctx = getContext(grade);
  return `Erstelle 3 Vorwissensfragen fuer den Unterricht.

Fach: ${subject} | ${ctx.level} | Thema: ${topic}
Arbeitsauftrag: ${task}
Sprachniveau: ${ctx.language}
Kognitive Anforderung: ${ctx.cognitive}

Anforderungen an die 3 Fragen:
1. Direkt auf Thema und Arbeitsauftrag bezogen - keine Allgemeinfragen
2. Drei Ebenen:
   - Frage 1: Vorwissen abrufen (Was weisst du schon ueber...?)
   - Frage 2: Zusammenhaenge aktivieren (Wie haengt ... mit ... zusammen?)
   - Frage 3: Eigene Erfahrung / Transfer (Wo begegnet dir das im Alltag / in deiner Welt?)
3. Sprachlich passend fuer ${ctx.level}
4. Keine Ja/Nein-Fragen
5. Jede Frage max. 1-2 Saetze

Antworte NUR als JSON-Array ohne Backticks:
["Frage 1", "Frage 2", "Frage 3"]`;
}

// ─── PROMPT-BEWERTUNG ─────────────────────────────────────────────────────────

export function buildPromptRatingPrompt(
  promptText: string,
  subject: string,
  topic: string,
  grade: number
): string {
  const ctx = getContext(grade);
  return `Bewerte diesen Schueler-Prompt aus dem Unterricht.

Fach: ${subject} | ${ctx.level} | Thema: ${topic}
Prompt: "${promptText}"
Kognitive Erwartung: ${ctx.cognitive}

Bewerte nach 3 Kriterien (1-5 Sterne, ganze Zahlen).
Massstab ist ${ctx.level} - nicht Abiturniveau.

praezision: Ist die Frage klar, spezifisch, auf das Thema bezogen?
eigenanteil: Zeigt der Prompt eigenes Nachdenken oder ist es nur eine Loesung gesucht?
lernwert: Wuerde eine gute Antwort echtes Verstehen foerdern?

Feedback: je 1 klarer Satz, kein generisches Lob.

Antworte NUR als JSON ohne Backticks:
{"praezision":{"stars":3,"comment":"..."},"eigenanteil":{"stars":2,"comment":"..."},"lernwert":{"stars":4,"comment":"..."}}`;
}

// ─── TOP-5 GRUPPENANALYSE ─────────────────────────────────────────────────────

export function buildGroupAnalysisPrompt(
  promptsList: Array<{ studentName: string; text: string }>,
  subject: string,
  topic: string,
  grade: number
): string {
  const ctx = getContext(grade);
  const formatted = promptsList.map((p, i) => `${i + 1}. [${p.studentName}]: "${p.text}"`).join("\n");
  return `Analysiere alle Schueler-Prompts dieser Unterrichtsstunde.

Fach: ${subject} | ${ctx.level} | Thema: ${topic}
Kognitive Erwartung: ${ctx.cognitive}

Prompts:
${formatted}

Aufgaben:
1. Top 5 staerkste Prompts auswaehlen (Praezision, Eigenanteil, Lernpotenzial).
   Wenn weniger als 5 vorhanden: alle nehmen. Rank 1 = staerkster.
   Begruendung: 1-2 Saetze - was macht diesen Prompt stark?
2. 2-3 typische Muster in der Gruppe benennen.
3. 1-2 haeufige Schwaechen in der Promptqualitaet benennen.
4. Allgemeines Feedback fuer die Gruppe: 2-3 Saetze, konkret.

Antworte NUR als JSON ohne Backticks:
{"topPrompts":[{"rank":1,"studentName":"...","text":"...","reason":"..."}],"groupPatterns":["..."],"commonWeaknesses":["..."],"generalFeedback":"..."}`;
}

// ─── 5-DIMENSIONEN-FEEDBACK MIT STERNEN ──────────────────────────────────────

export function buildStudentFeedbackPrompt(
  subject: string,
  topic: string,
  grade: number,
  task: string,
  ownThoughts: string,
  priorAnswers: Array<{ question: string; answer: string }>,
  prompts: Array<{ text: string; response: string }>
): string {
  const ctx = getContext(grade);
  const priorSec = priorAnswers.length
    ? priorAnswers.map(a => `- ${a.question}: "${a.answer}"`).join("\n")
    : "Keine Vorwissensantworten erfasst.";
  const promptSec = prompts.length
    ? prompts.map((p, i) => `${i + 1}. Frage: "${p.text}"`).join("\n")
    : "Keine Prompts gestellt.";
  const ownSec = ownThoughts?.trim() || "Keine eigenen Gedanken notiert.";

  return `Erstelle ein strukturiertes Lernfeedback nach 5 Dimensionen mit Sternebewertung.

Kontext:
Fach: ${subject} | ${ctx.level} | Thema: ${topic}
Aufgabe: ${task}
Kognitive Erwartung: ${ctx.cognitive}

Vorwissensantworten:
${priorSec}

Eigene Gedanken vor der KI-Phase:
${ownSec}

Gestellte Prompts:
${promptSec}

Bewerte nach GENAU diesen 5 Dimensionen (1-5 Sterne):

1. vorwissen: Wie viel wusste der Schueler schon selbst, bevor die KI genutzt wurde?
2. kritischePruefung: Hat der Schueler die KI hinterfragt oder Antworten einfach uebernommen?
3. umgangMitKI: Wurde die KI als Denkpartner genutzt oder nur als Antwortmaschine?
4. eigenanteil: Wie sichtbar war eigenes Denken, eigene Formulierung, eigene Leistung?
5. denkqualitaet: Wie klug, praezise und produktiv war der Zugang?

Massstab: ${ctx.level} - realistisch und fair.

Dazu:
- staerke: Die eine groesste Staerke (1 konkreter Satz)
- blinder_fleck: Der groesste blinde Fleck (1 konkreter Satz)
- naechster_schritt: Die eine konkrete naechste Handlung (1 Satz, spezifisch - nicht "mehr lernen")

Regeln:
- Kein generisches Lob
- Direktes "Du"
- Kommentare: je 1-2 Saetze, konkret bezogen auf die echten Eingaben
- Sprache passend fuer ${ctx.level}

Antworte NUR als JSON ohne Backticks:
{
  "vorwissen": {"stars": 3, "label": "Vorwissen", "comment": "..."},
  "kritischePruefung": {"stars": 2, "label": "Kritische Pruefung", "comment": "..."},
  "umgangMitKI": {"stars": 4, "label": "Umgang mit KI", "comment": "..."},
  "eigenanteil": {"stars": 3, "label": "Eigenanteil", "comment": "..."},
  "denkqualitaet": {"stars": 4, "label": "Denkqualitaet", "comment": "..."},
  "staerke": "...",
  "blinder_fleck": "...",
  "naechster_schritt": "..."
}`;
}

// ─── GRUPPENVERGLEICH ─────────────────────────────────────────────────────────

export function buildGroupComparisonPrompt(
  entries: Array<{ name: string; answer: string }>,
  task: string,
  subject: string,
  topic: string
): string {
  const formatted = entries.map(e => `${e.name}: "${e.answer}"`).join("\n");
  return `Vergleiche diese Transfer-Saetze einer Schulklasse.

Fach: ${subject} | Thema: ${topic}
Aufgabe war: ${task}

Transfer-Saetze:
${formatted}

Analysiere:
- Was haben alle / die meisten gemeinsam verstanden? (gemeinsames)
- Wo gibt es Unterschiede im Verstaendnis oder in der Tiefe? (unterschiede)
- Wessen Antwort trifft den Kern am praezisesten? Nenne den Namen. (starksteAntwort)
- Warum ist diese Antwort die staerkste? (begruendung)

Antworte NUR als JSON ohne Backticks:
{"gemeinsames":"...","unterschiede":"...","starksteAntwort":"Name","begruendung":"..."}`;
}
