import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import {
  LiveSession, SessionConfig, Phase, Student, StudentSession,
  Prompt, PriorAnswer, ImageUpload, StudentReflection,
  GroupAnalysis, GroupComparison, ChatMessage, PromptRating,
  StructuredFeedback, AppView,
} from "@/types";

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

function emptyStudentSession(student: Student): StudentSession {
  return { student, chatHistory: [], promptsUsed: 0, prompts: [], priorAnswers: [], ownThoughts: "", images: [] };
}

interface LuneaStore {
  view: AppView;
  setView: (v: AppView) => void;

  // Active student (for student-side navigation)
  activeStudentId: string | null;
  setActiveStudent: (id: string | null) => void;

  // Sessions map — in a real multi-device app this would be a server store
  // For demo/single-device: one active session
  session: LiveSession | null;
  startSession: (config: Omit<SessionConfig, "sessionCode">) => string; // returns code
  endSession: () => void;

  // Student join
  joinSession: (code: string, name: string) => { success: boolean; studentId?: string };

  // Phase & timer
  setPhase: (phase: Phase) => void;
  tickTimer: () => void;
  toggleTimer: () => void;
  resetTimer: () => void;

  // Teacher: add student manually
  addStudent: (name: string) => string;

  // Student data
  updateStudentOwnThoughts: (studentId: string, thoughts: string) => void;
  addPriorAnswer: (studentId: string, answer: PriorAnswer) => void;
  addPrompt: (studentId: string, prompt: Prompt) => void;
  updatePromptRating: (studentId: string, promptId: string, rating: PromptRating) => void;
  addImage: (studentId: string, image: ImageUpload) => void;
  addChatMessage: (studentId: string, message: ChatMessage) => void;
  setStudentFeedback: (studentId: string, feedback: StructuredFeedback) => void;
  setStudentReflection: (studentId: string, reflection: StudentReflection) => void;

  // Analysis
  setGroupAnalysis: (analysis: GroupAnalysis) => void;
  setGroupComparison: (comparison: GroupComparison | null) => void;
}

export const useLuneaStore = create<LuneaStore>((set, get) => ({
  view: "landing",
  setView: (v) => set({ view: v }),

  activeStudentId: null,
  setActiveStudent: (id) => set({ activeStudentId: id }),

  session: null,

  startSession: (configPartial) => {
    const sessionCode = generateCode();
    const config: SessionConfig = { ...configPartial, sessionCode };
    set({
      view: "teacher-session",
      activeStudentId: null,
      session: {
        config,
        currentPhase: "eigen",
        timerSeconds: config.phaseTimings.eigen * 60,
        timerRunning: false,
        studentSessions: {},
        startedAt: Date.now(),
      },
    });
    return sessionCode;
  },

  endSession: () => set({ session: null, view: "landing", activeStudentId: null }),

  joinSession: (code, name) => {
    const { session } = get();
    if (!session) return { success: false };
    if (session.config.sessionCode.toUpperCase() !== code.toUpperCase()) return { success: false };
    const id = uuidv4();
    const student: Student = { id, name: name.trim(), joinedAt: Date.now() };
    set((state) => ({
      activeStudentId: id,
      view: "student-session",
      session: state.session ? {
        ...state.session,
        studentSessions: { ...state.session.studentSessions, [id]: emptyStudentSession(student) },
      } : null,
    }));
    return { success: true, studentId: id };
  },

  addStudent: (name) => {
    const id = uuidv4();
    const student: Student = { id, name, joinedAt: Date.now() };
    set((state) => {
      if (!state.session) return {};
      return {
        activeStudentId: id,
        session: {
          ...state.session,
          studentSessions: { ...state.session.studentSessions, [id]: emptyStudentSession(student) },
        },
      };
    });
    return id;
  },

  setPhase: (phase) => set((state) => {
    if (!state.session) return {};
    return {
      session: {
        ...state.session,
        currentPhase: phase,
        timerSeconds: state.session.config.phaseTimings[phase] * 60,
        timerRunning: false,
      },
    };
  }),

  tickTimer: () => set((state) => {
    if (!state.session?.timerRunning) return {};
    const next = state.session.timerSeconds - 1;
    return {
      session: {
        ...state.session,
        timerSeconds: Math.max(0, next),
        timerRunning: next > 0,
      },
    };
  }),

  toggleTimer: () => set((state) => {
    if (!state.session) return {};
    return { session: { ...state.session, timerRunning: !state.session.timerRunning } };
  }),

  resetTimer: () => set((state) => {
    if (!state.session) return {};
    return {
      session: {
        ...state.session,
        timerSeconds: state.session.config.phaseTimings[state.session.currentPhase] * 60,
        timerRunning: false,
      },
    };
  }),

  updateStudentOwnThoughts: (studentId, thoughts) => set((state) => {
    const ss = state.session?.studentSessions[studentId];
    if (!state.session || !ss) return {};
    return {
      session: {
        ...state.session,
        studentSessions: { ...state.session.studentSessions, [studentId]: { ...ss, ownThoughts: thoughts } },
      },
    };
  }),

  addPriorAnswer: (studentId, answer) => set((state) => {
    const ss = state.session?.studentSessions[studentId];
    if (!state.session || !ss) return {};
    const rest = ss.priorAnswers.filter(a => a.questionIndex !== answer.questionIndex);
    return {
      session: {
        ...state.session,
        studentSessions: { ...state.session.studentSessions, [studentId]: { ...ss, priorAnswers: [...rest, answer] } },
      },
    };
  }),

  addPrompt: (studentId, prompt) => set((state) => {
    const ss = state.session?.studentSessions[studentId];
    if (!state.session || !ss) return {};
    return {
      session: {
        ...state.session,
        studentSessions: {
          ...state.session.studentSessions,
          [studentId]: {
            ...ss,
            prompts: [...ss.prompts, prompt],
            promptsUsed: ss.promptsUsed + 1,
            chatHistory: [
              ...ss.chatHistory,
              { role: "user", content: prompt.text },
              { role: "assistant", content: prompt.response },
            ],
          },
        },
      },
    };
  }),

  updatePromptRating: (studentId, promptId, rating) => set((state) => {
    const ss = state.session?.studentSessions[studentId];
    if (!state.session || !ss) return {};
    return {
      session: {
        ...state.session,
        studentSessions: {
          ...state.session.studentSessions,
          [studentId]: { ...ss, prompts: ss.prompts.map(p => p.id === promptId ? { ...p, rating } : p) },
        },
      },
    };
  }),

  addImage: (studentId, image) => set((state) => {
    const ss = state.session?.studentSessions[studentId];
    if (!state.session || !ss) return {};
    return {
      session: {
        ...state.session,
        studentSessions: { ...state.session.studentSessions, [studentId]: { ...ss, images: [...ss.images, image] } },
      },
    };
  }),

  addChatMessage: (studentId, message) => set((state) => {
    const ss = state.session?.studentSessions[studentId];
    if (!state.session || !ss) return {};
    return {
      session: {
        ...state.session,
        studentSessions: { ...state.session.studentSessions, [studentId]: { ...ss, chatHistory: [...ss.chatHistory, message] } },
      },
    };
  }),

  setStudentFeedback: (studentId, feedback) => set((state) => {
    const ss = state.session?.studentSessions[studentId];
    if (!state.session || !ss) return {};
    return {
      session: {
        ...state.session,
        studentSessions: { ...state.session.studentSessions, [studentId]: { ...ss, feedback } },
      },
    };
  }),

  setStudentReflection: (studentId, reflection) => set((state) => {
    const ss = state.session?.studentSessions[studentId];
    if (!state.session || !ss) return {};
    return {
      session: {
        ...state.session,
        studentSessions: { ...state.session.studentSessions, [studentId]: { ...ss, reflection } },
      },
    };
  }),

  setGroupAnalysis: (analysis) => set((state) => {
    if (!state.session) return {};
    return { session: { ...state.session, analysis } };
  }),

  setGroupComparison: (comparison) => set((state) => {
    if (!state.session) return {};
    return { session: { ...state.session, groupComparison: comparison ?? undefined } };
  }),
}));
