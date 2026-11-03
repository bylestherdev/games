import type { Metadata } from "next";
import TextGame from "@/components/game/TextGame";
import { negociacion } from "@/lib/games/negociacion";

export const metadata: Metadata = { title: negociacion.title };

export default function Page() {
  return <TextGame game={negociacion} />;
}
