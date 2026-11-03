import type { Metadata } from "next";
import LeadGame from "@/components/game/LeadGame";
import { cazadorLeads } from "@/lib/games/cazador-leads";

export const metadata: Metadata = { title: cazadorLeads.title };

export default function Page() {
  return <LeadGame game={cazadorLeads} />;
}
