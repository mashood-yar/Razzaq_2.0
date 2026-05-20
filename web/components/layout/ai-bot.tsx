"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { X, PaperPlaneRight, ArrowsClockwise } from "@phosphor-icons/react";
import { GoldBrandText } from "@/components/brand/gold-brand-text";

interface Message {
  role: "user" | "assistant";
  content: string;
}

/** Launcher art (`/public/chat/assistant-mascot.png`) — use `<img>` so animated GIFs keep motion if you swap in a `.gif`. */
const CHAT_MASCOT_SRC = "/chat/assistant-mascot.png";

const WELCOME: Message = {
  role: "assistant",
  content:
    "Hi — I’m here to help with Razzaq Luxe: orders, sizing, products, and returns. What would you like to know?",
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
      let reply = "";
      try {
        const data: unknown = await res.json();
        if (
          data &&
          typeof data === "object" &&
          "reply" in data &&
          typeof (data as { reply: unknown }).reply === "string"
        ) {
          reply = (data as { reply: string }).reply;
        }
      } catch {
        /* non-JSON or empty body */
      }
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            reply.trim() ||
            "Sorry, I couldn’t read that response. Please try again or email sultanbarak77@gmail.com.",
        },
      ]);
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
        <div className="flex h-[500px] w-80 flex-col overflow-hidden rounded-2xl border border-border bg-charcoal shadow-[0_32px_80px_rgba(0,0,0,0.7)]">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={CHAT_MASCOT_SRC}
                alt=""
                width={40}
                height={40}
                className="h-10 w-10 shrink-0 rounded-full object-cover ring-1 ring-white/10"
                draggable={false}
              />
              <div className="min-w-0">
                <p className="font-body text-sm font-medium text-foreground">
                  <span className="text-gold">Razzaq Luxe</span> Support
                </p>
                <p className="font-body text-xs text-gold">AI-powered · 24/7</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={reset}
                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Reset conversation"
              >
                <ArrowsClockwise size={14} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:text-foreground"
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
                      : "border border-border bg-graphite text-cream"
                  }`}
                  style={
                    msg.role === "user"
                      ? { backgroundColor: "#B8E3E9", color: "#0B2E33" }
                      : undefined
                  }
                >
                  <GoldBrandText text={msg.content} />
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="rounded-xl border border-border bg-graphite px-4 py-3">
                  <span className="text-xs text-muted-foreground">Typing…</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="flex gap-2 border-t border-border p-3">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask anything…"
              className="flex-1 rounded-lg border border-border bg-obsidian px-3 py-2 text-sm font-light text-foreground placeholder:text-muted-foreground focus:border-gold/60 focus:outline-none"
            />
            <button
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors disabled:opacity-40"
              style={{ backgroundColor: "#B8E3E9" }}
              aria-label="Send message"
            >
              <PaperPlaneRight
                size={16}
                weight="fill"
                style={{ color: "#0B2E33" }}
              />
            </button>
          </div>
        </div>
      )}

      {/* Toggle — mascot art fills the circle; X overlay when open */}
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-border bg-black shadow-[0_12px_40px_rgba(0,0,0,0.55)] ring-2 ring-white/15 transition-all hover:scale-105 hover:ring-white/25 active:scale-95"
        aria-label={
          isOpen ? "Close customer support chat" : "Open customer support chat"
        }
      >
        {isOpen ? (
          <span className="flex size-full items-center justify-center bg-graphite/95">
            <X size={22} weight="bold" className="text-foreground" aria-hidden />
          </span>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element -- mascot may be animated GIF; avoids Next/Image optimization quirks
          <img
            src={CHAT_MASCOT_SRC}
            alt=""
            width={64}
            height={64}
            className="size-full object-cover object-center"
            draggable={false}
          />
        )}
      </button>
    </div>
  );
}
