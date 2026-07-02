import { createClient } from "@/lib/supabase/server";
import ProjetosClient from "./ProjetosClient";

export default async function AdminProjetosPage() {
  const supabase = await createClient();

  const { data: raw } = await supabase
    .from("projects")
    .select(`
      id, client_name, city, state, power_kwp, value, stage,
      partner:profiles!partner_id(full_name, email)
    `)
    .order("created_at", { ascending: false });

  // Supabase retorna partner como array por inferência; normalizamos para objeto único
  const projetos = (raw ?? []).map((p) => ({
    ...p,
    partner: Array.isArray(p.partner) ? (p.partner[0] ?? null) : p.partner,
  }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <ProjetosClient projetos={projetos as any} />;
}
