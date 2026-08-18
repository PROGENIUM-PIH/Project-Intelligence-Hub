"use client";

import Image from "next/image";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { SearchBar } from "@/components/shared/search-bar";
import { NavLinks } from "./nav-links";
import { ThemeSwitcher } from "./theme-switcher";
import { useState } from "react";

const NEW_WEB_SKODA_LOGO = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAALwAAAAUCAMAAAAA2KcaAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAzUExURRcYFi9QO2DBiGXQkTVeRXj6rlm0fx0mIClCM2zem3HspDttT0eJYk2YbFSldSM0KUF6WBIFzJkAAAAJcEhZcwAAFxEAABcRAcom8z8AAAKUSURBVEhLxZbrcoQgDIUVxQvr7f2ftuYkIiSh05lOp9+fXQThmIQDXdf1YRi7MdZMd0fBTM+CNJhlpWfpI82HeZuGRD3MOu2L9NQUY5h1OvRcFaIwSZMZ72nGrpu4T0iz9ApW/ILV0/1myfwxomI81GTAGRfjcEqvZR5kzCYPiJlmuSXgN3NJ74MR37vau42eGlbpLXHFx+in6eaSATEVH7jQA9JQFo4qGiu+oZ3TYdmlv6Ax0vtOoohtIe5DbYhYXkz2lHgujtRLM4PaS/s1ZjbsjGjLgWZIMghcB0Y26n6nvgCxRXZe8d9Ri7+gfbWKSKn+JNSq+UyIV2GGepN0cGLFnicb5KFUiy5xQyWey8/ZXGZnEI0FHPF4/VVWEqjr/q6Tft9Y99RKm+SOsXHiebmmeFN6xoD9o+sbCxzSeHHEI661FQoIQKJyQXbyGMgyaAVm1ODZH3T+UnyU/yVsk/BIFpLtsjb4B7WaFh887X8mHnUqRw/ynu1yZj/Q1FWhxbuB/yvxbJPPtoHcd77rCGsJxtYG9K9lg2DnXPN51DzMHH+A+HAC9uPVef234uG08v+FbXIKD9QynpZpipcGDgze/DUYpY0aB8nPrJKeWavEppx07ltHE5arT7pKfFs9YqR2CyJll3LEY1+aHD02mS83jGRoZvvO9Cg9p+bfVMn9y78exPLQuDDZT64HHw5JeWkk+OOpFnmmDEeXi0jjuE1RZw31fABa9D64QZIsqzaC1ybP/QGKYZcqHYKqXC2eS8teozh6GqPopiFeh4NtUqWD3f0usPoe/6Dr2YhnE7E70QtFsEXTEB9MISLF5uPZLk++LNSk4dKjrfiW+nkL5amXhsP3BSM+DZNZVmzSzkD1H8MXa1gmir+F7mcAAAAASUVORK5CYII=";

export function TopNav() {
  const [open, setOpen] = useState(false);
  return <header className="pih-topnav sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-card px-4 lg:px-8">
    <Sheet open={open} onOpenChange={setOpen}><SheetTrigger asChild><Button variant="ghost" size="icon" className="lg:hidden"><Menu className="h-5 w-5"/><span className="sr-only">Open navigation</span></Button></SheetTrigger><SheetContent side="left" className="w-72 border-sidebar-border bg-sidebar p-0 text-sidebar-foreground [&>button]:text-sidebar-foreground"><SheetTitle className="sr-only">Navigation</SheetTitle><div className="flex h-16 items-center px-6"><span className="text-base font-semibold tracking-tight">Project <span className="text-sidebar-primary">Intelligence</span> Hub</span></div><NavLinks onNavigate={()=>setOpen(false)}/></SheetContent></Sheet>
    <Image src="/branding/skoda-logo.jpg" alt="Škoda" width={100} height={11} priority className="pih-brand-logo pih-current-logo hidden shrink-0 sm:block" />
    <img src={NEW_WEB_SKODA_LOGO} alt="Škoda" width={94} height={10} className="pih-new-web-logo hidden shrink-0" />
    <div className="hidden h-6 w-px bg-border sm:block"/><SearchBar placeholder="Search markets, initiatives, tasks..." className="max-w-md flex-1"/>
    <div className="ml-auto flex items-center gap-3"><ThemeSwitcher/><Avatar className="h-8 w-8"><AvatarFallback className="bg-primary text-xs text-primary-foreground">LB</AvatarFallback></Avatar></div>
  </header>;
}
