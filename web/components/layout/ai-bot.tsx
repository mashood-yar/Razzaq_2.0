"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  ChatCircle,
  X,
  PaperPlaneRight,
  ArrowsClockwise,
} from "@phosphor-icons/react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const WELCOME: Message = {
  role: "assistant",
  content: "Welcome to Razzaq Luxe. How can I assist you today? I can help with orders, sizing, products, and returns.",
};

export function AIBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMsg] }),
      });
      const { reply } = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, I encountered an issue. Please email sultanbarak77@gmail.com.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages]);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const reset = () => {
    setMessages([WELCOME]);
    setInput("");
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
      {isOpen && (
        <div className="flex h-[500px] w-80 flex-col overflow-hidden rounded-2xl border border-graphite bg-charcoal shadow-[0_32px_80px_rgba(0,0,0,0.7)]">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-graphite px-4 py-3">
            <div>
              <p className="font-body text-sm font-medium text-ivory">
                Razzaq Luxe Support
              </p>
              <p className="font-body text-xs" style={{ color: "#C9A84C" }}>
                AI-powered · 24/7
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={reset}
                className="rounded-md p-1.5 text-ash transition-colors hover:text-ivory"
                aria-label="Reset conversation"
              >
                <ArrowsClockwise size={14} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-md p-1.5 text-ash transition-colors hover:text-ivory"
                aria-label="Close chat"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm font-light leading-relaxed ${
                    msg.role === "user"
                      ? "text-obsidian"
                      : "border border-graphite bg-graphite text-cream"
                  }`}
                  style={
                    msg.role === "user"
                      ? { backgroundColor: "#C9A84C", color: "#0D0C0A" }
                      : undefined
                  }
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="rounded-xl border border-graphite bg-graphite px-4 py-3">
                  <span className="text-xs text-ash">Typing…</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="flex gap-2 border-t border-graphite p-3">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask anything…"
              className="flex-1 rounded-lg border border-graphite bg-obsidian px-3 py-2 text-sm font-light text-ivory placeholder:text-ash focus:border-gold/60 focus:outline-none"
            />
            <button
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors disabled:opacity-40"
              style={{ backgroundColor: "#C9A84C" }}
              aria-label="Send message"
            >
              <PaperPlaneRight
                size={16}
                weight="fill"
                style={{ color: "#0D0C0A" }}
              />
            </button>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setIsOpen((o) => !o)}
        className="flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all hover:scale-105 active:scale-95"
        style={{ backgroundColor: "#C9A84C" }}
        aria-label="Open customer support chat"
      >
        {isOpen ? (
          <X size={22} style={{ color: "#0D0C0A" }} />
        ) : (
          <ChatCircle size={26} weight="fill" style={{ color: "#0D0C0A" }} />
        )}
      </button>
    </div>
  );
}
