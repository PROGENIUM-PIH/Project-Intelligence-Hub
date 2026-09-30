"use client";
import {useState} from "react";
import {Trash2} from "lucide-react";
import {useRouter} from "next/navigation";
import {unlinkMarketInitiative} from "@/lib/actions/market-initiatives";
import {Button} from "@/components/ui/button";
export function RemoveMarketInitiative({linkId,name}:{linkId:string;name:string}){const[busy,setBusy]=useState(false);const router=useRouter();async function remove(){if(!window.confirm(`Remove ${name} from this market?`))return;setBusy(true);try{await unlinkMarketInitiative(linkId);router.refresh()}finally{setBusy(false)}}return <Button type="button" variant="outline" size="icon" disabled={busy} onClick={remove} aria-label={`Remove ${name}`} title="Remove initiative"><Trash2 className="h-4 w-4"/></Button>}