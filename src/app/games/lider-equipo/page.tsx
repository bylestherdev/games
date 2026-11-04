import type { Metadata } from "next";
import TextGame from "@/components/game/TextGame";
import { liderEquipo } from "@/lib/games/lider-equipo";

export const metadata: Metadata = { title: liderEquipo.title };

export default function Page() {
  return <TextGame game={liderEquipo} />;
}