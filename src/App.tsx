import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUp,
  Bot,
  BrainCircuit,
  Check,
  Copy,
  Eraser,
  Languages,
  LoaderCircle,
  Menu,
  MessageSquarePlus,
  RefreshCcw,
  Sparkles,
  X,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Role = "user" | "assistant";
type View = "home" | "chat";

type ChatMessage = {
  id: string;
  role: Role;
  content: string;
};

type PaymentStatus = "idle" | "success" | "failure" | "pending" | "expired";

const SYSTEM_PROMPT = `You are Bac Fel Jib AI. Developed by Nexora Agency.

You are an educational AI assistant specialized ONLY in Tunisian Baccalaureate methodology and exam preparation.

Your mission: Help Tunisian students succeed in exams by teaching them how to answer correctly using Tunisian Bac methodology.

IMPORTANT RULES:

Answer simply and clearly Use beginner-friendly explanations Follow Tunisian Bac structure Teach methodology step by step Correct mistakes politely Generate organized model answers Adapt answers to student level Avoid complicated AI explanations Focus on exam success and methodology

ARABIC SUPPORT:

إنتاج فقرة تلخيص النص إبداء الرأي شرح النص تحليل النص الإجابة عن الأسئلة إصلاح الأخطاء كتابة مقدمة وخاتمة

ENGLISH SUPPORT:

Essay writing Biography writing Reading comprehension Grammar correction Refer to the text questions True/False justification Vocabulary help

FRENCH SUPPORT:

Production écrite Résumé Compréhension Essai argumentatif Bac methodology

PHILOSOPHY SUPPORT:

Analyse question Problematic Plan Philosophers Essay structure

A1 LANGUAGE SUPPORT:

Italian German Russian Turkish Chinese

The AI personality must feel:

Friendly Motivating Educational Fast Smart but simple

Never:

Overcomplicate Use difficult academic language Give unrelated answers

Always:

Be concise Be structured Be educational Focus on Tunisian Bac success.`;

const SUBJECTS = ["Arabic", "French", "English", "Philosophy", "Italian", "German", "Russian", "Turkish", "Chinese"];

const QUICK_ACTIONS: Record<string, string[]> = {
  Arabic: [
    "إنتاج فقرة",
    "تلخيص النص",
    "إبداء الرأي",
    "شرح النص",
    "تحليل النص",
    "إصلاح الأخطاء",
    "مقدمة وخاتمة",
    "الإجابة عن الأسئلة",
  ],
  French: [
    "Production ecrite",
    "Resume",
    "Comprehension",
    "Essai argumentatif",
    "Corriger les fautes",
    "Methodologie Bac",
  ],
  English: [
    "Essay writing",
    "Biography writing",
    "Email writing",
    "Grammar correction",
    "Reading comprehension",
    "Summary writing",
    "Refer to the text",
    "True/False justification",
    "Vocabulary help",
  ],
  Philosophy: [
    "Analyse question",
    "Problematic",
    "Plan",
    "Introduction",
    "Development",
    "Conclusion",
    "Philosophers",
    "Bac methodology",
  ],
};

const FEATURES = [
  "Tunisian Bac methodology",
  "AI writing assistant",
  "Philosophy help",
  "English/French/Arabic support",
  "Beginner language learning",
  "Reading comprehension",
  "Summary generation",
  "Essay generation",
  "Grammar correction",
  "Bac exam answering strategies",
  "Step-by-step methodology",
];

const API_URL = "https://openrouter.ai/api/v1/chat/completions";
const PREMIUM_AMOUNT_MILLIMES = 29000;

function BacFelJibLogo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`relative ${compact ? "h-9 w-9" : "h-12 w-12"}`}>
        <motion.div
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 rounded-full border border-cyan-300/35"
        />
        <div className="absolute inset-[3px] rounded-full bg-[radial-gradient(circle_at_20%_20%,#39ff88_0%,#00f0ff_65%,#050505_100%)] p-[1px] shadow-[0_0_30px_rgba(57,255,136,0.5)]">
          <div className="flex h-full w-full items-center justify-center rounded-full bg-[#050505]">
            <BrainCircuit className={`${compact ? "h-4 w-4" : "h-5 w-5"} text-[#39ff88]`} />
          </div>
        </div>
      </div>
      <div>
        <p className={`${compact ? "text-[11px]" : "text-xs"} text-[#86f7d2]`}>Nexora Agency</p>
        <p className={`${compact ? "text-sm" : "text-lg"} font-semibold tracking-tight text-[#f5f5f5]`}>Bac Fel Jib AI</p>
      </div>
    </div>
  );
}

export default function App() {
  const [view, setView] = useState<View>("home");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("Arabic");
  const [isStreaming, setIsStreaming] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const [isCursorVisible, setIsCursorVisible] = useState(false);
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("idle");
  const [paymentStatusMessage, setPaymentStatusMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const openRouterApiKey = (import.meta as ImportMeta & { env?: Record<string, string> }).env
    ?.VITE_OPENROUTER_API_KEY;

  const suggestedPrompts = useMemo(() => {
    return QUICK_ACTIONS[selectedSubject] ?? QUICK_ACTIONS.Arabic;
  }, [selectedSubject]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isStreaming]);

  useEffect(() => {
    const move = (event: MouseEvent) => {
      setCursor({ x: event.clientX, y: event.clientY });
      setIsCursorVisible(true);
    };
    const leave = () => setIsCursorVisible(false);
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseout", leave);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseout", leave);
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const callbackStatus = params.get("payment_status");
    const paymentId = params.get("payment_id") ?? params.get("paymentId") ?? params.get("id");

    if (callbackStatus === "failed") {
      setPaymentStatus("failure");
      setPaymentStatusMessage("Payment failed or was canceled. You can retry securely.");
      return;
    }

    if (callbackStatus === "success" && paymentId) {
      void verifyFlouciPayment(paymentId);
      return;
    }

    if (callbackStatus === "success") {
      setPaymentStatus("pending");
      setPaymentStatusMessage("Payment callback received. Verifying transaction now.");
    }
  }, []);

  const verifyFlouciPayment = async (paymentId: string) => {
    setPaymentStatus("pending");
    setPaymentStatusMessage("Verifying payment with Flouci...");

    try {
      const response = await fetch(`/api/flouci/verify-payment?payment_id=${encodeURIComponent(paymentId)}`);
      const data = (await response.json()) as { status?: string; message?: string };

      const status = (data.status ?? "").toUpperCase();
      if (status === "SUCCESS") {
        setPaymentStatus("success");
        setPaymentStatusMessage("Payment confirmed. Premium access can be activated now.");
        return;
      }
      if (status === "PENDING") {
        setPaymentStatus("pending");
        setPaymentStatusMessage("Payment is still pending. Refresh in a few seconds.");
        return;
      }
      if (status === "EXPIRED") {
        setPaymentStatus("expired");
        setPaymentStatusMessage("Payment session expired. Create a new payment session.");
        return;
      }

      setPaymentStatus("failure");
      setPaymentStatusMessage(data.message ?? "Payment failed verification.");
    } catch {
      setPaymentStatus("failure");
      setPaymentStatusMessage("Could not verify payment status. Please contact support.");
    }
  };

  const startFlouciCheckout = async () => {
    if (isCreatingPayment) return;

    setIsCreatingPayment(true);
    setPaymentError(null);

    try {
      const response = await fetch("/api/flouci/create-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: PREMIUM_AMOUNT_MILLIMES,
          plan: "premium",
          client_id: "Bac Fel Jib AI Premium",
          accept_card: true,
        }),
      });

      const data = (await response.json()) as { payment_url?: string; message?: string };
      if (!response.ok || !data.payment_url) {
        throw new Error(data.message ?? "Could not initialize Flouci payment.");
      }

      window.location.href = data.payment_url;
    } catch (error) {
      setPaymentError(error instanceof Error ? error.message : "Payment session failed.");
    } finally {
      setIsCreatingPayment(false);
    }
  };

  const streamResponse = async (chatHistory: ChatMessage[]) => {
    if (!openRouterApiKey) {
      throw new Error("Missing VITE_OPENROUTER_API_KEY. Add it to your .env file.");
    }

    const requestMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...chatHistory.map((message) => ({ role: message.role, content: message.content })),
    ];

    let attempts = 0;
    while (attempts < 3) {
      attempts += 1;
      try {
        const response = await fetch(API_URL, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${openRouterApiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://nexora-agency-five.vercel.app/",
            "X-Title": "Bac Fel Jib AI",
          },
          body: JSON.stringify({
            model: "deepseek/deepseek-v4-flash:free",
            stream: true,
            messages: requestMessages,
            temperature: 0.5,
          }),
        });

        if (!response.ok || !response.body) {
          throw new Error(`OpenRouter error ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullText = "";
        let buffer = "";

        // Parse SSE chunks from OpenRouter and append partial tokens for smooth streaming.
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const chunks = buffer.split("\n");
          buffer = chunks.pop() ?? "";

          for (const line of chunks) {
            if (!line.startsWith("data:")) continue;
            const data = line.replace("data:", "").trim();
            if (data === "[DONE]") continue;

            try {
              const parsed = JSON.parse(data) as {
                choices?: Array<{ delta?: { content?: string } }>;
              };
              const token = parsed.choices?.[0]?.delta?.content ?? "";
              if (!token) continue;
              fullText += token;
              setMessages((previous) => {
                const updated = [...previous];
                const last = updated[updated.length - 1];
                if (last && last.role === "assistant") {
                  updated[updated.length - 1] = { ...last, content: fullText };
                }
                return updated;
              });
            } catch {
              // Ignore malformed lines and continue parsing the stream.
            }
          }
        }

        return;
      } catch (error) {
        if (attempts >= 3) {
          throw error;
        }
        await new Promise((resolve) => setTimeout(resolve, 650 * attempts));
      }
    }
  };

  const sendMessage = async (text?: string) => {
    const messageText = (text ?? input).trim();
    if (!messageText || isStreaming) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: messageText,
    };
    const assistantMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "",
    };

    const nextHistory = [...messages, userMessage, assistantMessage];
    setMessages(nextHistory);
    setInput("");
    setApiError(null);
    setIsStreaming(true);

    try {
      await streamResponse(nextHistory.slice(0, -1));
      setMessages((previous) => {
        const updated = [...previous];
        const last = updated[updated.length - 1];
        if (last && last.role === "assistant" && !last.content.trim()) {
          updated[updated.length - 1] = {
            ...last,
            content: "I am ready to help with Bac methodology. Please try that question again.",
          };
        }
        return updated;
      });
    } catch (error) {
      setApiError(error instanceof Error ? error.message : "Unexpected API error");
      setMessages((previous) => {
        const updated = [...previous];
        const last = updated[updated.length - 1];
        if (last && last.role === "assistant") {
          updated[updated.length - 1] = {
            ...last,
            content:
              "I could not reach OpenRouter right now. Check your API key and network, then try again.",
          };
        }
        return updated;
      });
    } finally {
      setIsStreaming(false);
    }
  };

  const regenerate = async () => {
    if (isStreaming || messages.length === 0) return;

    const filtered = [...messages];
    if (filtered[filtered.length - 1]?.role === "assistant") {
      filtered.pop();
    }
    const lastUser = [...filtered].reverse().find((message) => message.role === "user");
    if (!lastUser) return;

    setMessages(filtered);
    await sendMessage(lastUser.content);
  };

  const clearChat = () => {
    if (isStreaming) return;
    setMessages([]);
    setApiError(null);
  };

  const copyMessage = async (messageId: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(messageId);
      setTimeout(() => setCopiedId(null), 1200);
    } catch {
      setCopiedId(null);
    }
  };

  const goToChatWithDemo = () => {
    setView("chat");
    setTimeout(() => {
      void sendMessage("Create a Tunisian Bac methodology plan to answer a philosophy question step by step.");
    }, 120);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#f5f5f5] [font-family:Geist,Inter,Cairo,sans-serif]">
      <div className="pointer-events-none fixed inset-0 opacity-90">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(57,255,136,0.17),transparent_30%),radial-gradient(circle_at_80%_0%,rgba(0,240,255,0.13),transparent_25%),radial-gradient(circle_at_50%_100%,rgba(0,240,255,0.12),transparent_25%)]" />
        <div className="animated-grid absolute inset-0" />
        <div className="floating-orb orb-a" />
        <div className="floating-orb orb-b" />
        <div className="floating-orb orb-c" />
      </div>

      <AnimatePresence>
        {isCursorVisible && (
          <motion.div
            key="cursor-glow"
            className="pointer-events-none fixed z-30 h-44 w-44 rounded-full bg-[radial-gradient(circle,rgba(57,255,136,0.22)_0%,rgba(0,240,255,0.08)_45%,rgba(5,5,5,0)_70%)] blur-2xl"
            animate={{ x: cursor.x - 88, y: cursor.y - 88 }}
            transition={{ type: "spring", stiffness: 120, damping: 20, mass: 0.4 }}
          />
        )}
      </AnimatePresence>

      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#050505]/70 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <BacFelJibLogo compact />
          <div className="flex items-center gap-2 text-sm">
            <button
              className={`rounded-full border px-4 py-2 transition ${
                view === "home"
                  ? "border-[#39ff88]/60 bg-[#39ff88]/10 text-[#39ff88]"
                  : "border-white/20 bg-white/5 text-[#d6d6d6] hover:border-white/40"
              }`}
              onClick={() => setView("home")}
            >
              Home
            </button>
            <button
              className={`rounded-full border px-4 py-2 transition ${
                view === "chat"
                  ? "border-[#00f0ff]/70 bg-[#00f0ff]/10 text-[#00f0ff]"
                  : "border-white/20 bg-white/5 text-[#d6d6d6] hover:border-white/40"
              }`}
              onClick={() => setView("chat")}
            >
              Chat
            </button>
          </div>
        </div>
      </header>

      {paymentStatus !== "idle" && (
        <div className="relative z-30 border-b border-white/10 bg-[#09090b]/80 px-4 py-3 backdrop-blur-xl sm:px-6">
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 text-xs sm:text-sm">
            <p
              className={
                paymentStatus === "success"
                  ? "text-[#9dffd3]"
                  : paymentStatus === "pending"
                    ? "text-[#9defff]"
                    : "text-[#ffb3b3]"
              }
            >
              {paymentStatusMessage}
            </p>
            <button
              onClick={() => {
                setPaymentStatus("idle");
                setPaymentStatusMessage("");
                const cleanUrl = `${window.location.pathname}${window.location.hash}`;
                window.history.replaceState({}, "", cleanUrl);
              }}
              className="rounded-md border border-white/15 px-2 py-1 text-[#d4d8df]"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {view === "home" ? (
          <motion.main
            key="home"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.45 }}
            className="relative z-10"
          >
            <section className="relative flex min-h-[calc(100vh-66px)] items-center overflow-hidden px-4 py-16 sm:px-6 lg:px-8">
              <div className="mx-auto grid w-full max-w-7xl items-center gap-14 lg:grid-cols-[1.15fr_0.85fr]">
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.06 }}
                >
                  <p className="mb-4 text-sm tracking-[0.18em] text-[#86f7d2]"><a href="https://nexora-agency-five.vercel.app/"> OFFICIAL WEBSITE</a></p>
                  <h1 className="text-5xl font-semibold leading-[0.95] tracking-tight text-[#f5f5f5] sm:text-6xl lg:text-7xl">
                    Bac Fel Jib AI
                  </h1>
                  <p className="mt-4 text-xl text-[#bbffdd]">The Tunisian Baccalaureate AI Assistant</p>
                  <p className="mt-5 max-w-2xl text-base leading-relaxed text-[#d3d3d8] sm:text-lg">
                    Your AI-powered Tunisian Bac companion for methodology, writing, comprehension, philosophy, and exam
                    success.
                  </p>
                  <div className="mt-9 flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => setView("chat")}
                      className="group inline-flex items-center gap-2 rounded-full border border-[#39ff88]/60 bg-[#39ff88]/12 px-6 py-3 text-sm font-medium text-[#afffdb] shadow-[0_0_28px_rgba(57,255,136,0.25)] transition hover:scale-[1.02] hover:bg-[#39ff88]/20"
                    >
                      Start Chatting
                      <ArrowUp className="h-4 w-4 rotate-45 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </button>
                    <button
                      onClick={goToChatWithDemo}
                      className="rounded-full border border-[#00f0ff]/55 bg-[#00f0ff]/10 px-6 py-3 text-sm font-medium text-[#8ff4ff] transition hover:scale-[1.02] hover:bg-[#00f0ff]/18"
                    >
                      Try Demo
                    </button>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.75, delay: 0.14 }}
                  className="relative mx-auto w-full max-w-[450px]"
                >
                  <div className="absolute -inset-8 rounded-full bg-[radial-gradient(circle,rgba(57,255,136,0.18)_0%,rgba(0,240,255,0.12)_35%,transparent_70%)] blur-3xl" />
                  <motion.div
                    animate={{ y: [0, -14, 0] }}
                    transition={{ repeat: Infinity, duration: 5.5, ease: "easeInOut" }}
                    className="relative"
                  >
                    <div className="aspect-square rounded-[2.5rem] border border-white/15 bg-[linear-gradient(150deg,rgba(57,255,136,0.2),rgba(0,240,255,0.11)_35%,rgba(15,15,18,0.82))] p-8 backdrop-blur-2xl">
                      <div className="h-full w-full rounded-[2rem] border border-white/10 bg-[#0f0f12]/65 p-6">
                        <div className="relative flex h-full items-center justify-center overflow-hidden rounded-[1.7rem] border border-[#39ff88]/20 bg-[radial-gradient(circle_at_20%_20%,rgba(57,255,136,0.14),transparent_45%),radial-gradient(circle_at_80%_80%,rgba(0,240,255,0.22),transparent_45%),#0f0f12]">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
                            className="absolute h-[85%] w-[85%] rounded-full border border-dashed border-[#00f0ff]/35"
                          />
                          <motion.div
                            animate={{ rotate: -360 }}
                            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                            className="absolute h-[65%] w-[65%] rounded-full border border-[#39ff88]/35"
                          />
                          <div className="relative z-10 text-center">
                            <Sparkles className="mx-auto h-10 w-10 text-[#39ff88]" />
                            <p className="mt-3 text-sm tracking-[0.17em] text-[#89ffe5]">AI METHODOLOGY CORE</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              </div>
            </section>

            <section className="relative z-10 mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
              <div className="mb-8">
                <p className="text-sm text-[#87f5d6]">Core Features</p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight">Built for Tunisian Bac success</h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {FEATURES.map((feature, index) => (
                  <motion.div
                    key={feature}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.35, delay: index * 0.04 }}
                    whileHover={{ y: -6, scale: 1.01 }}
                    className="group rounded-2xl border border-white/12 bg-[rgba(255,255,255,0.06)] p-5 backdrop-blur-xl transition"
                  >
                    <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#00f0ff]/40 bg-[#00f0ff]/10 text-[#8bf4ff]">
                      <Bot className="h-4 w-4" />
                    </div>
                    <p className="text-sm text-[#d8d8de] transition group-hover:text-white">{feature}</p>
                  </motion.div>
                ))}
              </div>
            </section>

            <section className="relative z-10 mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
              <div className="mb-8">
                <p className="text-sm text-[#87f5d6]">Subjects</p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight">Main Bac and A1 language tracks</h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {SUBJECTS.map((subject, idx) => (
                  <motion.button
                    key={subject}
                    onClick={() => {
                      setSelectedSubject(subject);
                      setView("chat");
                    }}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.35 }}
                    transition={{ delay: idx * 0.04 }}
                    whileHover={{ rotateX: 8, rotateY: -8, y: -4 }}
                    className="rounded-2xl border border-white/12 bg-[linear-gradient(155deg,rgba(57,255,136,0.08),rgba(0,240,255,0.06),rgba(15,15,18,0.92))] px-5 py-6 text-left [transform-style:preserve-3d]"
                  >
                    <p className="text-base font-medium text-[#f5f5f5]">{subject}</p>
                    <p className="mt-2 text-sm text-[#9ca0ab]">Open guided methodology prompts</p>
                  </motion.button>
                ))}
              </div>
            </section>

            <section className="relative z-10 mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
              <div className="mb-8 flex items-end justify-between gap-4">
                <div>
                  <p className="text-sm text-[#87f5d6]">Pricing</p>
                  <h2 className="mt-2 text-3xl font-semibold tracking-tight">Flouci auto checkout</h2>
                </div>
                <p className="text-xs text-[#a4a9b3]">Pay instantly and verify automatically</p>
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                <motion.div
                  whileHover={{ y: -6 }}
                  className="rounded-3xl border border-white/15 bg-[rgba(255,255,255,0.06)] p-6 backdrop-blur-2xl"
                >
                  <p className="text-sm text-[#9df6d8]">FREE PLAN</p>
                  <p className="mt-2 text-3xl font-semibold">0 TND</p>
                  <div className="mt-5 space-y-3 text-sm text-[#d8d8dd]">
                    {["Unlimited messages", "Basic AI support", "Standard methodology", "Fast answers"].map((item) => (
                      <p key={item} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-[#39ff88]" />
                        {item}
                      </p>
                    ))}
                  </div>
                </motion.div>
                <motion.div
                  whileHover={{ y: -6 }}
                  className="rounded-3xl border border-[#00f0ff]/35 bg-[linear-gradient(150deg,rgba(0,240,255,0.12),rgba(57,255,136,0.1),rgba(15,15,18,0.8))] p-6 shadow-[0_0_35px_rgba(0,240,255,0.2)] backdrop-blur-2xl"
                >
                  <p className="text-sm text-[#9defff]">PREMIUM PLAN</p>
                  <p className="mt-2 text-3xl font-semibold">29 TND</p>
                  <div className="mt-5 space-y-3 text-sm text-[#e4e4ea]">
                    {[
                      "Advanced methodology",
                      "Better corrections",
                      "Smart organization",
                      "Faster AI",
                      "Priority experience",
                    ].map((item) => (
                      <p key={item} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-[#00f0ff]" />
                        {item}
                      </p>
                    ))}
                  </div>
                  <button
                    onClick={() => void startFlouciCheckout()}
                    disabled={isCreatingPayment}
                    className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#00f0ff]/60 bg-[#00f0ff]/15 px-4 py-3 text-sm font-medium text-[#b6f8ff] transition hover:bg-[#00f0ff]/22 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isCreatingPayment ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
                    {isCreatingPayment ? "Creating secure payment..." : "Pay with Flouci"}
                  </button>
                  {paymentError && <p className="mt-3 text-xs text-rose-200">{paymentError}</p>}
                </motion.div>
              </div>
            </section>
          </motion.main>
        ) : (
          <motion.main
            key="chat"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.35 }}
            className="relative z-10 h-[calc(100vh-66px)]"
          >
            <div className="mx-auto grid h-full w-full max-w-7xl gap-4 p-4 sm:p-6 lg:grid-cols-[290px_1fr] lg:gap-6">
              <aside
                className={`fixed inset-y-[66px] left-0 z-40 w-[84%] border-r border-white/10 bg-[#08080a]/95 p-4 backdrop-blur-xl transition-transform duration-300 lg:static lg:w-auto lg:translate-x-0 lg:rounded-2xl lg:border lg:border-white/10 lg:bg-[rgba(255,255,255,0.04)] ${
                  mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
                }`}
              >
                <div className="mb-4 flex items-center justify-between lg:hidden">
                  <BacFelJibLogo compact />
                  <button
                    className="rounded-md border border-white/15 p-2"
                    onClick={() => setMobileSidebarOpen(false)}
                    aria-label="Close sidebar"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-xs tracking-[0.13em] text-[#86f7d2]">SUBJECT NAVIGATION</p>
                <div className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-1">
                  {SUBJECTS.map((subject) => {
                    const active = selectedSubject === subject;
                    return (
                      <button
                        key={subject}
                        onClick={() => {
                          setSelectedSubject(subject);
                          setMobileSidebarOpen(false);
                        }}
                        className={`rounded-xl border px-3 py-2 text-left text-sm transition ${
                          active
                            ? "border-[#39ff88]/60 bg-[#39ff88]/15 text-[#afffdb]"
                            : "border-white/15 bg-white/5 text-[#cfd3db] hover:border-white/40"
                        }`}
                      >
                        {subject}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-6">
                  <p className="mb-3 text-xs tracking-[0.13em] text-[#86f7d2]">SUGGESTED PROMPTS</p>
                  <div className="space-y-2">
                    {suggestedPrompts.map((prompt) => (
                      <button
                        key={prompt}
                        onClick={() => {
                          setInput(prompt);
                          setMobileSidebarOpen(false);
                        }}
                        className="w-full rounded-xl border border-white/12 bg-white/5 px-3 py-2 text-left text-xs text-[#d0d4dd] transition hover:border-[#00f0ff]/55 hover:text-white"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              </aside>

              <section className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-[rgba(255,255,255,0.04)] backdrop-blur-xl">
                <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 sm:px-5">
                  <div className="flex items-center gap-3">
                    <button
                      className="rounded-lg border border-white/15 p-2 lg:hidden"
                      onClick={() => setMobileSidebarOpen(true)}
                      aria-label="Open sidebar"
                    >
                      <Menu className="h-4 w-4" />
                    </button>
                    <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#39ff88]/40 bg-[#39ff88]/10 text-[#9effd8]">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Bac Fel Jib AI</p>
                      <p className="text-xs text-[#9da2ad]">{selectedSubject} Mode</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={regenerate}
                      disabled={isStreaming || messages.length === 0}
                      className="inline-flex items-center gap-1 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs text-[#d4d8e2] disabled:opacity-50"
                    >
                      <RefreshCcw className="h-3.5 w-3.5" />
                      Regenerate
                    </button>
                    <button
                      onClick={clearChat}
                      disabled={isStreaming || messages.length === 0}
                      className="inline-flex items-center gap-1 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs text-[#d4d8e2] disabled:opacity-50"
                    >
                      <Eraser className="h-3.5 w-3.5" />
                      Clear
                    </button>
                  </div>
                </div>

                <div ref={scrollRef} className="flex-1 space-y-5 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
                  {messages.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mx-auto max-w-2xl py-12 text-center"
                    >
                      <MessageSquarePlus className="mx-auto h-9 w-9 text-[#39ff88]" />
                      <h3 className="mt-3 text-xl font-medium">Start your Bac-focused AI chat</h3>
                      <p className="mt-2 text-sm text-[#aeb2bc]">
                        Ask about writing methodology, reading comprehension, philosophy plans, and exam answering strategy.
                      </p>
                    </motion.div>
                  )}

                  {messages.map((message, index) => {
                    const isAssistant = message.role === "assistant";
                    const isLatest = index === messages.length - 1;
                    return (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25 }}
                        className={`flex ${isAssistant ? "justify-start" : "justify-end"}`}
                      >
                        <div
                          className={`group max-w-[92%] rounded-2xl border px-4 py-3 sm:max-w-[80%] ${
                            isAssistant
                              ? "border-[#00f0ff]/30 bg-[#00f0ff]/[0.08]"
                              : "border-[#39ff88]/25 bg-[#39ff88]/[0.08]"
                          }`}
                        >
                          <div className="mb-2 flex items-center justify-between gap-3">
                            <div className="inline-flex items-center gap-2 text-xs text-[#9fa5b2]">
                              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-white/15 bg-white/5">
                                {isAssistant ? <Bot className="h-3.5 w-3.5" /> : <Languages className="h-3.5 w-3.5" />}
                              </span>
                              {isAssistant ? "Bac Fel Jib AI" : "You"}
                            </div>
                            <button
                              onClick={() => copyMessage(message.id, message.content)}
                              className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-[#aeb4bf] opacity-0 transition group-hover:opacity-100"
                            >
                              {copiedId === message.id ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />} Copy
                            </button>
                          </div>

                          <div className="prose prose-invert prose-sm max-w-none text-[#e8e9ed]">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content || "..."}</ReactMarkdown>
                          </div>

                          {isAssistant && isStreaming && isLatest && (
                            <div className="mt-2 inline-flex items-center gap-2 text-xs text-[#96effb]">
                              <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                              Typing
                              <span className="typing-cursor" />
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}

                  {isStreaming && messages[messages.length - 1]?.content.length === 0 && (
                    <div className="space-y-2">
                      <div className="h-3 w-52 animate-pulse rounded bg-white/10" />
                      <div className="h-3 w-72 animate-pulse rounded bg-white/10" />
                    </div>
                  )}
                </div>

                {apiError && (
                  <div className="mx-4 mb-3 rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200 sm:mx-6">
                    {apiError}
                  </div>
                )}

                <div className="border-t border-white/10 px-4 py-4 sm:px-6">
                  <div className="rounded-2xl border border-white/15 bg-[#0f0f12]/85 p-2 backdrop-blur-xl">
                    <div className="flex items-end gap-2">
                      <textarea
                        value={input}
                        onChange={(event) => setInput(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" && !event.shiftKey) {
                            event.preventDefault();
                            void sendMessage();
                          }
                        }}
                        placeholder="Ask Bac Fel Jib AI about methodology, essay writing, comprehension, or philosophy strategy..."
                        className="min-h-[56px] w-full resize-none bg-transparent px-3 py-2 text-sm text-white outline-none placeholder:text-[#838a96]"
                      />
                      <button
                        onClick={() => void sendMessage()}
                        disabled={isStreaming || !input.trim()}
                        className="mb-1 mr-1 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#39ff88]/55 bg-[#39ff88]/15 text-[#a6ffd8] transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label="Send message"
                      >
                        <ArrowUp className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </motion.main>
        )}
      </AnimatePresence>
    </div>
  );
}
