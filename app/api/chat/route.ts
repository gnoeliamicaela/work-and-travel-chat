import { NextRequest, NextResponse, after } from "next/server";
import { retrieveRelevantChunks } from "@/lib/retrieval";
import {
  SYSTEM_PROMPT,
  buildConversationMessages,
  buildUserMessage,
  HistoryItem,
} from "@/lib/prompt";
import { askClaude } from "@/lib/claude";
import { notifyUnansweredQuestion } from "@/lib/webhooks";

function parseHistory(rawHistory: unknown): HistoryItem[] {
  if (!Array.isArray(rawHistory)) return [];

  return rawHistory.filter((item): item is HistoryItem => {
    return (
      item &&
      typeof item === "object" &&
      (item.role === "user" || item.role === "assistant") &&
      typeof item.content === "string"
    );
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const question = typeof body?.question === "string" ? body.question.trim() : "";
  const sessionId = typeof body?.session_id === "string" ? body.session_id : "";
  const history = parseHistory(body?.history);

  if (!question) {
    return NextResponse.json({ error: "Falta la pregunta." }, { status: 400 });
  }

  const chunks = retrieveRelevantChunks(question);
  const userMessage = buildUserMessage(question, chunks);
  const messages = buildConversationMessages(history, userMessage);

  let result;
  try {
    result = await askClaude(SYSTEM_PROMPT, messages);
  } catch (error) {
    console.error("Error llamando a Claude", error);
    return NextResponse.json(
      {
        error:
          "No pudimos procesar tu pregunta en este momento. Proba de nuevo en un rato.",
      },
      { status: 502 }
    );
  }

  if (!result.grounded) {
    // No bloquea la respuesta al usuario: se ejecuta despues de enviarla.
    after(() => notifyUnansweredQuestion(question, sessionId));
  }

  return NextResponse.json({
    answer: result.answer,
    grounded: result.grounded,
    sources: result.sources,
  });
}
