"use client";

import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

type Msg = { role: "user" | "assistant"; content: string };

const GREETING =
  "Salaam! I'm Guluna 🍦 Ask me about our flavours, timings, prices, or how to find us!";
const SUGGESTIONS: string[] = ["What are your timings?", "Where are you?", "How do I order?"];

export default function Chat() {
  const [open, setOpen] = useState(false);
  const [teaser, setTeaser] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([{ role: "assistant", content: GREETING }]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // one-time teaser bubble
  useEffect(() => {
    if (typeof sessionStorage !== "undefined" && sessionStorage.getItem("guluna_seen")) return;
    const t = setTimeout(() => setTeaser(true), 2200);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [msgs, open]);

  function openChat() {
    setOpen(true);
    setTeaser(false);
    try {
      sessionStorage.setItem("guluna_seen", "1");
    } catch {}
    setTimeout(() => inputRef.current?.focus(), 250);
  }

  async function ask(text: string) {
    text = (text || "").trim();
    if (!text || busy) return;
    const next: Msg[] = [...msgs, { role: "user", content: text }];
    setMsgs([...next, { role: "assistant", content: "" }]);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: next.map((m) => ({ role: m.role, content: m.content })) }),
      });
      if (!res.body) {
        const t = await res.text();
        setMsgs((m) => replaceLast(m, t));
      } else {
        const reader = res.body.getReader();
        const dec = new TextDecoder();
        let acc = "";
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          acc += dec.decode(value, { stream: true });
          setMsgs((m) => replaceLast(m, acc));
        }
      }
    } catch {
      setMsgs((m) => replaceLast(m, "Oops, I couldn't reach the kitchen. Try again, or DM @meladobyguluna!"));
    } finally {
      setBusy(false);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }

  const last = msgs[msgs.length - 1];
  const waiting = busy && last?.role === "assistant" && !last.content;

  return (
    <>
      {/* launcher */}
      <div className="chat-launch">
        {teaser && !open && (
          <button className="chat-teaser" onClick={openChat}>
            Hi! I&apos;m Guluna 🍦 ask me anything
            <span className="chat-teaser-x" aria-hidden="true">
              ×
            </span>
          </button>
        )}
        <button
          className={`chat-fab ${open ? "open" : ""}`}
          onClick={() => (open ? setOpen(false) : openChat())}
          aria-label={open ? "Close chat" : "Chat with Guluna"}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {open ? <span className="chat-fab-x">×</span> : <img src="/mascot.svg" alt="" />}
        </button>
      </div>

      {open && (
        <div className="chat-panel" role="dialog" aria-label="Chat with Guluna">
          <div className="chat-head">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/mascot.svg" alt="" />
            <div className="chat-head-t">
              <b>Guluna</b>
              <span>
                <i className="chat-online" /> online · Melado helper
              </span>
            </div>
            <button className="chat-min" onClick={() => setOpen(false)} aria-label="Close">
              ×
            </button>
          </div>

          <div className="chat-body" ref={bodyRef}>
            {msgs.map((m, i) => {
              const typing = waiting && i === msgs.length - 1;
              return (
                <div key={i} className={`chat-msg ${m.role}`}>
                  {typing ? (
                    <span className="chat-typing">
                      <span />
                      <span />
                      <span />
                    </span>
                  ) : (
                    m.content
                  )}
                </div>
              );
            })}
            {msgs.length === 1 && (
              <div className="chat-sugg">
                {SUGGESTIONS.map((s) => (
                  <button key={s} onClick={() => ask(s)}>
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          <form
            className="chat-input"
            onSubmit={(e: FormEvent<HTMLFormElement>) => {
              e.preventDefault();
              ask(input);
            }}
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
              placeholder="Ask Guluna…"
              aria-label="Message"
            />
            <button type="submit" disabled={busy || !input.trim()} aria-label="Send">
              ↑
            </button>
          </form>
        </div>
      )}
    </>
  );
}

function replaceLast(list: Msg[], content: string): Msg[] {
  const copy = [...list];
  copy[copy.length - 1] = { role: "assistant", content };
  return copy;
}
