import type { Metadata } from "next";
import TextGame from "@/components/game/TextGame";
import { expansionInternacional } from "@/lib/games/expansion-internacional";

export const metadata: Metadata = { title: expansionInternacional.title };

export default function Page() {
  return <TextGame game={expansionInternacional} />;
}