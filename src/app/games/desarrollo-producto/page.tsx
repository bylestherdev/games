import type { Metadata } from "next";
import TextGame from "@/components/game/TextGame";
import { desarrolloProducto } from "@/lib/games/desarrollo-producto";

export const metadata: Metadata = { title: desarrolloProducto.title };

export default function Page() {
  return <TextGame game={desarrolloProducto} />;
}