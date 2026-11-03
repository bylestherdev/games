import type { Metadata } from "next";
import TextGame from "@/components/game/TextGame";
import { atencionCliente } from "@/lib/games/atencion-cliente";

export const metadata: Metadata = { title: atencionCliente.title };

export default function Page() {
  return <TextGame game={atencionCliente} />;
}
