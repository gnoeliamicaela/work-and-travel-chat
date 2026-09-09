"use client";

import { FormEvent, useState } from "react";
import ChatMessage, { ChatMessageData } from "./ChatMessage";
import ChatDisclaimer from "./ChatDisclaimer";
import { getOrCreateSessionId } from "@/lib/session";

const WELCOME_MESSAGE: ChatMessageData = {
  role: "assistant",
  content:
    "Hola, soy el copiloto del sitio. Pregunta lo que quieras sobre requisitos, visa, empleo, alojamiento, finanzas o el checklist pre viaje.",
};

const ERROR_MESSAGE: ChatMessageData = {
  role: "assistant",
  content:
    "Tuvimos un problema para responder ahora. Proba de nuevo en un rato, o consulta directamente a la embajada de Estados Unidos.",
};

const LOADING_MESSAGES = [
  "Dejame revisar eso...",
  "Un segundo, estoy viendo...",
  "Buscando la mejor respuesta...",
  "Ya te cuento...",
  "Dame un instante...",
  "Estoy chequeando la info...",
  "Viendo que tenemos sobre esto...",
];

function pickLoadingMessage(previous: string): string {
  if (LOADING_MESSAGES.length <= 1) return LOADING_MESSAGES[0];

  let next = previous;
  while (next === previous) {
    next = LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)];
  }
  return next;
}

interface ChatWindowProps {
  onClose: () => void;
}

export default function ChatWindow({ onClose }: ChatWindowProps) {
  const [messages, setMessages] = useState<ChatMessageData[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const question = input.trim();
    if (!question || loading) return;

    const history = messages
      .filter((message) => message !== WELCOME_MESSAGE && message !== ERROR_MESSAGE)
      .map(({ role, content }) => ({ role, content }));

    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setInput("");
    setLoadingMessage((prev) => pickLoadingMessage(prev));
    setLoading(true);

    try {
      const sessionId = getOrCreateSessionId();
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, session_id: sessionId, history }),
      });

      if (!response.ok) throw new Error("chat request failed");

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.answer as string },
      ]);
    } catch {
      setMessages((prev) => [...prev, ERROR_MESSAGE]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-[28rem] max-h-[75vh] w-[90vw] max-w-[22rem] flex-col overflow-hidden rounded-2xl border border-terracota-100 bg-white shadow-xl sm:w-96 sm:max-w-none">
      <div className="flex items-center justify-between border-b border-terracota-100 bg-marino-500 px-4 py-3">
        <p className="font-display text-sm font-semibold text-white">
          Copiloto Work and Travel
        </p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Minimizar chat"
          className="flex h-7 w-7 items-center justify-center rounded-full text-lg leading-none text-white/80 hover:bg-white/10 hover:text-white"
        >
          ×
        </button>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.map((message, index) => (
          <ChatMessage key={index} role={message.role} content={message.content} />
        ))}
        {loading && <ChatMessage role="assistant" content={loadingMessage} />}
      </div>

      <ChatDisclaimer />

      <form
        onSubmit={handleSubmit}
        className="flex gap-2 border-t border-terracota-100 p-3"
      >
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Escribi tu pregunta"
          className="flex-1 rounded-full border border-terracota-100 px-4 py-2 text-sm outline-none focus:border-terracota-400"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-terracota-500 px-4 py-2 text-sm font-semibold text-white hover:bg-terracota-600 disabled:opacity-50"
        >
          Enviar
        </button>
      </form>
    </div>
  );
}
