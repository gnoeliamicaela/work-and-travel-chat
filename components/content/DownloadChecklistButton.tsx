"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import { getOrCreateSessionId } from "@/lib/session";

export default function DownloadChecklistButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  async function handleDownload() {
    setLoading(true);
    setError(false);

    try {
      const sessionId = getOrCreateSessionId();
      const response = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId }),
      });

      if (!response.ok) throw new Error("download failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "checklist-pre-viaje.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Button onClick={handleDownload} disabled={loading}>
        {loading ? "Preparando el PDF..." : "Descargar checklist en PDF"}
      </Button>
      {error && (
        <p className="mt-2 text-sm text-terracota-600">
          No pudimos generar la descarga. Proba de nuevo en unos minutos.
        </p>
      )}
    </div>
  );
}
