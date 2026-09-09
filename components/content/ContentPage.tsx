import { marked } from "marked";
import { notFound } from "next/navigation";
import { getKnowledgeFileBySlug } from "@/lib/knowledge";

export default function ContentPage({ slug }: { slug: string }) {
  const file = getKnowledgeFileBySlug(slug);

  if (!file) {
    notFound();
  }

  const html = marked.parse(file.rawBody, { async: false }) as string;

  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <p className="text-sm font-medium uppercase tracking-wide text-terracota-500">
        {file.category}
      </p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-marino-500 sm:text-4xl">
        {file.title}
      </h1>
      {file.summary && (
        <p className="mt-4 text-lg text-carbon-800/80">{file.summary}</p>
      )}

      {file.disclaimer && (
        <div className="mt-6 rounded-xl border border-mostaza-200 bg-mostaza-50 p-4 text-sm text-carbon-800">
          Esta informacion es orientativa. No reemplaza el asesoramiento
          legal o migratorio oficial, y la aprobacion de la visa depende
          siempre de la embajada de Estados Unidos.
        </div>
      )}

      <div
        className="prose prose-headings:font-display prose-headings:text-marino-500 prose-a:text-terracota-500 mt-8 max-w-none"
        dangerouslySetInnerHTML={{ __html: html }}
      />

      {file.lastUpdated && (
        <p className="mt-10 text-xs text-carbon-800/50">
          Ultima actualizacion: {file.lastUpdated}
        </p>
      )}
    </article>
  );
}
