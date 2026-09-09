import { getAllChunks, KnowledgeChunk } from "./knowledge";

// Stopwords minimas en espaniol rioplatense para no puntuar palabras
// que aparecen en casi cualquier pregunta.
const STOPWORDS = new Set([
  "el", "la", "los", "las", "un", "una", "unos", "unas", "de", "del", "al",
  "y", "o", "que", "en", "por", "para", "con", "sin", "es", "son", "como",
  "que", "cual", "cuales", "cuando", "donde", "porque", "se", "su", "sus",
  "lo", "le", "les", "me", "mi", "tu", "este", "esta", "estos", "estas",
  "ese", "esa", "esos", "esas", "yo", "vos", "tengo", "tener", "hay",
  "muy", "mas", "pero", "si", "no", "que",
]);

const RELEVANCE_THRESHOLD = 2;
const MAX_RESULTS = 4;

const DIACRITICS_PATTERN = new RegExp("[\\u0300-\\u036f]", "g");

function normalize(text: string): string {
  return text.toLowerCase().normalize("NFD").replace(DIACRITICS_PATTERN, "");
}

function tokenize(text: string): string[] {
  return normalize(text)
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 2 && !STOPWORDS.has(token));
}

// Sin stemming real: dos tokens de al menos 5 letras se consideran la
// misma palabra si comparten los primeros 6 caracteres (ej. "documentos"
// y "documentacion"). Evita que preguntas con plural o variantes de una
// palabra pierdan contexto relevante que esta escrito en singular, o con
// una forma distinta, en la base de conocimiento. Los tokens cortos solo
// matchean de forma exacta, para no generar matches falsos.
const FUZZY_PREFIX_LENGTH = 6;
const FUZZY_MIN_TOKEN_LENGTH = 5;

function tokensMatch(a: string, b: string): boolean {
  if (a === b) return true;

  const minLength = Math.min(a.length, b.length);
  if (minLength < FUZZY_MIN_TOKEN_LENGTH) return false;

  const prefixLength = Math.min(minLength, FUZZY_PREFIX_LENGTH);
  return a.slice(0, prefixLength) === b.slice(0, prefixLength);
}

function containsMatch(tokens: string[], queryToken: string): boolean {
  return tokens.some((token) => tokensMatch(token, queryToken));
}

export interface ScoredChunk extends KnowledgeChunk {
  score: number;
}

/**
 * Busqueda por keywords sobre los chunks de /knowledge, sin base vectorial.
 * Boostea matches en el titulo de seccion y en el titulo del archivo por
 * sobre matches en el cuerpo. Devuelve solo lo que supera el umbral minimo.
 */
export function retrieveRelevantChunks(question: string): ScoredChunk[] {
  const queryTokens = tokenize(question);
  if (queryTokens.length === 0) return [];

  const chunks = getAllChunks();

  const scored: ScoredChunk[] = chunks.map((chunk) => {
    const contentTokens = tokenize(chunk.content);
    const sectionTokens = tokenize(chunk.sectionTitle);
    const titleTokens = tokenize(chunk.fileTitle);

    let score = 0;
    for (const queryToken of queryTokens) {
      if (containsMatch(titleTokens, queryToken)) score += 3;
      if (containsMatch(sectionTokens, queryToken)) score += 2;
      if (containsMatch(contentTokens, queryToken)) score += 1;
    }

    return { ...chunk, score };
  });

  return scored
    .filter((chunk) => chunk.score >= RELEVANCE_THRESHOLD)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_RESULTS);
}
