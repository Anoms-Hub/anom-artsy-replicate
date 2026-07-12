/**
 * Anomaly — AI Guide Chatbot for Sanctuary
 * Anomaly is an AI character who helps members navigate the AO Universe,
 * learn about features, missions, coins, and the lore of Anom Originals.
 */
import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Send, Sparkles, Bot, User, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useMissionAutoComplete } from "@/hooks/useMissionAutoComplete";
import { CopyrightFooter } from "@/components/CopyrightFooter";

interface Message {
  role: "user" | "assistant";
  content: string; // local chat messages are always plain strings
}

const SUGGESTED_QUESTIONS = [
  "What is the AO Universe?",
  "How do I earn coins?",
  "What are Beings?",
  "How do missions work?",
  "What's in the Financial District?",
  "Tell me about Pixel & Dot",
  "How do I customize my profile?",
  "What is Sanctuary?",
];

export default function Anomaly() {
  useMissionAutoComplete();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hey there, I'm **Anomaly** — your AI guide to the AO Universe! ✨\n\nI'm here to help you navigate Sanctuary, learn about missions, coins, Beings, and everything Anom Originals has built. What would you like to know?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const chatMutation = trpc.anomaly.chat.useMutation({
    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        { role: "assistant" as const, content: String(data.reply) },
      ]);
      setIsLoading(false);
    },
    onError: (err) => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Hmm, I hit a glitch in the matrix. Try asking again? 🌀",
        },
      ]);
      setIsLoading(false);
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const sendMessage = (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || isLoading) return;
    setInput("");
    const newMessages: Message[] = [
      ...messages,
      { role: "user", content },
    ];
    setMessages(newMessages);
    setIsLoading(true);
    chatMutation.mutate({
      messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0015] via-[#0d0025] to-[#0a0015] text-white flex flex-col">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/40 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/universe">
            <button className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 text-sm">
              <ArrowLeft className="w-4 h-4" />
              Universe
            </button>
          </Link>
          <div className="w-px h-5 bg-gray-700" />
          <div className="flex items-center gap-3">
            {/* Anomaly avatar */}
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center shadow-[0_0_12px_rgba(167,139,250,0.5)]">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-400 border-2 border-[#0a0015]" />
            </div>
            <div>
              <h1 className="text-base font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-pink-400">
                Anomaly
              </h1>
              <p className="text-xs text-slate-500">AO Universe Guide · Always Online</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 max-w-3xl w-full mx-auto px-4 py-6 flex flex-col gap-4 overflow-y-auto">

        {/* Suggested questions (only show before user sends first message) */}
        {messages.length === 1 && (
          <div className="mb-2">
            <p className="text-xs text-slate-500 mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-violet-400" />
              Suggested questions
            </p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="text-xs px-3 py-1.5 rounded-full border border-violet-500/30 text-violet-300 bg-violet-500/10 hover:bg-violet-500/20 hover:border-violet-500/50 transition-all duration-150"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
          >
            {/* Avatar */}
            <div className="shrink-0 mt-1">
              {msg.role === "assistant" ? (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center shadow-[0_0_8px_rgba(167,139,250,0.4)]">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-cyan-500 flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
            </div>

            {/* Bubble */}
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === "assistant"
                  ? "bg-white/5 border border-violet-500/20 text-slate-200 rounded-tl-sm"
                  : "bg-pink-500/20 border border-pink-500/30 text-white rounded-tr-sm"
              }`}
            >
              {/* Render markdown-ish bold text */}
              {msg.content.split("\n").map((line, li) => (
                <p key={li} className={li > 0 ? "mt-2" : ""}>
                  {line.split(/(\*\*[^*]+\*\*)/).map((part, pi) =>
                    part.startsWith("**") && part.endsWith("**") ? (
                      <strong key={pi} className="text-violet-300 font-semibold">
                        {part.slice(2, -2)}
                      </strong>
                    ) : (
                      part
                    )
                  )}
                </p>
              ))}
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center shrink-0 mt-1 shadow-[0_0_8px_rgba(167,139,250,0.4)]">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-white/5 border border-violet-500/20 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-violet-400 animate-spin" />
              <span className="text-xs text-slate-500">Anomaly is thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="sticky bottom-0 bg-black/60 backdrop-blur-sm border-t border-white/10">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex gap-3 items-end">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Anomaly anything about Sanctuary..."
              rows={1}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-violet-500/60 resize-none max-h-32"
              style={{ minHeight: "44px" }}
            />
            <Button
              onClick={() => sendMessage()}
              disabled={!input.trim() || isLoading}
              className="bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 text-white shrink-0 h-11 w-11 p-0 rounded-xl"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-slate-600 mt-2 text-center">
            Press Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>

      <CopyrightFooter />
    </div>
  );
}
