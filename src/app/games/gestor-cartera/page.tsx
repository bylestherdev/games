import type { Metadata } from "next";
import TextGame from "@/components/game/TextGame";
import { gestorCartera } from "@/lib/games/gestor-cartera";

export const metadata: Metadata = { title: gestorCartera.title };

export default function Page() {
  return <TextGame game={gestorCartera} />;
}