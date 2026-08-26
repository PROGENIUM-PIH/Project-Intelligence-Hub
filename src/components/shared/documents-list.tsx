"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { FileText, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type DocumentItem = {
  id: string;
  name: string;
  pathname: string;
  size: number;
  createdAt: string | Date;
};

export function DocumentsList({ documents }: { documents: DocumentItem[] }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function deleteDocument(document: DocumentItem) {
    const confirmed = window.confirm(`Delete \"${document.name}\" permanently?`);
    if (!confirmed) return;

    setDeletingId(document.id);
    setError("");
    const response = await fetch("/api/documents", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: document.id }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(data.error ?? "Could not delete document.");
      setDeletingId(null);
      return;
    }

    setDeletingId(null);
    router.refresh();
  }

  return <div className="space-y-3">
    {documents.length === 0 && <p className="text-sm text-muted-foreground">No documents uploaded yet.</p>}
    {documents.map((document) => <div key={document.id} className="flex items-center justify-between gap-3 rounded-lg border p-3">
      <div className="min-w-0">
        <p className="flex items-center gap-2 truncate text-sm font-medium"><FileText className="h-4 w-4" />{document.name}</p>
        <p className="text-xs text-muted-foreground">Uploaded {format(new Date(document.createdAt), "MMM d, yyyy")} · {(document.size / 1024 / 1024).toFixed(2)} MB</p>
      </div>
      <div className="flex items-center gap-2">
        <a className="text-sm font-medium underline" target="_blank" rel="noreferrer" href={`/api/documents/file?pathname=${encodeURIComponent(document.pathname)}`}>Open</a>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => deleteDocument(document)} disabled={deletingId === document.id} aria-label={`Delete ${document.name}`}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>)}
    {error && <p className="text-xs text-destructive">{error}</p>}
  </div>;
}
