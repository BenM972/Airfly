"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const SUGGESTIONS = [
  "Je veux apprendre le kitesurf",
  "Quels sont vos tarifs ?",
  "Trouver mon matos",
  "C'est quoi le spot ?",
  { label: "Y'a til du vent sur le spot ? 🌬️", meteo: true },
];

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{
        role: "assistant",
        content: "Salut ! Je suis l'assistant Airfly 🤙 Je peux t'aider à trouver le bon matos, répondre à tes questions sur l'école ou le spot. C'est parti ?",
      }]);
    }
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text?: string) => {
    const content = text ?? input.trim();
    if (!content || loading) return;
    setInput("");

    const newMessages: Message[] = [...messages, { role: "user", content }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Une erreur est survenue, réessaie dans un instant." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-3">
        {/* Bulle */}
        <AnimatePresence>
          {!open && (
            <motion.button
              onClick={() => setOpen(true)}
              className="bg-white shadow-md px-4 py-2 text-gray-700 text-sm max-w-[180px] text-left leading-snug hover:shadow-lg transition-shadow duration-200"
              style={{ fontFamily: "var(--font-cormorant)" }}
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.25 }}
            >
              Comment puis-je vous aider ? 🤙
            </motion.button>
          )}
        </AnimatePresence>

        {/* Bouton principal */}
        <motion.button
          onClick={() => setOpen((o) => !o)}
          className="w-14 h-14 bg-transparent flex items-center justify-center"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Assistant Airfly"
        >
          <AnimatePresence mode="wait">
            {open ? (
              <motion.span
                key="close"
                initial={{ opacity: 0, rotate: -90 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 90 }}
                transition={{ duration: 0.2 }}
                className="text-white text-xl"
              >
                ✕
              </motion.span>
            ) : (
              <motion.div
                key="logo"
                initial={{ opacity: 0, rotate: 90 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: -90 }}
                transition={{ duration: 0.2 }}
              >
                <Image src="/logo-airfly.webp" alt="Airfly" width={28} height={28} className="object-contain" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Chat window */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed bottom-24 right-6 z-[99] w-[350px] max-w-[calc(100vw-3rem)] bg-white shadow-2xl flex flex-col"
            style={{ height: "480px" }}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25 }}
          >
            {/* Header */}
            <div className="bg-gray-900 px-5 py-4 flex items-center gap-3 shrink-0">
              <Image src="/logo-airfly.webp" alt="Airfly" width={28} height={28} className="object-contain" />
              <div>
                <p className="text-white text-xs uppercase tracking-widest" style={{ fontFamily: "Mirloanne, serif" }}>
                  Assistant Airfly
                </p>
                <p className="text-white/50 text-xs" style={{ fontFamily: "var(--font-cormorant)" }}>
                  Toujours disponible
                </p>
              </div>
              <div className="ml-auto w-2 h-2 bg-green-400 rounded-full" />
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div
                    className={`max-w-[80%] px-4 py-2.5 text-sm leading-relaxed ${
                      m.role === "user"
                        ? "bg-gray-900 text-white"
                        : "bg-[#f5f0e8] text-gray-800"
                    }`}
                    style={{ fontFamily: "var(--font-cormorant)" }}
                  >
                    {m.content}
                  </div>
                </motion.div>
              ))}

              {/* Suggestions (après le premier message assistant) */}
              {messages.length === 1 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {SUGGESTIONS.map((s) => {
                    const isMeteo = typeof s === "object";
                    const label = isMeteo ? s.label : s;
                    return (
                      <button
                        key={label}
                        onClick={() => {
                          if (isMeteo) {
                            setOpen(false);
                            router.push("/#meteo");
                          } else {
                            send(label);
                          }
                        }}
                        className="text-xs border border-gray-200 px-3 py-1.5 text-gray-500 hover:border-[#FF0080] hover:text-[#FF0080] transition-colors duration-200"
                        style={{ fontFamily: "var(--font-cormorant)" }}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Typing indicator */}
              {loading && (
                <motion.div
                  className="flex justify-start"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="bg-[#f5f0e8] px-4 py-3 flex gap-1 items-center">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="w-1.5 h-1.5 bg-gray-400 rounded-full"
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="border-t border-gray-100 px-4 py-3 flex gap-2 shrink-0">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Pose ta question..."
                className="flex-1 text-sm text-gray-900 placeholder-gray-300 focus:outline-none bg-transparent"
                style={{ fontFamily: "var(--font-cormorant)" }}
              />
              <button
                onClick={() => send()}
                disabled={!input.trim() || loading}
                className="text-gray-400 hover:text-[#FF0080] transition-colors duration-200 disabled:opacity-30"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
