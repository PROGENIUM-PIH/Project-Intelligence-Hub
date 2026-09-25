"use client";

import { useState } from "react";
import { Mail, Phone, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { updateContact } from "@/lib/actions/contacts";

export type NetworkContactItem = {
  id: string;
  name: string;
  role: string | null;
  email: string | null;
  phone: string | null;
  sources: string[];
};

export function NetworkContacts({ contacts }: { contacts: NetworkContactItem[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<NetworkContactItem | null>(null);
  const [saving, setSaving] = useState(false);

  async function save(formData: FormData) {
    if (!selected) return;
    setSaving(true);
    await updateContact(selected.id, {
      name: String(formData.get("name") ?? ""),
      role: String(formData.get("role") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? ""),
    });
    setSaving(false);
    setSelected(null);
    router.refresh();
  }

  if (!contacts.length) return <p className="text-sm text-muted-foreground">No network contact available.</p>;

  return <>
    <div className="space-y-3">
      {contacts.map((contact) => (
        <button key={contact.id} type="button" onClick={() => setSelected(contact)} className="w-full rounded-lg border p-3 text-left transition-colors hover:bg-muted/40">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium">{contact.name}</p>
              {contact.role ? <p className="text-xs text-muted-foreground">{contact.role}</p> : null}
            </div>
            <Pencil className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          </div>
          <div className="mt-2 flex flex-col gap-1">
            {contact.email ? <span className="flex items-center gap-1.5 text-xs text-[#0E3A2F]"><Mail className="h-3.5 w-3.5"/>{contact.email}</span> : null}
            {contact.phone ? <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><Phone className="h-3.5 w-3.5"/>{contact.phone}</span> : null}
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            {contact.sources.map((source) => <span key={source} className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">{source}</span>)}
          </div>
        </button>
      ))}
    </div>

    <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Edit Network Contact</DialogTitle></DialogHeader>
        {selected ? <form action={save} className="space-y-4">
          <div><label className="mb-1 block text-xs font-medium">Name</label><Input name="name" defaultValue={selected.name} required /></div>
          <div><label className="mb-1 block text-xs font-medium">Role / Function</label><Input name="role" defaultValue={selected.role ?? ""} /></div>
          <div><label className="mb-1 block text-xs font-medium">Email</label><Input name="email" type="email" defaultValue={selected.email ?? ""} /></div>
          <div><label className="mb-1 block text-xs font-medium">Phone</label><Input name="phone" type="tel" defaultValue={selected.phone ?? ""} /></div>
          <p className="text-xs text-muted-foreground">Assigned via: {selected.sources.join(", ")}</p>
          <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setSelected(null)}>Cancel</Button><Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save changes"}</Button></div>
        </form> : null}
      </DialogContent>
    </Dialog>
  </>;
}
