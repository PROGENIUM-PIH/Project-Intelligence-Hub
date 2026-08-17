"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ReportPrintButton() {
  return (
    <Button
      onClick={() => window.print()}
      className="bg-[#78FAAE] text-[#0E3A2F] hover:bg-[#63e89a]"
    >
      <Printer className="h-4 w-4" />
      Create PDF
    </Button>
  );
}
