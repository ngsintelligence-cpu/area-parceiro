import { createClient } from "@/lib/supabase/server";
import ProjetosClient from "./ProjetosClient";

export default async function ParceiroProjetosPage() {
  const supabase = await createClient();

  const { data: projetos } = await supabase
    .from("projects")
    .select("id, client_name, city, state, power_kwp, value, stage")
    .order("created_at", { ascending: false });

  return <ProjetosClient projetos={projetos ?? []} />;
}
