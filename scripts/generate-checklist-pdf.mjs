import { mdToPdf } from "md-to-pdf";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const source = path.join(__dirname, "..", "knowledge", "checklist.md");
const destination = path.join(
  __dirname,
  "..",
  "public",
  "downloads",
  "checklist-pre-viaje.pdf"
);

async function run() {
  const pdf = await mdToPdf(
    { path: source },
    {
      dest: destination,
      pdf_options: { format: "A4", margin: "20mm" },
    }
  );

  if (pdf) {
    console.log(`PDF generado en ${destination}`);
  }
}

run().catch((error) => {
  console.error("No se pudo generar el PDF del checklist", error);
  process.exit(1);
});
