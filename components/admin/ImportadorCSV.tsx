"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ImportadorCSV() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<{ imported: number; errors: string[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleUpload() {
    if (!file) return;
    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/materials/import", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    setResult(data);
    setLoading(false);
    if (data.imported > 0) router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="border border-cedar-200 bg-white p-4 space-y-3">
        <input
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="text-sm text-cedar-700"
        />
        <button
          onClick={handleUpload}
          disabled={!file || loading}
          className="btn-primary py-2 text-sm"
        >
          {loading ? "Importando…" : "Importar archivo"}
        </button>
      </div>

      {result && (
        <div className={`rounded-sm border p-4 text-sm ${
          result.errors.length > 0 ? "border-amber-200 bg-amber-50" : "border-green-200 bg-green-50"
        }`}>
          <p className="font-medium">
            {result.imported} material{result.imported !== 1 ? "es" : ""} importado{result.imported !== 1 ? "s" : ""} como pendientes.
          </p>
          {result.errors.length > 0 && (
            <ul className="mt-2 list-disc pl-5 text-amber-700 space-y-0.5">
              {result.errors.map((e, i) => <li key={i}>{e}</li>)}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
