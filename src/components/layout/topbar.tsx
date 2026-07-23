"use client";

import Link from "next/link";
import { Bell, MessageSquare, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function Topbar() {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b bg-card px-4 md:px-6">
      <div className="flex items-center gap-3">
        <Avatar className="size-8">
          <AvatarFallback className="bg-pink-600 text-white text-xs font-semibold">
            BH
          </AvatarFallback>
        </Avatar>
        <div className="hidden sm:flex items-center gap-3 text-muted-foreground">
          <Bell className="size-4" />
          <MessageSquare className="size-4" />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button render={<Link href="/make-contract" />} size="sm">
          <Plus className="size-4" />
          New Contract
        </Button>
      </div>
    </header>
  );
}
