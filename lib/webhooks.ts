const WEBHOOK_TIMEOUT_MS = 4000;

async function postToWebhook(
  url: string | undefined,
  payload: Record<string, unknown>
): Promise<void> {
  if (!url) return;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), WEBHOOK_TIMEOUT_MS);

  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
  } catch (error) {
    // Fire and forget: un fallo o timeout de n8n nunca debe afectar la
    // respuesta que ya recibio el usuario.
    console.error("Webhook a n8n fallo", error);
  } finally {
    clearTimeout(timeout);
  }
}

export function notifyDownload(resource: string, sessionId: string): Promise<void> {
  return postToWebhook(process.env.N8N_WEBHOOK_DOWNLOAD_URL, {
    event: "download",
    resource,
    session_id: sessionId,
  });
}

export function notifyUnansweredQuestion(
  question: string,
  sessionId: string
): Promise<void> {
  return postToWebhook(process.env.N8N_WEBHOOK_UNANSWERED_URL, {
    event: "unanswered_question",
    question,
    session_id: sessionId,
  });
}

export interface LeadInput {
  nombre: string;
  apellido: string;
  telefono: string;
  email?: string;
  mensaje?: string;
}

export interface LeadWebhookResult {
  ok: boolean;
  status?: number;
  error?: string;
}

const LEAD_WEBHOOK_TIMEOUT_MS = 8000;

/**
 * A diferencia de postToWebhook, esta llamada no es fire and forget: Claude
 * necesita el resultado como tool_result para poder seguir la conversacion
 * con el usuario, asi que esperamos la respuesta (o el error) de n8n.
 */
export async function submitLead(input: LeadInput): Promise<LeadWebhookResult> {
  const url = process.env.N8N_LEAD_WEBHOOK_URL;
  if (!url) {
    console.error(
      "N8N_LEAD_WEBHOOK_URL no esta configurada, no se pudo enviar el lead"
    );
    return { ok: false, error: "webhook_not_configured" };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), LEAD_WEBHOOK_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Webhook-Secret": process.env.N8N_WEBHOOK_SECRET ?? "",
      },
      body: JSON.stringify(input),
      signal: controller.signal,
    });

    if (!response.ok) {
      console.error(`Webhook de lead a n8n devolvio ${response.status}`);
      return { ok: false, status: response.status };
    }

    return { ok: true, status: response.status };
  } catch (error) {
    console.error("Error llamando al webhook de lead de n8n", error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : "unknown_error",
    };
  } finally {
    clearTimeout(timeout);
  }
}
