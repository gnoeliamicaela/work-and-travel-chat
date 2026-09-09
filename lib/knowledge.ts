import fs from "fs";
import path from "path";
import matter from "gray-matter";

const KNOWLEDGE_DIR = path.join(process.cwd(), "knowledge");

export interface KnowledgeFileMeta {
  id: string;
  title: string;
  slug: string;
  category: string;
  summary: string;
  audience: string[];
  related: string[];
  lastUpdated: string;
  disclaimer: boolean;
}

export interface KnowledgeChunk {
  fileId: string;
  fileTitle: string;
  category: string;
  sectionTitle: string;
  content: string;
  disclaimer: boolean;
}

export interface KnowledgeFile extends KnowledgeFileMeta {
  rawBody: string;
  chunks: KnowledgeChunk[];
}

// Los 6 archivos de /knowledge son pocos y livianos, cachear en memoria
// de proceso alcanza para esta v1 (sin base vectorial ni reindexado).
let cache: KnowledgeFile[] | null = null;

function splitIntoChunks(body: string, meta: KnowledgeFileMeta): KnowledgeChunk[] {
  const sections = body.split(/\n(?=## )/g).filter((s) => s.trim().length > 0);

  return sections.map((section) => {
    const headingMatch = section.match(/^##\s+(.+)\n/);
    const sectionTitle = headingMatch ? headingMatch[1].trim() : meta.title;
    const content = headingMatch
      ? section.slice(headingMatch[0].length).trim()
      : section.trim();

    return {
      fileId: meta.id,
      fileTitle: meta.title,
      category: meta.category,
      sectionTitle,
      content,
      disclaimer: meta.disclaimer,
    };
  });
}

// gray-matter usa js-yaml para el frontmatter, que interpreta fechas en
// formato ISO (ej. 2026-09-08) como objetos Date en vez de strings.
function formatDate(value: unknown): string {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  return typeof value === "string" ? value : "";
}

function parseFile(fileName: string): KnowledgeFile {
  const filePath = path.join(KNOWLEDGE_DIR, fileName);
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);

  const meta: KnowledgeFileMeta = {
    id: data.id,
    title: data.title,
    slug: data.slug ?? data.id,
    category: data.category,
    summary: data.summary ?? "",
    audience: data.audience ?? [],
    related: data.related ?? [],
    lastUpdated: formatDate(data.last_updated),
    disclaimer: Boolean(data.disclaimer),
  };

  return { ...meta, rawBody: content, chunks: splitIntoChunks(content, meta) };
}

export function getAllKnowledgeFiles(): KnowledgeFile[] {
  if (cache) return cache;

  const fileNames = fs
    .readdirSync(KNOWLEDGE_DIR)
    .filter((f) => f.endsWith(".md"));

  cache = fileNames.map(parseFile);
  return cache;
}

export function getKnowledgeFileBySlug(slug: string): KnowledgeFile | undefined {
  return getAllKnowledgeFiles().find((f) => f.slug === slug);
}

export function getAllChunks(): KnowledgeChunk[] {
  return getAllKnowledgeFiles().flatMap((f) => f.chunks);
}
