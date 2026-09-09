"use client";

const SESSION_STORAGE_KEY = "wt_copiloto_session_id";

/**
 * Identificador anonimo por navegador, usado solo para correlacionar
 * eventos enviados a n8n (descarga, pregunta sin respuesta). No es
 * informacion personal ni se usa para autenticar nada.
 */
export function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "";

  const existing = window.localStorage.getItem(SESSION_STORAGE_KEY);
  if (existing) return existing;

  const id = crypto.randomUUID();
  window.localStorage.setItem(SESSION_STORAGE_KEY, id);
  return id;
}
