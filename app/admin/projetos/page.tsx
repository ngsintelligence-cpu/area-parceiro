import { createClient } from "@/lib/supabase/server";
import ProjetosClient from "./ProjetosClient";

export default async function AdminProjetosPage() {
  const supabase = await createClient();

  const [{ data: raw }, { data: parceiros }] = await Promise.all([
    supabase
      .from("projects")
      .select(`id, client_name, city, state, power_kwp, value, stage, partner:profiles!partner_id(full_name, email)`)
      .order("created_at", { ascending: false }),
    supabase
      .from("profiles")
      .select("id, full_name, email")
      .eq("status", "aprovado")
      .neq("role", "admin")
      .order("full_name"),
  ]);

  const projetos = (raw ?? []).map((p) => ({
    ...p,
    partner: Array.isArray(p.partner) ? (p.partner[0] ?? null) : p.partner,
  }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <ProjetosClient projetos={projetos as any} parceiros={parceiros ?? []} />;
}
